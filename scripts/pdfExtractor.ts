import * as fs from 'fs';
import pdfParse from 'pdf-parse';

export interface ExtractionResult {
  pages: string[];
  totalPages: number;
  hasUnicode: {
    telugu: boolean;
    devanagari: boolean;
  };
}

/** Telugu Unicode range U+0C00–U+0C7F */
const TELUGU_REGEX = /[\u0C00-\u0C7F]/;

/** Devanagari Unicode range U+0900–U+097F */
const DEVANAGARI_REGEX = /[\u0900-\u097F]/;

/**
 * Extract text from a PDF file, returning one string per page.
 */
export async function extractPages(pdfPath: string): Promise<ExtractionResult> {
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`PDF file not found: ${pdfPath}`);
  }

  const dataBuffer = fs.readFileSync(pdfPath);
  const pages: string[] = [];

  // pdf-parse custom page renderer to get per-page text
  const options = {
    pagerender: (pageData: any) => {
      return pageData.getTextContent().then((textContent: any) => {
        let lastY: number | null = null;
        let text = '';
        for (const item of textContent.items) {
          // Detect line breaks by Y-position changes
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 2) {
            text += '\n';
          }
          text += item.str;
          lastY = item.transform[5];
        }
        return text;
      });
    },
  };

  const data = await pdfParse(dataBuffer, options);

  // pdf-parse with custom pagerender returns pages joined by newlines in data.text
  // but we capture per-page via the numpages count and the text splitting
  // With custom pagerender, data.text contains each page's rendered text separated by \n\n
  const rawPages = data.text.split(/\n\n(?=.)/);

  // Normalize: trim each page, filter out empty pages
  for (const page of rawPages) {
    const trimmed = page.trim();
    if (trimmed.length > 0) {
      pages.push(trimmed);
    }
  }

  // If splitting didn't work well (single block), fall back to returning as single page
  if (pages.length === 0 && data.text.trim().length > 0) {
    pages.push(data.text.trim());
  }

  const fullText = data.text;
  return {
    pages,
    totalPages: data.numpages,
    hasUnicode: {
      telugu: TELUGU_REGEX.test(fullText),
      devanagari: DEVANAGARI_REGEX.test(fullText),
    },
  };
}

/**
 * Extract all text from a PDF as a single string (useful for simpler processing).
 */
export async function extractFullText(pdfPath: string): Promise<string> {
  const result = await extractPages(pdfPath);
  return result.pages.join('\n\n');
}
