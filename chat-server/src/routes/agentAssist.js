import express from 'express';
import { analyzeEscalation, summarizeConversation, analyzeConversationForAgentAssist } from '../services/openaiService.js';
import { 
  getUserMessagesSinceLastBeforeEscalation, 
  getMessages, 
  hasEscalation 
} from '../storage/messageStorage.js';
import { 
  getAgentAssistAnalysis, 
  saveAgentAssistAnalysis,
  cleanupGotchaReferences
} from '../storage/agentAssistStorage.js';
import { sendAgentAssistData } from '../services/websocketServer.js';

const router = express.Router();

/**
 * GET /api/agent-assist/conversation-data
 * Get all data needed for agent assist widget (CRM, user info, messages, etc.)
 * Query: conversation_id
 */
router.get('/conversation-data', (req, res) => {
  try {
    const { conversation_id } = req.query;

    if (!conversation_id) {
      return res.status(400).json({
        status: 'error',
        message: 'conversation_id is required'
      });
    }

    const normalizedConversationId = conversation_id.trim();
    const messages = getMessages(normalizedConversationId);

    if (messages.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'Conversation not found'
      });
    }

    // Extract client info from messages
    const clientMessage = messages.find(msg => msg.client_name) || messages[0];
    const phoneMessage = messages.find(msg => msg.phone_number) || messages[0];
    
    const clientName = clientMessage?.client_name || 'Cliente';
    const phoneNumber = phoneMessage?.phone_number || null;

    // Build CRM data with mock data (can be customized per conversation)
    const crmData = [
      { key: 'Pontos Fidelidade', value: '15.230' },
      { key: 'Meta Mensal', value: 'R$ 5.000,00' },
      { key: 'Vendas Mês Atual', value: 'R$ 3.420,50' },
      { key: 'Percentual Atingido', value: '68,41%' },
      { key: 'Comissão Percentual', value: '25,0%' },
      { key: 'Comissão Total', value: 'R$ 855,13' },
      { key: 'Último Pedido', value: '22/01/2026' }
    ];

    // Build session info
    const sessionInfo = {
      call_id: normalizedConversationId,
      ani: phoneNumber || '+5511999999999'
    };

    // Build user info
    const userInfo = {
      name: clientName,
      user_id: messages[0]?.user_id || null,
      validAni: !!phoneNumber,
      trustLevel: 0.75,
      address: 'São Paulo, SP' // Default, can be enhanced
    };

    // Build dialog info from messages
    const dialogInfo = {
      utt_list: messages
        .filter(msg => msg.flag !== 'ESCALATION')
        .map(msg => ({
          leg: msg.flag === 'USER' ? 'USER' : msg.flag === 'AGENT' ? 'AGENT' : 'BOT',
          utt: msg.text || '',
          is_final: true,
          confidence: 1.0,
          words: []
        }))
    };

    // Build features
    const features = {
      voiceBiometrics: false,
      blacklisting: false,
      transcription: true,
      suggestions: true,
      summary: true,
      notes: true
    };

    // Build fraud info (default safe)
    const fraudInfo = {
      description: 'Risco baixo',
      label: 'SAFE'
    };

    // Build notes with fixed mock data
    const notes = [
      { key: 'Observação 1', value: 'Revendedora Premium' },
      { key: 'Observação 2', value: 'Atendimento preferencial' }
    ];

    const responseData = {
      crm_data: crmData,
      session_info: sessionInfo,
      user_info: userInfo,
      dialog_info: dialogInfo,
      features: features,
      fraud_info: fraudInfo,
      notes: notes,
      has_escalation: hasEscalation(normalizedConversationId)
    };

    // Send to WebSocket clients connected with this conversation_id
    sendAgentAssistData(normalizedConversationId, {
      crm_data: crmData,
      session_info: sessionInfo,
      user_info: userInfo,
      dialog_info: dialogInfo,
      features: features,
      fraud_info: fraudInfo,
      notes: notes
    });

    res.json({
      status: 'success',
      data: responseData
    });
  } catch (error) {
    console.error('Error getting conversation data:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get conversation data',
      error: error.message
    });
  }
});

