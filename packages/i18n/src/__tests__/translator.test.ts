import { describe, it, expect, beforeEach } from 'vitest';
import { Translator } from '../translator';
import type { TranslationConfig } from '../types';

describe('Translator', () => {
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
            buttons: {
              save: '保存',
              cancel: '取消',
            },
          },
        },
        en: {
          common: {
            hello: 'Hello',
            greeting: 'Hello, {name}',
            buttons: {
              save: 'Save',
              cancel: 'Cancel',
            },
          },
        },
        ja: {
          common: {
            hello: 'こんにちは',
          },
        },
      },
      fallbackLocale: 'en',
    };

    translator = new Translator(config);
  });

  describe('constructor', () => {
    it('should initialize with default locale', () => {
      // Act
      const locale = translator.getLocale();

      // Assert
      expect(locale).toBe('zh');
    });

    it('should initialize with translations', () => {
      // Act
      const result = translator.translate('common.hello');

      // Assert
      expect(result).toBe('你好');
    });
  });

  describe('getLocale()', () => {
    it('should return current locale', () => {
      // Act
      const locale = translator.getLocale();

      // Assert
      expect(locale).toBe('zh');
    });
  });

  describe('setLocale()', () => {
    describe('when locale exists in translations', () => {
      it('should change current locale', () => {
        // Act
        translator.setLocale('en');

        // Assert
        expect(translator.getLocale()).toBe('en');
      });

      it('should update translations after locale change', () => {
        // Arrange
        translator.setLocale('en');

        // Act
        const result = translator.translate('common.hello');

        // Assert
        expect(result).toBe('Hello');
      });
    });

    describe('when locale does not exist', () => {
      it('should not change locale if translation does not exist', () => {
        // Arrange
        const originalLocale = translator.getLocale();

        // Act
        translator.setLocale('fr');

        // Assert
        expect(translator.getLocale()).toBe(originalLocale);
      });
    });
  });

  describe('addTranslations()', () => {
    describe('when locale exists', () => {
      it('should add new translations for existing locale', () => {
        // Arrange
        const newTranslations = {
          common: {
            goodbye: '再见',
          },
        };

        // Act
        translator.addTranslations('zh', newTranslations);

        // Assert
        expect(translator.translate('common.goodbye')).toBe('再见');
      });

      it('should merge translations for existing locale', () => {
        // Arrange
        const newTranslations = {
          common: {
            goodbye: '再见',
          },
        };

        // Act
        translator.addTranslations('zh', newTranslations);

        // Assert
        expect(translator.translate('common.hello')).toBe('你好');
        expect(translator.translate('common.goodbye')).toBe('再见');
      });
    });

    describe('when locale does not exist', () => {
      it('should add translations for new locale', () => {
        // Arrange
        const newTranslations = {
          common: {
            hello: 'Bonjour',
          },
        };

        // Act
        translator.addTranslations('fr', newTranslations);

        // Assert
        translator.setLocale('fr');
        expect(translator.translate('common.hello')).toBe('Bonjour');
      });
    });
  });

  describe('translate()', () => {
    describe('when translation exists', () => {
      it('should translate simple key', () => {
        // Act
        const result = translator.translate('common.hello');

        // Assert
        expect(result).toBe('你好');
      });

      it('should translate nested key', () => {
        // Act
        const result = translator.translate('common.buttons.save');

        // Assert
        expect(result).toBe('保存');
      });

      it('should replace parameters in translation', () => {
        // Act
        const result = translator.translate('common.greeting', { name: 'World' });

        // Assert
        expect(result).toBe('你好，World');
      });

      it('should replace multiple parameters', () => {
        // Arrange
        translator.addTranslations('zh', {
          common: {
            message: '你好，{name}，你今年{age}岁了',
          },
        });

        // Act
        const result = translator.translate('common.message', {
          name: '张三',
          age: 25,
        });

        // Assert
        expect(result).toBe('你好，张三，你今年25岁了');
      });

      it('should handle empty string key', () => {
        // Arrange
        translator.addTranslations('zh', {
          empty: '',
        });

        // Act
        const result = translator.translate('empty');

        // Assert
        expect(result).toBe('');
      });

      it('should handle numeric parameters', () => {
        // Arrange
        translator.addTranslations('zh', {
          common: {
            count: '共有{count}个项目',
          },
        });

        // Act
        const result = translator.translate('common.count', { count: 10 });

        // Assert
        expect(result).toBe('共有10个项目');
      });
    });

    describe('when translation does not exist', () => {
      it('should return key if translation not found', () => {
        // Act
        const result = translator.translate('common.nonexistent');

        // Assert
        expect(result).toBe('common.nonexistent');
      });

      it('should use fallback locale when translation not found', () => {
        // Arrange
        translator.setLocale('ja');

        // Act
        const result = translator.translate('common.buttons.save');

        // Assert
        expect(result).toBe('Save');
      });

      it('should return key if fallback locale also does not have translation', () => {
        // Arrange
        translator.setLocale('ja');

        // Act
        const result = translator.translate('common.nonexistent');

        // Assert
        expect(result).toBe('common.nonexistent');
      });
    });
  });
});
