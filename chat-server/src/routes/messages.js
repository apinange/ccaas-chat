import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { validateMessagePayload, validateSendPayload } from '../middleware/validators.js';
import { processReceivedMessage, processSentMessage } from '../controllers/messageController.js';
import { getMessages, getAllMessages, updateConversationClientName, getConversations, saveMessage } from '../storage/messageStorage.js';
import { generateMessageId } from '../controllers/messageController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept audio files (ogg)
    if (file.fieldname.startsWith('audio_')) {
      if (file.mimetype === 'audio/ogg' || file.mimetype === 'audio/opus') {
        return cb(null, true);
      }
      return cb(new Error('Audio files must be audio/ogg or audio/opus'));
    }
    
    // Accept image files (png, jpeg)
    if (file.fieldname.startsWith('image_')) {
      if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
        return cb(null, true);
      }
      return cb(new Error('Image files must be image/png or image/jpeg'));
    }
    
    // Reject unknown field names
    cb(new Error('Invalid file field name'));
  }
});

// Health check endpoint
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Middleware to handle both JSON and multipart/form-data
const handleJsonOrMultipart = (req, res, next) => {
  const contentType = req.get('Content-Type') || '';
  
  // If it's JSON, parse it and continue
  if (contentType.includes('application/json')) {
    return express.json({ limit: '50mb' })(req, res, next);
  }
  
  // Otherwise, use multer for multipart/form-data
  return upload.any()(req, res, next);
};

// Endpoint to receive messages (BOT, USER, or ESCALATION)
// Accepts both JSON (with buffers/URLs) and multipart/form-data (with files)
router.post(
  '/',
  handleJsonOrMultipart,
  validateMessagePayload,
  processReceivedMessage
);

// Endpoint to send messages (AGENT)
router.post(
  '/send',
  upload.any(),
  validateSendPayload,
  processSentMessage
);

// Endpoint to receive messages with buffers (BOT or USER)
// Accepts JSON payload with Buffer arrays for audio and images
router.post('/with-buffers', express.json({ limit: '50mb' }), async (req, res) => {
  try {
    // Log completo do payload recebido
    console.log('=== PAYLOAD RECEIVED (POST /with-buffers) ===');
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    console.log('Body keys:', Object.keys(req.body));
    console.log('Body (without buffers):', JSON.stringify({
      flag: req.body.flag,
      timestamp: req.body.timestamp,
      message_id: req.body.message_id,
      conversation_id: req.body.conversation_id,
      user_id: req.body.user_id,
      text: req.body.text,
      audios_count: req.body.audios?.length || 0,
      images_count: req.body.images?.length || 0,
      audioMimetypes: req.body.audioMimetypes,
      imageMimetypes: req.body.imageMimetypes,
      audioFilenames: req.body.audioFilenames,
      imageFilenames: req.body.imageFilenames
    }, null, 2));
    if (req.body.audios && req.body.audios.length > 0) {
      console.log('Audios info:', req.body.audios.map((a, i) => ({
        index: i,
        type: typeof a,
        isBuffer: Buffer.isBuffer(a),
        isArrayBuffer: a instanceof ArrayBuffer,
        hasBuffer: a?.buffer instanceof ArrayBuffer,
        length: Buffer.isBuffer(a) ? a.length : (a?.length || 'unknown')
      })));
    }
    if (req.body.images && req.body.images.length > 0) {
      console.log('Images info:', req.body.images.map((img, i) => ({
        index: i,
        type: typeof img,
        isBuffer: Buffer.isBuffer(img),
        isArrayBuffer: img instanceof ArrayBuffer,
        hasBuffer: img?.buffer instanceof ArrayBuffer,
        length: Buffer.isBuffer(img) ? img.length : (img?.length || 'unknown')
      })));
    }
    console.log('Content-Type:', req.get('Content-Type'));
    console.log('=============================================');
    
    const { 
      flag, 
      timestamp, 
      message_id, 
      conversation_id, 
      user_id, 
      text,
      audios = [],
      images = [],
      audioMimetypes = [],
      imageMimetypes = [],
      audioFilenames = [],
      imageFilenames = []
    } = req.body;
    
    // Validar campos obrigatórios
    if (!flag || !conversation_id) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'flag and conversation_id are required' 
      });
    }
    
    // Validar flag
    if (!['BOT', 'USER'].includes(flag)) {
      return res.status(400).json({ 
        status: 'error', 
        message: "flag must be either 'BOT' or 'USER'" 
      });
    }
    
    const messageId = message_id || generateMessageId();
    const messageTimestamp = timestamp || new Date().toISOString();
    const normalizedConversationId = conversation_id.trim();
    
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    // Processar buffers de áudio
    const audioFiles = [];
    for (let i = 0; i < audios.length; i++) {
      let audioBuffer;
      
      // Suportar diferentes formatos de buffer
      if (Buffer.isBuffer(audios[i])) {
        audioBuffer = audios[i];
      } else if (audios[i] instanceof ArrayBuffer) {
        // Se for ArrayBuffer
        audioBuffer = Buffer.from(audios[i]);
      } else if (audios[i]?.buffer instanceof ArrayBuffer) {
        // Se for TypedArray (Uint8Array, etc.) com propriedade buffer
        audioBuffer = Buffer.from(audios[i].buffer, audios[i].byteOffset, audios[i].byteLength);
      } else if (typeof audios[i] === 'string') {
        // Se for base64 string
        audioBuffer = Buffer.from(audios[i], 'base64');
      } else if (audios[i]?.data) {
        // Se for objeto com propriedade data (base64 ou ArrayBuffer)
        if (audios[i].data instanceof ArrayBuffer) {
          audioBuffer = Buffer.from(audios[i].data);
        } else {
          audioBuffer = Buffer.from(audios[i].data, 'base64');
        }
      } else if (Array.isArray(audios[i])) {
        // Se for array de bytes
        audioBuffer = Buffer.from(audios[i]);
      } else {
        console.warn(`Skipping invalid audio buffer at index ${i}`, typeof audios[i], audios[i]?.constructor?.name);
        continue;
      }
      
      const mimetype = audioMimetypes[i] || 'audio/ogg';
      const originalname = audioFilenames[i] || `audio_${i + 1}.ogg`;
      const ext = mimetype === 'audio/opus' ? '.ogg' : '.ogg';
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const filename = `audio_${i + 1}-${uniqueSuffix}${ext}`;
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, audioBuffer);
      
      audioFiles.push({
        filename,
        path: filepath,
        originalname,
        mimetype,
        size: audioBuffer.length
      });
    }
    
    // Processar buffers de imagem
    const imageFiles = [];
    for (let i = 0; i < images.length; i++) {
      let imageBuffer;
      
      // Suportar diferentes formatos de buffer
      if (Buffer.isBuffer(images[i])) {
        imageBuffer = images[i];
      } else if (images[i] instanceof ArrayBuffer) {
        // Se for ArrayBuffer
        imageBuffer = Buffer.from(images[i]);
      } else if (images[i]?.buffer instanceof ArrayBuffer) {
        // Se for TypedArray (Uint8Array, etc.) com propriedade buffer
        imageBuffer = Buffer.from(images[i].buffer, images[i].byteOffset, images[i].byteLength);
      } else if (typeof images[i] === 'string') {
        // Se for base64 string
        imageBuffer = Buffer.from(images[i], 'base64');
      } else if (images[i]?.data) {
        // Se for objeto com propriedade data (base64 ou ArrayBuffer)
        if (images[i].data instanceof ArrayBuffer) {
          imageBuffer = Buffer.from(images[i].data);
        } else {
          imageBuffer = Buffer.from(images[i].data, 'base64');
        }
      } else if (Array.isArray(images[i])) {
        // Se for array de bytes
        imageBuffer = Buffer.from(images[i]);
      } else {
        console.warn(`Skipping invalid image buffer at index ${i}`, typeof images[i], images[i]?.constructor?.name);
        continue;
      }
      
      const mimetype = imageMimetypes[i] || 'image/png';
      const originalname = imageFilenames[i] || `image_${i + 1}.png`;
      const ext = mimetype === 'image/jpeg' ? '.jpg' : '.png';
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const filename = `image_${i + 1}-${uniqueSuffix}${ext}`;
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, imageBuffer);
      
      imageFiles.push({
        filename,
        path: filepath,
        originalname,
        mimetype,
        size: imageBuffer.length
      });
    }
    
    // Salvar no banco
    try {
      saveMessage({
        message_id: messageId,
        conversation_id: normalizedConversationId,
        user_id: user_id || null,
        flag,
        text: text || '',
        timestamp: messageTimestamp,
        client_name: null,
        audioFiles: audioFiles.map(f => ({
          filename: f.filename,
          path: f.path
        })),
        imageFiles: imageFiles.map(f => ({
          filename: f.filename,
          path: f.path
        }))
      });
      console.log('Message with buffers saved to database:', messageId);
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        console.log('Message already exists:', messageId);
      } else {
        console.error('Error saving message to database:', error);
        throw error;
      }
    }
    
    res.status(200).json({
      status: 'success',
      message: 'Message with buffers saved successfully',
      data: {
        message_id: messageId,
        conversation_id: normalizedConversationId,
        received_at: messageTimestamp,
        audio_files_count: audioFiles.length,
        image_files_count: imageFiles.length
      }
    });
  } catch (error) {
    console.error('Error processing message with buffers:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to process message',
      error: error.message
    });
  }
});

