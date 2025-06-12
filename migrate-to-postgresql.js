#!/usr/bin/env node

/**
 * PostgreSQL 迁移脚本
 * 将SQLite数据迁移到PostgreSQL数据库
 */

const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

// SQLite Prisma客户端
const sqlitePrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

async function migrateToPostgreSQL() {
  console.log('🚀 开始PostgreSQL迁移...');
  
  try {
    // 1. 检查SQLite数据库是否存在
    if (!fs.existsSync('./dev.db')) {
      console.log('❌ SQLite数据库不存在，无需迁移');
      return;
    }

    // 2. 导出SQLite数据
    console.log('📤 正在导出SQLite数据...');
    
    const users = await sqlitePrisma.user.findMany({
      include: {
        orders: true,
        creations: true,
        likes: true,
        shares: true
      }
    });
    
    const products = await sqlitePrisma.product.findMany({
      include: {
        orderItems: true
      }
    });
    
    const orders = await sqlitePrisma.order.findMany({
      include: {
        orderItems: true,
        logistics: true
      }
    });
    
    const creations = await sqlitePrisma.creation.findMany({
      include: {
        likes: true,
        shares: true
      }
    });

    // 3. 保存数据到JSON文件
    const migrationData = {
      users,
      products,
      orders,
      creations,
      timestamp: new Date().toISOString()
    };
    
    const backupPath = `./migration-backup-${Date.now()}.json`;
    fs.writeFileSync(backupPath, JSON.stringify(migrationData, null, 2));
    console.log(`✅ 数据已备份到: ${backupPath}`);
    
    // 4. 生成PostgreSQL迁移SQL
    const sqlPath = `./migration-${Date.now()}.sql`;
    let sql = `-- PostgreSQL 迁移脚本
-- 生成时间: ${new Date().toISOString()}

BEGIN;

-- 清空现有数据（如果存在）
TRUNCATE TABLE "users", "products", "orders", "creations", "order_items", "likes", "shares", "logistics", "statistics", "region_stats" CASCADE;

`;

    // 生成用户插入语句
    if (users.length > 0) {
      sql += `-- 插入用户数据\n`;
      for (const user of users) {
        sql += `INSERT INTO "users" (id, email, name, password, phone, address, city, province, "avatarUrl", role, "createdAt", "updatedAt") VALUES (
  '${user.id}', '${user.email}', ${user.name ? `'${user.name.replace(/'/g, "''")}'` : 'NULL'}, '${user.password}', 
  ${user.phone ? `'${user.phone}'` : 'NULL'}, ${user.address ? `'${user.address.replace(/'/g, "''")}'` : 'NULL'}, 
  ${user.city ? `'${user.city}'` : 'NULL'}, ${user.province ? `'${user.province}'` : 'NULL'}, 
  ${user.avatarUrl ? `'${user.avatarUrl}'` : 'NULL'}, '${user.role}', 
  '${user.createdAt.toISOString()}', '${user.updatedAt.toISOString()}'
);\n`;
      }
    }

    // 生成产品插入语句
    if (products.length > 0) {
      sql += `\n-- 插入产品数据\n`;
      for (const product of products) {
        sql += `INSERT INTO "products" (id, name, description, category, "basePrice", "imageUrl", "isActive", "createdAt", "updatedAt") VALUES (
  '${product.id}', '${product.name.replace(/'/g, "''")}', 
  ${product.description ? `'${product.description.replace(/'/g, "''")}'` : 'NULL'}, 
  '${product.category}', ${product.basePrice}, 
  ${product.imageUrl ? `'${product.imageUrl}'` : 'NULL'}, 
  ${product.isActive}, '${product.createdAt.toISOString()}', '${product.updatedAt.toISOString()}'
);\n`;
      }
    }

    sql += `\nCOMMIT;\n`;
    
    fs.writeFileSync(sqlPath, sql);
    console.log(`✅ PostgreSQL迁移SQL已生成: ${sqlPath}`);
    
    console.log('\n📋 迁移完成！下一步操作：');
    console.log('1. 配置PostgreSQL数据库连接');
    console.log('2. 更新prisma/schema.prisma为PostgreSQL');
    console.log('3. 运行: npx prisma db push');
    console.log(`4. 执行SQL文件: ${sqlPath}`);
    console.log('5. 运行: npm run dev');
    
  } catch (error) {
    console.error('❌ 迁移失败:', error);
  } finally {
    await sqlitePrisma.$disconnect();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  migrateToPostgreSQL();
}

module.exports = { migrateToPostgreSQL }; 