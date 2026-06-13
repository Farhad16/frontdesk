import {Controller, Get, Param, UseGuards} from '@nestjs/common'
import type {IGroupConfig, IGroupSummary} from '@frontdesk/types'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {GroupsService} from './groups.service'

@Controller('groups')
@UseGuards(JwtAuthGuard)
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  list(): IGroupSummary[] {
    return this.groups.list()
  }

  @Get(':key/config')
  config(@Param('key') key: string): IGroupConfig {
    return this.groups.getConfig(key)
  }
}
