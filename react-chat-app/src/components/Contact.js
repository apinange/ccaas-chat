import { Avatar, Box, Button, Chip, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, IconButton, Slide, Stack, Tab, Tabs, Typography, CircularProgress, Alert, Snackbar} from '@mui/material'
import React, { useState, useMemo, useEffect, useRef } from 'react';
import {useTheme } from "@mui/material/styles";
import { ArchiveBox, Bell, CaretRight, Phone, Prohibit, Star, VideoCamera, X, FileText } from 'phosphor-react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import { ToggleSidebar, UpdateSidebarType } from '../redux/slices/app';
import { faker } from '@faker-js/faker';
import AntSwitch from './AntSwitch';
import AgentAssistWrapper from './AgentAssistWrapper';
import createAvatar from '../utils/createAvatar';
import { store } from '../redux/store';
import { analyzeEscalation, summarizeConversation, updateAnalysis } from '../services/api';
import '../css/global.css';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const BlockDialog = ({open, handleClose}) =>{
  return (
    <Dialog
    open={open}
    TransitionComponent={Transition}
    keepMounted
    onClose={handleClose}
    aria-describedby="alert-dialog-slide-description"
  >
    <DialogTitle>Bloquear este contato</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-slide-description">
       Tem certeza de que deseja bloquear este contato?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancelar</Button>
      <Button onClick={handleClose}>Sim</Button>
    </DialogActions>
  </Dialog>
  )
}

const ArchiveDialog = ({open, handleClose}) =>{
  return (
    <Dialog
    open={open}
    TransitionComponent={Transition}
    keepMounted
    onClose={handleClose}
    aria-describedby="alert-dialog-slide-description"
  >
    <DialogTitle>Arquivar esta conversa</DialogTitle>
    <DialogContent>
      <DialogContentText id="alert-dialog-slide-description">
       Tem certeza de que deseja arquivar esta conversa?
      </DialogContentText>
    </DialogContent>
    <DialogActions>
      <Button onClick={handleClose}>Cancelar</Button>
      <Button onClick={handleClose}>Sim</Button>
    </DialogActions>
  </Dialog>
  )
}

// Componente para Agent Assist com integração de análise
const AgentAssistContent = ({ conversationId, hasEscalation, onAnalysisUpdate, onSummaryUpdate }) => {
  // Se não houver escalação, mostrar mensagem informativa
  if (!hasEscalation) {
    return (
      <Box sx={{
        height: '100%',
        flexGrow: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 4,
        textAlign: 'center'
      }}>
        <Typography variant="h6" sx={{ mb: 2, color: 'text.secondary' }}>
          Agent Assist
        </Typography>
        <Typography variant="body1" sx={{ mb: 1, color: 'text.secondary' }}>
          A conversa ainda não foi escalada para atendimento humano.
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 400 }}>
          O Agent Assist ficará disponível quando a conversa for escalada para um agente.
        </Typography>
      </Box>
    );
  }

  // Só renderizar o widget se houver escalação
  return (
    <Box sx={{height:'100%', flexGrow:1, width:'100%', display: 'flex', flexDirection: 'column'}}>
      <AgentAssistWrapper 
        conversationId={conversationId}
        hasEscalation={hasEscalation}
        onAnalysisUpdate={onAnalysisUpdate}
        onSummaryUpdate={onSummaryUpdate}
      />
    </Box>
  );
};

