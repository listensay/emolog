import { request } from '$lib/utils/request';
import type { ApiResponse, PaginationResponse } from '$lib/types';

/**
 * 友情链接类型
 */
export interface Link {
	id: number;
	name: string;
	url: string;
	icon: string | null;
	description: string | null;
	order: number;
	createdAt: string;
	updatedAt: string;
	isDeleted: boolean;
	deletedAt: string | null;
}

/**
 * 创建友情链接请求参数
 */
export interface CreateLinkParams {
	name: string;
	url: string;
	icon?: string;
	description?: string;
	order?: number;
}

/**
 * 更新友情链接请求参数
 */
export interface UpdateLinkParams extends Partial<CreateLinkParams> {}

/**
 * 创建友情链接
 */
export const createLink = (data: CreateLinkParams): Promise<ApiResponse<Link>> => {
	return request.post<ApiResponse<Link>>('/link', data);
};

/**
 * 获取友情链接列表（分页）
 */
export const getLinkList = (page = 1, pageSize = 10): Promise<PaginationResponse<Link>> => {
	return request.get<PaginationResponse<Link>>('/link', {
		params: { page, pageSize }
	});
};

/**
 * 获取所有友情链接（不分页，用于前台展示）
 */
export const getAllLinks = (): Promise<ApiResponse<Link[]>> => {
	return request.get<ApiResponse<Link[]>>('/link/list');
};

/**
 * 获取友情链接详情
 */
export const getLink = (id: number): Promise<ApiResponse<Link>> => {
	return request.get<ApiResponse<Link>>(`/link/${id}`);
};

/**
 * 更新友情链接
 */
export const updateLink = (id: number, data: UpdateLinkParams): Promise<ApiResponse<Link>> => {
	return request.patch<ApiResponse<Link>>(`/link/${id}`, data);
};

/**
 * 删除友情链接（软删除）
 */
export const deleteLink = (id: number): Promise<ApiResponse<null>> => {
	return request.delete<ApiResponse<null>>(`/link/${id}`);
};

/**
 * 获取友情链接统计信息
 */
export const getLinkStatistics = (): Promise<ApiResponse<{ total: number }>> => {
	return request.get<ApiResponse<{ total: number }>>('/link/stats/all');
};
