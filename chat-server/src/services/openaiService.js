import fetch from 'node-fetch';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = process.env.OPENAI_API_URL || 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini';

/**
 * Generate mock analysis data
 * @param {Array} userMessages - Array of user messages
 * @returns {{explanation: string, suggestion: string}}
 */
function getMockAnalysis(userMessages) {
  const messagesText = userMessages
    .map((msg, index) => `Mensagem ${index + 1}: ${msg.text || ''}`)
    .join('\n\n');
  
  return {
    reasoning: `O cliente demonstrou necessidade de atendimento humano após interagir com o bot. Baseado nas mensagens do usuário, o cliente parece estar buscando uma solução que não foi completamente resolvida pelo atendimento automatizado. O cliente pode estar frustrado com respostas genéricas e precisa de uma abordagem mais personalizada.`,
    action: 'Verifique o histórico da conversa, identifique o ponto específico de insatisfação e ofereça uma solução direta e personalizada. Se necessário, peça mais detalhes para entender completamente a situação.'
  };
}

/**
 * Call OpenAI API to analyze user messages and generate agent suggestions
 * @param {Array} userMessages - Array of user messages (text only)
 * @param {string|null} previousAnalysis - Previous analysis text and suggestion (optional)
 * @returns {Promise<{explanation: string, suggestion: string}>}
 */
