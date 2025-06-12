import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ request }) => {
  try {
    const authorization = request.headers.get('Authorization');
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return json(
        { message: '未提供认证令牌' },
        { status: 401 }
      );
    }

    const token = authorization.replace('Bearer ', '');
    
    // 验证JWT令牌
    const payload = jwt.verify(token, JWT_SECRET) as any;
    
    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user) {
      return json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    // 返回安全的用户信息（不包含密码）
    const { password, ...safeUser } = user;
    return json(safeUser);

  } catch (error) {
    console.error('获取用户信息错误:', error);
    return json(
      { message: '认证令牌无效' },
      { status: 401 }
    );
  }
}; 