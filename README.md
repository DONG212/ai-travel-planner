# Web 版 AI 旅行规划师 (AI Travel Planner)

## 概述
- 目标：简化旅行规划，通过 AI 自动生成行程与预算，并提供语音输入和地图展示。
- 核心功能：
  - 智能行程规划：支持语音或文字输入，生成交通、住宿、景点、餐饮建议。
  - 费用预算与管理：对行程进行预算估计与记录（初版为估算与展示）。
  - 用户管理与数据存储：预留 Supabase 接入点；初版本地存储。
  - 云端同步：可后续扩展（Supabase / Firebase）。
  - 地图：可使用高德(AMap)或百度 SDK，初版集成 AMap 动态加载。
  - 语音识别：初版使用 Web Speech API；可扩展科大讯飞等。

## 注意事项
- 切记不要将任何 API key 写在代码中，尤其是公开仓库。
- 提供设置页用于输入 LLM Key 与地图 Key；后端从环境变量或请求头读取 Key。
- 如果你使用非阿里云百炼的 Key，请在 `README` 标注，并保证 3 个月内可用（作业要求）。为避免泄露，建议仅在私密渠道提供。

## 开发与运行

### 1) 安装依赖
在 `client` 与 `server` 两个目录分别安装依赖：
```bash
cd client && npm install
```

```bash
cd server && npm install
```

### 2) 开发模式运行
先启动后端（默认 8080）：
```bash
npm run dev --prefix server
```

再启动前端（默认 5173）：
```bash
npm run dev --prefix client
```

打开浏览器访问 `http://localhost:5173/`。

### 3) 配置 API Key
- 前端：进入 “设置” 页，填写：
  - LLM API Key（例如 OpenAI 或阿里云百炼）
  - AMap Key（用于地图加载）
- 后端：
  - 可在 `server/.env` 设置 `LLM_MODE=OPENAI|DASHSCOPE|MOCK` 和对应 Key；
  - 或在请求头设置 `x-llm-key`（单次调用临时使用）。

### 4) 生产构建与 Docker
构建 Docker 镜像并运行：
```bash
docker build -t ai-travel-planner:latest .
```

```bash
docker run -p 8080:8080 -e LLM_MODE=MOCK ai-travel-planner:latest
```

访问 `http://localhost:8080/`。

### 5) 提交要求
- GitHub 仓库：请将本项目推送至你的 GitHub。
- 提交一个 PDF：包含仓库地址与 README 文档（可将 README 转为 PDF）。
- Docker 镜像：本项目已提供 Dockerfile；你可通过 GitHub Actions 推送到阿里云镜像仓库（需填充密钥）。

## 环境变量（server/.env）
- `LLM_MODE`: `MOCK`（默认）、`OPENAI` 或 `DASHSCOPE`
- `LLM_API_KEY`: LLM 的 API Key（OPENAI 或 DASHSCOPE）
- `PORT`: 服务端端口（默认 8080）

## 接口
- `POST /api/plan`：输入目的地、日期、预算、人数、偏好，返回行程规划。
- `POST /api/budget`：根据行程预估预算。

## 技术栈
- 前端：React + Vite + TypeScript
- 语音：Web Speech API（可扩展科大讯飞）
- 地图：AMap Web JS 动态加载
- 后端：Express + TypeScript
- LLM：可选 OpenAI / 阿里云百炼（DashScope）；默认 MOCK
- 部署：Docker（多阶段构建）
- CI：GitHub Actions（示例工作流）

## Supabase 设置（登录与云端行程存储）
1) 在 Supabase 创建项目，获取 `Project URL` 与 `anon key`，在前端“设置”页填写并保存。
2) 在 Supabase SQL Editor 执行：
```sql
create table if not exists plans (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null,
  created_at timestamp with time zone default now(),
  destination text,
  days int,
  budget int,
  people int,
  preferences text[],
  plan jsonb
);
alter table plans enable row level security;
create policy "own rows" on plans
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
```
3) 在前端“登录”页进行邮箱注册/登录；在“我的计划”页查看与管理云端计划。
## 在哪里执行 npm install（Windows）
- 打开终端（PowerShell 或 IDE 集成终端），进入项目目录 `d:\javacode\name1`。
- 分别在 client 与 server 执行安装：
```bash
cd d:\javacode\name1\client && npm install
```
```bash
cd d:\javacode\name1\server && npm install
```
- 或在同一终端使用前缀：
```bash
npm install --prefix d:\javacode\name1\client
```
```bash
npm install --prefix d:\javacode\name1\server
```
- 可在任意 IDE 的“终端”面板执行：如 IntelliJ IDEA（你的项目已有 `.idea` 目录）、WebStorm、VS Code；不在“页面”中执行，而是在终端命令行中执行。