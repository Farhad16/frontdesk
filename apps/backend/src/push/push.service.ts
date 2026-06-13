import {Injectable, Logger} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import type {IMessage, IPushSubscriptionInput, NotificationPref, Role} from '@frontdesk/types'
import type {PushSubscription, User} from '@prisma/client'
import * as webpush from 'web-push'
import {PrismaService} from '../prisma/prisma.service'

type SubWithUser = PushSubscription & {user: User}

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name)
  private readonly publicKey: string
  private readonly enabled: boolean

  constructor(
    private readonly prisma: PrismaService,
    config: ConfigService,
  ) {
    this.publicKey = config.get<string>('VAPID_PUBLIC_KEY') ?? ''
    const privateKey = config.get<string>('VAPID_PRIVATE_KEY') ?? ''
    const subject = config.get<string>('VAPID_SUBJECT') ?? 'mailto:demo@frontdesk.local'
    this.enabled = Boolean(this.publicKey && privateKey)
    if (this.enabled) webpush.setVapidDetails(subject, this.publicKey, privateKey)
  }

  getPublicKey(): string {
    return this.publicKey
  }

  async subscribe(userId: string, input: IPushSubscriptionInput): Promise<void> {
    await this.prisma.pushSubscription.upsert({
      where: {endpoint: input.endpoint},
      update: {userId, p256dh: input.keys.p256dh, auth: input.keys.auth},
      create: {userId, endpoint: input.endpoint, p256dh: input.keys.p256dh, auth: input.keys.auth},
    })
  }

  async notifyNewMessage(senderId: string, groupKey: string, message: IMessage): Promise<void> {
    const subs = await this.subscriptionsExcept(senderId)
    const targets = subs.filter(sub => wantsNewMessage(effectivePref(sub.user)))
    await this.dispatch(targets, message, groupKey)
  }

  async notifyOwnerUpdate(
    actorId: string,
    ownerId: string,
    groupKey: string,
    message: IMessage,
  ): Promise<void> {
    if (actorId === ownerId) return
    const subs = await this.prisma.pushSubscription.findMany({
      where: {userId: ownerId},
      include: {user: true},
    })
    const targets = subs.filter(sub => wantsOwnUpdate(effectivePref(sub.user)))
    await this.dispatch(targets, message, groupKey)
  }

  private async subscriptionsExcept(userId: string): Promise<SubWithUser[]> {
    return this.prisma.pushSubscription.findMany({
      where: {userId: {not: userId}},
      include: {user: true},
    })
  }

  private async dispatch(targets: SubWithUser[], message: IMessage, groupKey: string): Promise<void> {
    if (!this.enabled || targets.length === 0) return
    const payload = JSON.stringify({
      title: message.sender.name,
      body: message.summary ?? message.text ?? '',
      url: `/groups/${groupKey}`,
    })
    await Promise.all(
      targets.map(sub =>
        webpush
          .sendNotification(
            {endpoint: sub.endpoint, keys: {p256dh: sub.p256dh, auth: sub.auth}},
            payload,
          )
          .catch(async (error: {statusCode?: number}) => {
            if (error.statusCode === 404 || error.statusCode === 410) {
              await this.prisma.pushSubscription.delete({where: {endpoint: sub.endpoint}}).catch(() => {})
            } else {
              this.logger.warn(`push failed: ${error.statusCode ?? 'unknown'}`)
            }
          }),
      ),
    )
  }
}

function effectivePref(user: User): NotificationPref {
  return (user.role as Role) === 'STAFF' ? 'ALL' : user.notificationPref
}

function wantsNewMessage(pref: NotificationPref): boolean {
  return pref === 'ALL' || pref === 'NEW_MESSAGES'
}

function wantsOwnUpdate(pref: NotificationPref): boolean {
  return pref === 'ALL' || pref === 'MY_UPDATES'
}