// Buscar mensagens de uma conversa
router.get('/conversations/:conversationId/messages', (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = getMessages(conversationId);
    
    res.json({
      status: 'success',
      data: messages.map(msg => ({
        ...msg,
        files: JSON.parse(msg.files || '{}')
      }))
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Buscar todas as mensagens de todas as conversas
router.get('/messages', (req, res) => {
  try {
    const messages = getAllMessages();
    
    res.json({
      status: 'success',
      data: messages.map(msg => ({
        ...msg,
        files: JSON.parse(msg.files || '{}')
      }))
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Atualizar nome do cliente de uma conversa
router.put('/conversations/:conversationId/client-name', (req, res) => {
  try {
    const { conversationId } = req.params;
    const { client_name } = req.body;
    
    if (!client_name) {
      return res.status(400).json({ 
        status: 'error', 
        message: 'client_name is required' 
      });
    }
    
    updateConversationClientName(conversationId, client_name);
    
    res.json({
      status: 'success',
      message: 'Client name updated successfully',
      data: {
        conversation_id: conversationId,
        client_name
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Debug endpoint: verificar client_name de uma conversa
router.get('/conversations/:conversationId/debug', (req, res) => {
  try {
    const { conversationId } = req.params;
    const messages = getMessages(conversationId);
    
    const clientNames = messages
      .map(msg => msg.client_name)
      .filter(name => name && name.trim() !== '');
    
    res.json({
      status: 'success',
      data: {
        conversation_id: conversationId,
        total_messages: messages.length,
        messages_with_client_name: clientNames.length,
        client_names: [...new Set(clientNames)],
        sample_messages: messages.slice(0, 3).map(msg => ({
          message_id: msg.message_id,
          client_name: msg.client_name,
          flag: msg.flag
        }))
      }
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Listar todas as conversas
router.get('/conversations', (req, res) => {
  try {
    const conversations = getConversations();
    
    res.json({
      status: 'success',
      data: conversations
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

export default router;

