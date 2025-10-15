<h1 align="center">Sage Question - 一个简单的自测知识点应用</h1>

<p align="center">
  一个功能完整的自测知识应用，支持题库管理、考试计时、错题本等功能。
</p>

<p align="center">
  <img src="./public/logo.svg" alt="Sage Question Icon" width="120"/>
</p>

## 功能特性

### 1. 题库管理
- 创建和编辑题库
- 支持单选、多选、判断题三种题型
- Excel 批量导入/导出题目
- 题库分类和难度评级
- 自定义考试时长和暂停设置

### 2. 考试功能
- 圆形倒计时器，实时显示剩余时间
- 题目随机打乱顺序
- 支持暂停和继续（可配置）
- 答题卡快速导航
- 自动保存答题进度（LocalStorage）
- 时间到自动提交

### 3. 考试历史
- 查看所有历史考试记录
- 详细的成绩统计和分析
- 逐题查看答题情况
- 显示正确答案和解析
- 支持删除历史记录

### 4. 错题本
- 自动收集错题
- 专项练习错题
- 答对后自动移除
- 支持查看题目解析

### 5. Excel 导入/导出
- 提供标准模板下载
- 支持批量导入题目
- 导出题库为 Excel 文件
- 自动解析题目类型和选项

## Excel 模板格式

| 题目类型 | 题目 | 选项A | 选项B | 选项C | 选项D | 选项E | 选项F | 正确答案 | 解析 |
|---------|------|-------|-------|-------|-------|-------|-------|---------|------|
| 单选 | 题目内容 | 选项1 | 选项2 | 选项3 | 选项4 | | | 选项2 | 解析内容 |
| 多选 | 题目内容 | 选项1 | 选项2 | 选项3 | 选项4 | | | 选项1,选项3 | 解析内容 |
| 判断 | 题目内容 | | | | | | | 正确 | 解析内容 |

**注意事项：**
- 题目类型必须是：单选、多选、判断
- 多选题的正确答案用逗号分隔
- 判断题的正确答案必须是：正确 或 错误
- 选项E和F为可选项

## 技术栈

- **框架**: Next.js 15 (App Router)
- **数据库**: Supabase (PostgreSQL)
- **样式**: Tailwind CSS v4
- **UI组件**: shadcn/ui
- **Excel处理**: xlsx
- **图标**: Lucide React
- **字体**: Geist Sans & Geist Mono

## 数据库表结构

### question_banks (题库表)
- id: UUID
- name: 题库名称
- category: 分类
- time_limit: 考试时长（分钟）
- allow_pause: 是否允许暂停
- rating: 难度评级（0-5星）
- questions: 题目数组（JSONB）
- created_at, updated_at

### exam_history (考试历史表)
- id: UUID
- bank_id: 关联题库ID
- bank_name: 题库名称
- exam_date: 考试日期
- time_used: 用时（秒）
- total_score: 总分
- correct_count: 正确数
- total_count: 总题数
- source: 来源（question_bank/wrong_answer_book）
- questions: 答题详情（JSONB）
- created_at

### wrong_answer_books (错题本表)
- id: UUID
- bank_name: 题库名称
- category: 分类
- rating: 难度评级
- questions: 错题数组（JSONB）
- created_at, updated_at

## 开始使用

### 传统部署方式