export async function analyzeEscalation(userMessages, previousAnalysis = null) {
  // Fallback to mock data if OpenAI API key is not set
  if (!OPENAI_API_KEY) {
    console.warn('[OpenAI] OPENAI_API_KEY not set, using mock data');
    return getMockAnalysis(userMessages);
  }

  const messagesText = userMessages
    .map((msg, index) => `Mensagem ${index + 1}: ${msg.text || ''}`)
    .join('\n\n');

  const systemPrompt = `Você é um assistente especialista em atendimento a revendedoras do Grupo Boticário via chat/WhatsApp.
Seu papel é acompanhar o atendimento em tempo real e sugerir ações concretas ao agente, com foco em resolver o problema da revendedora na primeira interação, especialmente em casos de:
- Pedidos não processados ou com atraso
- Problemas com pagamento ou faturamento
- Dúvidas sobre produtos, estoque ou disponibilidade
- Questões sobre campanhas, promoções ou prazos
- Problemas técnicos no sistema ou aplicativo
- Necessidade de suporte comercial urgente
- Dúvidas sobre políticas, prazos ou condições

🎯 OBJETIVO PRINCIPAL
Garantir que a revendedora consiga resolver sua necessidade no mesmo atendimento, sempre que possível, evitando respostas genéricas como "aguarde processamento" ou "vou verificar e retorno".

📥 DADOS DE ENTRADA
Você receberá:
- Histórico completo da conversa (cliente, bot e agente)
- Contexto da situação atual
- Mensagens desde a última interação antes da escalação

🧠 INSTRUÇÕES DE RACIOCÍNIO
Ao analisar cada caso, siga obrigatoriamente este fluxo:
1. Identifique o problema ou necessidade principal da revendedora
2. Verifique se há informações faltantes ou ambíguas
3. Avalie se há urgência (prazo, estoque, campanha)
4. Consulte o que já foi tentado pelo bot ou agente
5. Identifique possíveis soluções disponíveis
6. Priorize resolução imediata quando possível
7. Confirme se o problema foi resolvido antes de encerrar
Nunca pule etapas.

⚙️ AÇÕES CONCRETAS QUE VOCÊ DEVE SUGERIR
Sempre que aplicável, recomende ao agente uma ou mais destas ações:

Operacionais
- Consultar status do pedido no sistema
- Verificar dados cadastrais ou bancários
- Confirmar informações específicas com a revendedora
- Validar prazos, valores ou condições
- Verificar disponibilidade de produtos ou estoque
- Consultar histórico de pedidos ou transações
- Checar políticas ou regras aplicáveis

Comerciais
- Priorizar casos em campanhas ativas com prazo
- Evitar que a revendedora perca oportunidade comercial
- Sugerir alternativas de produtos se necessário
- Avaliar possibilidade de ajustes ou exceções
- Verificar cupons, descontos ou condições especiais
- Orientar sobre melhores práticas de pedido

Técnicas
- Orientar sobre uso do sistema ou aplicativo
- Sugerir limpeza de cache quando aplicável
- Solicitar nova tentativa após correção
- Monitorar atualização do sistema
- Registrar problema técnico se necessário

🗣️ PADRÃO DE COMUNICAÇÃO RECOMENDADO AO AGENTE
Sempre sugerir respostas que sejam:
- Claras e objetivas
- Empáticas e respeitosas
- Focadas em solução
- Sem termos técnicos desnecessários
- Com próximos passos definidos

Evite frases vagas como:
- "Aguarde"
- "Está em análise"
- "Em até X dias"
- "Vou verificar e retorno"
Sem apresentar alternativa ou prazo específico.

📤 FORMATO DE SAÍDA
Sempre responda em formato JSON com:
{
  "reasoning": "📊 Diagnóstico do Caso\n\nSituação identificada:\nContexto relevante:\nO que já foi tentado:\nGrau de urgência:\nPossíveis riscos:\n\n✅ Pontos Importantes\n- Detalhes relevantes que o agente deve saber\n- Contexto adicional necessário",
  "action": "✅ Ação Imediata Recomendada\n\n[Descrição clara e específica da ação]\n\n💬 Sugestão de Mensagem ao Cliente\n[Texto pronto para o agente usar, se aplicável]\n\n⚠️ Alertas ao Agente\n[Possíveis riscos, falhas ou cuidados]"
}

Nunca entregue apenas explicações. Sempre entregue ações práticas e específicas.

🚫 RESTRIÇÕES
- Não sugira aguardar sem alternativa concreta
- Não transfira para outro setor sem justificativa clara
- Não encerre atendimento sem confirmação de resolução
- Não ignore sinais de urgência ou frustração
- Não omita opções disponíveis no sistema
- Não use linguagem genérica ou vaga

📌 EXEMPLOS DE SITUAÇÕES A IDENTIFICAR
Você deve reconhecer automaticamente casos como:
- "Meu pedido não chegou"
- "Não consigo fazer o pedido"
- "O sistema não está funcionando"
- "Preciso urgente"
- "É para campanha que acaba hoje"
- "Já tentei várias vezes"
E tratá-los como prioridade.

🏁 FINALIZAÇÃO
Antes de encerrar qualquer recomendação, garanta que o agente:
- Tenha uma ação clara e específica para executar
- Saiba exatamente o que verificar ou fazer
- Tenha uma mensagem sugerida para a revendedora (quando aplicável)
- Esteja ciente de possíveis riscos ou cuidados

IMPORTANTE:
- Esta é uma conversa via chat/WhatsApp, NÃO é ligação telefônica
- O reasoning deve ser completo mas objetivo (2-4 frases)
- A action deve ser direta, específica e executável (1-3 frases)
- Sempre priorize resolução na primeira interação`;

  const userPrompt = previousAnalysis
    ? `Aqui estão as mensagens do cliente desde a última vez antes da escalação:\n\n${messagesText}\n\nAnálise anterior:\n${previousAnalysis}\n\nAnalise novamente e determine se a análise anterior ainda é válida ou se precisa ser atualizada com base nas novas mensagens.`
    : `Aqui estão as mensagens do cliente (revendedora) desde a última vez antes da escalação:\n\n${messagesText}\n\nAnalise a situação e forneça um reasoning (explicação completa) e uma action (ação específica para o agente executar).`;

  const requestBody = {
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);
    
    return {
      reasoning: parsed.reasoning || parsed.explanation || parsed.text || 'Análise não disponível',
      action: parsed.action || parsed.suggestion || 'Ação não disponível'
    };
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    console.warn('[OpenAI] Falling back to mock data due to API error');
    // Fallback to mock data on error
    return getMockAnalysis(userMessages);
  }
}

/**
 * Generate mock summary data
 * @param {Array} allMessages - Array of all messages
 * @returns {string}
 */
function getMockSummary(allMessages) {
  const userMessages = allMessages.filter(msg => msg.flag === 'USER');
  const botMessages = allMessages.filter(msg => msg.flag === 'BOT');
  const agentMessages = allMessages.filter(msg => msg.flag === 'AGENT');
  const hasEscalation = allMessages.some(msg => msg.flag === 'ESCALATION');
  
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
    summary += `\nÚltima mensagem do cliente: "${lastUserMessage.text || 'Sem texto'}"\n`;
  }
  
  summary += `\nEsta é uma análise automática baseada nas mensagens da conversa. Para uma análise mais detalhada, configure a chave da API OpenAI.`;
  
  return summary;
}

/**
 * Generate mock agent assist data
 * @param {Array} allMessages - Array of all messages
 * @returns {{userSentiment: {label: string, score: number}, reasoning: string, suggestion: string, summary: string}}
 */
