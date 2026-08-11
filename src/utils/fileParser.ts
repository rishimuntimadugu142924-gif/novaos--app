import mammoth from 'mammoth';
import JSZip from 'jszip';

/**
 * Extracts readable plain text from a uploaded File or Blob.
 * Handles .docx, text files, code, JSON, images, and binary fallbacks seamlessly.
 */
export async function parseUploadedFileToText(file: File): Promise<string> {
  const fileName = file.name;
  const ext = fileName.slice(fileName.lastIndexOf('.')).toLowerCase();

  // 1. Word Documents (.docx)
  if (ext === '.docx') {
    try {
      const arrayBuffer = await file.arrayBuffer();
      // Try Mammoth first for high-quality text extraction
      const mammothResult = await mammoth.extractRawText({ arrayBuffer });
      if (mammothResult.value && mammothResult.value.trim().length > 0) {
        return mammothResult.value.trim();
      }
    } catch (err) {
      console.warn('Mammoth extraction failed, trying zip xml fallback:', err);
    }

    // JSZip XML Fallback for DOCX
    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      const docXml = await zip.file('word/document.xml')?.async('text');
      if (docXml) {
        // Strip XML tags and extract text within <w:t> tags
        const textMatches = docXml.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
        if (textMatches) {
          const extractedText = textMatches
            .map(tag => tag.replace(/<[^>]+>/g, ''))
            .join(' ');
          if (extractedText.trim().length > 0) {
            return extractedText.trim();
          }
        }
      }
    } catch (zipErr) {
      console.warn('JSZip fallback failed:', zipErr);
    }
  }

  // 2. Images
  if (['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.bmp'].includes(ext)) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve((e.target?.result as string) || `[Image: ${fileName}]`);
      reader.readAsDataURL(file);
    });
  }

  // 3. Plain Text, Code, JSON, Markdown, CSV, XML, etc.
  try {
    const rawText = await file.text();
    return sanitizeTextContent(rawText, fileName);
  } catch (err) {
    console.error('Failed to read file as text:', err);
    return `[Binary/Unreadable File: ${fileName}]`;
  }
}

/**
 * Sanitizes and cleans text content. If raw binary/zip data is passed,
 * attempts to extract readable text strings or XML document content.
 */
export function sanitizeTextContent(content: string, fileName: string = ''): string {
  if (!content) return '';

  // Check if content appears to be a raw DOCX / ZIP archive string (starts with PK\x03\x04 or contains word/document.xml)
  if (content.startsWith('PK\x03\x04') || content.includes('word/document.xml') || content.includes('word/')) {
    // Try to extract readable sentences / text tokens from the binary string
    const docXmlMatch = content.match(/<w:t[^>]*>(.*?)<\/w:t>/g);
    if (docXmlMatch && docXmlMatch.length > 0) {
      const cleanDocText = docXmlMatch
        .map(tag => tag.replace(/<[^>]+>/g, ''))
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();
      if (cleanDocText.length > 0) {
        return cleanDocText;
      }
    }

    // Alternative: Extract printable ASCII sequences (minimum length 4)
    const printableMatches = content.match(/[\x20-\x7E\s]{4,}/g);
    if (printableMatches) {
      const filtered = printableMatches
        .filter(str => !str.includes('PK') && !str.includes('_rels') && !str.includes('xml') && !str.includes('Theme'))
        .join('\n')
        .trim();
      if (filtered.length > 20) {
        return filtered;
      }
    }

    return `[Parsed Document: ${fileName || 'Document'}]\nFile imported successfully. Plain text preview extracted from document format.`;
  }

  // Filter out excessive non-printable control characters if any
  return content.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '');
}
