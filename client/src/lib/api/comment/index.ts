import { request } from '$lib/utils/request';
import type { ApiResponse, PaginationResponse } from '$lib/types';

/**
 * 评论类型
 */
export interface Comment {
	id: number;
	username: string | null;
	email: string | null;
	url: string | null;
	userId: number | null;
	content: string;
	postId: number;
	parentCommentId: number | null;
	createdAt: string;
	updatedAt: string;
	isDeleted: boolean;
	deletedAt: string | null;
	user?: {
		id: number;
		username: string;
		email: string;
	};
	post?: {
		id: number;
		title: string;
	};
	parentComment?: Comment;
}

/**
 * 创建评论请求参数
 */
export interface CreateCommentParams {
	username?: string;
	email?: string;
	url?: string;
	userId?: number;
	content: string;
	postId: number;
	parentCommentId?: number;
}

/**
 * 更新评论请求参数
 */
export interface UpdateCommentParams extends Partial<CreateCommentParams> {
	isDeleted?: boolean;
}

/**
 * 创建评论
 */
export const createComment = (data: CreateCommentParams): Promise<ApiResponse<Comment>> => {
	return request.post<ApiResponse<Comment>>('/comment', data);
};

/**
 * 获取评论列表（分页）
 */
export const getCommentList = (
	page = 1,
	pageSize = 10
): Promise<PaginationResponse<Comment>> => {
	return request.get<PaginationResponse<Comment>>('/comment', {
		params: { page, pageSize }
	});
};

/**
 * 获取文章的评论列表
 */
export const getCommentsByPost = (
	postId: number,
	page = 1,
	pageSize = 20
): Promise<PaginationResponse<Comment>> => {
	return request.get<PaginationResponse<Comment>>(`/comment/post/${postId}`, {
		params: { page, pageSize }
	});
};

/**
 * 获取评论详情
 */
export const getComment = (id: number): Promise<ApiResponse<Comment>> => {
	return request.get<ApiResponse<Comment>>(`/comment/${id}`);
};

/**
 * 更新评论
 */
export const updateComment = (id: number, data: UpdateCommentParams): Promise<ApiResponse<Comment>> => {
	return request.patch<ApiResponse<Comment>>(`/comment/${id}`, data);
};

/**
 * 删除评论（软删除）
 */
export const deleteComment = (id: number): Promise<ApiResponse<null>> => {
	return request.delete<ApiResponse<null>>(`/comment/${id}`);
};

/**
 * 获取评论统计信息
 */
export const getCommentStatistics = (): Promise<ApiResponse<{ total: number; thisMonth: number }>> => {
	return request.get<ApiResponse<{ total: number; thisMonth: number }>>('/comment/stats/all');
};
