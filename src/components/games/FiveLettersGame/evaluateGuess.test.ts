// components/games/FiveLettersGame/evaluateGuess.test.ts
// «Открыть букву» в «5 буквах»: открывается первая ещё не отгаданная буква.

import { evaluateGuess, letterToReveal } from './evaluateGuess';

describe('letterToReveal', () => {
  it('без попыток — первая буква', () => {
    expect(letterToReveal([], 5)).toBe(0);
  });

  it('отгаданные на своём месте буквы пропускаются', () => {
    const results = [evaluateGuess('ДОЛГИ', 'ДОХОД')];
    expect(results[0].slice(0, 2)).toEqual(['correct', 'correct']);
    expect(letterToReveal(results, 5)).toBe(2);
  });

  it('жёлтая буква не считается отгаданной', () => {
    const results = [evaluateGuess('ОДЕЯЛ', 'ДОХОД')];
    expect(letterToReveal(results, 5)).toBe(0);
  });

  it('буква, отгаданная в любой из попыток, — пропускается', () => {
    const results = [evaluateGuess('ДЫМОК', 'ДОХОД'), evaluateGuess('КОРАН', 'ДОХОД')];
    expect(letterToReveal(results, 5)).toBe(2);
  });
});
