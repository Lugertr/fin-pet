export function simpleHash(str: string): string {
  let hash = 0;
  const salt = 'fin-pet-2025';
  const strWithSalt = salt + str + salt;

  for (let i = 0; i < strWithSalt.length; i++) {
    const char = strWithSalt.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }

  const positiveHash = Math.abs(hash);
  return positiveHash.toString(36).padStart(8, '0');
}

export function validatePin(pin: string): { valid: boolean; error?: string } {
  if (pin.length !== 4) {
    return { valid: false, error: 'PIN должен содержать 4 цифры' };
  }
  if (!/^\d{4}$/.test(pin)) {
    return { valid: false, error: 'PIN должен содержать только цифры' };
  }
  return { valid: true };
}
