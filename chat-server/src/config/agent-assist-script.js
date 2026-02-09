export const agentAssistScript = {
  resumo: `O cliente consultou promoções de perfumes masculinos, verificou a disponibilidade de um produto em uma loja específica e relatou problemas com a entrega de endereço. Após fornecer documentos (RG, selfie com RG, comprovante de residência), o agente confirmou a atualização do endereço com sucesso. Posteriormente, o cliente solicitou ajuda para liberar um limite de crédito após pagamento de boleto, mas o sistema não atualizou. O agente verificou o pagamento do boleto, explicou que o limite é liberado gradualmente devido ao parcelamento e volume de pedidos, e liberou um aumento de R$ 500, permitindo que o cliente finalizasse o pedido.`,

  sugestoes: [
    {
      id: "verificar-status-pagamento",
      title: "Verificar status do pagamento no sistema",
      reasoning:
        "O cliente está frustrado com o atraso na liberação do limite após o pagamento do boleto. Ele precisa de uma resposta clara sobre o status do pagamento e da liberação gradual do limite, já que tem urgência em finalizar o pedido e evitar perda de estoque. A explicação deve ser objetiva para aliviar sua ansiedade e evitar confusão.",
      suggestion:
        "Verifique no sistema Meu CRM e busque por 'Boletos' pra saber se o boleto foi pago. Explique que o limite é liberado gradualmente devido ao parcelamento e volume de pedidos.",
    },
    {
      id: "liberar-aumento-limite",
      title: "Liberar aumento de limite aprovado",
      reasoning:
        "O cliente está sob pressão para finalizar o pedido, pois tem medo de perder o estoque dos perfumes. Ele precisa de uma solução imediata, como a liberação do aumento de limite, para garantir que o pedido seja fechado. A agente deve oferecer opções claras (liberação imediata ou comprovante da segunda parcela) para atender sua necessidade de agilidade.",
      suggestion:
        "Verifique se há um aumento de limite aprovado no sistema e informe ao cliente que pode liberar imediatamente ou pedir o comprovante da segunda parcela do boleto para liberar.",
    },
    {
      id: "recomendar-atualizar-app",
      title: "Recomendar atualização do aplicativo",
      reasoning:
        "O cliente está confuso ou frustrado com o app não carregar corretamente os dados. Ele precisa de uma orientação simples e direta para resolver o problema técnico, como atualizar o aplicativo ou aguardar 5 minutos. A solução deve ser rápida e evitar que ele fique preso em processos complexos.",
      suggestion:
        "Guie o cliente a atualizar o aplicativo, caso não carregue, oriente a aguardar 5 minutos e tentar novamente.",
    },
    {
      id: "confirmar-resolucao-cliente-satisfeito",
      title: "Confirmar resolução e encerrar com cliente satisfeito",
      reasoning:
        "O cliente demonstrou satisfação com a resolução (ex.: limite liberado, pedido finalizado). É o momento de confirmar que a alteração já aparece no sistema, agradecer e deixar a porta aberta para mais alguma dúvida.",
      suggestion:
        "Nossa, perfeito. Já atualizei aqui e já apareceu o limite liberado. Muito obrigado, me ajudou muito.",
    },
    {
      id: "confirmar-resolucao-cliente-satisfeito-v2",
      title: "Confirmar resolução e encerrar com cliente satisfeito (variação)",
      reasoning:
        "O cliente demonstrou satisfação com a resolução. Confirme que está tudo certo no sistema e agradeça de forma cordial.",
      suggestion:
        "Pronto, já está tudo atualizado aqui do nosso lado. Fico muito feliz em ter ajudado. Se precisar de mais alguma coisa, é só chamar.",
    },
    {
      id: "confirmar-resolucao-cliente-satisfeito-v3",
      title: "Confirmar resolução e encerrar com cliente satisfeito (variação)",
      reasoning:
        "O cliente agradeceu e está satisfeito. Reforce que a alteração foi concluída e ofereça ajuda adicional.",
      suggestion:
        "Que bom que deu certo! Já liberei aqui e deve aparecer aí em instantes. Obrigada pelo contato, qualquer coisa estou à disposição.",
    },
    {
      id: "confirmar-resolucao-cliente-satisfeito-v4",
      title: "Confirmar resolução e encerrar com cliente satisfeito (variação)",
      reasoning:
        "O cliente está satisfeito com o atendimento. Encerre confirmando a resolução e deixando canal aberto.",
      suggestion:
        "Perfeito! Já está tudo certo no sistema. Muito obrigada por entrar em contato, foi um prazer ajudar. Precisa de mais alguma coisa?",
    },
  ],

  sentimentos: [
    {
      id: "solicitacao-liberacao-limite",
      situation: "Solicitação de liberação de limite após pagamento de boleto",
      sentiment: "negative",
      justificativa:
        "O cliente demonstra urgência e frustração com o atraso no sistema.",
    },
    {
      id: "explicacao-agente-liberacao",
      situation:
        "Explicação do agente sobre o processo de liberação do limite e oferta de solução",
      sentiment: "neutral",
      justificativa:
        "O cliente não expressa emoção, mas espera respostas claras.",
    },
    {
      id: "liberacao-confirmacao-pedido",
      situation: "Liberação do limite e confirmação da finalização do pedido",
      sentiment: "positive",
      justificativa:
        "O cliente agradece e demonstra satisfação com a resolução.",
    },
  ],

  despedida_exemplos: [
    "Que ótimo, ajudo em algo mais?",
    "Não era só isso mesmo.",
    "Obrigado por entrar em contato",
  ],
};
