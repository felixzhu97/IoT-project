/**
 * 国际化工具包核心翻译器
 * 提供翻译字典管理、翻译函数、语言切换等功能
 */

import type {
  Locale,
  TranslationDictionary,
  TranslationConfig,
  TranslationParams,
} from './types';

/**
 * 翻译器类
 */
export class Translator {
  private currentLocale: Locale;
  private translations: Record<Locale, TranslationDictionary>;
  private fallbackLocale?: Locale;

  constructor(config: TranslationConfig) {
    this.currentLocale = config.defaultLocale;
    this.translations = config.translations;
    this.fallbackLocale = config.fallbackLocale;
  }

  /**
   * 获取当前语言代码
   */
  getLocale(): Locale {
    return this.currentLocale;
  }

  /**
   * 设置当前语言
   */
  setLocale(locale: Locale): void {
    if (this.translations[locale]) {
      this.currentLocale = locale;
    } else {
      console.warn(`Locale "${locale}" not found, keeping current locale "${this.currentLocale}"`);
    }
  }

  /**
   * 深度合并两个翻译字典
   */
  private deepMerge(
    target: TranslationDictionary,
    source: TranslationDictionary
  ): TranslationDictionary {
    const result: TranslationDictionary = { ...target };

    for (const key in source) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (
        typeof sourceValue === 'object' &&
        sourceValue !== null &&
        typeof targetValue === 'object' &&
        targetValue !== null
      ) {
        // 递归合并嵌套对象
        result[key] = this.deepMerge(
          targetValue as TranslationDictionary,
          sourceValue as TranslationDictionary
        );
      } else {
        // 直接覆盖非对象值
        result[key] = sourceValue;
      }
    }

    return result;
  }

  /**
   * 添加或更新翻译字典
   */
  addTranslations(locale: Locale, translations: TranslationDictionary): void {
    if (this.translations[locale]) {
      this.translations[locale] = this.deepMerge(
        this.translations[locale],
        translations
      );
    } else {
      this.translations[locale] = translations;
    }
  }

  /**
   * 通过嵌套键获取翻译值
   * @param key 点号分隔的键路径，如 'common.buttons.save'
   * @param dictionary 翻译字典
   * @returns 翻译值或 null
   */
  private getNestedValue(
    key: string,
    dictionary: TranslationDictionary
  ): string | null {
    const keys = key.split('.');
    let current: string | TranslationDictionary | undefined = dictionary;

    for (const k of keys) {
      if (typeof current === 'object' && current !== null) {
        current = current[k];
      } else {
        return null;
      }
    }

    // 空字符串也是有效的翻译值
    if (typeof current === 'string') {
      return current;
    }

    return null;
  }

  /**
   * 替换翻译字符串中的参数
   * @param template 模板字符串，如 'Hello {name}'
   * @param params 参数字典
   * @returns 替换后的字符串
   */
  private replaceParams(template: string, params: TranslationParams): string {
    return template.replace(/\{(\w+)\}/g, (match, key) => {
      const value = params[key];
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * 获取翻译值
   * @param locale 语言代码
   * @param key 翻译键
   * @returns 翻译值或 null
   */
  private getTranslation(locale: Locale, key: string): string | null {
    const dictionary = this.translations[locale];
    if (!dictionary) {
      return null;
    }

    return this.getNestedValue(key, dictionary);
  }

  /**
   * 翻译函数
   * @param key 翻译键，支持嵌套键（点号分隔），如 'common.buttons.save'
   * @param params 可选参数，用于替换模板中的占位符，如 { name: 'World' }
   * @returns 翻译后的字符串
   */
  translate(key: string, params?: TranslationParams): string {
    // 首先尝试当前语言
    let translation = this.getTranslation(this.currentLocale, key);

    // 如果当前语言不存在（包括空字符串，需要使用 null 检查），尝试回退语言
    if (translation === null && this.fallbackLocale) {
      translation = this.getTranslation(this.fallbackLocale, key);
    }

    // 如果回退语言也不存在，返回键本身
    if (translation === null) {
      console.warn(`Translation key "${key}" not found for locale "${this.currentLocale}"`);
      return key;
    }

    // 如果有参数，替换占位符
    if (params) {
      return this.replaceParams(translation, params);
    }

    return translation;
  }
}
