import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { prisma } from '$lib/prisma';
import { verifyToken } from '$lib/auth';

// 豆包API配置 - 与照片圆梦保持一致
const DOUBAO_CONFIG = {
  chatApiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  imageGenApiUrl: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
  apiKey: '97e3922f-c817-47d3-8690-6a940a06081f',
  visionModel: 'ep-20250609024414-fwnn2', // 图片分析接入点ID
  imageGenModel: 'ep-m-20250609014544-4xckt' // 文生图接入点ID
};

// 表情包类型对应的提示词
const EMOJI_TYPE_PROMPTS: { [key: string]: string } = {
  '情感表达': '情感丰富的表情包，能够清晰表达开心、愤怒、悲伤等各种情感',
  '问候交流': '用于日常问候和交流的表情包，包含打招呼、告别、感谢等场景',
  '生活状态': '展现日常生活状态的表情包，如吃饭、睡觉、工作、运动等',
  '互动回应': '用于互动回应的表情包，包含点赞、鼓掌、比心等积极反馈',
  '搞笑娱乐': '幽默搞笑的表情包，能够带来欢乐和娱乐效果',
  '节日庆祝': '节日庆祝主题的表情包，适用于春节、生日、情人节等特殊场合',
  '职场商务': '适用于职场和商务场景的表情包，包含握手、工作等正式场合',
  '语气辅助': '辅助表达语气的表情包，包含疑问、强调、无奈等语气表达'
};

// 风格对应的提示词
const STYLE_PROMPTS: { [key: string]: string } = {
  '卡通风格': '可爱的卡通风格，色彩鲜艳，线条简洁',
  '真实风格': '真实照片风格，自然逼真的效果',
  '手绘风格': '手绘插画风格，具有艺术感和创意性',
  '像素风格': '复古像素风格，具有怀旧感和游戏感'
};

// 完全复制照片圆梦的Vision分析函数
async function analyzeImageWithVision(imageUrl: string, emojiType: string): Promise<{success: boolean, analysis?: string, error?: string}> {
  try {
    console.log('正在分析图片...');
    
    // 设置请求超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    const response = await fetch(DOUBAO_CONFIG.chatApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DOUBAO_CONFIG.visionModel,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: `分析图片用于制作${emojiType}表情包。重点描述：1)主体是什么(人/动物/物品) 2)表情和情绪状态 3)主要颜色 4)特征动作或姿态。简洁描述，突出表情包制作要点。`
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 300,
        temperature: 0.3
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vision API错误:', response.status, errorText);
      return { success: false, error: `Vision API错误: ${response.status}` };
    }

    const data = await response.json();
    const analysis = data.choices?.[0]?.message?.content;
    
    if (!analysis) {
      return { success: false, error: 'Vision API未返回分析结果' };
    }

    console.log('图片分析完成');
    return { success: true, analysis };

  } catch (error) {
    console.error('Vision分析错误:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: '图片分析超时，请重试' };
    }
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}

// 完全复制照片圆梦的文生图函数
async function generateImageFromPrompt(prompt: string): Promise<{success: boolean, imageData?: string, error?: string}> {
  try {
    console.log('正在生成表情包...');
    
    // 设置请求超时
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000);

    const response = await fetch(DOUBAO_CONFIG.imageGenApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: DOUBAO_CONFIG.imageGenModel,
        prompt: prompt,
        n: 1,
        size: '512x512', // 表情包标准正方形尺寸
        response_format: 'url',
        quality: 'standard',
        style: 'vivid' // 增强色彩和对比度，更适合表情包
      })
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('文生图API错误:', response.status, errorText);
      return { success: false, error: `文生图API错误: ${response.status}` };
    }

    const data = await response.json();
    const imageUrl = data.data?.[0]?.url;
    
    if (!imageUrl) {
      return { success: false, error: '文生图API未返回图片URL' };
    }

    console.log('表情包生成完成');
    return { success: true, imageData: imageUrl };

  } catch (error) {
    console.error('文生图生成错误:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: '图片生成超时，请重试' };
    }
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}

