/**
 * WebSocket Server for Agent Assist Widget
 * Sends data only when explicitly requested via sendAgentAssistData()
 * Automatic mock updates are disabled
 */

import { WebSocketServer } from 'ws';
// Mock payload imports are kept for potential future use, but automatic updates are disabled
// import { getMockPayload, getCurrentPayloadIndex } from './agentAssistMock.js';

let wss = null;

/**
 * Start WebSocket server attached to HTTP server
 * @param {Object} server - HTTP server instance
 */
export function startWebSocketServer(server) {
  if (wss) {
    console.log('[WS] WebSocket server already running');
    return wss;
  }

  wss = new WebSocketServer({ server, path: '/frame' });

  wss.on('listening', () => {
    const address = server.address();
    const port = address?.port || 3006;
    console.log(`[WS] WebSocket server listening on same port as HTTP server (${port})`);
    console.log(`[WS] Connect with: ws://localhost:${port}/frame?token=<any-token>`);
  });

  wss.on('connection', (ws, req) => {
    // Parse URL to get token parameter
    let token = null;
    try {
      const host = req.headers.host || 'localhost:3006';
      const url = new URL(req.url, `http://${host}`);
      token = url.searchParams.get('token');
    } catch (error) {
      console.warn('[WS] Error parsing URL:', error.message);
      // Try to extract token manually from URL
      const match = req.url.match(/[?&]token=([^&]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }
    
    console.log(`[WS] New client connected with token: ${token || 'no-token'}`);
    console.log(`[WS] Request URL: ${req.url}`);
    
    // Store token in client object for later reference
    ws.token = token;
    
    // Send initial payload immediately (optional - can be removed if not needed)
    // Uncomment the lines below if you want to send an initial mock payload
    // const initialIndex = getCurrentPayloadIndex();
    // const initialPayload = getMockPayload(initialIndex);
    // ws.send(JSON.stringify(initialPayload));
    // console.log(`[WS] Sent initial payload #${initialIndex + 1}`);

    // Automatic payload updates every 10 seconds - DISABLED
    // The widget will now only receive data when explicitly sent via sendAgentAssistData()
    // const clientInterval = setInterval(() => {
    //   if (ws.readyState === ws.OPEN) {
    //     const payloadIndex = getCurrentPayloadIndex();
    //     const payload = getMockPayload(payloadIndex);
    //     ws.send(JSON.stringify(payload));
    //     console.log(`[WS] Sent payload #${payloadIndex + 1} to client ${token || 'no-token'}`);
    //   } else {
    //     clearInterval(clientInterval);
    //   }
    // }, 10000);

    ws.on('close', () => {
      console.log(`[WS] Client disconnected: ${token || 'no-token'}`);
      // clearInterval(clientInterval); // No longer needed
    });

    ws.on('error', (error) => {
      console.error(`[WS] WebSocket error for client ${token || 'no-token'}:`, error);
      // clearInterval(clientInterval); // No longer needed
    });

    ws.on('message', (message) => {
      try {
        const data = JSON.parse(message.toString());
        console.log(`[WS] Received message from client ${token || 'no-token'}:`, data);
      } catch (error) {
        console.log(`[WS] Received non-JSON message from client ${token || 'no-token'}:`, message.toString());
      }
    });
  });

  wss.on('error', (error) => {
    console.error('[WS] WebSocket server error:', error);
  });

  return wss;
}

/**
 * Stop WebSocket server
 */
export function stopWebSocketServer() {
  if (wss) {
    wss.close(() => {
      console.log('[WS] WebSocket server stopped');
    });
    wss = null;
  }
}

/**
 * Get WebSocket server instance
 */
export function getWebSocketServer() {
  return wss;
}

/**
 * Send agent assist data to a specific client by token (conversation_id)
 * @param {string} token - Token (conversation_id) to identify the client
 * @param {Object} data - Data to send (analysis, summary, etc.)
 */
export function sendAgentAssistData(token, data) {
  if (!wss) {
    console.warn('[WS] WebSocket server not initialized');
    return false;
  }

  // Normalize token (trim whitespace)
  const normalizedToken = token ? token.trim() : token;
  
  console.log(`[WS] Attempting to send agent assist data to token: "${normalizedToken}"`);
  console.log(`[WS] Data to send:`, data);
  console.log(`[WS] Connected clients: ${wss.clients.size}`);

  let sent = false;
  wss.clients.forEach((client) => {
    if (client.readyState === client.OPEN) {
      // Extract token from client (stored in client metadata)
      const clientToken = client.token ? client.token.trim() : null;
      
      console.log(`[WS] Checking client token: "${clientToken}" vs target: "${normalizedToken}"`);
      
      // Compare normalized tokens
      if (clientToken === normalizedToken) {
        const payload = {
          // Include all conversation data if present
          // IMPORTANT: dialog_info must always be included when present (for real-time updates)
          ...(data.crm_data ? { crm_data: data.crm_data } : {}),
          ...(data.session_info ? { session_info: data.session_info } : {}),
          ...(data.user_info ? { user_info: data.user_info } : {}),
          ...(data.dialog_info !== undefined ? { dialog_info: data.dialog_info } : {}),
          ...(data.fraud_info ? { fraud_info: data.fraud_info } : {}),
          ...(data.notes ? { notes: data.notes } : {}),
          
          // AI info
          ai_info: {
            ...(data.reasoning ? { explanation: data.reasoning } : {}),
            ...(data.explanation ? { explanation: data.explanation } : {}),
            ...(data.action ? { agent_suggested_prompt: data.action } : {}),
            ...(data.suggestion ? { agent_suggested_prompt: data.suggestion } : {}),
            ...(data.agent_suggested_prompt ? { agent_suggested_prompt: data.agent_suggested_prompt } : {}),
            ...(data.agent_next_task ? { agent_next_task: data.agent_next_task } : {}),
            ...(data.agent_tasks ? { agent_tasks: data.agent_tasks } : {})
          },
          
          // Features to enable icons in the header
          features: data.features || {
            suggestions: true,
            notes: true,
            summary: true,
            transcription: true,
            voiceBiometrics: false,
            blacklisting: false
          }
        };
        
        // Add user sentiment to ai_info and user_sound
        if (data.userSentiment) {
          if (!payload.ai_info) {
            payload.ai_info = {};
          }
          payload.ai_info.user_sentiment = {
            label: data.userSentiment.label,
            score: data.userSentiment.score
          };
          payload.user_sound = data.userSentiment.score;
          console.log('[WS] Adding user sentiment to payload:', {
            label: data.userSentiment.label,
            score: data.userSentiment.score
          });
        }
        
        // Add call_summary if summary exists
        if (data.summary) {
          payload.call_summary = {
            summary: data.summary,
            timestamp: Date.now(),
            topic: 'Resumo da Conversa',
            type: 'summary'
          };
          console.log('[WS] Adding call_summary to payload:', {
            topic: payload.call_summary.topic,
            summaryLength: payload.call_summary.summary?.length || 0,
            summaryPreview: payload.call_summary.summary?.substring(0, 100) + '...'
          });
        }
        
        // Add suggestion object for AI icon to work
        if (data.suggestion || data.reasoning || data.action || data.explanation) {
          const suggestionText = data.suggestion || data.action || '';
          const reasoningText = data.reasoning || data.explanation || '';
          
          payload.suggestion = {
            suggestion: suggestionText,
            reasoning: reasoningText,
            htmlString: reasoningText 
              ? `<div><p><strong>Contexto:</strong> ${reasoningText}</p><p><strong>Ação:</strong> ${suggestionText}</p></div>`
              : `<p>${suggestionText}</p>`
          };
          
          console.log('[WS] Created suggestion object:', {
            suggestion: suggestionText,
            reasoning: reasoningText,
            hasReasoning: !!reasoningText,
            hasSuggestion: !!suggestionText
          });
        }
        
        // Remove undefined values
        Object.keys(payload).forEach(key => {
          if (payload[key] === undefined) {
            delete payload[key];
          }
        });
        
        if (payload.ai_info) {
          Object.keys(payload.ai_info).forEach(key => {
            if (payload.ai_info[key] === undefined) {
              delete payload.ai_info[key];
            }
          });
          
          // Remove ai_info if it's empty
          if (Object.keys(payload.ai_info).length === 0) {
            delete payload.ai_info;
          }
        }
        
        console.log(`[WS] Sending payload to client:`, JSON.stringify(payload, null, 2));
        console.log(`[WS] Payload ai_info content:`, payload.ai_info);
        console.log(`[WS] Payload dialog_info content:`, payload.dialog_info);
        console.log(`[WS] Payload dialog_info utt_list length:`, payload.dialog_info?.utt_list?.length || 0);
        console.log(`[WS] Payload call_summary content:`, payload.call_summary);
        client.send(JSON.stringify(payload));
        sent = true;
        console.log(`[WS] ✅ Successfully sent agent assist data to client with token: "${normalizedToken}"`);
      }
    } else {
      console.log(`[WS] Client not open, readyState: ${client.readyState}`);
    }
  });

  if (!sent) {
    console.warn(`[WS] ⚠️ No client found with token: "${normalizedToken}"`);
    console.log(`[WS] Available tokens:`, Array.from(wss.clients).map(c => c.token).filter(Boolean));
  }

  return sent;
}

