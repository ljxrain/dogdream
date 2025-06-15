import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';
import { verifyToken } from '$lib/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    // 验证用户身份
    const token = cookies.get('auth-token');
    if (!token) {
      return json({ success: false, error: '请先登录' }, { status: 401 });
    }

    const decoded = await verifyToken(token);
    if (!decoded) {
      return json({ success: false, error: '登录已过期' }, { status: 401 });
    }

    const { emojiUrl, emojiType, style } = await request.json();

    if (!emojiUrl || !emojiType || !style) {
      return json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 更新表情包记录为已保存状态
    await (prisma as any).emojiGeneration.updateMany({
      where: {
        userId: decoded.id,
        generatedEmoji: emojiUrl,
        emojiType: emojiType,
        style: style
      },
      data: {
        isSaved: true
      }
    });

    return json({
      success: true,
      message: '表情包已保存到作品库'
    });

  } catch (error) {
    console.error('保存表情包失败:', error);
    return json({
      success: false,
      error: error instanceof Error ? error.message : '保存失败'
    }, { status: 500 });
  }
}; 