import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import jwt from 'jsonwebtoken';
import type { RequestHandler } from './$types';

// 使用硬编码的JWT密钥，与start-simple.ps1中的保持一致
const JWT_SECRET = 'dream-home-super-secret-jwt-key-2024';

async function verifyAdmin(request: Request, cookies: any) {
  // 尝试从cookie或Authorization头获取token
  let token = cookies.get('auth-token');
  
  if (!token) {
    const authorization = request.headers.get('Authorization');
    if (authorization && authorization.startsWith('Bearer ')) {
      token = authorization.replace('Bearer ', '');
    }
  }
  
  if (!token) {
    return null;
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as any;
    
    const user: any = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user || !['ADMIN', 'PRODUCT_MANAGER', 'CUSTOMER_SERVICE'].includes(user.role)) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

export const GET: RequestHandler = async ({ request, cookies }) => {
  try {
    // 验证管理员权限
    const admin = await verifyAdmin(request, cookies);
    if (!admin) {
      return json(
        { message: '无权限访问' },
        { status: 403 }
      );
    }

    // 暂时返回空数组
    return json([]);

  } catch (error) {
    console.error('获取最近订单错误:', error);
    return json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}; 