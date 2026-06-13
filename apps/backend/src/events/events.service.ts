import {Injectable} from '@nestjs/common'
import type {ISseEvent} from '@frontdesk/types'
import {Subject} from 'rxjs'

@Injectable()
export class EventsService {
  private readonly stream = new Subject<ISseEvent>()

  get events$() {
    return this.stream.asObservable()
  }

  emit(event: ISseEvent): void {
    this.stream.next(event)
  }
}
