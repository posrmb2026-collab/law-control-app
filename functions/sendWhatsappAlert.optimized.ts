import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';
import { withRateLimit, RateLimitPresets } from './rateLimiter.ts';

// Função para formatar o número de telefone para o padrão E.164
const formatPhoneNumber = (phone) => {
  if (!phone) return null;
  // Remove caracteres não numéricos
  let cleaned = ('' + phone).replace(/\D/g, '');
  
  // Adiciona '9' se for um celular de São Paulo sem o nono dígito
  if (cleaned.length === 10 && (cleaned.startsWith('11') || cleaned.startsWith('1'))) {
     if(cleaned.length === 10 && cleaned.charAt(2) !== '9') {
        cleaned = cleaned.substring(0, 2) + '9' + cleaned.substring(2);
     }
  }

  // Remove o '0' inicial se houver (ex: 011...)
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
      cleaned = cleaned.substring(1);
  }

  // Adiciona o código do Brasil (55) se não estiver presente
  if (cleaned.length > 8 && !cleaned.startsWith('55')) {
    cleaned = '55' + cleaned;
  }
  
  if (cleaned.length < 12 || cleaned.length > 13) {
      console.warn(`Número de telefone inválido após formatação: ${phone} -> ${cleaned}`);
      return null;
  }
  
  return cleaned;
};

// Handler principal
const handler = async (req: Request): Promise<Response> => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticação
    if (!(await base44.auth.isAuthenticated())) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Obter payload da requisição
    const { to, templateParams } = await req.json();
    
    if (!to || !templateParams) {
      return new Response(JSON.stringify({ 
        error: 'Missing phone number or template parameters',
        received: { to: !!to, templateParams: !!templateParams }
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Formatar o número do destinatário
    const formattedTo = formatPhoneNumber(to);
    
    if (!formattedTo) {
      return new Response(JSON.stringify({ 
        error: 'Invalid phone number format',
        original: to,
        formatted: formattedTo
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verificar credenciais do ambiente
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");

    if (!accessToken || !phoneNumberId) {
      return new Response(JSON.stringify({ 
        error: 'WhatsApp credentials are not configured on the server',
        details: {
          hasAccessToken: !!accessToken,
          hasPhoneNumberId: !!phoneNumberId,
        }
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Construir o corpo da requisição para a API do WhatsApp
    const requestBody = {
      messaging_product: "whatsapp",
      to: formattedTo,
      type: "template",
      template: {
        name: "prazo_urgente_aviso",
        language: {
          code: "pt_BR"
        },
        components: [{
          type: "body",
          parameters: [
            { type: "text", text: templateParams.advogadoNome },
            { type: "text", text: templateParams.processoTitulo },
            { type: "text", text: templateParams.urgenciaTexto },
            { type: "text", text: templateParams.prazoDescricao },
            { type: "text", text: templateParams.dataLimite },
          ]
        }]
      }
    };
    
    // Enviar a requisição para a API do Meta
    const whatsappUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    
    const response = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: "Failed to send WhatsApp message", 
        details: responseData,
        status: response.status
      }), { 
        status: response.status,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Retornar sucesso
    return new Response(JSON.stringify({ 
      success: true, 
      messageId: responseData.messages?.[0]?.id,
      whatsappResponse: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      error: error.message,
      type: error.constructor.name
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

// Aplicar rate limiting: máximo 10 mensagens por minuto por usuário
Deno.serve(withRateLimit(handler, {
  maxRequests: 10,
  windowMs: 60 * 1000, // 1 minuto
  message: 'Você excedeu o limite de envio de mensagens WhatsApp. Aguarde um momento.'
}));
