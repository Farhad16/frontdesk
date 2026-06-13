import {Injectable, NotFoundException} from '@nestjs/common'
import {GROUP_CONFIGS, type IMessage, type IMessagePayload} from '@frontdesk/types'
import type {Message, Prisma, User} from '@prisma/client'
import {PrismaService} from '../prisma/prisma.service'
import type {CreateRequestDto} from './dto/request.dto'

type MessageWithSender = Message & {sender: User}

@Injectable()
export class MessagesService {
  constructor(private readonly prisma: PrismaService) {}

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
    return toMessage(message)
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
    return toMessage(message)
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
