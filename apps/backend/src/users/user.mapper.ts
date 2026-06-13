import type {ICurrentUser} from '@frontdesk/types'
import type {User} from '@prisma/client'

export function toCurrentUser(user: User): ICurrentUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    photoUrl: user.photoUrl ?? undefined,
    role: user.role,
    locale: user.locale,
    notificationPref: user.notificationPref,
    availability: user.availability,
    addOns: user.addOns,
  }
}
