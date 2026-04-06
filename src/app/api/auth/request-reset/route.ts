import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { inngest } from '@/lib/inngest/client';

export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();

        if (!email) {
            return NextResponse.json(
                { error: 'Email é obrigatório' },
                { status: 400 }
            );
        }

        console.log('Solicitando reset de senha para:', email);

        // Verificar se o usuário existe consultando de forma escalável a tabela auth.users pelo Prisma
        const user = await prisma.users.findFirst({
            where: { email: email.toLowerCase() }
        });

        if (!user) {
            // Por segurança, não revelamos se o email existe ou não
            console.log('Usuário não encontrado (ou requisitado para email não cadastrado)');
            return NextResponse.json({ 
                message: 'Se o email estiver cadastrado, você receberá um código de verificação.' 
            });
        }

        console.log('Usuário encontrado, gerando código.');

        // Gerar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        // Salvar token no banco com expiração de 15 minutos
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
        
        console.log('Salvando token no banco...');
        
        try {
            await prisma.passwordResetToken.create({
                data: {
                    email: email.toLowerCase(),
                    code,
                    expiresAt
                }
            });
            console.log('Token salvo com sucesso');
        } catch (dbError: any) {
            console.error('Erro ao salvar token no banco:', dbError);
            return NextResponse.json(
                { error: 'Erro ao gerar código de verificação' },
                { status: 500 }
            );
        }

        // Enviar email via Fila (Inngest) assíncronamente!
        console.log('Enfileirando disparo de email...');
        await inngest.send({
            name: "emails/password-reset",
            data: {
                email: email.toLowerCase(),
                code,
                expirationMinutes: 15,
            },
        });
        
        console.log('Disparo de email enfileirado com sucesso!');

        return NextResponse.json({ 
            message: 'Se o email estiver cadastrado, você receberá um código de verificação.' 
        });

    } catch (error: any) {
        console.error('Erro ao solicitar reset de senha:', error);
        return NextResponse.json(
            { error: 'Erro ao processar solicitação: ' + error.message },
            { status: 500 }
        );
    }
}
