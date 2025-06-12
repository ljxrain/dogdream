import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAllPasswords() {
  try {
    console.log('🔍 检查所有账户密码...\n');
    
    // 预期的账户和密码
    const expectedAccounts = [
      { email: 'admin@dreamhome.com', password: 'admin123', role: 'ADMIN' },
      { email: 'service@dreamhome.com', password: 'service123', role: 'CUSTOMER_SERVICE' },
      { email: 'pm@dreamhome.com', password: 'pm123', role: 'PRODUCT_MANAGER' }
    ];

    for (const account of expectedAccounts) {
      console.log(`\n🔍 检查 ${account.email}...`);
      
      const user = await prisma.user.findFirst({
        where: { email: account.email }
      });

      if (user) {
        console.log(`✅ 找到用户: ${user.name}`);
        console.log(`🎭 角色: ${user.role}`);
        
        // 测试密码
        const isMatch = await bcrypt.compare(account.password, user.password);
        
        if (isMatch) {
          console.log(`🔐 密码 "${account.password}": ✅ 正确`);
        } else {
          console.log(`🔐 密码 "${account.password}": ❌ 错误`);
          
          // 测试其他可能的密码
          const testPasswords = ['123456', 'password', 'admin', 'service', 'pm'];
          for (const testPwd of testPasswords) {
            const testMatch = await bcrypt.compare(testPwd, user.password);
            if (testMatch) {
              console.log(`🔐 实际密码可能是: "${testPwd}" ✅`);
              break;
            }
          }
        }
      } else {
        console.log(`❌ 未找到账户: ${account.email}`);
      }
      
      console.log('---');
    }

  } catch (error) {
    console.error('❌ 错误:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllPasswords(); 