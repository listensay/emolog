import { IsString, IsNotEmpty } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty({ message: '标签名称不能为空' })
  name: string;
}
