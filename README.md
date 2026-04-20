# Iris Program - 校园轻社交与资源共享平台

一个基于 uni-app + NestJS 的校园社交平台，支持H5和小程序多端运行。

## 项目特点

- 🎯 **多端支持**：一套代码，同时支持H5和微信小程序
- 🔐 **完整认证**：JWT身份验证，安全可靠
- 📱 **功能丰富**：动态发布、圈子、活动、资源共享
- 🎨 **界面美观**：现代化UI设计，用户体验优秀
- 🚀 **性能优化**：分页加载、图片懒加载
- 💾 **数据持久化**：PostgreSQL数据库，TypeORM管理

## 技术栈

### 前端
- **框架**：uni-app (Vue 3 + TypeScript)
- **UI组件**：uview-plus
- **状态管理**：Vue 3 Composition API
- **构建工具**：Vite

### 后端
- **框架**：NestJS
- **数据库**：PostgreSQL
- **ORM**：TypeORM
- **认证**：JWT + Passport
- **API文档**：Swagger

## 快速开始

### 环境要求

- Node.js >= 16
- PostgreSQL >= 12
- npm 或 yarn

### 1. 克隆项目

```bash
git clone <repository-url>
cd iris-program
```

### 2. 安装依赖

```bash
# 安装后端依赖
cd Server
npm install

# 安装前端依赖
cd ../Clint
npm install
```

### 3. 配置数据库

创建PostgreSQL数据库：

```sql
CREATE DATABASE iris_program;
```

配置后端环境变量（Server/.env）：

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=123456
DB_DATABASE=iris_program
```

### 4. 初始化数据

```bash
cd Server
npm run seed
```

这将创建测试用户和示例数据。

### 5. 启动服务

#### 方式一：使用启动脚本（推荐）

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

#### 方式二：手动启动

**启动后端：**
```bash
cd Server
npm run start:dev
```

**启动前端H5：**
```bash
cd Clint
npm run dev:h5
```

**启动小程序：**
```bash
cd Clint
npm run dev:mp-weixin
# 然后使用微信开发者工具打开 Clint/dist/dev/mp-weixin 目录
```

### 6. 访问应用

- **后端API**：http://localhost:3000
- **API文档**：http://localhost:3000/api-docs
- **前端H5**：根据uni-app输出的地址访问

## 测试账号

| 用户名 | 密码 | 角色 | 说明 |
|--------|------|------|------|
| student1 | 123456 | 学生 | 计算机学院，已认证 |
| student2 | 123456 | 学生 | 经管学院，已认证 |
| student3 | 123456 | 学生 | 美术学院，未认证 |
| teacher1 | 123456 | 教师 | 计算机学院，已认证 |

## 功能模块

### 1. 用户系统
- ✅ 用户注册/登录
- ✅ 个人资料管理
- ✅ 关注/粉丝系统
- ⏳ 实名认证

### 2. 动态广场
- ✅ 发布动态（文字+图片）
- ✅ 话题分类
- ✅ 点赞/评论/收藏
- ✅ 动态详情
- ⏳ 话题标签

### 3. 圈子
- ✅ 创建/加入圈子
- ✅ 圈子动态
- ✅ 成员管理
- ⏳ 圈子活动

### 4. 活动
- ✅ 发布活动
- ✅ 活动报名
- ✅ 活动分类
- ⏳ 活动签到

### 5. 资源共享
- ✅ 二手交易
- ✅ 学习资料
- ✅ 失物招领
- ⏳ 在线交易

### 6. 消息系统
- ⏳ 私信聊天
- ⏳ 系统通知
- ⏳ 评论提醒

## 项目结构

```
iris-program/
├── Server/                 # 后端服务
│   ├── src/
│   │   ├── modules/       # 功能模块
│   │   │   ├── auth/      # 认证模块
│   │   │   ├── users/     # 用户模块
│   │   │   ├── posts/     # 动态模块
│   │   │   ├── circles/   # 圈子模块
│   │   │   ├── activities/# 活动模块
│   │   │   └── resources/ # 资源模块
│   │   ├── common/        # 公共模块
│   │   ├── config/        # 配置文件
│   │   └── scripts/       # 脚本文件
│   └── package.json
│
├── Clint/                 # 前端应用
│   ├── src/
│   │   ├── pages/         # 页面
│   │   ├── components/    # 组件
│   │   ├── api/           # API接口
│   │   ├── utils/         # 工具函数
│   │   └── static/        # 静态资源
│   └── package.json
│
├── TEST_GUIDE.md          # 测试指南
├── start.sh               # Linux/Mac启动脚本
├── start.bat              # Windows启动脚本
└── README.md              # 项目说明
```

## API文档

启动后端服务后，访问 http://localhost:3000/api-docs 查看完整的API文档。

主要API端点：

- `POST /auth/login` - 用户登录
- `POST /auth/register` - 用户注册
- `GET /posts` - 获取动态列表
- `POST /posts` - 发布动态
- `GET /circles` - 获取圈子列表
- `GET /activities` - 获取活动列表
- `GET /resources` - 获取资源列表

## 开发指南

### 添加新功能

1. 后端：在 `Server/src/modules/` 创建新模块
2. 前端：在 `Clint/src/pages/` 创建新页面
3. API：在 `Clint/src/api/` 添加接口定义

### 数据库迁移

```bash
cd Server
npm run migration:generate -- src/migrations/MigrationName
npm run migration:run
```

### 代码规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 遵循 TypeScript 类型定义

## 部署

### 后端部署

1. 构建项目：`npm run build`
2. 配置生产环境变量
3. 启动服务：`npm run start:prod`

### 前端部署

**H5部署：**
```bash
npm run build:h5
# 将 dist/build/h5 目录部署到Web服务器
```

**小程序部署：**
```bash
npm run build:mp-weixin
# 使用微信开发者工具上传 dist/build/mp-weixin 目录
```

## 常见问题

查看 [TEST_GUIDE.md](./TEST_GUIDE.md) 了解详细的测试指南和常见问题解决方案。

## 贡献指南

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License

## 联系方式

如有问题，请提交 Issue 或联系开发团队。
