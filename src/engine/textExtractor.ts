/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';

// Configure pdfjs worker if available or disable worker in browser/container
if (typeof window !== 'undefined' && (pdfjsLib as any).GlobalWorkerOptions) {
  (pdfjsLib as any).GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
}

/**
 * Extract raw text from an ArrayBuffer of a PDF document.
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const loadingTask = (pdfjsLib as any).getDocument({
      data: new Uint8Array(arrayBuffer),
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
    });

    const pdfDocument = await loadingTask.promise;
    const textPieces: string[] = [];

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      textPieces.push(pageText);
    }

    return textPieces.join('\n\n');
  } catch (err: any) {
    console.warn('PDF extraction fallback via binary string scan:', err?.message);
    // Fallback naive text stream scan for basic text in PDF
    const textDecoder = new TextDecoder('utf-8', { fatal: false });
    const raw = textDecoder.decode(arrayBuffer);
    const cleaned = raw.replace(/[^\x20-\x7E\n\r\t]/g, ' ');
    const lines = cleaned.split(/\n+/).filter((l) => l.trim().length > 3);
    return lines.join('\n');
  }
}

/**
 * Extract raw text from an ArrayBuffer of a DOCX document using Mammoth.
 */
export async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value || '';
  } catch (err: any) {
    console.warn('DOCX extraction error:', err?.message);
    throw new Error(`Failed to extract text from DOCX document: ${err?.message}`);
  }
}

/**
 * Universal file processor: detects type by extension or mime, extracts text.
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const name = file.name.toLowerCase();

  if (name.endsWith('.pdf') || file.type === 'application/pdf') {
    const buffer = await file.arrayBuffer();
    return await extractTextFromPdf(buffer);
  }

  if (
    name.endsWith('.docx') ||
    file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const buffer = await file.arrayBuffer();
    return await extractTextFromDocx(buffer);
  }

  // Plain text (txt, md, rtf, etc.)
  return await file.text();
}
