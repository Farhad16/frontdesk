import {ArrayMaxSize, IsArray, IsIn, IsOptional, IsString, MaxLength} from 'class-validator'
import type {Availability, NotificationPref} from '@frontdesk/types'

export class UpdateMeDto {
  @IsString()
  @IsOptional()
  @MaxLength(80)
  name?: string

  @IsIn(['en', 'bn'])
  @IsOptional()
  locale?: string

  @IsIn(['OFF', 'MY_UPDATES', 'NEW_MESSAGES', 'ALL'])
  @IsOptional()
  notificationPref?: NotificationPref

  @IsIn(['AVAILABLE', 'BUSY', 'AWAY'])
  @IsOptional()
  availability?: Availability

  @IsString()
  @IsOptional()
  @MaxLength(60)
  availabilityNote?: string

  @IsArray()
  @IsOptional()
  @ArrayMaxSize(40)
  @IsString({each: true})
  @MaxLength(40, {each: true})
  addOns?: string[]
}
