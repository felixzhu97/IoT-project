# 整洁架构规则 (Clean Architecture Rules)

## 概述

本项目遵循整洁架构原则，采用四层架构设计：**domain（领域层）**、**application（应用层）**、**infrastructure（基础设施层）**、**presentation（展示层）**，确保代码的可维护性、可测试性和独立性。

## 核心原则

### 1. 依赖规则 (Dependency Rule)

- **依赖必须向内指向**：外层可以依赖内层，但内层不能依赖外层
- **依赖方向**：presentation → application → domain
- **基础设施层**：实现 domain 和 application 定义的接口，不直接依赖其他层
- **禁止反向依赖**：内层代码不能导入外层代码

### 2. 独立性原则

- **框架独立性**：业务逻辑不依赖于 Next.js、React 等框架
- **UI 独立性**：业务逻辑不依赖于特定的 UI 组件库
- **数据库独立性**：业务逻辑不依赖于特定的数据库或数据源
- **外部服务独立性**：业务逻辑不依赖于外部 API 的具体实现

### 3. 可测试性

- 业务逻辑应该可以在没有框架、UI 或数据库的情况下进行测试
- 使用依赖注入和接口抽象来实现可测试性

## 依赖方向图

```
┌─────────────────────────────────────┐
│  展示层 (Presentation Layer)        │
│  - Next.js App Router               │
│  - React Components                 │
│  - API Routes                       │
└──────────────┬──────────────────────┘
               │ 可以依赖
               ▼
┌─────────────────────────────────────┐
│  应用层 (Application Layer)           │
│  - Use Cases                        │
│  - Application Services              │
│  - DTOs                              │
└──────────────┬──────────────────────┘
               │ 可以依赖
               ▼
┌─────────────────────────────────────┐
│  领域层 (Domain Layer)                │
│  - Entities                         │
│  - Value Objects                    │
│  - Domain Services                  │
│  - Repository Interfaces             │
└─────────────────────────────────────┘
               ▲
               │ 实现接口
┌──────────────┴──────────────────────┐
│  基础设施层 (Infrastructure Layer)   │
│  - Repository Implementations        │
│  - External API Clients             │
│  - Database Clients                 │
│  - File System                      │
└─────────────────────────────────────┘
```

## 架构层次详解

### 1. Domain Layer（领域层）

**职责**：包含核心业务实体和业务规则

**位置**：

- `apps/web/src/domain/`
- `packages/*/src/domain/` (如果包包含领域逻辑)

**内容**：

- 领域实体（Domain Entities）
- 值对象（Value Objects）
- 领域服务接口（Domain Service Interfaces）
- 仓储接口（Repository Interfaces）
- 业务规则（Business Rules）

**特点**：

- 最内层，不依赖任何外部框架
- 包含最稳定、最核心的业务逻辑
- 可以被所有其他层使用
- 应该是最容易测试的代码

**允许的依赖**：

- ✅ 其他领域实体
- ✅ 工具函数 (`@iot/utils`)
- ✅ TypeScript 标准库
- ✅ 纯函数库（如 lodash、date-fns）

**禁止的依赖**：

- ❌ React、Next.js 等框架
- ❌ UI 组件库
- ❌ 数据库客户端
- ❌ HTTP 客户端
- ❌ application、infrastructure、presentation 层

**示例结构**：

```
src/domain/
├── entities/
│   ├── device.entity.ts      # 设备实体
│   ├── metrics.entity.ts     # 指标实体
│   └── alert.entity.ts        # 告警实体
├── value-objects/
│   ├── device-id.vo.ts
│   └── timestamp.vo.ts
├── repositories/
│   ├── device.repository.ts  # 仓储接口
│   └── metrics.repository.ts
└── services/
    └── device.service.ts      # 领域服务接口
```

**示例代码**：

