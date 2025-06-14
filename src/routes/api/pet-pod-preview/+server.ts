import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

// 豆包API配置 - 与照片圆梦保持一致
const DOUBAO_CONFIG = {
  chatApiUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
  imageGenApiUrl: 'https://ark.cn-beijing.volces.com/api/v3/images/generations',
  apiKey: '97e3922f-c817-47d3-8690-6a940a06081f',
  visionModel: 'ep-20250609024414-fwnn2', // 图片分析接入点ID
  imageGenModel: 'ep-m-20250609014544-4xckt' // 文生图接入点ID
};

// 产品类型对应的prompt模板
const PRODUCT_PROMPTS = {
  '宠物马克杯': '生成一个完整的白色陶瓷马克杯产品展示图，马克杯正面视角，将宠物照片清晰地印制在杯身中央位置，保持马克杯的原有形状和质感，专业产品摄影效果',
  '宠物抱枕': '生成一个完整的方形抱枕产品展示图，抱枕正面平铺视角，将宠物照片完整地印制在抱枕中央，保持抱枕柔软的质感和边缘的缝线细节，专业产品摄影效果',
  '宠物T恤': '生成一个完整的T恤产品展示图，T恤正面平铺在干净的背景上，将宠物照片印制在T恤胸前中央位置，保持T恤的面料质感和自然的褶皱，展示完整的T恤轮廓和袖子，专业服装产品摄影效果',
  '宠物手机壳': '生成一个完整的手机壳产品展示图，手机壳背面视角，将宠物照片印制在背板中央位置，适合手机壳的尺寸比例，保持手机壳的材质质感，专业产品摄影效果',
  '宠物钥匙链': '生成一个完整的亚克力钥匙链产品展示图，钥匙链正面视角，将宠物照片清晰地印制在透明亚克力材质的中央位置，保持钥匙链的透明质感，专业产品摄影效果',
  '宠物车载摆件': '生成一个完整的车载摆件产品展示图，摆件正面视角，将宠物照片立体地呈现在摆件的中央位置，保持3D效果和摆件的材质质感，专业产品摄影效果'
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('开始宠物Pod定制预览处理...');
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const productName = formData.get('productName') as string;
    const fastMode = formData.get('fastMode') === 'true';
    
    if (!imageFile) {
      return json({ error: '未找到宠物照片' }, { status: 400 });
    }

    if (!productName) {
      return json({ error: '未指定产品类型' }, { status: 400 });
    }

    console.log('处理参数:', {
      productName,
      fastMode,
      fileName: imageFile.name,
      fileSize: imageFile.size
    });

    // 将图片转换为base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:${imageFile.type};base64,${base64Image}`;

    // 第一步：使用Vision模型分析宠物照片
    console.log(`步骤1: 分析宠物照片...${fastMode ? '(快速模式)' : ''}`);
    const visionResponse = await analyzeImageWithVision(imageUrl, productName, fastMode);
    
    if (!visionResponse.success) {
      return json({ 
        error: 'Vision分析失败', 
        details: visionResponse.error 
      }, { status: 500 });
    }

    const imageAnalysis = visionResponse.analysis || '无法获取图片分析结果';
    console.log('宠物照片分析结果:', imageAnalysis);

    // 第二步：生成定制预览prompt
    const finalPrompt = generateCustomizationPrompt(imageAnalysis, productName, fastMode);
    console.log('最终生成prompt:', finalPrompt);

    // 第三步：使用文生图模型生成定制预览
    console.log(`步骤2: 生成定制预览...${fastMode ? '(快速模式)' : ''}`);
    const imageGenResponse = await generateImageFromPrompt(finalPrompt, fastMode);
    
    if (!imageGenResponse.success) {
      return json({ 
        error: '定制预览生成失败', 
        details: imageGenResponse.error,
        analysisData: {
          originalAnalysis: imageAnalysis,
          generatedPrompt: finalPrompt
        }
      }, { status: 500 });
    }

    const result = {
      success: true,
      message: '宠物Pod定制预览生成完成',
      data: {
        originalAnalysis: imageAnalysis,
        generatedPrompt: finalPrompt,
        previewImage: imageGenResponse.imageData,
        productName: productName,
        processSteps: {
          step1: '宠物照片分析完成',
          step2: '定制预览生成完成'
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
    console.error('宠物Pod定制预览处理错误:', error);
    return json({
      error: '处理失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
};

// Vision模型分析宠物照片
async function analyzeImageWithVision(imageUrl: string, productName: string, fastMode: boolean = false): Promise<{success: boolean, analysis?: string, error?: string}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fastMode ? 15000 : 30000);

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
                text: `请详细分析这张宠物照片，重点描述：
1. 宠物的种类、颜色、特征
2. 宠物的姿态和表情
3. 照片的构图和背景
4. 适合印制在${productName}上的建议
请用中文回答，描述要详细准确。`
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
        max_tokens: fastMode ? 200 : 500,
        temperature: 0.7
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

    return { success: true, analysis };

  } catch (error) {
    console.error('Vision分析错误:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: '图片分析超时，请重试' };
    }
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
}

// 生成定制预览prompt
function generateCustomizationPrompt(imageAnalysis: string, productName: string, fastMode: boolean = false): string {
  const productPrompt = PRODUCT_PROMPTS[productName as keyof typeof PRODUCT_PROMPTS] || '生成一个完整的产品展示图，将宠物照片印在产品的正中间位置';
  
  const basePrompt = `${productPrompt}

基于以下宠物照片分析结果：
${imageAnalysis}

关键要求：
1. 必须保持宠物照片的写实风格，不要动漫化或卡通化
2. 宠物照片要保持原有的真实特征、颜色和细节
3. 生成完整的产品展示图，包含产品的完整轮廓
4. 宠物照片在产品上的位置要居中对称
5. 图片尺寸要适合产品比例，不变形
6. 保持产品的原有质感和材质效果
7. 整体效果要自然美观，专业定制效果
8. 高清晰度，商业级产品摄影质量

风格要求：写实风格，专业产品摄影，现代简约背景，高品质商业展示效果，不要艺术化处理`;

  if (fastMode) {
    return `${basePrompt}\n\n注意：快速生成模式，重点保持写实风格和产品完整性。`;
  }

  return `${basePrompt}\n\n注意：精细化处理，追求完美的写实定制效果，确保宠物照片不被风格化处理。`;
}

// 文生图模型生成定制预览
async function generateImageFromPrompt(prompt: string, fastMode: boolean = false): Promise<{success: boolean, imageData?: string, error?: string}> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), fastMode ? 30000 : 60000);

    const size = fastMode ? '512x512' : '1024x1024';

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
        size: size,
        response_format: 'url',
        quality: fastMode ? 'draft' : 'standard'
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

    return { success: true, imageData: imageUrl };

  } catch (error) {
    console.error('文生图生成错误:', error);
    if (error instanceof Error && error.name === 'AbortError') {
      return { success: false, error: '定制预览生成超时，请重试' };
    }
    return { success: false, error: error instanceof Error ? error.message : '未知错误' };
  }
} 