/**
 * 国际化工具包类型定义
 */

/**
 * 语言代码类型
 */
export type Locale = string;

/**
 * 翻译参数字典
 */
export type TranslationParams = Record<string, string | number>;

/**
 * 翻译字典结构（支持嵌套对象）
 */
export type TranslationDictionary = {
  [key: string]: string | TranslationDictionary;
};

/**
 * 翻译配置
 */
export interface TranslationConfig {
  /**
   * 默认语言代码
   */
  defaultLocale: Locale;

  /**
   * 翻译字典
   * 键为语言代码，值为翻译字典
   */
  translations: Record<Locale, TranslationDictionary>;

  /**
   * 回退语言代码（可选）
   * 当当前语言的翻译不存在时，使用回退语言
   */
  fallbackLocale?: Locale;
}
