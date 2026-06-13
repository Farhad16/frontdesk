import {IsNotEmpty, IsString} from 'class-validator'

export class QuickActionDto {
  @IsString()
  @IsNotEmpty()
  quickActionKey!: string
}
