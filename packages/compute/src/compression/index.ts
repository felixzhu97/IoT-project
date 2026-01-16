/**
 * 数据压缩模块
 * 提供Gzip压缩、LZ4压缩和Base64编码功能
 */

/**
 * 压缩格式类型
 */
export type CompressionFormat = 'gzip' | 'deflate' | 'deflate-raw';

/**
 * 使用CompressionStream API压缩数据
 * @param data - 要压缩的数据（字符串或Uint8Array）
 * @param format - 压缩格式，默认为gzip
 * @returns Promise<Uint8Array> 压缩后的数据
 */
export async function compress(
  data: string | Uint8Array,
  format: CompressionFormat = 'gzip'
): Promise<Uint8Array> {
  let input: Uint8Array;

  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    input = encoder.encode(data);
  } else {
    input = data;
  }

  const stream = new CompressionStream(format);
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();

  writer.write(input);
  writer.close();

  const chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      chunks.push(value);
    }
  }

  // 合并所有chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * 解压缩数据
 * @param data - 压缩的数据（Uint8Array）
 * @param format - 压缩格式，默认为gzip
 * @returns Promise<Uint8Array> 解压后的数据
 */
export async function decompress(
  data: Uint8Array,
  format: CompressionFormat = 'gzip'
): Promise<Uint8Array> {
  const stream = new DecompressionStream(format);
  const writer = stream.writable.getWriter();
  const reader = stream.readable.getReader();

  writer.write(data);
  writer.close();

  const chunks: Uint8Array[] = [];
  let done = false;

  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;
    if (value) {
      chunks.push(value);
    }
  }

  // 合并所有chunks
  const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

/**
 * Base64编码
 * @param data - 要编码的数据（字符串或Uint8Array）
 * @returns string Base64编码的字符串
 */
export function encodeBase64(data: string | Uint8Array): string {
  if (typeof data === 'string') {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    return btoa(String.fromCharCode(...bytes));
  } else {
    return btoa(String.fromCharCode(...data));
  }
}

/**
 * Base64解码
 * @param encoded - Base64编码的字符串
 * @returns string 解码后的字符串
 */
export function decodeBase64(encoded: string): string {
  const binaryString = atob(encoded);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const decoder = new TextDecoder();
  return decoder.decode(bytes);
}

/**
 * Base64解码为Uint8Array
 * @param encoded - Base64编码的字符串
 * @returns Uint8Array 解码后的字节数组
 */
export function decodeBase64ToBytes(encoded: string): Uint8Array {
  const binaryString = atob(encoded);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * 简单的LZ4-like压缩（简化版）
 * 这是一个基础的字典压缩实现，用于小数据块
 * @param data - 要压缩的数据（字符串）
 * @returns string 压缩后的字符串（十六进制编码）
 */
export function compressLZ4Like(data: string): string {
  const dictionary: { [key: string]: number } = {};
  let dictSize = 256;
  let result: number[] = [];
  let w = '';
  let i = 0;

  // 初始化字典
  for (let j = 0; j < 256; j++) {
    dictionary[String.fromCharCode(j)] = j;
  }

  for (i = 0; i < data.length; i++) {
    const c = data[i];
    const wc = w + c;

    if (dictionary[wc] !== undefined) {
      w = wc;
    } else {
      result.push(dictionary[w]);
      dictionary[wc] = dictSize++;
      w = c;
    }
  }

  if (w !== '') {
    result.push(dictionary[w]);
  }

  // 转换为十六进制字符串
  return result.map(n => n.toString(16).padStart(4, '0')).join('');
}

/**
 * LZ4-like解压缩（简化版）
 * @param compressed - 压缩后的字符串（十六进制编码）
 * @returns string 解压后的字符串
 */
export function decompressLZ4Like(compressed: string): string {
  const dictionary: { [key: number]: string } = {};
  let dictSize = 256;
  let result = '';

  // 初始化字典
  for (let j = 0; j < 256; j++) {
    dictionary[j] = String.fromCharCode(j);
  }

  // 将十六进制字符串转换为数字数组
  const codes: number[] = [];
  for (let i = 0; i < compressed.length; i += 4) {
    codes.push(parseInt(compressed.substr(i, 4), 16));
  }

  let w = dictionary[codes[0]];
  result += w;

  for (let i = 1; i < codes.length; i++) {
    const k = codes[i];
    let entry = '';

    if (dictionary[k]) {
      entry = dictionary[k];
    } else if (k === dictSize) {
      entry = w + w[0];
    } else {
      throw new Error('Invalid compressed data');
    }

    result += entry;
    dictionary[dictSize++] = w + entry[0];
    w = entry;
  }

  return result;
}
