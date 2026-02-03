import { request } from '$lib/utils/request';
import type { ApiResponse, PaginationResponse } from '$lib/types';
import type { Tag } from '$lib/api/tag';

/**
 * 页面类型枚举
 */
export enum PageType {
	SIMPLE = 'simple', // 简单页面
	IMAGES = 'images', // 图片页面
	LINKS = 'links', // 链接页面
	ARCHIVES = 'archives', // 归档页面
	ABOUT = 'about' // 关于页面
}

/**
 * 页面类型
 */
export interface Page {
	id: number;
	title: string;
	content: string;
	cover: string;
	authorId: number;
	description: string;
	categoryId: number;
	createdAt: string;
	updatedAt: string;
	isDeleted: boolean;
	deletedAt: string | null;
	views: number;
	likes: number;
	type: number;
	pageType: string; // 页面类型：images, links, archives, about
	author?: any;
	tags?: Tag[];
}

/**
 * 创建页面请求参数
 */
export interface CreatePageParams {
	title: string;
	content: string;
	cover?: string;
	authorId: number;
	description?: string;
	categoryId: number;
	type: number; // 固定为页面类型的值
	pageType: string; // 页面类型：images, links, archives, about
	tagIds?: number[];
}

/**
 * 更新页面请求参数
 */
export interface UpdatePageParams extends Partial<CreatePageParams> {
	isDeleted?: boolean;
	deletedAt?: string | null;
	views?: number;
	likes?: number;
}

/**
 * 创建页面
 */
export const createPage = (data: CreatePageParams): Promise<ApiResponse<Page>> => {
	return request.post<ApiResponse<Page>>('/post', data);
};

/**
 * 获取页面列表（分页）
 * 注意：需要后端支持通过 type 参数过滤页面类型
 */
export const getPageList = (
	page = 1,
	pageSize = 10
): Promise<PaginationResponse<Page>> => {
	return request.get<PaginationResponse<Page>>('/post', {
		params: { page, pageSize, type: 1 } // type: 1 表示页面类型
	});
};

/**
 * 获取页面详情
 */
export const getPage = (id: number): Promise<ApiResponse<Page>> => {
	return request.get<ApiResponse<Page>>(`/post/${id}`);
};

/**
 * 更新页面
 */
export const updatePage = (id: number, data: UpdatePageParams): Promise<ApiResponse<Page>> => {
	return request.patch<ApiResponse<Page>>(`/post/${id}`, data);
};

/**
 * 删除页面（软删除）
 */
export const deletePage = (id: number): Promise<ApiResponse<null>> => {
	return request.delete<ApiResponse<null>>(`/post/${id}`);
};

/**
 * 获取页面类型选项
 */
export const getPageTypeOptions = () => [
	{ value: PageType.SIMPLE, label: '简单页面' },
	{ value: PageType.IMAGES, label: '图片页面' },
	{ value: PageType.LINKS, label: '链接页面' },
	{ value: PageType.ARCHIVES, label: '归档页面' },
	{ value: PageType.ABOUT, label: '关于页面' }
];
