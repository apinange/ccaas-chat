import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { randomUUID } from "crypto";
import {
  saveMessage,
  isNewConversation,
  updateConversationClientData,
  getMessages,
  hasEscalation,
  getLastConsecutiveUserMessages,
  getRecentMessages,
} from "../storage/messageStorage.js";
import { getRandomClientData } from "../utils/clientData.js";
import { sendAgentAssistData } from "../services/websocketServer.js";
import {
  selectFromScript,
  buildAgentAssistPayloadFromScript,
} from "../services/openaiService.js";
import { agentAssistScript } from "../config/agent-assist-script.js";

const AGENT_ASSIST_DEBOUNCE_MS = 3000;
const agentAssistDebounceTimers = new Map();

const BRIDGE_URL =
  process.env.BRIDGE_URL || "https://whatsapp-integration-6ofl.onrender.com";
const DEFAULT_PHONE_NUMBER =
  process.env.DEFAULT_PHONE_NUMBER || "5511983461478";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Generate a unique message ID
 */
export const generateMessageId = () => {
  return `msg_${Date.now()}_${randomUUID().substring(0, 8)}`;
};

/**
 * Send message to bridge agent endpoint
 * @param {string} text - Message text
 * @param {string} phoneNumber - Phone number (default from env or hardcoded)
 * @returns {Promise<Object|null>}
 */
const sendMessageToBridge = async (
  text,
  phoneNumber = DEFAULT_PHONE_NUMBER,
) => {
  if (!BRIDGE_URL) {
    console.log("[BRIDGE] BRIDGE_URL not configured, skipping bridge message");
    return null;
  }

  if (!text || !text.trim()) {
    console.log("[BRIDGE] Empty message text, skipping bridge message");
    return null;
  }

  const bridgeEndpoint = `${BRIDGE_URL}/agent/message`;
  const payload = {
    phoneNumber,
    text: text.trim(),
  };

  console.log("[BRIDGE] Attempting to send message to bridge:", {
    endpoint: bridgeEndpoint,
    phoneNumber,
    textLength: text.trim().length,
    timestamp: new Date().toISOString(),
  });

  try {
    const startTime = Date.now();
    const response = await fetch(bridgeEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const duration = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText };
      }

      console.error("[BRIDGE] Failed to send message:", {
        status: response.status,
        statusText: response.statusText,
        error: errorData,
        duration: `${duration}ms`,
        endpoint: bridgeEndpoint,
      });

      return {
        success: false,
        error: {
          status: response.status,
          statusText: response.statusText,
          message: errorData.message || "Failed to send message to bridge",
        },
        duration: `${duration}ms`,
      };
    }

    const responseData = await response.json().catch(() => ({}));

    console.log("[BRIDGE] Message sent successfully:", {
      status: response.status,
      duration: `${duration}ms`,
      response: responseData,
      endpoint: bridgeEndpoint,
    });

    return {
      success: true,
      response: responseData,
      duration: `${duration}ms`,
    };
  } catch (error) {
    console.error("[BRIDGE] Error sending message to bridge:", {
      error: error.message,
      stack: error.stack,
      endpoint: bridgeEndpoint,
      type: error.constructor.name,
    });

    return {
      success: false,
      error: {
        message: error.message,
        type: error.constructor.name,
      },
    };
  }
};

/**
 * Process image/audio buffers from JSON payload
 */
