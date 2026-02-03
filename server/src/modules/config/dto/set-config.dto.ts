import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, MaxLength, IsOptional, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class SetConfigDto {
  @ApiProperty({ description: '配置键名', example: 'site_title' })
  @IsString()
  @IsNotEmpty({ message: '配置键名不能为空' })
  @MaxLength(100, { message: '配置键名最多100个字符' })
  key: string;

  @ApiProperty({ description: '配置值', example: 'My Blog', required: false })
  @IsOptional()
  @IsString()
  value?: string;
}

export class SetConfigsDto {
  @ApiProperty({
    description: '配置项数组',
    type: [SetConfigDto],
    example: [
      { key: 'site_title', value: 'My Blog' },
      { key: 'site_description', value: 'A personal blog' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetConfigDto)
  configs: SetConfigDto[];
}