/**
 * POST /api/agent-assist/analyze-escalation
 * Analyzes user messages since last message before escalation
 * Body: { conversation_id: string, previous_analysis?: string, force_refresh?: boolean }
 * 
 * If force_refresh is false or not provided, returns cached escalation analysis from database.
 * If force_refresh is true, generates new analysis asynchronously and updates via WebSocket.
 */
router.post('/analyze-escalation', async (req, res) => {
  try {
    const { conversation_id, previous_analysis, force_refresh = false } = req.body;

    if (!conversation_id) {
      return res.status(400).json({
        status: 'error',
        message: 'conversation_id is required'
      });
    }

    // Normalize conversation_id
    const normalizedConversationId = conversation_id.trim();

    // Check if conversation has escalation
    if (!hasEscalation(normalizedConversationId)) {
      return res.status(400).json({
        status: 'error',
        message: 'Conversation does not have an escalation message'
      });
    }

    // Try to get cached escalation analysis from database first (unless force_refresh)
    if (!force_refresh) {
      const cachedAnalysis = getAgentAssistAnalysis(normalizedConversationId);
      if (cachedAnalysis && (cachedAnalysis.escalationReasoning || cachedAnalysis.escalationAction)) {
        console.log(`[AgentAssist] Returning cached escalation analysis for conversation ${normalizedConversationId}`);
        
        // Send cached data via WebSocket immediately
        sendAgentAssistData(normalizedConversationId, {
          reasoning: cachedAnalysis.escalationReasoning,
          action: cachedAnalysis.escalationAction
        });

        return res.json({
          status: 'success',
          data: {
            reasoning: cachedAnalysis.escalationReasoning,
            action: cachedAnalysis.escalationAction,
            cached: true,
            updated_at: cachedAnalysis.updated_at
          }
        });
      }
    }

    // Get user messages since last before escalation
    const userMessages = getUserMessagesSinceLastBeforeEscalation(normalizedConversationId);

    // Return immediately and process asynchronously
    res.json({
      status: 'processing',
      message: 'Escalation analysis is being generated. Updates will be sent via WebSocket.',
      data: {
        conversation_id: normalizedConversationId,
        user_messages_count: userMessages.length
      }
    });

    // Process analysis asynchronously (non-blocking)
    (async () => {
      try {
        // Send processing status via WebSocket
        sendAgentAssistData(normalizedConversationId, {
          escalationStatus: 'processing',
          message: 'Analisando escalação...'
        });

        // Use mock data if no user messages found
        let analysis;
        if (userMessages.length === 0) {
          console.warn(`[AgentAssist] No user messages found for conversation ${conversation_id}, using mock data`);
          analysis = {
            reasoning: 'A conversa foi escalada para atendimento humano. Não foram encontradas mensagens específicas do usuário antes da escalação para análise detalhada. O cliente provavelmente precisa de assistência personalizada que o bot não conseguiu fornecer.',
            action: 'Revise o histórico completo da conversa, identifique o ponto de insatisfação e ofereça uma solução direta e personalizada.'
          };
        } else {
          // Call OpenAI to analyze (will use mock if API key not set)
          analysis = await analyzeEscalation(userMessages, previous_analysis || null);
        }

        // Get existing analysis or create new
        const existingAnalysis = getAgentAssistAnalysis(normalizedConversationId) || {};
        
        // Save to database (update escalation fields, keep other fields)
        saveAgentAssistAnalysis(normalizedConversationId, {
          userSentiment: existingAnalysis.userSentiment,
          reasoning: existingAnalysis.reasoning,
          suggestion: existingAnalysis.suggestion,
          summary: existingAnalysis.summary,
          escalationReasoning: analysis.reasoning,
          escalationAction: analysis.action
        });

        console.log(`[AgentAssist] Escalation analysis saved to database for conversation ${normalizedConversationId}`);

        // Send complete analysis via WebSocket
        sendAgentAssistData(normalizedConversationId, {
          reasoning: analysis.reasoning,
          action: analysis.action,
          escalationStatus: 'completed'
        });
      } catch (error) {
        console.error('[AgentAssist] Error processing escalation analysis asynchronously:', error);
        sendAgentAssistData(normalizedConversationId, {
          escalationStatus: 'error',
          message: 'Erro ao analisar escalação. Tente novamente.'
        });
      }
    })();

  } catch (error) {
    console.error('Error analyzing escalation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to analyze escalation',
      error: error.message
    });
  }
});

