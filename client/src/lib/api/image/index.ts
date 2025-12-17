import { request } from '$lib/utils/request';
import type { ApiResponse, PaginationResponse } from '$lib/types';

/**
 * 图片类型
 */
export interface Image {
	id: number;
	name: string;
	url: string;
	size: number;
	mimeType: string;
	categoryId: number | null;
	createdAt: string;
	updatedAt: string;
	isDeleted: boolean;
	deletedAt: string | null;
}

/**
 * 上传图片请求参数
 */
export interface UploadImageParams {
	file: File;
	name?: string;
	categoryId?: number;
}

/**
 * 更新图片请求参数
 */
export interface UpdateImageParams {
	name?: string;
	categoryId?: number | null;
}

/**
 * 上传图片
 */
export const uploadImage = (params: UploadImageParams): Promise<ApiResponse<Image>> => {
	const formData = new FormData();
	formData.append('file', params.file);
	if (params.name) {
		formData.append('name', params.name);
	}
	if (params.categoryId !== undefined) {
		formData.append('categoryId', String(params.categoryId));
	}

	return request.post<ApiResponse<Image>>('/image/upload', formData, {
		headers: {
			'Content-Type': 'multipart/form-data'
		}
	});
};

/**
 * 获取图片列表（分页）
 */
export const getImageList = (
	page = 1,
	pageSize = 20,
	categoryId?: number | null
): Promise<PaginationResponse<Image>> => {
	const params: Record<string, any> = { page, pageSize };
	if (categoryId !== undefined) {
		params.categoryId = categoryId;
	}
	return request.get<PaginationResponse<Image>>('/image', { params });
};

/**
 * 获取图片详情
 */
export const getImage = (id: number): Promise<ApiResponse<Image>> => {
	return request.get<ApiResponse<Image>>(`/image/${id}`);
};

/**
 * 更新图片信息
 */
export const updateImage = (id: number, data: UpdateImageParams): Promise<ApiResponse<Image>> => {
	return request.patch<ApiResponse<Image>>(`/image/${id}`, data);
};

/**
 * 删除图片
 */
export const deleteImage = (id: number): Promise<ApiResponse<null>> => {
	return request.delete<ApiResponse<null>>(`/image/${id}`);
};

/**
 * 批量删除图片
 */
export const batchDeleteImages = (ids: number[]): Promise<ApiResponse<null>> => {
	return request.post<ApiResponse<null>>('/image/batch-delete', { ids });
};

/**
 * 获取未分类图片列表
 */
export const getUncategorizedImages = (
	page = 1,
	pageSize = 20
): Promise<PaginationResponse<Image>> => {
	return request.get<PaginationResponse<Image>>('/image', {
		params: { page, pageSize, categoryId: null }
	});
};
