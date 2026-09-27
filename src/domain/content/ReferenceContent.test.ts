// domain/content/ReferenceContent.test.ts
// Словарь игры: поиск и целостность контента (content/glossary.json).

import glossaryJson from '../../../content/glossary.json';
import documentsJson from '../../../content/documents.json';
import { DocumentContent, filterGlossary, GlossaryTermContent } from './ReferenceContent';

const GLOSSARY = glossaryJson as GlossaryTermContent[];

describe('filterGlossary', () => {
  const terms: GlossaryTermContent[] = [
    { id: 'coin', term: 'Монета', definition: 'игровые деньги' },
    { id: 'savings', term: 'Накопления', definition: 'копилка до большой цели' },
    { id: 'hedgehog', term: 'Ёжик', definition: 'не про деньги' },
  ];

  it('пустой запрос — весь словарь', () => {
    expect(filterGlossary(terms, '  ')).toHaveLength(3);
  });

  it('ищет по слову без учёта регистра', () => {
    expect(filterGlossary(terms, 'МОНЕ').map((t) => t.id)).toEqual(['coin']);
  });

  it('ищет и по объяснению', () => {
    expect(filterGlossary(terms, 'копилка').map((t) => t.id)).toEqual(['savings']);
  });

  it('«е» и «ё» не различаются', () => {
    expect(filterGlossary(terms, 'ежик').map((t) => t.id)).toEqual(['hedgehog']);
  });
});

describe('content/glossary.json', () => {
  it('у каждого слова есть id, слово и объяснение; id уникальны', () => {
    const ids = new Set<string>();
    for (const item of GLOSSARY) {
      expect(item.id).toBeTruthy();
      expect(item.term.trim()).not.toBe('');
      expect(item.definition.trim()).not.toBe('');
      expect(ids.has(item.id)).toBe(false);
      ids.add(item.id);
    }
  });

  it('валюта в объяснениях — «C», без ⭐ и ₽', () => {
    for (const item of GLOSSARY) {
      expect(item.definition).not.toMatch(/[⭐₽]/);
    }
  });
});

describe('content/documents.json', () => {
  it('корректный список (пока пустой)', () => {
    expect(Array.isArray(documentsJson as DocumentContent[])).toBe(true);
  });
});
