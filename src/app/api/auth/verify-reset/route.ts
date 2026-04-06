import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

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
            console.log('Tentativa de reset de senha com código inválido para o e-mail informado.');
            return NextResponse.json(
                { error: 'Código inválido ou expirado' },
                { status: 400 }
            );
        }

        // Buscar usuário no banco de forma otimizada
        console.log('Buscando usuário...');
        const user = await prisma.users.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuário não encontrado' },
                { status: 404 }
            );
        }

        // Atualizar senha no Supabase
        console.log('Atualizando senha...');
        const supabaseAdmin = getSupabaseAdmin();
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
