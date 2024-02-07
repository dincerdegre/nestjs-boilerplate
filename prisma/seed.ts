import { PrismaClient } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  const existingUser = await prisma.user.findUnique({
    where: {
      email: 'info@demo.com',
    },
  });
  if (!existingUser) {
    const passwordHash = await argon.hash('demo123');
    await prisma.user.create({
      data: {
        name: 'Demo',
        surname: 'Kullanıcı',
        email: 'info@demo.com',
        phone: '5111234567',
        password: passwordHash,
        role: 'admin',
        status: 'active',
      },
    });
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
