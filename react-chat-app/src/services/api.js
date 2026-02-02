const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';

/**
 * Send message to server (AGENT flag)
 * @param {Object} messageData - Message data
 * @param {File[]} audioFiles - Optional audio files
 * @param {File[]} imageFiles - Optional image files
 * @returns {Promise<Object>}
 */
export const sendMessage = async (messageData, audioFiles = [], imageFiles = []) => {
  const formData = new FormData();
  
  // Required fields
  formData.append('flag', 'AGENT');
  formData.append('timestamp', messageData.timestamp || new Date().toISOString());
  // message_id is optional - server will generate if not provided
  if (messageData.message_id) {
    formData.append('message_id', messageData.message_id);
  }
  formData.append('conversation_id', messageData.conversation_id);
  formData.append('user_id', messageData.user_id);
  formData.append('text', messageData.text || '');
  
  // Append client_name if provided
  if (messageData.client_name) {
    formData.append('client_name', messageData.client_name);
  }
  
  // Append audio files
  audioFiles.forEach((file, index) => {
    formData.append(`audio_${index + 1}`, file);
  });
  
  // Append image files
  imageFiles.forEach((file, index) => {
    formData.append(`image_${index + 1}`, file);
  });
  
  const response = await fetch(`${API_BASE_URL}/send`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to send message');
  }
  
  return response.json();
};

/**
 * Receive message from server (BOT or USER)
 * This is typically called by external services, but can be used for testing
 * @param {Object} messageData - Message data
 * @param {File[]} audioFiles - Optional audio files
 * @param {File[]} imageFiles - Optional image files
 * @returns {Promise<Object>}
 */
export const receiveMessage = async (messageData, audioFiles = [], imageFiles = []) => {
  const formData = new FormData();
  
  // Required fields
  formData.append('flag', messageData.flag); // BOT or USER
  formData.append('timestamp', messageData.timestamp || new Date().toISOString());
  formData.append('message_id', messageData.message_id);
  formData.append('conversation_id', messageData.conversation_id);
  formData.append('user_id', messageData.user_id);
  formData.append('text', messageData.text || '');
  
  // Append client_name if provided
  if (messageData.client_name) {
    formData.append('client_name', messageData.client_name);
  }
  
  // Append audio files
  audioFiles.forEach((file, index) => {
    formData.append(`audio_${index + 1}`, file);
  });
  
  // Append image files
  imageFiles.forEach((file, index) => {
    formData.append(`image_${index + 1}`, file);
  });
  
  const response = await fetch(`${API_BASE_URL}/`, {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to receive message');
  }
  
  return response.json();
};

/**
 * Get messages from a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Promise<Object>}
 */
export const getMessages = async (conversationId) => {
  const response = await fetch(`${API_BASE_URL}/conversations/${conversationId}/messages`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch messages');
  }
  
  return response.json();
};

/**
 * Get all messages from all conversations
 * @returns {Promise<Object>}
 */
export const getAllMessages = async () => {
  const response = await fetch(`${API_BASE_URL}/messages`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to fetch messages');
  }
  
  return response.json();
};

/**
 * Get all conversations
 * @returns {Promise<Object>}
 */
export const getConversations = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/conversations`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch conversations' }));
      throw new Error(error.message || 'Failed to fetch conversations');
    }
    
    return response.json();
  } catch (error) {
    // Handle network errors (connection refused, etc.)
    if (error instanceof TypeError && (error.message.includes('fetch') || error.message.includes('Failed to fetch'))) {
      // Only log once to avoid console spam
      if (!window.__serverConnectionErrorLogged) {
        console.warn(`[API] Server connection error: Server may not be running at ${API_BASE_URL}`);
        console.warn(`[API] To start the server, run: cd chat-server && npm run dev`);
        window.__serverConnectionErrorLogged = true;
      }
      throw new Error(`Não foi possível conectar ao servidor. Verifique se o servidor está rodando em ${API_BASE_URL}`);
    }
    throw error;
  }
};

/**
 * Health check
 * @returns {Promise<Object>}
 */
export const healthCheck = async () => {
  const response = await fetch(`${API_BASE_URL}/health`);
  if (!response.ok) {
    throw new Error('Server is not healthy');
  }
  return response.json();
};

/**
 * Analyze escalation - get AI analysis of user messages since last before escalation
 * @param {string} conversationId - Conversation ID
 * @param {string|null} previousAnalysis - Previous analysis text (optional)
 * @param {boolean} forceRefresh - Force refresh even if cached data exists
 * @returns {Promise<Object>} { explanation, suggestion }
 */
export const analyzeEscalation = async (conversationId, previousAnalysis = null, forceRefresh = false) => {
  const response = await fetch(`${API_BASE_URL}/api/agent-assist/analyze-escalation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      previous_analysis: previousAnalysis,
      force_refresh: forceRefresh
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to analyze escalation');
  }
  
  return response.json();
};

/**
 * Summarize conversation - get AI summary of complete conversation
 * @param {string} conversationId - Conversation ID
 * @param {boolean} forceRefresh - Force refresh even if cached data exists
 * @returns {Promise<Object>} { summary }
 */
export const summarizeConversation = async (conversationId, forceRefresh = false) => {
  const response = await fetch(`${API_BASE_URL}/api/agent-assist/summarize-conversation`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      force_refresh: forceRefresh
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to summarize conversation');
  }
  
  return response.json();
};

/**
 * Update agent assist analysis - get complete analysis (sentiment, reasoning, suggestion, summary)
 * @param {string} conversationId - Conversation ID
 * @param {boolean} forceRefresh - Force refresh even if cached data exists
 * @returns {Promise<Object>} { userSentiment, reasoning, suggestion, summary }
 */
export const updateAnalysis = async (conversationId, forceRefresh = false) => {
  const response = await fetch(`${API_BASE_URL}/api/agent-assist/update-analysis`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      conversation_id: conversationId,
      force_refresh: forceRefresh
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to update analysis');
  }
  
  return response.json();
};