const processBuffers = (buffers, mimetypes, filenames, type, uploadDir) => {
  const processedFiles = [];

  for (let i = 0; i < buffers.length; i++) {
    let buffer;

    // Suportar diferentes formatos de buffer
    if (Buffer.isBuffer(buffers[i])) {
      buffer = buffers[i];
    } else if (buffers[i] instanceof ArrayBuffer) {
      buffer = Buffer.from(buffers[i]);
    } else if (buffers[i]?.buffer instanceof ArrayBuffer) {
      buffer = Buffer.from(
        buffers[i].buffer,
        buffers[i].byteOffset,
        buffers[i].byteLength,
      );
    } else if (typeof buffers[i] === "string") {
      // Se for base64 string
      buffer = Buffer.from(buffers[i], "base64");
    } else if (buffers[i]?.data) {
      if (buffers[i].data instanceof ArrayBuffer) {
        buffer = Buffer.from(buffers[i].data);
      } else {
        buffer = Buffer.from(buffers[i].data, "base64");
      }
    } else if (Array.isArray(buffers[i])) {
      buffer = Buffer.from(buffers[i]);
    } else {
      console.warn(
        `Skipping invalid ${type} buffer at index ${i}`,
        typeof buffers[i],
        buffers[i]?.constructor?.name,
      );
      continue;
    }

    const mimetype =
      mimetypes[i] || (type === "audio" ? "audio/ogg" : "image/png");
    const originalname =
      filenames[i] || `${type}_${i + 1}.${type === "audio" ? "ogg" : "png"}`;
    const ext =
      type === "audio" ? ".ogg" : mimetype === "image/jpeg" ? ".jpg" : ".png";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `${type}_${i + 1}-${uniqueSuffix}${ext}`;
    const filepath = path.join(uploadDir, filename);

    fs.writeFileSync(filepath, buffer);

    processedFiles.push({
      filename,
      path: filepath,
      originalname,
      mimetype,
      size: buffer.length,
    });
  }

  return processedFiles;
};

/**
 * Process received message (BOT, USER, or ESCALATION)
 * Supports both multipart/form-data (files) and JSON (buffers/URLs)
 */
