require('dotenv').config({ path: '.env.local' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const sql = `
-- Create Courts Table
CREATE TABLE IF NOT EXISTS public.courts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  hourly_rate DECIMAL(10,2) NOT NULL,
  image TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP NOT NULL,
  CONSTRAINT courts_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies(id) ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_courts_company_id ON public.courts(company_id);

-- Check if reservations exists and add constraint if missing
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'reservations_court_id_fkey'
    ) THEN
        ALTER TABLE public.reservations 
        ADD CONSTRAINT reservations_court_id_fkey 
        FOREIGN KEY (court_id) REFERENCES public.courts(id) ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;
`;

async function main() {
  try {
    console.log("Connecting to DB...");
    const client = await pool.connect();
    console.log("Connected. Running SQL...");
    await client.query(sql);
    console.log("SQL executed successfully.");
    client.release();
  } catch (err) {
    console.error("Error executing SQL:", err);
  } finally {
    await pool.end();
  }
}

main();
