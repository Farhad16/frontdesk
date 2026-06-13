export const Role = {REQUESTER: 'REQUESTER', STAFF: 'STAFF'} as const
export type Role = (typeof Role)[keyof typeof Role]

export const Provider = {GOOGLE: 'GOOGLE', PASSWORD: 'PASSWORD'} as const
export type Provider = (typeof Provider)[keyof typeof Provider]

export const NotificationPref = {
  OFF: 'OFF',
  MY_UPDATES: 'MY_UPDATES',
  NEW_MESSAGES: 'NEW_MESSAGES',
  ALL: 'ALL',
} as const
export type NotificationPref = (typeof NotificationPref)[keyof typeof NotificationPref]

export const Availability = {AVAILABLE: 'AVAILABLE', BUSY: 'BUSY', AWAY: 'AWAY'} as const
export type Availability = (typeof Availability)[keyof typeof Availability]

export const MessageType = {
  TEXT: 'TEXT',
  QUICK: 'QUICK',
  REQUEST: 'REQUEST',
  SYSTEM: 'SYSTEM',
} as const
export type MessageType = (typeof MessageType)[keyof typeof MessageType]

export const Status = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
} as const
export type Status = (typeof Status)[keyof typeof Status]
