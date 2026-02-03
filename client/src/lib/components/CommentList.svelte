<script lang="ts">
	import type { Comment } from '$lib/api/comment';
	import { Reply } from '@lucide/svelte';
	import CommentForm from './CommentForm.svelte';

	interface Props {
		comments: Comment[];
		onReply?: (comment: Comment) => void;
		replyToComment?: Comment | null;
		onSubmitReply?: (data: { username?: string; email?: string; url?: string; content: string; parentCommentId?: number }) => Promise<void>;
		onCancelReply?: () => void;
		isSubmitting?: boolean;
	}

	let { comments, onReply, replyToComment = null, onSubmitReply, onCancelReply, isSubmitting = false }: Props = $props();

	function formatDate(date: string) {
		const now = new Date();
		const commentDate = new Date(date);
		const diffInSeconds = Math.floor((now.getTime() - commentDate.getTime()) / 1000);

		if (diffInSeconds < 60) {
			return '刚刚';
		} else if (diffInSeconds < 3600) {
			return `${Math.floor(diffInSeconds / 60)} 分钟前`;
		} else if (diffInSeconds < 86400) {
			return `${Math.floor(diffInSeconds / 3600)} 小时前`;
		} else if (diffInSeconds < 2592000) {
			return `${Math.floor(diffInSeconds / 86400)} 天前`;
		} else {
			return commentDate.toLocaleDateString('zh-CN', {
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		}
	}

	function getCommentAuthor(comment: Comment) {
		if (comment.user) {
			return comment.user.username;
		}
		return comment.username || '匿名用户';
	}

	function getAuthorInitial(comment: Comment) {
		const author = getCommentAuthor(comment);
		return author.charAt(0).toUpperCase();
	}

	// 扩展 Comment 类型，添加父评论信息
	interface CommentWithParent extends Comment {
		replies: CommentWithParent[];
		parentUser?: string; // 父评论的用户名
	}

	// 构建扁平化的两级评论结构
	const commentTree = $derived(() => {
		const commentMap = new Map<number, CommentWithParent>();

		// 初始化所有评论
		comments.forEach((comment) => {
			commentMap.set(comment.id, {
				...comment,
				replies: [],
				parentUser: undefined
			});
		});

		// 找出所有一级评论（没有父评论的）
		const rootComments: CommentWithParent[] = [];

		comments.forEach((comment) => {
			if (!comment.parentCommentId) {
				rootComments.push(commentMap.get(comment.id)!);
			}
		});

		// 将所有子评论扁平化到一级评论下，并记录父评论用户名
		comments.forEach((comment) => {
			if (comment.parentCommentId) {
				// 找到最顶层的一级评论
				let rootComment: Comment | undefined;
				let parentComment: Comment | undefined;
				let currentId = comment.parentCommentId;

				// 向上遍历找到一级评论
				while (currentId) {
					const parent = comments.find((c) => c.id === currentId);
					if (parent) {
						parentComment = parent;
						if (!parent.parentCommentId) {
							rootComment = parent;
							break;
						}
						currentId = parent.parentCommentId;
					} else {
						break;
					}
				}

				// 如果找到了根评论，将当前评论作为二级评论添加
				if (rootComment && parentComment) {
					const rootCommentWithReplies = commentMap.get(rootComment.id);
					const currentCommentWithParent = commentMap.get(comment.id)!;

					// 记录父评论的用户名
					currentCommentWithParent.parentUser = getCommentAuthor(parentComment);

					if (rootCommentWithReplies) {
						rootCommentWithReplies.replies.push(currentCommentWithParent);
					}
				}
			}
		});

		return rootComments;
	});

</script>

{#if comments.length === 0}
	<div class="text-center py-12 text-slate-400">
		<p>暂无评论，快来抢沙发吧~</p>
	</div>
{:else}
	<div class="space-y-6">
		{#each commentTree() as comment (comment.id)}
			<div class="group">
				<!-- 主评论 -->
				<div class="flex gap-4">
					<!-- 头像 -->
					<div
						class="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium"
					>
						{getAuthorInitial(comment)}
					</div>

					<!-- 评论内容 -->
					<div class="flex-1 min-w-0">
						<div class="bg-slate-50 rounded-lg p-4">
							<!-- 作者和时间 -->
							<div class="flex items-center justify-between mb-2">
								<div class="flex items-center gap-2">
									<span class="font-medium text-slate-900">{getCommentAuthor(comment)}</span>
									{#if comment.user}
										<span
											class="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-600 rounded-full"
										>
											注册用户
										</span>
									{/if}
								</div>
								<span class="text-sm text-slate-500">{formatDate(comment.createdAt)}</span>
							</div>

							<!-- 评论文本 -->
							<p class="text-slate-700 whitespace-pre-wrap wrap-break-word">{comment.content}</p>
						</div>

						<!-- 回复按钮 -->
						{#if onReply}
							<button
								onclick={() => onReply?.(comment)}
								class="mt-2 flex items-center gap-1 text-sm text-slate-500 hover:text-emerald-600 transition-colors"
							>
								<Reply class="w-4 h-4" />
								回复
							</button>
						{/if}

						<!-- 回复表单（显示在一级评论下方） -->
						{#if replyToComment && replyToComment.id === comment.id && onSubmitReply}
							<div class="mt-4">
								<CommentForm
									postId={comment.postId}
									replyTo={replyToComment}
									onSubmit={onSubmitReply}
									onCancel={onCancelReply}
									isSubmitting={isSubmitting}
								/>
							</div>
						{/if}

						<!-- 二级评论列表 -->
						{#if comment.replies && comment.replies.length > 0}
							<div class="mt-4 space-y-3 pl-4 border-l-2 border-slate-200">
								{#each comment.replies as reply (reply.id)}
									<div class="flex gap-3">
										<!-- 头像 -->
										<div
											class="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-medium"
										>
											{getAuthorInitial(reply)}
										</div>

										<!-- 回复内容 -->
										<div class="flex-1 min-w-0">
											<div class="bg-white rounded-lg p-3 border border-slate-200">
												<!-- 作者和时间 -->
												<div class="flex items-center justify-between mb-2">
													<div class="flex items-center gap-2">
														<span class="text-sm font-medium text-slate-900">
															{getCommentAuthor(reply)}
														</span>
														{#if reply.user}
															<span
																class="px-1.5 py-0.5 text-xs bg-emerald-100 text-emerald-600 rounded-full"
															>
																注册用户
															</span>
														{/if}
													</div>
													<span class="text-xs text-slate-500">{formatDate(reply.createdAt)}</span>
												</div>

												<!-- 回复文本（显示 @父级用户名） -->
												<p class="text-sm text-slate-700 whitespace-pre-wrap wrap-break-word">
													{#if reply.parentUser}
														<span class="text-emerald-600 font-medium">@{reply.parentUser}</span>
														{' '}
													{/if}
													{reply.content}
												</p>
											</div>

											<!-- 回复按钮 -->
											{#if onReply}
												<button
													onclick={() => onReply?.(reply)}
													class="mt-1.5 flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
												>
													<Reply class="w-3.5 h-3.5" />
													回复
												</button>
											{/if}

											<!-- 回复表单（显示在二级评论下方） -->
											{#if replyToComment && replyToComment.id === reply.id && onSubmitReply}
												<div class="mt-3">
													<CommentForm
														postId={reply.postId}
														replyTo={replyToComment}
														onSubmit={onSubmitReply}
														onCancel={onCancelReply}
														isSubmitting={isSubmitting}
													/>
												</div>
											{/if}
										</div>
									</div>
								{/each}
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
