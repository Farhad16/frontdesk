import {Injectable, NotFoundException} from '@nestjs/common'
import {GROUP_CONFIGS, SEEDED_GROUP_KEYS, type IGroupConfig, type IGroupSummary} from '@frontdesk/types'
import {PrismaService} from '../prisma/prisma.service'

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(): Promise<IGroupSummary[]> {
    const groups = await this.prisma.group.findMany({
      include: {
        messages: {
          where: {deletedAt: null},
          orderBy: {createdAt: 'desc'},
          take: 1,
          include: {sender: true},
        },
      },
    })
    const byKey = new Map(groups.map(group => [group.key, group]))

    return SEEDED_GROUP_KEYS.map(key => GROUP_CONFIGS[key])
      .filter((config): config is NonNullable<typeof config> => Boolean(config))
      .map(config => {
        const last = byKey.get(config.key)?.messages[0]
        return {
          key: config.key,
          nameKey: config.nameKey,
          emoji: config.emoji,
          lastMessage: last
            ? {
                type: last.type,
                text: last.text ?? undefined,
                summary: last.summary ?? undefined,
                senderName: last.sender.name,
                createdAt: last.createdAt.toISOString(),
              }
            : undefined,
        }
      })
  }

  getConfig(key: string): IGroupConfig {
    const config = GROUP_CONFIGS[key]
    if (!config) throw new NotFoundException('Group not found')
    return config
  }
}
