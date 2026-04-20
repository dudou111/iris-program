import { DataSource } from 'typeorm';
import { typeOrmConfig } from '../config/typeorm.config';

async function resetDatabase() {
  const config = typeOrmConfig();
  const dataSource = new DataSource(config as any);

  try {
    await dataSource.initialize();
    console.log('数据库连接成功');

    // 删除所有表
    console.log('正在删除所有表...');

    await dataSource.query('DROP SCHEMA public CASCADE');
    await dataSource.query('CREATE SCHEMA public');
    await dataSource.query('GRANT ALL ON SCHEMA public TO postgres');
    await dataSource.query('GRANT ALL ON SCHEMA public TO public');

    console.log('✅ 所有表已删除');
    console.log('✅ 数据库已重置');
    console.log('\n请重启后端服务，TypeORM会自动创建新的表结构');
    console.log('然后运行: npm run seed 来创建测试数据');

  } catch (error) {
    console.error('❌ 数据库重置失败:', error);
  } finally {
    await dataSource.destroy();
  }
}

resetDatabase();
