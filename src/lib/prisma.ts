import { PrismaClient } from '@prisma/client';
import { dev } from '$app/environment';

// 创建全局Prisma客户端实例
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: dev ? ['query', 'error', 'warn'] : ['error'],
});

if (dev) globalForPrisma.prisma = prisma; 