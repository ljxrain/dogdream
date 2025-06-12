import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { account, accountType, loginType, code, password } = await request.json();

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
        userId: user.id, 
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

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