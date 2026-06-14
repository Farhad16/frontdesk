import {BREAKFAST_CATALOG, REQUESTS_CATALOG, type ICatalog} from './catalogs'
import type {Role} from './enums'

export interface IQuickAction {
  key: string
  emoji: string
  messageKey?: string
  visibleToRole?: Role
  opensDatePicker?: boolean
}

export interface IGroupConfig {
  key: string
  nameKey: string
  emoji: string
  catalog?: ICatalog
  freeText: boolean
  quickActions: IQuickAction[]
  statusTracking: boolean
}

export const GROUP_CONFIGS: Record<string, IGroupConfig> = {
  requests: {
    key: 'requests',
    nameKey: 'group.requests',
    emoji: '☕',
    catalog: REQUESTS_CATALOG,
    freeText: true,
    quickActions: [],
    statusTracking: true,
  },
  breakfast: {
    key: 'breakfast',
    nameKey: 'group.breakfast',
    emoji: '🍳',
    catalog: BREAKFAST_CATALOG,
    freeText: true,
    quickActions: [
      {key: 'askBreakfast', emoji: '🍳', messageKey: 'breakfast.msg.ask', visibleToRole: 'STAFF'},
    ],
    statusTracking: false,
  },
  lunch: {
    key: 'lunch',
    nameKey: 'group.lunch',
    emoji: '🍱',
    freeText: true,
    quickActions: [
      {key: 'offToday', emoji: '🚫', messageKey: 'lunch.msg.offToday', visibleToRole: 'REQUESTER'},
      {key: 'offDates', emoji: '📅', opensDatePicker: true, visibleToRole: 'REQUESTER'},
      {key: 'prompt', emoji: '📢', messageKey: 'lunch.msg.prompt', visibleToRole: 'STAFF'},
      {key: 'officeOff', emoji: '📅', opensDatePicker: true, visibleToRole: 'STAFF'},
    ],
    statusTracking: false,
  },
}

export const SEEDED_GROUP_KEYS = ['requests', 'breakfast', 'lunch'] as const
