import type {IMessage} from './dto'
import type {Availability} from './enums'

export type ISseEvent =
  | {type: 'message:new'; groupKey: string; message: IMessage}
  | {type: 'message:status'; groupKey: string; message: IMessage}
  | {type: 'message:deleted'; groupKey: string; messageId: string}
  | {type: 'presence:changed'; userId: string; availability: Availability}
  | {type: 'ping'}
