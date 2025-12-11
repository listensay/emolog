<script lang="ts">
	import { onMount } from 'svelte';
	import { createEditor, EditorContent, BubbleMenu } from 'svelte-tiptap';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import Link from '@tiptap/extension-link';
	import Underline from '@tiptap/extension-underline';
	import Highlight from '@tiptap/extension-highlight';

	let { content = $bindable(''), readonly = false, class: className = '' } = $props();

	let editor = $state(null as any);
	let editorReady = $state(false);
	let showSlashMenu = $state(false);
	let slashQuery = $state('');

	const slashCommands = [
		{ label: '标题 1', command: (editor: any) => editor.commands.toggleHeading({ level: 1 }), icon: '# ' },
		{ label: '标题 2', command: (editor: any) => editor.commands.toggleHeading({ level: 2 }), icon: '## ' },
		{ label: '标题 3', command: (editor: any) => editor.commands.toggleHeading({ level: 3 }), icon: '### ' },
		{ label: '正文', command: (editor: any) => editor.commands.setParagraph(), icon: '¶' },
		{ label: '项目符号列表', command: (editor: any) => editor.commands.toggleBulletList(), icon: '•' },
		{ label: '编号列表', command: (editor: any) => editor.commands.toggleOrderedList(), icon: '1.' },
		{ label: '引用', command: (editor: any) => editor.commands.toggleBlockquote(), icon: '❝' },
		{ label: '代码块', command: (editor: any) => editor.commands.toggleCodeBlock(), icon: '</>' },
		{ label: '分隔线', command: (editor: any) => editor.commands.setHorizontalRule(), icon: '—' },
	];

	let filteredCommands = $state(slashCommands);

	onMount(() => {
		const editorStore = createEditor({
			extensions: [
				StarterKit.configure({
					bulletList: {
						keepMarks: true,
						keepAttributes: false
					},
					orderedList: {
						keepMarks: true,
						keepAttributes: false
					},
					heading: {
						levels: [1, 2, 3]
					}
				}),
				Link.configure({
					openOnClick: false,
					autolink: true
				}),
				Placeholder.configure({
					placeholder: '输入 "/" 获取更多选项...'
				}),
				Underline,
				Highlight.configure({
					multicolor: true
				})
			],
			content: content || '',
			editable: !readonly,
			onUpdate: ({ editor: ed }) => {
				content = ed.getHTML();
			}
		});

		const unsubscribe = editorStore.subscribe((value) => {
			editor = value;
			editorReady = !!value;
		});

		return () => {
			unsubscribe();
			if (editor) {
				editor.destroy();
			}
		};
	});

	function handleKeyDown(e: KeyboardEvent) {
		if (e.key === '/') {
			e.preventDefault();
			showSlashMenu = !showSlashMenu;
			slashQuery = '';
			filteredCommands = slashCommands;
		}
	}

	function executeCommand(cmd: any) {
		if (editor) {
			cmd.command(editor);
			showSlashMenu = false;
			slashQuery = '';
			editor.view.focus();
		}
	}

	function filterCommands(query: string) {
		if (!query) {
			filteredCommands = slashCommands;
		} else {
			filteredCommands = slashCommands.filter((cmd) =>
				cmd.label.toLowerCase().includes(query.toLowerCase())
			);
		}
	}

	function applyBold() {
		if (editor) {
			editor.commands.toggleBold();
			editor.view.focus();
		}
	}

	function applyItalic() {
		if (editor) {
			editor.commands.toggleItalic();
			editor.view.focus();
		}
	}

	function applyUnderline() {
		if (editor) {
			editor.commands.toggleUnderline();
			editor.view.focus();
		}
	}

	function applyStrike() {
		if (editor) {
			editor.commands.toggleStrike();
			editor.view.focus();
		}
	}

	function applyCode() {
		if (editor) {
			editor.commands.toggleCode();
			editor.view.focus();
		}
	}

	function applyHighlight() {
		if (editor) {
			editor.commands.toggleHighlight();
			editor.view.focus();
		}
	}

	function addLink() {
		const url = prompt('输入链接地址:');
		if (url && editor) {
			editor.commands.setLink({ href: url });
			editor.view.focus();
		}
	}

	function toggleBulletList() {
		if (editor) {
			editor.commands.toggleBulletList();
			editor.view.focus();
		}
	}

	function toggleOrderedList() {
		if (editor) {
			editor.commands.toggleOrderedList();
			editor.view.focus();
		}
	}

	function toggleBlockquote() {
		if (editor) {
			editor.commands.toggleBlockquote();
			editor.view.focus();
		}
	}

	function toggleCodeBlock() {
		if (editor) {
			editor.commands.toggleCodeBlock();
			editor.view.focus();
		}
	}

	function insertHorizontalRule() {
		if (editor) {
			editor.commands.setHorizontalRule();
			editor.view.focus();
		}
	}
</script>

