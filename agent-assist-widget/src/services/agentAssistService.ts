import axios from 'axios';
import { _conf } from '../config';

const API_BASE_URL = _conf.CHAT_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || 'http://localhost:3006';

/**
 * Get messages from a conversation
 */
export const getConversationMessages = async (conversationId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/conversations/${encodeURIComponent(conversationId)}/messages`);
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
};

/**
 * Analyze escalation - get AI analysis
 */
export const analyzeEscalation = async (conversationId: string, previousAnalysis?: string | null) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent-assist/analyze-escalation`, {
      conversation_id: conversationId,
      previous_analysis: previousAnalysis || null
    });
    return response.data;
  } catch (error) {
    console.error('Error analyzing escalation:', error);
    throw error;
  }
};

/**
 * Summarize conversation
 */
export const summarizeConversation = async (conversationId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent-assist/summarize-conversation`, {
      conversation_id: conversationId
    });
    return response.data;
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    throw error;
  }
};

/**
 * Check if conversation has escalation
 */
export const checkHasEscalation = async (conversationId: string): Promise<boolean> => {
  try {
    const messages = await getConversationMessages(conversationId);
    if (messages.status === 'success' && messages.data) {
      return messages.data.some((msg: any) => msg.flag === 'ESCALATION');
    }
    return false;
  } catch (error) {
    console.error('Error checking escalation:', error);
    return false;
  }
};

/**
 * Get all conversation data for agent assist widget (CRM, user info, etc.)
 */
export const getConversationData = async (conversationId: string) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/agent-assist/conversation-data`, {
      params: {
        conversation_id: conversationId
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching conversation data:', error);
    throw error;
  }
};

/**
 * Update agent assist analysis - get complete analysis (sentiment, reasoning, suggestion, summary)
 */
export const updateAnalysis = async (conversationId: string) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/api/agent-assist/update-analysis`, {
      conversation_id: conversationId
    });
    return response.data;
  } catch (error) {
    console.error('Error updating analysis:', error);
    throw error;
  }
};

