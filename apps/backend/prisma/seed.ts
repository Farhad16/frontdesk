import {GROUP_CONFIGS, SEEDED_GROUP_KEYS} from '@frontdesk/types'
import {PrismaClient} from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

const staffMembers = [
  {name: 'Hridoy', email: 'hridoy@kitchen.local'},
  {name: 'Yousuf', email: 'yousuf@kitchen.local'},
]

async function main() {
  const passwordHash = await bcrypt.hash('staff123', 10)
  for (const staff of staffMembers) {
    await prisma.user.upsert({
      where: {email: staff.email},
      update: {locale: 'bn'},
      create: {...staff, role: 'STAFF', provider: 'PASSWORD', passwordHash, locale: 'bn'},
    })
  }

  for (const key of SEEDED_GROUP_KEYS) {
    const config = GROUP_CONFIGS[key]
    if (!config) continue
    await prisma.group.upsert({
      where: {key},
      update: {nameKey: config.nameKey},
      create: {key, nameKey: config.nameKey},
    })
  }

  const users = await prisma.user.count()
  const groups = await prisma.group.count()
  console.log(`Seeded ${users} users and ${groups} groups.`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
