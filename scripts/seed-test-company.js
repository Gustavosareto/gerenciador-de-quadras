
require('dotenv').config({ path: '.env.local' });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const slug = 'arena-xp';
  console.log(`Checking for company with slug: ${slug}`);

  let company = await prisma.company.findUnique({
    where: { slug: slug },
  });

  if (!company) {
    console.log('Company not found. Creating test company...');
    
    try {
        // Try to fetch a real user ID from auth.users to satisfy FK
        const users = await prisma.$queryRaw`SELECT id FROM auth.users LIMIT 1`;
        let ownerId = '00000000-0000-0000-0000-000000000000';
        
        if (users && users.length > 0) {
            ownerId = users[0].id;
            console.log('Found user for owner:', ownerId);
        } else {
            console.warn('NO USERS FOUND. Using dummy UUID - this might fail if FK is enforced.');
        }

        company = await prisma.company.create({
            data: {
                name: 'Arena XP',
                slug: slug,
                ownerId: ownerId, 
                planType: 'PRO',
                
                courts: {
                    create: [
                        { name: 'Quadra 1 - Society', type: 'FUTEBOL', hourlyRate: 120.00 },
                        { name: 'Quadra 2 - Areia', type: 'VOLEI', hourlyRate: 80.00 }
                    ]
                }
            }
        });
        console.log('Test company created successfully!');
    } catch (e) {
        console.error('Failed to create company:', e.message);
    }
  } else {
    console.log('Company already exists:', company);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
