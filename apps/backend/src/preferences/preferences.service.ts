import {Injectable} from '@nestjs/common'
import {GROUP_CONFIGS, SEEDED_GROUP_KEYS, type IUserPreference} from '@frontdesk/types'
import type {Prisma} from '@prisma/client'
import {PrismaService} from '../prisma/prisma.service'

function buildItemCategoryMap(): Map<string, string> {
  const map = new Map<string, string>()
  for (const key of SEEDED_GROUP_KEYS) {
    for (const category of GROUP_CONFIGS[key]?.catalog ?? []) {
      for (const item of category.items ?? []) {
        if (!map.has(item.key)) map.set(item.key, category.key)
      }
    }
  }
  return map
}

const ITEM_CATEGORY = buildItemCategoryMap()

@Injectable()
export class PreferencesService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<IUserPreference[]> {
    const rows = await this.prisma.userPreference.findMany({where: {userId}})
    return rows.map(row => ({
      itemKey: row.itemKey,
      options: row.options as IUserPreference['options'],
      isDefault: row.isDefault,
    }))
  }

  async save(
    userId: string,
    itemKey: string,
    options: IUserPreference['options'],
    isDefault = false,
  ): Promise<IUserPreference> {
    const data = options as unknown as Prisma.InputJsonValue
    // One default per section (category) — unset other defaults in the same category.
    if (isDefault) {
      const category = ITEM_CATEGORY.get(itemKey)
      const sameCategoryKeys = [...ITEM_CATEGORY.entries()]
        .filter(([, cat]) => cat === category)
        .map(([item]) => item)
      await this.prisma.userPreference.updateMany({
        where: {userId, isDefault: true, itemKey: {in: sameCategoryKeys}},
        data: {isDefault: false},
      })
    }
    await this.prisma.userPreference.upsert({
      where: {userId_itemKey: {userId, itemKey}},
      update: {options: data, isDefault},
      create: {userId, itemKey, options: data, isDefault},
    })
    return {itemKey, options, isDefault}
  }

  async remove(userId: string, itemKey: string): Promise<void> {
    await this.prisma.userPreference
      .delete({where: {userId_itemKey: {userId, itemKey}}})
      .catch(() => {})
  }
}