function getMockAgentAssistData(allMessages) {
  const userMessages = allMessages.filter(msg => msg.flag === 'USER');
  const botMessages = allMessages.filter(msg => msg.flag === 'BOT');
  const agentMessages = allMessages.filter(msg => msg.flag === 'AGENT');
  
  return {
    userSentiment: {
      label: 'NEUTRAL',
      score: 0.5
    },
    reasoning: `O cliente demonstrou necessidade de atendimento humano após interagir com o bot. Baseado nas mensagens do usuário, o cliente parece estar buscando uma solução que não foi completamente resolvida pelo atendimento automatizado. O cliente pode estar frustrado com respostas genéricas e precisa de uma abordagem mais personalizada.`,
    suggestion: 'Verifique o histórico da conversa, identifique o ponto específico de insatisfação e ofereça uma solução direta e personalizada. Se necessário, peça mais detalhes para entender completamente a situação.',
    summary: `Resumo da Conversa:\n\nTotal de mensagens: ${allMessages.length}\nMensagens do cliente: ${userMessages.length}\nMensagens do bot: ${botMessages.length}\nMensagens do agente: ${agentMessages.length}\n\nEsta é uma análise automática baseada nas mensagens da conversa. Para uma análise mais detalhada, configure a chave da API OpenAI.`
  };
}

/**
 * Analyze conversation and generate agent assist data
 * @param {Array} allMessages - Array of all messages (USER, BOT, AGENT)
 * @returns {Promise<{userSentiment: {label: string, score: number}, reasoning: string, suggestion: string, summary: string}>}
 */
