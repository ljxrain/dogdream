import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ url }) => {
  try {
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');
    const search = url.searchParams.get('search');

    let whereClause: any = {};
    
    if (search) {
      whereClause = {
        OR: [
          { orderNumber: { contains: search } },
          { recipientName: { contains: search } },
          { recipientPhone: { contains: search } },
          { user: { email: { contains: search } } }
        ]
      };
    }

    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        orderItems: {
          include: {
            product: true
          }
        },
        creation: {
          select: {
            id: true,
            title: true,
            style: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    return json(orders);
  } catch (error) {
    console.error('获取订单列表失败:', error);
    return json({ error: '获取订单列表失败' }, { status: 500 });
  }
}; 