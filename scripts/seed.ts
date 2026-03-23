import { PrismaClient, SocialRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'admin@social.com'
    const password = await bcrypt.hash('123456', 10)

    const user = await prisma.socialUser.upsert({
        where: { email },
        update: {},
        create: {
            email,
            name: 'Administrador Social',
            password,
            role: SocialRole.ADMIN,
        },
    })

    console.log({ user })
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
