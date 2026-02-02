import React, { useState, useRef, useEffect } from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';

/**
 * AgentAssistWrapper - Wrapper component to integrate AgentAssistant widget via iframe
 * 
 * This component loads the AgentAssistant widget from agent-assist-widget project
 * using an iframe. The widget should be running on a separate server (e.g., Vite dev server).
 * 
 * To use:
 * 1. Start the agent-assist-widget dev server: cd agent-assist-widget && npm run dev
 * 2. The widget will be available at http://localhost:5173/frame2 (default Vite port)
 * 3. Optionally set REACT_APP_AGENT_ASSIST_URL environment variable to customize the URL
 */

const AgentAssistWrapper = React.memo(({ conversationId, hasEscalation, onAnalysisUpdate, onSummaryUpdate }) => {
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef(null);
  const wsRef = useRef(null);
  
  // URL do widget - pode ser configurada via variável de ambiente
  // Default: porta padrão do Vite dev server (5173) na rota /frame2
  const WS_URL = process.env.REACT_APP_WS_URL || 'ws://localhost:3006';
  
  // Build widget URL with conversation_id as token parameter
  // Only build URL if there's escalation
  const getWidgetUrl = () => {
    if (!hasEscalation || !conversationId) {
      return null;
    }
    const baseUrl = process.env.REACT_APP_AGENT_ASSIST_URL || 'http://localhost:5173/frame2';
    const normalizedId = conversationId.trim();
    const separator = baseUrl.includes('?') ? '&' : '?';
    // Pass conversation_id as both token (for WebSocket) and conversation_id (for API)
    const url = `${baseUrl}${separator}token=${encodeURIComponent(normalizedId)}&conversation_id=${encodeURIComponent(normalizedId)}`;
    console.log(`[AgentAssistWrapper] Widget URL with token and conversation_id: ${url}`);
    return url;
  };
  
  const WIDGET_URL = getWidgetUrl();
  
  // Enviar conversation_id para o widget via postMessage (apenas se houver escalação)
  useEffect(() => {
    if (!hasEscalation || !WIDGET_URL) return;
    
    try {
      // Enviar conversation_id via postMessage para o iframe
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage({
          type: 'AGENT_ASSIST_CONVERSATION_ID',
          conversationId: conversationId ? conversationId.trim() : null,
          hasEscalation
        }, '*');
      }
    } catch (error) {
      console.warn('[AgentAssist] Error sending postMessage (non-critical):', error);
    }
  }, [conversationId, hasEscalation, WIDGET_URL]);
  
  const handleIframeLoad = () => {
    setIframeLoaded(true);
    setIframeError(false);
  };
  
  const handleIframeError = () => {
    setIframeError(true);
    setIframeLoaded(false);
  };
  
  // Se houver erro ao carregar o iframe, mostrar mensagem
  if (iframeError) {
    return (
      <Box sx={{ 
        height: '100%', 
        width: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        p: 3,
        backgroundColor: (theme) => theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.default
      }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          Agent Assist Widget
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', maxWidth: 400 }}>
          O widget do Agent Assist está sendo integrado. Configure a importação do componente AgentAssistant do projeto agent-assist-widget.
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box sx={{ 
      height: '100%', 
      width: '100%', 
      position: 'relative',
      overflow: 'hidden',
      backgroundColor: (theme) => theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.default
    }}>
      {!iframeLoaded && (
        <Box sx={{ 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column',
          alignItems: 'center', 
          justifyContent: 'center',
          gap: 2
        }}>
          <CircularProgress />
          <Typography variant="body2" color="text.secondary">
            Carregando Agent Assist...
          </Typography>
        </Box>
      )}
      <Box
        sx={{
          height: '100%',
          width: '100%',
          overflow: 'hidden',
          backgroundColor: (theme) => theme.palette.mode === 'light' ? '#fff' : theme.palette.background.paper,
          boxShadow: '0px 0px 2px rgba(0,0,0,0.1)',
          position: 'relative',
          '& iframe': {
            transform: 'scale(0.95)',
            transformOrigin: 'top left',
            width: '105.26%',
            height: '105.26%',
            border: 'none'
          }
        }}
      >
        {WIDGET_URL && (
          <iframe
            ref={iframeRef}
            src={WIDGET_URL}
            style={{
              display: iframeLoaded ? 'block' : 'none'
            }}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            title="Agent Assist Widget"
            allow="microphone; camera"
            scrolling="no"
            key={`agent-assist-iframe-${conversationId}`}
          />
        )}
      </Box>
    </Box>
  );
});

AgentAssistWrapper.displayName = 'AgentAssistWrapper';

export default AgentAssistWrapper;
