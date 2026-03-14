const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const companies = await prisma.company.findMany();
        console.log("Companies found:", companies.length);
        console.log(JSON.stringify(companies, null, 2));

        const users = await prisma.$queryRaw`SELECT id, email FROM auth.users`;
        console.log("Users found:", users);
    } catch (e) {
        console.error("Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
