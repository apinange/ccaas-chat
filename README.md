# CCAAS Chat

Frontend e backend do chat para integração WhatsApp CCAAS (Contact Center as a Service).

## Estrutura

- **chat-server** – Backend Node.js/Express (mensagens, Agent Assist, WebSocket, bridge com WhatsApp)
- **react-chat-app** – Aplicação React do painel de atendimento (chat, Agent Assist)
- **agent-assist-widget** – Widget de Agent Assist (análise, resumo, sugestões)

## Pré-requisitos

- Node.js 18+
- npm ou yarn

## Desenvolvimento

### Chat Server

```bash
cd chat-server
npm install
cp .env.example .env   # ou crie .env com PORT, BRIDGE_URL, DEFAULT_PHONE_NUMBER, etc.
npm run dev
```

Servidor em `http://localhost:3006` (ou `PORT` do `.env`).

### React Chat App

```bash
cd react-chat-app
npm install
# Opcional: .env com REACT_APP_API_URL apontando para o chat-server
npm start
```

### Agent Assist Widget

```bash
cd agent-assist-widget
npm install
npm run dev
```

## Configuração

- **BRIDGE_URL**: URL do serviço de integração WhatsApp (ex.: `https://whatsapp-integration-6ofl.onrender.com`)
- **DEFAULT_PHONE_NUMBER**: Número WhatsApp usado no bridge
- **REACT_APP_API_URL**: URL do chat-server (ex.: `http://localhost:3006`)

Ver [INTEGRATION.md](./INTEGRATION.md) para fluxo de mensagens e integração com o bridge.

## Deploy

O chat-server pode ser deployado no Render (ou similar). Ver documentação do projeto principal para `render.yaml` e variáveis de ambiente.
