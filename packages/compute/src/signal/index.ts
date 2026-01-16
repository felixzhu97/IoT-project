/**
 * 信号处理模块
 * 提供FFT、数字滤波、频谱分析和信号平滑功能
 */

/**
 * 复数类型
 */
interface Complex {
  real: number;
  imag: number;
}

/**
 * FFT结果
 */
export interface FFTResult {
  magnitude: number[];
  phase: number[];
  frequency: number[];
  real: number[];
  imaginary: number[];
}

/**
 * 滤波器类型
 */
export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'bandstop';

/**
 * 滤波器配置
 */
export interface FilterConfig {
  type: FilterType;
  cutoff: number; // 截止频率（归一化，0-0.5）
  order?: number; // 滤波器阶数
  bandwidth?: number; // 带宽（用于带通和带阻）
}

/**
 * 频谱分析结果
 */
export interface SpectrumAnalysis {
  dominantFrequencies: Array<{ frequency: number; magnitude: number }>;
  peakFrequency: number;
  totalPower: number;
  frequencyBands: Array<{ start: number; end: number; power: number }>;
}

/**
 * 快速傅里叶变换（FFT）
 * @param signal - 输入信号（实数数组）
 * @param sampleRate - 采样率（Hz）
 * @returns FFTResult FFT结果
 */
export function fft(signal: number[], sampleRate: number): FFTResult {
  const n = signal.length;
  
  // 确保长度为2的幂次，进行零填充
  const nextPowerOfTwo = Math.pow(2, Math.ceil(Math.log2(n)));
  const paddedSignal = [...signal];
  while (paddedSignal.length < nextPowerOfTwo) {
    paddedSignal.push(0);
  }

  const fftSize = paddedSignal.length;
  const result = fftInternal(paddedSignal);

  // 计算频率
  const frequency = result.map((_, i) => (i * sampleRate) / fftSize);
  
  // 只取前半部分（因为FFT结果是对称的）
  const halfSize = Math.floor(fftSize / 2);
  const real = result.slice(0, halfSize).map(c => c.real);
  const imaginary = result.slice(0, halfSize).map(c => c.imag);
  
  // 计算幅度和相位
  const magnitude = result.slice(0, halfSize).map(c =>
    Math.sqrt(c.real * c.real + c.imag * c.imag)
  );
  const phase = result.slice(0, halfSize).map(c =>
    Math.atan2(c.imag, c.real)
  );

  return {
    magnitude,
    phase,
    frequency: frequency.slice(0, halfSize),
    real,
    imaginary,
  };
}

/**
 * FFT内部实现（递归Cooley-Tukey算法）
 * @param signal - 输入信号
 * @returns Complex[] 复数数组
 */
function fftInternal(signal: number[]): Complex[] {
  const n = signal.length;

  if (n === 1) {
    return [{ real: signal[0], imag: 0 }];
  }

  // 分离偶数和奇数样本
  const even: number[] = [];
  const odd: number[] = [];
  for (let i = 0; i < n; i += 2) {
    even.push(signal[i]);
    if (i + 1 < n) {
      odd.push(signal[i + 1]);
    }
  }

  // 递归计算FFT
  const evenFFT = fftInternal(even);
  const oddFFT = fftInternal(odd);

  // 合并结果
  const result: Complex[] = new Array(n);
  const halfN = Math.floor(n / 2);

  for (let k = 0; k < halfN; k++) {
    const t = (2 * Math.PI * k) / n;
    const twiddle: Complex = {
      real: Math.cos(t),
      imag: -Math.sin(t),
    };

    const oddK = k < oddFFT.length ? oddFFT[k] : { real: 0, imag: 0 };

    result[k] = {
      real: evenFFT[k].real + twiddle.real * oddK.real - twiddle.imag * oddK.imag,
      imag: evenFFT[k].imag + twiddle.real * oddK.imag + twiddle.imag * oddK.real,
    };

    result[k + halfN] = {
      real: evenFFT[k].real - twiddle.real * oddK.real + twiddle.imag * oddK.imag,
      imag: evenFFT[k].imag - twiddle.real * oddK.imag - twiddle.imag * oddK.real,
    };
  }

  return result;
}

/**
 * 简单的移动平均滤波器（低通）
 * @param signal - 输入信号
 * @param windowSize - 窗口大小
 * @returns number[] 滤波后的信号
 */
export function movingAverageFilter(signal: number[], windowSize: number): number[] {
  if (windowSize < 1 || windowSize > signal.length) {
    throw new Error('Window size must be between 1 and signal length');
  }

  const result: number[] = [];
  const halfWindow = Math.floor(windowSize / 2);

  for (let i = 0; i < signal.length; i++) {
    let sum = 0;
    let count = 0;

    const start = Math.max(0, i - halfWindow);
    const end = Math.min(signal.length, i + halfWindow + 1);

    for (let j = start; j < end; j++) {
      sum += signal[j];
      count++;
    }

    result.push(sum / count);
  }

  return result;
}

/**
 * 简单的IIR低通滤波器
 * @param signal - 输入信号
 * @param cutoff - 截止频率（归一化，0-0.5）
 * @param order - 滤波器阶数（默认1）
 * @returns number[] 滤波后的信号
 */
function lowpassFilter(
  signal: number[],
  cutoff: number,
  order: number = 1
): number[] {
  const alpha = 1 - Math.exp(-2 * Math.PI * cutoff);
  const result: number[] = [...signal];

  for (let o = 0; o < order; o++) {
    for (let i = 1; i < result.length; i++) {
      result[i] = result[i - 1] + alpha * (signal[i] - result[i - 1]);
    }
  }

  return result;
}

