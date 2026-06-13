import {Injectable} from '@nestjs/common'
import {GROUP_CONFIGS, SEEDED_GROUP_KEYS, type IGroupSummary} from '@frontdesk/types'

@Injectable()
export class GroupsService {
  list(): IGroupSummary[] {
    return SEEDED_GROUP_KEYS.map(key => GROUP_CONFIGS[key])
      .filter((config): config is NonNullable<typeof config> => Boolean(config))
      .map(config => ({key: config.key, nameKey: config.nameKey, emoji: config.emoji}))
  }
}
