import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    // 获取订单统计数据
    const [
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({ where: { status: 'SHIPPED' } }),
      prisma.order.count({ where: { status: 'DELIVERED' } })
    ]);

    return json({
      totalOrders,
      pendingOrders,
      shippedOrders,
      deliveredOrders
    });
  } catch (error) {
    console.error('获取统计数据失败:', error);
    return json({ error: '获取统计数据失败' }, { status: 500 });
  }
} 