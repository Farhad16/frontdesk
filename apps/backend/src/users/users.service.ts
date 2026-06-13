import {Injectable, NotFoundException} from '@nestjs/common'
import type {ICurrentUser} from '@frontdesk/types'
import {PrismaService} from '../prisma/prisma.service'
import type {UpdateMeDto} from './dto/update-me.dto'
import {toCurrentUser} from './user.mapper'

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async updateMe(userId: string, dto: UpdateMeDto): Promise<ICurrentUser> {
    const current = await this.prisma.user.findUnique({where: {id: userId}})
    if (!current) throw new NotFoundException()

    const user = await this.prisma.user.update({
      where: {id: userId},
      data: {
        name: dto.name ?? undefined,
        locale: dto.locale ?? undefined,
        // Staff are always notified — ignore preference changes for them.
        notificationPref: current.role === 'STAFF' ? undefined : dto.notificationPref ?? undefined,
        availability: dto.availability ?? undefined,
        availabilityNote: dto.availabilityNote ?? undefined,
        addOns: dto.addOns ?? undefined,
      },
    })
    return toCurrentUser(user)
  }
}
