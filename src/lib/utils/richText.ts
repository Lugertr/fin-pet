// src/lib/utils/richText.ts
// Простейшая инлайн-разметка для текста карточек урока: **term** выделяется.

export interface RichTextSegment {
  text: string;
  highlighted: boolean;
}

export function parseInlineHighlights(text: string): RichTextSegment[] {
  const parts = text.split(/(\*\*.+?\*\*)/g).filter((part) => part.length > 0);

  return parts.map((part) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return { text: part.slice(2, -2), highlighted: true };
    }
    return { text: part, highlighted: false };
  });
}
