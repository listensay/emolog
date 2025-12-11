/**
 * 用户相关类型定义
 */

/**
 * 用户信息
 */
export interface User {
	id: number;
	username: string;
	email: string;
	nickname?: string;
	avatar?: string;
	isActive?: boolean;
	createdAt?: string;
	updatedAt?: string;
}

/**
 * 登录参数
 */
export interface LoginParams {
	usernameOrEmail: string;
	password: string;
}

/**
 * 登录响应数据
 */
export interface LoginData {
	access_token: string;
	user: User;
}

/**
 * 注册参数
 */
export interface RegisterParams {
	username: string;
	email: string;
	password: string;
	nickname?: string;
}
