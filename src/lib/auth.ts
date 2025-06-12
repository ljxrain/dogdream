import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from '$lib/prisma';

// 从环境变量获取JWT密钥
const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface UserPayload {
  id: string;
  email: string;
  name?: string;
  role: string;
}

// 生成JWT令牌
export function generateToken(user: UserPayload): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN } as any);
}

// 验证JWT令牌
export async function verifyToken(token: string): Promise<UserPayload | null> {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch (error) {
    console.error('JWT验证失败:', error);
    return null;
  }
}

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// 验证密码
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// 从数据库获取用户信息
export async function getUserById(id: string) {
  try {
    return await prisma.user.findUnique({
      where: { id }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return null;
  }
}

// 从数据库获取用户（含密码，用于登录验证）
export async function getUserByEmail(email: string) {
  try {
    return await prisma.user.findUnique({
      where: { email }
    });
  } catch (error) {
    console.error('获取用户失败:', error);
    return null;
  }
}

// 创建新用户
export async function createUser(userData: {
  email: string;
  password: string;
  name?: string;
  phone?: string;
}) {
  try {
    const hashedPassword = await hashPassword(userData.password);
    
    // 使用any类型暂时绕过类型检查
    const user = await (prisma.user as any).create({
      data: {
        email: userData.email,
        password: hashedPassword,
        name: userData.name || null,
        phone: userData.phone || null,
        role: 'USER'
      }
    });
    
    return user;
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}

// 更新用户信息
export async function updateUser(id: string, updateData: {
  name?: string;
  phone?: string;
  address?: string;
  city?: string;
  province?: string;
  avatarUrl?: string;
}) {
  try {
    return await (prisma.user as any).update({
      where: { id },
      data: updateData
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    throw error;
  }
}

// 验证用户权限
export function hasPermission(userRole: string, requiredRoles: string[]): boolean {
  return requiredRoles.includes(userRole);
}

// 邮箱格式验证
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// 密码强度验证
export function isValidPassword(password: string): boolean {
  // 至少8位，包含字母和数字
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
  return passwordRegex.test(password);
}

// 清理用户会话
export async function logout() {
  // 这里可以添加黑名单token的逻辑
  return true;
} 