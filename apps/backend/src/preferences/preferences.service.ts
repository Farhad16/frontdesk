import {Injectable} from '@nestjs/common'
import type {IUserPreference} from '@frontdesk/types'
import type {Prisma} from '@prisma/client'
import {PrismaService} from '../prisma/prisma.service'

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
    // Only one default at a time.
    if (isDefault) {
      await this.prisma.userPreference.updateMany({
        where: {userId, isDefault: true},
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
