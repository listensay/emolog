import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLinkDto {
  @ApiProperty({ description: '链接名称' })
  @IsString()
  @IsNotEmpty({ message: '链接名称不能为空' })
  name: string;

  @ApiProperty({ description: '链接地址' })
  @IsString()
  @IsNotEmpty({ message: '链接地址不能为空' })
  url: string;

  @ApiProperty({ description: '图标地址', required: false })
  @IsString()
  @IsOptional()
  icon?: string;

  @ApiProperty({ description: '链接描述', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '排序', required: false, default: 0 })
  @IsNumber()
  @IsOptional()
  order?: number;
}
