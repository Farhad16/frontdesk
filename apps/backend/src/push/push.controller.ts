import {Body, Controller, Get, HttpCode, Post, UseGuards} from '@nestjs/common'
import type {IPushSubscriptionInput} from '@frontdesk/types'
import {CurrentUser} from '../auth/decorators/current-user.decorator'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import type {AuthUser} from '../auth/jwt.strategy'
import {PushService} from './push.service'

@Controller('push')
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private readonly push: PushService) {}

  @Get('key')
  key(): {publicKey: string} {
    return {publicKey: this.push.getPublicKey()}
  }

  @Post('subscribe')
  @HttpCode(204)
  async subscribe(
    @CurrentUser() user: AuthUser,
    @Body() input: IPushSubscriptionInput,
  ): Promise<void> {
    await this.push.subscribe(user.id, input)
  }
}
