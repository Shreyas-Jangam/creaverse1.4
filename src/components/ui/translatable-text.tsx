import { useEffect, useState, useCallback, memo } from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// Global translation cache
const globalCache: Record<string, Record<string, string>> = {};

// Pending translations to batch
let pendingTexts: Set<string> = new Set();
let pendingLanguage: string | null = null;
let batchTimeout: NodeJS.Timeout | null = null;
let batchCallbacks: Map<string, ((translation: string) => void)[]> = new Map();

async function executeBatch() {
  if (pendingTexts.size === 0 || !pendingLanguage) return;
  
  const texts = Array.from(pendingTexts);
  const lang = pendingLanguage;
  const callbacks = new Map(batchCallbacks);
  
  pendingTexts.clear();
  batchCallbacks.clear();
  
  try {
    const { data, error } = await supabase.functions.invoke('translate', {
      body: {
        texts,
        targetLanguage: lang,
        sourceLanguage: 'en',
      },
    });

    if (error) throw error;

    const translations = data.translations as string[];
    
    // Cache and notify callbacks
    if (!globalCache[lang]) globalCache[lang] = {};
    
    texts.forEach((text, index) => {
      const translated = translations[index] || text;
      globalCache[lang][text] = translated;
      
      const cbs = callbacks.get(text);
      if (cbs) {
        cbs.forEach(cb => cb(translated));
      }
    });
  } catch (error) {
    console.error('Batch translation error:', error);
    // Return original texts on error
    texts.forEach(text => {
      const cbs = callbacks.get(text);
      if (cbs) {
        cbs.forEach(cb => cb(text));
      }
    });
  }
}

function queueTranslation(text: string, language: string, callback: (translation: string) => void) {
  // Check cache first
  if (globalCache[language]?.[text]) {
    callback(globalCache[language][text]);
    return;
  }

  // If language changed, execute pending batch first
  if (pendingLanguage && pendingLanguage !== language) {
    if (batchTimeout) clearTimeout(batchTimeout);
    executeBatch();
  }

  pendingLanguage = language;
  pendingTexts.add(text);
  
  if (!batchCallbacks.has(text)) {
    batchCallbacks.set(text, []);
  }
  batchCallbacks.get(text)!.push(callback);

  // Debounce batch execution
  if (batchTimeout) clearTimeout(batchTimeout);
  batchTimeout = setTimeout(executeBatch, 100);
}

interface TranslatableTextProps {
  children: string;
  className?: string;
  as?: keyof JSX.IntrinsicElements;
  fallback?: React.ReactNode;
}

export const TranslatableText = memo(function TranslatableText({ 
  children, 
  className,
  as: Component = 'span',
  fallback
}: TranslatableTextProps) {
  const { language } = useSettings();
  const [translated, setTranslated] = useState<string>(children);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!children || language === 'en') {
      setTranslated(children);
      return;
    }

    // Check cache
    if (globalCache[language]?.[children]) {
      setTranslated(globalCache[language][children]);
      return;
    }

    setIsLoading(true);
    queueTranslation(children, language, (result) => {
      setTranslated(result);
      setIsLoading(false);
    });
  }, [children, language]);

  if (isLoading && fallback) {
    return <>{fallback}</>;
  }

  return (
    <Component className={cn(isLoading && 'opacity-70', className)}>
      {translated}
    </Component>
  );
});

// Hook for translating multiple texts at once
export function useTranslateTexts(texts: string[]) {
  const { language } = useSettings();
  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (language === 'en') {
      const result: Record<string, string> = {};
      texts.forEach(t => { result[t] = t; });
      setTranslations(result);
      return;
    }

    // Check what's already cached
    const cached: Record<string, string> = {};
    const toTranslate: string[] = [];
    
    texts.forEach(text => {
      if (globalCache[language]?.[text]) {
        cached[text] = globalCache[language][text];
      } else {
        toTranslate.push(text);
      }
    });

    if (toTranslate.length === 0) {
      setTranslations(cached);
      return;
    }

    setIsLoading(true);
    
    const translateAll = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: {
            texts: toTranslate,
            targetLanguage: language,
            sourceLanguage: 'en',
          },
        });

        if (error) throw error;

        if (!globalCache[language]) globalCache[language] = {};
        
        const result = { ...cached };
        toTranslate.forEach((text, index) => {
          const translated = data.translations[index] || text;
          globalCache[language][text] = translated;
          result[text] = translated;
        });
        
        setTranslations(result);
      } catch (error) {
        console.error('Translation error:', error);
        const result = { ...cached };
        toTranslate.forEach(t => { result[t] = t; });
        setTranslations(result);
      } finally {
        setIsLoading(false);
      }
    };

    translateAll();
  }, [language, JSON.stringify(texts)]);

  const t = useCallback((text: string) => translations[text] || text, [translations]);

  return { t, isLoading, translations };
}

// Simple text translation function for use in components
export function T({ children, className }: { children: string; className?: string }) {
  return <TranslatableText className={className}>{children}</TranslatableText>;
}
