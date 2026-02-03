import { ApiProperty } from '@nestjs/swagger';

/**
 * 业务状态码枚举
 */
export enum BusinessCode {
  // 成功
  SUCCESS = 2000,

  // 客户端错误 (4xxx)
  BAD_REQUEST = 4000, // 请求参数错误
  UNAUTHORIZED = 4001, // 未授权
  FORBIDDEN = 4003, // 禁止访问
  NOT_FOUND = 4004, // 资源不存在
  VALIDATION_ERROR = 4005, // 数据验证失败

  // 业务错误 (4xxx)
  USER_NOT_FOUND = 4100, // 用户不存在
  USER_ALREADY_EXISTS = 4101, // 用户已存在
  INVALID_CREDENTIALS = 4102, // 用户名或密码错误
  ACCOUNT_DISABLED = 4103, // 账号已被禁用
  TOKEN_EXPIRED = 4104, // Token 已过期
  INVALID_TOKEN = 4105, // Token 无效

  // 服务端错误 (5xxx)
  INTERNAL_ERROR = 5000, // 服务器内部错误
  DATABASE_ERROR = 5001, // 数据库错误
  EXTERNAL_API_ERROR = 5002, // 外部 API 错误
}

/**
 * 统一响应格式
 */
export class ResponseDto<T = any> {
  @ApiProperty({ description: '业务状态码', example: 2000 })
  code: BusinessCode;

  @ApiProperty({ description: '消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '数据' })
  data?: T;

  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  constructor(
    code: BusinessCode,
    message: string,
    data?: T,
    success?: boolean,
  ) {
    this.code = code;
    this.message = message;
    this.data = data;
    // success 默认根据 code 判断，2000 为成功
    this.success = success ?? code === BusinessCode.SUCCESS;
  }

  /**
   * 成功响应
   */
  static success<T>(data?: T, message = '操作成功'): ResponseDto<T> {
    return new ResponseDto(BusinessCode.SUCCESS, message, data, true);
  }

  /**
   * 失败响应
   */
  static fail<T>(
    code: BusinessCode,
    message: string,
    data?: T,
  ): ResponseDto<T> {
    return new ResponseDto(code, message, data, false);
  }
}

/**
 * 分页数据
 */
export class PaginationDto<T = any> {
  @ApiProperty({ description: '数据列表' })
  list: T[];

  @ApiProperty({ description: '总数', example: 100 })
  total: number;

  @ApiProperty({ description: '当前页', example: 1 })
  page: number;

  @ApiProperty({ description: '每页数量', example: 10 })
  pageSize: number;

  @ApiProperty({ description: '总页数', example: 10 })
  totalPages: number;

  constructor(list: T[], total: number, page: number, pageSize: number) {
    this.list = list;
    this.total = total;
    this.page = page;
    this.pageSize = pageSize;
    this.totalPages = Math.ceil(total / pageSize);
  }
}

/**
 * 分页响应格式
 */
export class PaginationResponseDto<T = any> extends ResponseDto<
  PaginationDto<T>
> {
  constructor(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message = '获取成功',
  ) {
    const pagination = new PaginationDto(list, total, page, pageSize);
    super(BusinessCode.SUCCESS, message, pagination, true);
  }
}
