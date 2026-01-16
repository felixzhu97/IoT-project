/**
 * 统计分析模块
 * 提供基础统计、相关性分析、线性回归和数据归一化功能
 */

/**
 * 计算数组的均值
 * @param data - 数值数组
 * @returns number 均值
 */
export function mean(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate mean of empty array');
  }
  const sum = data.reduce((acc, val) => acc + val, 0);
  return sum / data.length;
}

/**
 * 计算数组的中位数
 * @param data - 数值数组
 * @returns number 中位数
 */
export function median(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate median of empty array');
  }
  const sorted = [...data].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * 计算数组的方差
 * @param data - 数值数组
 * @param sample - 是否计算样本方差（默认true，使用n-1）
 * @returns number 方差
 */
export function variance(data: number[], sample: boolean = true): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate variance of empty array');
  }
  const m = mean(data);
  const sumSquaredDiff = data.reduce((acc, val) => acc + Math.pow(val - m, 2), 0);
  const divisor = sample ? data.length - 1 : data.length;
  return sumSquaredDiff / divisor;
}

/**
 * 计算数组的标准差
 * @param data - 数值数组
 * @param sample - 是否计算样本标准差（默认true）
 * @returns number 标准差
 */
export function standardDeviation(data: number[], sample: boolean = true): number {
  return Math.sqrt(variance(data, sample));
}

/**
 * 计算数组的最小值
 * @param data - 数值数组
 * @returns number 最小值
 */
export function min(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate min of empty array');
  }
  return Math.min(...data);
}

/**
 * 计算数组的最大值
 * @param data - 数值数组
 * @returns number 最大值
 */
export function max(data: number[]): number {
  if (data.length === 0) {
    throw new Error('Cannot calculate max of empty array');
  }
  return Math.max(...data);
}

/**
 * 计算皮尔逊相关系数
 * @param x - 第一个数值数组
 * @param y - 第二个数值数组
 * @returns number 相关系数（-1到1之间）
 */
export function correlation(x: number[], y: number[]): number {
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }
  if (x.length === 0) {
    throw new Error('Cannot calculate correlation of empty arrays');
  }

  const meanX = mean(x);
  const meanY = mean(y);

  let numerator = 0;
  let sumSqX = 0;
  let sumSqY = 0;

  for (let i = 0; i < x.length; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    numerator += diffX * diffY;
    sumSqX += diffX * diffX;
    sumSqY += diffY * diffY;
  }

  const denominator = Math.sqrt(sumSqX * sumSqY);
  
  if (denominator === 0) {
    return 0; // 如果方差为0，相关系数为0
  }

  return numerator / denominator;
}

/**
 * 线性回归结果
 */
export interface LinearRegressionResult {
  slope: number; // 斜率
  intercept: number; // 截距
  rSquared: number; // 决定系数（R²）
  equation: string; // 回归方程字符串
}

/**
 * 使用最小二乘法进行线性回归
 * @param x - 自变量数组
 * @param y - 因变量数组
 * @returns LinearRegressionResult 回归结果
 */
export function linearRegression(x: number[], y: number[]): LinearRegressionResult {
  if (x.length !== y.length) {
    throw new Error('Arrays must have the same length');
  }
  if (x.length < 2) {
    throw new Error('At least 2 data points are required for linear regression');
  }

  const n = x.length;
  const meanX = mean(x);
  const meanY = mean(y);

  let sumXY = 0;
  let sumX2 = 0;
  let sumY2 = 0;

  for (let i = 0; i < n; i++) {
    const diffX = x[i] - meanX;
    const diffY = y[i] - meanY;
    sumXY += diffX * diffY;
    sumX2 += diffX * diffX;
    sumY2 += diffY * diffY;
  }

  // 计算斜率和截距
  const slope = sumX2 === 0 ? 0 : sumXY / sumX2;
  const intercept = meanY - slope * meanX;

  // 计算R²
  const rSquared = sumX2 === 0 || sumY2 === 0 
    ? 0 
    : Math.pow(sumXY / Math.sqrt(sumX2 * sumY2), 2);

  return {
    slope,
    intercept,
    rSquared,
    equation: `y = ${slope.toFixed(4)}x + ${intercept.toFixed(4)}`,
  };
}

/**
 * 归一化方法类型
 */
export type NormalizeMethod = 'min-max' | 'z-score' | 'unit-vector';

/**
 * 归一化选项
 */
export interface NormalizeOptions {
  method?: NormalizeMethod;
  min?: number; // 用于min-max归一化的最小值（默认使用数据的最小值）
  max?: number; // 用于min-max归一化的最大值（默认使用数据的最大值）
  targetMin?: number; // 目标范围最小值（默认0）
  targetMax?: number; // 目标范围最大值（默认1）
}

/**
 * 归一化数据
 * @param data - 数值数组
 * @param options - 归一化选项
 * @returns number[] 归一化后的数组
 */
export function normalize(
  data: number[],
  options: NormalizeOptions = {}
): number[] {
  if (data.length === 0) {
    return [];
  }

  const {
    method = 'min-max',
    min: minVal,
    max: maxVal,
    targetMin = 0,
    targetMax = 1,
  } = options;

  switch (method) {
    case 'min-max': {
      const dataMin = minVal ?? min(data);
      const dataMax = maxVal ?? max(data);
      const range = dataMax - dataMin;

      if (range === 0) {
        // 如果所有值相同，返回目标范围的中点
        return data.map(() => (targetMin + targetMax) / 2);
      }

      return data.map(val => {
        const normalized = (val - dataMin) / range;
        return targetMin + normalized * (targetMax - targetMin);
      });
    }

    case 'z-score': {
      const m = mean(data);
      const sd = standardDeviation(data);

      if (sd === 0) {
        // 如果标准差为0，返回0
        return data.map(() => 0);
      }

      return data.map(val => (val - m) / sd);
    }

    case 'unit-vector': {
      const magnitude = Math.sqrt(
        data.reduce((sum, val) => sum + val * val, 0)
      );

      if (magnitude === 0) {
        return data.map(() => 0);
      }

      return data.map(val => val / magnitude);
    }

    default:
      throw new Error(`Unknown normalization method: ${method}`);
  }
}

/**
 * 计算数组的分位数
 * @param data - 数值数组
 * @param percentile - 百分位数（0-1之间）
 * @returns number 分位数
 */
export function quantile(data: number[], percentile: number): number {
  if (percentile < 0 || percentile > 1) {
    throw new Error('Percentile must be between 0 and 1');
  }
  if (data.length === 0) {
    throw new Error('Cannot calculate quantile of empty array');
  }

  const sorted = [...data].sort((a, b) => a - b);
  const index = percentile * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;

  if (lower === upper) {
    return sorted[lower];
  }

  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

/**
 * 计算数组的统计摘要
 * @param data - 数值数组
 * @returns 统计摘要对象
 */
export function summary(data: number[]): {
  count: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  variance: number;
  standardDeviation: number;
  q25: number;
  q75: number;
} {
  if (data.length === 0) {
    throw new Error('Cannot calculate summary of empty array');
  }

  return {
    count: data.length,
    mean: mean(data),
    median: median(data),
    min: min(data),
    max: max(data),
    variance: variance(data),
    standardDeviation: standardDeviation(data),
    q25: quantile(data, 0.25),
    q75: quantile(data, 0.75),
  };
}
