import { HttpException, HttpStatus } from '@nestjs/common';
import { BusinessCode } from '../dto/response.dto';

/**
 * 业务异常类
 * 用于处理业务层面的错误，HTTP 状态码返回 200，但 success 为 false
 */
export class BusinessException extends HttpException {
  constructor(
    private readonly businessCode: BusinessCode,
    message: string,
    private readonly data?: any,
  ) {
    super(
      {
        code: businessCode,
        message,
        data,
        success: false,
      },
      HttpStatus.OK, // HTTP 状态码为 200
    );
  }

  getBusinessCode(): BusinessCode {
    return this.businessCode;
  }

  getData(): any {
    return this.data;
  }
}
