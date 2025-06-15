import { json } from '@sveltejs/kit';
import { prisma } from '$lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import type { RequestHandler } from './$types';

// 使用硬编码的JWT密钥，与start-simple.ps1中的保持一致
const JWT_SECRET = 'dream-home-super-secret-jwt-key-2024';

export const POST: RequestHandler = async ({ request }) => {
  try {
    const { account, accountType, code, password, nickname } = await request.json();

    // 验证输入
    if (!account || !accountType || !code || !password || !nickname) {
      return json(
        { message: '请填写所有必填字段' },
        { status: 400 }
      );
    }

    // 目前只支持邮箱注册
    if (accountType !== 'email') {
      return json(
        { message: '暂时只支持邮箱注册，手机号注册功能开发中' },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(account)) {
      return json(
        { message: '邮箱格式不正确' },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return json(
        { message: '密码长度不能少于6位' },
        { status: 400 }
      );
    }

    // 验证昵称长度
    if (nickname.length < 1 || nickname.length > 20) {
      return json(
        { message: '昵称长度必须在1-20字符之间' },
        { status: 400 }
      );
    }

    // 验证验证码（暂时简化处理）
    if (code !== '123456') {
      return json(
        { message: '验证码错误' },
        { status: 401 }
      );
    }

    // 检查邮箱是否已存在
    const existingUser = await prisma.user.findUnique({
      where: { email: account }
    });
    if (existingUser) {
      return json(
        { message: '该邮箱已被注册' },
        { status: 409 }
      );
    }

    // 加密密码
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 创建用户
    const newUser = await prisma.user.create({
      data: {
        email: account,
        name: nickname,
        password: hashedPassword
      }
    });

    // 生成JWT令牌
    const token = jwt.sign(
      { 
        userId: newUser.id, 
        email: newUser.email,
        name: newUser.name
      },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return json({
      message: '注册成功',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name
      }
    });

  } catch (error) {
    console.error('注册错误:', error);
    return json(
      { message: '服务器内部错误' },
      { status: 500 }
    );
  }
}; 