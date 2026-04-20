# API 接口文档

## 基础信息

- **Base URL**: `http://localhost:3000`
- **认证方式**: Bearer Token (JWT)
- **响应格式**: JSON

## 通用响应格式

### 成功响应

```json
{
  "data": {},
  "statusCode": 200,
  "message": "success",
  "timestamp": "2026-04-20T10:00:00.000Z"
}
```

### 错误响应

```json
{
  "statusCode": 400,
  "message": "错误信息",
  "error": "Bad Request",
  "timestamp": "2026-04-20T10:00:00.000Z"
}
```

## 认证接口

### 微信登录

**POST** `/auth/wechat/login`

**请求体**:
```json
{
  "code": "微信登录code",
  "nickname": "用户昵称",
  "avatar": "头像URL"
}
```

**响应**:
```json
{
  "accessToken": "jwt_token",
  "user": {
    "id": "uuid",
    "openid": "openid",
    "nickname": "用户昵称",
    "avatar": "头像URL"
  }
}
```

## 用户接口

### 获取用户列表

**GET** `/users?page=1&limit=20`

### 获取当前用户信息

**GET** `/users/me`

需要认证

### 获取用户详情

**GET** `/users/:id`

### 更新用户信息

**PUT** `/users/me`

需要认证

**请求体**:
```json
{
  "nickname": "新昵称",
  "bio": "个性签名",
  "school": "学校",
  "college": "学院",
  "major": "专业",
  "grade": "年级"
}
```

### 关注用户

**POST** `/users/:id/follow`

需要认证

### 取消关注

**POST** `/users/:id/unfollow`

需要认证

### 获取粉丝列表

**GET** `/users/:id/followers?page=1&limit=20`

### 获取关注列表

**GET** `/users/:id/following?page=1&limit=20`

## 动态接口

### 获取动态列表

**GET** `/posts?page=1&limit=20&category=all`

**查询参数**:
- `page`: 页码
- `limit`: 每页数量
- `category`: 分类 (all/study/life/activity/confession)

### 获取动态详情

**GET** `/posts/:id`

### 创建动态

**POST** `/posts`

需要认证

**请求体**:
```json
{
  "content": "动态内容",
  "images": ["图片URL1", "图片URL2"],
  "location": "位置",
  "tags": ["标签1", "标签2"],
  "visibility": "public",
  "category": "life"
}
```

### 更新动态

**PUT** `/posts/:id`

需要认证

### 删除动态

**DELETE** `/posts/:id`

需要认证

### 点赞动态

**POST** `/posts/:id/like`

需要认证

### 取消点赞

**POST** `/posts/:id/unlike`

需要认证

### 收藏动态

**POST** `/posts/:id/collect`

需要认证

### 取消收藏

**POST** `/posts/:id/uncollect`

需要认证

### 获取用户动态

**GET** `/posts/user/:userId?page=1&limit=20`

## 资源接口

### 获取资源列表

**GET** `/resources?page=1&limit=20&category=secondhand`

**查询参数**:
- `category`: 分类 (secondhand/study/lost/found/other)

### 获取资源详情

**GET** `/resources/:id`

### 创建资源

**POST** `/resources`

需要认证

**请求体**:
```json
{
  "title": "资源标题",
  "description": "资源描述",
  "images": ["图片URL"],
  "price": 50.00,
  "category": "secondhand",
  "location": "位置",
  "contact": "联系方式",
  "tags": ["标签"]
}
```

### 更新资源

**PUT** `/resources/:id`

需要认证

**请求体**:
```json
{
  "title": "新标题",
  "status": "sold"
}
```

### 删除资源

**DELETE** `/resources/:id`

需要认证

### 收藏资源

**POST** `/resources/:id/collect`

需要认证

### 取消收藏

**POST** `/resources/:id/uncollect`

需要认证

## 活动接口

### 获取活动列表

**GET** `/activities?page=1&limit=20&category=lecture&status=upcoming`

**查询参数**:
- `category`: 分类 (lecture/competition/party/sports/other)
- `status`: 状态 (upcoming/ongoing/ended/cancelled)

### 获取活动详情

**GET** `/activities/:id`

### 创建活动

**POST** `/activities`

需要认证

**请求体**:
```json
{
  "title": "活动标题",
  "description": "活动描述",
  "images": ["图片URL"],
  "category": "lecture",
  "location": "活动地点",
  "startTime": "2026-05-01T10:00:00Z",
  "endTime": "2026-05-01T12:00:00Z",
  "maxParticipants": 100
}
```

### 更新活动

**PUT** `/activities/:id`

需要认证

### 删除活动

**DELETE** `/activities/:id`

需要认证

### 报名活动

**POST** `/activities/:id/join`

需要认证

### 取消报名

**POST** `/activities/:id/leave`

需要认证

## 圈子接口

### 获取圈子列表

**GET** `/circles?page=1&limit=20&category=study`

**查询参数**:
- `category`: 分类 (study/sports/art/tech/other)

### 获取圈子详情

**GET** `/circles/:id`

### 创建圈子

**POST** `/circles`

需要认证

**请求体**:
```json
{
  "name": "圈子名称",
  "description": "圈子描述",
  "avatar": "头像URL",
  "cover": "封面URL",
  "type": "public",
  "category": "study",
  "tags": ["标签"]
}
```

### 更新圈子

**PUT** `/circles/:id`

需要认证

### 删除圈子

**DELETE** `/circles/:id`

需要认证

### 加入圈子

**POST** `/circles/:id/join`

需要认证

### 退出圈子

**POST** `/circles/:id/leave`

需要认证

### 获取圈子成员

**GET** `/circles/:id/members?page=1&limit=20`

## 评论接口

### 获取动态评论

**GET** `/comments/post/:postId?page=1&limit=20`

### 获取评论详情

**GET** `/comments/:id`

### 创建评论

**POST** `/comments`

需要认证

**请求体**:
```json
{
  "content": "评论内容",
  "postId": "动态ID",
  "parentId": "父评论ID (可选)",
  "replyToUserId": "回复的用户ID (可选)"
}
```

### 更新评论

**PUT** `/comments/:id`

需要认证

### 删除评论

**DELETE** `/comments/:id`

需要认证

### 点赞评论

**POST** `/comments/:id/like`

需要认证

### 取消点赞

**POST** `/comments/:id/unlike`

需要认证

## 消息接口

### 获取会话列表

**GET** `/messages/conversations?page=1&limit=20`

需要认证

### 获取聊天记录

**GET** `/messages/conversation/:userId?page=1&limit=50`

需要认证

### 发送消息

**POST** `/messages`

需要认证

**请求体**:
```json
{
  "content": "消息内容",
  "receiverId": "接收者ID",
  "type": "text"
}
```

### 标记消息已读

**PUT** `/messages/:id/read`

需要认证

### 标记会话已读

**PUT** `/messages/conversation/:userId/read`

需要认证

### 获取未读消息数

**GET** `/messages/unread/count`

需要认证

## 状态码说明

- `200` - 成功
- `201` - 创建成功
- `400` - 请求参数错误
- `401` - 未授权
- `403` - 禁止访问
- `404` - 资源不存在
- `500` - 服务器错误
