/**
 * 加密/解密模块
 * 提供哈希、加密、解密、签名和验证功能
 */

/**
 * 支持的哈希算法类型
 */
export type HashAlgorithm = 'SHA-256' | 'SHA-512' | 'MD5';

/**
 * 哈希计算结果
 */
export interface HashResult {
  hash: string;
  algorithm: HashAlgorithm;
}

/**
 * 计算字符串或ArrayBuffer的哈希值
 * @param data - 要哈希的数据（字符串或ArrayBuffer）
 * @param algorithm - 哈希算法，默认为SHA-256
 * @returns Promise<HashResult> 包含哈希值和算法的对象
 */
export async function hash(
  data: string | ArrayBuffer,
  algorithm: HashAlgorithm = 'SHA-256'
): Promise<HashResult> {
  let buffer: ArrayBuffer;
  
  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    buffer = encoder.encode(data).buffer;
  } else {
    buffer = data;
  }

  // MD5需要通过其他方式实现，这里仅支持SHA系列
  if (algorithm === 'MD5') {
    throw new Error('MD5 not supported in Web Crypto API. Please use SHA-256 or SHA-512.');
  }

  const hashBuffer = await crypto.subtle.digest(algorithm, buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

  return {
    hash: hashHex,
    algorithm,
  };
}

/**
 * 密钥对生成选项
 */
export interface KeyPairOptions {
  keyLength?: 2048 | 4096;
  extractable?: boolean;
}

/**
 * 生成RSA密钥对
 * @param options - 密钥对生成选项
 * @returns Promise<CryptoKeyPair> RSA密钥对
 */
export async function generateKeyPair(
  options: KeyPairOptions = {}
): Promise<CryptoKeyPair> {
  const { keyLength = 2048, extractable = false } = options;

  return crypto.subtle.generateKey(
    {
      name: 'RSA-OAEP',
      modulusLength: keyLength,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    extractable,
    ['encrypt', 'decrypt']
  );
}

/**
 * 使用AES-GCM算法加密数据
 * @param data - 要加密的数据（字符串）
 * @param key - 加密密钥（字符串，将用于派生密钥）
 * @returns Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> 加密后的数据和初始化向量
 */
export async function encrypt(
  data: string,
  key: string
): Promise<{ encrypted: ArrayBuffer; iv: Uint8Array }> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  const keyBuffer = encoder.encode(key);

  // 派生密钥
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    cryptoKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['encrypt']
  );

  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    derivedKey,
    dataBuffer
  );

  return { encrypted, iv };
}

/**
 * 使用AES-GCM算法解密数据
 * @param encrypted - 加密的数据（ArrayBuffer）
 * @param key - 解密密钥（字符串）
 * @param iv - 初始化向量（Uint8Array）
 * @returns Promise<string> 解密后的字符串
 */
export async function decrypt(
  encrypted: ArrayBuffer,
  key: string,
  iv: Uint8Array
): Promise<string> {
  const encoder = new TextEncoder();
  const keyBuffer = encoder.encode(key);

  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyBuffer,
    'PBKDF2',
    false,
    ['deriveBits', 'deriveKey']
  );

  const salt = new Uint8Array(16); // 实际应用中应该存储和传递salt

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    cryptoKey,
    {
      name: 'AES-GCM',
      length: 256,
    },
    false,
    ['decrypt']
  );

  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    derivedKey,
    encrypted
  );

  const decoder = new TextDecoder();
  return decoder.decode(decrypted);
}

/**
 * 使用RSA私钥签名数据
 * @param data - 要签名的数据（字符串）
 * @param privateKey - RSA私钥（CryptoKey）
 * @returns Promise<ArrayBuffer> 签名结果
 */
export async function sign(data: string, privateKey: CryptoKey): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  const signature = await crypto.subtle.sign(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    privateKey,
    dataBuffer
  );

  return signature;
}

/**
 * 使用RSA公钥验证签名
 * @param data - 原始数据（字符串）
 * @param signature - 签名（ArrayBuffer）
 * @param publicKey - RSA公钥（CryptoKey）
 * @returns Promise<boolean> 验证是否通过
 */
export async function verify(
  data: string,
  signature: ArrayBuffer,
  publicKey: CryptoKey
): Promise<boolean> {
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);

  return crypto.subtle.verify(
    {
      name: 'RSA-PSS',
      saltLength: 32,
    },
    publicKey,
    signature,
    dataBuffer
  );
}

/**
 * 生成签名密钥对
 * @returns Promise<CryptoKeyPair> 用于签名的密钥对
 */
export async function generateSignKeyPair(): Promise<CryptoKeyPair> {
  return crypto.subtle.generateKey(
    {
      name: 'RSA-PSS',
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: 'SHA-256',
    },
    false,
    ['sign', 'verify']
  );
}
