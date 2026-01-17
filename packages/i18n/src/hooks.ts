/**
 * 国际化工具包 React Hooks
 * 提供在 React 组件中使用翻译器的便捷方法
 */

import { useMemo, useState, useCallback } from 'react';
import type { Translator } from './translator';
import type { Locale, TranslationParams } from './types';

/**
 * 使用翻译器的 Hook
 * @param translator 翻译器实例
 * @returns 包含翻译函数、当前语言和设置语言的对象的元组
 */
export function useTranslator(translator: Translator) {
  const [locale, setLocaleState] = useState<Locale>(translator.getLocale());

  const t = useCallback(
    (key: string, params?: TranslationParams): string => {
      return translator.translate(key, params);
    },
    [translator]
  );

  const setLocale = useCallback(
    (newLocale: Locale) => {
      translator.setLocale(newLocale);
      setLocaleState(newLocale);
    },
    [translator]
  );

  return useMemo(
    () => ({
      t,
      locale,
      setLocale,
    }),
    [t, locale, setLocale]
  );
}

/**
 * 翻译上下文类型
 */
export interface TranslationContextValue {
  t: (key: string, params?: TranslationParams) => string;
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

/**
 * 创建翻译 Hook
 * 如果提供了 translator，使用它；否则需要使用 useTranslator
 * @param translator 可选的翻译器实例
 * @returns 翻译上下文值
 */
export function useTranslation(
  translator?: Translator
): TranslationContextValue {
  if (!translator) {
    throw new Error(
      'useTranslation requires a Translator instance. Use useTranslator instead.'
    );
  }

  return useTranslator(translator);
}
