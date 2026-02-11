import { request } from '$lib/utils/request';
import type { ApiResponse, PaginationResponse } from '$lib/types';
import type { Tag } from '$lib/api/tag';

/**
 * 文章类型
 */
export interface Post {
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
	commentCount?: number;
	author?: any;
	tags?: Tag[];
}

/**
 * 创建文章请求参数
 */
export interface CreatePostParams {
	title: string;
	content: string;
	cover?: string;
	authorId: number;
	description?: string;
	categoryId: number;
	type?: number;
	tagIds?: number[];
}

/**
 * 更新文章请求参数
 */
export interface UpdatePostParams extends Partial<CreatePostParams> {
	isDeleted?: boolean;
	deletedAt?: string | null;
	views?: number;
	likes?: number;
}

/**
 * 创建文章
 */
export const createPost = (data: CreatePostParams): Promise<ApiResponse<Post>> => {
	return request.post<ApiResponse<Post>>('/post', data);
};

/**
 * 获取文章列表（分页）
 */
export const getPostList = (
	page = 1,
	pageSize = 10
): Promise<PaginationResponse<Post>> => {
	return request.get<PaginationResponse<Post>>('/post', {
		params: { page, pageSize, type: 0 }
	});
};

/**
 * 获取文章详情
 */
export const getPost = (id: number): Promise<ApiResponse<Post>> => {
	return request.get<ApiResponse<Post>>(`/post/${id}`);
};

/**
 * 获取作者的文章列表
 */
export const getPostByAuthor = (
	authorId: number,
	page = 1,
	pageSize = 10
): Promise<PaginationResponse<Post>> => {
	return request.get<PaginationResponse<Post>>(`/post/author/${authorId}`, {
		params: { page, pageSize }
	});
};

/**
 * 更新文章
 */
export const updatePost = (id: number, data: UpdatePostParams): Promise<ApiResponse<Post>> => {
	return request.patch<ApiResponse<Post>>(`/post/${id}`, data);
};

/**
 * 删除文章（软删除）
 */
export const deletePost = (id: number): Promise<ApiResponse<null>> => {
	return request.delete<ApiResponse<null>>(`/post/${id}`);
};

/**
 * 增加浏览量
 */
export const incrementPostViews = (id: number): Promise<ApiResponse<Post>> => {
	return request.post<ApiResponse<Post>>(`/post/${id}/views`);
};

/**
 * 增加点赞数
 */
export const incrementPostLikes = (id: number): Promise<ApiResponse<Post>> => {
	return request.post<ApiResponse<Post>>(`/post/${id}/likes`);
};

/**
 * 获取文章统计信息
 */
export const getPostStatistics = (): Promise<ApiResponse<{ total: number; thisMonth: number }>> => {
	return request.get<ApiResponse<{ total: number; thisMonth: number }>>('/post/stats/all');
};
