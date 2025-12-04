import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '../../constants/language.contants';

export const AUTH_SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGE_CODES;
export type AuthLanguageCode = LanguageCode;
export const AUTH_FALLBACK_LANGUAGE: AuthLanguageCode = SUPPORTED_LANGUAGE_CODES[0]!;

export function normalizeAuthLanguage(code?: string | null): AuthLanguageCode {
  if (code && AUTH_SUPPORTED_LANGUAGES.includes(code as AuthLanguageCode)) {
    return code as AuthLanguageCode;
  }
  return AUTH_FALLBACK_LANGUAGE;
}
