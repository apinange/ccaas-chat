import React, { ReactNode, useEffect, useState, useRef } from "react";
import styled from "styled-components";
import Tooltip from "@omilia/tooltip";
import { ReactComponent as Omilia } from "../../icons/O.svg";
import { ReactComponent as PencilICon } from "../../icons/PencilICon.svg";
import { ReactComponent as IDIcon } from "../../icons/IDIcon.svg";
import { ReactComponent as AIIcon } from "../../icons/AIIcon.svg";
import { ReactComponent as SafetyIcon } from "../../icons/safety.svg";
import { ReactComponent as SpoofIcon } from "../../icons/SpoofIcon.svg";
import { ReactComponent as FaceDissatisfiedIcon } from "../../icons/FaceDissatisfiedIcon.svg";
import { ReactComponent as FaceNeutralIcon } from "../../icons/FaceNeutralIcon.svg";
import { ReactComponent as FaceSatisfiedIcon } from "../../icons/FaceSatisfiedIcon.svg";

import { colors } from "@omilia/theme";
import {
  getColorByRiskLevel,
  SButtonContainer,
  SIconContainer,
  SIconContainerWithBackgroundColor,
  SMainCircleButton,
  SMainExpandedMenu,
  SWhiteLine,
} from "./styled";
import { toast } from "react-toastify";
import ToastBox from "./components/ToastBox";
import UserInfoButton from "./components/UserInfoButton";
import { SentimentTypes, SocketValueType } from "../../types";
import useUrlQuery from "../../utils/hooks/useUrlQuery";
import SummaryComponent from "./components/SummaryComponent";
import { getSentimentColor } from "../../utils/helpers";
import ChatComponent from "../ChatComponent";
import CircleGauge from "../CircleGauge";
import NotesComponent from "./components/NotesComponent";
import LiveSoundWave from "../LiveSoundWave/LiveSoundWave";
import UserInfoComponent from "./components/UserInfoComponent";
import AISuggestionsComponent from "./components/AISuggestionsComponent";
import { useTranslation } from "react-i18next";
import { analyzeEscalation, summarizeConversation, checkHasEscalation, getConversationData, updateAnalysis } from "../../services/agentAssistService";
import { useWebSocket } from "../../utils/hooks/useWebSocket";

export const thresholdsArray = ["0.15", "0.35", "0.45", "0.53", "0.85"];

// Função auxiliar para formatar valores monetários em R$
const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

// Função auxiliar para formatar percentuais
const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value) + '%';
};

// Função auxiliar para formatar números com separador de milhar (sem decimais)
const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
};

// Função para formatar crm_data com valores monetários e percentuais
const formatCrmData = (crmData: any[]): any[] => {
  if (!crmData || !Array.isArray(crmData)) return crmData;
  
  return crmData.map(item => {
    const key = item.key?.toLowerCase() || '';
    let formattedValue = item.value;
    
    // Se o valor for numérico, formatar de acordo com a chave
    if (typeof item.value === 'number') {
      if (key.includes('meta mensal') || key.includes('vendas') || key.includes('comissão total') || key.includes('comissao total')) {
        formattedValue = formatCurrency(item.value);
      } else if (key.includes('percentual') || key.includes('comissão percentual') || key.includes('comissao percentual')) {
        formattedValue = formatPercentage(item.value);
      } else if (key.includes('pontos') || key.includes('fidelidade')) {
        formattedValue = formatNumber(item.value);
      }
    }
    // Se o valor for string mas contém números, tentar formatar
    else if (typeof item.value === 'string') {
      // Remover pontos e vírgulas para converter para número
      const cleanValue = item.value.replace(/\./g, '').replace(',', '.');
      const numValue = parseFloat(cleanValue);
      if (!isNaN(numValue)) {
        if (key.includes('meta mensal') || key.includes('vendas') || key.includes('comissão total') || key.includes('comissao total')) {
          formattedValue = formatCurrency(numValue);
        } else if (key.includes('percentual') || key.includes('comissão percentual') || key.includes('comissao percentual')) {
          formattedValue = formatPercentage(numValue);
        } else if (key.includes('pontos') || key.includes('fidelidade')) {
          formattedValue = formatNumber(numValue);
        }
      }
    }
    
    return { ...item, value: formattedValue };
  });
};

