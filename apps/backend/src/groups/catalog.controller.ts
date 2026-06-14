import {Controller, Get, UseGuards} from '@nestjs/common'
import type {ICatalogItem} from '@frontdesk/types'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {GroupsService} from './groups.service'

@Controller('catalog')
@UseGuards(JwtAuthGuard)
export class CatalogController {
  constructor(private readonly groups: GroupsService) {}

  @Get('items')
  items(): ICatalogItem[] {
    return this.groups.catalogItems()
  }
}
