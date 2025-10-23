import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../services/language.service';

type DurationDictionary = {
  minuteSingular: string;
  minutePlural: string;
  hourSingular: string;
  hourPlural: string;
};

const DURATION_TEXT: Record<string, DurationDictionary> = {
  en: {
    minuteSingular: 'min',
    minutePlural: 'mins',
    hourSingular: 'hr',
    hourPlural: 'hrs',
  },
  de: {
    minuteSingular: 'Min',
    minutePlural: 'Min',
    hourSingular: 'Std',
    hourPlural: 'Std',
  },
  ru: {
    minuteSingular: 'мин',
    minutePlural: 'мин',
    hourSingular: 'ч',
    hourPlural: 'ч',
  },
  tr: {
    minuteSingular: 'dk',
    minutePlural: 'dk',
    hourSingular: 'sa',
    hourPlural: 'sa',
  },
};

@Pipe({
  name: 'durationFormat',
  standalone: true,
})
export class DurationFormatPipe implements PipeTransform {
  constructor(private readonly languageService: LanguageService) {}

  transform(
    totalMinutes: number | null | undefined,
    langCode?: string | null
  ): string {
    if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) {
      return '';
    }

    const minutesRounded = Math.round(totalMinutes);
    const resolvedLang =
      (langCode ?? this.languageService.currentLang()?.code ?? 'en').toLowerCase();
    const dictionary = DURATION_TEXT[resolvedLang] || DURATION_TEXT['en'];

    if (minutesRounded < 60) {
      const minuteLabel =
        minutesRounded === 1
          ? dictionary.minuteSingular
          : dictionary.minutePlural;
      return `${minutesRounded} ${minuteLabel}`;
    }

    const hours = Math.floor(minutesRounded / 60);
    const remainingMinutes = minutesRounded % 60;
    const hourLabel = hours === 1 ? dictionary.hourSingular : dictionary.hourPlural;

    if (remainingMinutes === 0) {
      return `${hours} ${hourLabel}`;
    }

    const minuteLabel =
      remainingMinutes === 1 ? dictionary.minuteSingular : dictionary.minutePlural;
    return `${hours} ${hourLabel} ${remainingMinutes} ${minuteLabel}`;
  }
}
