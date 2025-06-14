import { error } from '@sveltejs/kit';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

const IMAGE_BASE_PATH = 'D:/图片';

// 预定义的图片文件列表（从D盘图片目录中选择的）
const AVAILABLE_IMAGES = [
  '微信图片_20250603200400.jpg',
  '微信图片_20250603200425.jpg', 
  '微信图片_20250603200431.jpg',
  '微信图片_20250603200438.jpg',
  '微信图片_20250603200446.jpg',
  '微信图片_20250603200453.jpg',
  '01a7fc26-bbf3-4a97-8458-6ea5f3cbe8a3.png',
  '05b0881c-a7e4-4e53-ad02-d60331b7328f.png',
  '0b56cd4a-bcfe-44ba-9ef8-e04c4c5213e2.png',
  '12218b6d-212f-48f3-80f7-724a00f3d64a.png',
  '15bb63e2-793e-4e31-8535-044045e2ea76.png',
  '17c8c398-207b-47f2-adb2-7b88d96b64be.png'
];

export async function GET({ params }) {
  const filename = params.filename;
  
  // 安全检查：只允许访问预定义的图片
  if (!AVAILABLE_IMAGES.includes(filename)) {
    throw error(404, 'Image not found');
  }
  
  const imagePath = join(IMAGE_BASE_PATH, filename);
  
  // 检查文件是否存在
  if (!existsSync(imagePath)) {
    throw error(404, 'Image file not found');
  }
  
  try {
    const imageBuffer = await readFile(imagePath);
    
    // 根据文件扩展名设置正确的Content-Type
    const ext = filename.split('.').pop()?.toLowerCase();
    let contentType = 'image/jpeg'; // 默认
    
    switch (ext) {
      case 'png':
        contentType = 'image/png';
        break;
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'bmp':
        contentType = 'image/bmp';
        break;
    }
    
    return new Response(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=3600',
        'Content-Length': imageBuffer.length.toString()
      }
    });
  } catch (err) {
    console.error('Error reading image file:', err);
    throw error(500, 'Failed to read image file');
  }
} 