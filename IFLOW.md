# AI待办事项应用 - 项目指南

## 项目概述

这是一个基于Expo框架开发的跨平台待办事项应用，具有AI辅助功能。该应用支持Android、iOS和Web平台，集成了Supabase作为后端数据库服务，并提供AI功能来帮助用户生成待办事项建议和完整的任务列表。

### 核心功能
1. **待办事项管理**：添加、编辑、删除、标记完成待办事项
2. **AI辅助功能**：根据用户描述生成待办事项建议和任务列表
3. **实时同步**：通过Supabase实现实时数据同步
4. **多平台支持**：支持Android、iOS和Web平台
5. **响应式设计**：适配不同设备和屏幕尺寸
6. **AI生成标记**：区分AI生成和用户创建的待办事项
7. **智能建议**：基于输入内容的智能待办事项推荐
8. **批量操作**：支持批量添加AI生成的建议和列表

### 技术栈
- **前端框架**：React Native + Expo Router (v6.0.21)
- **状态管理**：React Context + useReducer
- **数据库**：Supabase (PostgreSQL) v2.89.0
- **UI组件**：React Native内置组件
- **包管理器**：pnpm v10.4.1
- **类型检查**：TypeScript
- **构建工具**：Expo, Metro
- **部署**：EAS (Expo Application Services)

## 项目结构

```
ai-todo-list-apps/
├── app/                    # Expo路由页面
│   ├── _layout.tsx         # 应用根布局和导航配置
│   ├── +html.tsx           # HTML模板
│   ├── +not-found.tsx      # 404页面
│   ├── modal.tsx           # 模态框页面
│   └── (tabs)/             # 底部标签页
│       ├── _layout.tsx     # 标签页布局
│       ├── index.tsx       # 首页（待办事项列表）
│       └── two.tsx         # 第二个标签页
├── components/             # 可复用的UI组件
│   ├── AIService.tsx       # AI服务逻辑（模拟实现）
│   ├── AISuggestions.tsx   # AI建议组件
│   ├── EditScreenInfo.tsx  # 编辑屏幕信息组件
│   ├── ExternalLink.tsx    # 外部链接组件
│   ├── StyledText.tsx      # 样式化文本组件
│   ├── Themed.tsx          # 主题相关组件
│   ├── TodoContext.tsx     # 待办事项状态管理
│   ├── TodoList.tsx        # 待办事项列表组件
│   ├── useClientOnlyValue.ts # 客户端专用值Hook
│   ├── useClientOnlyValue.web.ts # Web平台客户端专用值Hook
│   ├── useColorScheme.ts   # 颜色方案Hook
│   ├── useColorScheme.web.ts # Web平台颜色方案Hook
│   └── __tests__/          # 组件测试
├── constants/              # 常量定义
│   └── Colors.ts           # 颜色常量
├── lib/                    # 库文件
│   └── supabase.ts         # Supabase客户端配置
├── assets/                 # 静态资源
│   ├── fonts/              # 字体文件
│   └── images/             # 图片资源
├── supabase/               # Supabase配置
│   ├── migrations/         # 数据库迁移文件
│   ├── config.toml         # Supabase配置
│   └── seed.sql            # 数据库种子文件（如果存在）
├── .expo/                  # Expo开发服务器文件
├── .vscode/                # VS Code配置
├── .easignore             # EAS构建忽略文件
├── .env.example           # 环境变量示例
├── .gitignore             # Git忽略文件
├── .npmrc                 # npm配置
├── app.json               # Expo应用配置
├── eas.json               # EAS构建配置
├── Makefile               # 构建和部署脚本
├── metro.config.js        # Metro bundler配置
├── package.json           # 项目配置
├── pnpm-lock.yaml         # pnpm锁定文件
├── tsconfig.json          # TypeScript配置
└── IFLOW.md               # 项目指南
```

## 核心功能实现

### 1. 待办事项状态管理 (TodoContext.tsx)
- 使用React的useReducer Hook管理待办事项状态
- 与Supabase数据库实时同步
- 支持添加、编辑、删除、切换完成状态、清除已完成任务等操作
- 实现实时订阅功能，其他客户端的更改会同步更新
- 包含错误处理和加载状态管理
- 使用TypeScript接口定义类型安全的数据结构
- 支持离线优先的数据架构
- 提供自定义Hook useTodoContext供组件使用

### 2. AI功能实现 (AIService.tsx)
- 模拟AI服务，根据用户输入生成待办事项建议
- 提供两种AI功能：生成建议和生成完整待办事项列表
- 根据输入关键词智能匹配相关建议
- 支持工作、健康、学习、个人生活等多个领域的建议
- 包含加载状态和错误处理
- 提供自定义Hook useAIService供组件使用

### 3. 数据库设计 (Supabase)
```sql
-- todos 表结构
CREATE TABLE IF NOT EXISTS todos (
  id TEXT PRIMARY KEY,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ai_generated BOOLEAN DEFAULT FALSE
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_todos_completed ON todos (completed);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON todos (created_at);
```

### 4. AI建议组件 (AISuggestions.tsx)
- 提供智能输入框，用户可描述目标或任务
- 支持两种AI模式：获取建议和生成完整列表
- 提供模态框展示AI生成的建议
- 支持批量添加所有建议到待办列表
- 标记AI生成的待办事项，便于识别

