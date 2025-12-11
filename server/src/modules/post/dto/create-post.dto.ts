import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
} from 'class-validator';

export class CreatePostDto {
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @IsString()
  @IsOptional()
  content: string;

  @IsString()
  @IsOptional()
  cover: string;

  @IsNumber()
  @IsNotEmpty({ message: '作者 ID 不能为空' })
  authorId: number;

  @IsString()
  @IsOptional()
  description: string;

  @IsNumber()
  @IsNotEmpty({ message: '分类 ID 不能为空' })
  categoryId: number;

  @IsNumber()
  @IsOptional()
  type?: number;

  @IsArray()
  @IsOptional()
  tagIds?: number[];
}
