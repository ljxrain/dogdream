import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import jwt from 'jsonwebtoken';
import type { RequestHandler } from './$types';

// 使用硬编码的JWT密钥，与start-simple.ps1中的保持一致
const JWT_SECRET = 'dream-home-super-secret-jwt-key-2024';

export const GET: RequestHandler = async ({ cookies, request }) => {
  try {
    // 尝试从cookie或Authorization头获取token
    let token = cookies.get('auth-token');
    let tokenSource = 'cookie';
    
    if (!token) {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.substring(7);
        tokenSource = 'header';
      }
    }
    
    console.log('🔍 API /auth/me - token来源:', tokenSource, 'token存在:', !!token);
    
    if (!token) {
      console.log('❌ API /auth/me - 未提供认证令牌');
      return json(
        { message: '未提供认证令牌' },
        { status: 401 }
      );
    }
    
    // 验证JWT令牌
    const payload = jwt.verify(token, JWT_SECRET) as any;
    console.log('✅ API /auth/me - JWT验证成功，用户ID:', payload.id);
    
    // 从数据库获取用户信息
    const user = await prisma.user.findUnique({
      where: { id: payload.id }
    });

    if (!user) {
      console.log('❌ API /auth/me - 用户不存在，ID:', payload.id);
      return json(
        { message: '用户不存在' },
        { status: 404 }
      );
    }

    console.log('✅ API /auth/me - 返回用户信息:', user.email);
    
    // 返回安全的用户信息（不包含密码）
    const { password, ...safeUser } = user;
    return json(safeUser);

  } catch (error) {
    console.error('❌ API /auth/me - 获取用户信息错误:', error);
    return json(
      { message: '认证令牌无效' },
      { status: 401 }
    );
  }
}; 