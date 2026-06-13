import {Injectable} from '@nestjs/common'
import {ConfigService} from '@nestjs/config'
import {PassportStrategy} from '@nestjs/passport'
import type {Request} from 'express'
import {ExtractJwt, Strategy} from 'passport-jwt'
import type {Role} from '@frontdesk/types'

export const AUTH_COOKIE = 'hub_token'

interface JwtPayload {
  sub: string
  role: Role
}
export interface AuthUser {
  id: string
  role: Role
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([(req: Request) => req.cookies?.[AUTH_COOKIE] ?? null]),
      secretOrKey: config.get<string>('JWT_SECRET') ?? 'dev-demo-secret-change-me',
    })
  }

  validate(payload: JwtPayload): AuthUser {
    return {id: payload.sub, role: payload.role}
  }
}
