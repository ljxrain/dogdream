import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';
import jwt from 'jsonwebtoken';

// 使用硬编码的JWT密钥，与start-simple.ps1中的保持一致
const JWT_SECRET = 'dream-home-super-secret-jwt-key-2024';

// 验证用户认证的辅助函数
async function verifyAuth(request: Request) {
  // 优先检查cookie中的token
  const cookies = request.headers.get('cookie');
  let token = null;
  
  if (cookies) {
    const authCookie = cookies.split(';').find(c => c.trim().startsWith('auth-token='));
    if (authCookie) {
      token = authCookie.split('=')[1];
    }
  }
  
  // 如果cookie中没有token，检查Authorization头
  if (!token) {
    const authHeader = request.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }
  
  if (!token) {
    throw new Error('未提供认证令牌');
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; userId?: string };
    // 兼容不同的JWT payload格式
    const userId = decoded.id || decoded.userId;
    if (!userId) {
      throw new Error('无效的token格式');
    }
    return userId;
  } catch (error) {
    throw new Error('无效的认证令牌');
  }
}

// 获取用户订单列表
export const GET: RequestHandler = async ({ request, url }) => {
  try {
    const userId = await verifyAuth(request);

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          orderItems: {
            include: {
              product: true
            }
          },
          logistics: {
            orderBy: {
              createdAt: 'desc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.order.count({ where })
    ]);

    return json({
      success: true,
      data: {
        orders,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('获取订单列表失败:', error);
    if (error instanceof Error && error.message.includes('认证')) {
      return json({ error: error.message }, { status: 401 });
    }
    return json({ error: '获取订单列表失败' }, { status: 500 });
  }
};

// 创建新订单
export const POST: RequestHandler = async ({ request }) => {
  try {
    const userId = await verifyAuth(request);

    const {
      productName,
      productPrice,
      petImageUrl,
      customPreviewUrl,
      recipientName,
      recipientPhone,
      shippingAddress,
      shippingCity,
      shippingProvince,
      zipCode,
      customNotes
    } = await request.json();

    // 验证必填字段
    if (!productName || !productPrice || !petImageUrl || !recipientName || !recipientPhone || !shippingAddress) {
      return json({ error: '缺少必填字段' }, { status: 400 });
    }

    // 生成订单号
    const orderNumber = 'PET' + Date.now() + Math.random().toString(36).substr(2, 4).toUpperCase();

    // 计算总金额
    const shippingFee = 10;
    const totalAmount = productPrice + shippingFee;

    // 创建订单
    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: 'PENDING',
        totalAmount,
        shippingFee,
        recipientName,
        recipientPhone,
        shippingAddress,
        shippingCity,
        shippingProvince,
        zipCode,
        petImageUrl,
        productName,
        customPreviewUrl,
        customNotes,
        userId,
        orderItems: {
          create: {
            quantity: 1,
            unitPrice: productPrice,
            product: {
              create: {
                name: productName,
                description: `宠物定制${productName}`,
                category: 'PET_CUSTOM',
                basePrice: productPrice,
                isActive: true
              }
            }
          }
        },
        logistics: {
          create: {
            status: 'ORDER_CREATED',
            description: '订单已创建，等待处理',
            location: '订单处理中心'
          }
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        logistics: true
      }
    });

    // 模拟订单处理进度更新
    setTimeout(async () => {
      try {
        await prisma.logistics.create({
          data: {
            orderId: order.id,
            status: 'PROCESSING',
            description: '开始制作您的定制商品',
            location: '生产车间'
          }
        });

        await prisma.order.update({
          where: { id: order.id },
          data: { status: 'PROCESSING' }
        });
      } catch (error) {
        console.error('更新订单状态失败:', error);
      }
    }, 5000);

    return json({
      success: true,
      message: '订单创建成功',
      data: {
        order,
        orderNumber
      }
    });

  } catch (error) {
    console.error('创建订单失败:', error);
    if (error instanceof Error && error.message.includes('认证')) {
      return json({ error: error.message }, { status: 401 });
    }
    return json({ error: '创建订单失败' }, { status: 500 });
  }
}; 