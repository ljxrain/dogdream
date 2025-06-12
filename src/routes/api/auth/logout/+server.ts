import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
  try {
    // 清除auth-token cookie
    cookies.delete('auth-token', {
      path: '/'
    });

    return json({
      success: true,
      message: '登出成功'
    });

  } catch (error) {
    console.error('登出失败:', error);
    return json({ error: '登出失败' }, { status: 500 });
  }
}; 