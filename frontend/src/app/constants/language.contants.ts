export const SUPPORTED_LANGUAGES = [
  {
    code: 'en',
    name: 'English',
    flag: 'flags/gb.svg',
    url: 'en',
  },
  {
    code: 'de',
    name: 'Deutsch',
    flag: 'flags/de.svg',
    url: 'de',
  },
  {
    code: 'ru',
    name: 'Русский',
    flag: 'flags/ru.svg',
    url: 'ru',
  },
  {
    code: 'tr',
    name: 'Türkçe',
    flag: 'flags/tr.svg',
    url: 'tr',
  },
] as const;

export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export type LanguageCode = SupportedLanguage['code'];
export const SUPPORTED_LANGUAGE_CODES: readonly LanguageCode[] = SUPPORTED_LANGUAGES.map(
  (lang) => lang.code,
);