/**
 * POST /api/agent-assist/update-analysis
 * Analyzes the complete conversation and updates agent assist data
 * Body: { conversation_id: string, force_refresh?: boolean }
 * 
 * If force_refresh is false or not provided, returns cached analysis from database.
 * If force_refresh is true, generates new analysis asynchronously and updates via WebSocket.
 */
router.post('/update-analysis', async (req, res) => {
  try {
    const { conversation_id, force_refresh = false } = req.body;

    if (!conversation_id) {
      return res.status(400).json({
        status: 'error',
        message: 'conversation_id is required'
      });
    }

    // Normalize conversation_id
    const normalizedConversationId = conversation_id.trim();

    // Try to get cached analysis from database first (unless force_refresh)
    if (!force_refresh) {
      const cachedAnalysis = getAgentAssistAnalysis(normalizedConversationId);
      if (cachedAnalysis && (cachedAnalysis.reasoning || cachedAnalysis.summary)) {
        console.log(`[AgentAssist] Returning cached analysis for conversation ${normalizedConversationId}`);
        
        // Send cached data via WebSocket immediately
        sendAgentAssistData(normalizedConversationId, {
          userSentiment: cachedAnalysis.userSentiment,
          reasoning: cachedAnalysis.reasoning,
          suggestion: cachedAnalysis.suggestion,
          summary: cachedAnalysis.summary
        });

        return res.json({
          status: 'success',
          data: {
            userSentiment: cachedAnalysis.userSentiment,
            reasoning: cachedAnalysis.reasoning,
            suggestion: cachedAnalysis.suggestion,
            summary: cachedAnalysis.summary,
            cached: true,
            updated_at: cachedAnalysis.updated_at
          }
        });
      }
    }

    // Get all messages from conversation
    const allMessages = getMessages(normalizedConversationId);

    if (allMessages.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No messages found for this conversation'
      });
    }

    // Return immediately and process asynchronously
    res.json({
      status: 'processing',
      message: 'Analysis is being generated. Updates will be sent via WebSocket.',
      data: {
        conversation_id: normalizedConversationId,
        total_messages: allMessages.length
      }
    });

    // Process analysis asynchronously (non-blocking)
    (async () => {
      try {
        // Send processing status via WebSocket
        sendAgentAssistData(normalizedConversationId, {
          analysisStatus: 'processing',
          message: 'Gerando análise...'
        });

        // Call OpenAI to analyze (will use mock if API key not set)
        const analysis = await analyzeConversationForAgentAssist(allMessages);

        // Save to database
        saveAgentAssistAnalysis(normalizedConversationId, {
          userSentiment: analysis.userSentiment,
          reasoning: analysis.reasoning,
          suggestion: analysis.suggestion,
          summary: analysis.summary
        });

        console.log(`[AgentAssist] Analysis saved to database for conversation ${normalizedConversationId}`);

        // Send complete analysis via WebSocket
        sendAgentAssistData(normalizedConversationId, {
          userSentiment: analysis.userSentiment,
          reasoning: analysis.reasoning,
          suggestion: analysis.suggestion,
          summary: analysis.summary,
          analysisStatus: 'completed'
        });
      } catch (error) {
        console.error('[AgentAssist] Error processing analysis asynchronously:', error);
        sendAgentAssistData(normalizedConversationId, {
          analysisStatus: 'error',
          message: 'Erro ao gerar análise. Tente novamente.'
        });
      }
    })();

  } catch (error) {
    console.error('Error updating agent assist analysis:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update agent assist analysis',
      error: error.message
    });
  }
});

