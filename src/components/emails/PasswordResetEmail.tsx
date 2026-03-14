import * as React from 'react';

interface PasswordResetEmailProps {
    code: string;
    expirationMinutes?: number;
}

export function PasswordResetEmail({ code, expirationMinutes = 15 }: PasswordResetEmailProps) {
    return (
        <div style={{
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            backgroundColor: '#0a0a0a',
            padding: '40px 20px',
            minHeight: '400px'
        }}>
            <div style={{
                maxWidth: '480px',
                margin: '0 auto',
                backgroundColor: '#18181b',
                borderRadius: '16px',
                padding: '40px',
                border: '1px solid #27272a'
            }}>
                {/* Logo/Header */}
                <div style={{ textAlign: 'center' as const, marginBottom: '32px' }}>
                    <h1 style={{
                        color: '#22c55e',
                        fontSize: '24px',
                        fontWeight: 'bold',
                        margin: '0'
                    }}>
                        🏟️ Gerenciador de Quadras
                    </h1>
                </div>

                {/* Main Content */}
                <div style={{ textAlign: 'center' as const }}>
                    <h2 style={{
                        color: '#ffffff',
                        fontSize: '20px',
                        fontWeight: '600',
                        marginBottom: '16px'
                    }}>
                        Recuperação de Senha
                    </h2>
                    
                    <p style={{
                        color: '#a1a1aa',
                        fontSize: '14px',
                        lineHeight: '24px',
                        marginBottom: '32px'
                    }}>
                        Você solicitou a recuperação de senha da sua conta. 
                        Use o código abaixo para criar uma nova senha:
                    </p>

                    {/* Code Box */}
                    <div style={{
                        backgroundColor: '#27272a',
                        borderRadius: '12px',
                        padding: '24px',
                        marginBottom: '24px',
                        border: '2px dashed #3f3f46'
                    }}>
                        <p style={{
                            color: '#71717a',
                            fontSize: '12px',
                            textTransform: 'uppercase' as const,
                            letterSpacing: '1px',
                            margin: '0 0 8px 0'
                        }}>
                            Seu código de verificação
                        </p>
                        <p style={{
                            color: '#22c55e',
                            fontSize: '36px',
                            fontWeight: 'bold',
                            letterSpacing: '8px',
                            margin: '0',
                            fontFamily: 'monospace'
                        }}>
                            {code}
                        </p>
                    </div>

                    {/* Expiration Warning */}
                    <p style={{
                        color: '#f59e0b',
                        fontSize: '13px',
                        marginBottom: '32px',
                        padding: '12px',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        borderRadius: '8px',
                        border: '1px solid rgba(245, 158, 11, 0.2)'
                    }}>
                        ⏱️ Este código expira em <strong>{expirationMinutes} minutos</strong>
                    </p>

                    {/* Security Notice */}
                    <div style={{
                        borderTop: '1px solid #27272a',
                        paddingTop: '24px'
                    }}>
                        <p style={{
                            color: '#71717a',
                            fontSize: '12px',
                            lineHeight: '20px',
                            margin: '0'
                        }}>
                            🔒 Se você não solicitou esta recuperação de senha, 
                            ignore este email. Sua conta permanece segura.
                        </p>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div style={{
                textAlign: 'center' as const,
                marginTop: '24px'
            }}>
                <p style={{
                    color: '#52525b',
                    fontSize: '11px',
                    margin: '0'
                }}>
                    © 2026 Gerenciador de Quadras. Todos os direitos reservados.
                </p>
            </div>
        </div>
    );
}