<div class="tiptap-container">
	{#if !readonly && editor}
		<!-- 工具栏 -->
		<div class="editor-toolbar">
			<div class="toolbar-group">
				<button
					onclick={applyBold}
					title="粗体 (Ctrl+B)"
					class={`toolbar-button ${editor.isActive('bold') ? 'active' : ''}`}
					aria-label="粗体"
				>
					<strong>B</strong>
				</button>
				<button
					onclick={applyItalic}
					title="斜体 (Ctrl+I)"
					class={`toolbar-button ${editor.isActive('italic') ? 'active' : ''}`}
					aria-label="斜体"
				>
					<em>I</em>
				</button>
				<button
					onclick={applyUnderline}
					title="下划线 (Ctrl+U)"
					class={`toolbar-button ${editor.isActive('underline') ? 'active' : ''}`}
					aria-label="下划线"
				>
					<u>U</u>
				</button>
				<button
					onclick={applyStrike}
					title="删除线"
					class={`toolbar-button ${editor.isActive('strike') ? 'active' : ''}`}
					aria-label="删除线"
				>
					<s>S</s>
				</button>
				<button
					onclick={applyCode}
					title="代码"
					class={`toolbar-button ${editor.isActive('code') ? 'active' : ''}`}
					aria-label="代码"
				>
					<code>&lt;&gt;</code>
				</button>
			</div>

			<div class="toolbar-divider"></div>

			<div class="toolbar-group">
				<button
					onclick={addLink}
					title="链接"
					class={`toolbar-button ${editor.isActive('link') ? 'active' : ''}`}
					aria-label="链接"
				>
					🔗
				</button>
				<button
					onclick={applyHighlight}
					title="高亮"
					class={`toolbar-button ${editor.isActive('highlight') ? 'active' : ''}`}
					aria-label="高亮"
				>
					🎨
				</button>
			</div>

			<div class="toolbar-divider"></div>

			<div class="toolbar-group">
				<button
					onclick={toggleBulletList}
					title="项目符号列表"
					class={`toolbar-button ${editor.isActive('bulletList') ? 'active' : ''}`}
					aria-label="项目符号列表"
				>
					• 列表
				</button>
				<button
					onclick={toggleOrderedList}
					title="编号列表"
					class={`toolbar-button ${editor.isActive('orderedList') ? 'active' : ''}`}
					aria-label="编号列表"
				>
					1. 列表
				</button>
				<button
					onclick={toggleBlockquote}
					title="引用"
					class={`toolbar-button ${editor.isActive('blockquote') ? 'active' : ''}`}
					aria-label="引用"
				>
					❝
				</button>
				<button
					onclick={toggleCodeBlock}
					title="代码块"
					class={`toolbar-button ${editor.isActive('codeBlock') ? 'active' : ''}`}
					aria-label="代码块"
				>
					{'</>'} 块
				</button>
			</div>

			<div class="toolbar-divider"></div>

			<div class="toolbar-group">
				<button
					onclick={insertHorizontalRule}
					title="分隔线"
					class="toolbar-button"
					aria-label="分隔线"
				>
					—
				</button>
			</div>
		</div>
	{/if}

	<!-- 编辑器 -->
	{#if editorReady && editor}
		<div class="editor-wrapper" role="textbox" aria-multiline="true" tabindex={0} onkeydown={handleKeyDown}>
			<EditorContent
				{editor}
				class="tiptap-editor prose prose-slate max-w-none {className}"
			/>

			<!-- 浮动菜单 - 在选中文本时显示 -->
			{#if !readonly}
				<BubbleMenu
					{editor}
					class="bubble-menu"
				>
					<div class="bubble-menu-content">
						<button
							onclick={applyBold}
							class={`bubble-button ${editor.isActive('bold') ? 'active' : ''}`}
							aria-label="粗体"
						>
							<strong>B</strong>
						</button>
						<button
							onclick={applyItalic}
							class={`bubble-button ${editor.isActive('italic') ? 'active' : ''}`}
							aria-label="斜体"
						>
							<em>I</em>
						</button>
						<button
							onclick={applyUnderline}
							class={`bubble-button ${editor.isActive('underline') ? 'active' : ''}`}
							aria-label="下划线"
						>
							<u>U</u>
						</button>
						<button onclick={addLink} class="bubble-button" aria-label="链接">
							🔗
						</button>
					</div>
				</BubbleMenu>
			{/if}
		</div>

		<!-- 斜杠命令菜单 -->
		{#if showSlashMenu}
			<div class="slash-menu">
				<div class="slash-menu-header">
					<input
						type="text"
						placeholder="搜索命令..."
						bind:value={slashQuery}
						onchange={() => filterCommands(slashQuery)}
						oninput={() => filterCommands(slashQuery)}
						class="slash-search"
					/>
				</div>
				<div class="slash-menu-items">
					{#each filteredCommands as command (command.label)}
						<button
							class="slash-menu-item"
							onclick={() => executeCommand(command)}
						>
							<span class="slash-icon">{command.icon}</span>
							<span class="slash-label">{command.label}</span>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	{:else}
		<div class="editor-loading">
			加载编辑器中...
		</div>
	{/if}
</div>

<style>
	.tiptap-container {
		display: flex;
		flex-direction: column;
		width: 100%;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		overflow: hidden;
		background: white;
	}

	.editor-toolbar {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem;
		padding: 0.75rem;
		background: #f8fafc;
		border-bottom: 1px solid #e2e8f0;
	}

	.toolbar-group {
		display: flex;
		gap: 0.25rem;
	}

	.toolbar-divider {
		width: 1px;
		background: #cbd5e1;
		margin: 0 0.25rem;
	}

	.toolbar-button {
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		border: 1px solid transparent;
		border-radius: 0.375rem;
		background: transparent;
		color: #64748b;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 500;
	}

	.toolbar-button:hover {
		background: white;
		color: #1e293b;
		border-color: #cbd5e1;
	}

	.toolbar-button.active {
		background: #10b981;
		color: white;
		border-color: #10b981;
	}

	.editor-wrapper {
		flex: 1;
		position: relative;
	}

	.tiptap-editor {
		min-height: 400px;
		padding: 1rem;
		outline: none;
	}

	:global(.tiptap-editor h1) {
		font-size: 2rem;
		font-weight: bold;
		margin: 1rem 0 0.5rem 0;
	}

	:global(.tiptap-editor h2) {
		font-size: 1.5rem;
		font-weight: bold;
		margin: 0.75rem 0 0.5rem 0;
	}

	:global(.tiptap-editor h3) {
		font-size: 1.25rem;
		font-weight: 600;
		margin: 0.5rem 0 0.25rem 0;
	}

	:global(.tiptap-editor blockquote) {
		border-left: 4px solid #cbd5e1;
		padding-left: 1rem;
		margin: 0.5rem 0;
		color: #64748b;
		font-style: italic;
	}

	:global(.tiptap-editor pre) {
		background: #1e293b;
		color: #f1f5f9;
		padding: 1rem;
		border-radius: 0.5rem;
		overflow-x: auto;
		margin: 0.5rem 0;
		font-family: monospace;
		font-size: 0.875rem;
	}

	:global(.tiptap-editor code) {
		background: #f1f5f9;
		color: #0f172a;
		padding: 0.125rem 0.375rem;
		border-radius: 0.25rem;
		font-family: monospace;
		font-size: 0.875em;
	}

	:global(.tiptap-editor pre code) {
		background: transparent;
		color: inherit;
		padding: 0;
		border-radius: 0;
	}

	:global(.tiptap-editor ul) {
		list-style: disc;
		margin-left: 2rem;
		margin: 0.5rem 0;
	}

	:global(.tiptap-editor ol) {
		list-style: decimal;
		margin-left: 2rem;
		margin: 0.5rem 0;
	}

	:global(.tiptap-editor li) {
		margin: 0.25rem 0;
	}

	:global(.tiptap-editor a) {
		color: #10b981;
		text-decoration: underline;
		cursor: pointer;
	}

	:global(.tiptap-editor a:hover) {
		color: #059669;
	}

	:global(.tiptap-editor hr) {
		margin: 1rem 0;
		border: none;
		border-top: 2px solid #e2e8f0;
	}

	:global(.bubble-menu) {
		display: flex;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
		overflow: hidden;
	}

	.bubble-menu-content {
		display: flex;
		gap: 0;
	}

	.bubble-button {
		padding: 0.5rem 0.75rem;
		font-size: 0.875rem;
		border: none;
		background: transparent;
		color: #64748b;
		cursor: pointer;
		transition: all 0.2s;
		font-weight: 500;
	}

	.bubble-button:hover {
		background: #f8fafc;
		color: #1e293b;
	}

	.bubble-button.active {
		background: #10b981;
		color: white;
	}

	.slash-menu {
		position: fixed;
		background: white;
		border: 1px solid #e2e8f0;
		border-radius: 0.5rem;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
		z-index: 50;
		max-width: 350px;
		max-height: 400px;
		overflow-y: auto;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
	}

	.slash-menu-header {
		padding: 0.75rem;
		border-bottom: 1px solid #e2e8f0;
	}

	.slash-search {
		width: 100%;
		padding: 0.5rem;
		border: 1px solid #cbd5e1;
		border-radius: 0.375rem;
		font-size: 0.875rem;
		outline: none;
	}

	.slash-search:focus {
		border-color: #10b981;
		box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
	}

	.slash-menu-items {
		display: flex;
		flex-direction: column;
	}

	.slash-menu-item {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		padding: 0.75rem;
		border: none;
		background: transparent;
		color: #1e293b;
		cursor: pointer;
		text-align: left;
		transition: all 0.15s;
		font-size: 0.875rem;
	}

	.slash-menu-item:hover {
		background: #f8fafc;
		color: #10b981;
	}

	.slash-icon {
		font-weight: 600;
		color: #10b981;
		width: 1.5rem;
	}

	.slash-label {
		flex: 1;
	}

	.editor-loading {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 400px;
		color: #94a3b8;
		font-size: 0.875rem;
	}
</style>
