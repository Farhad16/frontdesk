import {IsBoolean, IsObject, IsOptional} from 'class-validator'

export class SavePreferenceDto {
  @IsObject()
  options!: Record<string, string | string[]>

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}