// 生成表情包的prompt
function generateEmojiPrompt(analysis: string, emojiType: string, style: string, userDescription: string): string {
  const emojiPrompts: Record<string, string> = {
    '情感表达': 'expressive emoji sticker showing clear emotions like happy, sad, angry, surprised, with text like "开心", "难过", "生气", "惊讶"',
    '问候交流': 'greeting emoji sticker with waving, hello gestures, friendly expressions, with text like "你好", "再见", "谢谢", "早安"',
    '生活状态': 'daily life emoji sticker showing eating, sleeping, working, exercising activities, with text like "吃饭", "睡觉", "工作", "运动"',
    '互动回应': 'reaction emoji sticker with thumbs up, clapping, heart gestures, positive responses, with text like "赞", "棒", "爱你", "好的"',
    '搞笑娱乐': 'funny meme emoji sticker, humorous expressions, comedy poses, with text like "哈哈", "笑死", "搞笑", "逗比"',
    '节日庆祝': 'festive emoji sticker for holidays, celebrations, party themes, with text like "新年快乐", "生日快乐", "恭喜", "庆祝"',
    '职场商务': 'professional emoji sticker for work, business meetings, office scenarios, with text like "加油", "努力", "会议", "工作"',
    '语气辅助': 'tone emoji sticker showing questioning, emphasis, confusion, agreement, with text like "什么", "真的", "疑问", "同意"'
  };

  const stylePrompts: Record<string, string> = {
    '卡通风格': 'cute cartoon style, bright colors, simple shapes, kawaii aesthetic',
    '真实风格': 'realistic photo style but emoji-like, natural expressions',
    '手绘风格': 'hand-drawn doodle style, sketch-like, artistic lines',
    '像素风格': '8-bit pixel art style, retro gaming aesthetic, blocky design'
  };

  const emojiPrompt = emojiPrompts[emojiType] || 'cute emoji sticker';
  const stylePrompt = stylePrompts[style] || 'cartoon style';
  
  // 构建专门的表情包prompt
  let promptParts = [];
  
  // 1. 核心表情包要求（最重要）
  promptParts.push('emoji sticker, chat emoticon');
  
  // 2. 用户描述（如果有）
  let textContent = '';
  if (userDescription && userDescription.trim()) {
    promptParts.push(userDescription.trim());
    textContent = `with text "${userDescription.trim()}"`;
    console.log('✅ 用户描述已添加到prompt:', userDescription.trim());
  } else {
    // 如果没有用户描述，根据AI分析智能推荐文字
    textContent = getSmartTextForAnalysis(analysis, emojiType);
    console.log('🤖 智能推荐文字:', textContent);
  }
  
  // 3. 表情包类型和风格
  promptParts.push(`${emojiPrompt}, ${stylePrompt}`);
  
  // 4. 基于AI分析的主体特征（简化）
  const keyFeatures = extractKeyFeatures(analysis);
  if (keyFeatures) {
    promptParts.push(keyFeatures);
  }

  // 5. 文字内容
  promptParts.push(textContent);

  // 6. 表情包格式要求
  promptParts.push('square format, transparent or simple background, clear facial expression, suitable for messaging apps, high contrast, bold features, Chinese text overlay, readable font, text integrated with image');

  const finalPrompt = promptParts.join(', ');
  console.log('🎨 表情包专用prompt:', finalPrompt);
  
  return finalPrompt;
}

// 获取表情包类型的默认文字
function getDefaultTextForType(emojiType: string): string {
  const defaultTexts: Record<string, string[]> = {
    '情感表达': ['开心', '难过', '生气', '惊讶', '爱你'],
    '问候交流': ['你好', '再见', '谢谢', '早安', '晚安'],
    '生活状态': ['吃饭', '睡觉', '工作', '运动', '休息'],
    '互动回应': ['赞', '棒', '好的', '收到', '同意'],
    '搞笑娱乐': ['哈哈', '笑死', '搞笑', '逗比', '好玩'],
    '节日庆祝': ['恭喜', '庆祝', '开心', '快乐', '祝福'],
    '职场商务': ['加油', '努力', '会议', '工作', '奋斗'],
    '语气辅助': ['什么', '真的', '疑问', '确定', '好吧']
  };
  
  const texts = defaultTexts[emojiType] || ['表情包'];
  const randomText = texts[Math.floor(Math.random() * texts.length)];
  return `with text "${randomText}"`;
}

// 从AI分析中提取关键特征
function extractKeyFeatures(analysis: string): string {
  // 提取关键词：人物/动物类型、表情、颜色等
  const keywords = [];
  
  // 检测主体类型
  if (analysis.includes('狗') || analysis.includes('犬')) keywords.push('dog character');
  else if (analysis.includes('猫') || analysis.includes('喵')) keywords.push('cat character');
  else if (analysis.includes('人') || analysis.includes('女') || analysis.includes('男')) keywords.push('human character');
  else keywords.push('cute character');
  
  // 检测表情
  if (analysis.includes('笑') || analysis.includes('开心') || analysis.includes('高兴')) keywords.push('smiling happy');
  else if (analysis.includes('哭') || analysis.includes('伤心') || analysis.includes('难过')) keywords.push('crying sad');
  else if (analysis.includes('生气') || analysis.includes('愤怒')) keywords.push('angry mad');
  else if (analysis.includes('惊讶') || analysis.includes('震惊')) keywords.push('surprised shocked');
  
  // 检测颜色（保留主要颜色）
  if (analysis.includes('黄') || analysis.includes('金')) keywords.push('yellow golden');
  else if (analysis.includes('白')) keywords.push('white');
  else if (analysis.includes('黑')) keywords.push('black');
  else if (analysis.includes('棕') || analysis.includes('褐')) keywords.push('brown');
  
  return keywords.slice(0, 3).join(' '); // 最多保留3个关键特征
}

