# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个基于 Next.js 15 的智能自测知识应用，名为 Sage Question。应用支持题库管理、考试计时、错题本等功能，使用 Supabase 作为后端数据库。

## 常用开发命令

```bash
# 本地开发
pnpm install
pnpm dev
pnpm build
pnpm start
pnpm lint

# Docker 开发环境
docker-compose -f docker-compose.dev.yml up -d
docker-compose -f docker-compose.dev.yml logs -f
docker-compose -f docker-compose.dev.yml down

# Docker 生产环境
docker-compose up -d
docker-compose logs -f
docker-compose down

# 手动 Docker 构建
docker build -t sage-question-app .
docker build -f Dockerfile.dev -t sage-question-app:dev .
```

## 项目架构

### 技术栈
- **框架**: Next.js 15 (App Router)
- **数据库**: Supabase (PostgreSQL)
- **样式**: Tailwind CSS v4
- **UI组件**: shadcn/ui (基于 Radix UI)
- **Excel处理**: xlsx 库
- **状态管理**: React Hook Form + Zod
- **主题**: next-themes

### 目录结构
```
app/                    # Next.js App Router 页面
├── page.tsx           # 首页
├── layout.tsx         # 根布局
├── question-banks/    # 题库管理页面
├── taking/[examId]/   # 考试页面
├── results/[examId]/  # 结果页面
├── exam-history/      # 考试历史页面
└── wrong-answers/     # 错题本页面

components/            # React 组件
├── ui/               # shadcn/ui 基础组件
├── exam-interface.tsx    # 考试界面组件
├── question-bank-*.tsx   # 题库相关组件
├── exam-*.tsx           # 考试相关组件
└── wrong-answer-*.tsx    # 错题本组件

lib/                   # 工具库
├── supabase/         # Supabase 客户端配置
│   ├── client.ts     # 浏览器端客户端
│   └── server.ts     # 服务端客户端
├── utils.ts          # 通用工具函数
└── types.ts          # TypeScript 类型定义

scripts/              # 数据库脚本
└── 001_create_tables.sql  # 数据库表结构

Docker 相关文件:
├── Dockerfile         # 生产环境 Docker 镜像
├── Dockerfile.dev     # 开发环境 Docker 镜像
├── docker-compose.yml # 生产环境 Docker Compose 配置
├── docker-compose.dev.yml # 开发环境 Docker Compose 配置
├── nginx.conf         # Nginx 配置文件
└── .dockerignore      # Docker 构建忽略文件
```

### 数据库架构

应用使用三个主要数据表：

1. **question_banks** - 题库表
   - 存储题库基本信息和题目（JSONB 格式）
   - 支持分类、难度评级、时间限制等配置

2. **exam_history** - 考试历史表
   - 记录每次考试的详细信息
   - 包含答题详情、成绩、用时等

3. **wrong_answer_books** - 错题本表
   - 自动收集用户的错题
   - 支持专项练习

### 核心功能组件

1. **题库管理** (`components/question-bank-*.tsx`)
   - 支持单选、多选、判断题三种题型
   - Excel 批量导入/导出功能
   - 题库编辑和删除

2. **考试系统** (`components/exam-interface.tsx`)
   - 圆形倒计时器 (`components/circular-timer.tsx`)
   - 答题进度本地存储
   - 支持暂停/继续功能

3. **错题本** (`components/wrong-answer-*.tsx`)
   - 自动收集错题
   - 专项练习模式
   - 答对后自动移除

## Supabase 配置

项目需要配置以下环境变量：
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

数据库表已禁用 RLS（行级安全），因为应用不需要用户认证。

## Excel 导入/导出格式

应用支持标准的 Excel 模板格式：
- 题目类型：单选、多选、判断
- 多选题正确答案用逗号分隔
- 判断题答案必须是"正确"或"错误"

## Docker 部署

### 镜像构建
- **生产镜像**：使用多阶段构建，基于 Node.js 22 Alpine，启用 standalone 输出模式
- **开发镜像**：支持热重载，挂载源代码卷

### 容器编排
- **生产环境**：包含应用服务 + Nginx 反向代理，支持健康检查
- **开发环境**：仅应用服务，支持实时开发和调试

### 端口配置
- 应用端口：3000
- Nginx 端口：80, 443

### 环境变量
所有 Supabase 相关环境变量都通过 Docker 环境变量配置，支持 .env 文件

## 开发注意事项

1. **构建配置**：Next.js 配置中忽略了 TypeScript 和 ESLint 的构建错误，适合快速原型开发
2. **路径别名**：使用 `@/*` 指向项目根目录
3. **样式系统**：使用 Tailwind CSS v4，支持暗色模式
4. **字体**：主要使用 Exo_2 字体，同时加载 Geist 字体家族
5. **无认证设计**：应用无需登录，所有数据存储在公共数据库中
6. **Docker 优化**：使用 standalone 输出模式减少镜像大小，生产环境启用 Gzip 压缩