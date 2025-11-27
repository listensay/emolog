import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ResponseDto } from '../dto/response.dto';

/**
 * 全局响应拦截器
 * 自动将返回值包装为统一格式
 */
@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ResponseDto<T>>
{
  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ResponseDto<T>> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是 ResponseDto 格式，直接返回
        if (data instanceof ResponseDto) {
          return data;
        }
        // 否则包装为成功响应
        return new ResponseDto(200, '操作成功', data, true);
      }),
    );
  }
}
