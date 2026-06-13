import {IsEmail, IsString, Matches, MinLength} from 'class-validator'

const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/

export class SignupDto {
  @IsString()
  @MinLength(2)
  name!: string

  @IsEmail()
  email!: string

  @Matches(PASSWORD_PATTERN, {
    message:
      'Password must be at least 8 characters and include uppercase, lowercase, a number, and a special character',
  })
  password!: string
}

export class LoginDto {
  @IsEmail()
  email!: string

  @IsString()
  password!: string
}
