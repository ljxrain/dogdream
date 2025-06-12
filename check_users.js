const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function checkUsers() {
  try {
    console.log('🔍 检查数据库中的用户...\n');
    
    const users = await prisma.users.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    });

    console.log('找到的用户:');
    users.forEach(user => {
      console.log(`📧 邮箱: ${user.email}`);
      console.log(`👤 姓名: ${user.name}`);
      console.log(`🎭 角色: ${user.role}`);
      console.log(`🔐 密码哈希: ${user.password.substring(0, 20)}...`);
      console.log('---');
    });

    // 特别检查产品经理账户
    console.log('\n🔍 检查产品经理账户...');
    const pmUser = await prisma.users.findFirst({
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
      const testPasswords = ['pm123', 'admin123', 'service123'];
      
      for (const testPwd of testPasswords) {
        const isMatch = await bcrypt.compare(testPwd, pmUser.password);
        console.log(`密码 "${testPwd}": ${isMatch ? '✅ 正确' : '❌ 错误'}`);
      }
    } else {
      console.log('❌ 没有找到产品经理账户!');
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUsers(); 