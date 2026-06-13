import {Controller, Get, UseGuards} from '@nestjs/common'
import type {IRequestQueueItem} from '@frontdesk/types'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {MessagesService} from './messages.service'

@Controller('requests')
@UseGuards(JwtAuthGuard)
export class RequestsController {
  constructor(private readonly messages: MessagesService) {}

  @Get()
  list(): Promise<IRequestQueueItem[]> {
    return this.messages.listRequests()
  }
}
