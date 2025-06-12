import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// 豆包API配置
const DOUBAO_CONFIG = {
  chatApiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  imageGenApiUrl: 'https://ark.cn-beijing.volces.com/api/v3/images/generations', // 文生图专用API
  
  // 使用新的豆包API密钥
  accessKeyId: 'AKLTNDFmMDUwOGU1NTdlNDIyZDhmM2VhMWQ1YWY2MTE3YzQ',
  secretAccessKey: 'TlRjeFpUUTROalExWXpVek5HVTVZemxpTTJZMVltWTFOVE5oTUdKa01USQ==',
  
  // 原有的apiKey作为备用
  apiKey: '97e3922f-c817-47d3-8690-6a940a06081f',
  
  // 使用用户提供的接入点ID
  visionModel: 'ep-20250609024414-fwnn2', // 图片分析接入点ID
  imageGenModel: 'ep-m-20250609014544-4xckt' // 文生图接入点ID
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('开始豆包API图片处理流程...');
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const styleValue = formData.get('style');
    const strengthValue = formData.get('strength');
    const userDescriptionValue = formData.get('userDescription');
    const fastModeValue = formData.get('fastMode');
    
    const style = typeof styleValue === 'string' ? styleValue : 'anime';
    const strength = typeof strengthValue === 'string' ? strengthValue : '0.8';
    const userDescription = typeof userDescriptionValue === 'string' ? userDescriptionValue : '';
    const fastMode = fastModeValue === 'true';
    
    if (!imageFile) {
      return json({ error: '未找到图片文件' }, { status: 400 });
    }

    console.log('文件信息:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type
    });

    // 将图片转换为base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:${imageFile.type};base64,${base64Image}`;

    // 第一步：使用Vision模型分析图片
    console.log(`步骤1: 使用Vision模型分析图片...${fastMode ? '(快速模式)' : ''}`);
    const visionResponse = await analyzeImageWithVision(imageUrl, style, fastMode);
    
    if (!visionResponse.success) {
      return json({ 
        error: 'Vision分析失败', 
        details: visionResponse.error 
      }, { status: 500 });
    }

    const imageAnalysis = visionResponse.analysis || '无法获取图片分析结果';
    console.log('图片分析结果:', imageAnalysis);

    // 第二步：基于分析结果和用户描述生成图片描述prompt
    const finalPrompt = generateImagePrompt(imageAnalysis, style, userDescription, strength);
    console.log('最终生成prompt:', finalPrompt);

    // 第三步：使用文生图模型生成图片
    console.log(`步骤3: 使用文生图模型生成图片...${fastMode ? '(快速模式)' : ''}`);
    const imageGenResponse = await generateImageFromPrompt(finalPrompt, fastMode);
    
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
      message: '图片分析和生成完成',
      data: {
        originalAnalysis: imageAnalysis,
        generatedPrompt: finalPrompt,
        generatedImage: imageGenResponse.imageData,
        style: style,
        strength: parseFloat(strength),
        userDescription: userDescription,
        processSteps: {
          step1: 'Vision分析完成',
          step2: 'Prompt生成完成',
          step3: '图片生成完成'
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
                  `快速分析：主体、场景、颜色。风格：${targetStyle}` :
                  `简要分析图片：主体对象、场景、色彩、构图。目标风格：${getStyleDescription(targetStyle)}。用于${targetStyle}风格转换，保持简洁。`
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
        max_tokens: fastMode ? 150 : 300,
        temperature: fastMode ? 0.1 : 0.3
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
    'anime': '日式动漫风格，清新明亮，线条清晰，色彩鲜艳',
    'oil_painting': '经典油画风格，厚重质感，色彩深沉，艺术感强',
    'watercolor': '水彩画风格，柔和淡雅，色彩流畅，清新自然',
    'sketch': '素描风格，黑白灰调，线条清晰，明暗对比强烈'
  };
  return styleMap[style] || '艺术风格转换';
}

// 生成最终的图片生成prompt（优化版，更简洁快速）
function generateImagePrompt(analysis: string, style: string, userDescription: string, strength: string): string {
  const stylePrompts: Record<string, string> = {
    'anime': 'anime style, vibrant colors, clean lines',
    'oil_painting': 'oil painting style, artistic brushstrokes',
    'watercolor': 'watercolor style, soft flowing colors',
    'sketch': 'pencil sketch, black and white shading'
  };

  const stylePrompt = stylePrompts[style] || 'artistic style';
  
  // 简化prompt，提高生成速度
  let finalPrompt = `${stylePrompt}. ${analysis.substring(0, 200)}`;

  if (userDescription.trim()) {
    finalPrompt += `, ${userDescription}`;
  }

  return finalPrompt;
}

// 文生图模型生成图片
async function generateImageFromPrompt(prompt: string, fastMode: boolean = false): Promise<{success: boolean, imageData?: string, error?: string}> {
  try {
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
        size: fastMode ? '512x512' : '1024x1024',
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

    // 返回生成的图片URL
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