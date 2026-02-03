<script lang="ts">
	import type { Comment } from '$lib/api/comment';
	import { X, Reply } from '@lucide/svelte';
	import CommentForm from './CommentForm.svelte';

	interface CommentWithParent extends Comment {
		replies?: CommentWithParent[];
		parentUser?: string;
	}

	interface Props {
		open: boolean;
		parentComment: CommentWithParent;
		onClose: () => void;
		onSubmitReply: (data: { username?: string; email?: string; content: string; parentCommentId?: number }) => Promise<void>;
		isSubmitting?: boolean;
	}

	let { open = $bindable(false), parentComment, onClose, onSubmitReply, isSubmitting = false }: Props = $props();

	let replyingTo: CommentWithParent | null = $state(null);

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

	function handleBackdropClick(e: MouseEvent) {
		if (e.target === e.currentTarget) {
			onClose();
		}
	}

	function handleReplyClick(comment: CommentWithParent) {
		replyingTo = comment;
		// 滚动到评论表单
		setTimeout(() => {
			const commentForm = document.getElementById('modal-comment-form');
			commentForm?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
		}, 100);
	}

	function handleCancelReply() {
		replyingTo = null;
	}

	async function handleSubmitComment(data: { username?: string; email?: string; content: string; parentCommentId?: number }) {
		await onSubmitReply(data);
		replyingTo = null;
	}
</script>

{#if open}
	<!-- 遮罩层 -->
	<div
		class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
		onclick={handleBackdropClick}
		role="button"
		tabindex="0"
	>
		<!-- 弹窗内容 -->
		<div
			class="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col"
			onclick={(e) => e.stopPropagation()}
			role="dialog"
			aria-modal="true"
		>
			<!-- 弹窗头部 -->
			<div class="flex items-center justify-between p-6 border-b border-slate-200">
				<h3 class="text-lg font-semibold text-slate-900">
					全部回复 ({parentComment.replies?.length || 0})
				</h3>
				<button
					onclick={onClose}
					class="text-slate-400 hover:text-slate-600 transition-colors"
					aria-label="关闭"
				>
					<X class="w-6 h-6" />
				</button>
			</div>

			<!-- 原始评论 -->
			<div class="p-6 border-b border-slate-200 bg-slate-50">
				<div class="flex gap-4">
					<div
						class="shrink-0 w-10 h-10 rounded-full bg-linear-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium"
					>
						{getAuthorInitial(parentComment)}
					</div>
					<div class="flex-1 min-w-0">
						<div class="flex items-center gap-2 mb-2">
							<span class="font-medium text-slate-900">{getCommentAuthor(parentComment)}</span>
							{#if parentComment.user}
								<span class="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-600 rounded-full">
									注册用户
								</span>
							{/if}
							<span class="text-sm text-slate-500">{formatDate(parentComment.createdAt)}</span>
						</div>
						<p class="text-slate-700 whitespace-pre-wrap wrap-break-word">{parentComment.content}</p>
					</div>
				</div>
			</div>

			<!-- 回复列表 -->
			<div class="flex-1 overflow-y-auto p-6 space-y-4">
				{#if parentComment.replies && parentComment.replies.length > 0}
					{#each parentComment.replies as reply (reply.id)}
						<!-- 二级评论 -->
						<div class="flex gap-3 p-4 bg-slate-50 rounded-lg">
							<!-- 头像 -->
							<div
								class="shrink-0 w-8 h-8 rounded-full bg-linear-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-sm font-medium"
							>
								{getAuthorInitial(reply)}
							</div>

							<!-- 回复内容 -->
							<div class="flex-1 min-w-0">
								<!-- 作者和时间 -->
								<div class="flex items-center gap-2 mb-2">
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
									<span class="text-xs text-slate-500">{formatDate(reply.createdAt)}</span>
								</div>

								<!-- 回复文本（显示 @父级用户名） -->
								<p class="text-sm text-slate-700 whitespace-pre-wrap wrap-break-word mb-2">
									{#if reply.parentUser}
										<span class="text-emerald-600 font-medium">@{reply.parentUser}</span>
										{' '}
									{/if}
									{reply.content}
								</p>

								<!-- 回复按钮 -->
								<button
									onclick={() => handleReplyClick(reply)}
									class="flex items-center gap-1 text-xs text-slate-500 hover:text-emerald-600 transition-colors"
								>
									<Reply class="w-3.5 h-3.5" />
									回复
								</button>
							</div>
						</div>
					{/each}
				{:else}
					<div class="text-center py-12 text-slate-400">
						<p>暂无回复</p>
					</div>
				{/if}
			</div>

			<!-- 评论表单 -->
			<div id="modal-comment-form" class="border-t border-slate-200 p-6 bg-slate-50">
				<CommentForm
					postId={parentComment.postId || 0}
					replyTo={replyingTo}
					onSubmit={handleSubmitComment}
					onCancel={handleCancelReply}
					isSubmitting={isSubmitting}
				/>
			</div>
		</div>
	</div>
{/if}
