import { CurrencyCode } from '../constants/currency.constants';

export interface Currency {
  code: CurrencyCode;
  sign: string;
  name: string;
  rate: number;
}
