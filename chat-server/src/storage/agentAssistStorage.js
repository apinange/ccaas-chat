import db from '../database/db.js';

/**
 * Save or update agent assist analysis for a conversation
 * @param {string} conversationId - Conversation ID
 * @param {Object} analysisData - Analysis data
 * @param {Object} analysisData.userSentiment - { label: string, score: number }
 * @param {string} analysisData.reasoning - Reasoning text
 * @param {string} analysisData.suggestion - Suggestion text
 * @param {string} analysisData.summary - Summary text
 * @param {string} analysisData.escalationReasoning - Escalation reasoning (optional)
 * @param {string} analysisData.escalationAction - Escalation action (optional)
 * @returns {Object} Database result
 */
export const saveAgentAssistAnalysis = (conversationId, analysisData) => {
  const normalizedId = conversationId ? conversationId.trim() : conversationId;
  
  const stmt = db.prepare(`
    INSERT INTO agent_assist_analysis (
      conversation_id,
      user_sentiment_label,
      user_sentiment_score,
      reasoning,
      suggestion,
      summary,
      escalation_reasoning,
      escalation_action,
      updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    ON CONFLICT(conversation_id) DO UPDATE SET
      user_sentiment_label = excluded.user_sentiment_label,
      user_sentiment_score = excluded.user_sentiment_score,
      reasoning = excluded.reasoning,
      suggestion = excluded.suggestion,
      summary = excluded.summary,
      escalation_reasoning = excluded.escalation_reasoning,
      escalation_action = excluded.escalation_action,
      updated_at = CURRENT_TIMESTAMP
  `);

  return stmt.run(
    normalizedId,
    analysisData.userSentiment?.label || null,
    analysisData.userSentiment?.score || null,
    analysisData.reasoning || null,
    analysisData.suggestion || null,
    analysisData.summary || null,
    analysisData.escalationReasoning || null,
    analysisData.escalationAction || null
  );
};

/**
 * Get agent assist analysis for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Object|null} Analysis data or null if not found
 */
export const getAgentAssistAnalysis = (conversationId) => {
  const normalizedId = conversationId ? conversationId.trim() : conversationId;
  
  const stmt = db.prepare(`
    SELECT 
      conversation_id,
      user_sentiment_label,
      user_sentiment_score,
      reasoning,
      suggestion,
      summary,
      escalation_reasoning,
      escalation_action,
      created_at,
      updated_at
    FROM agent_assist_analysis
    WHERE conversation_id = ?
  `);
  
  const result = stmt.get(normalizedId);
  
  if (!result) {
    return null;
  }
  
  // Clean up old "gotcha" references from cached data
  const cleanText = (text) => {
    if (!text) return text;
    return text
      .replace(/Possível "gotcha":/gi, '')
      .replace(/Possível "gotchas":/gi, '')
      .replace(/Possíveis "gotchas"/gi, 'Possíveis pontos de atenção')
      .replace(/"gotcha"/gi, '')
      .replace(/"gotchas"/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  return {
    conversation_id: result.conversation_id,
    userSentiment: result.user_sentiment_label ? {
      label: result.user_sentiment_label,
      score: result.user_sentiment_score
    } : null,
    reasoning: cleanText(result.reasoning),
    suggestion: cleanText(result.suggestion),
    summary: cleanText(result.summary),
    escalationReasoning: cleanText(result.escalation_reasoning),
    escalationAction: cleanText(result.escalation_action),
    created_at: result.created_at,
    updated_at: result.updated_at
  };
};

/**
 * Check if analysis exists for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {boolean} True if analysis exists
 */
export const hasAgentAssistAnalysis = (conversationId) => {
  const normalizedId = conversationId ? conversationId.trim() : conversationId;
  
  const stmt = db.prepare(`
    SELECT COUNT(*) as count
    FROM agent_assist_analysis
    WHERE conversation_id = ?
  `);
  
  const result = stmt.get(normalizedId);
  return result.count > 0;
};

/**
 * Delete agent assist analysis for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Object} Database result
 */
export const deleteAgentAssistAnalysis = (conversationId) => {
  const normalizedId = conversationId ? conversationId.trim() : conversationId;
  
  const stmt = db.prepare(`
    DELETE FROM agent_assist_analysis
    WHERE conversation_id = ?
  `);
  
  return stmt.run(normalizedId);
};

/**
 * Clean up old "gotcha" references from all analysis data in database
 * This is a one-time migration function
 * @returns {Object} Database result with count of updated records
 */
export const cleanupGotchaReferences = () => {
  const cleanText = (text) => {
    if (!text) return text;
    return text
      .replace(/Possível "gotcha":/gi, '')
      .replace(/Possível "gotchas":/gi, '')
      .replace(/Possíveis "gotchas"/gi, 'Possíveis pontos de atenção')
      .replace(/"gotcha"/gi, '')
      .replace(/"gotchas"/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
  };
  
  // Get all records
  const getAllStmt = db.prepare(`
    SELECT conversation_id, reasoning, suggestion, summary, escalation_reasoning, escalation_action
    FROM agent_assist_analysis
  `);
  
  const allRecords = getAllStmt.all();
  let updatedCount = 0;
  
  // Update each record if it contains "gotcha"
  const updateStmt = db.prepare(`
    UPDATE agent_assist_analysis
    SET reasoning = ?,
        suggestion = ?,
        summary = ?,
        escalation_reasoning = ?,
        escalation_action = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE conversation_id = ?
  `);
  
  for (const record of allRecords) {
    const cleanedReasoning = cleanText(record.reasoning);
    const cleanedSuggestion = cleanText(record.suggestion);
    const cleanedSummary = cleanText(record.summary);
    const cleanedEscalationReasoning = cleanText(record.escalation_reasoning);
    const cleanedEscalationAction = cleanText(record.escalation_action);
    
    // Check if any field was changed
    if (
      cleanedReasoning !== record.reasoning ||
      cleanedSuggestion !== record.suggestion ||
      cleanedSummary !== record.summary ||
      cleanedEscalationReasoning !== record.escalation_reasoning ||
      cleanedEscalationAction !== record.escalation_action
    ) {
      updateStmt.run(
        cleanedReasoning,
        cleanedSuggestion,
        cleanedSummary,
        cleanedEscalationReasoning,
        cleanedEscalationAction,
        record.conversation_id
      );
      updatedCount++;
    }
  }
  
  return { updated: updatedCount, total: allRecords.length };
};

