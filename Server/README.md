# Iris Program Server

校园"轻"社交与资源共享平台后端服务

## 技术栈

- **框架**: NestJS 10.x
- **数据库**: PostgreSQL
- **ORM**: TypeORM
- **认证**: JWT + Passport
- **文档**: Swagger/OpenAPI

## 功能模块

### 核心模块

1. **用户模块 (Users)**
   - 用户信息管理
   - 关注/粉丝系统
   - 个人资料编辑

2. **认证模块 (Auth)**
   - 微信小程序登录
   - JWT 令牌认证
   - 学生身份验证

3. **动态模块 (Posts)**
   - 动态发布与浏览
   - 点赞、评论、收藏
   - 话题分类

4. **资源模块 (Resources)**
   - 二手市场
   - 学习资源
   - 失物招领

5. **活动模块 (Activities)**
   - 活动发布与管理
   - 活动报名
   - 参与人员管理

6. **圈子模块 (Circles)**
   - 兴趣圈子
   - 成员管理
   - 圈子动态

7. **评论模块 (Comments)**
   - 评论与回复
   - 评论点赞
   - 二级评论

8. **消息模块 (Messages)**
   - 私信聊天
   - 会话列表
   - 未读消息

## 快速开始

### 环境要求

- Node.js >= 16.x
- PostgreSQL >= 13.x
- npm 或 yarn

### 安装依赖

\`\`\`bash
npm install
\`\`\`

### 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

\`\`\`bash
cp .env.example .env
\`\`\`

编辑 `.env` 文件，配置数据库和微信小程序信息：

\`\`\`env
# 数据库配置
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=iris_program

# JWT 配置
JWT_SECRET=your_jwt_secret_key

# 微信小程序配置
WECHAT_APPID=your_wechat_appid
WECHAT_SECRET=your_wechat_secret
\`\`\`

### 创建数据库

\`\`\`bash
# 登录 PostgreSQL
psql -U postgres

# 创建数据库
CREATE DATABASE iris_program;
\`\`\`

### 运行项目

\`\`\`bash
# 开发模式
npm run start:dev

# 生产模式
npm run build
npm run start:prod
\`\`\`

### 访问 API 文档

启动后访问: http://localhost:3000/api

## 数据库设计

### 核心表结构

- **users** - 用户表
- **posts** - 动态表
- **resources** - 资源表
- **activities** - 活动表
- **circles** - 圈子表
- **comments** - 评论表
- **messages** - 消息表

### 关系表

- **user_follows** - 用户关注关系
- **user_liked_posts** - 用户点赞动态
- **user_collected_posts** - 用户收藏动态
- **user_collected_resources** - 用户收藏资源
- **circle_members** - 圈子成员
- **activity_participants** - 活动参与者

## API 接口

### 认证接口

- `POST /auth/wechat/login` - 微信登录

### 用户接口

- `GET /users` - 获取用户列表
- `GET /users/me` - 获取当前用户信息
- `GET /users/:id` - 获取用户详情
- `PUT /users/me` - 更新用户信息
- `POST /users/:id/follow` - 关注用户
- `POST /users/:id/unfollow` - 取消关注

### 动态接口

- `GET /posts` - 获取动态列表
- `GET /posts/:id` - 获取动态详情
- `POST /posts` - 创建动态
- `PUT /posts/:id` - 更新动态
- `DELETE /posts/:id` - 删除动态
- `POST /posts/:id/like` - 点赞动态
- `POST /posts/:id/collect` - 收藏动态

### 资源接口

- `GET /resources` - 获取资源列表
- `GET /resources/:id` - 获取资源详情
- `POST /resources` - 创建资源
- `PUT /resources/:id` - 更新资源
- `DELETE /resources/:id` - 删除资源

### 活动接口

- `GET /activities` - 获取活动列表
- `GET /activities/:id` - 获取活动详情
- `POST /activities` - 创建活动
- `PUT /activities/:id` - 更新活动
- `POST /activities/:id/join` - 报名活动

### 圈子接口

- `GET /circles` - 获取圈子列表
- `GET /circles/:id` - 获取圈子详情
- `POST /circles` - 创建圈子
- `POST /circles/:id/join` - 加入圈子

### 评论接口

- `GET /comments/post/:postId` - 获取动态评论
- `POST /comments` - 创建评论
- `POST /comments/:id/like` - 点赞评论

### 消息接口

- `GET /messages/conversations` - 获取会话列表
- `GET /messages/conversation/:userId` - 获取聊天记录
- `POST /messages` - 发送消息
- `GET /messages/unread/count` - 获取未读消息数

## 开发命令

\`\`\`bash
# 开发模式
npm run start:dev

# 构建
npm run build

# 生产模式
npm run start:prod

# 代码格式化
npm run format

# 代码检查
npm run lint

# 运行测试
npm run test

# 运行 e2e 测试
npm run test:e2e
\`\`\`

## 项目结构

\`\`\`
Server/
├── src/
│   ├── common/              # 公共模块
│   │   ├── filters/         # 异常过滤器
│   │   └── interceptors/    # 拦截器
│   ├── config/              # 配置文件
│   ├── modules/             # 业务模块
│   │   ├── auth/            # 认证模块
│   │   ├── users/           # 用户模块
│   │   ├── posts/           # 动态模块
│   │   ├── resources/       # 资源模块
│   │   ├── activities/      # 活动模块
│   │   ├── circles/         # 圈子模块
│   │   ├── comments/        # 评论模块
│   │   └── messages/        # 消息模块
│   ├── app.module.ts        # 应用主模块
│   └── main.ts              # 应用入口
├── .env.example             # 环境变量示例
├── nest-cli.json            # Nest CLI 配置
├── package.json             # 项目依赖
└── tsconfig.json            # TypeScript 配置
\`\`\`

## 部署

### 使用 Docker

\`\`\`bash
# 构建镜像
docker build -t iris-program-server .

# 运行容器
docker run -p 3000:3000 iris-program-server
\`\`\`

### 使用 PM2

\`\`\`bash
# 安装 PM2
npm install -g pm2

# 启动应用
pm2 start dist/main.js --name iris-program-server

# 查看日志
pm2 logs iris-program-server
\`\`\`

## 许可证

MIT
