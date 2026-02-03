import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class UpdateImageDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsNumber()
  @IsOptional()
  categoryId?: number | null;

  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsOptional()
  deletedAt?: Date;
}
