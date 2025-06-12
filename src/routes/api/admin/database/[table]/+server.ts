import { json } from '@sveltejs/kit';
import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ params }) => {
  try {
    const { table } = params;
    
    let data: any[] = [];
    
    switch (table) {
      case 'users':
        data = await prisma.user.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100
        });
        break;
        
      case 'orders':
        data = await prisma.order.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100
        });
        break;
        
      case 'creations':
        data = await prisma.creation.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100
        });
        break;
        
      case 'products':
        data = await prisma.product.findMany({
          orderBy: { createdAt: 'desc' }
        });
        break;
        
      case 'likes':
        data = await prisma.like.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100
        });
        break;
        
      case 'shares':
        data = await prisma.share.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100
        });
        break;
        
      case 'regionStats':
        data = await prisma.regionStats.findMany({
          orderBy: { createdAt: 'desc' },
          take: 100
        });
        break;
        
      default:
        return json({ error: '不支持的表名' }, { status: 400 });
    }
    
    return json(data);
  } catch (error) {
    console.error('查询数据库失败:', error);
    return json({ error: '查询数据库失败' }, { status: 500 });
  }
}; 