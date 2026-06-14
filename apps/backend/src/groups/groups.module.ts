import {Module} from '@nestjs/common'
import {CatalogController} from './catalog.controller'
import {GroupsController} from './groups.controller'
import {GroupsService} from './groups.service'

@Module({
  controllers: [GroupsController, CatalogController],
  providers: [GroupsService],
})
export class GroupsModule {}
