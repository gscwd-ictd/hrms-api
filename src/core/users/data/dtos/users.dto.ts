import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty } from 'class-validator';

export class UserDto {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ type: String, description: 'THIS IS EMAIL' })
  email: string;
  password: string;
  clientId: string;
  secret?: string;
}
