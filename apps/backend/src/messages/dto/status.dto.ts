import {IsIn} from 'class-validator'
import type {Status} from '@frontdesk/types'

export class UpdateStatusDto {
  @IsIn(['IN_PROGRESS', 'DONE', 'CANCELLED'])
  status!: Status
}
