import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTranslator, useTranslation } from '../hooks';
import { Translator } from '../translator';
import type { TranslationConfig } from '../types';

describe('useTranslator', () => {
  let translator: Translator;
  let config: TranslationConfig;

  beforeEach(() => {
    // Given: 准备测试数据和翻译器
    config = {
      defaultLocale: 'zh',
      translations: {
        zh: {
          common: {
            hello: '你好',
            greeting: '你好，{name}',
          },
        },
        en: {
          common: {
            hello: 'Hello',
            greeting: 'Hello, {name}',
          },
        },
      },
    };

    translator = new Translator(config);
  });

  describe('when hook is called', () => {
    it('should return translation function', () => {
      // Act
      const { result } = renderHook(() => useTranslator(translator));

      // Assert
      expect(result.current.t).toBeDefined();
      expect(typeof result.current.t).toBe('function');
    });

    it('should return current locale', () => {
      // Act
      const { result } = renderHook(() => useTranslator(translator));

      // Assert
      expect(result.current.locale).toBe('zh');
    });
  });

  describe('translate()', () => {
    it('should translate using t function', () => {
      // Arrange
      const { result } = renderHook(() => useTranslator(translator));

      // Act
      const translation = result.current.t('common.hello');

      // Assert
      expect(translation).toBe('你好');
    });

    it('should translate with parameters using t function', () => {
      // Arrange
      const { result } = renderHook(() => useTranslator(translator));

      // Act
      const translation = result.current.t('common.greeting', { name: 'World' });

      // Assert
      expect(translation).toBe('你好，World');
    });
  });

  describe('setLocale()', () => {
    it('should update locale when setLocale is called', () => {
      // Arrange
      const { result } = renderHook(() => useTranslator(translator));

      // Act
      act(() => {
        result.current.setLocale('en');
      });

      // Assert
      expect(result.current.locale).toBe('en');
      expect(result.current.t('common.hello')).toBe('Hello');
    });

    it('should update translations after locale change', () => {
      // Arrange
      const { result } = renderHook(() => useTranslator(translator));

      // Act
      act(() => {
        result.current.setLocale('en');
      });

      // Assert
      expect(result.current.t('common.hello')).toBe('Hello');
      expect(result.current.t('common.greeting', { name: 'World' })).toBe(
        'Hello, World'
      );
    });
  });

  describe('when component re-renders', () => {
    it('should maintain translator instance across re-renders', () => {
      // Arrange
      const { result, rerender } = renderHook(() => useTranslator(translator));

      // Act
      rerender();

      // Assert
      expect(result.current.t('common.hello')).toBe('你好');
      expect(result.current.locale).toBe('zh');
    });
  });
});

describe('useTranslation', () => {
  let translator: Translator;
  let config: TranslationConfig;

  beforeEach(() => {
    // Given: 准备测试数据和翻译器
    config = {
      defaultLocale: 'zh',
      translations: {
        zh: {
          common: {
            hello: '你好',
          },
        },
      },
    };

    translator = new Translator(config);
  });

  describe('when translator is not provided', () => {
    it('should throw error when translator is not provided', () => {
      // Act & Assert
      expect(() => {
        renderHook(() => useTranslation());
      }).toThrow('useTranslation requires a Translator instance');
    });
  });

  describe('when translator is provided', () => {
    it('should work when translator is provided', () => {
      // Act
      const { result } = renderHook(() => useTranslation(translator));

      // Assert
      expect(result.current.t).toBeDefined();
      expect(result.current.locale).toBe('zh');
      expect(result.current.t('common.hello')).toBe('你好');
    });
  });
});
