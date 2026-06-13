import {Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, UseGuards} from '@nestjs/common'
import type {IMessage, IStatusUpdateResult} from '@frontdesk/types'
import {CurrentUser} from '../auth/decorators/current-user.decorator'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import type {AuthUser} from '../auth/jwt.strategy'
import {LunchOffDto} from './dto/lunch-off.dto'
import {SendMessageDto} from './dto/message.dto'
import {QuickActionDto} from './dto/quick.dto'
import {CreateRequestDto} from './dto/request.dto'
import {UpdateStatusDto} from './dto/status.dto'
import {MessagesService} from './messages.service'

@Controller('groups/:key/messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  list(@Param('key') key: string): Promise<IMessage[]> {
    return this.messages.listForGroup(key)
  }

  @Post()
  create(
    @Param('key') key: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: SendMessageDto,
  ): Promise<IMessage> {
    return this.messages.createText(key, user.id, dto.text)
  }

  @Post('request')
  createRequest(
    @Param('key') key: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: CreateRequestDto,
  ): Promise<IMessage> {
    return this.messages.createRequest(key, user.id, dto)
  }

  @Post('lunch-off')
  createLunchOff(
    @Param('key') key: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: LunchOffDto,
  ): Promise<IMessage> {
    return this.messages.createLunchOff(key, user, dto.from, dto.to)
  }

  @Post('quick')
  createQuick(
    @Param('key') key: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: QuickActionDto,
  ): Promise<IMessage> {
    return this.messages.createQuick(key, user, dto.quickActionKey)
  }

  @Delete(':id')
  @HttpCode(204)
  remove(
    @Param('key') key: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<void> {
    return this.messages.deleteMessage(key, id, user)
  }

  @Patch(':id/status')
  updateStatus(
    @Param('key') key: string,
    @Param('id') id: string,
    @CurrentUser() user: AuthUser,
    @Body() dto: UpdateStatusDto,
  ): Promise<IStatusUpdateResult> {
    return this.messages.updateStatus(key, id, user, dto.status)
  }
}
