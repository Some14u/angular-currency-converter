import { Observable } from 'rxjs';
import { SupportedCurrency } from './supported-currency.enum';

export interface CurrencyService {
  getExchangeRates<
    Base extends SupportedCurrency = SupportedCurrency,
    Rates extends SupportedCurrency = SupportedCurrency
  >(
    base: Base,
    obtanableRates: Rates[]
  ): Observable<ApiExchangeRateResponse<Base, Rates>>;

  convert<
    From extends SupportedCurrency = SupportedCurrency,
    To extends SupportedCurrency = SupportedCurrency
  >(
    from: From,
    to: To,
    amount: number
  ): Observable<ApiConversionResponse<From, To>>;
}

export type SupportedCurrency =
  (typeof SupportedCurrency)[keyof typeof SupportedCurrency];

export interface CurrencyRate<
  From extends SupportedCurrency = SupportedCurrency,
  To extends SupportedCurrency = SupportedCurrency
> {
  from: From;
  to: To;
  rate: number;
}

export interface ApiExchangeRateResponse<
  Base extends SupportedCurrency = SupportedCurrency,
  Rates extends SupportedCurrency = SupportedCurrency
> {
  base: Base;
  rates: { [key in Rates]: number };
}

export interface ApiConversionResponse<
  From extends SupportedCurrency = SupportedCurrency,
  To extends SupportedCurrency = SupportedCurrency
> {
  query: {
    from: From;
    to: To;
    amount: number;
  };
  info: {
    rate: number;
  };
  result: number;
}