## 构建和运行

### 开发环境设置
1. 安装依赖：
```bash
pnpm install
```

2. 配置环境变量：
```bash
cp .env.example .env
# 编辑 .env 文件，添加Supabase配置
```

3. 启动开发服务器：
```bash
# Web平台
npm run web

# Android平台
npm run android

# iOS平台
npm run ios

# 开发客户端模式
npm run dev

# 通用开发模式
npm run start
```

### 构建命令
```bash
# Web平台构建
npm run build:web

# Android应用构建
npm run build:android

# iOS应用构建
npm run build:ios

# 预览构建
npm run build:preview

# 清理并重新安装依赖
npm run clean

# 预构建（清理缓存）
npm run prebuild
```

### 测试命令
```bash
# 运行测试
npm run test

# 监视模式运行测试
npm run test:watch

# 类型检查
npm run lint
```

## 部署

### EAS构建配置 (eas.json)
项目配置了多种构建配置：
- `development`: 开发客户端构建
- `preview`: 预览构建（内部分发）
- `preview-production`: 预览生产构建
- `production`: 生产构建（应用商店分发）

### 部署命令
```bash
# 使用Makefile进行便捷部署
make push MSG="更新说明"        # 全栈同步发布
make push-web MSG="更新说明"    # 仅Web端发布
make push-app MSG="更新说明"    # 仅App端热更新
make checkout                  # 同步云端Issue到本地工作区
make add TITLE="需求标题"      # 创建/同步需求契约
make commit ID=n               # 驱动AI代理完成指定ID任务
```

### EAS部署
```bash
# 提交构建到EAS
eas build --platform android     # Android构建
eas build --platform ios         # iOS构建
eas update --branch main         # 热更新发布
```

## 开发约定

### 代码规范
- 使用TypeScript进行类型安全编程
- 遵循React Hooks最佳实践
- 使用Expo推荐的文件结构和约定
- 组件使用React.memo进行性能优化
- 使用路径别名（@/*）导入模块
- 遵循TypeScript严格模式
- 使用可访问性标签提升用户体验

### 项目配置
- **Expo SDK**: 54.0.30
- **React Native**: 0.81.5
- **React**: 19.1.0
- **TypeScript**: 5.9.3
- 支持typedRoutes实验性功能

### 应用配置 (app.json)
- 应用名称: "AI Todo List"
- 支持平板电脑（iOS）
- 包含图标、启动画面等资源配置
- 配置了Android和iOS平台特定设置
- 集成了expo-router, expo-updates, expo-build-properties等插件

## Makefile 自动化工作流

项目包含一个完整的自动化工作流，支持立项-实现-同步-发布的闭环：

```makefile
# 本地 AI Agent 自动化工作流 (Git-Style):
#   make add TITLE='xxx'      - [意图立项] 创建/同步需求契约
#   make commit ID=n          - [代理实现] 驱动 AI 自动完成指定 ID 任务
#   make checkout             - [状态同步] 将云端最新 Issue 检出到本地工作区
#   make push MSG='xxx'       - [全栈分发] 同步发布 Web 与 App
#   make push-web MSG='xxx'   - [独立分发] 仅执行 Web 部署
#   make push-app MSG='xxx'   - [独立分发] 仅执行 App 热更新
```

## 特殊功能说明

### AI待办事项生成
AI功能基于关键词匹配算法，通过分析用户输入的内容来生成相关的待办事项建议。该功能目前为模拟实现，可以根据需要替换为真正的AI服务。

### 实时同步
应用通过Supabase的实时功能实现在不同设备间的即时同步。当一个设备上的待办事项发生变化时，所有连接的设备都会收到更新。

### 多平台适配
应用使用Expo Router进行页面导航，确保在Android、iOS和Web平台上的良好体验。

### 状态管理最佳实践
- 使用useCallback优化函数引用
- 实现错误处理和加载状态
- 通过context提供全局状态
- 支持离线优先的数据架构

### UI/UX特性
- 支持深色模式
- 响应式设计
- 无障碍访问支持
- 用户友好的交互反馈
- AI生成内容的视觉区分标记

## ⚖️ 维护契约 (Maintenance Contract)

为确保全栈多端交付的一致性与稳定性，所有开发者（包括 AI Agent）必须遵守：
- **物理验证**：在执行 `make patch` 或任何发布指令前，必须先在本地成功执行 `npx expo prebuild --clean`，确保原生依赖（Autolinking）无冲突。
- **锁文件同步**：任何依赖变更后，必须确保 `pnpm-lock.yaml` 已更新并包含在提交中，严禁在云端构建时产生锁文件偏移。
- **环境隔离**：生产环境变量必须严格通过 [Expo Dashboard](https://expo.dev) 和 [Vercel Dashboard](https://vercel.com) 进行配置，严禁将敏感 Key 硬编码至代码库。
- **Issue跟踪**：所有功能开发必须通过 `make add` 创建Issue进行跟踪，通过 `make commit ID=n` 执行开发。同时，所有交付行为（如执行 push）必须产生明确的物理结果标识（如 URL 链接或 Success 关键字）。
- **AI集成**：AI代理在执行任务时必须读取IFLOW.md的契约协议并严格遵循。