// 根据分析结果智能推荐文字
function getSmartTextForAnalysis(analysis: string, emojiType: string): string {
  // 根据分析结果中的情绪推荐文字
  if (analysis.includes('笑') || analysis.includes('开心') || analysis.includes('高兴')) {
    return 'with text "开心"';
  } else if (analysis.includes('哭') || analysis.includes('伤心') || analysis.includes('难过')) {
    return 'with text "难过"';
  } else if (analysis.includes('生气') || analysis.includes('愤怒')) {
    return 'with text "生气"';
  } else if (analysis.includes('惊讶') || analysis.includes('震惊')) {
    return 'with text "惊讶"';
  } else if (analysis.includes('睡') || analysis.includes('困')) {
    return 'with text "困了"';
  } else if (analysis.includes('吃') || analysis.includes('食物')) {
    return 'with text "好吃"';
  } else {
    // 如果没有明显情绪，使用类型默认文字
    return getDefaultTextForType(emojiType);
  }
}

async function saveEmojiRecord(userId: string, emojiType: string, style: string, originalImage: string, generatedEmoji: string, analysis: string, prompt: string) {
  try {
    // 使用any类型暂时绕过类型检查，直到Prisma客户端重新生成
    const record = await (prisma as any).emojiGeneration.create({
      data: {
        userId,
        emojiType,
        style,
        originalImage,
        generatedEmoji,
        analysis,
        prompt,
        createdAt: new Date()
      }
    });
    return record;
  } catch (error) {
    console.error('保存表情包记录失败:', error);
    throw new Error('保存记录失败');
  }
}

export const POST: RequestHandler = async ({ request, cookies }) => {
  try {
    console.log('开始表情包生成处理流程...');
    
    // 暂时移除用户认证，与照片圆梦保持一致
    // const token = cookies.get('auth-token');
    // if (!token) {
    //   return json({ success: false, error: '请先登录' }, { status: 401 });
    // }

    // const decoded = await verifyToken(token);
    // if (!decoded) {
    //   return json({ success: false, error: '登录已过期' }, { status: 401 });
    // }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const emojiType = formData.get('emojiType') as string;
    const style = formData.get('style') as string;
    const userDescription = formData.get('userDescription') as string || '';

    if (!imageFile || !emojiType || !style) {
      return json({ success: false, error: '缺少必要参数' }, { status: 400 });
    }

    // 将图片转换为base64并创建data URL
    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = Buffer.from(imageBuffer).toString('base64');
    const imageUrl = `data:${imageFile.type};base64,${imageBase64}`;

    // 第一步：分析图片
    console.log('开始分析图片...');
    const analysisResult = await analyzeImageWithVision(imageUrl, emojiType);
    if (!analysisResult.success) {
      return json({ success: false, error: analysisResult.error || '图片分析失败' }, { status: 500 });
    }
    console.log('图片分析完成:', analysisResult.analysis);

    // 第二步：生成表情包
    console.log('开始生成表情包...');
    const prompt = generateEmojiPrompt(analysisResult.analysis!, emojiType, style, userDescription);
    const generationResult = await generateImageFromPrompt(prompt);
    if (!generationResult.success) {
      return json({ success: false, error: generationResult.error || '表情包生成失败' }, { status: 500 });
    }
    console.log('表情包生成完成');

    // 暂时跳过数据库保存，与照片圆梦保持一致
    // await saveEmojiRecord(
    //   decoded.id,
    //   emojiType,
    //   style,
    //   imageUrl,
    //   generationResult.imageData!,
    //   analysisResult.analysis!,
    //   prompt
    // );

    // 使用与照片圆梦完全相同的返回格式
    const result = {
      success: true,
      message: '表情包制作完成',
      data: {
        originalAnalysis: analysisResult.analysis,
        generatedPrompt: prompt,
        generatedImage: generationResult.imageData, // 改为generatedImage与照片圆梦一致
        emojiType: emojiType,
        style: style,
        userDescription: userDescription,
        processSteps: {
          step1: 'Vision分析完成',
          step2: '表情包生成完成'
        }
      },
      metadata: {
        processedAt: new Date().toISOString(),
        visionModel: DOUBAO_CONFIG.visionModel,
        imageGenModel: DOUBAO_CONFIG.imageGenModel
      }
    };

    return json(result);

  } catch (error) {
    console.error('表情包生成API错误详情:', {
      error: error instanceof Error ? error.message : '未知错误',
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    return json({
      success: false,
      error: error instanceof Error ? error.message : '生成失败'
    }, { status: 500 });
  }
};

// 添加OPTIONS方法支持CORS预检请求
export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}; 