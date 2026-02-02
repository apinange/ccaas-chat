import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { sendMessage, receiveMessage, getMessages, getAllMessages } from '../../services/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';

// Helper function to construct image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return undefined;
  
  // Handle object input - extract filename or path
  let imagePathStr = imagePath;
  if (typeof imagePath === 'object' && imagePath !== null) {
    imagePathStr = imagePath.filename || imagePath.path || imagePath.name || imagePath.url || '';
    if (!imagePathStr) {
      return undefined;
    }
  }
  
  // Ensure it's a string
  if (typeof imagePathStr !== 'string') {
    return undefined;
  }
  
  // If it's already a full URL, return as is
  if (imagePathStr.startsWith('http://') || imagePathStr.startsWith('https://') || imagePathStr.startsWith('data:')) {
    return imagePathStr;
  }
  
  // Extract just the filename if path contains directory separators
  const filename = imagePathStr.includes('/') ? imagePathStr.split('/').pop() : imagePathStr;
  
  // Construct URL to serve from backend
  const url = `${API_BASE_URL}/uploads/${filename}`;
  return url;
};

// Helper function to construct audio URL
const getAudioUrl = (audioPath) => {
  if (!audioPath) return undefined;
  
  // If it's already a full URL, return as is
  if (audioPath.startsWith('http://') || audioPath.startsWith('https://') || audioPath.startsWith('data:')) {
    return audioPath;
  }
  
  // Extract just the filename if path contains directory separators
  const filename = audioPath.includes('/') ? audioPath.split('/').pop() : audioPath;
  
  // Construct URL to serve from backend
  return `${API_BASE_URL}/uploads/${filename}`;
};

