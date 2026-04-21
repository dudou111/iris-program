# 测试指南

## 环境准备

### 1. 数据库
已连接PostgreSQL数据库，测试数据已初始化完成。

### 2. 后端服务
- 端口：3000
- API文档：http://localhost:3000/api-docs

### 3. 前端服务
- H5端口：根据uni-app配置
- 小程序：使用微信开发者工具

## 测试账号

已创建以下测试账号（密码均为：123456）：

| 用户名 | 昵称 | 角色 | 说明 |
|--------|------|------|------|
| student1 | 张三 | 学生 | 计算机学院，已认证 |
| student2 | 李四 | 学生 | 经管学院，已认证 |
| student3 | 王五 | 学生 | 美术学院，未认证 |
| teacher1 | 陈老师 | 教师 | 计算机学院，已认证 |

## 测试数据

### 帖子（4条）
- 前端技术分享
- 校园美景随拍
- 算法学习求助
- 篮球赛分享

### 资源（4条）
- 计算机网络课程笔记
- 高等数学习题集
- 二手自行车出售
- 捡到校园卡（失物招领）

### 活动（3个）
- 周末篮球友谊赛（2026-04-26）
- 前端技术分享会（2026-04-25）
- 校园音乐节（2026-05-01）

### 圈子（4个）
- 前端开发交流圈
- 摄影爱好者
- 篮球俱乐部
- 考研互助小组

## 测试流程

### 1. 启动后端服务
```bash
cd Server
npm run start:dev
```

### 2. 启动前端服务

#### H5测试
```bash
cd Clint
npm run dev:h5
```

#### 小程序测试
```bash
cd Clint
npm run dev:mp-weixin
```
然后使用微信开发者工具打开 `Clint/dist/dev/mp-weixin` 目录

### 3. 功能测试清单

#### 登录注册
- [ ] 使用 student1/123456 登录
- [ ] 验证登录成功后跳转到首页
- [ ] 验证token保存成功
- [ ] 测试登录失败情况（错误密码）

#### 首页与动态状态同步
- [ ] 首页真实加载帖子列表
- [ ] 切换话题分类（全部/学习/生活/活动/表白墙）后结果随服务端变化
- [ ] 下拉刷新与上拉加载更多正常
- [ ] 点赞/取消点赞后计数立即更新
- [ ] 收藏/取消收藏后计数立即更新
- [ ] 从首页进入详情页后，点赞/收藏状态与列表保持一致
- [ ] 发布带图动态后返回首页可见新内容

#### 搜索
- [ ] 输入关键词后触发真实搜索
- [ ] 综合搜索可同时看到动态、用户、资源结果
- [ ] 切换“动态 / 用户 / 资源”tab 后列表变化正确
- [ ] 点击用户结果跳转用户主页
- [ ] 点击动态结果跳转详情页

#### 动态详情与评论
- [ ] 详情页真实加载帖子内容、点赞数、评论数、收藏数
- [ ] 详情页可加载评论列表
- [ ] 发表评论后评论列表刷新，帖子评论数同步增加
- [ ] 回复评论后评论列表刷新
- [ ] 点赞/取消点赞评论后单条评论状态更新
- [ ] 详情页关注按钮与用户主页关注按钮状态一致

#### 用户主页
- [ ] 通过搜索结果或详情页进入用户主页
- [ ] 用户资料、粉丝数、关注数、动态列表真实加载
- [ ] 关注/取消关注后粉丝数与按钮状态立即更新
- [ ] 用户主页动态列表进入详情后状态一致

#### 发布与图片上传
- [ ] 发布动态时选择本地图片
- [ ] 发布请求前先完成图片上传
- [ ] 发布成功后详情页与首页都能访问上传后的图片 URL

#### 聊天 REST 与 WebSocket
- [ ] 从用户主页进入聊天页
- [ ] 聊天页真实加载历史消息
- [ ] 发送文本消息后消息立即出现在当前会话
- [ ] 进入会话后当前会话被标记已读
- [ ] 使用两个账号分别打开聊天页，A 发送消息后 B 在线实时收到 `message:new`
- [ ] B 收到消息后自动滚动到底部
- [ ] 关闭聊天页后再次进入，历史消息仍可通过 REST 拉取

### 4. 兼容性测试

#### H5端
- [ ] Chrome浏览器
- [ ] Safari浏览器
- [ ] 移动端浏览器（微信内置浏览器）
- [ ] 响应式布局测试

