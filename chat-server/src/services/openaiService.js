import fetch from "node-fetch";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL =
  process.env.OPENAI_API_URL || "https://api.openai.com/v1/chat/completions";
const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-5-mini";

/**
 * Generate mock summary data
 * @param {Array} allMessages - Array of all messages
 * @returns {string}
 */
function getMockSummary(allMessages) {
  const userMessages = allMessages.filter((msg) => msg.flag === "USER");
  const botMessages = allMessages.filter((msg) => msg.flag === "BOT");
  const agentMessages = allMessages.filter((msg) => msg.flag === "AGENT");
  const hasEscalation = allMessages.some((msg) => msg.flag === "ESCALATION");

  let summary = `Resumo da Conversa:\n\n`;
  summary += `- Total de mensagens: ${allMessages.length}\n`;
  summary += `- Mensagens do cliente: ${userMessages.length}\n`;
  summary += `- Mensagens do bot: ${botMessages.length}\n`;
  summary += `- Mensagens do agente: ${agentMessages.length}\n`;

  if (hasEscalation) {
    summary += `- A conversa foi escalada para atendimento humano\n`;
  }

  if (userMessages.length > 0) {
    const lastUserMessage = userMessages[userMessages.length - 1];
    summary += `\nÚltima mensagem do cliente: "${lastUserMessage.text || "Sem texto"}"\n`;
  }

  summary += `\nEsta é uma análise automática baseada nas mensagens da conversa. Para uma análise mais detalhada, configure a chave da API OpenAI.`;

  return summary;
}

const SENTIMENT_SCORE = { negative: 0.2, neutral: 0.5, positive: 0.8 };

/**
 * Select suggestion and sentiment from script based on last user messages.
 * LLM only chooses indices; no free generation.
 * @param {Object} script - agentAssistScript (resumo, sugestoes, sentimentos, despedida_exemplos)
 * @param {Array} lastUserMessages - Consecutive USER messages from end (no AGENT in between)
 * @param {Array} recentMessages - Last N messages (any leg) for despedida context
 * @returns {Promise<{suggestionIndex: number, sentimentIndex: number, is_despedida: boolean}>}
 */