```typescript
// src/domain/entities/device.entity.ts
export enum DeviceStatus {
  ONLINE = "online",
  OFFLINE = "offline",
  ERROR = "error",
}

export class Device {
  constructor(
    public readonly id: string,
    public readonly name: string,
    private status: DeviceStatus,
    private lastSeen: Date
  ) {}

  isOnline(): boolean {
    return this.status === DeviceStatus.ONLINE;
  }

  updateLastSeen(timestamp: Date): void {
    this.lastSeen = timestamp;
  }

  markOffline(): void {
    this.status = DeviceStatus.OFFLINE;
  }
}

// src/domain/repositories/device.repository.ts
import { Device } from "../entities/device.entity";

export interface DeviceRepository {
  findById(id: string): Promise<Device | null>;
  findAll(): Promise<Device[]>;
  save(device: Device): Promise<void>;
}
```

### 2. Application Layer（应用层）

**职责**：包含应用程序特定的业务规则和工作流程

**位置**：

- `apps/web/src/application/`
- `packages/*/src/application/` (如果包包含应用逻辑)

**内容**：

- 用例类（Use Cases）
- 应用服务（Application Services）
- DTOs（Data Transfer Objects）
- 应用服务接口

**特点**：

- 依赖领域层
- 定义应用的工作流程
- 不依赖框架或 UI
- 通过接口依赖外部服务（接口定义在 domain 层）

**允许的依赖**：

- ✅ 领域层
- ✅ 其他用例
- ✅ 工具函数
- ✅ 领域层定义的接口（不是实现）

**禁止的依赖**：

- ❌ React、Next.js 等框架
- ❌ UI 组件
- ❌ 具体的数据库实现
- ❌ 具体的 API 客户端实现
- ❌ infrastructure、presentation 层

**示例结构**：

```
src/application/
├── use-cases/
│   ├── device/
│   │   ├── get-device-status.use-case.ts
│   │   ├── update-device-status.use-case.ts
│   │   └── list-devices.use-case.ts
│   ├── metrics/
│   │   ├── fetch-device-metrics.use-case.ts
│   │   └── aggregate-metrics.use-case.ts
│   └── alerts/
│       └── create-alert.use-case.ts
└── dtos/
    ├── device.dto.ts
    └── metrics.dto.ts
```

**示例代码**：

```typescript
// src/application/use-cases/device/get-device-status.use-case.ts
import { Device } from "../../../domain/entities/device.entity";
import { DeviceRepository } from "../../../domain/repositories/device.repository";

export class GetDeviceStatusUseCase {
  constructor(private deviceRepository: DeviceRepository) {}

  async execute(deviceId: string): Promise<Device> {
    const device = await this.deviceRepository.findById(deviceId);

    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    return device;
  }
}
```

### 3. Infrastructure Layer（基础设施层）

**职责**：实现数据访问、外部服务集成等技术细节

**位置**：`apps/web/src/infrastructure/`

**内容**：

- **Repositories**：实现 domain 层定义的仓储接口
- **API Clients**：外部 API 客户端实现
- **Database Clients**：数据库客户端封装
- **File System**：文件系统操作
- **Cache**：缓存实现
- **Message Queue**：消息队列客户端

**特点**：

- 实现 domain 和 application 层定义的接口
- 包含所有技术实现细节
- 可以依赖框架和第三方库
- 不依赖 presentation 层

**允许的依赖**：

- ✅ 领域层（仅接口）
- ✅ 应用层（仅接口和 DTOs）
- ✅ 框架库（Next.js、React 等）
- ✅ 数据库客户端（Prisma、MongoDB 等）
- ✅ HTTP 客户端（fetch、axios 等）
- ✅ 工具函数

**禁止的依赖**：

- ❌ presentation 层
- ❌ 直接依赖领域实体（应通过接口）

**示例结构**：

