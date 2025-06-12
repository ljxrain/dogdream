import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    console.log('🚀 开始创建测试用户账户...\n');

    // 定义测试账户
    const testUsers = [
      {
        email: 'admin@dreamhome.com',
        password: 'admin123',
        name: '系统管理员',
        role: 'ADMIN'
      },
      {
        email: 'service@dreamhome.com', 
        password: 'service123',
        name: '客服专员',
        role: 'CUSTOMER_SERVICE'
      },
      {
        email: 'pm@dreamhome.com',
        password: 'pm123', 
        name: '产品经理',
        role: 'PRODUCT_MANAGER'
      }
    ];

    for (const userData of testUsers) {
      console.log(`🔄 处理用户: ${userData.email}`);
      
      // 检查用户是否已存在
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser) {
        console.log(`✅ 用户已存在: ${userData.name}`);
        // 更新密码（以防万一）
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await prisma.user.update({
          where: { email: userData.email },
          data: { password: hashedPassword }
        });
        console.log(`🔐 密码已更新`);
      } else {
        // 创建新用户
        const hashedPassword = await bcrypt.hash(userData.password, 12);
        await prisma.user.create({
          data: {
            email: userData.email,
            password: hashedPassword,
            name: userData.name,
            role: userData.role
          }
        });
        console.log(`🎉 用户已创建: ${userData.name}`);
      }
      console.log('---');
    }

    console.log('\n✅ 所有测试用户账户已就绪！');
    console.log('\n📋 登录信息:');
    testUsers.forEach(user => {
      console.log(`🏷️  ${user.name} (${user.role})`);
      console.log(`   邮箱: ${user.email}`);
      console.log(`   密码: ${user.password}`);
      console.log('');
    });

  } catch (error) {
    console.error('❌ 创建用户失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers(); 