/**
 * 简单的高通滤波器
 * @param signal - 输入信号
 * @param cutoff - 截止频率（归一化，0-0.5）
 * @returns number[] 滤波后的信号
 */
function highpassFilter(signal: number[], cutoff: number): number[] {
  const alpha = 1 - Math.exp(-2 * Math.PI * cutoff);
  const result: number[] = [signal[0]];

  for (let i = 1; i < signal.length; i++) {
    result[i] = alpha * (result[i - 1] + signal[i] - signal[i - 1]);
  }

  return result;
}

/**
 * 应用数字滤波器
 * @param signal - 输入信号
 * @param config - 滤波器配置
 * @returns number[] 滤波后的信号
 */
export function filter(signal: number[], config: FilterConfig): number[] {
  const { type, cutoff, order = 1, bandwidth } = config;

  if (cutoff < 0 || cutoff > 0.5) {
    throw new Error('Cutoff frequency must be between 0 and 0.5');
  }

  switch (type) {
    case 'lowpass':
      return lowpassFilter(signal, cutoff, order);

    case 'highpass':
      return highpassFilter(signal, cutoff);

    case 'bandpass': {
      if (bandwidth === undefined) {
        throw new Error('Bandwidth is required for bandpass filter');
      }
      const lowCutoff = Math.max(0, cutoff - bandwidth / 2);
      const highCutoff = Math.min(0.5, cutoff + bandwidth / 2);
      
      // 先应用低通，然后应用高通
      const lowpassed = lowpassFilter(signal, highCutoff, order);
      return highpassFilter(lowpassed, lowCutoff);
    }

    case 'bandstop': {
      if (bandwidth === undefined) {
        throw new Error('Bandwidth is required for bandstop filter');
      }
      const lowCutoff = Math.max(0, cutoff - bandwidth / 2);
      const highCutoff = Math.min(0.5, cutoff + bandwidth / 2);
      
      // 带阻 = 原信号 - 带通
      const bandpassed = filter(signal, {
        type: 'bandpass',
        cutoff,
        order,
        bandwidth,
      });
      return signal.map((val, i) => val - bandpassed[i]);
    }

    default:
      throw new Error(`Unknown filter type: ${type}`);
  }
}

/**
 * 频谱分析
 * @param signal - 输入信号
 * @param sampleRate - 采样率（Hz）
 * @param numPeaks - 要返回的主要频率数量（默认5）
 * @returns SpectrumAnalysis 频谱分析结果
 */
export function analyzeSpectrum(
  signal: number[],
  sampleRate: number,
  numPeaks: number = 5
): SpectrumAnalysis {
  const fftResult = fft(signal, sampleRate);
  const { magnitude, frequency } = fftResult;

  // 计算总功率
  const totalPower = magnitude.reduce((sum, mag) => sum + mag * mag, 0);

  // 找到峰值频率
  const peaks: Array<{ frequency: number; magnitude: number; index: number }> = [];
  
  for (let i = 1; i < magnitude.length - 1; i++) {
    if (magnitude[i] > magnitude[i - 1] && magnitude[i] > magnitude[i + 1]) {
      peaks.push({
        frequency: frequency[i],
        magnitude: magnitude[i],
        index: i,
      });
    }
  }

  // 按幅度排序并取前N个
  peaks.sort((a, b) => b.magnitude - a.magnitude);
  const dominantFrequencies = peaks
    .slice(0, numPeaks)
    .map(p => ({ frequency: p.frequency, magnitude: p.magnitude }));

  const peakFrequency = dominantFrequencies.length > 0 
    ? dominantFrequencies[0].frequency 
    : 0;

  // 将频谱分成几个频段并计算各频段的功率
  const numBands = 10;
  const bandWidth = frequency[frequency.length - 1] / numBands;
  const frequencyBands = [];

  for (let i = 0; i < numBands; i++) {
    const start = i * bandWidth;
    const end = (i + 1) * bandWidth;
    let bandPower = 0;

    for (let j = 0; j < frequency.length; j++) {
      if (frequency[j] >= start && frequency[j] < end) {
        bandPower += magnitude[j] * magnitude[j];
      }
    }

    frequencyBands.push({
      start,
      end,
      power: bandPower,
    });
  }

  return {
    dominantFrequencies,
    peakFrequency,
    totalPower,
    frequencyBands,
  };
}

/**
 * 信号平滑（使用移动平均）
 * @param signal - 输入信号
 * @param windowSize - 窗口大小（默认3）
 * @returns number[] 平滑后的信号
 */
export function smooth(signal: number[], windowSize: number = 3): number[] {
  return movingAverageFilter(signal, windowSize);
}

/**
 * 计算信号的RMS（均方根）值
 * @param signal - 输入信号
 * @returns number RMS值
 */
export function rms(signal: number[]): number {
  if (signal.length === 0) {
    return 0;
  }
  const sumSquares = signal.reduce((sum, val) => sum + val * val, 0);
  return Math.sqrt(sumSquares / signal.length);
}

/**
 * 计算信号的峰值
 * @param signal - 输入信号
 * @returns { peak: number; peakToPeak: number } 峰值和峰峰值
 */
export function peak(signal: number[]): { peak: number; peakToPeak: number } {
  if (signal.length === 0) {
    return { peak: 0, peakToPeak: 0 };
  }
  const maxVal = Math.max(...signal);
  const minVal = Math.min(...signal);
  return {
    peak: Math.max(Math.abs(maxVal), Math.abs(minVal)),
    peakToPeak: maxVal - minVal,
  };
}