// Async thunk to send message
export const sendMessageAsync = createAsyncThunk(
  'chat/sendMessage',
  async ({ messageData, audioFiles = [], imageFiles = [] }, { rejectWithValue }) => {
    try {
      const response = await sendMessage(messageData, audioFiles, imageFiles);
      return {
        ...messageData,
        status: 'sent',
        sent_at: response.data?.sent_at || new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to receive message (typically from external service)
export const receiveMessageAsync = createAsyncThunk(
  'chat/receiveMessage',
  async ({ messageData, audioFiles = [], imageFiles = [] }, { rejectWithValue }) => {
    try {
      const response = await receiveMessage(messageData, audioFiles, imageFiles);
      return {
        ...messageData,
        audioFiles: audioFiles.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
        imageFiles: imageFiles.map(f => ({
          name: f.name,
          type: f.type,
          size: f.size,
        })),
        received_at: response.data?.received_at || new Date().toISOString(),
      };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch messages from server (by conversation)
export const fetchMessagesAsync = createAsyncThunk(
  'chat/fetchMessages',
  async (conversationId, { rejectWithValue }) => {
    try {
      const response = await getMessages(conversationId);
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk to fetch all messages from all conversations
export const fetchAllMessagesAsync = createAsyncThunk(
  'chat/fetchAllMessages',
  async (_, { rejectWithValue }) => {
    try {
      const response = await getAllMessages();
      return response.data || [];
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Helper function to convert API message to chat format
const convertToChatMessage = (apiMessage) => {
  // AGENT e BOT vão para direita (outgoing), USER vai para esquerda (incoming)
  const isIncoming = apiMessage.flag === 'USER';
  
  // Se vier do banco, files pode ser um objeto JSON parseado ou string
  const files = typeof apiMessage.files === 'string' 
    ? JSON.parse(apiMessage.files || '{}')
    : (apiMessage.files || {});
  
  const imageFiles = files.images || apiMessage.imageFiles || [];
  const audioFiles = files.audio || apiMessage.audioFiles || [];
  
  // Determine message type
  let type = 'msg';
  let subtype = null;
  
  if (imageFiles.length > 0) {
    subtype = 'img';
  } else if (audioFiles.length > 0) {
    subtype = 'audio';
  }
  
  // Garantir que client_name seja uma string ou null
  const clientName = apiMessage.client_name && apiMessage.client_name.trim() !== '' 
    ? apiMessage.client_name 
    : null;
  
  // Garantir que phone_number seja uma string ou null
  const phoneNumber = apiMessage.phone_number && apiMessage.phone_number.trim() !== '' 
    ? apiMessage.phone_number 
    : null;
  
  // Normalizar e validar flag
  let normalizedFlag = apiMessage.flag;
  if (normalizedFlag && typeof normalizedFlag === 'string') {
    normalizedFlag = normalizedFlag.trim().toUpperCase();
    // Garantir que flag seja válido (AGENT, USER, BOT, ou ESCALATION)
    if (!['AGENT', 'USER', 'BOT', 'ESCALATION'].includes(normalizedFlag)) {
      // Se flag inválido, tentar inferir do contexto ou usar padrão
      normalizedFlag = isIncoming ? 'USER' : 'AGENT';
    }
  } else {
    // Se flag não existe ou é inválido, inferir do contexto
    normalizedFlag = isIncoming ? 'USER' : 'AGENT';
  }
  
  return {
    type,
    subtype,
    message: apiMessage.text || '',
    incoming: isIncoming,
    outgoing: !isIncoming,
    flag: normalizedFlag, // Store normalized flag
    timestamp: apiMessage.timestamp,
    message_id: apiMessage.message_id,
    conversation_id: apiMessage.conversation_id,
    user_id: apiMessage.user_id,
    client_name: clientName,
    phone_number: phoneNumber,
    // For images - construct full URL for backward compatibility
    img: imageFiles.length > 0 
      ? getImageUrl(imageFiles[0].filename || imageFiles[0].name || imageFiles[0].path)
      : undefined,
    // Store all image files with their metadata for display
    imageFiles: imageFiles.map((img, index) => {
      // Check if this is an external URL (has url field or path is a URL)
      const isExternalUrl = img.url || (img.path && (img.path.startsWith('http://') || img.path.startsWith('https://')));
      const externalUrl = img.url || (isExternalUrl ? img.path : null);
      
      // Extract filename - prioritize filename, then name, then path, then extract from path
      let filename = img.filename || img.name;
      if (!filename && img.path && !isExternalUrl) {
        // Extract filename from path if path is provided (but not if it's a URL)
        filename = img.path.includes('/') ? img.path.split('/').pop() : img.path;
      }
      if (!filename && externalUrl) {
        // Extract filename from external URL
        filename = externalUrl.split('/').pop() || 'external-image';
      }
      if (!filename && typeof img === 'string') {
        // If img itself is a string (filename), use it
        filename = img;
      }
      
      // Extract path - prioritize path, then construct from filename
      let filePath = img.path;
      if (!filePath && filename && !isExternalUrl) {
        filePath = filename; // Use filename as path if path not provided (but not for URLs)
      }
      if (isExternalUrl && externalUrl) {
        filePath = externalUrl; // Use external URL as path
      }
      
      const mapped = {
        filename: filename || 'unknown',
        path: filePath || filename || 'unknown',
        url: externalUrl || undefined, // PRESERVE EXTERNAL URL
        originalname: img.originalname || filename || 'unknown',
        mimetype: img.mimetype,
        size: img.size,
        isExternal: !!isExternalUrl
      };
      return mapped;
    }),
    // For audio - construct full URL and store metadata
    audio: audioFiles.length > 0 
      ? getAudioUrl(audioFiles[0].filename || audioFiles[0].name || audioFiles[0].path)
      : undefined,
    audioFiles: audioFiles.map(audio => ({
      filename: audio.filename || audio.name || audio.path,
      path: audio.path || audio.filename || audio.name,
      originalname: audio.originalname,
      mimetype: audio.mimetype,
      size: audio.size,
      url: getAudioUrl(audio.filename || audio.name || audio.path)
    })),
    // Transcription if available (from text field or separate transcription field)
    transcription: apiMessage.transcription || apiMessage.text || '',
  };
};

const initialState = {
  messages: [], // Messages for current conversation
  conversations: [], // List of conversations
  currentConversationId: null,
  lastMessageId: null, // Para evitar duplicatas no polling
  loading: false,
  sending: false,
  polling: false,
  error: null,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    // Add message directly (for real-time updates)
    addMessage: (state, action) => {
      const chatMessage = convertToChatMessage(action.payload);
      
      // Normalizar message_id para comparação
      const normalizeMessageId = (id) => {
        if (!id) return null;
        return String(id).trim().toUpperCase();
      };
      
      const normalizedNewId = normalizeMessageId(chatMessage.message_id);
      
      // Verificar se a mensagem já existe antes de adicionar
      const existingIndex = state.messages.findIndex(m => {
        const normalizedExistingId = normalizeMessageId(m.message_id);
        return normalizedExistingId === normalizedNewId;
      });
      
      if (existingIndex === -1 && normalizedNewId) {
        state.messages.push(chatMessage);
        // Ordenar por timestamp (mais antigas primeiro)
        state.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
      }
    },
    
    // Set current conversation
    setCurrentConversation: (state, action) => {
      state.currentConversationId = action.payload;
    },
    
    // Clear messages
    clearMessages: (state) => {
      state.messages = [];
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
    },
    
    // Set last message ID
    setLastMessageId: (state, action) => {
      state.lastMessageId = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Send message
      .addCase(sendMessageAsync.pending, (state, action) => {
        state.sending = true;
        state.error = null;
        
        // Adicionar mensagem otimisticamente para melhor UX
        // Será substituída/atualizada quando o polling buscar do backend
        const messageData = action.meta.arg.messageData;
        
        // Normalizar message_id para comparação
        const normalizeMessageId = (id) => {
          if (!id) return null;
          return String(id).trim().toUpperCase();
        };
        
        const normalizedId = normalizeMessageId(messageData.message_id);
        
        // Verificar se já existe (evitar duplicatas)
        const existingIndex = state.messages.findIndex(m => {
          const normalizedExistingId = normalizeMessageId(m.message_id);
          return normalizedExistingId === normalizedId;
        });
        
        if (normalizedId) {
          // Se já existe uma mensagem com esse ID, remover primeiro (pode ser pending ou duplicata)
          if (existingIndex !== -1) {
            state.messages.splice(existingIndex, 1);
          }
          
          // Criar mensagem otimista no formato correto
          const optimisticMessage = {
            type: 'msg',
            subtype: null,
            message: messageData.text || '',
            incoming: false, // AGENT messages são outgoing
            outgoing: true,
            flag: 'AGENT',
            timestamp: messageData.timestamp,
            message_id: messageData.message_id,
            conversation_id: messageData.conversation_id,
            user_id: messageData.user_id,
            client_name: messageData.client_name || null,
            phone_number: null,
            status: 'pending', // Marcar como pending para ser substituída pelo backend
            imageFiles: [],
            audioFiles: [],
            transcription: messageData.text || ''
          };
          
          state.messages.push(optimisticMessage);
          // Ordenar por timestamp
          state.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
      })
      .addCase(sendMessageAsync.fulfilled, (state) => {
        state.sending = false;
        // Mensagem já foi adicionada otimisticamente
        // O polling vai buscar e atualizar/substituir com a versão do backend
      })
      .addCase(sendMessageAsync.rejected, (state, action) => {
        state.sending = false;
        state.error = action.payload;
      })
      // Receive message
      .addCase(receiveMessageAsync.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(receiveMessageAsync.fulfilled, (state, action) => {
        state.loading = false;
        const chatMessage = convertToChatMessage(action.payload);
        
        // Normalizar message_id para comparação
        const normalizeMessageId = (id) => {
          if (!id) return null;
          return String(id).trim().toUpperCase();
        };
        
        const normalizedNewId = normalizeMessageId(chatMessage.message_id);
        
        // Verificar se a mensagem já existe antes de adicionar
        const existingIndex = state.messages.findIndex(m => {
          const normalizedExistingId = normalizeMessageId(m.message_id);
          return normalizedExistingId === normalizedNewId;
        });
        
        if (existingIndex === -1 && normalizedNewId) {
          state.messages.push(chatMessage);
          // Ordenar por timestamp (mais antigas primeiro)
          state.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        }
      })
      .addCase(receiveMessageAsync.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch messages
      .addCase(fetchMessagesAsync.pending, (state) => {
        state.polling = true;
        state.error = null;
      })
      .addCase(fetchMessagesAsync.fulfilled, (state, action) => {
        state.polling = false;
        
        // Converter mensagens do banco para formato do chat
        const newMessages = action.payload.map(msg => convertToChatMessage(msg));
        
        // Normalizar message_id para comparação
        const normalizeMessageId = (id) => {
          if (!id) return null;
          return String(id).trim().toUpperCase();
        };
        
        // Evitar duplicatas: criar um Map usando message_id normalizado como chave
        const messagesMap = new Map();
        
        // Primeiro, adicionar todas as mensagens existentes (exceto as pending)
        // Isso garante que mensagens pending sejam removidas e substituídas pelas do backend
        state.messages.forEach(msg => {
          const normalizedId = normalizeMessageId(msg.message_id);
          if (normalizedId && msg.status !== 'pending') {
            // Verificar se esta mensagem não está nas novas mensagens do backend
            // Se estiver, será substituída abaixo
            const existsInNew = newMessages.some(newMsg => {
              const newNormalizedId = normalizeMessageId(newMsg.message_id);
              return newNormalizedId === normalizedId;
            });
            if (!existsInNew) {
              messagesMap.set(normalizedId, msg);
            }
          }
        });
        
        // Depois, adicionar/atualizar com as novas mensagens do backend
        // Isso SEMPRE substitui mensagens existentes (incluindo pending) pela versão real do backend
        newMessages.forEach(msg => {
          const normalizedId = normalizeMessageId(msg.message_id);
          if (normalizedId) {
            // Sempre substituir - mensagens do backend têm prioridade
            messagesMap.set(normalizedId, msg);
          }
        });
        
        // Converter Map de volta para array e ordenar
        const uniqueMessages = Array.from(messagesMap.values());
        uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Verificação final: garantir que não há duplicatas (safety check)
        const finalMessages = [];
        const seenIds = new Set();
        uniqueMessages.forEach(msg => {
          const normalizedId = normalizeMessageId(msg.message_id);
          if (normalizedId && !seenIds.has(normalizedId)) {
            seenIds.add(normalizedId);
            finalMessages.push(msg);
          }
        });
        
        // Atualizar estado
        state.messages = finalMessages;
        
        // Atualizar lastMessageId (última mensagem após ordenação crescente)
        if (uniqueMessages.length > 0) {
          const lastMsg = uniqueMessages[uniqueMessages.length - 1];
          state.lastMessageId = lastMsg.message_id;
        }
      })
      .addCase(fetchMessagesAsync.rejected, (state, action) => {
        state.polling = false;
        // Não definir error para não interromper o polling
        console.error('Error fetching messages:', action.payload);
      })
      // Fetch all messages
      .addCase(fetchAllMessagesAsync.pending, (state) => {
        state.polling = true;
        state.error = null;
      })
      .addCase(fetchAllMessagesAsync.fulfilled, (state, action) => {
        state.polling = false;
        
        // Converter mensagens do banco para formato do chat
        const newMessages = action.payload.map(msg => convertToChatMessage(msg));
        
        // Normalizar message_id para comparação (remover espaços, converter para string)
        const normalizeMessageId = (id) => {
          if (!id) return null;
          return String(id).trim().toUpperCase();
        };
        
        // Se não há mensagens no estado, substituir completamente (caso inicial)
        if (state.messages.length === 0 && newMessages.length > 0) {
          state.messages = newMessages;
          state.messages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
          const lastMsg = state.messages[state.messages.length - 1];
          state.lastMessageId = lastMsg.message_id;
          return;
        }
        
        // Evitar duplicatas: criar um Map usando message_id normalizado como chave
        const messagesMap = new Map();
        
        // Primeiro, adicionar todas as mensagens existentes (exceto as pending)
        // Isso garante que mensagens pending sejam removidas e substituídas pelas do backend
        state.messages.forEach(msg => {
          const normalizedId = normalizeMessageId(msg.message_id);
          if (normalizedId && msg.status !== 'pending') {
            // Verificar se esta mensagem não está nas novas mensagens do backend
            // Se estiver, será substituída abaixo
            const existsInNew = newMessages.some(newMsg => {
              const newNormalizedId = normalizeMessageId(newMsg.message_id);
              return newNormalizedId === normalizedId;
            });
            if (!existsInNew) {
              messagesMap.set(normalizedId, msg);
            }
          }
        });
        
        // Depois, adicionar/atualizar com as novas mensagens do backend
        // Isso SEMPRE substitui mensagens existentes (incluindo pending) pela versão real do backend
        newMessages.forEach(msg => {
          const normalizedId = normalizeMessageId(msg.message_id);
          if (normalizedId) {
            // Sempre substituir - mensagens do backend têm prioridade
            messagesMap.set(normalizedId, msg);
          }
        });
        
        // Converter Map de volta para array e ordenar
        const uniqueMessages = Array.from(messagesMap.values());
        uniqueMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
        
        // Verificação final: garantir que não há duplicatas (safety check)
        const finalMessages = [];
        const seenIds = new Set();
        uniqueMessages.forEach(msg => {
          const normalizedId = normalizeMessageId(msg.message_id);
          if (normalizedId && !seenIds.has(normalizedId)) {
            seenIds.add(normalizedId);
            finalMessages.push(msg);
          }
        });
        
        // Atualizar estado
        state.messages = finalMessages;
        
        // Atualizar lastMessageId (última mensagem após ordenação crescente)
        if (uniqueMessages.length > 0) {
          const lastMsg = uniqueMessages[uniqueMessages.length - 1];
          state.lastMessageId = lastMsg.message_id;
        }
      })
      .addCase(fetchAllMessagesAsync.rejected, (state, action) => {
        state.polling = false;
        // Não definir error para não interromper o polling
        console.error('Error fetching all messages:', action.payload);
      });
  },
});

export const { addMessage, setCurrentConversation, clearMessages, clearError, setLastMessageId } = chatSlice.actions;
export default chatSlice.reducer;

