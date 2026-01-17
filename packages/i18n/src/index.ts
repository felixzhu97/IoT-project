/**
 * 国际化工具包
 * 提供翻译字典管理、翻译函数、语言切换和 React hooks 支持
 */

// 核心翻译器
export { Translator } from './translator';

// React Hooks
export { useTranslator, useTranslation } from './hooks';
export type { TranslationContextValue } from './hooks';

// 类型定义
export type {
  Locale,
  TranslationDictionary,
  TranslationConfig,
  TranslationParams,
} from './types';

// 默认导出 Translator 类
export { Translator as default } from './translator';
