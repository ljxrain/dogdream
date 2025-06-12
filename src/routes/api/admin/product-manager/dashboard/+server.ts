import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ url }) => {
  try {
    const range = url.searchParams.get('range') || '30d';
    
    // 计算时间范围
    const now = new Date();
    const daysAgo = range === '7d' ? 7 : range === '30d' ? 30 : 90;
    const startDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    // 获取概览数据
    const [
      totalUsers,
      totalCreations,
      totalOrders,
      totalRevenue
    ] = await Promise.all([
      prisma.user.count(),
      prisma.creation.count(),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { totalAmount: true }
      })
    ]);

    // 计算月增长率（简化版本）
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    const [lastMonthOrders, thisMonthOrders] = await Promise.all([
      prisma.order.count({
        where: {
          createdAt: {
            gte: lastMonthStart,
            lt: thisMonthStart
          }
        }
      }),
      prisma.order.count({
        where: {
          createdAt: {
            gte: thisMonthStart
          }
        }
      })
    ]);

    const monthlyGrowth = lastMonthOrders > 0 
      ? ((thisMonthOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : 0;

    // 获取热门创作风格
    const popularStyles = await prisma.creation.groupBy({
      by: ['style'],
      _count: {
        style: true
      },
      orderBy: {
        _count: {
          style: 'desc'
        }
      },
      take: 8
    });

    // 获取每日订单数据
    const dailyOrders = [];
    for (let i = daysAgo - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      
      const count = await prisma.order.count({
        where: {
          createdAt: {
            gte: dayStart,
            lt: dayEnd
          }
        }
      });
      
      dailyOrders.push({
        date: dayStart.toISOString().split('T')[0],
        count
      });
    }

    // 获取产品销售数据
    const productSales = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: {
        quantity: true,
        unitPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    });

    // 获取产品信息并组合数据
    const productSalesWithNames = await Promise.all(
      productSales.map(async (sale) => {
        const product = await prisma.product.findUnique({
          where: { id: sale.productId }
        });
        return {
          name: product?.name || '未知产品',
          sales: sale._sum.quantity || 0,
          revenue: sale._sum.unitPrice || 0
        };
      })
    );

    // 获取地区统计数据
    const regionStats = await prisma.regionStats.findMany({
      where: {
        month: now.toISOString().slice(0, 7) // 当前月份
      },
      orderBy: {
        totalRevenue: 'desc'
      },
      take: 20
    });

    // 组装返回数据
    const dashboardData = {
      overview: {
        totalUsers,
        totalCreations,
        totalOrders,
        totalRevenue: totalRevenue._sum.totalAmount || 0,
        monthlyGrowth
      },
      creationStats: {
        popularStyles: popularStyles.map(style => ({
          style: style.style,
          count: style._count.style,
          likes: Math.floor(Math.random() * 1000) // 模拟点赞数，实际应该从likes表获取
        })),
        dailyCreations: [], // 可以添加每日创作数据
        qualityDistribution: [] // 可以添加质量分布数据
      },
      orderStats: {
        dailyOrders,
        productSales: productSalesWithNames,
        regionStats: regionStats.map(region => ({
          province: region.province,
          city: region.city,
          userCount: region.userCount,
          orderCount: region.orderCount,
          totalRevenue: region.totalRevenue
        }))
      },
      userStats: {
        newUsers: [], // 可以添加新用户数据
        activeUsers: [], // 可以添加活跃用户数据
        userRetention: 85.5 // 模拟用户留存率
      }
    };

    return json(dashboardData);
  } catch (error) {
    console.error('获取仪表板数据失败:', error);
    return json({ error: '获取仪表板数据失败' }, { status: 500 });
  }
}; 