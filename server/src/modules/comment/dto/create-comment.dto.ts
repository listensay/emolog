import { IsString, IsNumber, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsOptional()
  @IsString()
  @MaxLength(191)
  username?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(191)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(191)
  url?: string;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsString()
  @MaxLength(500)
  content: string;

  @IsNumber()
  postId: number;

  @IsOptional()
  @IsNumber()
  parentCommentId?: number;
}
