import { LanguageCode, SUPPORTED_LANGUAGE_CODES } from '../../constants/language.contants';

export const ACCOUNT_SUPPORTED_LANGUAGES = SUPPORTED_LANGUAGE_CODES;
export type AccountLanguageCode = LanguageCode;
export const ACCOUNT_FALLBACK_LANGUAGE: AccountLanguageCode = SUPPORTED_LANGUAGE_CODES[0]!;

export function normalizeAccountLanguage(code?: string | null): AccountLanguageCode {
  if (code && ACCOUNT_SUPPORTED_LANGUAGES.includes(code as AccountLanguageCode)) {
    return code as AccountLanguageCode;
  }
  return ACCOUNT_FALLBACK_LANGUAGE;
}
