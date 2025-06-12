import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function testConnection() {
  try {
    console.log('🔗 测试PostgreSQL连接...');
    
    // 测试数据库连接
    await prisma.$connect();
    console.log('✅ PostgreSQL连接成功！');
    
    // 创建测试用户
    const hashedPassword = await bcrypt.hash('admin123', 10);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'admin@dreamhome.com' },
      update: {},
      create: {
        email: 'admin@dreamhome.com',
        name: '管理员',
        password: hashedPassword,
        role: 'ADMIN'
      }
    });
    
    console.log('✅ 测试用户创建成功:', testUser.email);
    
    // 查询用户数量
    const userCount = await prisma.user.count();
    console.log(`📊 数据库中共有 ${userCount} 个用户`);
    
    console.log('🎉 PostgreSQL数据库切换完成！');
    console.log('🌐 访问: http://localhost:5173');
    console.log('👤 测试账户: admin@dreamhome.com / admin123');
    
  } catch (error) {
    console.error('❌ 数据库连接失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection(); 