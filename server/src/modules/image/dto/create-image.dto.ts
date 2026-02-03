import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateImageDto {
  @IsString()
  name: string;

  @IsString()
  url: string;

  @IsNumber()
  @IsOptional()
  size?: number;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number;
}