```
src/infrastructure/
├── repositories/
│   ├── device.repository.impl.ts
│   └── metrics.repository.impl.ts
├── api/
│   ├── device-api.client.ts
│   └── metrics-api.client.ts
├── database/
│   └── prisma.client.ts
├── cache/
│   └── redis.client.ts
└── config/
    └── database.config.ts
```

**示例代码**：

```typescript
// src/infrastructure/repositories/device.repository.impl.ts
import { Device } from "../../domain/entities/device.entity";
import { DeviceRepository } from "../../domain/repositories/device.repository";
import { PrismaClient } from "@prisma/client";

export class DeviceRepositoryImpl implements DeviceRepository {
  constructor(private prisma: PrismaClient) {}

  async findById(id: string): Promise<Device | null> {
    const data = await this.prisma.device.findUnique({ where: { id } });
    if (!data) return null;
    return this.toDomain(data);
  }

  async findAll(): Promise<Device[]> {
    const data = await this.prisma.device.findMany();
    return data.map((d) => this.toDomain(d));
  }

  async save(device: Device): Promise<void> {
    await this.prisma.device.upsert({
      where: { id: device.id },
      update: this.toPersistence(device),
      create: this.toPersistence(device),
    });
  }

  private toDomain(data: any): Device {
    // 转换为领域实体
  }

  private toPersistence(device: Device): any {
    // 转换为持久化格式
  }
}
```

### 4. Presentation Layer（展示层）

**职责**：处理用户交互和展示

**位置**：

- `apps/web/app/` (Next.js App Router)
- `apps/web/components/` (React 组件)
- `apps/web/src/presentation/` (可选，用于组织展示逻辑)

**内容**：

- Next.js 路由和页面
- React 组件
- API 路由处理
- 表单验证
- 数据格式化展示

**特点**：

- 最外层，可以依赖所有内层
- 包含框架特定的代码
- 负责用户交互和展示
- 薄层，主要做数据转换和展示

**允许的依赖**：

- ✅ 应用层（Use Cases、DTOs）
- ✅ 领域层（Entities，仅用于展示）
- ✅ 基础设施层（通过依赖注入）
- ✅ 框架库（React、Next.js）
- ✅ UI 组件库

**示例结构**：

```
apps/web/
├── app/                          # Next.js 路由
│   ├── page.tsx
│   ├── layout.tsx
│   └── api/
│       └── devices/
│           └── route.ts
├── components/                    # React 组件
│   ├── iot-dashboard.tsx
│   ├── device-panel.tsx
│   └── charts-panel.tsx
└── src/presentation/             # 展示逻辑（可选）
    ├── controllers/
    │   └── device.controller.ts
    └── mappers/
        └── device.mapper.ts
```

**示例代码**：

```typescript
// apps/web/app/api/devices/[id]/route.ts
import { GetDeviceStatusUseCase } from "@/src/application/use-cases/device/get-device-status.use-case";
import { DeviceRepositoryImpl } from "@/src/infrastructure/repositories/device.repository.impl";
import { PrismaClient } from "@prisma/client";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const prisma = new PrismaClient();
  const deviceRepo = new DeviceRepositoryImpl(prisma);
  const useCase = new GetDeviceStatusUseCase(deviceRepo);

  const device = await useCase.execute(params.id);

  return Response.json({
    id: device.id,
    name: device.name,
    status: device.status,
  });
}
```

## 项目结构示例

```
apps/web/
├── app/                          # Presentation Layer
│   ├── page.tsx
│   └── layout.tsx
├── components/                    # Presentation Layer
│   ├── iot-dashboard.tsx
│   └── device-panel.tsx
├── src/
│   ├── domain/                   # Domain Layer
│   │   ├── entities/
│   │   ├── repositories/
│   │   └── services/
│   ├── application/              # Application Layer
│   │   ├── use-cases/
│   │   └── dtos/
│   ├── infrastructure/            # Infrastructure Layer
│   │   ├── repositories/
│   │   ├── api/
│   │   └── database/
│   └── presentation/              # Presentation Layer (可选)
│       ├── controllers/
│       └── mappers/

packages/
├── ui/                           # UI 组件库
├── charts/                       # 图表组件库
└── utils/                        # 工具层 (可被所有层使用)
```

