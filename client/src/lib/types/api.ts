/**
 * API 响应类型定义
 */

/**
 * 业务状态码枚举（与后端保持一致）
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
	EXTERNAL_API_ERROR = 5002 // 外部 API 错误
}

/**
 * 统一响应格式
 * 对应后端的 ResponseDto
 */
export interface ApiResponse<T = any> {
	code: BusinessCode; // 业务状态码
	message: string;
	data: T;
	success: boolean;
}

/**
 * 分页数据
 * 对应后端的 PaginationDto
 */
export interface PaginationData<T = any> {
	list: T[];
	total: number;
	page: number;
	pageSize: number;
	totalPages: number;
}

/**
 * 分页响应格式
 */
export type PaginationResponse<T = any> = ApiResponse<PaginationData<T>>;

/**
 * 判断是否成功响应
 */
export function isSuccessResponse(response: ApiResponse): boolean {
	return response.success === true && response.code === BusinessCode.SUCCESS;
}

/**
 * 获取错误信息
 */
export function getErrorMessage(response: ApiResponse): string {
	return response.message || '操作失败';
}
