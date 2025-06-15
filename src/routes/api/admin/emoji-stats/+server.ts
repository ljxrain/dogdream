import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';
import { verifyToken } from '$lib/auth';

export const GET: RequestHandler = async ({ request, cookies, url }) => {
  try {
    // 验证管理员权限
    const token = cookies.get('auth-token');
    if (!token) {
      return json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return json({ success: false, error: '权限不足' }, { status: 403 });
    }

    const range = url.searchParams.get('range') || '7d';
    const metric = url.searchParams.get('metric') || 'generations';

    // 计算时间范围
    const now = new Date();
    let startDate: Date;
    
    switch (range) {
      case '1d':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // 获取总生成数
    const totalGenerations = await (prisma as any).emojiGeneration.count();

    // 获取今日生成数
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayGenerations = await (prisma as any).emojiGeneration.count({
      where: {
        createdAt: {
          gte: todayStart
        }
      }
    });

    // 获取本周生成数
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const weeklyGenerations = await (prisma as any).emojiGeneration.count({
      where: {
        createdAt: {
          gte: weekStart
        }
      }
    });

    // 获取本月生成数
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthlyGenerations = await (prisma as any).emojiGeneration.count({
      where: {
        createdAt: {
          gte: monthStart
        }
      }
    });

    // 获取热门表情包类型
    const topEmojiTypes = await (prisma as any).emojiGeneration.groupBy({
      by: ['emojiType'],
      _count: {
        emojiType: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        _count: {
          emojiType: 'desc'
        }
      },
      take: 5
    });

    // 获取热门制作风格
    const topStyles = await (prisma as any).emojiGeneration.groupBy({
      by: ['style'],
      _count: {
        style: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        _count: {
          style: 'desc'
        }
      },
      take: 4
    });

    // 计算风格占比
    const totalStyleCount = topStyles.reduce((sum: number, style: any) => sum + style._count.style, 0);
    const formattedStyles = topStyles.map((style: any) => ({
      name: style.style,
      count: style._count.style,
      percentage: totalStyleCount > 0 ? Math.round((style._count.style / totalStyleCount) * 100) : 0
    }));

    // 获取用户活跃度统计
    const userStats = await (prisma as any).emojiGeneration.groupBy({
      by: ['userId'],
      _count: {
        userId: true
      },
      where: {
        createdAt: {
          gte: startDate
        }
      },
      orderBy: {
        _count: {
          userId: 'desc'
        }
      },
      take: 10
    });

    // 获取用户详细信息
    const userIds = userStats.map((stat: any) => stat.userId);
    const users = await prisma.user.findMany({
      where: {
        id: {
          in: userIds
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        updatedAt: true
      }
    });

    const formattedUserStats = userStats.map((stat: any) => {
      const user = users.find(u => u.id === stat.userId);
      return {
        name: user?.name,
        email: user?.email,
        generationCount: stat._count.userId,
        lastActive: user?.updatedAt ? new Date(user.updatedAt).toLocaleDateString('zh-CN') : '未知'
      };
    });

    // 获取每日趋势数据
    const dailyTrend = [];
    const days = range === '1d' ? 1 : range === '7d' ? 7 : range === '30d' ? 30 : 90;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const dayGenerations = await (prisma as any).emojiGeneration.count({
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        }
      });

      // 获取当天最热门的类型和风格
      const dayTopType = await (prisma as any).emojiGeneration.groupBy({
        by: ['emojiType'],
        _count: {
          emojiType: true
        },
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        },
        orderBy: {
          _count: {
            emojiType: 'desc'
          }
        },
        take: 1
      });

      const dayTopStyle = await (prisma as any).emojiGeneration.groupBy({
        by: ['style'],
        _count: {
          style: true
        },
        where: {
          createdAt: {
            gte: date,
            lt: nextDate
          }
        },
        orderBy: {
          _count: {
            style: 'desc'
          }
        },
        take: 1
      });

      dailyTrend.push({
        date: date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        generations: dayGenerations,
        users: 0, // 可以后续添加每日活跃用户统计
        topType: dayTopType[0]?.emojiType || '无',
        topStyle: dayTopStyle[0]?.style || '无'
      });
    }

    return json({
      success: true,
      totalGenerations,
      todayGenerations,
      weeklyGenerations,
      monthlyGenerations,
      topEmojiTypes: topEmojiTypes.map((type: any) => ({
        name: type.emojiType,
        count: type._count.emojiType
      })),
      topStyles: formattedStyles,
      userStats: formattedUserStats,
      dailyTrend,
      loading: false
    });

  } catch (error) {
    console.error('获取表情包统计数据失败:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : '获取统计数据失败'
    }, { status: 500 });
  }
}; 