/**
 * POST /api/agent-assist/summarize-conversation
 * Summarizes the complete conversation
 * Body: { conversation_id: string, force_refresh?: boolean }
 * 
 * If force_refresh is false or not provided, returns cached summary from database.
 * If force_refresh is true, generates new summary asynchronously and updates via WebSocket.
 */
router.post('/summarize-conversation', async (req, res) => {
  try {
    const { conversation_id, force_refresh = false } = req.body;

    if (!conversation_id) {
      return res.status(400).json({
        status: 'error',
        message: 'conversation_id is required'
      });
    }

    // Normalize conversation_id
    const normalizedConversationId = conversation_id.trim();

    // Try to get cached summary from database first (unless force_refresh)
    if (!force_refresh) {
      const cachedAnalysis = getAgentAssistAnalysis(normalizedConversationId);
      if (cachedAnalysis && cachedAnalysis.summary) {
        console.log(`[AgentAssist] Returning cached summary for conversation ${normalizedConversationId}`);
        
        // Send cached summary via WebSocket immediately
        sendAgentAssistData(normalizedConversationId, {
          summary: cachedAnalysis.summary
        });

        return res.json({
          status: 'success',
          data: {
            summary: cachedAnalysis.summary,
            cached: true,
            updated_at: cachedAnalysis.updated_at
          }
        });
      }
    }

    // Get all messages from conversation
    const allMessages = getMessages(normalizedConversationId);

    if (allMessages.length === 0) {
      return res.status(404).json({
        status: 'error',
        message: 'No messages found for this conversation'
      });
    }

    // Return immediately and process asynchronously
    res.json({
      status: 'processing',
      message: 'Summary is being generated. Updates will be sent via WebSocket.',
      data: {
        conversation_id: normalizedConversationId,
        total_messages: allMessages.length
      }
    });

    // Process summary asynchronously (non-blocking)
    (async () => {
      try {
        // Send processing status via WebSocket
        sendAgentAssistData(normalizedConversationId, {
          summaryStatus: 'processing',
          message: 'Gerando resumo...'
        });

        // Call OpenAI to summarize (will use mock if API key not set)
        const summary = await summarizeConversation(allMessages);

        // Get existing analysis or create new
        const existingAnalysis = getAgentAssistAnalysis(normalizedConversationId) || {};
        
        // Save to database (update summary, keep other fields)
        saveAgentAssistAnalysis(normalizedConversationId, {
          userSentiment: existingAnalysis.userSentiment,
          reasoning: existingAnalysis.reasoning,
          suggestion: existingAnalysis.suggestion,
          summary: summary
        });

        console.log(`[AgentAssist] Summary saved to database for conversation ${normalizedConversationId}`);

        // Send complete summary via WebSocket
        sendAgentAssistData(normalizedConversationId, {
          summary: summary,
          summaryStatus: 'completed'
        });
      } catch (error) {
        console.error('[AgentAssist] Error processing summary asynchronously:', error);
        sendAgentAssistData(normalizedConversationId, {
          summaryStatus: 'error',
          message: 'Erro ao gerar resumo. Tente novamente.'
        });
      }
    })();

  } catch (error) {
    console.error('Error summarizing conversation:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to summarize conversation',
      error: error.message
    });
  }
});

/**
 * POST /api/agent-assist/cleanup-gotcha
 * Clean up old "gotcha" references from cached analysis data
 * This is a one-time migration endpoint
 */
router.post('/cleanup-gotcha', (req, res) => {
  try {
    const result = cleanupGotchaReferences();
    res.json({
      status: 'success',
      message: 'Gotcha references cleaned up',
      data: result
    });
  } catch (error) {
    console.error('Error cleaning up gotcha references:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to cleanup gotcha references',
      error: error.message
    });
  }
});

export default router;
