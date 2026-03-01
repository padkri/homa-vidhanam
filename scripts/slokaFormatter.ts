/**
 * Script detection and sloka formatting for PDF-extracted text.
 * Detects Telugu, Devanagari, and Roman (Latin transliteration) scripts
 * and maps text to the correct SlokaSchema fields.
 */

export type ScriptType = 'english' | 'telugu' | 'devanagari';

export interface FormattedSloka {
  english: string;
  telugu: string;
  devanagari: string;
  swara_enabled: boolean;
}

/** Telugu Unicode range U+0C00–U+0C7F */
const TELUGU_REGEX = /[\u0C00-\u0C7F]/g;

/** Devanagari Unicode range U+0900–U+097F, plus Vedic extensions U+1CD0–U+1CFF */
const DEVANAGARI_REGEX = /[\u0900-\u097F\u1CD0-\u1CFF]/g;

/** Vedic accent markers (svarita, udaatta, etc.) indicating swara-enabled text */
const VEDIC_ACCENT_REGEX = /[\u0951-\u0954\u1CD0-\u1CFF]/;

/**
 * Detect the dominant script of a text string.
 * Counts characters in each Unicode range and returns the script with the most matches.
 * Falls back to 'english' (Roman transliteration) if no Indic script dominates.
 */
export function detectScript(text: string): ScriptType {
  const teluguCount = (text.match(TELUGU_REGEX) || []).length;
  const devanagariCount = (text.match(DEVANAGARI_REGEX) || []).length;

  if (teluguCount === 0 && devanagariCount === 0) {
    return 'english';
  }

  return teluguCount > devanagariCount ? 'telugu' : 'devanagari';
}

/**
 * Check if text contains Vedic accent markers (swara notation).
 */
export function hasSwaraMarkers(text: string): boolean {
  return VEDIC_ACCENT_REGEX.test(text);
}

/**
 * Format a single text block into a SlokaSchema-compatible object.
 * Detects the script and places text in the appropriate field.
 * Other script fields are left as empty strings.
 */
export function formatSloka(text: string): FormattedSloka {
  const script = detectScript(text);
  return {
    english: script === 'english' ? text.trim() : '',
    telugu: script === 'telugu' ? text.trim() : '',
    devanagari: script === 'devanagari' ? text.trim() : '',
    swara_enabled: hasSwaraMarkers(text),
  };
}

/**
 * Merge multiple text blocks (potentially in different scripts) into a single sloka.
 * Each block is detected independently and placed in the appropriate field.
 */
export function mergeSlokaParts(parts: string[]): FormattedSloka {
  const result: FormattedSloka = {
    english: '',
    telugu: '',
    devanagari: '',
    swara_enabled: false,
  };

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;

    const script = detectScript(trimmed);
    if (result[script] && result[script].length > 0) {
      result[script] += '\n' + trimmed;
    } else {
      result[script] = trimmed;
    }

    if (hasSwaraMarkers(trimmed)) {
      result.swara_enabled = true;
    }
  }

  return result;
}
