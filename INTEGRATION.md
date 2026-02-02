# Guia de Integração - Chat Server + React App

Este documento explica como integrar o servidor Node.js com a aplicação React.

## Estrutura do Projeto

```
Demo/
├── chat-server/          # Servidor Node.js/Express
│   ├── src/
│   │   ├── server.js
│   │   ├── routes/
│   │   ├── controllers/
│   │   └── middleware/
│   └── package.json
│
└── react-chat-app/       # Aplicação React
    ├── src/
    │   ├── services/
    │   │   └── api.js        # Cliente HTTP
    │   ├── redux/
    │   │   └── slices/
    │   │       └── chat.js    # Redux slice para mensagens
    │   └── components/
    └── package.json
```

## Configuração

### 1. Servidor (chat-server)

```bash
cd chat-server
npm install
```

Criar arquivo `.env`:
```env
PORT=8000
NODE_ENV=development
UPLOAD_DIR=./uploads
BRIDGE_URL=https://whatsapp-integration-6ofl.onrender.com
DEFAULT_PHONE_NUMBER=5511983461478
```

**Nota**: `BRIDGE_URL` e `DEFAULT_PHONE_NUMBER` são opcionais. Os valores padrão são `https://whatsapp-integration-6ofl.onrender.com` e `5511983461478` respectivamente.

Iniciar servidor:
```bash
npm run dev
```

O servidor estará rodando em `http://localhost:8000`

### 2. Frontend (react-chat-app)

O frontend já está configurado para usar `http://localhost:8000` por padrão.

Para alterar a URL da API, criar arquivo `.env` na raiz do `react-chat-app`:
```env
REACT_APP_API_URL=http://localhost:8000
```

**Nota**: A integração com o bridge agora é feita no backend (servidor), não no frontend.

## Como Funciona

### Fluxo de Envio de Mensagem (AGENT)

1. Usuário digita mensagem no componente `Footer`
2. Ao clicar em enviar ou pressionar Enter, `handleSendMessage` é chamado
3. A função cria um payload com:
   - `flag: "AGENT"`
   - `message_id`: UUID gerado
   - `conversation_id`: ID da conversa atual
   - `user_id`: ID do usuário
   - `text`: Texto da mensagem
   - `timestamp`: Data/hora atual em ISO 8601

4. Dispara `sendMessageAsync` do Redux
5. Redux chama `sendMessage` do serviço API
6. Serviço faz POST para `/send` com `multipart/form-data`
7. Servidor valida e processa a mensagem
8. **NOVO**: Servidor envia mensagem para o bridge (`{BRIDGE_URL}/agent/message`) com logs detalhados
9. Resposta retorna (incluindo status do bridge) e mensagem é adicionada ao estado Redux
10. Componente `Message` re-renderiza com nova mensagem

### Fluxo de Recebimento de Mensagem (BOT/USER)

1. Servidor externo envia POST para `/` com payload
2. Servidor valida e processa
3. Para integrar no frontend, você pode:
   - Fazer polling periódico
   - Usar WebSockets (não implementado)
   - Criar endpoint GET para buscar mensagens
   - Usar `receiveMessageAsync` do Redux manualmente

## Exemplo de Uso no Frontend

### Enviar Mensagem

```javascript
import { useDispatch } from 'react-redux';
import { sendMessageAsync } from '../redux/slices/chat';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  const handleSend = async () => {
    const messageData = {
      message_id: 'UNIQUE_ID',
      conversation_id: '17adfdec-e172-4394-a968-aab4119539b0',
      user_id: '558184475278',
      text: 'Hello!',
      timestamp: new Date().toISOString(),
    };
    
    await dispatch(sendMessageAsync({
      messageData,
      audioFiles: [],
      imageFiles: []
    }));
  };
};
```

### Receber Mensagem (Manual)

