import {ConflictException, Injectable, UnauthorizedException} from '@nestjs/common'
import {JwtService} from '@nestjs/jwt'
import {ConfigService} from '@nestjs/config'
import type {User} from '@prisma/client'
import type {ICurrentUser, IOAuthProfile, Role} from '@frontdesk/types'
import * as bcrypt from 'bcrypt'
import {PrismaService} from '../prisma/prisma.service'
import {toCurrentUser} from '../users/user.mapper'
import type {LoginDto, SignupDto} from './dto/auth.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  roleForEmail(email: string): Role {
    const domain = email.split('@')[1]?.toLowerCase() ?? ''
    const orgDomain = (this.config.get<string>('ORG_EMAIL_DOMAIN') ?? '').toLowerCase()
    return domain === orgDomain ? 'REQUESTER' : 'STAFF'
  }

  async signup(dto: SignupDto): Promise<{token: string; user: ICurrentUser}> {
    const existing = await this.prisma.user.findUnique({where: {email: dto.email}})
    if (existing) throw new ConflictException('Email already registered')
    const passwordHash = await bcrypt.hash(dto.password, 10)
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        provider: 'PASSWORD',
        role: this.roleForEmail(dto.email),
      },
    })
    return {token: this.signToken(user), user: toCurrentUser(user)}
  }

  async login(dto: LoginDto): Promise<{token: string; user: ICurrentUser}> {
    const user = await this.prisma.user.findUnique({where: {email: dto.email}})
    if (!user?.passwordHash) throw new UnauthorizedException('Invalid credentials')
    const ok = await bcrypt.compare(dto.password, user.passwordHash)
    if (!ok) throw new UnauthorizedException('Invalid credentials')
    return {token: this.signToken(user), user: toCurrentUser(user)}
  }

  googleSsoEnabled(): boolean {
    return this.config.get<string>('GOOGLE_SSO_ENABLED') === 'true'
  }

  async upsertOAuthUser(profile: IOAuthProfile): Promise<{token: string; user: ICurrentUser}> {
    const existing = await this.prisma.user.findUnique({where: {email: profile.email}})
    const user = existing
      ? await this.prisma.user.update({
          where: {id: existing.id},
          data: {
            provider: 'GOOGLE',
            providerId: profile.providerId,
            photoUrl: profile.photoUrl ?? existing.photoUrl,
          },
        })
      : await this.prisma.user.create({
          data: {
            name: profile.name,
            email: profile.email,
            photoUrl: profile.photoUrl,
            provider: 'GOOGLE',
            providerId: profile.providerId,
            role: this.roleForEmail(profile.email),
          },
        })
    return {token: this.signToken(user), user: toCurrentUser(user)}
  }

  async currentUser(userId: string): Promise<ICurrentUser> {
    const user = await this.prisma.user.findUnique({where: {id: userId}})
    if (!user) throw new UnauthorizedException()
    return toCurrentUser(user)
  }

  private signToken(user: User): string {
    return this.jwt.sign({sub: user.id, role: user.role})
  }
}
