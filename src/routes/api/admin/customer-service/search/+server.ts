import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ url }) => {
  try {
    const type = url.searchParams.get('type') || 'order';
    const query = url.searchParams.get('query') || '';

    if (!query.trim()) {
      return json([]);
    }

    switch (type) {
      case 'order':
        const orders = await prisma.order.findMany({
          where: {
            OR: [
              { orderNumber: { contains: query } },
              { recipientName: { contains: query } },
              { recipientPhone: { contains: query } },
              { user: { email: { contains: query } } },
              { user: { name: { contains: query } } }
            ]
          },
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
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 50
        });
        return json(orders);

      case 'user':
        const users = await prisma.user.findMany({
          where: {
            OR: [
              { email: { contains: query } },
              { name: { contains: query } },
              { phone: { contains: query } }
            ]
          },
          include: {
            orders: {
              select: {
                id: true,
                orderNumber: true,
                status: true,
                totalAmount: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            },
            creations: {
              select: {
                id: true,
                title: true,
                style: true,
                createdAt: true
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            }
          },
          take: 20
        });
        return json(users);

      case 'tracking':
        const logistics = await prisma.logistics.findMany({
          where: {
            OR: [
              { trackingNumber: { contains: query } },
              { carrier: { contains: query } }
            ]
          },
          include: {
            order: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 20
        });
        return json(logistics);

      default:
        return json({ error: '不支持的搜索类型' }, { status: 400 });
    }
  } catch (error) {
    console.error('搜索失败:', error);
    return json({ error: '搜索失败' }, { status: 500 });
  }
}; 