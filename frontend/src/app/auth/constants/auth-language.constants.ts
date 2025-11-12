export const AUTH_SUPPORTED_LANGUAGES = ['en', 'de', 'ru', 'tr'] as const;
export type AuthLanguageCode = (typeof AUTH_SUPPORTED_LANGUAGES)[number];
export const AUTH_FALLBACK_LANGUAGE: AuthLanguageCode = 'en';

export function normalizeAuthLanguage(code?: string | null): AuthLanguageCode {
  if (code && AUTH_SUPPORTED_LANGUAGES.includes(code as AuthLanguageCode)) {
    return code as AuthLanguageCode;
  }
  return AUTH_FALLBACK_LANGUAGE;
}
