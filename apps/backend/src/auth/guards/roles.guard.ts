import {CanActivate, ExecutionContext, Injectable} from '@nestjs/common'
import {Reflector} from '@nestjs/core'
import type {Role} from '@frontdesk/types'
import {ROLES_KEY} from '../decorators/roles.decorator'
import type {AuthUser} from '../jwt.strategy'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ])
    if (!required?.length) return true
    const user = context.switchToHttp().getRequest<{user?: AuthUser}>().user
    return !!user && required.includes(user.role)
  }
}