export const processReceivedMessage = (req, res) => {
  try {
    // Log completo do payload recebido
    console.log("=== PAYLOAD RECEIVED (POST /) ===");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log(
      "Files:",
      req.files
        ? req.files.map((f) => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
            filename: f.filename,
          }))
        : "No files",
    );
    console.log("Content-Type:", req.get("Content-Type"));
    console.log("===================================");

    const {
      flag,
      timestamp,
      message_id,
      conversation_id,
      user_id,
      text,
      client_name,
      images = [],
      audios = [],
      imageMimetypes = [],
      audioMimetypes = [],
      imageFilenames = [],
      audioFilenames = [],
    } = req.body;

    // Normalizar imageUrl - aceitar tanto imageUrl quanto image_url
    const imageUrl = req.body.imageUrl || req.body.image_url;

    // Normalize conversation_id (remove whitespace and newlines)
    const normalizedConversationId = conversation_id
      ? conversation_id.trim()
      : conversation_id;

    // Verificar se é uma nova conversa (apenas para USER e BOT, não ESCALATION)
    let finalClientName = client_name || null;
    let finalPhoneNumber = null;

    if (
      normalizedConversationId &&
      flag !== "ESCALATION" &&
      isNewConversation(normalizedConversationId)
    ) {
      // Nova conversa: gerar nome e telefone aleatórios
      const { name, phone } = getRandomClientData();
      finalClientName = name;
      finalPhoneNumber = phone;
      console.log(
        `[NEW CONVERSATION] Assigned client: ${name} - ${phone} for conversation: ${normalizedConversationId}`,
      );
    }

    // Generate message_id automatically if not provided
    const messageId = message_id || generateMessageId();

    // Generate timestamp automatically if not provided
    const messageTimestamp = timestamp || new Date().toISOString();

    // Setup upload directory
    const uploadDir = process.env.UPLOAD_DIR || "./uploads";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Process files from multipart/form-data
    const files = req.files || [];
    let audioFiles = files
      .filter((f) => f.fieldname.startsWith("audio_"))
      .map((f) => ({
        filename: f.filename,
        path: f.path,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
      }));
    let imageFiles = files
      .filter((f) => f.fieldname.startsWith("image_"))
      .map((f) => ({
        filename: f.filename,
        path: f.path,
        originalname: f.originalname,
        mimetype: f.mimetype,
        size: f.size,
      }));

    // Process buffers from JSON payload (if any)
    if (Array.isArray(images) && images.length > 0) {
      const processedImages = processBuffers(
        images,
        imageMimetypes,
        imageFilenames,
        "image",
        uploadDir,
      );
      imageFiles = [...imageFiles, ...processedImages];
    }

    if (Array.isArray(audios) && audios.length > 0) {
      const processedAudios = processBuffers(
        audios,
        audioMimetypes,
        audioFilenames,
        "audio",
        uploadDir,
      );
      audioFiles = [...audioFiles, ...processedAudios];
    }

    // Process imageUrl if provided (external URL)
    if (imageUrl && typeof imageUrl === "string") {
      const urlFilename = imageUrl.split("/").pop() || "external-image";
      const urlExtension = urlFilename.includes(".")
        ? urlFilename.split(".").pop()
        : "jpg";
      imageFiles.push({
        url: imageUrl,
        filename: urlFilename,
        path: imageUrl,
        originalname: urlFilename,
        mimetype: urlExtension === "png" ? "image/png" : "image/jpeg",
        size: null,
        isExternal: true,
      });
      console.log(
        "[processReceivedMessage] Added external image URL:",
        imageUrl,
      );
    }

    // Build message object
    const message = {
      flag,
      timestamp: messageTimestamp,
      message_id: messageId,
      conversation_id: normalizedConversationId,
      user_id,
      text: text || "",
      files: {
        audio: audioFiles,
        images: imageFiles,
      },
    };

    // Salvar no banco
    try {
      // Log detalhado das imagens antes de salvar
      if (imageFiles.length > 0) {
        console.log("[processReceivedMessage] Saving message with images:", {
          messageId,
          conversationId: normalizedConversationId,
          imageCount: imageFiles.length,
          images: imageFiles.map((img) => ({
            url: img.url,
            path: img.path,
            filename: img.filename,
            isExternal: img.isExternal,
          })),
        });
      }

      saveMessage({
        message_id: messageId,
        conversation_id: normalizedConversationId,
        user_id,
        flag,
        text: text || "",
        timestamp: messageTimestamp,
        client_name: finalClientName,
        phone_number: finalPhoneNumber,
        audioFiles: audioFiles,
        imageFiles: imageFiles,
      });
      console.log("Message saved to database:", messageId);

      // Se é nova conversa e atribuímos nome/telefone, atualizar todas as mensagens da conversa
      if (finalClientName && finalPhoneNumber) {
        updateConversationClientData(
          normalizedConversationId,
          finalClientName,
          finalPhoneNumber,
        );
        console.log(
          `[NEW CONVERSATION] Updated all messages in conversation ${normalizedConversationId} with client data`,
        );
      }

      if (hasEscalation(normalizedConversationId)) {
        const allMessages = getMessages(normalizedConversationId);
        const dialogInfo = {
          utt_list: allMessages
            .filter((msg) => msg.flag !== "ESCALATION")
            .map((msg) => ({
              leg:
                msg.flag === "USER"
                  ? "USER"
                  : msg.flag === "AGENT"
                    ? "AGENT"
                    : "BOT",
              utt: msg.text || "",
              is_final: true,
              confidence: 1.0,
              words: [],
            })),
        };
        sendAgentAssistData(normalizedConversationId, {
          dialog_info: dialogInfo,
        });

        if (flag === "USER") {
          const existing = agentAssistDebounceTimers.get(
            normalizedConversationId,
          );
          if (existing) clearTimeout(existing);
          const timer = setTimeout(async () => {
            agentAssistDebounceTimers.delete(normalizedConversationId);
            try {
              const lastUserMessages = getLastConsecutiveUserMessages(
                normalizedConversationId,
              );
              const recentMessages = getRecentMessages(
                normalizedConversationId,
                5,
              );
              const { suggestionIndex, sentimentIndex, is_despedida } =
                await selectFromScript(
                  agentAssistScript,
                  lastUserMessages,
                  recentMessages,
                );
              const analysis = buildAgentAssistPayloadFromScript(
                agentAssistScript,
                suggestionIndex,
                sentimentIndex,
                is_despedida,
              );
              const wsPayload = {
                userSentiment: analysis.userSentiment,
                reasoning: analysis.reasoning,
                suggestion: analysis.suggestion,
              };
              if (analysis.summary) wsPayload.summary = analysis.summary;
              sendAgentAssistData(normalizedConversationId, wsPayload);
            } catch (err) {
              console.error(
                "[processReceivedMessage] Agent assist LLM update failed:",
                err,
              );
            }
          }, AGENT_ASSIST_DEBOUNCE_MS);
          agentAssistDebounceTimers.set(normalizedConversationId, timer);
        }
      }
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        console.log("Message already exists:", messageId);
      } else {
        console.error("Error saving message to database:", error);
      }
    }

    res.status(200).json({
      status: "success",
      message: "Message processed successfully",
      data: {
        message_id: messageId,
        conversation_id: normalizedConversationId,
        received_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error processing received message:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to process message",
    });
  }
};

