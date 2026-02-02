/**
 * Mock service for Agent Assist Widget
 * Generates different payloads that change every 10 seconds
 */

/**
 * Remove undefined values from object recursively
 */
function removeUndefined(obj) {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefined).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeUndefined(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  
  return obj;
}

/**
 * Generate 5 different mock payloads for Agent Assist Widget
 */
export function getMockPayloads() {
  const payloads = [
    // Payload 1: Cliente novo com verificação de identidade
    {
      session_info: {
        call_id: "CALL_001",
        ani: "+5511999887766"
      },
      bio_info: {
        status: "enrolled",
        bio_result: {
          result_type: "verification",
          bio_user_id: "user001",
          bio_result: "TRUE_HIGH",
          bio_score: 0.95,
          speech_millis: 3500
        },
        user_cnt: 1
      },
      dialog_info: {
        utt_list: [
          {
            leg: "AGENT",
            utt: "Olá! Como posso ajudá-lo hoje?",
            is_final: true,
            confidence: 1.0,
            words: []
          },
          {
            leg: "USER",
            utt: "Preciso verificar minha identidade",
            is_final: true,
            confidence: 0.92,
            words: []
          }
        ],
        real_time_agent: {
          leg: "AGENT",
          utt: "Vou verificar seus dados...",
          is_final: false,
          words: []
        },
        real_time_user: {
          leg: "USER",
          utt: "Ok, aguardo",
          is_final: false,
          words: []
        }
      },
      ai_info: {
        user_sentiment: "positive",
        user_emotions: "calm",
        user_anger_detected: false,
        user_intents: "identity_verification",
        agent_sentiment: "neutral",
        agent_tasks: "verify_identity",
        agent_next_task: "confirm_verification",
        agent_suggested_prompt: "Por favor, confirme seu CPF completo para verificação"
      },
      user_info: {
        address: "São Paulo, SP",
        age: {
          value: "25-35",
          status: "MATCH_HIGH",
          description: "Idade estimada corresponde ao perfil"
        },
        gender: {
          value: "M",
          status: "MATCH_HIGH",
          description: "Gênero corresponde ao perfil"
        },
        name: "Carlos Mendes",
        user_id: "user001",
        trustLevel: 0.92,
        validAni: true
      },
      voice_info: {
        liveness_score: {
          label: "LIVE",
          global_post: 0.94
        },
        sat_result: {
          label: "VALID",
          valid: true,
          gender_label: "M",
          gender_prob: 0.91,
          age_estimate: 30,
          age_label: "25-35"
        }
      },
      crm_data: [
        { key: "Cliente desde", value: "2024" },
        { key: "Status", value: "Ativo" }
      ],
      features: {
        voiceBiometrics: true,
        blacklisting: false,
        transcription: true,
        suggestions: true,
        summary: false,
        notes: false
      },
      fraud_info: {
        description: "Risco muito baixo",
        label: "SAFE"
      },
      user_sound: 0.68,
      suggestion: {
        suggestion: "Sugestão: Solicite confirmação de dados pessoais adicionais",
        htmlString: "<p>Sugestão: Solicite confirmação de dados pessoais adicionais</p>"
      }
    },

    // Payload 2: Cliente com histórico de compras e sugestões
    {
      session_info: {
        call_id: "CALL_002",
        ani: "+5511888776655"
      },
      bio_info: {
        status: "enrolled",
        bio_result: {
          result_type: "verification",
          bio_user_id: "user002",
          bio_result: "TRUE_MEDIUM",
          bio_score: 0.78,
          speech_millis: 2800
        },
        user_cnt: 1
      },
      dialog_info: {
        utt_list: [
          {
            leg: "AGENT",
            utt: "Bem-vindo de volta! Em que posso ajudar?",
            is_final: true,
            confidence: 1.0,
            words: []
          },
          {
            leg: "USER",
            utt: "Quero saber sobre minhas últimas compras",
            is_final: true,
            confidence: 0.88,
            words: []
          },
          {
            leg: "AGENT",
            utt: "Vou consultar seu histórico",
            is_final: true,
            confidence: 1.0,
            words: []
          }
        ],
        real_time_agent: {
          leg: "AGENT",
          utt: "Consultando histórico de compras...",
          is_final: false,
          words: []
        },
        real_time_user: {
          leg: "USER",
          utt: "Perfeito",
          is_final: false,
          words: []
        }
      },
      ai_info: {
        user_sentiment: "neutral",
        user_emotions: "neutral",
        user_anger_detected: false,
        user_intents: "check_purchase_history",
        agent_sentiment: "positive",
        agent_tasks: "retrieve_history",
        agent_next_task: "present_purchases",
        agent_suggested_prompt: "Mostre as últimas 5 compras do cliente"
      },
      user_info: {
        address: "Rio de Janeiro, RJ",
        age: {
          value: "40-50",
          status: "MATCH_MEDIUM",
          description: "Idade estimada próxima ao perfil"
        },
        gender: {
          value: "F",
          status: "MATCH_HIGH",
          description: "Gênero corresponde ao perfil"
        },
        name: "Maria Santos",
        user_id: "user002",
        trustLevel: 0.75,
        validAni: true
      },
      voice_info: {
        liveness_score: {
          label: "LIVE",
          global_post: 0.87
        },
        sat_result: {
          label: "VALID",
          valid: true,
          gender_label: "F",
          gender_prob: 0.85,
          age_estimate: 45,
          age_label: "40-50"
        }
      },
      crm_data: [
        { key: "Cliente desde", value: "2019" },
        { key: "Plano", value: "Premium" },
        { key: "Última compra", value: "20/01/2025" },
        { key: "Total de compras", value: "127" }
      ],
      features: {
        voiceBiometrics: true,
        blacklisting: false,
        transcription: true,
        suggestions: true,
        summary: true,
        notes: true
      },
      fraud_info: {
        description: "Risco baixo",
        label: "SAFE"
      },
      user_sound: 0.82,
      suggestion: {
        suggestion: "Sugestão: Ofereça produtos relacionados às últimas compras",
        htmlString: "<p>Sugestão: Ofereça produtos relacionados às últimas compras</p>"
      },
      notes: [
        { key: "Observação", value: "Cliente frequente, preferência por produtos premium" }
      ],
      call_summary: {
        duration: 240,
        summary: "Cliente consultou histórico de compras. Mostrados últimos 5 pedidos.",
        timestamp: Date.now(),
        topic: "Consulta de histórico",
        type: "information"
      }
    },

    // Payload 3: Cliente com risco de fraude e sentiment negativo
    {
      session_info: {
        call_id: "CALL_003",
        ani: "+5511777665544"
      },
      bio_info: {
        status: "enrolled",
        bio_result: {
          result_type: "verification",
          bio_user_id: "user003",
          bio_result: "FALSE_LOW",
          bio_score: 0.35,
          speech_millis: 4200
        },
        user_cnt: 1
      },
      dialog_info: {
        utt_list: [
          {
            leg: "AGENT",
            utt: "Olá, como posso ajudar?",
            is_final: true,
            confidence: 1.0,
            words: []
          },
          {
            leg: "USER",
            utt: "Quero cancelar minha conta imediatamente",
            is_final: true,
            confidence: 0.95,
            words: []
          }
        ],
        real_time_agent: {
          leg: "AGENT",
          utt: "Entendo sua solicitação...",
          is_final: false,
          words: []
        },
        real_time_user: {
          leg: "USER",
          utt: "Preciso fazer isso agora",
          is_final: false,
          words: []
        }
      },
      ai_info: {
        user_sentiment: "negative",
        user_emotions: "frustrated",
        user_anger_detected: true,
        user_intents: "cancel_account",
        agent_sentiment: "neutral",
        agent_tasks: "handle_cancellation",
        agent_next_task: "verify_identity_critical",
        agent_suggested_prompt: "ATENÇÃO: Verificação de identidade obrigatória antes de processar cancelamento"
      },
      user_info: {
        address: "Belo Horizonte, MG",
        age: {
          value: "30-40",
          status: "NOT_VERIFIED",
          description: "Idade não corresponde ao perfil cadastrado"
        },
        gender: {
          value: "M",
          status: "MATCH_LOW",
          description: "Gênero com baixa correspondência"
        },
        name: "Pedro Alves",
        user_id: "user003",
        trustLevel: 0.35,
        validAni: false
      },
      voice_info: {
        liveness_score: {
          label: "UNCERTAIN",
          global_post: 0.45
        },
        sat_result: {
          label: "INVALID",
          valid: false,
          gender_label: "M",
          gender_prob: 0.52,
          age_estimate: 35,
          age_label: "30-40"
        }
      },
      crm_data: [
        { key: "Cliente desde", value: "2023" },
        { key: "Status", value: "Ativo" }
      ],
      features: {
        voiceBiometrics: true,
        blacklisting: true,
        transcription: true,
        suggestions: true,
        summary: false,
        notes: true
      },
      fraud_info: {
        description: "Risco alto de fraude detectado",
        label: "HIGH_RISK"
      },
      user_sound: 0.45,
      suggestion: {
        suggestion: "ALERTA: Verificação adicional necessária. Solicite documentos.",
        htmlString: "<p><strong>ALERTA:</strong> Verificação adicional necessária. Solicite documentos.</p>"
      },
      notes: [
        { key: "Alerta", value: "Possível tentativa de fraude - verificar identidade" }
      ],
      blocklist_result: {
        result_type: "blocklist_check",
        bio_user_id: "user003",
        bio_result: "FALSE_LOW",
        bio_score: 0.35,
        speech_millis: 4200
      }
    },

    // Payload 4: Cliente VIP com múltiplas informações
    {
      session_info: {
        call_id: "CALL_004",
        ani: "+5511666554433"
      },
      bio_info: {
        status: "enrolled",
        bio_result: {
          result_type: "verification",
          bio_user_id: "user004",
          bio_result: "TRUE_HIGH",
          bio_score: 0.98,
          speech_millis: 2200
        },
        user_cnt: 1
      },
      dialog_info: {
        utt_list: [
          {
            leg: "AGENT",
            utt: "Bem-vindo, cliente VIP! Como posso ajudá-lo?",
            is_final: true,
            confidence: 1.0,
            words: []
          },
          {
            leg: "USER",
            utt: "Gostaria de informações sobre o novo produto premium",
            is_final: true,
            confidence: 0.96,
            words: []
          },
          {
            leg: "AGENT",
            utt: "Com certeza! Vou apresentar todas as vantagens",
            is_final: true,
            confidence: 1.0,
            words: []
          }
        ],
        real_time_agent: {
          leg: "AGENT",
          utt: "Preparando informações detalhadas...",
          is_final: false,
          words: []
        },
        real_time_user: {
          leg: "USER",
          utt: "Excelente",
          is_final: false,
          words: []
        }
      },
      ai_info: {
        user_sentiment: "positive",
        user_emotions: "interested",
        user_anger_detected: false,
        user_intents: "product_inquiry",
        agent_sentiment: "positive",
        agent_tasks: "present_premium_features",
        agent_next_task: "offer_upgrade",
        agent_suggested_prompt: "Destaque os benefícios exclusivos do plano premium"
      },
      user_info: {
        address: "Curitiba, PR",
        age: {
          value: "50-60",
          status: "MATCH_HIGH",
          description: "Idade estimada corresponde ao perfil"
        },
        gender: {
          value: "F",
          status: "MATCH_HIGH",
          description: "Gênero corresponde ao perfil"
        },
        name: "Ana Costa",
        user_id: "user004",
        trustLevel: 0.98,
        validAni: true
      },
      voice_info: {
        liveness_score: {
          label: "LIVE",
          global_post: 0.97
        },
        sat_result: {
          label: "VALID",
          valid: true,
          gender_label: "F",
          gender_prob: 0.94,
          age_estimate: 55,
          age_label: "50-60"
        }
      },
      crm_data: [
        { key: "Cliente desde", value: "2015" },
        { key: "Plano", value: "VIP Premium" },
        { key: "Última compra", value: "25/01/2025" },
        { key: "Total gasto", value: "R$ 45.000" },
        { key: "Status VIP", value: "Ativo" }
      ],
      features: {
        voiceBiometrics: true,
        blacklisting: false,
        transcription: true,
        suggestions: true,
        summary: true,
        notes: true
      },
      fraud_info: {
        description: "Sem risco de fraude",
        label: "SAFE"
      },
      user_sound: 0.91,
      suggestion: {
        suggestion: "Sugestão: Ofereça upgrade para plano exclusivo com desconto especial",
        htmlString: "<p>Sugestão: Ofereça upgrade para plano exclusivo com desconto especial</p>"
      },
      notes: [
        { key: "VIP", value: "Cliente VIP desde 2015" },
        { key: "Preferências", value: "Produtos premium e exclusivos" },
        { key: "Atendimento", value: "Prioridade máxima" }
      ],
      call_summary: {
        duration: 320,
        summary: "Cliente VIP consultou informações sobre novo produto premium. Interesse demonstrado.",
        timestamp: Date.now(),
        topic: "Consulta de produto premium",
        type: "sales"
      }
    },

    // Payload 5: Cliente com suporte técnico e resumo de chamada
    {
      session_info: {
        call_id: "CALL_005",
        ani: "+5511555443322"
      },
      bio_info: {
        status: "enrolled",
        bio_result: {
          result_type: "verification",
          bio_user_id: "user005",
          bio_result: "TRUE_MEDIUM",
          bio_score: 0.82,
          speech_millis: 3100
        },
        user_cnt: 1
      },
      dialog_info: {
        utt_list: [
          {
            leg: "AGENT",
            utt: "Olá! Suporte técnico, como posso ajudar?",
            is_final: true,
            confidence: 1.0,
            words: []
          },
          {
            leg: "USER",
            utt: "Estou com problema para acessar minha conta",
            is_final: true,
            confidence: 0.89,
            words: []
          },
          {
            leg: "AGENT",
            utt: "Vou verificar isso para você",
            is_final: true,
            confidence: 1.0,
            words: []
          },
          {
            leg: "USER",
            utt: "Obrigado pela ajuda",
            is_final: true,
            confidence: 0.93,
            words: []
          }
        ],
        real_time_agent: {
          leg: "AGENT",
          utt: "Verificando sistema de autenticação...",
          is_final: false,
          words: []
        },
        real_time_user: {
          leg: "USER",
          utt: "Ok, aguardo",
          is_final: false,
          words: []
        }
      },
      ai_info: {
        user_sentiment: "neutral",
        user_emotions: "calm",
        user_anger_detected: false,
        user_intents: "technical_support",
        agent_sentiment: "positive",
        agent_tasks: "troubleshoot_access",
        agent_next_task: "provide_solution",
        agent_suggested_prompt: "Verifique se o cliente precisa redefinir a senha"
      },
      user_info: {
        address: "Porto Alegre, RS",
        age: {
          value: "35-45",
          status: "MATCH_MEDIUM",
          description: "Idade estimada próxima ao perfil"
        },
        gender: {
          value: "M",
          status: "MATCH_HIGH",
          description: "Gênero corresponde ao perfil"
        },
        name: "Roberto Lima",
        user_id: "user005",
        trustLevel: 0.78,
        validAni: true
      },
      voice_info: {
        liveness_score: {
          label: "LIVE",
          global_post: 0.85
        },
        sat_result: {
          label: "VALID",
          valid: true,
          gender_label: "M",
          gender_prob: 0.88,
          age_estimate: 40,
          age_label: "35-45"
        }
      },
      crm_data: [
        { key: "Cliente desde", value: "2021" },
        { key: "Plano", value: "Standard" },
        { key: "Último acesso", value: "26/01/2025" }
      ],
      features: {
        voiceBiometrics: true,
        blacklisting: false,
        transcription: true,
        suggestions: true,
        summary: true,
        notes: true
      },
      fraud_info: {
        description: "Risco baixo",
        label: "SAFE"
      },
      user_sound: 0.72,
      suggestion: {
        suggestion: "Sugestão: Ofereça redefinição de senha ou verificação de email",
        htmlString: "<p>Sugestão: Ofereça redefinição de senha ou verificação de email</p>"
      },
      notes: [
        { key: "Problema", value: "Dificuldade de acesso à conta" },
        { key: "Solução", value: "Redefinição de senha oferecida" }
      ],
      call_summary: {
        duration: 195,
        summary: "Cliente relatou problema de acesso. Solução oferecida: redefinição de senha. Problema resolvido.",
        timestamp: Date.now(),
        topic: "Suporte técnico - Acesso",
        type: "support"
      }
    }
  ];

  return payloads;
}

/**
 * Get a specific mock payload by index (0-4)
 * Returns only visible elements (removes undefined values)
 */
export function getMockPayload(index) {
  const payloads = getMockPayloads();
  const payload = payloads[index % payloads.length];
  
  // Remove undefined values recursively
  const cleaned = removeUndefined(payload);
  
  return cleaned;
}

/**
 * Get current payload index based on time (changes every 10 seconds)
 */
export function getCurrentPayloadIndex() {
  const interval = 10000; // 10 seconds
  const now = Date.now();
  const index = Math.floor((now / interval) % 5);
  return index;
}

