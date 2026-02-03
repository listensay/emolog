import { request } from '$lib/utils/request';
import type { ApiResponse, PaginationResponse } from '$lib/types';

/**
 * 分类类型枚举
 */
export enum CategoryType {
	POST = 'post',
	IMAGE = 'image'
}

/**
 * 分类类型
 */
export interface Category {
	id: number;
	name: string;
	description: string | null;
	icon: string | null;
	order: number;
	type: CategoryType;
	createdAt: string;
	updatedAt: string;
	isDeleted: boolean;
	deletedAt: string | null;
}

/**
 * 创建分类请求参数
 */
export interface CreateCategoryParams {
	name: string;
	description?: string;
	icon?: string;
	order?: number;
	type?: CategoryType;
}

/**
 * 更新分类请求参数
 */
export interface UpdateCategoryParams extends Partial<CreateCategoryParams> {
	isDeleted?: boolean;
	deletedAt?: string | null;
}

/**
 * 创建分类
 */
export const createCategory = (data: CreateCategoryParams): Promise<ApiResponse<Category>> => {
	return request.post<ApiResponse<Category>>('/category', data);
};

/**
 * 获取分类列表（分页）
 */
export const getCategoryList = (
	page = 1,
	pageSize = 10,
	type?: CategoryType
): Promise<PaginationResponse<Category>> => {
	return request.get<PaginationResponse<Category>>('/category', {
		params: { page, pageSize, type }
	});
};

/**
 * 获取所有分类（不分页，用于下拉选择）
 */
export const getAllCategories = (type?: CategoryType): Promise<ApiResponse<Category[]>> => {
	return request.get<ApiResponse<Category[]>>('/category/list', {
		params: type ? { type } : undefined
	});
};

/**
 * 获取分类详情
 */
export const getCategory = (id: number): Promise<ApiResponse<Category>> => {
	return request.get<ApiResponse<Category>>(`/category/${id}`);
};

/**
 * 更新分类
 */
export const updateCategory = (
	id: number,
	data: UpdateCategoryParams
): Promise<ApiResponse<Category>> => {
	return request.patch<ApiResponse<Category>>(`/category/${id}`, data);
};

/**
 * 删除分类（软删除）
 */
export const deleteCategory = (id: number): Promise<ApiResponse<null>> => {
	return request.delete<ApiResponse<null>>(`/category/${id}`);
};

/**
 * 获取分类统计信息
 */
export const getCategoryStatistics = (): Promise<ApiResponse<{ total: number }>> => {
	return request.get<ApiResponse<{ total: number }>>('/category/stats/all');
};
