/**
 * Logic Executor Engine
 * Processa lógicas JSON e retorna respostas baseadas em keywords
 */

export interface LogicRule {
  keywords: string[];
  reply: string;
  mediaUrl?: string;
  image_url?: string; // Alias for mediaUrl (legacy/user support)
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  pause_bot_after_reply?: boolean;
  set_conversation_state?: string;
}

export interface LogicJson {
  rules: LogicRule[];
  default_reply?: string;
  pause_bot_after_reply?: boolean;
}

export interface ExecutionResult {
  reply: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'document';
  shouldPause: boolean;
  conversationState?: string;
}

/**
 * Normaliza texto removendo acentos, maiúsculas e espaços extras
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .trim();
}

/**
 * Executa lógica JSON contra mensagem recebida
 */
export function executeLogic(
  messageContent: string,
  logicJson: LogicJson
): ExecutionResult {
  const normalizedMessage = normalizeText(messageContent);

  // Validate logicJson structure
  if (!logicJson || typeof logicJson !== 'object') {
    console.error('[LogicExecutor] Invalid logicJson: not an object', logicJson);
    return {
      reply: "Erro: Lógica inválida configurada.",
      shouldPause: false,
    };
  }

  // Ensure rules is an array
  if (!Array.isArray(logicJson.rules)) {
    console.error('[LogicExecutor] Invalid logicJson.rules: not an array', logicJson);
    return {
      reply: logicJson.default_reply || "Erro: Lógica mal configurada.",
      shouldPause: logicJson.pause_bot_after_reply ?? false,
    };
  }

  // 1. First pass: Check for EXACT matches (highest priority)
  for (const rule of logicJson.rules) {
    if (!rule || !Array.isArray(rule.keywords)) continue;

    const exactMatch = rule.keywords.some(keyword => {
      const normalizedKeyword = normalizeText(keyword);
      return normalizedMessage === normalizedKeyword;
    });

    if (exactMatch) {
      return {
        reply: rule.reply,
        mediaUrl: rule.mediaUrl || rule.image_url,
        mediaType: rule.mediaType,
        shouldPause: rule.pause_bot_after_reply ?? false,
        conversationState: rule.set_conversation_state,
      };
    }
  }

  // 2. Second pass: Check for WORD BOUNDARY matches (medium priority)
  // This prevents "1" from matching inside "p1", but allows "1" to match "1" or "opcao 1"
  for (const rule of logicJson.rules) {
    if (!rule || !Array.isArray(rule.keywords)) continue;

    const wordMatch = rule.keywords.some(keyword => {
      const normalizedKeyword = normalizeText(keyword);
      // Create regex for whole word match
      const regex = new RegExp(`\\b${normalizedKeyword}\\b`, 'i');
      return regex.test(normalizedMessage);
    });

    if (wordMatch) {
      return {
        reply: rule.reply,
        mediaUrl: rule.mediaUrl || rule.image_url,
        mediaType: rule.mediaType,
        shouldPause: rule.pause_bot_after_reply ?? false,
        conversationState: rule.set_conversation_state,
      };
    }
  }

  // 3. Third pass: Fallback to simple includes (lowest priority)
  // Only if no exact or word match found
  for (const rule of logicJson.rules) {
    if (!rule || !Array.isArray(rule.keywords)) continue;

    const partialMatch = rule.keywords.some(keyword => {
      const normalizedKeyword = normalizeText(keyword);
      return normalizedMessage.includes(normalizedKeyword);
    });

    if (partialMatch) {
      return {
        reply: rule.reply,
        mediaUrl: rule.mediaUrl || rule.image_url,
        mediaType: rule.mediaType,
        shouldPause: rule.pause_bot_after_reply ?? false,
        conversationState: rule.set_conversation_state,
      };
    }
  }

  // Se não encontrou match, usar resposta padrão
  return {
    reply: logicJson.default_reply || "Desculpe, não entendi sua mensagem.",
    shouldPause: logicJson.pause_bot_after_reply ?? false,
  };
}