## Monorepo 包依赖规则

### 包之间的依赖关系

```
apps/web
  └─> packages/ui
  └─> packages/charts
  └─> packages/utils

packages/ui
  └─> packages/utils

packages/charts
  └─> packages/utils

packages/utils
  └─> (无依赖，或仅标准库)
```

### 包依赖规则

#### 1. `@iot/utils` - 工具函数库

- **职责**：提供纯函数和工具类
- **依赖**：无（或仅标准库）
- **可被依赖**：所有其他包和应用
- **特点**：
  - 不包含业务逻辑
  - 不依赖框架
  - 可独立测试

#### 2. `@iot/ui` - UI 组件库

- **职责**：提供可复用的 UI 组件
- **依赖**：`@iot/utils`
- **可被依赖**：`apps/web`, `packages/charts`
- **特点**：
  - 不包含业务逻辑
  - 框架相关（React）
  - 可独立使用

#### 3. `@iot/charts` - 图表组件库

- **职责**：提供图表可视化组件
- **依赖**：`@iot/utils`, `@iot/ui`
- **可被依赖**：`apps/web`
- **特点**：
  - 不包含业务逻辑
  - 框架相关（React）
  - 可独立使用

#### 4. `apps/web` - 主应用

- **职责**：业务应用逻辑
- **依赖**：所有 `packages/*`
- **可被依赖**：无
- **特点**：
  - 包含业务逻辑
  - 框架相关（Next.js, React）
  - 组合所有包

### 禁止的依赖关系

- ❌ `packages/*` 不能依赖 `apps/*`
- ❌ `packages/utils` 不能依赖其他包
- ❌ 禁止循环依赖
- ❌ `packages/ui` 不能依赖 `packages/charts`

## 跨层通信规则

### 1. 依赖注入

使用依赖注入来连接各层，避免直接实例化：

```typescript
// ✅ 正确：通过构造函数注入
export class GetDeviceStatusUseCase {
  constructor(private deviceRepo: DeviceRepository) {}
}

// ❌ 错误：直接实例化依赖
export class GetDeviceStatusUseCase {
  private deviceRepo = new DeviceRepositoryImpl(); // 禁止！
}
```

### 2. 接口隔离

使用接口定义层之间的契约：

```typescript
// 定义接口（domain 层）
export interface DeviceRepository {
  findById(id: string): Promise<Device | null>;
}

// 实现接口（infrastructure 层）
export class DeviceRepositoryImpl implements DeviceRepository {
  // 实现
}

// 使用接口（application 层）
export class GetDeviceStatusUseCase {
  constructor(private repo: DeviceRepository) {} // 依赖接口
}
```

### 3. DTO 转换

在 presentation 层和 application 层之间使用 DTOs：

```typescript
// application 层定义 DTO
export class DeviceDTO {
  constructor(public id: string, public name: string, public status: string) {}
}

// presentation 层转换
export class DeviceMapper {
  toDTO(device: Device): DeviceDTO {
    return new DeviceDTO(device.id, device.name, device.status);
  }
}
```

## 应用内部模块边界

### 模块划分

```
apps/web/
├── app/                          # Presentation Layer
├── components/                   # Presentation Layer
├── src/
│   ├── domain/                   # Domain Layer
│   ├── application/              # Application Layer
│   ├── infrastructure/           # Infrastructure Layer
│   └── presentation/             # Presentation Layer (可选)
```

### 模块职责

