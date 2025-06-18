const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 生成密码哈希
  const defaultPassword = await bcrypt.hash('123456', 10);
  console.log('生成的密码哈希:', defaultPassword);

  // 创建管理员用户
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dreamhome.com' },
    update: { password: defaultPassword }, // 更新密码
    create: {
      email: 'admin@dreamhome.com',
      name: '系统管理员',
      password: defaultPassword,
      role: 'ADMIN',
      phone: '13800138000',
      city: '北京市',
      province: '北京'
    }
  });

  // 创建客服用户
  const customerServiceUser = await prisma.user.upsert({
    where: { email: 'service@dreamhome.com' },
    update: { password: defaultPassword }, // 更新密码
    create: {
      email: 'service@dreamhome.com',
      name: '客服小丽',
      password: defaultPassword,
      role: 'CUSTOMER_SERVICE',
      phone: '13800138001',
      city: '北京市',
      province: '北京'
    }
  });

  // 创建产品经理用户
  const productManagerUser = await prisma.user.upsert({
    where: { email: 'pm@dreamhome.com' },
    update: { password: defaultPassword }, // 更新密码
    create: {
      email: 'pm@dreamhome.com',
      name: '产品经理小王',
      password: defaultPassword,
      role: 'PRODUCT_MANAGER',
      phone: '13800138002',
      city: '上海市',
      province: '上海'
    }
  });

  // 创建普通用户
  const normalUsers = await Promise.all([
    prisma.user.upsert({
      where: { email: 'user1@example.com' },
      update: { password: defaultPassword }, // 更新密码
      create: {
        email: 'user1@example.com',
        name: '张三',
        password: defaultPassword,
        role: 'USER',
        phone: '13900139000',
        city: '深圳市',
        province: '广东省',
        address: '南山区科技园'
      }
    }),
    prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: { password: defaultPassword }, // 更新密码
      create: {
        email: 'user2@example.com',
        name: '李四',
        password: defaultPassword,
        role: 'USER',
        phone: '13900139001',
        city: '杭州市',
        province: '浙江省',
        address: '西湖区文三路'
      }
    })
  ]);

  console.log('用户创建完成:', { 
    adminUser: adminUser.id, 
    customerService: customerServiceUser.id, 
    productManager: productManagerUser.id,
    normalUsers: normalUsers.map(u => u.id)
  });

  console.log('✅ 数据库初始化完成！所有用户密码都是: 123456');
}

main()
  .catch((e) => {
    console.error('❌ 数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 