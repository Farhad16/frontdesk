import {Body, Controller, Patch, UseGuards} from '@nestjs/common'
import type {ICurrentUser} from '@frontdesk/types'
import {CurrentUser} from '../auth/decorators/current-user.decorator'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import type {AuthUser} from '../auth/jwt.strategy'
import {UpdateMeDto} from './dto/update-me.dto'
import {UsersService} from './users.service'

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly users: UsersService) {}

  @Patch('me')
  updateMe(@CurrentUser() user: AuthUser, @Body() dto: UpdateMeDto): Promise<ICurrentUser> {
    return this.users.updateMe(user.id, dto)
  }
}
