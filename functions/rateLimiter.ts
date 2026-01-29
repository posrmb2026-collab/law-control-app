/**
 * Rate Limiter Middleware para Funções Serverless
 * 
 * Implementa controle de taxa de requisições para proteger contra abuso
 * e garantir disponibilidade do sistema para 10.000 usuários simultâneos
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
  message?: string;
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// Store em memória (em produção, usar Redis)
const store: RateLimitStore = {};

/**
 * Limpa entradas expiradas do store
 */
function cleanExpiredEntries() {
  const now = Date.now();
  Object.keys(store).forEach(key => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}

/**
 * Extrai identificador do usuário da requisição
 */
function getUserIdentifier(req: Request): string {
  // Tentar obter user_id do header de autenticação
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    // Extrair user_id do token (simplificado)
    return authHeader;
  }
  
  // Fallback para IP (menos preciso, mas funciona)
  const ip = req.headers.get('x-forwarded-for') || 
             req.headers.get('x-real-ip') || 
             'unknown';
  
  return ip;
}

/**
 * Middleware de rate limiting
 * 
 * @param config - Configuração do rate limiter
 * @returns Função middleware
 */
export function rateLimiter(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    message = 'Too many requests, please try again later.'
  } = config;

  return async (req: Request): Promise<Response | null> => {
    // Limpar entradas expiradas periodicamente
    if (Math.random() < 0.01) { // 1% de chance a cada requisição
      cleanExpiredEntries();
    }

    const identifier = getUserIdentifier(req);
    const now = Date.now();
    
    // Inicializar ou recuperar dados do usuário
    if (!store[identifier] || store[identifier].resetTime < now) {
      store[identifier] = {
        count: 0,
        resetTime: now + windowMs
      };
    }

    // Incrementar contador
    store[identifier].count++;

    // Verificar se excedeu o limite
    if (store[identifier].count > maxRequests) {
      const resetIn = Math.ceil((store[identifier].resetTime - now) / 1000);
      
      return new Response(
        JSON.stringify({
          error: 'rate_limit_exceeded',
          message,
          retryAfter: resetIn,
          limit: maxRequests,
          window: windowMs / 1000,
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': resetIn.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': store[identifier].resetTime.toString(),
          }
        }
      );
    }

    // Adicionar headers informativos
    const remaining = maxRequests - store[identifier].count;
    
    // Retornar null para indicar que a requisição pode prosseguir
    // Os headers serão adicionados na resposta final
    return null;
  };
}

/**
 * Configurações pré-definidas de rate limiting
 */
export const RateLimitPresets = {
  // Limite estrito para operações sensíveis
  strict: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Too many requests. Please wait before trying again.'
  },
  
  // Limite moderado para operações normais
  moderate: {
    maxRequests: 100,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Rate limit exceeded. Please slow down.'
  },
  
  // Limite permissivo para leitura
  permissive: {
    maxRequests: 300,
    windowMs: 60 * 1000, // 1 minuto
    message: 'Too many requests. Please try again in a moment.'
  },
  
  // Limite para autenticação
  auth: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutos
    message: 'Too many authentication attempts. Please try again later.'
  }
};

/**
 * Exemplo de uso em uma função serverless
 */
export function withRateLimit(
  handler: (req: Request) => Promise<Response>,
  config: RateLimitConfig
) {
  const limiter = rateLimiter(config);
  
  return async (req: Request): Promise<Response> => {
    // Verificar rate limit
    const limitResponse = await limiter(req);
    if (limitResponse) {
      return limitResponse;
    }
    
    // Executar handler original
    return handler(req);
  };
}
