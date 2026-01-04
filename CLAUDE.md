# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Emolog 是一个全栈博客管理系统，采用 monorepo 结构：

- **client/** - SvelteKit 5 前端（管理后台 + 博客前台）
- **server/** - NestJS 后端 API 服务
- **scripts/** - 数据迁移和工具脚本

## Quick Start

```bash
# 后端启动
cd server
npm install
npm run dev          # http://localhost:8080
                     # Swagger: http://localhost:8080/api

# 前端启动
cd client
npm install
npm run dev          # http://localhost:5173
```

## Development Commands

### Server (NestJS)

```bash
npm run dev              # 开发模式（热重载，别名 start:dev）
npm run start:prod       # 生产模式
npm run test             # 单元测试
npm run test:watch       # 测试监视模式
npm run test:cov         # 测试覆盖率
npm run test:e2e         # E2E 测试
npm run lint             # ESLint（自动修复）
npm run format           # Prettier 格式化
npm run build            # 构建生产版本
```

### Client (SvelteKit)

```bash
npm run dev              # 开发服务器（Vite）
npm run build            # 生产构建
npm run preview          # 预览生产构建
npm run check            # TypeScript 类型检查（使用 svelte-check）
npm run check:watch      # 类型检查监视模式
npm run lint             # ESLint + Prettier 检查
npm run format           # Prettier 格式化
```

## Architecture

### Backend (server/)

**技术栈**: NestJS + TypeORM + MySQL + JWT + Swagger

**模块结构** (`src/modules/`):

- `auth/` - JWT 认证（7天有效期）
- `user/` - 用户管理
- `post/` - 文章 CRUD
- `category/` - 分类管理（支持 POST/IMAGE 两种类型）
- `tag/` - 标签管理
- `image/` - 图片上传管理
- `comment/` - 评论管理
- `config/` - 站点配置（key-value 存储）

**数据模型关系**:

```text
User 1:N Post 1:N Comment
Post N:1 Category
Post N:M Tag (via post_tags)
Image N:1 Category
```

**全局组件**:

- `TransformInterceptor` - 统一响应格式 `{ code, message, data, success }`
- `HttpExceptionFilter` - 统一异常处理
- `ValidationPipe` - 请求验证（whitelist + transform）

**业务码**:

- `2000` SUCCESS
- `4102` INVALID_CREDENTIALS
- `4103` ACCOUNT_DISABLED
- `4105` INVALID_TOKEN

**环境配置**: `.env.development` / `.env.production`

```bash
DB_NAME=emolog
DB_USERNAME=root
DB_PASSWORD=xxx
JWT_SECRET=xxx
PORT=8080
```

### Frontend (client/)

**技术栈**: SvelteKit 5 + Svelte 5 Runes + Tailwind CSS v4 + Tiptap + @lucide/svelte

**路由结构** (`src/routes/`):

```text
/                      # 首页（文章列表，SSR）
/posts/[id]            # 文章详情（SSR）
/auth/login            # 登录
/admin/                # 管理后台（需认证）
  /posts/              # 文章管理
  /categories/         # 分类管理
  /tags/               # 标签管理
  /images/             # 图片管理
  /comments/           # 评论管理
  /users/              # 用户管理
  /settings/           # 站点设置
```

**SSR 数据流**:

- `+layout.server.ts` - 加载 siteConfig
- `+page.server.ts` - 调用 `parent()` 获取 siteConfig，加载页面数据
- `+page.svelte` - 使用 `data.siteConfig` 和 `data.*` 渲染

**状态管理** (`src/lib/stores/`):

- `auth.ts` - 认证状态（localStorage 同步）
- `toast.ts` - 全局消息提示
- `siteConfig.ts` - 站点配置（客户端缓存）
- `adminPageStore.ts` - 管理后台页面标题和副标题（统一管理）

**API 层** (`src/lib/api/`):

- Axios 实例 + 请求/响应拦截器
- 自动添加 Bearer token
- 统一错误处理

**组件架构** (`src/lib/components/`):

- `ui/` - 基础 UI 组件（Button, Input, Form, Badge）
- `admin/` - 管理后台复用组件：
  - `AdminPage.svelte` - 统一页面容器（处理标题、副标题、操作按钮）
  - `AdminTable.svelte` - 统一表格组件
  - `PostForm.svelte` - 文章创建/编辑表单（支持 create/edit 模式）
  - `Sidebar.svelte` - 侧边栏导航（使用 Lucide 图标）
  - `Header.svelte` - 顶部导航
- `home/` - 前台组件（PostCard - 支持有/无封面两种样式）
- `layout/` - 布局组件（HomeLayout - 响应式布局）
- `TiptapEditor.svelte` - 富文本编辑器（支持 slash 命令菜单）
- `ImagePicker.svelte` - 图片选择器

**图标系统**:

- 使用 `@lucide/svelte` 图标库
- 所有 SVG 和 emoji 图标已替换为 Lucide 组件
- 支持 Svelte 5 runes 模式的动态图标渲染（`{@const Icon = iconComponent}`）

**主题系统**:

- Tailwind CSS v4（使用 `@tailwindcss/vite` 插件）
- 全局样式在页面中使用硬编码 Tailwind 类

### API Proxy

前端开发时的代理配置（`vite.config.ts`）:

- `/api/*` → `http://localhost:8080/*`
- `/uploads/*` → `http://localhost:8080/uploads/*`

## Key Patterns

### Svelte 5 Runes

```typescript
let value = $state('')           // 响应式变量
const computed = $derived(...)   // 计算属性
$effect(() => { ... })           // 副作用
let { prop }: Props = $props()   // 组件属性
let prop = $bindable('')         // 双向绑定属性
```

### 复用组件模式 (PostForm 示例)

```typescript
// PostForm.svelte - 支持 create/edit 两种模式
interface Props {
  mode: 'create' | 'edit';
  // 使用 $bindable 实现双向绑定
  title: string;
  content: string;
  // ... 其他表单字段
}

let { mode, title = $bindable(''), content = $bindable('') }: Props = $props();
const pageTitle = $derived(mode === 'create' ? '新建文章' : '编辑文章');
```

### API 调用模式

```typescript
try {
  const response = await getPost(id)
  data = response.data
} catch (error: any) {
  toast.error(error.message)
}
```

### 路由守卫

在 `+page.ts` 中使用 `throw redirect()` 实现认证检查

### AdminPage 和 AdminTable 使用模式

```svelte
<script>
  import AdminPage from '$lib/components/admin/AdminPage.svelte';
  import AdminTable from '$lib/components/admin/AdminTable.svelte';

  // 使用 store 管理页面标题
  adminPageStore.set({ title: '文章管理', subtitle: '管理所有文章' });
</script>

<AdminPage actions={[{ label: '新建', onClick: handleCreate }]}>
  <AdminTable columns={...} data={...} />
</AdminPage>
```

### 新增后端模块

1. `nest generate resource [name]`
2. 在 `app.module.ts` 注册实体
3. 使用 `@Public()` 装饰器标记公开接口

### 新增前端页面

1. 创建 `+page.svelte`
2. 需要认证时添加 `+page.ts` 路由守卫
3. 使用 toast 进行用户反馈
4. 管理后台页面使用 `AdminPage` 和 `AdminTable` 组件
5. 使用 `adminPageStore` 设置页面标题

## Important Notes

- 后端使用 `synchronize: true`（仅开发环境）
- 前端认证仅检查 localStorage token 存在性
- 所有响应统一为 HTTP 200 + 业务码
- 软删除字段: `isDeleted`, `deletedAt`
- SvelteKit 使用 `@sveltejs/adapter-node` 适配器（SSR 支持）
- Axios 已配置为 bundle 模式以支持 SSR

## Recent Architecture Improvements

以下是近期的重要架构改进（按时间倒序）：

1. **删除管理后台重复标题** - 使用 `AdminPage` 组件统一管理标题，移除各页面中的重复标题代码
2. **集中管理管理后台页面标题** - 引入 `adminPageStore` 统一管理页面标题和副标题
3. **提取复用组件** - 创建 `AdminPage` 和 `AdminTable` 组件，减少各管理页面的重复代码
4. **PostForm 组件化** - 将文章创建/编辑表单提取为独立组件，支持 create/edit 两种模式
5. **图标系统统一** - 所有图标使用 `@lucide/svelte`，移除所有内联 SVG 和 emoji
6. **Badge 组件引入** - 统一状态和类型的显示样式
7. **SSR 配置优化** - 切换到 node 适配器，配置 Axios bundling
8. **响应式布局改进** - HomeLayout 组件支持移动端响应式布局
