import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

// Language code to full name mapping
const languageNames: Record<string, string> = {
  'en': 'English',
  'mr': 'Marathi',
  'tl': 'Filipino/Tagalog',
  'id': 'Indonesian',
  'vi': 'Vietnamese',
  'ko': 'Korean',
  'ja': 'Japanese',
  'pt': 'Portuguese (Brazilian)',
  'es': 'Spanish',
  'de': 'German',
  'fr': 'French',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { texts, targetLanguage, sourceLanguage = 'en' } = await req.json();

    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      throw new Error('texts array is required');
    }

    if (!targetLanguage) {
      throw new Error('targetLanguage is required');
    }

    // If target is same as source, return original texts
    if (targetLanguage === sourceLanguage) {
      return new Response(JSON.stringify({ translations: texts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const targetLangName = languageNames[targetLanguage] || targetLanguage;
    const sourceLangName = languageNames[sourceLanguage] || sourceLanguage;

    console.log(`Translating ${texts.length} texts from ${sourceLangName} to ${targetLangName}`);

    // Create a prompt for batch translation
    const textsJson = JSON.stringify(texts);
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are a professional translator. Translate the provided JSON array of strings from ${sourceLangName} to ${targetLangName}. 
            
IMPORTANT RULES:
1. Return ONLY a valid JSON array with the translated strings in the EXACT same order
2. Keep the same number of elements
3. Preserve any special characters, emojis, or formatting
4. For technical terms or brand names, keep them in their original form if commonly used
5. Do not add any explanation or extra text - ONLY the JSON array`
          },
          {
            role: 'user',
            content: textsJson
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', errorText);
      throw new Error(`AI API error: ${response.status}`);
    }

    const data = await response.json();
    const translatedContent = data.choices?.[0]?.message?.content;

    if (!translatedContent) {
      throw new Error('No translation received from AI');
    }

    console.log('Raw AI response:', translatedContent);

    // Parse the JSON response
    let translations: string[];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = translatedContent.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        translations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON array found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return original texts if parsing fails
      translations = texts;
    }

    // Ensure we have the same number of translations
    if (translations.length !== texts.length) {
      console.warn(`Translation count mismatch: expected ${texts.length}, got ${translations.length}`);
      // Pad or trim to match
      if (translations.length < texts.length) {
        translations = [...translations, ...texts.slice(translations.length)];
      } else {
        translations = translations.slice(0, texts.length);
      }
    }

    console.log(`Successfully translated ${translations.length} texts`);

    return new Response(JSON.stringify({ translations }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in translate function:', error);
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
