import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        if (req.method !== 'POST') {
            return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
                status: 405,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Verificação de assinatura/segredo do webhook
        const expected = Deno.env.get('CAKTO_WEBHOOK_SECRET');
        const provided = req.headers.get('x-cakto-signature') || new URL(req.url).searchParams.get('token');
        
        if (expected && expected !== provided) {
            return new Response(JSON.stringify({ ok: false, error: 'Invalid signature' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const event = await req.json();
        
        // Estrutura esperada do webhook Cakto:
        // {
        //   "type": "payment.succeeded",
        //   "data": {
        //      "email": "cliente@exemplo.com",
        //      "customer_id": "cakto_cus_123",
        //      "subscription_id": "cakto_sub_456", 
        //      "plan": "mensal"|"anual"|"vitalicio",
        //      "paid_at": "2025-08-29T18:12:00Z",
        //      "period_end": "2025-09-29T18:12:00Z"
        //   }
        // }

        if (!event.type || !event.data) {
            return new Response(JSON.stringify({ ok: false, error: 'Malformed payload' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Eventos que ativam o acesso do usuário
        const ACTIVATING_EVENTS = new Set([
            'payment.succeeded',
            'subscription.activated', 
            'invoice.paid'
        ]);

        // Eventos que cancelam o acesso
        const CANCEL_EVENTS = new Set([
            'payment.refunded',
            'subscription.canceled',
            'invoice.payment_failed'
        ]);

        const d = event.data;
        const email = (d.email || '').trim().toLowerCase();
        
        if (!email) {
            return new Response(JSON.stringify({ ok: false, error: 'Missing email' }), {
                status: 422,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const now = new Date().toISOString();

        if (ACTIVATING_EVENTS.has(event.type)) {
            // Buscar usuário existente
            const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
            
            const updateData = {
                status_pagamento: 'ativo',
                plan: d.plan || 'mensal',
                cakto_customer_id: d.customer_id || '',
                cakto_subscription_id: d.subscription_id || '',
                paid_at: d.paid_at || now,
                expires_at: d.period_end || null,
                notes: `Ativado via webhook ${event.type} em ${now}`
            };

            if (existingUsers.length > 0) {
                // Atualizar usuário existente
                await base44.asServiceRole.entities.User.update(existingUsers[0].id, updateData);
            } else {
                // Criar novo usuário
                await base44.asServiceRole.entities.User.create({
                    email,
                    full_name: d.full_name || '',
                    ...updateData
                });
            }

            return new Response(JSON.stringify({ ok: true, status: 'ativo', email }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        if (CANCEL_EVENTS.has(event.type)) {
            const existingUsers = await base44.asServiceRole.entities.User.filter({ email });
            
            if (existingUsers.length > 0) {
                await base44.asServiceRole.entities.User.update(existingUsers[0].id, {
                    status_pagamento: 'cancelado',
                    notes: `Cancelado por webhook ${event.type} em ${now}`
                });
            }

            return new Response(JSON.stringify({ ok: true, status: 'cancelado', email }), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Eventos não relevantes para controle de acesso
        return new Response(JSON.stringify({ ok: true, ignored: event.type }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Erro no webhook Cakto:', error);
        return new Response(JSON.stringify({ ok: false, error: 'internal_error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});