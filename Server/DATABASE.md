# 数据库设计文档

## 数据库概述

- **数据库类型**: PostgreSQL
- **字符集**: UTF-8
- **时区**: UTC

## 表结构设计

### 1. 用户表 (users)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 用户ID |
| openid | VARCHAR(100) | UNIQUE, NOT NULL | 微信openid |
| unionid | VARCHAR(100) | NULL | 微信unionid |
| student_id | VARCHAR(50) | NULL | 学号 |
| nickname | VARCHAR(50) | NOT NULL | 昵称 |
| avatar | TEXT | NULL | 头像URL |
| school | VARCHAR(100) | NULL | 学校 |
| college | VARCHAR(100) | NULL | 学院 |
| major | VARCHAR(100) | NULL | 专业 |
| grade | VARCHAR(20) | NULL | 年级 |
| bio | VARCHAR(200) | NULL | 个性签名 |
| is_verified | BOOLEAN | DEFAULT FALSE | 是否认证 |
| role | ENUM | DEFAULT 'student' | 角色 (student/teacher/admin) |
| followers_count | INTEGER | DEFAULT 0 | 粉丝数 |
| following_count | INTEGER | DEFAULT 0 | 关注数 |
| posts_count | INTEGER | DEFAULT 0 | 动态数 |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
- `idx_users_openid` ON openid
- `idx_users_student_id` ON student_id

### 2. 动态表 (posts)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 动态ID |
| content | TEXT | NOT NULL | 内容 |
| images | TEXT[] | NULL | 图片数组 |
| location | VARCHAR(200) | NULL | 位置 |
| tags | TEXT[] | NULL | 标签数组 |
| visibility | ENUM | DEFAULT 'public' | 可见范围 (public/friends/private) |
| category | ENUM | DEFAULT 'all' | 分类 (all/study/life/activity/confession) |
| likes_count | INTEGER | DEFAULT 0 | 点赞数 |
| comments_count | INTEGER | DEFAULT 0 | 评论数 |
| collections_count | INTEGER | DEFAULT 0 | 收藏数 |
| views_count | INTEGER | DEFAULT 0 | 浏览数 |
| is_deleted | BOOLEAN | DEFAULT FALSE | 是否删除 |
| author_id | UUID | FOREIGN KEY | 作者ID |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
- `idx_posts_author_id` ON author_id
- `idx_posts_category` ON category
- `idx_posts_created_at` ON created_at

**外键**:
- `fk_posts_author` REFERENCES users(id)

### 3. 资源表 (resources)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 资源ID |
| title | VARCHAR(100) | NOT NULL | 标题 |
| description | TEXT | NOT NULL | 描述 |
| images | TEXT[] | NULL | 图片数组 |
| price | DECIMAL(10,2) | NULL | 价格 |
| category | ENUM | DEFAULT 'secondhand' | 分类 (secondhand/study/lost/found/other) |
| status | ENUM | DEFAULT 'available' | 状态 (available/sold/closed) |
| location | VARCHAR(200) | NULL | 位置 |
| contact | VARCHAR(100) | NULL | 联系方式 |
| tags | TEXT[] | NULL | 标签数组 |
| views_count | INTEGER | DEFAULT 0 | 浏览数 |
| collections_count | INTEGER | DEFAULT 0 | 收藏数 |
| is_deleted | BOOLEAN | DEFAULT FALSE | 是否删除 |
| author_id | UUID | FOREIGN KEY | 发布者ID |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
- `idx_resources_author_id` ON author_id
- `idx_resources_category` ON category
- `idx_resources_status` ON status

**外键**:
- `fk_resources_author` REFERENCES users(id)

### 4. 活动表 (activities)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 活动ID |
| title | VARCHAR(100) | NOT NULL | 标题 |
| description | TEXT | NOT NULL | 描述 |
| images | TEXT[] | NULL | 图片数组 |
| category | ENUM | DEFAULT 'other' | 分类 (lecture/competition/party/sports/other) |
| location | VARCHAR(200) | NOT NULL | 地点 |
| start_time | TIMESTAMP | NOT NULL | 开始时间 |
| end_time | TIMESTAMP | NOT NULL | 结束时间 |
| max_participants | INTEGER | NULL | 最大参与人数 |
| current_participants | INTEGER | DEFAULT 0 | 当前参与人数 |
| status | ENUM | DEFAULT 'upcoming' | 状态 (upcoming/ongoing/ended/cancelled) |
| views_count | INTEGER | DEFAULT 0 | 浏览数 |
| is_deleted | BOOLEAN | DEFAULT FALSE | 是否删除 |
| organizer_id | UUID | FOREIGN KEY | 组织者ID |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
- `idx_activities_organizer_id` ON organizer_id
- `idx_activities_category` ON category
- `idx_activities_start_time` ON start_time

**外键**:
- `fk_activities_organizer` REFERENCES users(id)

