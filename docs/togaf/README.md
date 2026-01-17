# TOGAF 架构文档

本目录包含 IoT Hub 项目的 TOGAF (The Open Group Architecture Framework) 架构图。

## 架构图说明

### 1. TOGAF 总体架构概览 (`overview.puml`)

展示了项目的整体企业架构，包括业务架构、应用架构、数据架构和技术架构四个层次及其相互关系。

### 2. TOGAF 业务架构图 (`business-architecture.puml`)

描述了业务层的功能模块、业务能力和业务流程：

- **业务层**: 设备管理、实时监控、数据分析、告警管理、系统设置
- **业务能力**: 设备发现与注册、设备状态监控、数据采集、数据可视化等
- **业务流程**: 设备上线流程、数据采集流程、告警处理流程等

### 3. TOGAF 应用架构图 (`application-architecture.puml`)

展示了应用组件的层次结构和依赖关系：

- **前端应用层**: Web 应用、仪表盘、设备管理界面、数据分析界面、3D 可视化
- **UI 组件库**: @iot/ui、@iot/charts、@iot/utils、@iot/three-utils、@iot/animation、@iot/canvas、@iot/i18n
- **业务组件**: IoT 仪表盘、设备面板、图表面板等
- **应用服务层**: 设备服务、数据服务、告警服务、用户服务
- **AWS 服务集成层**: @iot/aws（IoT Core、Lambda、DynamoDB、S3、SNS/SQS、API Gateway）
- **IoT 协议工具层**: @iot/tools（MQTT、CoAP、Protobuf、CBOR、MessagePack、设备管理、OTA）
- **计算工具层**: @iot/compute（信号处理、统计分析、加密、压缩、图像处理、Web Workers）
- **数据访问层**: 设备数据访问、指标数据访问、告警数据访问

### 4. TOGAF 技术架构图 (`technology-architecture.puml`)

描述了技术栈的层次结构：

- **表示层**: 浏览器、Next.js 应用、Tailwind CSS
- **应用层**: Monorepo 结构（apps/web、packages/ui、packages/charts、packages/utils、packages/three-utils、packages/aws、packages/tools、packages/compute、packages/animation、packages/canvas、packages/i18n、packages/test-utils）、TypeScript、pnpm Workspaces
- **框架层**: React Three Fiber、Three.js、ECharts、Radix UI
- **协议层**: MQTT、CoAP（@iot/tools）
- **序列化层**: Protobuf、CBOR、MessagePack（@iot/tools）
- **计算工具层**: 信号处理、统计分析、加密、压缩、图像处理、Web Workers（@iot/compute）
- **构建工具层**: Next.js Build、PostCSS、TypeScript Compiler
- **运行时层**: Node.js、Vercel Runtime、AWS Lambda
- **云基础设施层**: AWS IoT Core、AWS Lambda、AWS DynamoDB、AWS S3、AWS API Gateway、AWS SNS/SQS
- **部署层**: Vercel Platform、CDN、Edge Functions、AWS 云基础设施

### 5. TOGAF 数据架构图 (`data-architecture.puml`)

展示了数据流的架构：

- **数据源层**: IoT 设备、传感器数据、设备状态、网络流量
- **数据采集层**: 数据采集服务、实时数据流、批量数据、AWS IoT Core、MQTT/CoAP 协议
- **数据处理层**: 数据转换、数据聚合、数据验证、序列化协议（Protobuf/CBOR/MessagePack）、信号处理、统计分析、数据加密、数据压缩
- **数据存储层**: 实时数据缓存、时序数据库、设备元数据、配置数据、AWS DynamoDB、AWS S3、IoT Core Shadow
- **数据展示层**: 实时图表、历史报表、设备仪表盘、热力图
- **消息服务层**: AWS SQS（消息队列）、AWS SNS（消息通知）
- **数据访问层**: REST API、WebSocket、GraphQL、AWS API Gateway

## 如何查看架构图

### 方法 1: 使用 PlantUML 在线查看器

1. 访问 [PlantUML Online Server](http://www.plantuml.com/plantuml/uml/)
2. 复制 `.puml` 文件内容
3. 粘贴到在线编辑器中查看

### 方法 2: 使用 VS Code 插件

1. 安装 "PlantUML" 插件
2. 打开 `.puml` 文件
3. 使用 `Alt+D` 预览图表

### 方法 3: 使用本地工具

```bash
# 安装 PlantUML
npm install -g @plantuml/plantuml

# 生成图片
plantuml docs/*.puml
```

### 方法 4: 使用 IntelliJ IDEA / WebStorm

1. 安装 PlantUML 插件
2. 打开 `.puml` 文件
3. 右键选择 "PlantUML" -> "Preview Diagram"

## AWS 服务使用说明

项目集成了多个 AWS 服务，通过 `@iot/aws` 包提供统一的 SDK 封装：

- **AWS IoT Core**: 设备管理和消息路由，支持 MQTT 协议
- **AWS Lambda**: 无服务器函数计算，用于数据处理和业务逻辑
- **AWS DynamoDB**: NoSQL 数据库，存储设备数据和指标
- **AWS S3**: 对象存储服务，存储 OTA 固件、配置文件和日志
- **AWS API Gateway**: REST API 和 WebSocket 管理
- **AWS SNS/SQS**: 消息通知和队列服务

## IoT 协议和工具

通过 `@iot/tools` 包提供物联网开发常用工具：

- **MQTT/CoAP**: 物联网通信协议客户端
- **序列化协议**: Protobuf、CBOR、MessagePack 数据序列化
- **设备管理**: 设备注册、认证、配置管理
- **OTA**: 固件更新工具，支持版本管理和验证

## 架构图更新

当项目架构发生变化时，请及时更新相应的架构图文件，保持文档与代码的一致性。

## 参考资源

- [TOGAF 官方文档](https://www.opengroup.org/togaf)
- [PlantUML 文档](https://plantuml.com/)
- [PlantUML 组件图语法](https://plantuml.com/component-diagram)
