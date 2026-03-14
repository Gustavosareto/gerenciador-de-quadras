import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
    try {
        const { email, code, newPassword } = await req.json();

        console.log('Verificando código para:', email, 'código:', code);

        if (!email || !code || !newPassword) {
            return NextResponse.json(
                { error: 'Email, código e nova senha são obrigatórios' },
                { status: 400 }
            );
        }

        // Validar senha
        if (newPassword.length < 6) {
            return NextResponse.json(
                { error: 'A senha deve ter no mínimo 6 caracteres' },
                { status: 400 }
            );
        }

        // Buscar token válido
        console.log('Buscando token no banco...');
        const token = await prisma.passwordResetToken.findFirst({
            where: {
                email: email.toLowerCase(),
                code: code.toString(),
                expiresAt: { gte: new Date() },
                usedAt: null
            },
            orderBy: { createdAt: 'desc' }
        });

        console.log('Token encontrado:', token ? 'Sim' : 'Não');

        if (!token) {
            // Debug: buscar todos os tokens deste email para entender o problema
            const allTokens = await prisma.passwordResetToken.findMany({
                where: { email: email.toLowerCase() },
                orderBy: { createdAt: 'desc' },
                take: 5
            });
            console.log('Todos os tokens para este email:', allTokens.map(t => ({
                code: t.code,
                expiresAt: t.expiresAt,
                usedAt: t.usedAt,
                expired: t.expiresAt < new Date()
            })));
            
            return NextResponse.json(
                { error: 'Código inválido ou expirado' },
                { status: 400 }
            );
        }

        // Buscar usuário no Supabase
        console.log('Buscando usuário no Supabase...');
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.error('Erro ao buscar usuários:', authError);
            return NextResponse.json(
                { error: 'Erro ao verificar usuário' },
                { status: 500 }
            );
        }

        const user = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        console.log('Usuário encontrado:', user ? user.id : 'Não');

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        // Atualizar senha no Supabase
        console.log('Atualizando senha...');
        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
            user.id,
            { password: newPassword }
        );

        if (updateError) {
            console.error('Erro ao atualizar senha:', updateError);
            return NextResponse.json(
                { error: 'Erro ao atualizar senha' },
                { status: 500 }
            );
        }

        // Marcar token como usado
        await prisma.passwordResetToken.update({
            where: { id: token.id },
            data: { usedAt: new Date() }
        });

        console.log('Senha atualizada com sucesso!');

        return NextResponse.json({ 
            message: 'Senha atualizada com sucesso!' 
        });

    } catch (error: any) {
        console.error('Erro ao verificar código:', error);
        return NextResponse.json(
            { error: 'Erro ao processar solicitação' },
            { status: 500 }
        );
    }
}
