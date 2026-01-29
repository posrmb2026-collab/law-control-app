import { createClientFromRequest } from 'npm:@base44/sdk@0.5.0';

Deno.serve(async (req) => {
    const base44 = createClientFromRequest(req);
    
    try {
        // Verificação de segurança simples (opcional)
        const cronSecret = Deno.env.get('CRON_SECRET');
        const providedSecret = req.headers.get('x-cron-secret') || new URL(req.url).searchParams.get('secret');
        
        if (cronSecret && cronSecret !== providedSecret) {
            return new Response(JSON.stringify({ ok: false, error: 'Unauthorized' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        const now = new Date();
        const nowISO = now.toISOString();

        // Buscar usuários ativos com data de expiração vencida
        const allActiveUsers = await base44.asServiceRole.entities.User.filter({ 
            status_pagamento: 'ativo' 
        });

        const expiredUsers = allActiveUsers.filter(user => {
            if (!user.expires_at) return false; // Se não tem data de expiração, não expira
            
            const expiresAt = new Date(user.expires_at);
            return expiresAt <= now;
        });

        let processedCount = 0;
        const results = [];

        for (const user of expiredUsers) {
            try {
                await base44.asServiceRole.entities.User.update(user.id, {
                    status_pagamento: 'expirado',
                    notes: `${user.notes ? user.notes + ' | ' : ''}Expirado automaticamente em ${nowISO}`
                });

                processedCount++;
                results.push({
                    email: user.email,
                    expired_at: user.expires_at,
                    status: 'updated'
                });

                console.log(`Usuário ${user.email} marcado como expirado`);
            } catch (error) {
                console.error(`Erro ao atualizar usuário ${user.email}:`, error);
                results.push({
                    email: user.email,
                    status: 'error',
                    error: error.message
                });
            }
        }

        return new Response(JSON.stringify({
            ok: true,
            processed: processedCount,
            total_expired: expiredUsers.length,
            total_active_checked: allActiveUsers.length,
            executed_at: nowISO,
            results: results
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('Erro na verificação de expiração:', error);
        return new Response(JSON.stringify({
            ok: false,
            error: 'internal_error',
            message: error.message
        }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
});