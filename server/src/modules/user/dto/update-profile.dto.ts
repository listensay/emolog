import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiProperty({ description: '昵称', required: false, example: 'John' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称最多50个字符' })
  nickname?: string;

  @ApiProperty({ description: '头像URL', required: false, example: '/uploads/avatar.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '头像URL最多255个字符' })
  avatar?: string;
}
