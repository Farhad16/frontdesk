import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotImplementedException,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common'
import type {Response} from 'express'
import type {ICurrentUser, IOAuthProfile} from '@frontdesk/types'
import {AuthService} from './auth.service'
import {LoginDto, SignupDto} from './dto/auth.dto'
import {CurrentUser} from './decorators/current-user.decorator'
import {JwtAuthGuard} from './guards/jwt-auth.guard'
import {AUTH_COOKIE, type AuthUser} from './jwt.strategy'

const COOKIE_MAX_AGE = 1000 * 60 * 60 * 24 * 7

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({passthrough: true}) res: Response): Promise<ICurrentUser> {
    const {token, user} = await this.auth.signup(dto)
    this.setCookie(res, token)
    return user
  }

  @Post('login')
  @HttpCode(200)
  async login(@Body() dto: LoginDto, @Res({passthrough: true}) res: Response): Promise<ICurrentUser> {
    const {token, user} = await this.auth.login(dto)
    this.setCookie(res, token)
    return user
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Res({passthrough: true}) res: Response): {ok: true} {
    res.clearCookie(AUTH_COOKIE, {path: '/'})
    return {ok: true}
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@CurrentUser() user: AuthUser): Promise<ICurrentUser> {
    return this.auth.currentUser(user.id)
  }

  @Get('google')
  googleStart(): void {
    if (!this.auth.googleSsoEnabled()) throw new NotImplementedException('Google SSO is not configured')
  }

  @Get('google/callback')
  googleCallback(): void {
    if (!this.auth.googleSsoEnabled()) throw new NotImplementedException('Google SSO is not configured')
  }

  async completeOAuthLogin(res: Response, profile: IOAuthProfile): Promise<void> {
    const {token} = await this.auth.upsertOAuthUser(profile)
    this.setCookie(res, token)
    res.redirect('/')
  }

  private setCookie(res: Response, token: string): void {
    res.cookie(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    })
  }
}
