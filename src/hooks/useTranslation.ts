import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSettings } from '@/contexts/SettingsContext';

// Cache for translations to avoid repeated API calls
const translationCache: Record<string, Record<string, string>> = {};

export function useTranslation() {
  const { language } = useSettings();
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedTexts, setTranslatedTexts] = useState<Record<string, string>>({});
  const pendingTexts = useRef<Set<string>>(new Set());

  // Get cache key for current language
  const getCacheKey = useCallback((lang: string) => {
    if (!translationCache[lang]) {
      translationCache[lang] = {};
    }
    return translationCache[lang];
  }, []);

  // Translate a batch of texts
  const translateBatch = useCallback(async (texts: string[], targetLang: string) => {
    if (targetLang === 'en') {
      // No translation needed for English (source language)
      const result: Record<string, string> = {};
      texts.forEach(text => { result[text] = text; });
      return result;
    }

    const cache = getCacheKey(targetLang);
    const textsToTranslate: string[] = [];
    const result: Record<string, string> = {};

    // Check cache first
    texts.forEach(text => {
      if (cache[text]) {
        result[text] = cache[text];
      } else if (!pendingTexts.current.has(text)) {
        textsToTranslate.push(text);
        pendingTexts.current.add(text);
      }
    });

    if (textsToTranslate.length === 0) {
      return result;
    }

    try {
      setIsTranslating(true);
      
      const { data, error } = await supabase.functions.invoke('translate', {
        body: {
          texts: textsToTranslate,
          targetLanguage: targetLang,
          sourceLanguage: 'en',
        },
      });

      if (error) {
        console.error('Translation error:', error);
        // Return original texts on error
        textsToTranslate.forEach(text => {
          result[text] = text;
          pendingTexts.current.delete(text);
        });
        return result;
      }

      const translations = data.translations as string[];
      
      // Cache and return translations
      textsToTranslate.forEach((text, index) => {
        const translated = translations[index] || text;
        cache[text] = translated;
        result[text] = translated;
        pendingTexts.current.delete(text);
      });

      return result;
    } catch (error) {
      console.error('Translation failed:', error);
      textsToTranslate.forEach(text => {
        result[text] = text;
        pendingTexts.current.delete(text);
      });
      return result;
    } finally {
      setIsTranslating(false);
    }
  }, [getCacheKey]);

  // Translate a single text
  const translate = useCallback(async (text: string): Promise<string> => {
    if (!text || language === 'en') return text;
    
    const cache = getCacheKey(language);
    if (cache[text]) return cache[text];

    const result = await translateBatch([text], language);
    return result[text] || text;
  }, [language, translateBatch, getCacheKey]);

  // Translate multiple texts at once
  const translateMany = useCallback(async (texts: string[]): Promise<Record<string, string>> => {
    if (language === 'en') {
      const result: Record<string, string> = {};
      texts.forEach(text => { result[text] = text; });
      return result;
    }

    return translateBatch(texts, language);
  }, [language, translateBatch]);

  // Get cached translation or original text
  const getTranslation = useCallback((text: string): string => {
    if (!text || language === 'en') return text;
    
    const cache = getCacheKey(language);
    return cache[text] || translatedTexts[text] || text;
  }, [language, getCacheKey, translatedTexts]);

  // Effect to translate texts when language changes
  const translateTexts = useCallback(async (texts: string[]) => {
    if (language === 'en') {
      const result: Record<string, string> = {};
      texts.forEach(text => { result[text] = text; });
      setTranslatedTexts(result);
      return;
    }

    const result = await translateBatch(texts, language);
    setTranslatedTexts(prev => ({ ...prev, ...result }));
  }, [language, translateBatch]);

  return {
    language,
    isTranslating,
    translate,
    translateMany,
    translateTexts,
    getTranslation,
    translatedTexts,
  };
}

// Hook for auto-translating component text
export function useAutoTranslate(texts: string[]) {
  const { language } = useSettings();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const prevLanguage = useRef(language);
  const prevTexts = useRef<string[]>([]);

  useEffect(() => {
    const textsChanged = JSON.stringify(texts) !== JSON.stringify(prevTexts.current);
    const languageChanged = language !== prevLanguage.current;

    if (!textsChanged && !languageChanged) return;

    prevLanguage.current = language;
    prevTexts.current = texts;

    if (language === 'en') {
      const result: Record<string, string> = {};
      texts.forEach(text => { result[text] = text; });
      setTranslations(result);
      return;
    }

    // Check cache first
    const cache = translationCache[language] || {};
    const allCached = texts.every(text => cache[text]);
    
    if (allCached) {
      const result: Record<string, string> = {};
      texts.forEach(text => { result[text] = cache[text]; });
      setTranslations(result);
      return;
    }

    // Translate
    const translateAll = async () => {
      setIsLoading(true);
      try {
        const textsToTranslate = texts.filter(text => !cache[text]);
        
        if (textsToTranslate.length === 0) {
          const result: Record<string, string> = {};
          texts.forEach(text => { result[text] = cache[text] || text; });
          setTranslations(result);
          return;
        }

        const { data, error } = await supabase.functions.invoke('translate', {
          body: {
            texts: textsToTranslate,
            targetLanguage: language,
            sourceLanguage: 'en',
          },
        });

        if (error) throw error;

        // Update cache
        if (!translationCache[language]) {
          translationCache[language] = {};
        }
        
        textsToTranslate.forEach((text, index) => {
          translationCache[language][text] = data.translations[index] || text;
        });

        // Build result
        const result: Record<string, string> = {};
        texts.forEach(text => {
          result[text] = translationCache[language][text] || text;
        });
        setTranslations(result);
      } catch (error) {
        console.error('Auto-translate error:', error);
        const result: Record<string, string> = {};
        texts.forEach(text => { result[text] = text; });
        setTranslations(result);
      } finally {
        setIsLoading(false);
      }
    };

    translateAll();
  }, [language, texts]);

  const t = useCallback((text: string) => translations[text] || text, [translations]);

  return { t, isLoading, translations };
}