#### 小程序端
- [ ] 微信开发者工具
- [ ] 真机调试
- [ ] 不同机型适配

## 自动化验证

### 后端已验证命令

```bash
cd Server
npm test -- src/modules/posts/posts.service.spec.ts --runInBand
npm test -- src/modules/messages/messages.service.spec.ts --runInBand
npm run build
```

说明：
- Jest 在当前环境建议统一追加 `--runInBand`，否则可能出现 `spawn EPERM`
- 本轮新增消息实时层依赖 `ws`

### 前端已验证命令

```bash
cd Clint
npm run type-check
```

说明：
- 当前 `type-check` 仍会失败，但失败来源是既有 wrapper 页面语法问题，不是本轮新增页面
- 目前已确认仍报错的文件包括：`ActivitiesPage.vue`、`CirclesPage.vue`、`HomePage.vue`、`ProfilePage.vue`、`PublishPage.vue` 等

## API测试

可以使用Swagger文档进行API测试：
http://localhost:3000/api-docs

### 主要API端点

#### 认证
- POST /auth/login - 登录
- POST /auth/register - 注册

#### 帖子
- GET /posts - 获取帖子列表
- GET /posts/:id - 获取帖子详情
- POST /posts - 创建帖子
- PUT /posts/:id - 更新帖子
- DELETE /posts/:id - 删除帖子
- POST /posts/:id/like - 点赞
- POST /posts/:id/unlike - 取消点赞
- POST /posts/:id/collect - 收藏
- POST /posts/:id/uncollect - 取消收藏
- GET /posts/user/:userId - 获取用户动态列表

#### 资源
- GET /resources - 获取资源列表
- GET /resources/:id - 获取资源详情
- POST /resources - 创建资源
- POST /resources/:id/collect - 收藏资源
- POST /resources/:id/uncollect - 取消收藏资源

#### 评论
- GET /comments/post/:postId - 获取帖子评论
- POST /comments - 创建评论
- POST /comments/:id/like - 点赞评论
- POST /comments/:id/unlike - 取消点赞评论

#### 用户
- GET /users/:id - 获取用户详情
- POST /users/:id/follow - 关注用户
- POST /users/:id/unfollow - 取消关注
- GET /users/:id/followers - 获取粉丝列表
- GET /users/:id/following - 获取关注列表

#### 搜索
- GET /search?q=关键词&type=all - 综合搜索
- GET /search?q=关键词&type=posts - 动态搜索
- GET /search?q=关键词&type=users - 用户搜索
- GET /search?q=关键词&type=resources - 资源搜索

#### 上传
- POST /upload/images - 上传图片

#### 消息
- GET /messages/conversations - 获取会话列表
- GET /messages/conversation/:userId - 获取聊天记录
- POST /messages - 发送消息
- PUT /messages/conversation/:userId/read - 标记会话已读
- GET /messages/unread/count - 获取未读数
- WS /messages/ws?token=<jwt> - 实时消息连接

#### 活动
- GET /activities - 获取活动列表
- GET /activities/:id - 获取活动详情
- POST /activities - 创建活动
- POST /activities/:id/join - 报名活动

#### 圈子
- GET /circles - 获取圈子列表
- GET /circles/:id - 获取圈子详情
- POST /circles - 创建圈子
- POST /circles/:id/join - 加入圈子

## 常见问题

### 1. 后端服务无法启动
- 检查PostgreSQL是否运行
- 检查.env配置是否正确
- 检查端口3000是否被占用

### 2. 前端无法连接后端
- 检查request.ts中的BASE_URL配置
- H5端：确保BASE_URL为 http://localhost:3000
- 小程序端：需要配置合法域名或开启开发者工具的"不校验合法域名"

### 3. 图片无法显示
- 测试数据使用的是picsum.photos的随机图片
- 需要网络连接才能加载
- 可以替换为本地图片进行测试

### 4. 小程序真机调试问题
- 需要配置服务器域名白名单
- 或使用开发版/体验版进行测试

## 已知问题

1. 前端 `npm run type-check` 仍被旧的 wrapper 页面语法错误阻塞，尚未在本轮一并清理。
2. 聊天实时连接当前仅在聊天页建立，符合本轮设计范围，尚未扩展到全局消息页或通知页。
3. 收藏列表页仍是占位内容，真实收藏聚合不在本轮范围内。
