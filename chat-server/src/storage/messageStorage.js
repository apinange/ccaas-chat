import db from "../database/db.js";

export const saveMessage = (messageData) => {
  const stmt = db.prepare(`
    INSERT INTO messages (message_id, conversation_id, user_id, flag, text, timestamp, files, client_name, phone_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const files = JSON.stringify({
    audio: messageData.audioFiles || [],
    images: messageData.imageFiles || [],
  });

  return stmt.run(
    messageData.message_id,
    messageData.conversation_id,
    messageData.user_id,
    messageData.flag,
    messageData.text || "",
    messageData.timestamp,
    files,
    messageData.client_name || null,
    messageData.phone_number || null,
  );
};

// Verificar se é uma nova conversa (primeira mensagem dessa conversation_id)
export const isNewConversation = (conversationId) => {
  const normalizedId = conversationId ? conversationId.trim() : conversationId;
  const stmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM messages 
    WHERE TRIM(conversation_id) = ?
  `);

  const result = stmt.get(normalizedId);
  return result.count === 0;
};

// Atualizar nome e telefone de uma conversa
export const updateConversationClientData = (
  conversationId,
  clientName,
  phoneNumber,
) => {
  const normalizedId = conversationId ? conversationId.trim() : conversationId;
  const stmt = db.prepare(`
    UPDATE messages 
    SET client_name = ?, phone_number = ? 
    WHERE TRIM(conversation_id) = ?
  `);

  return stmt.run(clientName, phoneNumber, normalizedId);
};

export const updateConversationClientName = (conversationId, clientName) => {
  const stmt = db.prepare(`
    UPDATE messages 
    SET client_name = ? 
    WHERE conversation_id = ?
  `);

  return stmt.run(clientName, conversationId);
};

export const getMessages = (conversationId) => {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    WHERE conversation_id = ? 
    ORDER BY created_at ASC
  `);

  return stmt.all(conversationId);
};

export const getAllMessages = () => {
  const stmt = db.prepare(`
    SELECT * FROM messages 
    ORDER BY created_at ASC
  `);

  return stmt.all();
};

export const getConversations = () => {
  const stmt = db.prepare(`
    SELECT 
      TRIM(m.conversation_id) as conversation_id,
      MAX(m.client_name) as client_name,
      MAX(m.phone_number) as phone_number,
      MAX(m.timestamp) as last_message_time,
      MAX(m.created_at) as last_created_at,
      COUNT(*) as message_count,
      (SELECT text FROM messages m2 
       WHERE TRIM(m2.conversation_id) = TRIM(m.conversation_id) 
       ORDER BY m2.created_at DESC LIMIT 1) as last_message_text
    FROM messages m
    GROUP BY TRIM(m.conversation_id)
    ORDER BY last_created_at DESC
  `);

  return stmt.all();
};

/**
 * Get user messages from the last message before escalation
 * @param {string} conversationId - Conversation ID
 * @returns {Array} Array of user messages after the last message before escalation
 */
export const getUserMessagesSinceLastBeforeEscalation = (conversationId) => {
  const normalizedId = conversationId ? conversationId.trim() : conversationId;

  // Get all messages in order to find the escalation point
  const allMessagesStmt = db.prepare(`
    SELECT * FROM messages
    WHERE TRIM(conversation_id) = ?
    ORDER BY created_at ASC
  `);

  const allMessages = allMessagesStmt.all(normalizedId);

  if (allMessages.length === 0) {
    return [];
  }

  // Find the first ESCALATION message
  const escalationIndex = allMessages.findIndex(
    (msg) => msg.flag === "ESCALATION",
  );

  if (escalationIndex === -1) {
    // No escalation found
    return [];
  }

  // Get messages before escalation
  const messagesBeforeEscalation = allMessages.slice(0, escalationIndex);

  if (messagesBeforeEscalation.length === 0) {
    // No messages before escalation
    return [];
  }

  // Find the last message before escalation (could be BOT, USER, or AGENT)
  const lastBeforeEscalation =
    messagesBeforeEscalation[messagesBeforeEscalation.length - 1];
  const lastBeforeEscalationTime = new Date(
    lastBeforeEscalation.created_at,
  ).getTime();

  // Get all USER messages that come after the last message before escalation
  // (all user messages from the point just before escalation)
  const userMessages = messagesBeforeEscalation.filter((msg) => {
    if (msg.flag !== "USER") return false;
    const msgTime = new Date(msg.created_at).getTime();
    // Include user messages that are after the last message before escalation
    // or if it's the same message (edge case)
    return msgTime >= lastBeforeEscalationTime;
  });

  // If we found user messages, return them. Otherwise return all user messages before escalation.
  return userMessages.length > 0
    ? userMessages
    : messagesBeforeEscalation.filter((msg) => msg.flag === "USER");
};

/**
 * Last consecutive USER messages from the end (no AGENT in between).
 * Used to choose script suggestion/sentiment for current step.
 * @param {string} conversationId - Conversation ID
 * @returns {Array} Array of message objects, chronological order
 */
export const getLastConsecutiveUserMessages = (conversationId) => {
  const messages = getMessages(conversationId);
  if (messages.length === 0) return [];
  const result = [];
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].flag !== "USER") break;
    result.unshift(messages[i]);
  }
  return result;
};

/**
 * Last N messages (any leg) for context e.g. despedida detection.
 * @param {string} conversationId - Conversation ID
 * @param {number} n - Max number of messages (default 5)
 * @returns {Array} Array of message objects, chronological order
 */
export const getRecentMessages = (conversationId, n = 5) => {
  const messages = getMessages(conversationId);
  if (messages.length === 0) return [];
  return messages.slice(-n);
};

/**
 * Check if conversation has an escalation message
 * @param {string} conversationId - Conversation ID
 * @returns {boolean} True if conversation has escalation
 */
export const hasEscalation = (conversationId) => {
  const normalizedId = conversationId ? conversationId.trim() : conversationId;
  const stmt = db.prepare(`
    SELECT COUNT(*) as count 
    FROM messages 
    WHERE TRIM(conversation_id) = ? AND flag = 'ESCALATION'
  `);

  const result = stmt.get(normalizedId);
  return result.count > 0;
};
