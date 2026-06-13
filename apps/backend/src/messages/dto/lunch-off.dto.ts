import {IsDateString} from 'class-validator'

export class LunchOffDto {
  @IsDateString()
  from!: string

  @IsDateString()
  to!: string
}