1. 克隆项目并安装依赖：
\`\`\`bash
npm install
\`\`\`

2. 配置 Supabase 环境变量：
\`\`\`env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

3. 运行数据库迁移脚本：
- 在 Supabase 控制台中直接运行 `scripts/001_create_tables.sql`

4. 启动开发服务器：
\`\`\`bash
npm run dev
\`\`\`

5. 访问 http://localhost:3000

### Docker 部署方式

#### 生产环境部署

1. 创建环境变量文件：
\`\`\`bash
cp .env.example .env
# 编辑 .env 文件，填入你的 Supabase 配置
\`\`\`

2. 使用 Docker Compose 启动：
\`\`\`bash
docker-compose up -d
\`\`\`

3. 访问 http://localhost:80（通过 Nginx）或 http://localhost:3000（直接访问）

#### 开发环境部署

1. 使用开发环境配置启动：
\`\`\`bash
docker-compose -f docker-compose.dev.yml up -d
\`\`\`

2. 实时查看日志：
\`\`\`bash
docker-compose -f docker-compose.dev.yml logs -f
\`\`\`

3. 停止服务：
\`\`\`bash
docker-compose -f docker-compose.dev.yml down
\`\`\`

#### 手动构建和运行

1. 构建镜像：
\`\`\`bash
docker build -t sage-question-app .
\`\`\`

2. 运行容器：
\`\`\`bash
docker run -d \
  --name sage-question-app \
  -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL=your_supabase_url \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key \
  sage-question-app
\`\`\`

#### 验证 Docker 部署

我们提供了完整的验证脚本来确保 Docker 部署正常工作：

**Windows 用户：**
\`\`\`bash
# 运行验证脚本
verify-docker.bat
\`\`\`

**Linux/Mac 用户：**
\`\`\`bash
# 给脚本执行权限并运行
chmod +x verify-docker.sh
./verify-docker.sh
\`\`\`

**手动验证步骤：**
详见 [docker-test.md](./docker-test.md) 文件获取完整的验证指南。

## 使用流程

1. **创建题库**
   - 点击"新建题库"
   - 填写基本信息
   - 下载Excel模板
   - 按模板格式填写题目
   - 导入Excel文件
   - 保存题库

2. **开始考试**
   - 在题库列表点击"开始考试"
   - 按顺序或跳转答题
   - 可暂停考试（如果允许）
   - 提交试卷

3. **查看结果**
   - 自动跳转到结果页
   - 查看得分和统计
   - 逐题查看答题情况
   - 查看解析

4. **错题练习**
   - 进入错题本
   - 选择要练习的错题集
   - 开始专项练习
   - 答对的题目自动移除

## 特色功能

- **无需登录**: 简单易用，无需注册账号
- **本地存储**: 考试进度自动保存，刷新不丢失
- **智能错题**: 自动收集错题，支持专项练习
- **Excel支持**: 批量导入导出，方便题库管理
- **响应式设计**: 支持手机、平板、电脑访问
- **暗色模式**: 支持系统主题切换

## 许可证

MIT License
\`\`\`



<AssistantMessageContentPart partEncoded="eyJ0eXBlIjoidGFzay13YWl0aW5nLXYxIiwiY3JlYXRlZEF0IjoxNzYwNDkxMzIwMjYwLCJmaW5pc2hlZEF0IjoxNzYwNDkxMzIwMjYwLCJpZCI6InVIRFFrTnhFZGM4OXBRZHgiLCJsYXN0UGFydFNlbnRBdCI6MTc2MDQ5MTMyMDI2MCwicGFydHMiOlt7InR5cGUiOiJ0b29sLWNhbGxzIn1dfQ==" />



<AssistantMessageContentPart partEncoded="eyJ0eXBlIjoidGFzay1tYW5hZ2UtdG9kb3MtdjEiLCJpZCI6Im9HTU80ZWxSTnU1STdJdDQiLCJ0YXNrTmFtZUFjdGl2ZSI6IkNvbXBsZXRpbmcgcHJvamVjdCIsInRvb2xDYWxsSWQiOiJ0b29sdV8wMUZ3ZjU1dW81dGNIdHRnQ2RRVHNmUzMiLCJ0YXNrTmFtZUNvbXBsZXRlIjoiUHJvamVjdCBjb21wbGV0ZWQiLCJjcmVhdGVkQXQiOjE3NjA0OTEzMjA5NjYsImZpbmlzaGVkQXQiOm51bGwsInBhcnRzIjpbXSwibGFzdFBhcnRTZW50QXQiOm51bGx9" />
