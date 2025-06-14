import { json } from '@sveltejs/kit';

export async function GET({ params }) {
  const path = params.path;
  
  // 生成简单的SVG占位符
  const [width = '300', height = '300'] = path.split('/');
  
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <rect x="20%" y="20%" width="60%" height="60%" fill="#e5e7eb" rx="8"/>
      <text x="50%" y="45%" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#9ca3af">
        宠物商品
      </text>
      <text x="50%" y="60%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#9ca3af">
        ${width}×${height}
      </text>
    </svg>
  `;
  
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
} 