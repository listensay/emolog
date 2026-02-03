import { request } from '$lib/utils/request';
import type {
	User,
	LoginParams,
	LoginData,
	RegisterParams,
	ApiResponse
} from '$lib/types';

/**
 * 登录接口响应类型
 */
export type LoginResponse = ApiResponse<LoginData>;

/**
 * 用户登录
 * @param data 登录参数
 * @returns 登录响应
 */
export const login = (data: LoginParams): Promise<LoginResponse> => {
	return request.post<LoginResponse>('/auth/login', data);
};

/**
 * 用户注册
 * @param data 注册参数
 * @returns 注册响应
 */
export const register = (data: RegisterParams): Promise<LoginResponse> => {
	return request.post<LoginResponse>('/auth/register', data);
};

/**
 * 用户登出
 */
export const logout = (): Promise<ApiResponse> => {
	return request.post<ApiResponse>('/auth/logout');
};

/**
 * 获取当前用户信息
 */
export const getCurrentUser = (): Promise<ApiResponse<User>> => {
	return request.get<ApiResponse<User>>('/auth/profile');
};
