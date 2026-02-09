import { request } from '$lib/utils/request';
import type { ApiResponse, PaginationResponse } from '$lib/types';

/**
 * Link 类型
 */
export interface UserLink {
	order: number;
	icon: string;
	name: string;
	url: string;
}

/**
 * 用户类型
 */
export interface User {
	id: number;
	username: string;
	email: string;
	nickname: string | null;
	avatar: string | null;
	profileBackground: string | null;
	bio: string | null;
	links: UserLink[] | null;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
}

/**
 * 创建用户请求参数
 */
export interface CreateUserParams {
	username: string;
	email: string;
	password: string;
	nickname?: string;
}

/**
 * 更新用户请求参数
 */
export interface UpdateUserParams {
	username?: string;
	email?: string;
	password?: string;
	nickname?: string;
	avatar?: string;
	isActive?: boolean;
}

/**
 * 更新用户资料请求参数
 */
export interface UpdateProfileParams {
	nickname?: string;
	avatar?: string;
	profileBackground?: string;
	bio?: string;
	links?: UserLink[];
}

/**
 * 修改密码请求参数
 */
export interface ChangePasswordParams {
	currentPassword: string;
	newPassword: string;
}

/**
 * 创建用户
 */
export const createUser = (data: CreateUserParams): Promise<ApiResponse<User>> => {
	return request.post<ApiResponse<User>>('/user/register', data);
};

/**
 * 获取用户列表（分页）
 */
export const getUserList = (
	page = 1,
	pageSize = 10
): Promise<PaginationResponse<User>> => {
	return request.get<PaginationResponse<User>>('/user', {
		params: { page, pageSize }
	});
};

/**
 * 获取用户详情
 */
export const getUser = (id: number): Promise<ApiResponse<User>> => {
	return request.get<ApiResponse<User>>(`/user/${id}`);
};

/**
 * 更新用户
 */
export const updateUser = (id: number, data: UpdateUserParams): Promise<ApiResponse<User>> => {
	return request.patch<ApiResponse<User>>(`/user/${id}`, data);
};

/**
 * 删除用户
 */
export const deleteUser = (id: number): Promise<ApiResponse<null>> => {
	return request.delete<ApiResponse<null>>(`/user/${id}`);
};

/**
 * 获取当前用户资料
 */
export const getCurrentUser = (): Promise<ApiResponse<User>> => {
	return request.get<ApiResponse<User>>('/user/profile/me');
};

/**
 * 更新当前用户资料
 */
export const updateProfile = (data: UpdateProfileParams): Promise<ApiResponse<User>> => {
	return request.patch<ApiResponse<User>>('/user/profile', data);
};

/**
 * 修改密码
 */
export const changePassword = (data: ChangePasswordParams): Promise<ApiResponse<{ message: string }>> => {
	return request.post<ApiResponse<{ message: string }>>('/user/change-password', data);
};
