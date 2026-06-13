import type {Availability, MessageType, NotificationPref, Role, Status} from './enums'

export interface IRequestLineItem {
  category: string
  item: string
  options?: Record<string, string | string[]>
  quantity: number
  addOns?: string[]
  summary?: string
}
export interface IRequestPayload {
  items: IRequestLineItem[]
  note?: string
}
export interface ILunchOffPayload {
  lunchOff: {from: string; to: string}
  scope: 'me' | 'office'
}
export type IMessagePayload = IRequestPayload | ILunchOffPayload

export interface IMessageSender {
  id: string
  name: string
  photoUrl?: string
  role: Role
  availability?: Availability
}
export interface IMessage {
  id: string
  groupId: string
  sender: IMessageSender
  type: MessageType
  text?: string
  payload?: IMessagePayload
  status?: Status
  summary?: string
  deletedAt?: string | null
  createdAt: string
  updatedAt: string
}
export interface ICreateMessageInput {
  groupId: string
  type: MessageType
  text?: string
  payload?: IMessagePayload
  quickActionKey?: string
}

export interface ICurrentUser {
  id: string
  name: string
  email: string
  photoUrl?: string
  role: Role
  locale: string
  notificationPref: NotificationPref
  availability: Availability
  addOns: string[]
}
export interface ILoginInput {
  email: string
  password: string
}
export interface ISignupInput {
  name: string
  email: string
  password: string
}
export interface IOAuthProfile {
  email: string
  name: string
  photoUrl?: string
  providerId: string
}
export interface IPushSubscriptionInput {
  endpoint: string
  keys: {p256dh: string; auth: string}
}
