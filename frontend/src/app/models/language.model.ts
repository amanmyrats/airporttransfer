import { LanguageCode } from '../constants/language.contants';

export class Language {
  code!: LanguageCode;
  name!: string;
  flag!: string;
  url?: string;
}
