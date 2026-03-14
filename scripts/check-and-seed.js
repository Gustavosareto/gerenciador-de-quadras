
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

const prisma = new PrismaClient();
const LOG_FILE = 'seed-log.txt';

function log(msg) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function main() {
    log('--- STARTING SEED ---');
    try {
        const slug = 'arena-xp';
        
        let company = await prisma.company.findUnique({ where: { slug } });
        
        if (company) {
            log(`✅ Company '${slug}' already exists (ID: ${company.id}).`);
        } else {
            log(`ℹ️ Company '${slug}' not found. Attempting to create...`);
            
            // 1. Get Owner
            const users = await prisma.$queryRaw`SELECT id FROM auth.users LIMIT 1`;
            
            if (!users || users.length === 0) {
                log('❌ No users found in auth.users. Cannot create company due to FK constraint.');
                log('👉 Please create a user in Supabase Authentication first.');
                return;
            }
            
            const ownerId = users[0].id;
            log(`✅ Found user ID: ${ownerId}`);
            
            // 2. Create Company
            company = await prisma.company.create({
                data: {
                    name: 'Arena XP',
                    slug: slug,
                    ownerId: ownerId,
                    planType: 'PRO',
                    notificationSettings: { enable_whatsapp: true },
                    courts: {
                        create: [
                            { name: 'Quadra 1 - Society', type: 'FUTEBOL', hourlyRate: 120.00 },
                            { name: 'Quadra 2 - Areia', type: 'VOLEI', hourlyRate: 80.00 }
                        ]
                    }
                }
            });
            log(`🎉 Company created successfully! ID: ${company.id}`);
        }
    } catch (e) {
        log('💥 Error: ' + e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