// Styled component para wrapper de ícone de sentimento com cor
const SentimentIconWrapper = styled.div<{ iconColor: string; iconSize: number }>`
  display: inline-block;
  width: ${props => props.iconSize}px;
  height: ${props => props.iconSize}px;
  
  svg {
    width: 100%;
    height: 100%;
    
    path {
      fill: ${props => props.iconColor} !important;
    }
  }
`;

const AgentAssistant = () => {
  const { t } = useTranslation();
  let query = useUrlQuery();
  let conversationId = query.get("conversation_id");
  // Get token from URL (conversation_id is passed as token)
  let token = query.get("token") || conversationId;
  
  // Use WebSocket with token (conversation_id) for real-time updates
  const [isReady, socketValueFromWS, ws] = useWebSocket(token);
  const [socketValue, setSocketValue] = useState<SocketValueType | null>(null);
  
  // Sync socketValueFromWS to socketValue for compatibility
  useEffect(() => {
    if (socketValueFromWS) {
      console.log('[AgentAssistant] WebSocket data received, updating socketValue');
      setSocketValue(socketValueFromWS);
    }
  }, [socketValueFromWS]);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [localState, setLocalState] = useState<SocketValueType>({
    bio_info: undefined,
    call_info: undefined,
    dialog_info: undefined,
    error: "",
    session_info: undefined,
    voice_info: undefined,
    ai_info: undefined,
    call_summary: undefined,
    user_info: undefined,
    bio_enroll_update_message: undefined,
    notes: undefined,
  });
  
  // Load escalation analysis
  const loadEscalationAnalysis = async (convId: string) => {
    try {
      const response = await analyzeEscalation(convId);
      if (response.status === 'success') {
        const newData: SocketValueType = {
          ...localState,
          ai_info: {
            ...localState.ai_info,
            agent_suggested_prompt: response.data.suggestion,
            explanation: response.data.explanation
          },
          features: {
            ...localState.features,
            suggestions: true,
            notes: true,
            summary: true,
            transcription: true,
            voiceBiometrics: false,
            blacklisting: false
          },
          suggestion: {
            suggestion: response.data.suggestion,
            htmlString: `<p>${response.data.suggestion}</p>`
          }
        };
        setSocketValue(newData);
        setLocalState(newData);
        console.log('[AgentAssistant] Analysis loaded:', newData);
      }
    } catch (error) {
      console.error('[AgentAssistant] Error loading analysis:', error);
    }
  };
  
  // Load conversation summary
  const loadConversationSummary = async (convId: string) => {
    try {
      const response = await summarizeConversation(convId);
      if (response.status === 'success') {
        const newData: SocketValueType = {
          ...localState,
          call_summary: {
            summary: response.data.summary,
            timestamp: Date.now(),
            topic: 'Resumo da Conversa',
            type: 'summary'
          }
        };
        setSocketValue(newData);
        setLocalState(newData);
        console.log('[AgentAssistant] Summary loaded:', newData);
      }
    } catch (error) {
      console.error('[AgentAssistant] Error loading summary:', error);
    }
  };
  
  // Listen for postMessage from parent window to load analysis/summary
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      if (event.data && event.data.type === 'AGENT_ASSIST_CONVERSATION_ID') {
        const { conversationId: receivedId, hasEscalation: hasEsc } = event.data;
        console.log('[AgentAssistant] Received conversation_id from parent:', receivedId, 'hasEscalation:', hasEsc);
        
        if (receivedId && hasEsc) {
          await loadEscalationAnalysis(receivedId);
        }
      } else if (event.data && event.data.type === 'LOAD_SUMMARY') {
        const { conversationId: receivedId } = event.data;
        if (receivedId) {
          await loadConversationSummary(receivedId);
        }
      } else if (event.data && event.data.type === 'UPDATE_ANALYSIS') {
        const { conversationId: receivedId, data: analysisData } = event.data;
        console.log('[AgentAssistant] Received UPDATE_ANALYSIS from parent:', receivedId, analysisData);
        
        if (receivedId && analysisData) {
          // Update local state with new analysis data using functional update
          setLocalState((prevState) => {
            const newData: SocketValueType = {
              ...prevState,
              ai_info: {
                ...prevState.ai_info,
                user_sentiment: analysisData.userSentiment ? {
                  label: analysisData.userSentiment.label,
                  score: analysisData.userSentiment.score
                } : undefined,
                explanation: analysisData.reasoning,
                agent_suggested_prompt: analysisData.suggestion
              },
              user_sound: analysisData.userSentiment?.score,
              suggestion: {
                suggestion: analysisData.suggestion || '',
                reasoning: analysisData.reasoning || '',
                htmlString: analysisData.reasoning 
                  ? `<div><p><strong>Contexto:</strong> ${analysisData.reasoning}</p><p><strong>Ação:</strong> ${analysisData.suggestion}</p></div>`
                  : `<p>${analysisData.suggestion}</p>`
              },
              call_summary: analysisData.summary ? {
                summary: analysisData.summary,
                timestamp: Date.now(),
                topic: 'Resumo da Conversa',
                type: 'summary'
              } : undefined
            };
            setSocketValue(newData);
            console.log('[AgentAssistant] Analysis updated from parent:', newData);
            return newData;
          });
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);
  
  // Sync WebSocket data with local state - this will be handled by the main useEffect below

  // Expose function to parent window for summary button
  useEffect(() => {
    if (conversationId) {
      // @ts-ignore
      window.loadConversationSummary = () => loadConversationSummary(conversationId);
    }
  }, [conversationId]);
  
  // Load complete analysis
  const loadUpdateAnalysis = async (convId: string) => {
    try {
      const response = await updateAnalysis(convId);
      if (response.status === 'success') {
        const data = response.data;
        const newData: SocketValueType = {
          ...localState,
          ai_info: {
            ...localState.ai_info,
            user_sentiment: data.userSentiment ? {
              label: data.userSentiment.label,
              score: data.userSentiment.score
            } : undefined,
            explanation: data.reasoning,
            agent_suggested_prompt: data.suggestion
          },
          user_sound: data.userSentiment?.score,
          suggestion: {
            suggestion: data.suggestion || '',
            reasoning: data.reasoning || '',
            htmlString: data.reasoning 
              ? `<div><p><strong>Contexto:</strong> ${data.reasoning}</p><p><strong>Ação:</strong> ${data.suggestion}</p></div>`
              : `<p>${data.suggestion}</p>`
          },
          call_summary: data.summary ? {
            summary: data.summary,
            timestamp: Date.now(),
            topic: 'Resumo da Conversa',
            type: 'summary'
          } : undefined
        };
        setSocketValue(newData);
        setLocalState(newData);
        console.log('[AgentAssistant] Complete analysis loaded:', newData);
      }
    } catch (error) {
      console.error('[AgentAssistant] Error loading complete analysis:', error);
    }
  };

  // Initialize: Load all conversation data
  useEffect(() => {
    if (!conversationId) return;
    
    const initialize = async () => {
      try {
        // Load all conversation data (CRM, user info, etc.)
        const conversationDataResponse = await getConversationData(conversationId);
        console.log('[AgentAssistant] Conversation data loaded:', conversationDataResponse);
        
        if (conversationDataResponse.status === 'success') {
          const data = conversationDataResponse.data;
          
          // Set all the data in localState
          const newData: SocketValueType = {
            ...localState,
            crm_data: data.crm_data,
            session_info: data.session_info,
            user_info: data.user_info,
            dialog_info: data.dialog_info,
            features: data.features,
            fraud_info: data.fraud_info,
            notes: data.notes,
            user_sound: 0.75 // Default
          };
          
          setSocketValue(newData);
          setLocalState(newData);
          console.log('[AgentAssistant] Conversation data set:', newData);
          
          // Load complete analysis (will get from cache or generate new)
          await loadUpdateAnalysis(conversationId);
          
          // Check for escalation and load analysis if needed
          if (data.has_escalation) {
            await loadEscalationAnalysis(conversationId);
          }
        }
      } catch (error) {
        console.error('[AgentAssistant] Error initializing:', error);
      }
    };
    
    initialize();
  }, [conversationId]);
  
  // Mock payload para quando não houver token
  const mockPayload: SocketValueType = {
    session_info: {
      call_id: "12345",
      ani: "+5511999999999"
    },
    bio_info: {
      status: "enrolled",
      bio_result: {
        result_type: "verification",
        bio_user_id: "user123",
        bio_result: "TRUE_HIGH",
        bio_score: 0.95,
        speech_millis: 3000
      },
      user_cnt: 1
    },
    dialog_info: {
      utt_list: [
        {
          leg: "AGENT",
          utt: "Olá, como posso ajudar você hoje?",
          is_final: true,
          confidence: 1.0,
          words: [] as any
        },
        {
          leg: "USER",
          utt: "Preciso verificar meu saldo",
          is_final: true,
          confidence: 0.92,
          words: [] as any
        },
        {
          leg: "AGENT",
          utt: "Claro, vou verificar isso para você",
          is_final: true,
          confidence: 1.0,
          words: [] as any
        }
      ] as any,
      real_time_agent: {
        leg: "AGENT",
        utt: "Aguarde um momento enquanto verifico...",
        is_final: false,
        words: [] as any
      },
      real_time_user: {
        leg: "USER",
        utt: "Obrigado",
        is_final: false,
        words: [] as any
      }
    },
    ai_info: {
      user_sentiment: "positive",
      user_emotions: "calm",
      user_anger_detected: false,
      user_intents: "check_balance",
      agent_sentiment: "neutral",
      agent_tasks: "verify_account",
      agent_next_task: "provide_balance",
      agent_suggested_prompt: "Você pode verificar o saldo informando seu CPF?"
    },
    user_info: {
      address: "São Paulo, SP",
      age: {
        value: "35-45",
        status: "MATCH_HIGH",
        description: "Idade estimada corresponde ao perfil"
      },
      gender: {
        value: "M",
        status: "MATCH_HIGH",
        description: "Gênero corresponde ao perfil"
      },
      name: "João Silva",
      user_id: "user123",
      trustLevel: 0.85,
      validAni: true
    },
    voice_info: {
      liveness_score: {
        label: "LIVE",
        global_post: 0.92
      },
      sat_result: {
        label: "VALID",
        valid: true,
        gender_label: "M",
        gender_prob: 0.88,
        age_estimate: 40,
        age_label: "35-45"
      }
    },
    crm_data: formatCrmData([
      { key: "Pontos de fidelidade", value: 15300 },
      { key: "Meta mensal", value: 5000.00 },
      { key: "Vendas mês atual", value: 3420.50 },
      { key: "Percentual atingido", value: 68.41 },
      { key: "Comissão percentual", value: 25.0 },
      { key: "Comissão total", value: 855.13 }
    ]),
    features: {
      voiceBiometrics: true,
      blacklisting: false,
      transcription: true,
      suggestions: true,
      summary: true,
      notes: true
    },
    fraud_info: {
      description: "Baixo risco de fraude",
      label: "SAFE"
    },
    user_sound: 0.75,
    suggestion: {
      suggestion: "Sugestão: Verifique também o histórico de transações recentes",
      htmlString: "<p>Sugestão: Verifique também o histórico de transações recentes</p>"
    },
    notes: [
      { key: "Observação 1", value: "Cliente preferencial" },
      { key: "Observação 2", value: "Atendimento prioritário" }
    ],
    call_summary: {
      duration: 180,
      summary: "Cliente solicitou verificação de saldo. Atendimento realizado com sucesso.",
      timestamp: Date.now(),
      topic: "Consulta de saldo",
      type: "information"
    },
    error: "",
    blocklist_result: undefined,
    call_info: undefined,
    bio_enroll_update_message: undefined
  };

  // Initialize localState - no longer using token, using conversation_id instead
  // localState is now initialized in the component state above

  let agentSentiment =
    localState.ai_info && localState.ai_info.agent_sentiment;
  let userSentiment =
    localState.ai_info && localState.ai_info.user_sentiment;

  // Função para retornar o ícone de sentimento correto com cor
  const getSentimentIcon = (sentiment: SentimentTypes | undefined) => {
    const color = getSentimentColor(sentiment as SentimentTypes);
    const iconSize = 32;
    
    switch (sentiment) {
      case "negative":
        return (
          <SentimentIconWrapper iconColor={color} iconSize={iconSize}>
            <FaceDissatisfiedIcon />
          </SentimentIconWrapper>
        );
      case "positive":
        return (
          <SentimentIconWrapper iconColor={color} iconSize={iconSize}>
            <FaceSatisfiedIcon />
          </SentimentIconWrapper>
        );
      case "neutral":
      default:
        return (
          <SentimentIconWrapper iconColor={color} iconSize={iconSize}>
            <FaceNeutralIcon />
          </SentimentIconWrapper>
        );
    }
  };

  useEffect(() => {
    // notifyForError("Sorry", socketValue.error);
    console.group("SOCKET VALUE");
    console.log("Socket value", socketValue);

    socketValue &&
      socketValue.error &&
      toast.error(socketValue.error, {
        style: {
          color: "black",
          borderRadius: "10px",
          backgroundColor: colors.COLOR_RED_300,
        },
        autoClose: 3000,
        containerId: "secondary",
        toastId: "errorMsg",
      });

    socketValue &&
      socketValue.bio_enroll_update_message &&
      // showToast("Summary",<div>{socketValue.bio_enroll_update_message}</div>,"main", "enrollInfo")
      toast(socketValue.bio_enroll_update_message, {
        style: {
          color: "white",
          borderRadius: "10px",
          backgroundColor: colors.COLOR_OMILIA_BLUE_100,
          margin: "10px",
        },
        autoClose: 3000,
        containerId: "main",
        toastId: "enrollInfo",
      });

    if (socketValue && socketValue.suggestion) {
      showToast(
        t('toasts.aiSuggestion', 'SUGESTÃO'),
        <AISuggestionsComponent suggestionObj={socketValue.suggestion} />,
        "main",
        "aiSuggestionsToastID"
      );
    }
    // Live Transcription não abre automaticamente - removido

    if (socketValue && socketValue.notes) {
      updateToast(
        t('toasts.notes', 'NOTAS'),
        <NotesComponent notes={socketValue && socketValue.notes} />,
        "main",
        "notesToast"
      );
    }

    if (socketValue && socketValue.suggestion) {
      updateToast(
        t('toasts.aiSuggestion', 'SUGESTÃO'),
        <AISuggestionsComponent suggestionObj={socketValue.suggestion} />,
        "main",
        "aiSuggestionsToastID"
      );
    }

    // Live Transcription não atualiza automaticamente - removido

    if (socketValue && socketValue.crm_data) {
      showToast(
        t('toasts.userInfo', 'INFOS GERAIS'),
        <UserInfoComponent crmData={formatCrmData(socketValue.crm_data)} />,
        "main",
        "userInfoToast"
      );
    }

    // Identification component removed - never shown

    if (socketValue && socketValue.notes && socketValue.notes.length) {
      showToast(
        t('toasts.notes', 'NOTAS'),
        <NotesComponent notes={socketValue && socketValue.notes} />,
        "main",
        "notesToast"
      );
    }

    // Always show summary when it arrives via WebSocket (even if toasts were already opened)
    if (socketValue && socketValue.call_summary) {
      console.log('[AgentAssistant] Call summary received via WebSocket:', socketValue.call_summary);
      console.log('[AgentAssistant] Summary content:', socketValue.call_summary.summary);
      // Use showToast which will replace existing toast with same ID
      showToast(
        t('toasts.summary', 'RESUMO'),
        <SummaryComponent
          title={socketValue.call_summary.topic || 'Resumo da Conversa'}
          summary={socketValue.call_summary.summary}
        />,
        "main",
        "summaryToast"
      );
    }

    if (socketValue) {
      // Merge all data properly
      const mergedAiInfo = socketValue.ai_info 
        ? { ...localState.ai_info, ...socketValue.ai_info }
        : localState.ai_info;
      const mergedFeatures = socketValue.features 
        ? { ...localState.features, ...socketValue.features }
        : localState.features;
      
      // Merge everything, preserving existing data
      // IMPORTANT: dialog_info must be replaced completely when it arrives (not merged)
      const mergedState: SocketValueType = {
        ...localState,
        ...socketValue,
        ai_info: mergedAiInfo,
        features: mergedFeatures,
        // Preserve existing data if new data doesn't have it
        crm_data: socketValue.crm_data !== undefined ? socketValue.crm_data : localState.crm_data,
        session_info: socketValue.session_info !== undefined ? socketValue.session_info : localState.session_info,
        user_info: socketValue.user_info !== undefined ? socketValue.user_info : localState.user_info,
        // dialog_info must be replaced completely when it arrives (for real-time message updates)
        dialog_info: socketValue.dialog_info !== undefined ? socketValue.dialog_info : localState.dialog_info,
        fraud_info: socketValue.fraud_info !== undefined ? socketValue.fraud_info : localState.fraud_info,
        notes: socketValue.notes !== undefined ? socketValue.notes : localState.notes,
        call_summary: socketValue.call_summary !== undefined ? socketValue.call_summary : localState.call_summary,
        suggestion: socketValue.suggestion !== undefined ? socketValue.suggestion : localState.suggestion
      };
      
      console.log("[AgentAssistant] Merged state:", mergedState);
      console.log("[AgentAssistant] dialog_info updated:", mergedState.dialog_info?.utt_list?.length, "messages");
      setLocalState(mergedState);
    }
    console.groupEnd();
  }, [socketValue]);

  function sendMessageToSocket(message: string) {
    // Not used anymore - kept for compatibility
    console.log("sendMessageToSocket called (not implemented):", message);
  }

  function onClickTranscription() {
    if (localState.call_summary) {
      showToast(
        t('toasts.summary', 'RESUMO'),
        <SummaryComponent
          title={localState.call_summary.topic}
          summary={localState.call_summary.summary}
        />,
        "main",
        "summaryToast"
      );
    }

    showToast(
      t('toasts.liveTranscription', 'TRANSCRIÇÃO AO VIVO'),
      <ChatComponent
        utt_list={
          localState.dialog_info &&
          localState.dialog_info.utt_list
        }
        real_time_agent={
          localState.dialog_info &&
          localState.dialog_info.real_time_agent
        }
        real_time_user={
          localState.dialog_info &&
          localState.dialog_info.real_time_user
        }
      />,
      "main",
      "currentConversationToast"
    );
  }

  const showToast = (
    category: string,
    children: ReactNode,
    containerId: string,
    toastId?: string
  ) => {
    console.log("Toast id", toastId);
    // react-toastify automatically replaces toasts with the same toastId
    toast(<ToastBox category={category} children={children} />, {
      containerId,
      toastId,
    });
  };

  const updateToast = (
    category: string,
    children: ReactNode,
    containerId: string,
    toastId: string
  ) => {
    console.log("toast id", toastId);
    toast.update(toastId, {
      render: () => <ToastBox category={category} children={children} />,
      containerId,
    });
  };

  // Ref para controlar se os toasts já foram abertos automaticamente
  const toastsOpenedRef = useRef(false);

  // Abrir toasts automaticamente quando houver dados (apenas uma vez)
  useEffect(() => {
    if (toastsOpenedRef.current) return;

    const hasData = 
      (localState.crm_data && localState.crm_data.length > 0) ||
      localState.call_summary ||
      (localState.notes && localState.notes.length > 0) ||
      localState.suggestion;

    if (hasData) {
      // User Info
      if (localState.crm_data && localState.crm_data.length > 0) {
        showToast(
          t('toasts.userInfo', 'INFOS GERAIS'),
          <UserInfoComponent crmData={formatCrmData(localState.crm_data)} />,
          "main",
          "userInfoToast"
        );
      }

      // Summary
      if (localState.call_summary) {
        console.log('[AgentAssistant] Showing summary toast from localState:', localState.call_summary);
        showToast(
          t('toasts.summary', 'RESUMO'),
          <SummaryComponent
            title={localState.call_summary.topic || 'Resumo da Conversa'}
            summary={localState.call_summary.summary}
          />,
          "main",
          "summaryToast"
        );
      }

      // Notes
      if (localState.notes && localState.notes.length > 0) {
        showToast(
          t('toasts.notes', 'NOTAS'),
          <NotesComponent notes={localState.notes} />,
          "main",
          "notesToast"
        );
      }

      // AI Suggestion
      if (localState.suggestion) {
        showToast(
          t('toasts.aiSuggestion', 'SUGESTÃO'),
          <AISuggestionsComponent suggestionObj={localState.suggestion} />,
          "main",
          "aiSuggestionsToastID"
        );
      }

      toastsOpenedRef.current = true;
    }
  }, [localState.crm_data, localState.call_summary, localState.notes, localState.suggestion]);

  return (
    <>
        <SButtonContainer>
          {!isExpanded ? (
            <Tooltip content={t('tooltips.agentAssistant', 'Agent Assistant')}>
              <SMainCircleButton
                data-test="main-assist-button"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <Omilia
                  style={{ backgroundColor: colors.COLOR_OMILIA_BLUE_700 }}
                  width={24}
                  height={24}
                />

                {/*<BotCircleIcon color={colors.COLOR_BLACK} size="48" />*/}
              </SMainCircleButton>
            </Tooltip>
          ) : (
            <SMainExpandedMenu>
              <UserInfoButton
                userInfo={localState.user_info}
                voiceInfo={localState.voice_info}
                bioResults={
                  localState.bio_info &&
                  localState.bio_info.bio_result
                }
                blocklistResult={localState.blocklist_result}
                fraudInfo={localState.fraud_info}
                sessionInfo={localState.session_info}
                enrollStatus={localState.bio_info?.status}
                showToast={showToast}
                updateToast={updateToast}
                sendToSocket={sendMessageToSocket}
              />

              {/*{localState.fraud_info?.label && (*/}
              <Tooltip
                content={
                  localState && localState.fraud_info
                    ? localState.fraud_info.description
                    : t('tooltips.riskLevel', 'Nível de Risco')
                }
              >
                <SIconContainerWithBackgroundColor
                  backgroundColor={getColorByRiskLevel(
                    localState && localState.fraud_info?.label
                  )}
                >
                  {localState &&
                  localState.fraud_info &&
                  localState.fraud_info.label === "FRAUD" ? (
                    <SpoofIcon color="white" width={20} height={20} />
                  ) : (
                    <SafetyIcon color="white" width={20} height={20} />
                  )}
                </SIconContainerWithBackgroundColor>
              </Tooltip>
              {/*)}*/}

              {/* CircleGauge hidden - percentage display not needed */}
              {/* <Tooltip
                content={
                  localState.bio_info &&
                  localState.bio_info.bio_result &&
                  localState.bio_info.bio_result.bio_result
                    ? localState.bio_info.bio_result.bio_result
                    : "Live Verification"
                }
              >
                <SIconContainer>
                  <CircleGauge
                    score={
                      localState.bio_info && localState.bio_info.bio_result
                        ? localState.bio_info.bio_result.bio_score
                        : 0
                    }
                    result={
                      localState.bio_info && localState.bio_info.bio_result
                        ? localState.bio_info.bio_result.bio_result
                        : "NO_DATA"
                    }
                    thresholdsArray={thresholdsArray}
                  />
                </SIconContainer>
              </Tooltip> */}
              <Tooltip content={t('tooltips.userInfo', 'Infos Gerais')}>
                <SIconContainer
                  onClick={() => {
                      localState.crm_data &&
                      localState.crm_data.length &&
                      showToast(
                        t('toasts.userInfo', 'INFOS GERAIS'),
                        <UserInfoComponent crmData={formatCrmData(localState.crm_data)} />,
                        "main",
                        "userInfoToast"
                      );
                  }}
                >
                  <IDIcon width={20} height={20} />
                </SIconContainer>
              </Tooltip>
              <SWhiteLine />

              {/*{socketValue &&*/}
              {/*    localState.bio_info &&*/}
              {/*    localState.bio_info.bio_result && (*/}
              {/*        <Tooltip*/}
              {/*            content={*/}
              {/*                localState.bio_info.bio_result.bio_result*/}
              {/*                    ? localState.bio_info.bio_result.bio_result*/}
              {/*                    : "Live Verification"*/}
              {/*            }*/}
              {/*        >*/}
              {/*            <SIconContainer>*/}
              {/*                <CircleGauge*/}
              {/*                    score={localState.bio_info.bio_result.bio_score}*/}
              {/*                    result={localState.bio_info.bio_result.bio_result}*/}
              {/*                    thresholdsArray={thresholdsArray}*/}
              {/*                />*/}
              {/*            </SIconContainer>*/}
              {/*        </Tooltip>*/}
              {/*    )}*/}

                  <Tooltip content={t('tooltips.userSentiment', 'Sentimento do Usuário')}>
                <SIconContainer>
                  {getSentimentIcon(userSentiment as SentimentTypes)}
                </SIconContainer>
              </Tooltip>
              {/* LiveSoundWave hidden - not needed in chat context */}
              {/* <LiveSoundWave
                onClickTranscription={onClickTranscription}
                soundVolume={localState.user_sound ? localState.user_sound : 0}
              /> */}

              {/*<SDoubleIconContainer>*/}
              {/*  <SSmallIconContainer>*/}
              {/*<Tooltip*/}
              {/*  content={*/}
              {/*    localState.ai_info && localState.ai_info.user_sentiment*/}
              {/*      ? `Customer Sentiment / ${localState.ai_info.user_sentiment}`*/}
              {/*      : "Customer Sentiment"*/}
              {/*  }*/}
              {/*>*/}
              {/*<FaceIcon*/}
              {/*  style={{*/}
              {/*    color: getSentimentColor(userSentiment as SentimentTypes),*/}
              {/*  }}*/}
              {/*  width={15}*/}
              {/*  height={15}*/}
              {/*/>*/}
              {/*</Tooltip>*/}
              {/*</SSmallIconContainer>*/}

              {/*  <LiveSoundWave*/}
              {/*    onClickTranscription={onClickTranscription}*/}
              {/*    soundVolume={0}*/}
              {/*  />*/}
              {/*</SDoubleIconContainer>*/}

              <SWhiteLine />
              {localState.features?.suggestions && (
                <Tooltip content={t('tooltips.aiSuggestions', 'Sugestões de IA')}>
                  <SIconContainer
                    onClick={() => {
                        localState.suggestion &&
                        showToast(
                          t('toasts.aiSuggestion', 'SUGESTÃO'),
                          <AISuggestionsComponent
                            suggestionObj={localState.suggestion}
                          />,
                          "main",
                          "aiSuggestionsToastID"
                        );
                    }}
                  >
                    <AIIcon width={20} height={20} />
                  </SIconContainer>
                </Tooltip>
              )}
              {localState.features?.notes && (
                <Tooltip content={t('tooltips.notes', 'Notas')}>
                  <SIconContainer
                    onClick={() => {
                        localState.notes &&
                        localState.notes.length &&
                        showToast(
                          t('toasts.notes', 'NOTAS'),
                          <NotesComponent
                            notes={localState.notes}
                          />,
                          "main",
                          "notesToast"
                        );
                    }}
                  >
                    <PencilICon
                      style={{ color: colors.COLOR_WHITE }}
                      width={20}
                      height={20}
                    />
                  </SIconContainer>
                </Tooltip>
              )}

              {/*{socketValue &&*/}
              {/*  localState.dialog_info &&*/}
              {/*  !!localState.dialog_info?.utt_list.length && (*/}
              {/*    <Tooltip content="Current Conversation">*/}
              {/*      <SIconContainer>*/}
              {/*        <ChatBubbleLeftEllipsis*/}
              {/*          onClick={onClickTranscription}*/}
              {/*          style={{ color: colors.COLOR_WHITE }}*/}
              {/*          width={20}*/}
              {/*          height={20}*/}
              {/*        />*/}
              {/*      </SIconContainer>*/}
              {/*    </Tooltip>*/}
              {/*  )}*/}

              {/*<SWhiteLine />*/}

              {/*<SIconContainer*/}
              {/*  onClick={() => {*/}
              {/*    socketValue &&*/}
              {/*      localState.notes &&*/}
              {/*      localState.notes.length &&*/}
              {/*      showToast(*/}
              {/*        "Notes",*/}
              {/*        <NotesComponent*/}
              {/*          notes={socketValue && localState.notes}*/}
              {/*        />,*/}
              {/*        "main",*/}
              {/*        "notesToast"*/}
              {/*      );*/}
              {/*  }}*/}
              {/*>*/}
              {/*  <NotebookIcon*/}
              {/*    style={{ color: colors.COLOR_WHITE }}*/}
              {/*    width={20}*/}
              {/*    height={20}*/}
              {/*  />*/}
              {/*</SIconContainer>*/}

              <SIconContainer>
                <Omilia
                  style={{ backgroundColor: colors.COLOR_OMILIA_BLUE_700 }}
                  onClick={() => setIsExpanded(!isExpanded)}
                  width={20}
                  height={20}
                />
              </SIconContainer>
            </SMainExpandedMenu>
          )}
        </SButtonContainer>
    </>
  );
};

export default AgentAssistant;
