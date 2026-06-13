import {IsObject} from 'class-validator'

export class SavePreferenceDto {
  @IsObject()
  options!: Record<string, string | string[]>
}
