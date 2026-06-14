import {Body, Controller, Delete, Get, HttpCode, Param, Put, UseGuards} from '@nestjs/common'
import type {IUserPreference} from '@frontdesk/types'
import {CurrentUser} from '../auth/decorators/current-user.decorator'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import type {AuthUser} from '../auth/jwt.strategy'
import {SavePreferenceDto} from './dto/preference.dto'
import {PreferencesService} from './preferences.service'

@Controller('preferences')
@UseGuards(JwtAuthGuard)
export class PreferencesController {
  constructor(private readonly preferences: PreferencesService) {}

  @Get()
  list(@CurrentUser() user: AuthUser): Promise<IUserPreference[]> {
    return this.preferences.list(user.id)
  }

  @Put(':itemKey')
  save(
    @CurrentUser() user: AuthUser,
    @Param('itemKey') itemKey: string,
    @Body() dto: SavePreferenceDto,
  ): Promise<IUserPreference> {
    return this.preferences.save(user.id, itemKey, dto.options, dto.isDefault)
  }

  @Delete(':itemKey')
  @HttpCode(204)
  remove(@CurrentUser() user: AuthUser, @Param('itemKey') itemKey: string): Promise<void> {
    return this.preferences.remove(user.id, itemKey)
  }
}
