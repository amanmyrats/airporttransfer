export const ACCOUNT_SUPPORTED_LANGUAGES = ['en', 'de', 'ru', 'tr'] as const;
export type AccountLanguageCode = (typeof ACCOUNT_SUPPORTED_LANGUAGES)[number];
export const ACCOUNT_FALLBACK_LANGUAGE: AccountLanguageCode = 'en';

export function normalizeAccountLanguage(code?: string | null): AccountLanguageCode {
  if (code && ACCOUNT_SUPPORTED_LANGUAGES.includes(code as AccountLanguageCode)) {
    return code as AccountLanguageCode;
  }
  return ACCOUNT_FALLBACK_LANGUAGE;
}
