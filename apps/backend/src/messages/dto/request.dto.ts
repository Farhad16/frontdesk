import {Type} from 'class-transformer'
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from 'class-validator'

export class RequestLineItemDto {
  @IsString()
  @IsNotEmpty()
  category!: string

  @IsString()
  @IsNotEmpty()
  item!: string

  @IsObject()
  @IsOptional()
  options?: Record<string, string | string[]>

  @IsInt()
  @Min(1)
  quantity!: number

  @IsString()
  @IsOptional()
  @MaxLength(500)
  summary?: string
}

export class CreateRequestDto {
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({each: true})
  @Type(() => RequestLineItemDto)
  items!: RequestLineItemDto[]

  @IsString()
  @IsOptional()
  @MaxLength(500)
  note?: string

  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  summary!: string
}
