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
npm run dev              # 开发模式（热重载）
npm run start:prod       # 生产模式
npm run test             # 单元测试
npm run test:e2e         # E2E 测试
npm run lint             # 代码检查
```

### Client (SvelteKit)
```bash
npm run dev              # 开发服务器
npm run build            # 生产构建
npm run check            # TypeScript 检查
npm run lint             # ESLint + Prettier
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

**数据模型关系**:
```
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

**技术栈**: SvelteKit 5 + Svelte 5 Runes + Tailwind CSS + Tiptap

**路由结构** (`src/routes/`):
```
/                      # 首页（文章列表）
/posts/[id]            # 文章详情
/auth/login            # 登录
/admin/                # 管理后台（需认证）
  /posts/              # 文章管理
  /categories/         # 分类管理
  /tags/               # 标签管理
  /images/             # 图片管理
  /comments/           # 评论管理
```

**状态管理** (`src/lib/stores/`):
- `auth.ts` - 认证状态（localStorage 同步）
- `toast.ts` - 全局消息提示

**API 层** (`src/lib/api/`):
- Axios 实例 + 请求/响应拦截器
- 自动添加 Bearer token
- 统一错误处理

**组件库** (`src/lib/components/`):
- `ui/` - 通用 UI 组件（Button, Input, Form）
- `admin/` - 管理后台组件（Sidebar, Header）
- `home/` - 前台组件（PostCard）
- `layout/` - 布局组件（HomeLayout）

**主题系统**: 仅在 `/lib/components/` 中使用，页面使用硬编码 Tailwind 类

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

### 新增后端模块
1. `nest generate resource [name]`
2. 在 `app.module.ts` 注册实体
3. 使用 `@Public()` 装饰器标记公开接口

### 新增前端页面
1. 创建 `+page.svelte`
2. 需要认证时添加 `+page.ts` 路由守卫
3. 使用 toast 进行用户反馈

## Important Notes

- 后端使用 `synchronize: true`（仅开发环境）
- 前端认证仅检查 localStorage token 存在性
- 所有响应统一为 HTTP 200 + 业务码
- 软删除字段: `isDeleted`, `deletedAt`
