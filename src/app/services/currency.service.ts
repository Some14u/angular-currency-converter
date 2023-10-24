import { Observable } from 'rxjs';
import { SupportedCurrency } from './supported-currency.enum';

export interface CurrencyService {
  getExchangeRates<
    Base extends SupportedCurrency = SupportedCurrency,
    Rates extends SupportedCurrency = SupportedCurrency
  >(
    base: Base,
    obtanableRates: Rates[]
  ): Observable<ExchangeRateResponse<Base, Rates>>;

  convert<
    From extends SupportedCurrency = SupportedCurrency,
    To extends SupportedCurrency = SupportedCurrency
  >(
    from: From,
    to: To,
    amount: number
  ): Observable<ConversionResponse<From, To>>;

  extractRate<
    From extends SupportedCurrency = SupportedCurrency,
    To extends SupportedCurrency = SupportedCurrency
  >(
    rateResponse: ExchangeRateResponse<From, To> | ConversionResponse<From, To>,
    toCurrency: To
  ): CurrencyRate<From, To>;

  extractInvertedRate<
    From extends SupportedCurrency = SupportedCurrency,
    To extends SupportedCurrency = SupportedCurrency
  >(
    rateResponse: ExchangeRateResponse<From, To> | ConversionResponse<From, To>,
    toCurrency: To
  ): CurrencyRate<To, From>;
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

export interface ExchangeRateResponse<
  Base extends SupportedCurrency = SupportedCurrency,
  Rates extends SupportedCurrency = SupportedCurrency
> {
  base: Base;
  rates: { [key in Rates]: number };
}

export interface ConversionResponse<
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