const Contact = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation_id') || '17adfdec-e172-4394-a968-aab4119539b0';
  const [openBlock, setOpenBlock] = useState(false);
  const [openArchive, setOpenArchive] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Estado local para armazenar informações do cliente - carrega apenas uma vez
  const [clientInfo, setClientInfo] = useState({ name: 'Cliente', phone: null });
  const previousConversationIdRef = useRef(null);
  
  // Estados para Agent Assist
  const [escalationAnalysis, setEscalationAnalysis] = useState(null);
  const [conversationSummary, setConversationSummary] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingUpdateAnalysis, setLoadingUpdateAnalysis] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  
  const { messages } = useSelector((store) => store.chat);

  // Buscar informações do cliente apenas uma vez quando a conversa é aberta
  useEffect(() => {
    const normalizedConversationId = conversationId?.trim();
    
    // Se a conversa não mudou, não fazer nada
    if (previousConversationIdRef.current === normalizedConversationId) {
      return;
    }
    
    // Atualizar referência
    previousConversationIdRef.current = normalizedConversationId;
    
    // Buscar mensagens do Redux store diretamente (não usar useSelector para evitar re-renders)
    const state = store.getState();
    const allMessages = state.chat?.messages || [];
    
    const activeConversationMessages = allMessages.filter(msg => {
      const msgConvId = msg.conversation_id?.trim();
      return msgConvId === normalizedConversationId;
    });
    
    if (activeConversationMessages.length === 0) {
      setClientInfo({ name: 'Cliente', phone: null });
      return;
    }
    
    // Procurar mensagem com client_name
    const messageWithClientName = activeConversationMessages.find(msg => {
      const name = msg.client_name;
      return name && 
             name !== null && 
             name !== undefined &&
             String(name).trim() !== '' &&
             String(name).trim() !== 'null' &&
             String(name).trim() !== 'undefined';
    });
    
    // Procurar mensagem com phone_number (pode ser diferente da que tem nome)
    const messageWithPhone = activeConversationMessages.find(msg => {
      const phone = msg.phone_number;
      return phone && 
             phone !== null && 
             phone !== undefined &&
             String(phone).trim() !== '' &&
             String(phone).trim() !== 'null' &&
             String(phone).trim() !== 'undefined';
    });
    
    const clientName = messageWithClientName?.client_name 
      ? String(messageWithClientName.client_name).trim() 
      : 'Cliente';
    
    const phoneNumber = messageWithPhone?.phone_number 
      ? String(messageWithPhone.phone_number).trim() 
      : null;
    
    setClientInfo({ name: clientName, phone: phoneNumber });
  }, [conversationId]); // Só executa quando conversationId muda

  // Criar avatar baseado no nome
  const avatarData = useMemo(() => {
    return createAvatar(clientInfo.name);
  }, [clientInfo.name]);

  const handleCloseBlock = () =>{
    setOpenBlock(false);
  }

  const handleCloseArchive = () =>{
    setOpenArchive(false);
  }

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  }
  
  // Verificar se há escalação na conversa
  const hasEscalation = useMemo(() => {
    const normalizedConversationId = conversationId?.trim();
    const activeConversationMessages = messages.filter(msg => {
      const msgConvId = msg.conversation_id?.trim();
      return msgConvId === normalizedConversationId;
    });
    return activeConversationMessages.some(msg => msg.flag === 'ESCALATION');
  }, [messages, conversationId]);
  
  const loadEscalationAnalysis = async (forceRefresh = false) => {
    if (loadingAnalysis) return; // Prevent multiple simultaneous calls
    
    setLoadingAnalysis(true);
    try {
      const previousAnalysis = escalationAnalysis 
        ? `${escalationAnalysis.reasoning || escalationAnalysis.explanation}\n\nAção anterior: ${escalationAnalysis.action || escalationAnalysis.suggestion}`
        : null;
      
      const response = await analyzeEscalation(conversationId.trim(), previousAnalysis, forceRefresh);
      console.log('[Contact] Analysis response:', response);
      
      if (response.status === 'success') {
        const analysisData = {
          reasoning: response.data.reasoning || response.data.explanation || '',
          action: response.data.action || response.data.suggestion || ''
        };
        console.log('[Contact] Analysis data to set:', analysisData);
        setEscalationAnalysis(analysisData);
        console.log('[Contact] Analysis data set successfully');
        
        if (!forceRefresh && response.data.cached) {
          console.log('[Contact] Escalation analysis loaded from cache');
        }
      } else if (response.status === 'processing') {
        // Análise está sendo processada, aguardar atualizações via WebSocket
        console.log('[Contact] Escalation analysis is being processed, waiting for WebSocket updates');
      } else {
        // If response is not success, use mock data
        setEscalationAnalysis({
          reasoning: 'A conversa foi escalada para atendimento humano. Análise automática baseada em dados mockados.',
          action: 'Revise o histórico completo da conversa e identifique a necessidade específica que levou à escalação.'
        });
      }
    } catch (error) {
      console.warn('Error loading escalation analysis, using mock data:', error);
      // Always set mock data on error
      setEscalationAnalysis({
        reasoning: 'A conversa foi escalada para atendimento humano. Análise automática baseada em dados mockados.',
        action: 'Revise o histórico completo da conversa e identifique a necessidade específica que levou à escalação.'
      });
    } finally {
      setLoadingAnalysis(false);
    }
  };
  
  // Carregar análise quando abrir a aba Agent Assist e houver escalação (busca do cache primeiro)
  useEffect(() => {
    if (activeTab === 1 && hasEscalation && !escalationAnalysis && !loadingAnalysis) {
      loadEscalationAnalysis(false); // Buscar do cache primeiro
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, hasEscalation, conversationId]);
  
  // Atualizar análise completa quando abrir a aba Agent Assist
  const handleUpdateAnalysis = async (forceRefresh = false) => {
    if (loadingUpdateAnalysis) return; // Prevent multiple simultaneous calls
    
    setLoadingUpdateAnalysis(true);
    try {
      const response = await updateAnalysis(conversationId.trim(), forceRefresh);
      console.log('[Contact] Update analysis response:', response);
      
      if (response.status === 'success') {
        const analysisData = response.data;
        
        // Atualizar análise de escalação se houver reasoning e suggestion
        if (analysisData.reasoning || analysisData.suggestion) {
          setEscalationAnalysis({
            reasoning: analysisData.reasoning || '',
            action: analysisData.suggestion || ''
          });
        }
        
        // Atualizar resumo se houver
        if (analysisData.summary) {
          setConversationSummary(analysisData.summary);
        }
        
        // Enviar dados para o widget via postMessage
        const iframe = document.querySelector('iframe[title="Agent Assist Widget"]');
        if (iframe && iframe.contentWindow) {
          iframe.contentWindow.postMessage({
            type: 'UPDATE_ANALYSIS',
            conversationId: conversationId.trim(),
            data: analysisData
          }, '*');
        }
        
        if (!forceRefresh && analysisData.cached) {
          // Dados do cache, não mostrar mensagem de sucesso
          console.log('[Contact] Analysis loaded from cache');
        } else {
          setSnackbar({
            open: true,
            message: 'Análise atualizada com sucesso',
            severity: 'success'
          });
        }
      } else if (response.status === 'processing') {
        // Análise está sendo processada, aguardar atualizações via WebSocket
        console.log('[Contact] Analysis is being processed, waiting for WebSocket updates');
        setSnackbar({
          open: true,
          message: 'Gerando análise... Você receberá atualizações em tempo real.',
          severity: 'info'
        });
        // Timeout para definir loading como false caso WebSocket não receba dados em 30 segundos
        setTimeout(() => {
          setLoadingUpdateAnalysis(false);
        }, 30000);
        // O WebSocket vai atualizar os dados quando pronto e também definir loading como false
      } else {
        setSnackbar({
          open: true,
          message: 'Erro ao atualizar análise',
          severity: 'error'
        });
        setLoadingUpdateAnalysis(false);
      }
    } catch (error) {
      console.warn('Error updating analysis:', error);
      setSnackbar({
        open: true,
        message: 'Erro ao atualizar análise',
        severity: 'error'
      });
      setLoadingUpdateAnalysis(false);
    }
  };
  
  // Carregar análise completa quando abrir a aba Agent Assist (apenas se houver escalação)
  useEffect(() => {
    if (activeTab === 1 && conversationId && hasEscalation && !loadingUpdateAnalysis) {
      // Buscar do cache primeiro (forceRefresh = false)
      handleUpdateAnalysis(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, conversationId, hasEscalation]);
  
  const handleSummarizeConversation = async (forceRefresh = false) => {
    if (loadingSummary) return; // Prevent multiple simultaneous calls
    
    setLoadingSummary(true);
    try {
      const response = await summarizeConversation(conversationId.trim(), forceRefresh);
      console.log('[Contact] Summary response:', response);
      
      if (response.status === 'success') {
        const summaryData = response.data.summary;
        setConversationSummary(summaryData);
        console.log('[Contact] Summary data set:', summaryData);
        
        // Trigger summary load in widget via postMessage
        const iframe = document.querySelector('iframe[title="Agent Assist Widget"]');
        if (iframe && iframe.contentWindow) {
          // @ts-ignore
          if (iframe.contentWindow.loadConversationSummary) {
            // @ts-ignore
            iframe.contentWindow.loadConversationSummary();
          } else {
            // Fallback: send via postMessage
            iframe.contentWindow.postMessage({
              type: 'LOAD_SUMMARY',
              conversationId: conversationId.trim()
            }, '*');
          }
        }
        
        if (!forceRefresh && response.data.cached) {
          // Dados do cache, não mostrar mensagem de sucesso
          console.log('[Contact] Summary loaded from cache');
        } else {
          setSnackbar({
            open: true,
            message: 'Resumo gerado com sucesso',
            severity: 'success'
          });
        }
      } else if (response.status === 'processing') {
        // Resumo está sendo processado, aguardar atualizações via WebSocket
        console.log('[Contact] Summary is being processed, waiting for WebSocket updates');
        setSnackbar({
          open: true,
          message: 'Gerando resumo... Você receberá atualizações em tempo real.',
          severity: 'info'
        });
        // Não definir loading como false ainda, aguardar WebSocket
      } else {
        // If response is not success, use mock data
        setConversationSummary('Resumo da Conversa:\n\nEsta é uma análise automática baseada em dados mockados. Para uma análise mais detalhada, configure a chave da API OpenAI.');
        setSnackbar({
          open: true,
          message: 'Resumo gerado usando dados mockados',
          severity: 'info'
        });
        setLoadingSummary(false);
      }
    } catch (error) {
      console.warn('Error summarizing conversation, using mock data:', error);
      // Always set mock data on error
      setConversationSummary('Resumo da Conversa:\n\nEsta é uma análise automática baseada em dados mockados. Para uma análise mais detalhada, configure a chave da API OpenAI.');
      setSnackbar({
        open: true,
        message: 'Resumo gerado usando dados mockados',
        severity: 'info'
      });
    } finally {
      setLoadingSummary(false);
    }
  };
  
  const handleAnalysisUpdate = (analysis) => {
    setEscalationAnalysis(analysis);
  };
  
  const handleSummaryUpdate = (summary) => {
    setConversationSummary(summary);
  };

  // Dados hardcoded da revendedora Boticário
  const revendedoraData = {
    id: "REV-2024-001234",
    nome_completo: "Maria Silva Santos",
    nome_fantasia: "Perfumaria Maria",
    email: "maria.santos@boticario.com.br",
    telefone: "+55 (11) 98765-4321",
    celular: "+55 (11) 99876-5432",
    status: "ATIVA",
    nivel: "CONSULTORA",
    categoria: "REVENDEDORA_INDEPENDENTE",
    endereco: {
      logradouro: "Rua das Flores, 123",
      complemento: "Apto 45",
      bairro: "Centro",
      cidade: "São Paulo",
      estado: "SP",
      cep: "01310-100",
    },
    data_cadastro: "2020-03-15",
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatAddress = () => {
    const { logradouro, complemento, bairro, cidade, estado, cep } = revendedoraData.endereco;
    return `${logradouro}${complemento ? `, ${complemento}` : ""}, ${bairro}, ${cidade}/${estado} - CEP: ${cep}`;
  };

  const ProfileContent = () => (
    <Stack className='scrollbar' sx={{height:'100%', position:'relative', flexGrow:1, overflowY:'scroll'}} p={3}
    spacing={3}>
      {/* Header com Avatar e Nome */}
      <Stack alignItems={'center'} direction='row' spacing={2}>
        <Avatar 
          alt={clientInfo.name} 
          sx={{
            height:64, 
            width:64,
            bgcolor: theme.palette[avatarData.color]?.main || theme.palette.primary.main,
            color: '#fff'
          }}
        >
          {avatarData.name}
        </Avatar>
        <Stack spacing={0.5} sx={{ flex: 1 }}>
          <Stack direction='row' alignItems='center' spacing={1}>
          <Typography variant='article' fontWeight={600}>
            {clientInfo.name}
          </Typography>
            <Chip
              label={revendedoraData.status}
              size="small"
              sx={{
                bgcolor: revendedoraData.status === 'ATIVA' ? 'success.lighter' : 'grey.200',
                color: revendedoraData.status === 'ATIVA' ? 'success.darker' : 'grey.700',
                fontWeight: 600,
                fontSize: '0.65rem',
                height: 20,
                borderRadius: '6px',
                '& .MuiChip-label': {
                  px: 1,
                  py: 0
                }
              }}
            />
          </Stack>
          {clientInfo.phone && (
            <Typography variant='article' fontWeight={500} color='text.secondary'>
              {clientInfo.phone}
          </Typography>
          )}
        </Stack>
      </Stack>

      {/* Status e Badges */}
      <Stack direction='row' alignItems='center' spacing={1} flexWrap='wrap' useFlexGap>
        <Chip
          label={revendedoraData.nivel}
          size="small"
          variant="outlined"
          sx={{
            borderColor: 'primary.main',
            color: 'primary.main',
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 24,
            borderRadius: '6px',
          }}
        />
        <Chip
          label={revendedoraData.categoria.replace(/_/g, ' ')}
          size="small"
          variant="outlined"
          sx={{
            borderColor: 'secondary.main',
            color: 'secondary.main',
            fontWeight: 600,
            fontSize: '0.7rem',
            height: 24,
            borderRadius: '6px',
            textTransform: 'capitalize',
          }}
        />
      </Stack>

      <Divider/>

      {/* Informações de Contato */}
      <Stack spacing={2}>
        <Typography variant='subtitle2' fontWeight={600}>Informações de Contato</Typography>
        <Stack spacing={1.5}>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='body2' color='text.secondary'>ID</Typography>
            <Typography variant='body2' fontWeight={500}>{revendedoraData.id}</Typography>
          </Stack>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='body2' color='text.secondary'>Email</Typography>
            <Typography variant='body2' fontWeight={500}>{revendedoraData.email}</Typography>
      </Stack>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='body2' color='text.secondary'>Telefone</Typography>
            <Typography variant='body2' fontWeight={500}>{revendedoraData.telefone}</Typography>
      </Stack>
          <Stack direction='row' justifyContent='space-between' alignItems='center'>
            <Typography variant='body2' color='text.secondary'>Celular</Typography>
            <Typography variant='body2' fontWeight={500}>{clientInfo.phone || revendedoraData.celular}</Typography>
      </Stack>
        </Stack>
      </Stack>

      <Divider/>

      {/* Endereço */}
      <Stack spacing={1}>
        <Typography variant='subtitle2' fontWeight={600}>Endereço</Typography>
        <Typography variant='body2' color='text.secondary' sx={{ lineHeight: 1.6 }}>
          {formatAddress()}
        </Typography>
      </Stack>

      <Divider/>

      {/* Data de Cadastro */}
      <Stack spacing={1}>
        <Typography variant='subtitle2' fontWeight={600}>Data de Cadastro</Typography>
        <Typography variant='body2' color='text.secondary'>
          {formatDate(revendedoraData.data_cadastro)}
        </Typography>
      </Stack>

      <Divider/>

      {/* Ações */}
      <Stack direction='row' alignItems={'center'} spacing={2}>
        <Button onClick={()=>{setOpenBlock(true)}} startIcon={<Prohibit/>} fullWidth variant='outlined'>
          Bloquear
        </Button >
        <Button onClick={()=>{setOpenArchive(true)}} startIcon={<ArchiveBox/>} fullWidth variant='outlined'>
          Arquivar
        </Button>
      </Stack>
    </Stack>
  );


  return (
    <Box sx={{width:530, height:'100vh'}}>
      <Stack sx={{height:'100%'}}>
        {/* Header */}
        <Box sx={{
          boxShadow: '0px 0px 2px rgba(0.25)',
          width: '100%',
          backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background
        }}>
          <Stack sx={{height:'100%'}}>
            <Stack sx={{p:2}} direction='row' alignItems='center'
             justifyContent='space-between' spacing={3}>
              <Typography variant='subtitle2'>Informações do Contato</Typography>
              <IconButton onClick={()=>{
                dispatch(ToggleSidebar());
              }}>
                <X/>
              </IconButton>
            </Stack>
            <Tabs value={activeTab} onChange={handleTabChange} sx={{px:2}}>
              <Tab label="Perfil" />
              <Tab label="Agent Assist" />
            </Tabs>
            {activeTab === 1 && hasEscalation && (
              <Box sx={{px: 2, pb: 1, display: 'flex', gap: 1, justifyContent: 'flex-end'}}>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() => loadEscalationAnalysis(true)}
                  disabled={loadingAnalysis}
                  startIcon={loadingAnalysis ? <CircularProgress size={16} /> : null}
                >
                  {loadingAnalysis ? 'Analisando...' : 'Atualizar Análise'}
                </Button>
                <Button
                  size="small"
                  variant="contained"
                  onClick={() => handleSummarizeConversation(true)}
                  disabled={loadingSummary}
                  startIcon={loadingSummary ? <CircularProgress size={16} /> : <FileText />}
                >
                  {loadingSummary ? 'Gerando...' : 'Resumir Conversa'}
                </Button>
              </Box>
            )}
          </Stack>
        </Box>
        {/* Body */}
        {activeTab === 0 ? (
          <ProfileContent />
        ) : (
          <AgentAssistContent
            conversationId={conversationId}
            hasEscalation={hasEscalation}
            onAnalysisUpdate={handleAnalysisUpdate}
            onSummaryUpdate={handleSummaryUpdate}
          />
        )}
      </Stack>
      {openBlock && <BlockDialog open={openBlock} handleClose={handleCloseBlock}/>}
      {openArchive && <ArchiveDialog open={openArchive} handleClose={handleCloseArchive}/>}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default Contact