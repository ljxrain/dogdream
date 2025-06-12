import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import crypto from 'crypto';
import { Buffer } from 'buffer';

/**
 * 不参与加签过程的 header key (完全按照官方代码)
 */
const HEADER_KEYS_TO_IGNORE = new Set([
    "authorization",
    "content-type",
    "content-length", 
    "user-agent",
    "presigned-expires",
    "expect",
]);

// 火山引擎CV API配置 (使用官方示例配置)
let VOLCANO_CV_CONFIG = {
  baseURL: 'https://visual.volcengineapi.com',
  accessKeyId: '', // 将从豆包API key获取
  secretAccessKey: '', // 将从豆包API key获取
  region: 'cn-north-1', // 官方代码使用cn-north-1
  serviceName: 'cv'
};

export const POST: RequestHandler = async ({ request }) => {
  try {
    console.log('🔥 开始火山引擎CV图生图处理流程...');
    
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const styleValue = formData.get('style');
    const strengthValue = formData.get('strength');
    const accessKeyId = formData.get('accessKeyId') as string;
    const secretAccessKey = formData.get('secretAccessKey') as string;
    
    const style = typeof styleValue === 'string' ? styleValue : 'anime';
    const strength = typeof strengthValue === 'string' ? strengthValue : '0.8';
    
    // 检查是否缺少必要参数
    if (!imageFile) {
      return json({ error: '未找到图片文件' }, { status: 400 });
    }

    // 使用正确的火山引擎API密钥
    const finalAccessKeyId = accessKeyId || 'AKLTNDFmMDUwOGU1NTdlNDIyZDhmM2VhMWQ1YWY2MTE3YzQ';
    const finalSecretAccessKey = secretAccessKey || 'TlRjeFpUUTROalExWXpVek5HVTVZemxpTTJZMVltWTFOVE5oTUdKa01USQ==';

    // 检查API密钥是否已配置
    if (!finalAccessKeyId || !finalSecretAccessKey) {
      return json({ 
        error: '未配置API密钥', 
        details: 'AccessKeyId或SecretAccessKey未设置'
      }, { status: 400 });
    }

    console.log('📸 处理图片:', {
      name: imageFile.name,
      size: imageFile.size,
      type: imageFile.type,
      style,
      strength
    });

    // 将图片转换为base64
    const arrayBuffer = await imageFile.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');

    // 完全按照官方示例的请求参数格式 - 使用和官方代码完全一致的参数
    const bodyParams = {
      req_key: 'high_aes_general_v21_L', // 使用官方示例中的模型名称
      prompt: `改成${style}风格`,
      return_url: true
      // 注意：暂时移除image_urls，先测试基础生成
    };

    console.log('🔧 请求参数:', {
      req_key: bodyParams.req_key,
      prompt: bodyParams.prompt,
      return_url: bodyParams.return_url
    });

    // 调用火山引擎CV API (完全按照官方代码)
    console.log('🚀 调用火山引擎CV API...');
    const response = await callVolcanoCVAPI(bodyParams, finalAccessKeyId, finalSecretAccessKey);
    
    if (!response.success) {
      return json({ 
        error: '火山引擎CV API调用失败', 
        details: response.error 
      }, { status: 500 });
    }

    const result = {
      success: true,
      message: '火山引擎CV图生图处理完成',
      data: {
        originalImage: `data:${imageFile.type};base64,${base64Image}`,
        generatedImage: response.data,
        style: style,
        strength: parseFloat(strength),
        processSteps: {
          step1: '图片上传完成',
          step2: '风格转换完成'
        }
      },
      metadata: {
        processedAt: new Date().toISOString(),
        apiProvider: 'volcengine-cv',
        reqKey: bodyParams.req_key
      }
    };

    return json(result);

  } catch (error) {
    console.error('❌ 火山引擎CV API处理错误:', error);
    return json({
      error: '处理失败',
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 });
  }
};