- **`app/`** - Next.js 路由层：处理路由和页面，依赖 `components/`, `src/application/`
- **`components/`** - React 组件层：UI 展示和用户交互，依赖 `src/application/`, `packages/*`
- **`src/domain/`** - 领域层：核心业务实体和规则，依赖 `packages/utils`
- **`src/application/`** - 应用层：应用业务逻辑和用例，依赖 `src/domain/`, `packages/utils`
- **`src/infrastructure/`** - 基础设施层：技术实现，实现 `src/domain/` 和 `src/application/` 的接口
- **`src/presentation/`** - 展示层（可选）：展示逻辑和控制器，依赖 `src/application/`

## 功能模块边界

### 按功能划分模块

```
src/
├── domain/
│   ├── device/                  # 设备领域
│   ├── metrics/                  # 指标领域
│   └── alerts/                  # 告警领域
├── application/
│   ├── device/                   # 设备用例
│   ├── metrics/                  # 指标用例
│   └── alerts/                   # 告警用例
├── infrastructure/
│   ├── device/                   # 设备基础设施
│   ├── metrics/                  # 指标基础设施
│   └── alerts/                   # 告警基础设施
└── presentation/
    ├── device/                   # 设备展示
    ├── metrics/                  # 指标展示
    └── alerts/                   # 告警展示
```

### 功能模块规则

1. **领域模块**：

   - 每个功能领域独立
   - 可以依赖共享领域代码
   - 不能依赖其他领域模块

2. **应用模块**：

   - 可以依赖多个领域模块
   - 可以组合多个用例
   - 不能依赖其他应用模块（除非通过接口）

3. **基础设施模块**：

   - 实现领域和应用层定义的接口
   - 可以依赖多个领域和应用模块
   - 模块间通过接口通信

4. **展示模块**：
   - 可以依赖多个应用模块
   - 负责数据转换和展示
   - 薄层，不包含业务逻辑

## 文件命名约定

- **实体**：`*.entity.ts`
- **值对象**：`*.vo.ts`
- **仓储接口**：`*.repository.ts`
- **仓储实现**：`*.repository.impl.ts`
- **用例**：`*.use-case.ts`
- **DTO**：`*.dto.ts`
- **控制器**：`*.controller.ts`
- **映射器**：`*.mapper.ts`

## 检查清单

### 依赖规则检查

在编写代码时，请检查以下规则：

- [ ] domain 层不导入任何框架代码
- [ ] application 层只导入 domain 层和工具函数
- [ ] infrastructure 层实现 domain 和 application 层定义的接口
- [ ] presentation 层可以导入 application 和 domain 层
- [ ] 没有循环依赖
- [ ] 业务逻辑与框架解耦

### 模块边界检查

在创建新模块时，确保：

- [ ] 模块职责单一明确
- [ ] 模块依赖方向正确（向内）
- [ ] 模块间通过接口通信
- [ ] 没有循环依赖
- [ ] 模块边界清晰
- [ ] 符合 Monorepo 包依赖规则

## 实施指南

1. **创建新功能时**：

   - 首先在 domain 层定义业务实体和接口
   - 在 application 层实现用例和业务逻辑
   - 在 infrastructure 层实现技术细节
   - 最后在 presentation 层集成和展示

2. **重构现有代码时**：

   - 识别业务逻辑并将其提取到 domain 和 application 层
   - 将技术实现移到 infrastructure 层
   - 将框架相关代码移到 presentation 层
   - 使用接口和依赖注入连接各层

3. **测试策略**：
   - domain 层和 application 层使用单元测试
   - infrastructure 层使用集成测试
   - presentation 层使用端到端测试

## 工具检查

可以使用以下工具检查依赖：

```bash
# 检查 TypeScript 项目依赖
npx madge --circular --extensions ts,tsx apps/web/src

# 检查包依赖
pnpm list --depth=0

# 检查导入关系
npx dependency-cruiser --config .dependency-cruiser.json apps/web/src
```

## 参考资源

- [Clean Architecture by Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Clean Architecture in TypeScript](https://khalilstemmler.com/articles/typescript-domain-driven-design/clean-architecture-introduction/)
