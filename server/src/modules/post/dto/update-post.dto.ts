import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsBoolean()
  @IsOptional()
  isDeleted?: boolean;

  @IsOptional()
  deletedAt?: Date;

  @IsOptional()
  views?: number;

  @IsOptional()
  likes?: number;
}