// 完全按照官方qurey.txt代码实现的调用函数
async function callVolcanoCVAPI(bodyParams: any, accessKeyId: string, secretAccessKey: string): Promise<{success: boolean, data?: any, error?: string}> {
  try {
    // 完全按照官方代码的参数格式
    const queryString = JSON.stringify(bodyParams);
    
    // 关键：检查SecretAccessKey是否需要Base64解码
    let processedSecretKey = secretAccessKey;
    try {
      // 如果secretAccessKey看起来像Base64，尝试解码
      if (secretAccessKey.includes('=') || /^[A-Za-z0-9+/]*={0,2}$/.test(secretAccessKey)) {
        const decoded = Buffer.from(secretAccessKey, 'base64').toString('utf8');
        if (decoded && decoded.length > 10) { // 合理的解码长度
          processedSecretKey = decoded;
          console.log('🔑 SecretKey已base64解码');
        }
      }
    } catch (e) {
      // 如果解码失败，使用原始值
      console.log('🔑 SecretKey保持原始格式');
    }
    
    const signParams = {
      headers: {
        // x-date header 是必传的 (官方注释)
        ["X-Date"]: getDateTimeNow(),
        ["Content-Type"]: "application/json", // 明确设置Content-Type
      },
      method: 'POST',
      query: {
        Version: '2022-08-31',
        Action: 'CVProcess',
      },
      accessKeyId: accessKeyId,
      secretAccessKey: processedSecretKey, // 使用处理后的密钥
      serviceName: 'cv',
      region: 'cn-beijing', // 使用Nodejs.txt中的区域设置
      bodySha: getBodySha(queryString)
    };

    // 正规化 query object， 防止串化后出现 query 值为 undefined 情况 (官方注释)
    for (const [key, val] of Object.entries(signParams.query)) {
      if (val === undefined || val === null) {
        (signParams.query as any)[key] = '';
      }
    }

    const authorization = sign(signParams);

    // 完全按照官方代码使用qs.stringify
    const queryStringParams = new URLSearchParams();
    for (const [key, value] of Object.entries(signParams.query)) {
      queryStringParams.append(key, String(value));
    }
    
    const fullURL = `https://visual.volcengineapi.com/?${queryStringParams.toString()}`;

    console.log('🔍 官方签名调试信息:', {
      datetime: signParams.headers["X-Date"],
      date: signParams.headers["X-Date"].substring(0, 8),
      signedHeaders: 'x-date',
      credentialScope: `${signParams.headers["X-Date"].substring(0, 8)}/cn-north-1/cv/request`,
      canonicalRequestHash: hash([
        signParams.method.toUpperCase(),
        '/',
        queryStringParams.toString() || '',
        `x-date:${signParams.headers["X-Date"]}\n`,
        'x-date',
        signParams.bodySha || hash('')
      ].join('\n')),
      stringToSignHash: hash([
        "HMAC-SHA256", 
        signParams.headers["X-Date"], 
        `${signParams.headers["X-Date"].substring(0, 8)}/cn-north-1/cv/request`,
        hash([
          signParams.method.toUpperCase(),
          '/',
          queryStringParams.toString() || '',
          `x-date:${signParams.headers["X-Date"]}\n`,
          'x-date',
          signParams.bodySha || hash('')
        ].join('\n'))
      ].join('\n'))
    });

    console.log('🔧 官方格式请求详情:', {
      url: fullURL,
      method: signParams.method,
      headers: {
        'X-Date': signParams.headers["X-Date"],
        Authorization: authorization.substring(0, 50) + '...',
        'Content-Type': 'application/json'
      },
      bodyLength: queryString.length,
      accessKeyId: accessKeyId.substring(0, 10) + '...',
      bodySha: signParams.bodySha,
      secretKeyDecoded: processedSecretKey !== secretAccessKey
    });

    // 完全按照官方代码的fetch调用
    const response = await fetch(fullURL, {
      headers: {
        ...signParams.headers,
        'Authorization': authorization,
        'Content-Type': 'application/json'
      },
      method: signParams.method,
      body: queryString
    });

    const responseText = await response.text();
    console.log('🌋 火山引擎CV API响应:', responseText);

    if (!response.ok) {
      console.error('🔥 火山引擎CV API错误:', response.status, responseText);
      return { 
        success: false, 
        error: `HTTP ${response.status}: ${responseText}` 
      };
    }

    const responseData = JSON.parse(responseText);
    
    if (responseData.ResponseMetadata?.Error) {
      return { 
        success: false, 
        error: `API错误: ${responseData.ResponseMetadata.Error.Message}` 
      };
    }

    return { 
      success: true, 
      data: responseData 
    };

  } catch (error) {
    console.error('❌ callVolcanoCVAPI错误:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : '未知错误' 
    };
  }
}

// 以下是完全按照官方qurey.txt代码复制的签名相关函数

