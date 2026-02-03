import { request } from '$lib/utils/request';
import type { ApiResponse, PaginationResponse } from '$lib/types';

/**
 * 标签类型
 */
export interface Tag {
	id: number;
	name: string;
	createdAt: string;
	updatedAt: string;
	isDeleted: boolean;
	deletedAt: string | null;
}

/**
 * 创建标签请求参数
 */
export interface CreateTagParams {
	name: string;
}

/**
 * 更新标签请求参数
 */
export interface UpdateTagParams extends Partial<CreateTagParams> {
	isDeleted?: boolean;
	deletedAt?: string | null;
}

/**
 * 创建标签
 */
export const createTag = (data: CreateTagParams): Promise<ApiResponse<Tag>> => {
	return request.post<ApiResponse<Tag>>('/tag', data);
};

/**
 * 获取标签列表（分页）
 */
export const getTagList = (page = 1, pageSize = 10): Promise<PaginationResponse<Tag>> => {
	return request.get<PaginationResponse<Tag>>('/tag', {
		params: { page, pageSize }
	});
};

/**
 * 获取所有标签（不分页，用于下拉选择）
 */
export const getAllTags = (): Promise<ApiResponse<Tag[]>> => {
	return request.get<ApiResponse<Tag[]>>('/tag/list');
};

/**
 * 获取标签详情
 */
export const getTag = (id: number): Promise<ApiResponse<Tag>> => {
	return request.get<ApiResponse<Tag>>(`/tag/${id}`);
};

/**
 * 更新标签
 */
export const updateTag = (id: number, data: UpdateTagParams): Promise<ApiResponse<Tag>> => {
	return request.patch<ApiResponse<Tag>>(`/tag/${id}`, data);
};

/**
 * 删除标签（软删除）
 */
export const deleteTag = (id: number): Promise<ApiResponse<null>> => {
	return request.delete<ApiResponse<null>>(`/tag/${id}`);
};

/**
 * 获取标签统计信息
 */
export const getTagStatistics = (): Promise<ApiResponse<{ total: number }>> => {
	return request.get<ApiResponse<{ total: number }>>('/tag/stats/all');
};
