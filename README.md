# IoT Hub - 智能物联网监控平台

一个基于 Next.js 的现代化物联网设备监控和管理平台，采用 Monorepo 架构构建。

## 📋 项目概述

IoT Hub 是一个功能强大的物联网设备监控平台，提供实时数据可视化、3D 设备网络展示、设备状态监控等功能。项目采用 Monorepo 架构，使用 pnpm workspaces 管理多个包和应用。

## 🏗️ 项目结构

本项目采用 Monorepo 架构，使用 pnpm workspaces 进行包管理：

```
IoT-project/
├── apps/
│   └── web/                    # Next.js 主应用
│       ├── app/                 # Next.js App Router
│       ├── components/          # 业务组件
│       ├── public/              # 静态资源
│       └── package.json
│
├── packages/
│   ├── ui/                      # UI 组件库 (@iot/ui)
│   │   ├── src/
│   │   │   ├── badge.tsx
│   │   │   ├── card.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── charts/                  # 图表组件库 (@iot/charts)
│   │   ├── src/
│   │   │   ├── device-gauge.tsx
│   │   │   ├── device-status-pie.tsx
│   │   │   ├── realtime-chart.tsx
│   │   │   ├── temperature-heatmap.tsx
│   │   │   ├── traffic-bar-chart.tsx
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   ├── utils/                   # 工具函数库 (@iot/utils)
│   │   ├── src/
│   │   │   └── index.ts
│   │   └── package.json
│   │
│   └── config/                  # 共享配置
│       ├── tsconfig.base.json
│       └── package.json
│
├── pnpm-workspace.yaml          # pnpm workspace 配置
├── package.json                 # 根 package.json
└── tsconfig.json                # 根 TypeScript 配置
```

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS 4
- **包管理**: pnpm workspaces
- **3D 渲染**: React Three Fiber, Three.js
- **图表**: ECharts
- **UI 组件**: Radix UI
- **状态管理**: React Hooks

## 📦 包说明

### @iot/ui

UI 组件库，包含基于 Radix UI 的可复用组件：

- Badge
- Card
- Tabs

### @iot/charts

图表组件库，基于 ECharts 构建：

- DeviceGauge - 设备仪表盘
- DeviceStatusPie - 设备状态饼图
- RealtimeChart - 实时数据图表
- TemperatureHeatmap - 温度热力图
- TrafficBarChart - 流量柱状图

### @iot/utils

工具函数库：

- `cn()` - 类名合并工具（基于 clsx 和 tailwind-merge）

## 🚀 快速开始

### 前置要求

- Node.js 18+
- pnpm 8+

### 安装依赖

```bash
pnpm install
```

### 开发

启动开发服务器：

```bash
pnpm dev
```

应用将在 [http://localhost:3000](http://localhost:3000) 运行。

### 构建

构建生产版本：

```bash
pnpm build
```

### 启动生产服务器

```bash
pnpm start
```

### 代码检查

```bash
pnpm lint
```

## 📝 可用脚本

在根目录下，可以使用以下脚本：

- `pnpm dev` - 启动开发服务器
- `pnpm build` - 构建生产版本
- `pnpm start` - 启动生产服务器
- `pnpm lint` - 运行代码检查

## 🔧 开发指南

### 添加新包

1. 在 `packages/` 目录下创建新包目录
2. 创建 `package.json`，设置包名（如 `@iot/your-package`）
3. 在 `pnpm-workspace.yaml` 中已自动包含所有 `packages/*`
4. 在其他包或应用中使用 `workspace:*` 协议引用

### 在应用中使用包

```typescript
// 从 @iot/ui 导入组件
import { Card, Badge } from "@iot/ui";

// 从 @iot/charts 导入图表
import { DeviceGauge } from "@iot/charts";

// 从 @iot/utils 导入工具函数
import { cn } from "@iot/utils";
```

### TypeScript 项目引用

项目使用 TypeScript 项目引用（Project References）来管理类型检查。每个包都有自己的 `tsconfig.json`，并引用基础配置和依赖包。

## 🌐 部署

项目已配置为自动部署到 Vercel。由于项目采用 monorepo 结构，需要在 Vercel 项目设置中配置根目录。

### 首次部署配置

**重要**: 由于 Next.js 应用位于 `apps/web` 目录，需要在 Vercel 控制台设置根目录：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择项目，进入 **Settings** → **General**
3. 找到 **Root Directory**，设置为 `apps/web`
4. 保存设置

### 自动部署

配置完成后，每次推送到主分支都会自动触发部署。

### 手动部署

1. 确保所有更改已提交
2. 推送到 GitHub
3. Vercel 会自动检测并部署

### 详细部署说明

查看 [部署文档](docs/DEPLOYMENT.md) 了解完整的部署指南和常见问题解决方案。

## 📄 许可证

查看 [LICENSE](LICENSE) 文件了解详情。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题或建议，请通过 Issue 联系我们。
