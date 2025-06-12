import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetPMPassword() {
  try {
    console.log('🔐 重置产品经理密码...\n');
    
    // 查找产品经理账户
    const pmUser = await prisma.user.findFirst({
      where: {
        email: 'pm@dreamhome.com'
      }
    });

    if (!pmUser) {
      console.log('❌ 没有找到产品经理账户!');
      return;
    }

    console.log(`✅ 找到产品经理账户: ${pmUser.email}`);
    console.log(`当前姓名: ${pmUser.name}`);
    console.log(`当前角色: ${pmUser.role}`);

    // 生成新密码哈希
    const newPassword = 'pm123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    console.log(`\n🔄 生成新密码哈希: ${hashedPassword.substring(0, 30)}...`);

    // 更新密码和姓名（修复乱码）
    const updatedUser = await prisma.user.update({
      where: {
        email: 'pm@dreamhome.com'
      },
      data: {
        password: hashedPassword,
        name: '产品经理', // 修复乱码姓名
        updatedAt: new Date()
      }
    });

    console.log('✅ 密码重置成功!');
    console.log(`更新后姓名: ${updatedUser.name}`);

    // 验证新密码
    console.log('\n🔐 验证新密码...');
    const isMatch = await bcrypt.compare(newPassword, updatedUser.password);
    console.log(`密码 "${newPassword}": ${isMatch ? '✅ 正确' : '❌ 错误'}`);

    if (isMatch) {
      console.log('\n🎉 产品经理账户已修复！');
      console.log('📧 邮箱: pm@dreamhome.com');
      console.log('🔐 密码: pm123');
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

resetPMPassword(); 