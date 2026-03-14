
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const { Pool } = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');

const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function runDiagnostics() {
    console.log("🔍 STARTING DATABASE DIAGNOSTICS...\n");

    try {
        // 1. Table Sizes & Row Counts
        console.log("📊 (1/4) TABLE SIZES & VOLUMES:");
        const tableSizes = await prisma.$queryRawUnsafe(`
            SELECT
                relname as "Table",
                n_live_tup as "Est. Rows",
                pg_size_pretty(pg_total_relation_size(relid)) as "Total Size",
                pg_size_pretty(pg_relation_size(relid)) as "Data Size",
                pg_size_pretty(pg_total_relation_size(relid) - pg_relation_size(relid)) as "Index Size"
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
            ORDER BY pg_total_relation_size(relid) DESC;
        `);
        console.table(tableSizes);

        // 2. Sequential Scans (Missing Indexes Indicators)
        console.log("\n🚀 (2/4) SEQUENTIAL SCANS (Scan vs Index Usage):");
        console.log("   (High 'Seq Scan' on large tables = BAD performance)");
        const seqScans = await prisma.$queryRawUnsafe(`
            SELECT
                relname as "Table",
                seq_scan as "Seq Scans (Bad)",
                idx_scan as "Index Scans (Good)",
                pg_size_pretty(pg_total_relation_size(relid)) as "Size"
            FROM pg_stat_user_tables
            WHERE schemaname = 'public'
            ORDER BY seq_scan DESC
            LIMIT 15;
        `);
        console.table(seqScans);

        // 3. Existing Indexes
        console.log("\n📇 (3/4) EXISTING INDEXES:");
        const indexes = await prisma.$queryRawUnsafe(`
            SELECT
                tablename as "Table",
                indexname as "Index Name",
                substring(indexdef from 'USING .*') as "Definition"
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname;
        `);
        // Grouping by table for cleaner output if needed, but table is fine
        console.table(indexes);

        // 4. Slow Queries (pg_stat_statements)
        console.log("\n🐢 (4/4) TOP SLOW QUERIES (pg_stat_statements):");
        try {
            const slowQueries = await prisma.$queryRawUnsafe(`
                SELECT
                    substring(query, 1, 150) as "Query Snippet",
                    calls as "Calls",
                    round(total_exec_time::numeric, 2) as "Total Time (ms)",
                    round(mean_exec_time::numeric, 2) as "Avg Time (ms)"
                FROM pg_stat_statements
                ORDER BY total_exec_time DESC
                LIMIT 10;
            `);
            console.table(slowQueries);
        } catch (e) {
            console.log("⚠️ Could not fetch pg_stat_statements. Extension might not be enabled or user lacks permissions.");
            console.log("   Error:", e.message.split('\n')[0]);
        }

    } catch (error) {
        console.error("❌ DIAGNOSTIC ERROR:", error);
    } finally {
        await prisma.$disconnect();
    }
}

runDiagnostics();