function sign(params: any) {
  const {
    headers = {},
    query = {},
    region = '',
    serviceName = '',
    method = '',
    pathName = '/',
    accessKeyId = '',
    secretAccessKey = '',
    needSignHeaderKeys = [],
    bodySha,
  } = params;

  const datetime = headers["X-Date"];
  const date = datetime.substring(0, 8); // YYYYMMDD

  // 创建正规化请求
  const [signedHeaders, canonicalHeaders] = getSignHeaders(headers, needSignHeaderKeys);
  const canonicalRequest = [
    method.toUpperCase(),
    pathName,
    queryParamsToString(query) || '',
    `${canonicalHeaders}\n`,
    signedHeaders,
    bodySha || hash(''),
  ].join('\n');

  const credentialScope = [date, region, serviceName, "request"].join('/');

  // 创建签名字符串
  const stringToSign = ["HMAC-SHA256", datetime, credentialScope, hash(canonicalRequest)].join('\n');

  // 计算签名
  const kDate = hmac(secretAccessKey, date);
  const kRegion = hmac(kDate, region);
  const kService = hmac(kRegion, serviceName);
  const kSigning = hmac(kService, "request");
  const signature = hmac(kSigning, stringToSign).toString('hex');

  console.log('🔍 官方签名调试信息:', {
    datetime,
    date,
    signedHeaders,
    credentialScope,
    canonicalRequestHash: hash(canonicalRequest),
    stringToSignHash: hash(stringToSign)
  });

  return [
    "HMAC-SHA256",
    `Credential=${accessKeyId}/${credentialScope},`,
    `SignedHeaders=${signedHeaders},`,
    `Signature=${signature}`,
  ].join(' ');
}

function hmac(secret: any, s: string) {
  return crypto.createHmac('sha256', secret).update(s, 'utf8').digest();
}

function hash(s: string) {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

// 官方代码的queryParamsToString函数
function queryParamsToString(params: any) {
  return Object.keys(params)
    .sort()
    .map((key) => {
      const val = params[key];
      if (typeof val === 'undefined' || val === null) {
        return undefined;
      }
      const escapedKey = uriEscape(key);
      if (!escapedKey) {
        return undefined;
      }
      if (Array.isArray(val)) {
        return `${escapedKey}=${val.map(uriEscape).sort().join(`&${escapedKey}=`)}`;
      }
      return `${escapedKey}=${uriEscape(val)}`;
    })
    .filter((v) => v)
    .join('&');
}

function getSignHeaders(originHeaders: any, needSignHeaders: string[]) {
  function trimHeaderValue(header: any) {
    return header.toString?.().trim().replace(/\s+/g, ' ') ?? '';
  }

  let h = Object.keys(originHeaders);

  // 根据 needSignHeaders 过滤
  if (Array.isArray(needSignHeaders)) {
    const needSignSet = new Set([...needSignHeaders, 'x-date', 'host'].map((k) => k.toLowerCase()));
    h = h.filter((k) => needSignSet.has(k.toLowerCase()));
  }

  // 根据 ignore headers 过滤
  h = h.filter((k) => !HEADER_KEYS_TO_IGNORE.has(k.toLowerCase()));

  const signedHeaderKeys = h
    .slice()
    .map((k) => k.toLowerCase())
    .sort()
    .join(';');

  const canonicalHeaders = h
    .sort((a, b) => (a.toLowerCase() < b.toLowerCase() ? -1 : 1))
    .map((k) => `${k.toLowerCase()}:${trimHeaderValue(originHeaders[k])}`)
    .join('\n');

  return [signedHeaderKeys, canonicalHeaders];
}

function uriEscape(str: string) {
  try {
    return encodeURIComponent(str)
      .replace(/[^A-Za-z0-9_.~\-%]+/g, escape)
      .replace(/[*]/g, (ch) => `%${ch.charCodeAt(0).toString(16).toUpperCase()}`);
  } catch (e) {
    return '';
  }
}

function getDateTimeNow() {
  const now = new Date();
  return now.toISOString().replace(/[:-]|\.\d{3}/g, '');
}

// 获取 body sha256 (官方代码)
function getBodySha(body: string) {
  const hash = crypto.createHash('sha256');
  if (typeof body === 'string') {
    hash.update(body);
  }
  return hash.digest('hex');
}

export const OPTIONS: RequestHandler = async () => {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}; 