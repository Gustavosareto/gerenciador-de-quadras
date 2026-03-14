import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { resend } from '@/lib/resend';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function getPasswordResetEmailHtml(code: string, expirationMinutes: number = 15): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #0a0a0a;">
    <div style="padding: 40px 20px; min-height: 400px;">
        <div style="max-width: 480px; margin: 0 auto; background-color: #18181b; border-radius: 16px; padding: 40px; border: 1px solid #27272a;">
            <div style="text-align: center; margin-bottom: 32px;">
                <h1 style="color: #22c55e; font-size: 24px; font-weight: bold; margin: 0;">
                    🏟️ Gerenciador de Quadras
                </h1>
            </div>
            <div style="text-align: center;">
                <h2 style="color: #ffffff; font-size: 20px; font-weight: 600; margin-bottom: 16px;">
                    Recuperação de Senha
                </h2>
                <p style="color: #a1a1aa; font-size: 14px; line-height: 24px; margin-bottom: 32px;">
                    Você solicitou a recuperação de senha da sua conta. 
                    Use o código abaixo para criar uma nova senha:
                </p>
                <div style="background-color: #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px; border: 2px dashed #3f3f46;">
                    <p style="color: #71717a; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px 0;">
                        Seu código de verificação
                    </p>
                    <p style="color: #22c55e; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 0; font-family: monospace;">
                        ${code}
                    </p>
                </div>
                <p style="color: #f59e0b; font-size: 13px; margin-bottom: 32px; padding: 12px; background-color: rgba(245, 158, 11, 0.1); border-radius: 8px; border: 1px solid rgba(245, 158, 11, 0.2);">
                    ⏱️ Este código expira em <strong>${expirationMinutes} minutos</strong>
                </p>
                <div style="border-top: 1px solid #27272a; padding-top: 24px;">
                    <p style="color: #71717a; font-size: 12px; line-height: 20px; margin: 0;">
                        🔒 Se você não solicitou esta recuperação de senha, 
                        ignore este email. Sua conta permanece segura.
                    </p>
                </div>
            </div>
        </div>
        <div style="text-align: center; margin-top: 24px;">
            <p style="color: #52525b; font-size: 11px; margin: 0;">
                © 2026 Gerenciador de Quadras. Todos os direitos reservados.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

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

        // Verificar se o usuário existe no Supabase
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (authError) {
            console.error('Erro ao buscar usuários:', authError);
            return NextResponse.json(
                { error: 'Erro ao verificar usuário' },
                { status: 500 }
            );
        }

        const user = authData.users.find(u => u.email?.toLowerCase() === email.toLowerCase());

        if (!user) {
            // Por segurança, não revelamos se o email existe ou não
            console.log('Usuário não encontrado:', email);
            return NextResponse.json({ 
                message: 'Se o email estiver cadastrado, você receberá um código de verificação.' 
            });
        }

        console.log('Usuário encontrado:', user.id);

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

        // Enviar email com Resend
        console.log('Enviando email...');
        const { error: emailError } = await resend.emails.send({
            from: 'Gerenciador de Quadras <onboarding@resend.dev>',
            to: [email],
            subject: 'Código de Recuperação de Senha',
            html: getPasswordResetEmailHtml(code, 15),
        });

        if (emailError) {
            console.error('Erro ao enviar email:', emailError);
            // Não falhar a requisição, o código foi salvo
        } else {
            console.log('Email enviado com sucesso');
        }

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
