import type {IMessage} from './dto'
import type {Availability} from './enums'

export type ISseEvent =
  | {type: 'message:new'; groupId: string; message: IMessage}
  | {type: 'message:status'; groupId: string; message: IMessage}
  | {type: 'message:deleted'; groupId: string; messageId: string}
  | {type: 'presence:changed'; userId: string; availability: Availability}
