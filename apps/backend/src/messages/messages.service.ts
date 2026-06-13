import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import {
  GROUP_CONFIGS,
  type IMessage,
  type IMessagePayload,
  type IRequestQueueItem,
  type IStatusUpdateResult,
  type Role,
  type Status,
} from '@frontdesk/types'
import type {Message, Prisma, User} from '@prisma/client'
import {EventsService} from '../events/events.service'
import {PrismaService} from '../prisma/prisma.service'
import {PushService} from '../push/push.service'
import type {CreateRequestDto} from './dto/request.dto'

const STATUS_LABEL: Record<Status, string> = {
  PENDING: 'pending',
  IN_PROGRESS: 'in progress',
  DONE: 'done',
  CANCELLED: 'cancelled',
}

type MessageWithSender = Message & {sender: User}

@Injectable()
export class MessagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsService,
    private readonly push: PushService,
  ) {}

  async listForGroup(groupKey: string): Promise<IMessage[]> {
    const group = await this.requireGroup(groupKey)
    const messages = await this.prisma.message.findMany({
      where: {groupId: group.id},
      orderBy: {createdAt: 'asc'},
      include: {sender: true},
    })
    return messages.map(toMessage)
  }

  async createText(groupKey: string, senderId: string, text: string): Promise<IMessage> {
    const group = await this.requireGroup(groupKey)
    const message = await this.prisma.message.create({
      data: {groupId: group.id, senderId, type: 'TEXT', text},
      include: {sender: true},
    })
    const mapped = toMessage(message)
    this.events.emit({type: 'message:new', groupKey, message: mapped})
    void this.push.notifyNewMessage(senderId, groupKey, mapped)
    return mapped
  }

  async createRequest(groupKey: string, senderId: string, dto: CreateRequestDto): Promise<IMessage> {
    const group = await this.requireGroup(groupKey)
    const tracksStatus = GROUP_CONFIGS[groupKey]?.statusTracking ?? false
    const message = await this.prisma.message.create({
      data: {
        groupId: group.id,
        senderId,
        type: 'REQUEST',
        payload: {items: dto.items, note: dto.note} as unknown as Prisma.InputJsonValue,
        summary: dto.summary,
        status: tracksStatus ? 'PENDING' : null,
      },
      include: {sender: true},
    })
    const mapped = toMessage(message)
    this.events.emit({type: 'message:new', groupKey, message: mapped})
    void this.push.notifyNewMessage(senderId, groupKey, mapped)
    return mapped
  }

  async listRequests(): Promise<IRequestQueueItem[]> {
    const messages = await this.prisma.message.findMany({
      where: {type: 'REQUEST'},
      orderBy: {createdAt: 'desc'},
      include: {sender: true, group: true},
    })
    return messages.map(message => ({groupKey: message.group.key, message: toMessage(message)}))
  }

  async updateStatus(
    groupKey: string,
    messageId: string,
    actor: {id: string; role: Role},
    next: Status,
  ): Promise<IStatusUpdateResult> {
    const group = await this.requireGroup(groupKey)
    const message = await this.prisma.message.findUnique({
      where: {id: messageId},
      include: {sender: true},
    })
    if (!message || message.groupId !== group.id) throw new NotFoundException('Request not found')
    if (message.type !== 'REQUEST' || message.status === null) {
      throw new BadRequestException('Message is not status-tracked')
    }

    this.assertTransition(message.status, next, actor, message.senderId)

    const actorUser = await this.prisma.user.findUnique({where: {id: actor.id}})
    if (!actorUser) throw new ForbiddenException()

    const [updated, system] = await this.prisma.$transaction([
      this.prisma.message.update({
        where: {id: messageId},
        data: {status: next},
        include: {sender: true},
      }),
      this.prisma.message.create({
        data: {
          groupId: group.id,
          senderId: actor.id,
          type: 'SYSTEM',
          text: `${actorUser.name} marked it ${STATUS_LABEL[next]}`,
        },
        include: {sender: true},
      }),
    ])

    const result = {message: toMessage(updated), system: toMessage(system)}
    this.events.emit({type: 'message:status', groupKey, message: result.message})
    this.events.emit({type: 'message:new', groupKey, message: result.system})
    void this.push.notifyOwnerUpdate(actor.id, result.message.sender.id, groupKey, result.message)
    return result
  }

  private assertTransition(
    current: Status,
    next: Status,
    actor: {id: string; role: Role},
    ownerId: string,
  ): void {
    if (actor.role === 'STAFF') {
      const allowed: Partial<Record<Status, Status>> = {PENDING: 'IN_PROGRESS', IN_PROGRESS: 'DONE'}
      if (allowed[current] !== next) throw new ForbiddenException('Invalid transition for staff')
      return
    }
    const isOwner = actor.id === ownerId
    if (!isOwner || current !== 'PENDING' || next !== 'CANCELLED') {
      throw new ForbiddenException('Members can only cancel their own pending request')
    }
  }

  private async requireGroup(groupKey: string) {
    const group = await this.prisma.group.findUnique({where: {key: groupKey}})
    if (!group) throw new NotFoundException('Group not found')
    return group
  }
}

function toMessage(message: MessageWithSender): IMessage {
  return {
    id: message.id,
    groupId: message.groupId,
    sender: {
      id: message.sender.id,
      name: message.sender.name,
      photoUrl: message.sender.photoUrl ?? undefined,
      role: message.sender.role,
      availability: message.sender.availability,
    },
    type: message.type,
    text: message.text ?? undefined,
    payload: (message.payload as IMessagePayload | null) ?? undefined,
    status: message.status ?? undefined,
    summary: message.summary ?? undefined,
    deletedAt: null,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  }
}
