import { ApiProperty } from '@nestjs/swagger';

/**
 * 统一响应格式
 */
export class ResponseDto<T = any> {
  @ApiProperty({ description: '状态码', example: 200 })
  code: number;

  @ApiProperty({ description: '消息', example: '操作成功' })
  message: string;

  @ApiProperty({ description: '数据' })
  data?: T;

  @ApiProperty({ description: '是否成功', example: true })
  success: boolean;

  constructor(code: number, message: string, data?: T, success?: boolean) {
    this.code = code;
    this.message = message;
    this.data = data;
    this.success = success ?? code === 200;
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
    super(200, message, pagination);
  }
}
