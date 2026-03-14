import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getSupabaseAdmin } from '@/lib/supabase';

// Helper to create slugs
const createSlug = (name: string) => name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { ownerId, companyName, planType, email } = body;

        console.log(`[API/SEED] Iniciando seed para user: ${ownerId}, email: ${email}, arena: ${companyName}`);

        if (!ownerId || !companyName) {
            return NextResponse.json({ error: 'Missing ownerId or companyName' }, { status: 400 });
        }

        const slug = createSlug(companyName);
        const existing = await prisma.company.findFirst({ where: { slug } });
        const finalSlug = existing ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug;

        const supabase = getSupabaseAdmin();
        let retryCount = 0;
        const maxRetries = 10;
        let company = null;
        let lastError = null;
        let currentOwnerId = ownerId;

        while (retryCount < maxRetries) {
            try {
                // 1. Verificar se o usuário existe (Tenta por ID, depois por Email se falhar)
                let userData = null;
                const { data: byId, error: idError } = await supabase.auth.admin.getUserById(currentOwnerId);

                if (byId?.user) {
                    userData = byId.user;
                } else if (email) {
                    // Fallback: Busca na lista de usuários por email
                    const { data: list, error: listError } = await supabase.auth.admin.listUsers();
                    const found = list?.users.find(u => u.email === email);
                    if (found) {
                        userData = found;
                        currentOwnerId = found.id;
                    }
                }

                if (!userData) {
                    console.warn(`[API/SEED] Usuário não encontrado no Supabase (Tentativa ${retryCount + 1}/${maxRetries})`);
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    retryCount++;
                    continue;
                }

                console.log(`[API/SEED] Usuário confirmado: ${userData.email} (ID: ${currentOwnerId})`);

                // 2. Tentar criar a empresa
                company = await prisma.company.create({
                    data: {
                        name: companyName,
                        slug: finalSlug,
                        ownerId: currentOwnerId,
                        planType: 'FREE' // Sempre começa como FREE por segurança
                    }
                });

                if (company) break;
            } catch (e: any) {
                lastError = e;
                console.warn(`[API/SEED] Erro na tentativa ${retryCount + 1}/${maxRetries}: ${e.message}`);

                // P2003 = Prisma FK value doesn't exist
                if (e.message?.includes('Foreign key') || e.code === 'P2003') {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    retryCount++;
                } else {
                    throw e;
                }
            }
        }

        if (!company) {
            console.error('[API/SEED] Falha ao criar empresa:', lastError);
            return NextResponse.json({
                error: 'Erro de integridade ao criar arena. O usuário pode não ter sido totalmente propagado no sistema.',
                details: lastError?.message || 'Timeout esperando propagação.'
            }, { status: 500 });
        }

        console.log(`[API/SEED] Arena criada: ${company.slug}`);
        return NextResponse.json({ success: true, company });

    } catch (e: any) {
        console.error('[API/SEED] Erro crítico:', e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}

