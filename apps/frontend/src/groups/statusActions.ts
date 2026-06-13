import type {Role, Status} from '@frontdesk/types'
import {t} from '../i18n'

export interface IStatusAction {
  label: string
  next: Status
  primary: boolean
}

export function actionsFor(status: Status, role: Role, isOwner: boolean): IStatusAction[] {
  if (role === 'STAFF') {
    if (status === 'PENDING') return [{label: t('status.start'), next: 'IN_PROGRESS', primary: true}]
    if (status === 'IN_PROGRESS') return [{label: t('status.markDone'), next: 'DONE', primary: true}]
    return []
  }
  if (isOwner && status === 'PENDING') {
    return [{label: t('status.cancel'), next: 'CANCELLED', primary: false}]
  }
  return []
}
