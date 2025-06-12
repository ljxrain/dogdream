import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('开始初始化数据库...');

  // 创建管理员用户
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@dreamhome.com' },
    update: {},
    create: {
      email: 'admin@dreamhome.com',
      name: '系统管理员',
      password: '$2b$10$hash_password_here', // 实际应用中需要哈希
      role: 'ADMIN',
      phone: '13800138000',
      city: '北京市',
      province: '北京'
    }
  });

  // 创建客服用户
  const customerServiceUser = await prisma.user.upsert({
    where: { email: 'service@dreamhome.com' },
    update: {},
    create: {
      email: 'service@dreamhome.com',
      name: '客服小丽',
      password: '$2b$10$hash_password_here',
      role: 'CUSTOMER_SERVICE',
      phone: '13800138001',
      city: '北京市',
      province: '北京'
    }
  });

  // 创建产品经理用户
  const productManagerUser = await prisma.user.upsert({
    where: { email: 'pm@dreamhome.com' },
    update: {},
    create: {
      email: 'pm@dreamhome.com',
      name: '产品经理小王',
      password: '$2b$10$hash_password_here',
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
      update: {},
      create: {
        email: 'user1@example.com',
        name: '张三',
        password: '$2b$10$hash_password_here',
        role: 'USER',
        phone: '13900139000',
        city: '深圳市',
        province: '广东省',
        address: '南山区科技园'
      }
    }),
    prisma.user.upsert({
      where: { email: 'user2@example.com' },
      update: {},
      create: {
        email: 'user2@example.com',
        name: '李四',
        password: '$2b$10$hash_password_here',
        role: 'USER',
        phone: '13900139001',
        city: '杭州市',
        province: '浙江省',
        address: '西湖区文三路'
      }
    })
  ]);

  console.log('用户创建完成:', { adminUser: adminUser.id, customerService: customerServiceUser.id, productManager: productManagerUser.id });

  // 创建产品信息
  const products = await Promise.all([
    prisma.product.upsert({
      where: { id: 'mug-001' },
      update: {},
      create: {
        id: 'mug-001',
        name: '定制马克杯',
        description: '高品质陶瓷马克杯，可印制个性化图案',
        category: 'mug',
        basePrice: 39.9,
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400'
      }
    }),
    prisma.product.upsert({
      where: { id: 'tshirt-001' },
      update: {},
      create: {
        id: 'tshirt-001',
        name: '定制T恤',
        description: '100%纯棉T恤，个性化印制',
        category: 'tshirt',
        basePrice: 89.0,
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'
      }
    }),
    prisma.product.upsert({
      where: { id: 'pillow-001' },
      update: {},
      create: {
        id: 'pillow-001',
        name: '定制抱枕',
        description: '舒适填充，双面印制',
        category: 'pillow',
        basePrice: 68.0,
        imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'
      }
    }),
    prisma.product.upsert({
      where: { id: 'keychain-001' },
      update: {},
      create: {
        id: 'keychain-001',
        name: '3D钥匙链',
        description: '3D打印个性化钥匙链',
        category: 'keychain',
        basePrice: 25.0,
        imageUrl: 'https://images.unsplash.com/photo-1602532305019-3dbbd482dae9?w=400'
      }
    }),
    prisma.product.upsert({
      where: { id: 'figurine-001' },
      update: {},
      create: {
        id: 'figurine-001',
        name: '3D车载玩偶',
        description: '车载个性化玩偶摆件',
        category: 'figurine',
        basePrice: 266.0,
        imageUrl: 'https://images.unsplash.com/photo-1631125915902-d8abe55ac012?w=400'
      }
    })
  ]);

  console.log('产品创建完成:', products.length, '个产品');

  // 创建示例创作作品
  const creations = await Promise.all([
    prisma.creation.create({
      data: {
        title: '我的小狗变超级英雄',
        description: '把我家的柴犬变成了超级英雄风格',
        sourceImageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
        resultImageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400',
        style: '超级英雄',
        quality: '高清',
        fastMode: false,
        status: 'COMPLETED',
        processingTime: 25,
        userId: normalUsers[0].id
      }
    }),
    prisma.creation.create({
      data: {
        title: '吉卜力风格的猫咪',
        description: '宫崎骏动画风格的可爱猫咪',
        sourceImageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400',
        resultImageUrl: 'https://images.unsplash.com/photo-1518794841-ab39d2e2bb35?w=400',
        style: '吉卜力风格',
        quality: '普通',
        fastMode: true,
        status: 'COMPLETED',
        processingTime: 15,
        userId: normalUsers[1].id
      }
    })
  ]);

  console.log('创作作品创建完成:', creations.length, '个作品');

  // 创建点赞和分享数据
  await Promise.all([
    prisma.like.create({
      data: {
        userId: normalUsers[1].id,
        creationId: creations[0].id
      }
    }),
    prisma.share.create({
      data: {
        platform: 'wechat',
        userId: normalUsers[0].id,
        creationId: creations[1].id
      }
    })
  ]);

  // 创建示例订单
  const orders = await Promise.all([
    prisma.order.create({
      data: {
        orderNumber: 'DH' + Date.now(),
        status: 'SHIPPED',
        totalAmount: 108.9,
        shippingFee: 8.0,
        recipientName: '张三',
        recipientPhone: '13900139000',
        shippingAddress: '南山区科技园123号',
        shippingCity: '深圳市',
        shippingProvince: '广东省',
        zipCode: '518000',
        userId: normalUsers[0].id,
        creationId: creations[0].id,
        paidAt: new Date(Date.now() - 86400000 * 2), // 2天前付款
        shippedAt: new Date(Date.now() - 86400000 * 1), // 1天前发货
        orderItems: {
          create: [
            {
              quantity: 1,
              unitPrice: 39.9,
              productId: products[0].id
            }
          ]
        }
      }
    }),
    prisma.order.create({
      data: {
        orderNumber: 'DH' + (Date.now() + 1),
        status: 'PROCESSING',
        totalAmount: 97.0,
        shippingFee: 8.0,
        recipientName: '李四',
        recipientPhone: '13900139001',
        shippingAddress: '西湖区文三路456号',
        shippingCity: '杭州市',
        shippingProvince: '浙江省',
        zipCode: '310000',
        userId: normalUsers[1].id,
        creationId: creations[1].id,
        paidAt: new Date(Date.now() - 86400000 * 1), // 1天前付款
        orderItems: {
          create: [
            {
              quantity: 1,
              unitPrice: 89.0,
              productId: products[1].id
            }
          ]
        }
      }
    })
  ]);

  console.log('订单创建完成:', orders.length, '个订单');

  // 创建物流信息
  await Promise.all([
    prisma.logistics.create({
      data: {
        trackingNumber: 'SF1234567890',
        carrier: '顺丰速运',
        status: '运输中',
        location: '深圳转运中心',
        description: '您的包裹正在运输中',
        orderId: orders[0].id
      }
    }),
    prisma.logistics.create({
      data: {
        trackingNumber: 'YT9876543210',
        carrier: '圆通速递',
        status: '已揽收',
        location: '杭州处理中心',
        description: '商家已发货，等待揽收',
        orderId: orders[1].id
      }
    })
  ]);

  // 创建地区统计数据
  const currentMonth = new Date().toISOString().slice(0, 7); // 格式: 2024-01
  await Promise.all([
    prisma.regionStats.upsert({
      where: {
        province_city_month: {
          province: '广东省',
          city: '深圳市',
          month: currentMonth
        }
      },
      update: {
        orderCount: 15,
        userCount: 8,
        totalRevenue: 1580.5
      },
      create: {
        province: '广东省',
        city: '深圳市',
        orderCount: 15,
        userCount: 8,
        totalRevenue: 1580.5,
        month: currentMonth
      }
    }),
    prisma.regionStats.upsert({
      where: {
        province_city_month: {
          province: '浙江省',
          city: '杭州市',
          month: currentMonth
        }
      },
      update: {
        orderCount: 12,
        userCount: 6,
        totalRevenue: 1200.0
      },
      create: {
        province: '浙江省',
        city: '杭州市',
        orderCount: 12,
        userCount: 6,
        totalRevenue: 1200.0,
        month: currentMonth
      }
    })
  ]);

  console.log('数据库初始化完成！');
}

main()
  .catch((e) => {
    console.error('数据库初始化失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 