import React, { useEffect, useRef, useState } from "react";
import { SCenterBox, SLeftBox, SMainContainer, SRightBox } from "./styled";
import LeftComponent from "./components/LeftComponent";
import useUrlQuery from "../../utils/hooks/useUrlQuery";
import { notifyForError } from "../../utils/toastNotifications";
import CentralComponent from "./components/CentralComponent";
import RightComponent from "./components/RightComponent";
import { SocketValueType } from "../../types";
import Preloader from "@omilia/preloader";
import { analyzeEscalation, summarizeConversation, getConversationMessages, checkHasEscalation, getConversationData, updateAnalysis } from "../../services/agentAssistService";

const Main = () => {
  let query = useUrlQuery();
  let conversationId = query.get("conversation_id");
  
  const [isReady, setIsReady] = useState(false);
  const [socketValue, setSocketValue] = useState<SocketValueType | null>(null);
  const ws = useRef(null);
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
    bio_enroll_update_message:undefined,
    notes:undefined,
  });

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
        console.log('[Main] Complete analysis loaded:', newData);
      }
    } catch (error) {
      console.error('[Main] Error loading complete analysis:', error);
    }
  };

  // Listen for postMessage from parent window
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'AGENT_ASSIST_CONVERSATION_ID') {
        const { conversationId: receivedId, hasEscalation } = event.data;
        console.log('[Main] Received conversation_id from parent:', receivedId, 'hasEscalation:', hasEscalation);
        
        if (receivedId && hasEscalation) {
          // Load analysis automatically when escalation is detected
          loadEscalationAnalysis(receivedId);
        }
      } else if (event.data && event.data.type === 'UPDATE_ANALYSIS') {
        const { conversationId: receivedId, data: analysisData } = event.data;
        console.log('[Main] Received UPDATE_ANALYSIS from parent:', receivedId, analysisData);
        
        if (receivedId && analysisData) {
          const newData: SocketValueType = {
            ...localState,
            ai_info: {
              ...localState.ai_info,
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
          setLocalState(newData);
          console.log('[Main] Analysis updated from parent:', newData);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

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
        console.log('[Main] Analysis loaded:', newData);
      }
    } catch (error) {
      console.error('[Main] Error loading analysis:', error);
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
        console.log('[Main] Summary loaded:', newData);
      }
    } catch (error) {
      console.error('[Main] Error loading summary:', error);
    }
  };

  // Initialize: Load all conversation data
  useEffect(() => {
    if (!conversationId) {
      setIsReady(true);
      return;
    }

    const initialize = async () => {
      try {
        setIsReady(false);
        
        // Load all conversation data (CRM, user info, etc.)
        const conversationDataResponse = await getConversationData(conversationId);
        console.log('[Main] Conversation data loaded:', conversationDataResponse);
        
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
          console.log('[Main] Conversation data set:', newData);
          
          // Check for escalation and load analysis if needed
          if (data.has_escalation) {
            await loadEscalationAnalysis(conversationId);
          }
        }
        
        setIsReady(true);
      } catch (error) {
        console.error('[Main] Error initializing:', error);
        setIsReady(true); // Set ready even on error to show UI
      }
    };

    initialize();
  }, [conversationId]);

  useEffect(() => {
    socketValue &&
      socketValue.error &&
      notifyForError("Sorry", socketValue.error);
    console.group("SOCKET VALUE");
    console.log("Socket value", socketValue);

    if (socketValue) {
      // Merge all data properly
      const mergedAiInfo = socketValue.ai_info 
        ? { ...localState.ai_info, ...socketValue.ai_info }
        : localState.ai_info;
      const mergedFeatures = socketValue.features 
        ? { ...localState.features, ...socketValue.features }
        : localState.features;
      
      // Merge everything, preserving existing data
      const mergedState: SocketValueType = {
        ...localState,
        ...socketValue,
        ai_info: mergedAiInfo,
        features: mergedFeatures,
        // Preserve existing data if new data doesn't have it
        crm_data: socketValue.crm_data || localState.crm_data,
        session_info: socketValue.session_info || localState.session_info,
        user_info: socketValue.user_info || localState.user_info,
        dialog_info: socketValue.dialog_info || localState.dialog_info,
        fraud_info: socketValue.fraud_info || localState.fraud_info,
        notes: socketValue.notes || localState.notes,
        call_summary: socketValue.call_summary || localState.call_summary,
        suggestion: socketValue.suggestion || localState.suggestion
      };
      
      console.log("Merged state:", mergedState);
      setLocalState(mergedState);
    }
    console.groupEnd();
  }, [socketValue]);

  function sendMessageToSocket(message: string) {
    // Not used anymore - kept for compatibility
    console.log('[Main] sendMessageToSocket called (not implemented):', message);
  }

  // Expose functions to parent window for summary button
  useEffect(() => {
    if (conversationId) {
      // @ts-ignore
      window.loadConversationSummary = () => loadConversationSummary(conversationId);
    }
  }, [conversationId]);
  // console.group("MAIN COMPONENT");
  // console.log("is ready", isReady);
  // console.log("socket values is", socketValue);
  // console.log("socket local storage", localState);
  // console.groupEnd();
  return (
    <SMainContainer>
      {!isReady && <Preloader showBackdrop />}
      <SLeftBox>
        <LeftComponent
          sendToSocket={sendMessageToSocket}
          socketIsReady={isReady}
          bioInfo={socketValue && localState.bio_info}
          callInfo={socketValue && localState.call_info}
          sessionInfo={socketValue && localState.session_info}
          voiceInfo={socketValue && localState.voice_info}
          aiInfo={socketValue && localState.ai_info}
        />
      </SLeftBox>
      <SCenterBox>
        <CentralComponent
          socketIsReady={isReady}
          dialogInfo={socketValue && socketValue.dialog_info}
          agentSuggestedPrompt={
            (socketValue && localState.ai_info && localState.ai_info.agent_suggested_prompt) ||
            (socketValue && socketValue.ai_info && socketValue.ai_info.agent_suggested_prompt)
          }
          agentNextTask={
            socketValue &&
            localState.ai_info &&
            localState.ai_info.agent_next_task
          }
          agentTasks={
            socketValue && localState.ai_info && localState.ai_info.agent_tasks
          }
        />
      </SCenterBox>
      <SRightBox>
        <RightComponent socketIsReady={isReady} />
      </SRightBox>
    </SMainContainer>
  );
};

export default Main;
