# 火山引擎CV API签名验证问题报告

## 问题描述
使用火山引擎CV API进行图像处理时，持续收到"SignatureDoesNotMatch"错误，即使完全按照官方示例代码实现签名算法。

## 错误信息
```json
{
  "ResponseMetadata": {
    "RequestId": "20250612211650F6034647881AD3D59CF6",
    "Action": "CVProcess",
    "Version": "2022-08-31",
    "Service": "cv",
    "Region": "cn-beijing",
    "Error": {
      "CodeN": 100010,
      "Code": "SignatureDoesNotMatch",
      "Message": "The request signature we calculated does not match the signature you provided. Check your Secret Access Key and signing method. Consult the service documentation for details."
    }
  }
}
```

## API配置信息
- **AccessKeyId**: `AKLTNDFmMDUwOGU1NTdlNDIyZDhmM2VhMWQ1YWY2MTE3YzQ`
- **SecretAccessKey**: `TlRjeFpUUTROalExWXpVek5HVTVZemxpTTJZMVltWTFOVE5oTUdKa01USQ==`
- **API端点**: `https://visual.volcengineapi.com`
- **Action**: `CVProcess`
- **Version**: `2022-08-31`
- **Region**: `cn-beijing` (也尝试过 `cn-north-1`)
- **Service**: `cv`

## 完整的测试代码 (Node.js)

```javascript
import crypto from 'crypto';
import fetch from 'node-fetch';

const HEADER_KEYS_TO_IGNORE = new Set([
    "authorization",
    "content-type", 
    "content-length",
    "user-agent",
    "presigned-expires",
    "expect",
]);

// API配置
const accessKeyId = 'AKLTNDFmMDUwOGU1NTdlNDIyZDhmM2VhMWQ1YWY2MTE3YzQ';
const secretAccessKey = 'TlRjeFpUUTROalExWXpVek5HVTVZemxpTTJZMVltWTFOVE5oTUdKa01USQ==';

async function doRequest() {
    console.log('🔥 测试火山引擎CV API...\n');
    
    // 请求体 - 完全按照官方示例
    const data = {
        req_key: 'high_aes_general_v21_L',
        prompt: '改成动漫风格',
        return_url: true
    };

    const queryString = JSON.stringify(data);
    console.log('📝 请求体:', queryString);

    // 签名参数 - 完全按照官方代码
    const signParams = {
        headers: {
            ["X-Date"]: getDateTimeNow(),
            ["Content-Type"]: "application/json",
        },
        method: 'POST',
        query: {
            Version: '2022-08-31',
            Action: 'CVProcess',
        },
        accessKeyId: accessKeyId,
        secretAccessKey: secretAccessKey,
        serviceName: 'cv',
        region: 'cn-beijing',
        bodySha: getBodySha(queryString)
    };

    // 正规化查询参数
    for (const [key, val] of Object.entries(signParams.query)) {
        if (val === undefined || val === null) {
            signParams.query[key] = '';
        }
    }

    const authorization = sign(signParams);
    
    console.log('🔍 签名信息:');
    console.log('- DateTime:', signParams.headers["X-Date"]);
    console.log('- Region:', signParams.region);
    console.log('- Authorization:', authorization.substring(0, 80) + '...');

    // 构建URL
    const queryStringParams = new URLSearchParams();
    for (const [key, value] of Object.entries(signParams.query)) {
        queryStringParams.append(key, String(value));
    }
    const url = `https://visual.volcengineapi.com/?${queryStringParams.toString()}`;

    try {
        const res = await fetch(url, {
            headers: {
                ...signParams.headers,
                'Authorization': authorization,
            },
            method: signParams.method,
            body: queryString
        });

        const responseText = await res.text();
        console.log('\n📨 响应状态:', res.status, res.statusText);
        console.log('📄 响应内容:', responseText);
        
    } catch (error) {
        console.error('💥 请求失败:', error.message);
    }
}

// 签名函数 - 完全复制自官方代码
function sign(params) {
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

    return [
        "HMAC-SHA256",
        `Credential=${accessKeyId}/${credentialScope},`,
        `SignedHeaders=${signedHeaders},`,
        `Signature=${signature}`,
    ].join(' ');
}

function hmac(secret, s) {
    return crypto.createHmac('sha256', secret).update(s, 'utf8').digest();
}

function hash(s) {
    return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function queryParamsToString(params) {
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

function getSignHeaders(originHeaders, needSignHeaders) {
    function trimHeaderValue(header) {
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

function uriEscape(str) {
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

function getBodySha(body) {
    const hash = crypto.createHash('sha256');
    if (typeof body === 'string') {
        hash.update(body);
    }
    return hash.digest('hex');
}

// 执行测试
doRequest();
```

## 尝试过的解决方案

1. **区域设置**: 尝试了 `cn-beijing` 和 `cn-north-1` 两个区域
2. **密钥处理**: 尝试了直接使用和Base64解码两种方式处理SecretAccessKey
3. **签名算法**: 完全按照官方提供的qurey.txt和Nodejs.txt示例代码实现
4. **请求格式**: 测试了不同的请求体格式和模型名称
5. **Headers设置**: 确保Content-Type和X-Date headers正确设置

## 测试结果

1. **最新测试** (直接使用官方代码): 得到 HTTP 401 "Access Denied: Access Denied" 错误
2. **通过SvelteKit API**: 持续收到"SignatureDoesNotMatch"错误

## 请求详情示例

```
URL: https://visual.volcengineapi.com/?Version=2022-08-31&Action=CVProcess
Method: POST
Headers:
  X-Date: 20250612T131646Z
  Content-Type: application/json
  Authorization: HMAC-SHA256 Credential=AKLTNDFmMDUwOGU1NTdlNDIyZDh.../20250612/cn-beijing/cv/request, SignedHeaders=x-date, Signature=...

Body:
{"req_key":"high_aes_general_v21_L","prompt":"改成动漫风格","return_url":true}
```

## 问题排查请求

1. **密钥权限**: 请确认提供的AccessKeyId是否有CV服务权限
2. **服务状态**: 请确认CV图像处理服务是否已正确开通
3. **签名算法**: 请确认我们的签名实现是否有问题
4. **API版本**: 请确认使用的API版本和参数是否正确
5. **特殊处理**: SecretAccessKey是否需要特殊的编码/解码处理

## 环境信息
- **Node.js版本**: v18+
- **测试时间**: 2025-06-12
- **网络环境**: 中国大陆

希望技术支持能够帮助定位问题原因，谢谢！ 