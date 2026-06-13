import {Body, Controller, Get, Param, Post, UseGuards} from '@nestjs/common'
import type {IMessage} from '@frontdesk/types'
import {CurrentUser} from '../auth/decorators/current-user.decorator'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import type {AuthUser} from '../auth/jwt.strategy'
import {SendMessageDto} from './dto/message.dto'
import {CreateRequestDto} from './dto/request.dto'
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
}
