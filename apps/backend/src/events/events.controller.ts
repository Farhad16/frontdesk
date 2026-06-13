import {Controller, Sse, UseGuards} from '@nestjs/common'
import type {MessageEvent} from '@nestjs/common'
import type {ISseEvent} from '@frontdesk/types'
import {interval, map, merge, type Observable} from 'rxjs'
import {JwtAuthGuard} from '../auth/guards/jwt-auth.guard'
import {EventsService} from './events.service'

const HEARTBEAT_MS = 25000

@Controller('stream')
@UseGuards(JwtAuthGuard)
export class EventsController {
  constructor(private readonly events: EventsService) {}

  @Sse()
  stream(): Observable<MessageEvent> {
    const heartbeat = interval(HEARTBEAT_MS).pipe(map((): ISseEvent => ({type: 'ping'})))
    return merge(this.events.events$, heartbeat).pipe(map(event => ({data: event})))
  }
}
