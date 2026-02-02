# Chat Server API

REST API server for chat application built with Node.js and Express.

## Features

- Receive messages from BOT or USER
- Send messages as AGENT
- File upload support (audio and images)
- Health check endpoint
- Input validation
- Error handling
- WebSocket server for Agent Assist Widget (mock data)

## Installation

```bash
cd chat-server
npm install
```

## Configuration

Create a `.env` file in the root directory:

```env
PORT=3006
NODE_ENV=development
UPLOAD_DIR=./uploads
```

## Running the Server

```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3006` (or the port specified in `.env`).

The WebSocket server for Agent Assist Widget runs on the same port as the HTTP server at `ws://localhost:3006/frame`.

## API Endpoints

### Health Check

**GET** `/health`

Returns server status.

**Response:**
```json
{
  "status": "ok"
}
```

### Receive Message

**POST** `/`

Receives a message from BOT or USER.

**Content-Type:** `multipart/form-data`

**Required Fields:**
- `flag`: `"BOT"` or `"USER"`
- `timestamp`: ISO 8601 format (e.g., `"2025-12-30T15:51:14.444Z"`)
- `message_id`: Unique message identifier
- `conversation_id`: UUID of the conversation
- `user_id`: User ID (numeric string)
- `text`: Message text (can be empty)

**Optional Fields:**
- `audio_1`, `audio_2`, ...: Audio files (`.ogg` format)
- `image_1`, `image_2`, ...: Image files (`.png` or `.jpeg`)

**Example Request:**
```bash
curl -X POST http://localhost:8000/ \
  -F "flag=BOT" \
  -F "timestamp=2025-12-30T15:51:14.444Z" \
  -F "message_id=3EB0690530A63FA5605708" \
  -F "conversation_id=17adfdec-e172-4394-a968-aab4119539b0" \
  -F "user_id=558184475278" \
  -F "text=Hello, how can I help you?"
```

**Response:**
```json
{
  "status": "success",
  "message": "Multipart data logged successfully",
  "data": {
    "message_id": "3EB0690530A63FA5605708",
    "conversation_id": "17adfdec-e172-4394-a968-aab4119539b0",
    "received_at": "2025-12-30T15:51:14.444Z"
  }
}
```

### Send Message

**POST** `/send`

Sends a message as AGENT.

**Content-Type:** `multipart/form-data`

**Required Fields:**
- `flag`: Must be `"AGENT"`
- `timestamp`: ISO 8601 format
- `message_id`: Unique message identifier
- `conversation_id`: UUID of the conversation
- `user_id`: User ID (numeric string)
- `text`: Message text (can be empty)

**Optional Fields:**
- `audio_1`, `audio_2`, ...: Audio files (`.ogg` format)
- `image_1`, `image_2`, ...: Image files (`.png` or `.jpeg`)

**Example Request:**
```bash
curl -X POST http://localhost:8000/send \
  -F "flag=AGENT" \
  -F "timestamp=2025-12-30T15:51:14.444Z" \
  -F "message_id=3EB0690530A63FA5605708" \
  -F "conversation_id=17adfdec-e172-4394-a968-aab4119539b0" \
  -F "user_id=558184475278" \
  -F "text=Thank you for your message!"
```

**Response:**
```json
{
  "status": "success",
  "message": "Message sent successfully",
  "data": {
    "message_id": "3EB0690530A63FA5605708",
    "conversation_id": "17adfdec-e172-4394-a968-aab4119539b0",
    "sent_at": "2025-12-30T15:51:14.444Z"
  }
}
```

## Error Responses

### 400 Bad Request

```json
{
  "status": "error",
  "message": "Field 'flag' must be either 'BOT' or 'USER'"
}
```

### 500 Internal Server Error

```json
{
  "status": "error",
  "message": "Internal server error"
}
```

## File Uploads

- **Audio files**: Must be `audio/ogg` or `audio/opus` format
- **Image files**: Must be `image/png` or `image/jpeg` format
- **Max file size**: 10MB per file
- **Storage**: Files are saved to the `uploads/` directory (configurable via `UPLOAD_DIR`)

## Validation Rules

- `flag` must be exactly `"BOT"`, `"USER"`, or `"AGENT"` (case-sensitive)
- `timestamp` must be in ISO 8601 format
- `message_id` and `conversation_id` are alphanumeric strings
- `user_id` must be a numeric string
- File types are validated based on MIME type

## Project Structure

```
chat-server/
├── src/
│   ├── server.js              # Main server file
│   ├── routes/
│   │   └── messages.js        # Message routes
│   ├── controllers/
│   │   └── messageController.js # Message controllers
│   ├── services/
│   │   ├── agentAssistMock.js # Mock payloads for Agent Assist
│   │   └── websocketServer.js # WebSocket server implementation
│   └── middleware/
│       ├── validators.js      # Input validation
│       └── errorHandler.js    # Error handling
├── uploads/                    # Uploaded files directory
├── .env                       # Environment variables
├── package.json
└── README.md
```

## Development

The server uses ES modules (`"type": "module"` in `package.json`), so use `import` instead of `require`.

## WebSocket Server for Agent Assist Widget

The server includes a WebSocket server that sends mock data to the Agent Assist Widget. The mock data changes every 10 seconds, cycling through 5 different payloads.

### Connection

Connect to the WebSocket server at:
```
ws://localhost:3006/frame?token=<any-token>
```

The WebSocket server runs on the same port as the HTTP server (3006 by default).

The token parameter is optional and can be any value. It's used for logging purposes only.

### Mock Payloads

The server generates 5 different mock payloads:

1. **Payload 1**: Cliente novo com verificação de identidade
2. **Payload 2**: Cliente com histórico de compras e sugestões
3. **Payload 3**: Cliente com risco de fraude e sentiment negativo
4. **Payload 4**: Cliente VIP com múltiplas informações
5. **Payload 5**: Cliente com suporte técnico e resumo de chamada

Each payload includes different combinations of:
- Session info
- Bio info (voice biometrics)
- Dialog info (transcriptions)
- AI info (sentiment, emotions, intents)
- User info (age, gender, address)
- Voice info (liveness, SAT results)
- CRM data
- Fraud info
- Suggestions
- Notes
- Call summary

The payloads automatically change every 10 seconds, and only visible elements (non-undefined values) are sent to the widget.

### Usage with Agent Assist Widget

To use the mock WebSocket server with the Agent Assist Widget:

1. The widget's config is already set to use the local WebSocket server:
   ```typescript
   // In agent-assist-widget/src/config.ts
   export const _conf = {
     REACT_APP_WS: "ws://localhost:3006",
     // ... other config
   };
   ```

2. Start the chat-server:
   ```bash
   npm start
   ```

3. Open the widget with a token parameter:
   ```
   http://localhost:5173/frame2?token=test-token
   ```

The widget will automatically connect to the WebSocket server and receive mock data that changes every 10 seconds.

## Notes

- No authentication is implemented (as per requirements)
- Messages are logged to console (in production, save to database)
- File uploads are stored locally (in production, use cloud storage)
- CORS is enabled for all origins (configure in production)
- WebSocket server sends mock data for development/testing purposes

