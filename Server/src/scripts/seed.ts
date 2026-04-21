import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { typeOrmConfig } from '../config/typeorm.config';

async function seed() {
  const config = typeOrmConfig();
  const dataSource = new DataSource(config as any);

  try {
    await dataSource.initialize();
    console.log('数据库连接成功');

    // 清空现有数据
    await dataSource.query('TRUNCATE TABLE users CASCADE');
    console.log('已清空现有数据');

    // 创建测试用户
    const hashedPassword = await bcrypt.hash('123456', 10);

    const users = [
      {
        username: 'student1',
        password: hashedPassword,
        nickname: '张三',
        avatar: 'https://picsum.photos/200?random=1',
        school: '清华大学',
        college: '计算机学院',
        major: '计算机科学与技术',
        grade: '2023',
        bio: '热爱编程，喜欢分享技术心得',
        role: 'student',
        isVerified: true
      },
      {
        username: 'student2',
        password: hashedPassword,
        nickname: '李四',
        avatar: 'https://picsum.photos/200?random=2',
        school: '清华大学',
        college: '经济管理学院',
        major: '工商管理',
        grade: '2022',
        bio: '喜欢运动和旅行',
        role: 'student',
        isVerified: true
      },
      {
        username: 'student3',
        password: hashedPassword,
        nickname: '王五',
        avatar: 'https://picsum.photos/200?random=3',
        school: '清华大学',
        college: '美术学院',
        major: '视觉传达设计',
        grade: '2023',
        bio: '设计爱好者，喜欢摄影',
        role: 'student',
        isVerified: false
      },
      {
        username: 'teacher1',
        password: hashedPassword,
        nickname: '陈老师',
        avatar: 'https://picsum.photos/200?random=4',
        school: '清华大学',
        college: '计算机学院',
        major: '人工智能',
        bio: '计算机科学教授',
        role: 'teacher',
        isVerified: true
      }
    ];

    for (const userData of users) {
      await dataSource.query(
        `INSERT INTO users (username, password, nickname, avatar, school, college, major, grade, bio, role, "isVerified", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW())`,
        [
          userData.username,
          userData.password,
          userData.nickname,
          userData.avatar,
          userData.school,
          userData.college,
          userData.major,
          userData.grade || null,
          userData.bio,
          userData.role,
          userData.isVerified
        ]
      );
    }
    console.log('✅ 用户数据创建成功');

    // 获取创建的用户ID
    const userIds = await dataSource.query('SELECT id FROM users ORDER BY "createdAt"');

    // 创建帖子数据
    const posts = [
      {
        content: '今天学习了Vue3的Composition API，感觉比Options API更加灵活和强大。特别是在逻辑复用方面，使用composables可以很方便地抽取和共享逻辑。#前端 #Vue3 #技术分享',
        images: ['https://picsum.photos/400/300?random=10', 'https://picsum.photos/400/300?random=11'].join(','),
        category: 'study',
        tags: ['前端', 'Vue3', '技术分享'].join(','),
        location: '图书馆',
        authorId: userIds[0].id
      },
      {
        content: '今天天气真好，在图书馆旁边拍到了超美的夕阳。分享给大家～ #校园 #摄影 #日常',
        images: ['https://picsum.photos/400/300?random=12'].join(','),
        category: 'life',
        tags: ['校园', '摄影', '日常'].join(','),
        location: '图书馆',
        authorId: userIds[2].id
      },
      {
        content: '最近在准备面试，想系统学习一下数据结构和算法。有没有好的书籍或者视频课程推荐？求大佬指点！#学习 #算法 #求助',
        category: 'study',
        tags: ['学习', '算法', '求助'].join(','),
        authorId: userIds[1].id
      },
      {
        content: '周末组织了一场篮球赛，玩得很开心！运动使人快乐💪 #运动 #篮球 #周末',
        images: ['https://picsum.photos/400/300?random=13', 'https://picsum.photos/400/300?random=14'].join(','),
        category: 'activity',
        tags: ['运动', '篮球', '周末'].join(','),
        location: '体育馆',
        authorId: userIds[1].id
      }
    ];

    for (const post of posts) {
      await dataSource.query(
        `INSERT INTO posts (content, images, category, tags, location, "authorId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())`,
        [post.content, post.images, post.category, post.tags, post.location || null, post.authorId]
      );
    }
    console.log('✅ 帖子数据创建成功');

    // 创建资源数据
    const resources = [
      {
        title: '计算机网络课程笔记',
        description: '整理的计算机网络课程笔记，包含TCP/IP协议、HTTP协议等内容，适合期末复习使用',
        images: ['https://picsum.photos/400/300?random=15'].join(','),
        category: 'study',
        status: 'available',
        location: '图书馆',
        contact: '微信：student1',
        tags: ['计算机网络', '笔记', '课程'].join(','),
        authorId: userIds[0].id
      },
      {
        title: '高等数学习题集',
        description: '高等数学常见题型汇总，附带详细解答，九成新',
        images: ['https://picsum.photos/400/300?random=16'].join(','),
        price: 15.00,
        category: 'study',
        status: 'available',
        location: '宿舍楼A栋',
        contact: 'QQ：123456',
        tags: ['数学', '习题', '学习资料'].join(','),
        authorId: userIds[1].id
      },
      {
        title: '二手自行车出售',
        description: '捷安特山地车，骑了一年，车况良好，因毕业低价转让',
        images: ['https://picsum.photos/400/300?random=17', 'https://picsum.photos/400/300?random=18'].join(','),
        price: 300.00,
        category: 'secondhand',
        status: 'available',
        location: '东门',
        contact: '电话：13800138000',
        tags: ['自行车', '二手', '交通工具'].join(','),
        authorId: userIds[2].id
      },
      {
        title: '捡到校园卡一张',
        description: '在图书馆门口捡到校园卡，失主请联系认领',
        category: 'found',
        status: 'available',
        location: '图书馆门口',
        contact: '微信：student3',
        tags: ['失物招领', '校园卡'].join(','),
        authorId: userIds[2].id
      }
    ];

    for (const resource of resources) {
      await dataSource.query(
        `INSERT INTO resources (title, description, images, price, category, status, location, contact, tags, "authorId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
        [
          resource.title,
          resource.description,
          resource.images || null,
          resource.price || null,
          resource.category,
          resource.status,
          resource.location || null,
          resource.contact || null,
          resource.tags,
          resource.authorId
        ]
      );
    }
    console.log('✅ 资源数据创建成功');

    // 创建活动数据
    const activities = [
      {
        title: '周末篮球友谊赛',
        description: '本周六下午3点在体育馆举办篮球友谊赛，欢迎大家报名参加！需要有一定篮球基础，现场提供饮用水。',
        images: JSON.stringify(['https://picsum.photos/400/300?random=19']),
        location: '体育馆',
        startTime: new Date('2026-04-26 15:00:00'),
        endTime: new Date('2026-04-26 17:00:00'),
        maxParticipants: 20,
        category: 'sports',
        organizerId: userIds[1].id
      },
      {
        title: '前端技术分享会',
        description: '邀请业界大牛分享最新的前端技术趋势和实践经验，包括React、Vue3、TypeScript等热门技术栈。',
        images: JSON.stringify(['https://picsum.photos/400/300?random=20']),
        location: '教学楼A301',
        startTime: new Date('2026-04-25 19:00:00'),
        endTime: new Date('2026-04-25 21:00:00'),
        maxParticipants: 50,
        category: 'lecture',
        organizerId: userIds[3].id
      },
      {
        title: '校园音乐节',
        description: '一年一度的校园音乐节来啦！多个乐队现场演出，还有抽奖活动，不容错过！',
        images: JSON.stringify(['https://picsum.photos/400/300?random=21', 'https://picsum.photos/400/300?random=22']),
        location: '大礼堂',
        startTime: new Date('2026-05-01 18:00:00'),
        endTime: new Date('2026-05-01 21:00:00'),
        maxParticipants: 200,
        category: 'party',
        organizerId: userIds[2].id
      }
    ];

    for (const activity of activities) {
      await dataSource.query(
        `INSERT INTO activities (title, description, images, location, "startTime", "endTime", "maxParticipants", category, "organizerId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [
          activity.title,
          activity.description,
          activity.images || null,
          activity.location,
          activity.startTime,
          activity.endTime,
          activity.maxParticipants,
          activity.category,
          activity.organizerId
        ]
      );
    }
    console.log('✅ 活动数据创建成功');

    // 创建圈子数据
    const circles = [
      {
        name: '前端开发交流圈',
        description: '前端开发技术交流，分享学习心得和项目经验，欢迎所有对前端感兴趣的同学加入',
        avatar: 'https://picsum.photos/200?random=23',
        cover: 'https://picsum.photos/800/400?random=24',
        category: 'tech',
        tags: JSON.stringify(['前端', '技术', '交流']),
        creatorId: userIds[0].id
      },
      {
        name: '摄影爱好者',
        description: '分享摄影作品，交流摄影技巧，定期组织外拍活动',
        avatar: 'https://picsum.photos/200?random=25',
        cover: 'https://picsum.photos/800/400?random=26',
        category: 'art',
        tags: JSON.stringify(['摄影', '艺术', '爱好']),
        creatorId: userIds[2].id
      },
      {
        name: '篮球俱乐部',
        description: '热爱篮球的同学聚集地，每周组织球赛',
        avatar: 'https://picsum.photos/200?random=27',
        cover: 'https://picsum.photos/800/400?random=28',
        category: 'sports',
        tags: JSON.stringify(['篮球', '运动', '俱乐部']),
        creatorId: userIds[1].id
      },
      {
        name: '考研互助小组',
        description: '考研路上不孤单，一起学习，互相鼓励',
        avatar: 'https://picsum.photos/200?random=29',
        cover: 'https://picsum.photos/800/400?random=30',
        category: 'study',
        tags: JSON.stringify(['考研', '学习', '互助']),
        creatorId: userIds[3].id
      }
    ];

    for (const circle of circles) {
      await dataSource.query(
        `INSERT INTO circles (name, description, avatar, cover, category, tags, "creatorId", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())`,
        [circle.name, circle.description, circle.avatar, circle.cover || null, circle.category, circle.tags, circle.creatorId]
      );
    }
    console.log('✅ 圈子数据创建成功');

    console.log('\n🎉 所有测试数据创建完成！');
    console.log('\n测试账号信息：');
    console.log('用户名: student1, 密码: 123456');
    console.log('用户名: student2, 密码: 123456');
    console.log('用户名: student3, 密码: 123456');
    console.log('用户名: teacher1, 密码: 123456');

  } catch (error) {
    console.error('❌ 数据初始化失败:', error);
  } finally {
    await dataSource.destroy();
  }
}

seed();
