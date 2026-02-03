import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseDto, BusinessCode } from '../dto/response.dto';
import { BusinessException } from '../exceptions/business.exception';

/**
 * HTTP 状态码到业务状态码的映射
 */
const httpToBusinessCode = (httpStatus: HttpStatus): BusinessCode => {
  switch (httpStatus) {
    case HttpStatus.BAD_REQUEST:
      return BusinessCode.BAD_REQUEST;
    case HttpStatus.UNAUTHORIZED:
      return BusinessCode.UNAUTHORIZED;
    case HttpStatus.FORBIDDEN:
      return BusinessCode.FORBIDDEN;
    case HttpStatus.NOT_FOUND:
      return BusinessCode.NOT_FOUND;
    case HttpStatus.INTERNAL_SERVER_ERROR:
      return BusinessCode.INTERNAL_ERROR;
    default:
      return BusinessCode.INTERNAL_ERROR;
  }
};

/**
 * 全局异常过滤器
 * 统一处理所有异常的响应格式
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let businessCode = BusinessCode.INTERNAL_ERROR;
    let message = '服务器内部错误';
    let data: any = null;

    // 处理业务异常 - HTTP 200，但 success 为 false
    if (exception instanceof BusinessException) {
      const exceptionResponse = exception.getResponse() as any;
      httpStatus = HttpStatus.OK; // 业务异常返回 HTTP 200
      businessCode = exceptionResponse.code;
      message = exceptionResponse.message;
      data = exceptionResponse.data;

      const errorResponse = new ResponseDto(businessCode, message, data, false);
      response.status(httpStatus).json(errorResponse);
      return;
    }

    // 处理 HTTP 异常 - 返回对应的 HTTP 状态码
    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      // 获取业务状态码
      businessCode = httpToBusinessCode(httpStatus);

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        // 如果响应中包含自定义的业务状态码，使用它
        if ((exceptionResponse as any).code) {
          businessCode = (exceptionResponse as any).code;
        }

        message = (exceptionResponse as any).message || message;

        // 处理验证错误
        if (Array.isArray((exceptionResponse as any).message)) {
          message = (exceptionResponse as any).message.join(', ');
          businessCode = BusinessCode.VALIDATION_ERROR;
        }
      }
    } else if (exception instanceof Error) {
      message = exception.message;
    }

    // HTTP 状态码和业务状态码分离
    // HTTP 状态码表示网络层面的状态
    // 业务状态码表示业务层面的状态
    const errorResponse = new ResponseDto(businessCode, message, data, false);

    response.status(httpStatus).json(errorResponse);
  }
}
