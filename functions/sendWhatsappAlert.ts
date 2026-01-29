import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

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

Deno.serve(async (req) => {
  try {
    console.log("🚀 Iniciando função sendWhatsappAlert...");
    
    const base44 = createClientFromRequest(req);
    
    // Verificar autenticação
    console.log("🔐 Verificando autenticação...");
    if (!(await base44.auth.isAuthenticated())) {
      console.error("❌ Usuário não autenticado");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401,
        headers: { "Content-Type": "application/json" }
      });
    }
    console.log("✅ Usuário autenticado");

    // Obter payload da requisição
    console.log("📥 Lendo dados da requisição...");
    const { to, templateParams } = await req.json();
    console.log("📱 Número de destino:", to);
    console.log("📋 Parâmetros do template:", templateParams);
    
    if (!to || !templateParams) {
      console.error("❌ Dados insuficientes: to ou templateParams faltando");
      return new Response(JSON.stringify({ 
        error: 'Missing phone number or template parameters',
        received: { to: !!to, templateParams: !!templateParams }
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Formatar o número do destinatário
    console.log("📞 Formatando número de telefone...");
    const formattedTo = formatPhoneNumber(to);
    console.log("📞 Número formatado:", formattedTo);
    
    if (!formattedTo) {
      console.error("❌ Número de telefone inválido:", to);
      return new Response(JSON.stringify({ 
        error: 'Invalid phone number format',
        original: to,
        formatted: formattedTo
      }), { 
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // Verificar credenciais do ambiente com logs detalhados
    console.log("🔑 Verificando credenciais do WhatsApp...");
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    const phoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID");
    
    console.log("🔑 Access Token existe:", !!accessToken);
    console.log("🔑 Phone Number ID existe:", !!phoneNumberId);
    console.log("🔑 Access Token (primeiros 10 chars):", accessToken ? accessToken.substring(0, 10) + "..." : "não encontrado");
    console.log("🔑 Phone Number ID:", phoneNumberId || "não encontrado");
    
    // Listar todas as variáveis de ambiente para debug
    console.log("🌍 Variáveis de ambiente disponíveis:");
    for (const [key, value] of Object.entries(Deno.env.toObject())) {
      if (key.includes("WHATSAPP")) {
        console.log(`  ${key}: ${value ? "✅ configurado" : "❌ vazio"}`);
      }
    }

    if (!accessToken || !phoneNumberId) {
      console.error("❌ Credenciais do WhatsApp não configuradas!");
      console.error("❌ Access Token:", !!accessToken);
      console.error("❌ Phone Number ID:", !!phoneNumberId);
      
      return new Response(JSON.stringify({ 
        error: 'WhatsApp credentials are not configured on the server',
        details: {
          hasAccessToken: !!accessToken,
          hasPhoneNumberId: !!phoneNumberId,
          availableEnvVars: Object.keys(Deno.env.toObject()).filter(k => k.includes("WHATSAPP"))
        }
      }), { 
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
    }
    
    // Construir o corpo da requisição para a API do WhatsApp
    console.log("🔧 Construindo requisição para WhatsApp API...");
    const requestBody = {
      messaging_product: "whatsapp",
      to: formattedTo,
      type: "template",
      template: {
        name: "prazo_urgente_aviso", // Nome do template criado no WhatsApp Manager
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
    
    console.log("📤 Corpo da requisição:", JSON.stringify(requestBody, null, 2));
    
    // Enviar a requisição para a API do Meta
    console.log("🌐 Enviando requisição para Meta API...");
    const whatsappUrl = `https://graph.facebook.com/v19.0/${phoneNumberId}/messages`;
    console.log("🌐 URL:", whatsappUrl);
    
    const response = await fetch(whatsappUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${accessToken}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
    });

    console.log("📨 Status da resposta:", response.status);
    const responseData = await response.json();
    console.log("📨 Dados da resposta:", JSON.stringify(responseData, null, 2));

    if (!response.ok) {
      console.error("❌ Erro na API do WhatsApp:", responseData);
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
    console.log("✅ Mensagem enviada com sucesso!");
    return new Response(JSON.stringify({ 
      success: true, 
      messageId: responseData.messages?.[0]?.id,
      whatsappResponse: responseData
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("💥 Erro interno do servidor:", error);
    console.error("💥 Stack trace:", error.stack);
    return new Response(JSON.stringify({ 
      error: error.message,
      stack: error.stack,
      type: error.constructor.name
    }), { 
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
});