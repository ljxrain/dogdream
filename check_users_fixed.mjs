import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 检查数据库中的用户...\n');
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    });

    console.log(`找到 ${users.length} 个用户:`);
    users.forEach(user => {
      console.log(`📧 邮箱: ${user.email}`);
      console.log(`👤 姓名: ${user.name || '未设置'}`);
      console.log(`🎭 角色: ${user.role}`);
      console.log(`🔐 密码哈希: ${user.password.substring(0, 30)}...`);
      console.log('---');
    });

    // 特别检查产品经理账户
    console.log('\n🔍 检查产品经理账户...');
    const pmUser = await prisma.user.findFirst({
      where: {
        email: 'pm@dreamhome.com'
      }
    });

    if (pmUser) {
      console.log('✅ 找到产品经理账户:');
      console.log(`📧 邮箱: ${pmUser.email}`);
      console.log(`👤 姓名: ${pmUser.name}`);
      console.log(`🎭 角色: ${pmUser.role}`);
      
      // 测试密码验证
      console.log('\n🔐 测试密码验证...');
      const testPasswords = ['pm123', 'admin123', 'service123', '123456'];
      
      for (const testPwd of testPasswords) {
        const isMatch = await bcrypt.compare(testPwd, pmUser.password);
        console.log(`密码 "${testPwd}": ${isMatch ? '✅ 正确' : '❌ 错误'}`);
      }
    } else {
      console.log('❌ 没有找到产品经理账户!');
      
      // 搜索所有包含pm的邮箱
      const pmUsers = await prisma.user.findMany({
        where: {
          OR: [
            { email: { contains: 'pm' } },
            { email: { contains: 'product' } },
            { role: { contains: 'PRODUCT' } }
          ]
        }
      });
      
      console.log('搜索相关账户:', pmUsers);
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 