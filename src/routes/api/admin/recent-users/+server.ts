import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

async function verifyAdmin(request: Request) {
  const authorization = request.headers.get('Authorization');
  
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return null;
  }

  try {
    const token = authorization.replace('Bearer ', '');
    const payload = jwt.verify(token, JWT_SECRET) as any;
    
    const user: any = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || user.role !== 'ADMIN') {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export const GET: RequestHandler = async ({ request }) => {
  try {
    // 验证管理员权限
    const admin = await verifyAdmin(request);
    if (!admin) {
      return json(
        { message: '无权限访问' },
        { status: 403 }
      );
    }

    // 获取最近注册的用户
    const recentUsers = await prisma.user.findMany({
      orderBy: {
        createdAt: 'desc'
      },
      take: 10,
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    return json(recentUsers);

  } catch (error) {
    console.error('获取最近用户错误:', error);
    return json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}; 