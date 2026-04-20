const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deleteGeorge() {
    try {
        console.log('Searching for George...');
        const employees = await prisma.employee.findMany({
            where: {
                name: {
                    contains: 'George',
                    mode: 'insensitive'
                }
            }
        });

        if (employees.length === 0) {
            console.log('George not found in Employee table.');
        }

        for (const emp of employees) {
            console.log(`Deleting Employee: ${emp.name} (${emp.email})`);
            await prisma.employee.delete({
                where: { id: emp.id }
            });

            // Delete User model too if it exists
            try {
                await prisma.user.delete({
                    where: { email: emp.email }
                });
                console.log(`Deleted corresponding User: ${emp.email}`);
            } catch (e) {
                console.log(`No corresponding User found for ${emp.email}`);
            }
        }
        
        // Let's also check User table in case it exists there but not in Employee
        const users = await prisma.user.findMany({
            where: {
                name: {
                    contains: 'George',
                    mode: 'insensitive'
                }
            }
        });
        
        for (const user of users) {
             console.log(`Deleting stray User: ${user.name} (${user.email})`);
             await prisma.user.delete({
                 where: { id: user.id }
             });
        }
        
        console.log('Done!');
    } catch (err) {
        console.error('Error during deletion:', err);
    } finally {
        await prisma.$disconnect();
    }
}

deleteGeorge();
