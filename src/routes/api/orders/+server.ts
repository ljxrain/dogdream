import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';

// 获取用户订单列表
export const GET: RequestHandler = async ({ request, url }) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: '未提供认证令牌' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const status = url.searchParams.get('status');

    const where: any = { userId: decoded.userId };
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
    return json({ error: '获取订单列表失败' }, { status: 500 });
  }
};

// 创建新订单
export const POST: RequestHandler = async ({ request }) => {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return json({ error: '未提供认证令牌' }, { status: 401 });
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

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
        userId: decoded.userId,
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
    return json({ error: '创建订单失败' }, { status: 500 });
  }
}; 