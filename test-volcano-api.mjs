import fetch from 'node-fetch';
import fs from 'fs';

async function testVolcanoAPI() {
  try {
    console.log('🔥 开始测试火山引擎CV API...');
    
    // 创建一个简单的测试图片数据 (1x1像素的红色PNG)
    const testImageBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
    const testImageBuffer = Buffer.from(testImageBase64, 'base64');
    
    // 创建FormData
    const formData = new FormData();
    const blob = new Blob([testImageBuffer], { type: 'image/png' });
    formData.append('image', blob, 'test.png');
    formData.append('style', 'anime');
    formData.append('strength', '0.8');
    formData.append('accessKeyId', 'AKLTNDFmMDUwOGU1NTdlNDIyZDhmM2VhMWQ1YWY2MTE3YzQ');
    formData.append('secretAccessKey', 'TlRjeFpUUTROalExWXpVek5HVTVZemxpTTJZMVltWTFOVE5oTUdKa01USQ==');
    
    console.log('📡 发送请求到 http://localhost:5173/api/volcano-cv');
    
    const response = await fetch('http://localhost:5173/api/volcano-cv', {
      method: 'POST',
      body: formData
    });
    
    console.log('📊 响应状态:', response.status, response.statusText);
    
    const responseText = await response.text();
    console.log('📄 响应内容:', responseText);
    
    if (response.ok) {
      console.log('✅ API测试成功！');
      try {
        const jsonResponse = JSON.parse(responseText);
        console.log('📋 解析后的响应:', JSON.stringify(jsonResponse, null, 2));
      } catch (e) {
        console.log('⚠️ 响应不是有效的JSON格式');
      }
    } else {
      console.log('❌ API测试失败！');
    }
    
  } catch (error) {
    console.error('💥 测试过程中发生错误:', error.message);
  }
}

testVolcanoAPI(); 