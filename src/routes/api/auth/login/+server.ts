import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RequestHandler } from './$types';

// 使用硬编码的JWT密钥，与start-simple.ps1中的保持一致
const JWT_SECRET = 'dream-home-super-secret-jwt-key-2024';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    console.log('🔍 登录API被调用');
    
    // 获取请求体文本
    const requestText = await request.text();
    console.log('📝 请求体内容:', requestText);
    
    // 解析JSON
    let requestData;
    try {
      requestData = JSON.parse(requestText);
    } catch (parseError) {
      console.error('❌ JSON解析错误:', parseError);
      return json(
        { message: 'JSON格式错误' },
        { status: 400 }
      );
    }
    
    const { account, accountType, loginType, code, password } = requestData;

    // 验证输入
    if (!account || !accountType) {
      return json(
        { message: '请输入有效的手机号或邮箱' },
        { status: 400 }
      );
    }

    // 验证账号格式
    if (accountType === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(account)) {
        return json(
          { message: '邮箱格式不正确' },
          { status: 400 }
        );
      }
    } else if (accountType === 'phone') {
      const phoneRegex = /^1[3-9]\d{9}$/;
      if (!phoneRegex.test(account)) {
        return json(
          { message: '手机号格式不正确' },
          { status: 400 }
        );
      }
    }

    // 根据账号类型查找用户
    let user: any;
    if (accountType === 'email') {
      user = await prisma.user.findUnique({
        where: { email: account }
      });
    } else {
      // 手机号功能暂时不支持，因为数据库中phone字段没有唯一索引
      return json(
        { message: '手机号登录功能开发中，请使用邮箱登录' },
        { status: 400 }
      );
    }

    if (!user) {
      return json(
        { message: '用户不存在，请先注册' },
        { status: 404 }
      );
    }

    // 验证登录方式
    if (loginType === 'password') {
      if (!password) {
        return json(
          { message: '请输入密码' },
          { status: 400 }
        );
      }

      // 验证密码
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return json(
          { message: '密码错误' },
          { status: 401 }
        );
      }
    } else if (loginType === 'code') {
      if (!code) {
        return json(
          { message: '请输入验证码' },
          { status: 400 }
        );
      }

      // 这里应该验证验证码，暂时简化处理
      if (code !== '123456') {
        return json(
          { message: '验证码错误' },
          { status: 401 }
        );
      }
    } else {
      return json(
        { message: '不支持的登录方式' },
        { status: 400 }
      );
    }

    // 生成JWT令牌（包含role信息）
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 设置cookie到响应头
    cookies.set('auth-token', token, {
      httpOnly: false, // 允许客户端JavaScript访问
      secure: false, // 在HTTP环境下也能工作
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7天
      path: '/'
    });

    console.log('🍪 服务端设置auth-token cookie成功');

    // 更新最后更新时间
    await prisma.user.update({
      where: { id: user.id },
      data: { updatedAt: new Date() }
    });

    return json({
      message: '登录成功',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('登录错误:', error);
    return json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}; 