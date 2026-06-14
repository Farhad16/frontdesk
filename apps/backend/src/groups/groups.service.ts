import {Injectable, NotFoundException} from '@nestjs/common'
import {
  GROUP_CONFIGS,
  SEEDED_GROUP_KEYS,
  type ICatalogItem,
  type ICatalogSection,
  type IGroupConfig,
  type IGroupSummary,
} from '@frontdesk/types'
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

  catalogItems(): ICatalogItem[] {
    const items: ICatalogItem[] = []
    const seen = new Set<string>()
    for (const key of SEEDED_GROUP_KEYS) {
      for (const category of GROUP_CONFIGS[key]?.catalog ?? []) {
        for (const item of category.items ?? []) {
          if (seen.has(item.key)) continue
          seen.add(item.key)
          items.push(item)
        }
      }
    }
    return items
  }

  catalogSections(): ICatalogSection[] {
    const sections = new Map<string, ICatalogSection>()
    for (const key of SEEDED_GROUP_KEYS) {
      for (const category of GROUP_CONFIGS[key]?.catalog ?? []) {
        if (category.freeText || !category.items?.length) continue
        const existing = sections.get(category.key)
        const section =
          existing ??
          ({key: category.key, labelKey: category.labelKey, emoji: category.emoji, items: []} as ICatalogSection)
        const seen = new Set(section.items.map(item => item.key))
        for (const item of category.items) {
          if (!seen.has(item.key)) section.items.push(item)
        }
        sections.set(category.key, section)
      }
    }
    return [...sections.values()]
  }
}
