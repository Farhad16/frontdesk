import {Module} from '@nestjs/common'
import {MessagesController} from './messages.controller'
import {MessagesService} from './messages.service'
import {RequestsController} from './requests.controller'

@Module({
  controllers: [MessagesController, RequestsController],
  providers: [MessagesService],
})
export class MessagesModule {}
