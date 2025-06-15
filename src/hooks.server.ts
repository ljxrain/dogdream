import type { Handle } from '@sveltejs/kit';
import { verifyToken } from '$lib/auth';
import { redirect } from '@sveltejs/kit';

// 需要登录的路由
const PROTECTED_ROUTES = [
  '/admin',
  '/dashboard',
  '/create',
  '/orders',
  '/my-works',
  '/me'
];

// 管理员路由及其所需角色
const ADMIN_ROUTES = {
  '/admin': ['ADMIN', 'CUSTOMER_SERVICE', 'PRODUCT_MANAGER'],
  '/admin/customer-service': ['ADMIN', 'CUSTOMER_SERVICE'],
  '/admin/product-manager': ['ADMIN', 'PRODUCT_MANAGER'],
  '/admin/super': ['ADMIN']
};

export const handle: Handle = async ({ event, resolve }) => {
  // 从cookie中获取token
  const token = event.cookies.get('auth-token');
  
  // 验证token并获取用户信息
  if (token) {
    try {
      const tokenPayload = await verifyToken(token);
      if (tokenPayload) {
        // 直接使用JWT中的用户信息（已经包含了所有必要的字段）
        event.locals.user = {
          id: tokenPayload.id,
          email: tokenPayload.email,
          name: tokenPayload.name,
          role: tokenPayload.role
        };
        console.log('🔐 服务端验证token成功:', tokenPayload.email, '角色:', tokenPayload.role);
      } else {
        console.log('❌ 服务端token验证失败: token无效');
        event.cookies.delete('auth-token', { path: '/' });
      }
    } catch (error) {
      // Token无效，清除cookie
      console.log('❌ 服务端token验证异常:', error);
      event.cookies.delete('auth-token', { path: '/' });
    }
  } else {
    console.log('🍪 服务端未找到auth-token cookie');
  }

  const { pathname } = event.url;

  // 检查是否需要登录
  const needsAuth = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  
  if (needsAuth && !event.locals.user) {
    // 如果是API请求，返回401
    if (pathname.startsWith('/api/')) {
      return new Response(JSON.stringify({ error: '未授权访问' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    // 重定向到登录页面
    throw redirect(302, `/login?redirect=${encodeURIComponent(pathname)}`);
  }

  // 检查管理员权限
  for (const [route, allowedRoles] of Object.entries(ADMIN_ROUTES)) {
    if (pathname.startsWith(route)) {
      if (!event.locals.user) {
        throw redirect(302, `/login?redirect=${encodeURIComponent(pathname)}`);
      }
      
      if (!allowedRoles.includes(event.locals.user.role)) {
        // 权限不足，重定向到首页或显示错误页面
        if (pathname.startsWith('/api/')) {
          return new Response(JSON.stringify({ error: '权限不足' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        throw redirect(302, '/?error=insufficient-permissions');
      }
      break;
    }
  }

  // 继续处理请求
  const response = await resolve(event);
  return response;
}; 