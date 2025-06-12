import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// 豆包API配置
const DOUBAO_CONFIG = {
  chatApiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  imageGenApiUrl: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
  apiKey: '97e3922f-c817-47d3-8690-6a940a06081f',
  visionModel: 'ep-20250609024414-fwnn2', // 图片分析接入点ID
  imageGenModel: 'ep-m-20250609014544-4xckt' // 文生图接入点ID
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('开始图生图处理流程...');
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const styleValue = formData.get('style');
    const qualityValue = formData.get('quality');
    const userDescriptionValue = formData.get('userDescription') || '';
    const fastModeValue = formData.get('fastMode');
    
    const style = typeof styleValue === 'string' ? styleValue : '动漫风格';
    const quality = typeof qualityValue === 'string' ? qualityValue : '普通';
    const userDescription = typeof userDescriptionValue === 'string' ? userDescriptionValue : '';
    const fastMode = fastModeValue === 'true';
    
    if (!imageFile) {
      return json({ error: '未找到图片文件' }, { status: 400 });
    }

    console.log('处理参数:', {
      style,
      quality,
      fastMode,
      fileName: imageFile.name,
      fileSize: imageFile.size
    });

    // 将图片转换为base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:${imageFile.type};base64,${base64Image}`;

    // 第一步：使用Vision模型分析图片
    console.log(`步骤1: Vision分析图片...${fastMode ? '(快速模式)' : ''}`);
    const visionResponse = await analyzeImageWithVision(imageUrl, style, fastMode);
    
    if (!visionResponse.success) {
      return json({ 
        error: 'Vision分析失败', 
        details: visionResponse.error 
      }, { status: 500 });
    }

    const imageAnalysis = visionResponse.analysis || '无法获取图片分析结果';
    console.log('图片分析结果:', imageAnalysis);

    // 第二步：生成图片描述prompt
    const finalPrompt = generateImagePrompt(imageAnalysis, style, userDescription, quality, fastMode);
    console.log('最终生成prompt:', finalPrompt);

    // 第三步：使用文生图模型生成图片
    console.log(`步骤2: 生成风格化图片...${fastMode ? '(快速模式)' : ''}`);
    const imageGenResponse = await generateImageFromPrompt(finalPrompt, quality, fastMode);
    
    if (!imageGenResponse.success) {
      return json({ 
        error: '图片生成失败', 
        details: imageGenResponse.error,
        analysisData: {
          originalAnalysis: imageAnalysis,
          generatedPrompt: finalPrompt
        }
      }, { status: 500 });
    }

    const result = {
      success: true,
      message: '图片风格化处理完成',
      data: {
        originalAnalysis: imageAnalysis,
        generatedPrompt: finalPrompt,
        generatedImage: imageGenResponse.imageData,
        style: style,
        quality: quality,
        userDescription: userDescription,
        processSteps: {
          step1: 'Vision分析完成',
          step2: '图片生成完成'
        }
      },
      metadata: {
        processedAt: new Date().toISOString(),
        fastMode: fastMode,
        visionModel: DOUBAO_CONFIG.visionModel,
        imageGenModel: DOUBAO_CONFIG.imageGenModel
      }
    };

    return json(result);

  } catch (error) {
    console.error('API处理错误:', error);
    return json({
      error: '处理失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
};

// Vision模型图片分析
async function analyzeImageWithVision(imageUrl: string, targetStyle: string, fastMode: boolean = false): Promise<{success: boolean, analysis?: string, error?: string}> {
  try {
    const response = await fetch(DOUBAO_CONFIG.chatApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DOUBAO_CONFIG.visionModel,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: fastMode ? 
                  `快速分析：主体、场景、颜色。目标风格：${targetStyle}` :
                  `详细分析图片：主体对象、场景环境、色彩构成、构图特点。目标风格：${getStyleDescription(targetStyle)}。用于${targetStyle}风格转换。`
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
        max_tokens: fastMode ? 150 : 500,
        temperature: fastMode ? 0.1 : 0.5
      })
    });

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

    return { success: true, analysis };

  } catch (error) {
    console.error('Vision分析错误:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}

// 根据风格类型生成描述
function getStyleDescription(style: string): string {
  const styleMap: Record<string, string> = {
    '吉卜力风格': '宫崎骏动画风格，柔和色彩，梦幻氛围',
    '超级英雄': '美式漫画风格，鲜明对比，英雄感强',
    '乐高风格': '积木玩具风格，方块化，色彩鲜艳',
    '迪士尼风格': '迪士尼动画风格，温馨可爱，色彩明亮',
    '水墨画风格': '中国水墨画风格，墨色渲染，意境深远',
    '皮克斯风格': '皮克斯3D动画风格，精细渲染，温暖色调',
    '油画风格': '经典油画风格，厚重质感，艺术感强',
    '3D卡通': '现代3D卡通风格，立体感强，色彩丰富',
    '动漫风格': '日式动漫风格，清新明亮，线条清晰'
  };
  return styleMap[style] || '艺术风格转换';
}

// 生成最终的图片生成prompt
function generateImagePrompt(analysis: string, style: string, userDescription: string, quality: string, fastMode: boolean): string {
  const stylePrompts: Record<string, string> = {
    '吉卜力风格': 'Studio Ghibli style, dreamy colors, soft lighting, magical atmosphere',
    '超级英雄': 'superhero comic style, dynamic poses, bold colors, heroic lighting',
    '乐高风格': 'LEGO brick style, blocky shapes, bright plastic colors, toy-like',
    '迪士尼风格': 'Disney animation style, warm colors, friendly characters, magical',
    '水墨画风格': 'Chinese ink painting style, flowing brushstrokes, monochrome tones',
    '皮克斯风格': 'Pixar 3D animation style, detailed rendering, warm lighting',
    '油画风格': 'oil painting style, thick brushstrokes, rich textures, artistic',
    '3D卡通': 'modern 3D cartoon style, smooth surfaces, vibrant colors',
    '动漫风格': 'anime style, vibrant colors, clean lines'
  };

  const stylePrompt = stylePrompts[style] || 'artistic style';
  
  // 根据快速模式调整prompt长度
  const analysisLength = fastMode ? 150 : 300;
  let finalPrompt = `${stylePrompt}. ${analysis.substring(0, analysisLength)}`;

  if (userDescription.trim()) {
    finalPrompt += `, ${userDescription}`;
  }

  // 根据质量添加质量提示
  if (quality === '高清' || quality === '超清') {
    finalPrompt += ', high quality, detailed';
  }

  return finalPrompt;
}

// 文生图模型生成图片
async function generateImageFromPrompt(prompt: string, quality: string, fastMode: boolean = false): Promise<{success: boolean, imageData?: string, error?: string}> {
  try {
    // 根据质量和快速模式确定分辨率
    let size = '512x512';
    if (!fastMode) {
      if (quality === '高清') size = '1024x1024';
      else if (quality === '超清') size = '1024x1024'; // 豆包最大支持1024x1024
    }

    const response = await fetch(DOUBAO_CONFIG.imageGenApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DOUBAO_CONFIG.apiKey}`
      },
      body: JSON.stringify({
        model: DOUBAO_CONFIG.imageGenModel,
        prompt: prompt,
        n: 1,
        size: size,
        response_format: 'url',
        quality: fastMode ? 'draft' : 'standard'
      })
    });

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

    return { success: true, imageData: imageUrl };

  } catch (error) {
    console.error('文生图生成错误:', error);
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}

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