export async function selectFromScript(
  script,
  lastUserMessages,
  recentMessages,
) {
  const sugestoes = script.sugestoes || [];
  const sentimentos = script.sentimentos || [];
  if (sugestoes.length === 0 || sentimentos.length === 0) {
    return { suggestionIndex: 0, sentimentIndex: 0, is_despedida: false };
  }

  const lastUserText = lastUserMessages
    .map((m, i) => `[Cliente ${i + 1}]: ${m.text || ""}`)
    .join("\n");
  const recentText = recentMessages
    .map((m) => {
      const role =
        m.flag === "USER" ? "Cliente" : m.flag === "AGENT" ? "Agente" : "Bot";
      return `[${role}]: ${m.text || ""}`;
    })
    .join("\n");

  const suggestionsBlock = sugestoes
    .map(
      (s, i) =>
        `[${i}] ${s.title}\n  Contexto: ${s.reasoning}\n  Sugestão: ${s.suggestion}`,
    )
    .join("\n\n");
  const sentimentsBlock = sentimentos
    .map(
      (s, i) =>
        `[${i}] Situação: ${s.situation}\n  sentiment: ${s.sentiment}\n  Justificativa: ${s.justificativa}`,
    )
    .join("\n\n");
  const despedidaExemplos = (script.despedida_exemplos || []).join("\n- ");

  const systemPrompt = `Você é um assistente que escolhe a opção correta em um script de atendimento.
Você NÃO gera texto novo. Sua tarefa é apenas retornar os ÍNDICES (números) da sugestão e do sentimento que melhor se encaixam na última fala do cliente.

REGRAS:
1. Com base nas "Últimas mensagens do cliente" e no "Contexto recente", escolha UMA sugestão (pelo índice) e UM sentimento (pelo índice).
2. is_despedida: true somente quando o cliente está se despedindo/finalizando o atendimento (ex.: agradecimento, "não era só isso", "obrigado por entrar em contato", resposta negativa a "ajudo em algo mais?"). Use o contexto recente (incluindo a mensagem do agente) para inferir.
3. Responda APENAS em JSON válido com as chaves: suggestion_index (número), sentiment_index (número), is_despedida (boolean).`;

  const userPrompt = `SCRIPT - SUGESTÕES (escolha o índice que melhor se aplica):
${suggestionsBlock}

SCRIPT - SENTIMENTOS (escolha o índice que melhor se aplica):
${sentimentsBlock}

Exemplos de mensagens que indicam despedida (use só como referência):
- ${despedidaExemplos}

Últimas mensagens do cliente (consecutivas, sem resposta do agente no meio):
${lastUserText || "(nenhuma)"}

Contexto recente (últimas mensagens da conversa, incluindo agente/bot):
${recentText}

Retorne JSON: { "suggestion_index": <0 a ${sugestoes.length - 1}>, "sentiment_index": <0 a ${sentimentos.length - 1}>, "is_despedida": <true ou false> }`;

  if (!OPENAI_API_KEY) {
    return { suggestionIndex: 0, sentimentIndex: 0, is_despedida: false };
  }

  const requestBody = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 1,
    response_format: { type: "json_object" },
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });
    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${err}`);
    }
    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    if (!content) throw new Error("No content in OpenAI response");
    const parsed = JSON.parse(content);
    const suggestionIndex = Math.max(
      0,
      Math.min(parsed.suggestion_index ?? 0, sugestoes.length - 1),
    );
    const sentimentIndex = Math.max(
      0,
      Math.min(parsed.sentiment_index ?? 0, sentimentos.length - 1),
    );
    const is_despedida = Boolean(parsed.is_despedida);
    return { suggestionIndex, sentimentIndex, is_despedida };
  } catch (error) {
    console.error("[OpenAI] selectFromScript error:", error);
    return { suggestionIndex: 0, sentimentIndex: 0, is_despedida: false };
  }
}

/**
 * Build agent-assist payload from script selection (reasoning on top, suggestion below; sentiment for widget).
 * @param {Object} script - agentAssistScript
 * @param {number} suggestionIndex - Index into script.sugestoes
 * @param {number} sentimentIndex - Index into script.sentimentos
 * @param {boolean} is_despedida - Whether to include script resumo
 * @returns {{reasoning: string, suggestion: string, userSentiment: {label: string, score: number}, summary?: string}}
 */
export function buildAgentAssistPayloadFromScript(
  script,
  suggestionIndex,
  sentimentIndex,
  is_despedida,
) {
  const sugestoes = script.sugestoes || [];
  const sentimentos = script.sentimentos || [];
  const sug = sugestoes[suggestionIndex] || sugestoes[0];
  const sent = sentimentos[sentimentIndex] || sentimentos[0];
  const label = (sent.sentiment || "neutral").toUpperCase();
  const score = SENTIMENT_SCORE[sent.sentiment?.toLowerCase()] ?? 0.5;
  const payload = {
    reasoning: sug?.reasoning || "",
    suggestion: sug?.suggestion || "",
    userSentiment: {
      label: label === "NEGATIVE" || label === "POSITIVE" ? label : "NEUTRAL",
      score,
    },
  };
  if (is_despedida && script.resumo) payload.summary = script.resumo;
  return payload;
}

/**
 * Call OpenAI API to summarize a complete conversation
 * @param {Array} allMessages - Array of all messages (USER, BOT, AGENT)
 * @returns {Promise<string>} Summary text
 */
export async function summarizeConversation(allMessages) {
  // Fallback to mock data if OpenAI API key is not set
  if (!OPENAI_API_KEY) {
    console.warn("[OpenAI] OPENAI_API_KEY not set, using mock data");
    return getMockSummary(allMessages);
  }

  const conversationText = allMessages
    .map((msg) => {
      const role =
        msg.flag === "USER" ? "Cliente" : msg.flag === "BOT" ? "Bot" : "Agente";
      return `[${role}]: ${msg.text || ""}`;
    })
    .join("\n\n");

  const systemPrompt = `Você é um assistente especializado em resumir conversas de atendimento a revendedoras do Grupo Boticário via chat/WhatsApp.

Sua tarefa é criar um resumo claro, conciso e estruturado que ajude o agente a entender rapidamente:
- O que aconteceu na conversa
- Qual foi o problema ou necessidade da revendedora
- O que foi tentado para resolver
- Qual foi o resultado final
- Pontos importantes que o agente deve saber

DIRETRIZES:
- Seja objetivo e focado nos fatos principais
- Use linguagem clara e direta
- Destaque informações críticas ou urgentes
- Inclua contexto relevante quando necessário
- Evite repetições ou informações redundantes
- Organize o resumo de forma lógica e fácil de ler

FORMATO:
- Comece com o problema ou necessidade principal
- Descreva as tentativas de resolução
- Indique o resultado final ou status atual
- Finalize com pontos importantes ou próximos passos

IMPORTANTE:
- Esta é uma conversa via chat/WhatsApp, NÃO é ligação telefônica
- Foque em informações práticas e acionáveis
- Seja conciso mas completo (3-5 frases bem estruturadas)`;

  const userPrompt = `Aqui está a conversa completa:\n\n${conversationText}\n\nPor favor, crie um resumo.`;

  const requestBody = {
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.5,
    max_tokens: 500,
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`,
      );
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content;

    if (!summary) {
      throw new Error("No summary in OpenAI response");
    }

    return summary.trim();
  } catch (error) {
    console.error("Error calling OpenAI API for summary:", error);
    console.warn("[OpenAI] Falling back to mock data due to API error");
    // Fallback to mock data on error
    return getMockSummary(allMessages);
  }
}
