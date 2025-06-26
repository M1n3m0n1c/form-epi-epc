import { customAlphabet } from 'nanoid';

// Alfabeto personalizado sem caracteres ambíguos (0, O, I, l, 1)
const SAFE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';

// Gerador de nanoid com alfabeto seguro
const nanoid = customAlphabet(SAFE_ALPHABET, 12);

/**
 * Gera um token único criptograficamente seguro para formulários
 * @returns Token único de 12 caracteres
 */
export function generateFormToken(): string {
  return nanoid();
}

/**
 * Gera um token único mais longo para casos especiais
 * @param length Comprimento do token (padrão: 16)
 * @returns Token único
 */
export function generateLongToken(length: number = 16): string {
  const longNanoid = customAlphabet(SAFE_ALPHABET, length);
  return longNanoid();
}

/**
 * Valida se um token tem o formato esperado
 * @param token Token a ser validado
 * @returns true se o token é válido
 */
export function validateTokenFormat(token: string): boolean {
  // Verifica se tem o comprimento correto (12 ou 16 caracteres)
  if (token.length !== 12 && token.length !== 16) {
    return false;
  }

  // Verifica se contém apenas caracteres do alfabeto seguro
  const validChars = new Set(SAFE_ALPHABET);
  return token.split('').every(char => validChars.has(char));
}

/**
 * Gera múltiplos tokens únicos de uma vez
 * @param count Número de tokens a gerar
 * @returns Array de tokens únicos
 */
export function generateMultipleTokens(count: number): string[] {
  const tokens = new Set<string>();

  while (tokens.size < count) {
    tokens.add(generateFormToken());
  }

  return Array.from(tokens);
}

/**
 * Calcula a entropia de um token baseado no alfabeto usado
 * @param tokenLength Comprimento do token
 * @returns Bits de entropia
 */
export function calculateTokenEntropy(tokenLength: number): number {
  return Math.log2(SAFE_ALPHABET.length) * tokenLength;
}

// Constantes úteis
export const TOKEN_CONSTANTS = {
  DEFAULT_LENGTH: 12,
  LONG_LENGTH: 16,
  ALPHABET: SAFE_ALPHABET,
  ENTROPY_12_CHARS: calculateTokenEntropy(12), // ~70 bits
  ENTROPY_16_CHARS: calculateTokenEntropy(16), // ~93 bits
} as const;
