import { ResponseDto, PaginationResponseDto } from '../dto/response.dto';

/**
 * 统一响应工具类
 */
export class ResponseUtil {
  /**
   * 成功响应
   */
  static success<T = any>(data?: T, message = '操作成功'): ResponseDto<T> {
    return new ResponseDto(200, message, data, true);
  }

  /**
   * 失败响应
   */
  static error<T = any>(
    message = '操作失败',
    code = 500,
    data?: T,
  ): ResponseDto<T> {
    return new ResponseDto(code, message, data, false);
  }

  /**
   * 分页响应
   */
  static paginate<T = any>(
    list: T[],
    total: number,
    page: number,
    pageSize: number,
    message = '获取成功',
  ): PaginationResponseDto<T> {
    return new PaginationResponseDto(list, total, page, pageSize, message);
  }

  /**
   * 创建成功响应
   */
  static created<T = any>(data?: T, message = '创建成功'): ResponseDto<T> {
    return new ResponseDto(201, message, data, true);
  }

  /**
   * 未授权响应
   */
  static unauthorized(message = '未授权'): ResponseDto {
    return new ResponseDto(401, message, null, false);
  }

  /**
   * 禁止访问响应
   */
  static forbidden(message = '禁止访问'): ResponseDto {
    return new ResponseDto(403, message, null, false);
  }

  /**
   * 未找到响应
   */
  static notFound(message = '资源未找到'): ResponseDto {
    return new ResponseDto(404, message, null, false);
  }

  /**
   * 参数错误响应
   */
  static badRequest(message = '参数错误'): ResponseDto {
    return new ResponseDto(400, message, null, false);
  }
}