/**
 * Process sent message (AGENT)
 */
export const processSentMessage = async (req, res) => {
  try {
    // Log completo do payload recebido
    console.log("=== PAYLOAD RECEIVED (POST /send) ===");
    console.log("Headers:", JSON.stringify(req.headers, null, 2));
    console.log("Body:", JSON.stringify(req.body, null, 2));
    console.log(
      "Files:",
      req.files
        ? req.files.map((f) => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size,
            filename: f.filename,
          }))
        : "No files",
    );
    console.log("Content-Type:", req.get("Content-Type"));
    console.log("=====================================");

    const {
      flag,
      timestamp,
      message_id,
      conversation_id,
      user_id,
      text,
      client_name,
    } = req.body;

    // Normalize conversation_id (remove whitespace and newlines)
    const normalizedConversationId = conversation_id
      ? conversation_id.trim()
      : conversation_id;

    // Generate message_id automatically if not provided
    const messageId = message_id || generateMessageId();

    // Generate timestamp automatically if not provided
    const messageTimestamp = timestamp || new Date().toISOString();

    // Extract files
    const files = req.files || [];
    const audioFiles = files.filter((f) => f.fieldname.startsWith("audio_"));
    const imageFiles = files.filter((f) => f.fieldname.startsWith("image_"));

    // Build message object
    const message = {
      flag,
      timestamp: messageTimestamp,
      message_id: messageId,
      conversation_id: normalizedConversationId,
      user_id,
      text: text || "",
      files: {
        audio: audioFiles.map((f) => ({
          fieldname: f.fieldname,
          filename: f.filename,
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          path: f.path,
        })),
        images: imageFiles.map((f) => ({
          fieldname: f.fieldname,
          filename: f.filename,
          originalname: f.originalname,
          mimetype: f.mimetype,
          size: f.size,
          path: f.path,
        })),
      },
    };

    // Salvar no banco
    try {
      saveMessage({
        message_id: messageId,
        conversation_id: normalizedConversationId,
        user_id,
        flag,
        text: text || "",
        timestamp: messageTimestamp,
        client_name: client_name || null,
        audioFiles: audioFiles.map((f) => ({
          filename: f.filename,
          path: f.path,
        })),
        imageFiles: imageFiles.map((f) => ({
          filename: f.filename,
          path: f.path,
        })),
      });
      console.log("Message saved to database:", messageId);

      // Não atualizar dialog_info aqui - isso é feito apenas quando há mensagens recebidas (BOT, USER, ESCALATION)
      // Mensagens AGENT não devem disparar atualizações de dialog_info
    } catch (error) {
      if (error.code === "SQLITE_CONSTRAINT_UNIQUE") {
        console.log("Message already exists:", messageId);
      } else {
        console.error("Error saving message to database:", error);
      }
    }

    // Send to bridge (non-blocking)
    let bridgeResult = null;
    if (text && text.trim()) {
      console.log(
        "[BRIDGE] Initiating bridge message send for message:",
        messageId,
      );
      bridgeResult = await sendMessageToBridge(text.trim()).catch((error) => {
        console.error("[BRIDGE] Unexpected error in bridge send:", error);
        return {
          success: false,
          error: { message: error.message },
        };
      });
    } else {
      console.log("[BRIDGE] No text content, skipping bridge send");
    }

    res.status(200).json({
      status: "success",
      message: "Message sent successfully",
      data: {
        message_id: messageId,
        conversation_id: normalizedConversationId,
        sent_at: new Date().toISOString(),
        bridge: bridgeResult
          ? {
              sent: bridgeResult.success,
              ...(bridgeResult.error && { error: bridgeResult.error }),
            }
          : null,
      },
    });
  } catch (error) {
    console.error("Error processing sent message:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send message",
    });
  }
};
