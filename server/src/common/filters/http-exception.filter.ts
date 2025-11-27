import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto } from '../dto/response.dto';

/**
 * 全局异常过滤器
 * 统一处理所有异常的响应格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = '服务器内部错误';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        // 处理验证错误
        if (Array.isArray((exceptionResponse as any).message)) {
          message = (exceptionResponse as any).message.join(', ');
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    const errorResponse = new ResponseDto(status, message, null, false);

    response.status(status).json(errorResponse);
  }
}
