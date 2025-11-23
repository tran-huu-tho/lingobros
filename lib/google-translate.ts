/**
 * Google Translate REST API Module
 * Sử dụng REST API thay vì SDK để tránh dependency issues
 */

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

const API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;
const TRANSLATE_API_URL = 'https://translation.googleapis.com/language/translate/v2';

/**
 * Dịch văn bản từ ngôn ngữ này sang ngôn ngữ khác
 * @param text - Văn bản cần dịch
 * @param targetLanguage - Ngôn ngữ đích (ví dụ: 'vi', 'en', 'fr')
 * @param sourceLanguage - Ngôn ngữ nguồn (tùy chọn, để trống để tự động phát hiện)
 */
export async function translateText(
  text: string,
  targetLanguage: string,
  sourceLanguage?: string
): Promise<TranslationResult> {
  try {
    console.log('🔄 translateText called:', { text, targetLanguage, sourceLanguage });
    
    if (!text || !text.trim()) {
      return { translatedText: '' };
    }

    if (!API_KEY) {
      console.error('❌ GOOGLE_TRANSLATE_API_KEY is missing');
      throw new Error('GOOGLE_TRANSLATE_API_KEY is not configured');
    }

    console.log('✅ API_KEY found, length:', API_KEY.length);

    const params = new URLSearchParams({
      key: API_KEY,
      target: targetLanguage,
      q: text,
    });

    if (sourceLanguage) {
      params.append('source', sourceLanguage);
    }

    const url = `${TRANSLATE_API_URL}?${params.toString()}`;
    console.log('🌐 Calling Google Translate API...');
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log('📊 API Response status:', response.status);

    if (!response.ok) {
      const error = await response.json();
      console.error('❌ API Error response:', error);
      throw new Error(`Translation API error: ${error.error?.message || response.statusText}`);
    }

    const data = await response.json();
    console.log('📦 API Response data:', data);
    
    const translations = data.data?.translations || [];

    if (translations.length === 0) {
      throw new Error('No translation returned');
    }

    console.log('✅ Translation successful:', translations[0].translatedText);
    
    return {
      translatedText: translations[0].translatedText,
      detectedSourceLanguage: translations[0].detectedSourceLanguage,
    };
  } catch (error) {
    console.error('❌ Google Translate API Error:', error);
    throw new Error(`Translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Phát hiện ngôn ngữ của văn bản
 * @param text - Văn bản cần phát hiện
 */
export async function detectLanguage(text: string): Promise<string> {
  try {
    if (!text || !text.trim()) {
      return 'unknown';
    }

    if (!API_KEY) {
      throw new Error('GOOGLE_TRANSLATE_API_KEY is not configured');
    }

    const params = new URLSearchParams({
      key: API_KEY,
      q: text,
    });

    const response = await fetch(`${TRANSLATE_API_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Detection API error: ${response.statusText}`);
    }

    const data = await response.json();
    const detections = data.data?.detections || [];

    if (detections.length === 0 || !detections[0][0]) {
      return 'unknown';
    }

    return detections[0][0].language || 'unknown';
  } catch (error) {
    console.error('Language Detection Error:', error);
    throw new Error(`Detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Dịch nhiều văn bản cùng một lúc
 * @param texts - Mảng các văn bản cần dịch
 * @param targetLanguage - Ngôn ngữ đích
 */
export async function translateMultiple(
  texts: string[],
  targetLanguage: string
): Promise<string[]> {
  try {
    if (!API_KEY) {
      throw new Error('GOOGLE_TRANSLATE_API_KEY is not configured');
    }

    const validTexts = texts.filter((t) => t && t.trim());

    if (validTexts.length === 0) {
      return [];
    }

    // Google Translate API hỗ trợ multiple texts bằng cách gửi từng q param
    const params = new URLSearchParams({
      key: API_KEY,
      target: targetLanguage,
    });

    validTexts.forEach((text) => {
      params.append('q', text);
    });

    const response = await fetch(`${TRANSLATE_API_URL}?${params.toString()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Batch Translation API error: ${response.statusText}`);
    }

    const data = await response.json();
    const translations = data.data?.translations || [];

    return translations.map((t: any) => t.translatedText);
  } catch (error) {
    console.error('Batch Translation Error:', error);
    throw new Error(`Batch translation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
