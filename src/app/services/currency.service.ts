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
}

export interface ExchangeRateResponse<
  Base extends SupportedCurrency = SupportedCurrency,
  Rates extends SupportedCurrency = SupportedCurrency
> {
  success: boolean;
  timestamp: number;
  base: Base;
  date: string;
  rates: { [key in Rates]: number };
}

export interface ConversionResponse<
  From extends SupportedCurrency = SupportedCurrency,
  To extends SupportedCurrency = SupportedCurrency
> {
  success: boolean;
  query: {
    from: From;
    to: To;
    amount: number;
  };
  info: {
    timestamp: number;
    rate: number;
  };
  historical: string;
  date: string;
  result: number;
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
