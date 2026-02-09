import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  MaxLength,
  IsArray,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

export class LinkDto {
  @ApiProperty({ description: '排序', example: 1 })
  @IsNumber()
  order: number;

  @ApiProperty({ description: '图标URL', example: '/uploads/icon.png' })
  @IsString()
  @MaxLength(500)
  icon: string;

  @ApiProperty({ description: '名称', example: 'GitHub' })
  @IsString()
  @MaxLength(50)
  name: string;

  @ApiProperty({ description: '链接', example: 'https://github.com/username' })
  @IsString()
  @MaxLength(500)
  url: string;
}

export class UpdateProfileDto {
  @ApiProperty({ description: '昵称', required: false, example: 'John' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称最多50个字符' })
  nickname?: string;

  @ApiProperty({
    description: '头像URL',
    required: false,
    example: '/uploads/avatar.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '头像URL最多255个字符' })
  avatar?: string;

  @ApiProperty({
    description: '个人资料背景图URL',
    required: false,
    example: '/uploads/background.jpg',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '背景图URL最多500个字符' })
  profileBackground?: string;

  @ApiProperty({
    description: '个性签名',
    required: false,
    example: '热爱生活，热爱代码',
  })
  @IsOptional()
  @IsString()
  @MaxLength(200, { message: '个性签名最多200个字符' })
  bio?: string;

  @ApiProperty({
    description: 'Links列表',
    required: false,
    type: [LinkDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => LinkDto)
  links?: LinkDto[];
}