export async function analyzeConversationForAgentAssist(allMessages) {
  // Fallback to mock data if OpenAI API key is not set
  if (!OPENAI_API_KEY) {
    console.warn('[OpenAI] OPENAI_API_KEY not set, using mock data');
    return getMockAgentAssistData(allMessages);
  }

  // Format conversation with all messages (USER, BOT, AGENT)
  const conversationText = allMessages
    .filter(msg => msg.flag !== 'ESCALATION')
    .map((msg) => {
      const role = msg.flag === 'USER' ? 'Cliente' : msg.flag === 'AGENT' ? 'Agente' : 'Bot';
      return `[${role}]: ${msg.text || ''}`;
    })
    .join('\n\n');

  const systemPrompt = `Você é um assistente especialista em atendimento a revendedoras do Grupo Boticário via chat/WhatsApp.
Seu papel é acompanhar o atendimento em tempo real e sugerir ações concretas ao agente, com foco em resolver o problema da revendedora na primeira interação.

🎯 OBJETIVO PRINCIPAL
Garantir que a revendedora consiga resolver sua necessidade no mesmo atendimento, sempre que possível, evitando respostas genéricas.

📥 DADOS DE ENTRADA
Você receberá o histórico completo da conversa incluindo todas as mensagens do cliente (revendedora), do bot e do agente.

🧠 INSTRUÇÕES DE RACIOCÍNIO
Ao analisar a conversa, siga este fluxo:
1. Identifique o problema ou necessidade principal
2. Avalie o sentimento e urgência da revendedora
3. Verifique o que já foi tentado ou discutido
4. Identifique possíveis soluções disponíveis
5. Priorize resolução imediata quando possível
6. Destaque pontos importantes e contexto relevante

⚙️ FORMATO DE SUGESTÃO
Sua sugestão deve sempre incluir:
- Ação específica e executável
- O que verificar, consultar ou fazer
- Sugestão de mensagem ao cliente (quando aplicável)
- Alertas sobre riscos ou cuidados

🚫 RESTRIÇÕES
- Não sugira aguardar sem alternativa
- Não use linguagem genérica ou vaga
- Não omita opções disponíveis
- Não ignore sinais de urgência

IMPORTANTE:
- Esta é uma conversa via chat/WhatsApp, NÃO é ligação telefônica
- Analise TODAS as mensagens: do cliente, do bot e do agente
- Seja específico e concreto nas suas análises
- Foque em informações práticas e acionáveis`;

  const userPrompt = `Aqui está a conversa completa até agora:

${conversationText}

Analise a conversa e forneça:

1. SENTIMENTO DO USUÁRIO: Identifique o sentimento da revendedora. Responda com um rótulo (POSITIVE, NEUTRAL, NEGATIVE) e uma pontuação de 0 a 1, no formato: "SENTIMENT: POSITIVE/0.85"

2. REASONING: Uma explicação clara e completa do contexto da conversa, incluindo:
   📊 Diagnóstico do Caso
   - Situação identificada: [o que a revendedora precisa]
   - Contexto relevante: [informações importantes sobre a situação]
   - O que já foi tentado: [ações do bot ou agente]
   - Grau de urgência: [baixo/médio/alto]
   - Possíveis riscos: [o que pode dar errado]
   
   ✅ Pontos Importantes
   - [Detalhes relevantes que o agente deve saber]
   - [Contexto adicional necessário]
   
   Seja completo mas objetivo (3-5 frases).

3. SUGESTÃO: Uma ação específica, direta e executável para o agente realizar AGORA. Use este formato:
   
   ✅ Ação Imediata Recomendada
   [Descrição clara e específica da ação: o que verificar, consultar, fazer]
   
   💬 Sugestão de Mensagem ao Cliente (quando aplicável)
   [Texto pronto para o agente usar, se houver mensagem sugerida]
   
   ⚠️ Alertas ao Agente (quando aplicável)
   [Possíveis riscos, falhas ou cuidados que o agente deve ter]
   
   Seja concreto e específico. Exemplos:
   - "Verifique no sistema o status do pedido #12345. Se estiver pendente, confirme os dados bancários cadastrados e solicite nova tentativa de processamento."
   - "Consulte no CRM o histórico de pedidos da revendedora. Verifique se há pedidos em aberto ou pendências que possam estar bloqueando novos pedidos."
   - "Confirme com a revendedora o valor exato que ela tentou comprar e o método de pagamento usado. Em seguida, verifique no sistema se há limite disponível ou bloqueios."
   
   Seja direto e executável (2-4 frases).

4. RESUMO: Um resumo claro e conciso do que aconteceu na conversa, incluindo:
   - O problema ou necessidade da revendedora
   - As tentativas de resolução (pelo bot ou agente)
   - O resultado final (se houver)
   - Pontos importantes que o agente deve saber
   Seja objetivo e focado nos fatos principais (3-5 frases).

Responda em formato JSON com as seguintes chaves:
{
  "sentiment": "POSITIVE/0.85",
  "reasoning": "...",
  "suggestion": "...",
  "summary": "..."
}`;

  const requestBody = {
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    response_format: { type: 'json_object' }
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content in OpenAI response');
    }

    const parsed = JSON.parse(content);
    
    // Parse sentiment
    const sentimentMatch = (parsed.sentiment || 'NEUTRAL/0.5').match(/(\w+)\/([\d.]+)/);
    const sentimentLabel = sentimentMatch ? sentimentMatch[1] : 'NEUTRAL';
    const sentimentScore = sentimentMatch ? parseFloat(sentimentMatch[2]) : 0.5;
    
    return {
      userSentiment: {
        label: sentimentLabel,
        score: sentimentScore
      },
      reasoning: parsed.reasoning || 'Análise não disponível',
      suggestion: parsed.suggestion || 'Ação não disponível',
      summary: parsed.summary || 'Resumo não disponível'
    };
  } catch (error) {
    console.error('Error calling OpenAI API for agent assist:', error);
    console.warn('[OpenAI] Falling back to mock data due to API error');
    return getMockAgentAssistData(allMessages);
  }
}

/**
 * Call OpenAI API to summarize a complete conversation
 * @param {Array} allMessages - Array of all messages (USER, BOT, AGENT)
 * @returns {Promise<string>} Summary text
 */
export async function summarizeConversation(allMessages) {
  // Fallback to mock data if OpenAI API key is not set
  if (!OPENAI_API_KEY) {
    console.warn('[OpenAI] OPENAI_API_KEY not set, using mock data');
    return getMockSummary(allMessages);
  }

  const conversationText = allMessages
    .map((msg) => {
      const role = msg.flag === 'USER' ? 'Cliente' : msg.flag === 'BOT' ? 'Bot' : 'Agente';
      return `[${role}]: ${msg.text || ''}`;
    })
    .join('\n\n');

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
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.5,
    max_tokens: 500
  };

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const summary = data.choices[0]?.message?.content;

    if (!summary) {
      throw new Error('No summary in OpenAI response');
    }

    return summary.trim();
  } catch (error) {
    console.error('Error calling OpenAI API for summary:', error);
    console.warn('[OpenAI] Falling back to mock data due to API error');
    // Fallback to mock data on error
    return getMockSummary(allMessages);
  }
}