```javascript
import { useDispatch } from 'react-redux';
import { receiveMessageAsync } from '../redux/slices/chat';

const MyComponent = () => {
  const dispatch = useDispatch();
  
  const handleReceive = async () => {
    const messageData = {
      flag: 'BOT', // ou 'USER'
      message_id: 'MESSAGE_ID',
      conversation_id: '17adfdec-e172-4394-a968-aab4119539b0',
      user_id: '558184475278',
      text: 'Hello from bot!',
      timestamp: new Date().toISOString(),
    };
    
    await dispatch(receiveMessageAsync({
      messageData,
      audioFiles: [],
      imageFiles: []
    }));
  };
};
```

### Acessar Mensagens no Componente

```javascript
import { useSelector } from 'react-redux';

const MyComponent = () => {
  const { messages, loading, error } = useSelector((store) => store.chat);
  
  return (
    <div>
      {messages.map(msg => (
        <div key={msg.message_id}>{msg.message}</div>
      ))}
    </div>
  );
};
```

## Testando a API

### Com cURL

**Health Check:**
```bash
curl http://localhost:8000/health
```

**Receber Mensagem (BOT):**
```bash
curl -X POST http://localhost:8000/ \
  -F "flag=BOT" \
  -F "timestamp=2025-12-30T15:51:14.444Z" \
  -F "message_id=TEST123" \
  -F "conversation_id=17adfdec-e172-4394-a968-aab4119539b0" \
  -F "user_id=558184475278" \
  -F "text=Hello!"
```

**Enviar Mensagem (AGENT):**
```bash
curl -X POST http://localhost:8000/send \
  -F "flag=AGENT" \
  -F "timestamp=2025-12-30T15:51:14.444Z" \
  -F "message_id=TEST456" \
  -F "conversation_id=17adfdec-e172-4394-a968-aab4119539b0" \
  -F "user_id=558184475278" \
  -F "text=Thank you!"
```

## Integração com Bridge

Quando uma mensagem é enviada pelo frontend (flag AGENT), o servidor também envia uma cópia para o endpoint do bridge:

- **Endpoint**: `{BRIDGE_URL}/agent/message`
- **Método**: POST
- **Content-Type**: application/json
- **Payload**:
  ```json
  {
    "phoneNumber": "5511983461478",
    "text": "Texto da mensagem"
  }
  ```

A chamada ao bridge é **não-bloqueante** - se falhar, não impede o envio normal da mensagem. 

### Logs do Bridge

O servidor gera logs detalhados com o prefixo `[BRIDGE]`:

- **Tentativa de envio**: Loga endpoint, número de telefone, tamanho do texto e timestamp
- **Sucesso**: Loga status HTTP, duração da requisição e resposta
- **Falha**: Loga status HTTP, mensagem de erro e duração
- **Erro de rede**: Loga mensagem de erro, stack trace e tipo de erro

A resposta da API inclui informações sobre o status do bridge no campo `data.bridge`:
```json
{
  "status": "success",
  "data": {
    "message_id": "...",
    "bridge": {
      "sent": true
    }
  }
}
```

Se houver erro:
```json
{
  "status": "success",
  "data": {
    "message_id": "...",
    "bridge": {
      "sent": false,
      "error": {
        "status": 500,
        "message": "Error message"
      }
    }
  }
}
```

## Próximos Passos

1. **Persistência**: Integrar com banco de dados (PostgreSQL, MongoDB, etc.)
2. **Autenticação**: Adicionar JWT ou OAuth2
3. **WebSockets**: Para mensagens em tempo real
4. **Upload de Arquivos**: Implementar upload de imagens/áudio no frontend
5. **Polling**: Criar endpoint GET para buscar mensagens pendentes
6. **Validação Avançada**: Adicionar mais validações no servidor
7. **Bridge**: Tornar o número de telefone dinâmico (atualmente hardcoded)

## Troubleshooting

### Erro: "Network request failed"
- Verifique se o servidor está rodando
- Verifique a URL da API no `.env`
- Verifique CORS no servidor

### Mensagens não aparecem
- Verifique o console do navegador
- Verifique o Redux DevTools
- Verifique se `messages` está sendo atualizado no Redux

### Erro de validação
- Verifique se todos os campos obrigatórios estão presentes
- Verifique o formato do `timestamp` (deve ser ISO 8601)
- Verifique se `flag` está correto (BOT, USER, ou AGENT)