### 5. 圈子表 (circles)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 圈子ID |
| name | VARCHAR(50) | NOT NULL | 名称 |
| description | TEXT | NOT NULL | 描述 |
| avatar | TEXT | NULL | 头像URL |
| cover | TEXT | NULL | 封面URL |
| type | ENUM | DEFAULT 'public' | 类型 (public/private) |
| category | ENUM | DEFAULT 'other' | 分类 (study/sports/art/tech/other) |
| tags | TEXT[] | NULL | 标签数组 |
| members_count | INTEGER | DEFAULT 0 | 成员数 |
| posts_count | INTEGER | DEFAULT 0 | 动态数 |
| is_deleted | BOOLEAN | DEFAULT FALSE | 是否删除 |
| creator_id | UUID | FOREIGN KEY | 创建者ID |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
- `idx_circles_creator_id` ON creator_id
- `idx_circles_category` ON category

**外键**:
- `fk_circles_creator` REFERENCES users(id)

### 6. 评论表 (comments)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 评论ID |
| content | TEXT | NOT NULL | 内容 |
| likes_count | INTEGER | DEFAULT 0 | 点赞数 |
| is_deleted | BOOLEAN | DEFAULT FALSE | 是否删除 |
| author_id | UUID | FOREIGN KEY | 作者ID |
| post_id | UUID | FOREIGN KEY | 动态ID |
| reply_to_user_id | UUID | FOREIGN KEY | 回复的用户ID |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |
| updated_at | TIMESTAMP | NOT NULL | 更新时间 |

**索引**:
- `idx_comments_author_id` ON author_id
- `idx_comments_post_id` ON post_id

**外键**:
- `fk_comments_author` REFERENCES users(id)
- `fk_comments_post` REFERENCES posts(id)
- `fk_comments_reply_to_user` REFERENCES users(id)

### 7. 消息表 (messages)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| id | UUID | PRIMARY KEY | 消息ID |
| content | TEXT | NOT NULL | 内容 |
| type | ENUM | DEFAULT 'text' | 类型 (text/image/system) |
| is_read | BOOLEAN | DEFAULT FALSE | 是否已读 |
| sender_id | UUID | FOREIGN KEY | 发送者ID |
| receiver_id | UUID | FOREIGN KEY | 接收者ID |
| created_at | TIMESTAMP | NOT NULL | 创建时间 |

**索引**:
- `idx_messages_sender_id` ON sender_id
- `idx_messages_receiver_id` ON receiver_id
- `idx_messages_created_at` ON created_at

**外键**:
- `fk_messages_sender` REFERENCES users(id)
- `fk_messages_receiver` REFERENCES users(id)

## 关系表

### 8. 用户关注关系表 (user_follows)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| follower_id | UUID | FOREIGN KEY | 关注者ID |
| following_id | UUID | FOREIGN KEY | 被关注者ID |

**主键**: (follower_id, following_id)

**外键**:
- `fk_user_follows_follower` REFERENCES users(id)
- `fk_user_follows_following` REFERENCES users(id)

### 9. 用户点赞动态表 (user_liked_posts)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| user_id | UUID | FOREIGN KEY | 用户ID |
| post_id | UUID | FOREIGN KEY | 动态ID |

**主键**: (user_id, post_id)

### 10. 用户收藏动态表 (user_collected_posts)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| user_id | UUID | FOREIGN KEY | 用户ID |
| post_id | UUID | FOREIGN KEY | 动态ID |

**主键**: (user_id, post_id)

### 11. 用户收藏资源表 (user_collected_resources)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| user_id | UUID | FOREIGN KEY | 用户ID |
| resource_id | UUID | FOREIGN KEY | 资源ID |

**主键**: (user_id, resource_id)

### 12. 圈子成员表 (circle_members)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| circle_id | UUID | FOREIGN KEY | 圈子ID |
| user_id | UUID | FOREIGN KEY | 用户ID |

**主键**: (circle_id, user_id)

### 13. 活动参与者表 (activity_participants)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| activity_id | UUID | FOREIGN KEY | 活动ID |
| user_id | UUID | FOREIGN KEY | 用户ID |

**主键**: (activity_id, user_id)

## ER 图关系说明

### 一对多关系

- User → Posts (一个用户可以发布多条动态)
- User → Resources (一个用户可以发布多个资源)
- User → Activities (一个用户可以组织多个活动)
- User → Comments (一个用户可以发表多条评论)
- Post → Comments (一条动态可以有多条评论)

### 多对多关系

- User ↔ User (关注关系)
- User ↔ Post (点赞、收藏)
- User ↔ Resource (收藏)
- User ↔ Circle (成员关系)
- User ↔ Activity (参与关系)

## 数据库优化建议

1. **索引优化**
   - 为常用查询字段添加索引
   - 为外键字段添加索引
   - 为时间字段添加索引

2. **分区策略**
   - 对大表（如 messages）按时间分区
   - 对历史数据进行归档

3. **缓存策略**
   - 热点数据使用 Redis 缓存
   - 用户信息缓存
   - 动态列表缓存

4. **查询优化**
   - 避免 N+1 查询
   - 使用连接查询代替多次查询
   - 合理使用分页

5. **数据清理**
   - 定期清理软删除数据
   - 归档历史消息
   - 清理过期会话
