
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function optimize() {
    console.log("🚀 STARTING DATABASE OPTIMIZATION...");
    console.log("   Target: Creating missing indexes for RLS & Foreign Keys\n");

    const commands = [
        // 1. Payments (Finance Tab)
        `CREATE INDEX IF NOT EXISTS idx_payments_company_id ON payments(company_id)`,
        `CREATE INDEX IF NOT EXISTS idx_payments_reservation_id ON payments(reservation_id)`,
        `CREATE INDEX IF NOT EXISTS idx_payments_status_ex ON payments(status, expires_at)`,

        // 2. Ledger (Finance Transactions)
        `CREATE INDEX IF NOT EXISTS idx_ledger_company_id ON ledger_entries(company_id)`,
        `CREATE INDEX IF NOT EXISTS idx_ledger_payment_id ON ledger_entries(payment_id)`,
        `CREATE INDEX IF NOT EXISTS idx_ledger_payout_id ON ledger_entries(payout_id)`,
        `CREATE INDEX IF NOT EXISTS idx_ledger_created_at ON ledger_entries(created_at DESC)`,

        // 3. Notifications & Jobs
        `CREATE INDEX IF NOT EXISTS idx_notification_company_id ON notification_jobs(company_id)`,
        `CREATE INDEX IF NOT EXISTS idx_notification_customer_id ON notification_jobs(customer_id)`,

        // 4. Payouts
        `CREATE INDEX IF NOT EXISTS idx_payouts_company_id ON payouts(company_id)`,
        `CREATE INDEX IF NOT EXISTS idx_payouts_batch_id ON payouts(batch_id)`,

        // 5. Customers (Search & Auth)
        `CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email)`,
        `CREATE INDEX IF NOT EXISTS idx_customers_cpf ON customers(cpf)`,

        // 6. Webhooks (Queue processing)
        `CREATE INDEX IF NOT EXISTS idx_webhooks_status ON webhook_events(status)`,

        // 7. Reservations (Status filtering)
        `CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status)`,
        `CREATE INDEX IF NOT EXISTS idx_reservations_start_at ON reservations(start_at)`
    ];

    for (const sql of commands) {
        try {
            process.stdout.write(`   Executing: ${sql.substring(0, 60)}... `);
            await prisma.$queryRawUnsafe(sql);
            console.log("✅ OK");
        } catch (e) {
            console.log("❌ ERROR");
            console.error(`      -> ${e.message.split('\n')[0]}`);
        }
    }

    // 8. Vacuum Analyze (Update planner stats)
    console.log("\n🧹 Running VACUUM ANALYZE to update query planner stats...");
    try {
        await prisma.$queryRawUnsafe(`VACUUM ANALYZE`);
        console.log("✅ Stats updated.");
    } catch (e) {
        console.log("⚠️ Could not run VACUUM (might require superuser). Skiping.");
    }

    console.log("\n✨ OPTIMIZATION COMPLETE!");
    await prisma.$disconnect();
}

optimize();
