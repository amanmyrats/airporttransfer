import { Currency } from './currency.model';

describe('Currency', () => {
  it('should describe a currency shape', () => {
    const currency: Currency = { code: 'EUR', name: 'Euro', sign: '€', rate: 1 };
    expect(currency).toBeTruthy();
  });
});
