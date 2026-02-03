<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import type { ComponentType } from 'svelte';
	import { createEditor, EditorContent, BubbleMenu, FloatingMenu } from 'svelte-tiptap';
	import StarterKit from '@tiptap/starter-kit';
	import Placeholder from '@tiptap/extension-placeholder';
	import Link from '@tiptap/extension-link';
	import Underline from '@tiptap/extension-underline';
	import Highlight from '@tiptap/extension-highlight';
	import TaskList from '@tiptap/extension-task-list';
	import TaskItem from '@tiptap/extension-task-item';
	import Image from '@tiptap/extension-image';
	import { Table } from '@tiptap/extension-table';
	import { TableCell } from '@tiptap/extension-table-cell';
	import { TableHeader } from '@tiptap/extension-table-header';
	import { TableRow } from '@tiptap/extension-table-row';
	import ImagePicker from './ImagePicker.svelte';
	import { FileText, ImageIcon } from '@lucide/svelte';

	let { content = $bindable(''), readonly = false, class: className = '' } = $props();

	let editor = $state(null as any);
	let editorReady = $state(false);

	// Image Picker State
	let showImagePicker = $state(false);

	// Slash Menu State
	let showSlashMenu = $state(false);
	let slashQuery = $state('');
	let slashMenuPos = $state({ top: 0, left: 0 });
	let selectedIndex = $state(0);
	let slashMenuRef = $state(null as HTMLElement | null);

	const slashCommands: Array<{
		id: string;
		label: string;
		desc: string;
		command: (editor: any) => void;
		icon: ComponentType | string;
	}> = [
		{
			id: 'text',
			label: 'Text',
			desc: 'Start writing with plain text.',
			command: (editor: any) => editor.chain().focus().setParagraph().run(),
			icon: FileText
		},
		{
			id: 'heading1',
			label: 'Heading 1',
			desc: 'Big section heading.',
			command: (editor: any) => editor.chain().focus().toggleHeading({ level: 1 }).run(),
			icon: 'H1'
		},
		{
			id: 'heading2',
			label: 'Heading 2',
			desc: 'Medium section heading.',
			command: (editor: any) => editor.chain().focus().toggleHeading({ level: 2 }).run(),
			icon: 'H2'
		},
		{
			id: 'heading3',
			label: 'Heading 3',
			desc: 'Small section heading.',
			command: (editor: any) => editor.chain().focus().toggleHeading({ level: 3 }).run(),
			icon: 'H3'
		},
		{
			id: 'bulletRequest',
			label: 'Bullet List',
			desc: 'Create a simple bulleted list.',
			command: (editor: any) => editor.chain().focus().toggleBulletList().run(),
			icon: '•'
		},
		{
			id: 'orderedList',
			label: 'Numbered List',
			desc: 'Create a list with numbering.',
			command: (editor: any) => editor.chain().focus().toggleOrderedList().run(),
			icon: '1.'
		},
		{
			id: 'taskList',
			label: 'To-do List',
			desc: 'Track tasks with a to-do list.',
			command: (editor: any) => editor.chain().focus().toggleTaskList().run(),
			icon: '☐'
		},
		{
			id: 'blockquote',
			label: 'Quote',
			desc: 'Capture a quote.',
			command: (editor: any) => editor.chain().focus().toggleBlockquote().run(),
			icon: '❝'
		},
		{
			id: 'codeBlock',
			label: 'Code',
			desc: 'Capture a code snippet.',
			command: (editor: any) => editor.chain().focus().toggleCodeBlock().run(),
			icon: '</>'
		},
		{
			id: 'divider',
			label: 'Divider',
			desc: 'Visually divide blocks.',
			command: (editor: any) => editor.chain().focus().setHorizontalRule().run(),
			icon: '—'
		},
        {
			id: 'image',
			label: 'Image',
			desc: 'Upload or embed an image.',
			command: (editor: any) => addImage(),
			icon: ImageIcon
		}
	];

	let filteredCommands = $state(slashCommands);

	onMount(() => {
		const editorStore = createEditor({
			extensions: [
				StarterKit.configure({
					bulletList: { keepMarks: true, keepAttributes: false },
					orderedList: { keepMarks: true, keepAttributes: false },
					heading: { levels: [1, 2, 3] },
					dropcursor: { color: '#0ea5e9', width: 2 }
				}),
				TaskList,
				TaskItem.configure({ nested: true }),
				Link.configure({ openOnClick: false, autolink: true }),
				Placeholder.configure({ placeholder: 'Type \'/\' for commands...' }),
				Underline,
				Highlight.configure({ multicolor: true }),
				Image.configure({ inline: true }),
				Table.configure({ resizable: true }),
				TableRow,
				TableHeader,
				TableCell,
			],
			content: content || '',
			editable: !readonly,
			editorProps: {
				attributes: {
					class: 'prose prose-slate max-w-none focus:outline-none min-h-[300px] px-4 py-2'
				},
				handleKeyDown: (view, event) => {
					if (showSlashMenu) {
						if (event.key === 'ArrowUp') {
							event.preventDefault();
							selectedIndex = (selectedIndex - 1 + filteredCommands.length) % filteredCommands.length;
							return true;
						}
						if (event.key === 'ArrowDown') {
							event.preventDefault();
							selectedIndex = (selectedIndex + 1) % filteredCommands.length;
							return true;
						}
						if (event.key === 'Enter') {
							event.preventDefault();
							executeCommand(filteredCommands[selectedIndex]);
							return true;
						}
						if (event.key === 'Escape') {
							showSlashMenu = false;
							return true;
						}
					}
					// Trigger slash menu
					if (event.key === '/' && !showSlashMenu) {
						// Don't default prevent immediately, let the slash be typed, then check context
						// We'll handle this in onUpdate or slightly later
					}
					return false;
				}
			},
			onUpdate: ({ editor: ed }) => {
				content = ed.getHTML();
				handleSlashMenuCheck(ed);
			},
			onSelectionUpdate: ({ editor: ed }) => {
				handleSlashMenuCheck(ed);
			},
			onTransaction: () => {
				// force update if needed
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

	function handleSlashMenuCheck(ed: any) {
		if (!ed) return;
		
		const { state, view } = ed;
		const { selection } = state;
		const { empty, from } = selection;

		// Only show if selection is empty (cursor)
		if (!empty) {
			showSlashMenu = false;
			return;
		}

		const textBefore = state.doc.textBetween(Math.max(0, from - 20), from, '\n', '\0');
		// Only trigger on '/' at start of line or after a space
		const match = textBefore.match(/(?:^|\s)\/(.*)$/);
		
		if (match) {
			const query = match[1];
			filteredCommands = slashCommands.filter(cmd => 
				cmd.label.toLowerCase().includes(query.toLowerCase()) || 
				cmd.desc.toLowerCase().includes(query.toLowerCase())
			);
			
			if (filteredCommands.length > 0) {
				showSlashMenu = true;
				slashQuery = query;
				selectedIndex = 0;
				
				// Calculate position
				const coords = view.coordsAtPos(from);
				slashMenuPos = {
					top: coords.bottom + 10, // Add some breathing room
					left: coords.left
				};
			} else {
				showSlashMenu = false;
			}
		} else {
			showSlashMenu = false;
		}
	}

	function executeCommand(cmd: any) {
		if (editor && cmd) {
			// Delete the slash command text (e.g. "/heading")
			const { state } = editor;
			const { from } = state.selection;
			
			// We need to find where the slash started. 
			// We know slashQuery is the text after slash.
			const deleteRange = slashQuery.length + 1; // +1 for '/'

			editor.chain().focus().deleteRange({ from: from - deleteRange, to: from }).run();
			
			// Execute
			cmd.command(editor);
			
			showSlashMenu = false;
			slashQuery = '';
		}
	}

	function addImage() {
		showImagePicker = true;
	}

	function handleImageSelect(url: string) {
		if (url && editor) {
			editor.chain().focus().setImage({ src: url }).run();
		}
	}

	// Helper for Bubble Menu and Floating Menu actions
	const toggleBold = () => editor.chain().focus().toggleBold().run();
	const toggleItalic = () => editor.chain().focus().toggleItalic().run();
	const toggleStrike = () => editor.chain().focus().toggleStrike().run();
	const toggleCode = () => editor.chain().focus().toggleCode().run();
	
	const setLink = () => {
		const previousUrl = editor.getAttributes('link').href;
		const url = window.prompt('URL', previousUrl);
		
		if (url === null) return;
		if (url === '') {
			editor.chain().focus().extendMarkRange('link').unsetLink().run();
			return;
		}
		editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
	};

	// Floating menu actions
	const floatHeading1 = () => editor.chain().focus().toggleHeading({ level: 1 }).run();
	const floatBulletList = () => editor.chain().focus().toggleBulletList().run();
	const floatTaskList = () => editor.chain().focus().toggleTaskList().run();
</script>

<div class="notion-editor-container relative">
	{#if editorReady && editor}
		{#if !readonly}
			<BubbleMenu {editor} class="bubble-menu">
				<button onclick={toggleBold} class:active={editor.isActive('bold')}>Bold</button>
				<button onclick={toggleItalic} class:active={editor.isActive('italic')}>Italic</button>
				<button onclick={toggleStrike} class:active={editor.isActive('strike')}>Strike</button>
				<button onclick={toggleCode} class:active={editor.isActive('code')}>Code</button>
				<button onclick={setLink} class:active={editor.isActive('link')}>Link</button>
			</BubbleMenu>

			<FloatingMenu {editor} class="floating-menu">
				<button onclick={floatHeading1} class:active={editor.isActive('heading', { level: 1 })}>H1</button>
				<button onclick={floatBulletList} class:active={editor.isActive('bulletList')}>List</button>
				<button onclick={floatTaskList} class:active={editor.isActive('taskList')}>To-do</button>
                <button onclick={addImage}>Img</button>
			</FloatingMenu>
		{/if}

		<div class="editor-scroll-area">
			<EditorContent {editor} />
		</div>

		{#if showSlashMenu}
			<div 
				class="slash-menu-portal"
				style="top: {slashMenuPos.top}px; left: {slashMenuPos.left}px;"
				bind:this={slashMenuRef}
			>
				<div class="slash-menu-list">
					<div class="slash-menu-header">Basic blocks</div>
					{#each filteredCommands as cmd, i}
						<button
							class="slash-menu-item"
							class:selected={i === selectedIndex}
							onclick={() => executeCommand(cmd)}
							onmouseenter={() => selectedIndex = i}
						>
							<div class="cmd-icon">
								{#if typeof cmd.icon === 'string'}
									{cmd.icon}
								{:else}
									{@const Icon = cmd.icon}
									<Icon class="w-5 h-5" />
								{/if}
							</div>
							<div class="cmd-info">
								<div class="cmd-label">{cmd.label}</div>
								<div class="cmd-desc">{cmd.desc}</div>
							</div>
						</button>
					{/each}
					{#if filteredCommands.length === 0}
						<div class="p-2 text-gray-400 text-sm">No commands found</div>
					{/if}
				</div>
			</div>
		{/if}
	{:else}
		<div class="loading">Loading Editor...</div>
	{/if}
</div>

<!-- Image Picker Modal -->
<ImagePicker bind:open={showImagePicker} onSelect={handleImageSelect} />

<style>
	/* Container Styles */
	.notion-editor-container {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, "Apple Color Emoji", Arial, sans-serif, "Segoe UI Emoji", "Segoe UI Symbol";
		color: #37352f;
		line-height: 1.5;
        width: 100%;
        min-height: 300px;
	}

    /* Bubble Menu */
    :global(.bubble-menu) {
        display: flex;
        background-color: white;
        padding: 0.2rem;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        border: 1px solid #e2e8f0;
    }

    :global(.bubble-menu button) {
        border: none;
        background: none;
        color: #64748b;
        font-size: 0.85rem;
        font-weight: 500;
        padding: 0.3rem 0.6rem;
        cursor: pointer;
        border-radius: 4px;
    }

    :global(.bubble-menu button:hover) {
        background-color: #f1f5f9;
        color: #0f172a;
    }

    :global(.bubble-menu button.active) {
        color: #2563eb;
        background-color: #eff6ff;
    }

    /* Floating Menu (Fixed to the side of current line) */
    :global(.floating-menu) {
        display: flex;
        background-color: transparent;
        padding: 0.2rem;
        border-radius: 6px;
        margin-left: -2.5rem; /* Adjust based on preference */
    }

    :global(.floating-menu button) {
        border: none;
        background: white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        border: 1px solid #e2e8f0;
        color: #64748b;
        font-size: 0.75rem;
        font-weight: 600;
        padding: 0.2rem 0.4rem;
        cursor: pointer;
        border-radius: 4px;
        margin-right: 0.5rem;
    }
    
    :global(.floating-menu button:hover) {
        background-color: #f8fafc;
        color: #0f172a;
    }

    /* Slash Menu */
    .slash-menu-portal {
        position: fixed;
        z-index: 9999;
        background: white;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(15, 15, 15, 0.1), 0 0 0 1px rgba(15, 15, 15, 0.05);
        width: 300px;
        max-height: 300px;
        overflow-y: auto;
        padding: 0.25rem 0;
    }
    
    .slash-menu-header {
        padding: 0.5rem 0.75rem;
        font-size: 0.75rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .slash-menu-item {
        display: flex;
        align-items: center;
        width: 100%;
        padding: 0.4rem 0.75rem;
        text-align: left;
        background: transparent;
        border: none;
        cursor: pointer;
        gap: 0.75rem;
    }

    .slash-menu-item:hover, .slash-menu-item.selected {
        background-color: #f3f4f6;
    }

    .cmd-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        background: white;
        font-size: 1.2rem;
    }

    .cmd-info {
        flex: 1;
        overflow: hidden;
    }

    .cmd-label {
        font-size: 0.9rem;
        font-weight: 500;
        color: #111827;
    }

    .cmd-desc {
        font-size: 0.75rem;
        color: #6b7280;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    /* Tiptap content overrides for Notion feel */
    :global(.ProseMirror) {
        outline: none;
    }
    
    :global(.ProseMirror p.is-editor-empty:first-child::before) {
        color: #adb5bd;
        content: attr(data-placeholder);
        float: left;
        height: 0;
        pointer-events: none;
    }

    :global(ul[data-type="taskList"]) {
        list-style: none;
        padding: 0;
        margin: 0;
    }

    :global(li[data-type="taskItem"]) {
        display: flex;
        gap: 0.5rem;
        align-items: flex-start;
        margin: 0.25rem 0;
    }

    :global(li[data-type="taskItem"] input[type="checkbox"]) {
        margin-top: 0.3rem;
        cursor: pointer;
    }

    :global(li[data-type="taskItem"] > div) {
        flex: 1;
    }

    :global(.ProseMirror img) {
        display: block;
        max-width: 100%;
        height: auto;
        border-radius: 4px;
        margin: 1rem 0;
    }
    
    :global(.ProseMirror h1) { font-size: 2.25em; font-weight: 700; margin-top: 1em; margin-bottom: 0.5em; line-height: 1.1; }
    :global(.ProseMirror h2) { font-size: 1.75em; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; line-height: 1.1; }
    :global(.ProseMirror h3) { font-size: 1.5em; font-weight: 600; margin-top: 1em; margin-bottom: 0.5em; line-height: 1.1; }
</style>
