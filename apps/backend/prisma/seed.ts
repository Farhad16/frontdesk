import {PrismaClient} from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const staffMembers = [
  {name: 'Karim', email: 'karim@kitchen.local'},
  {name: 'Rofiq', email: 'rofiq@kitchen.local'},
]

async function main() {
  const passwordHash = await bcrypt.hash('staff123', 10)
  for (const staff of staffMembers) {
    await prisma.user.upsert({
      where: {email: staff.email},
      update: {},
      create: {...staff, role: 'STAFF', provider: 'PASSWORD', passwordHash},
    })
  }
  const count = await prisma.user.count()
  console.log(`Seeded staff. Total users: ${count}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
