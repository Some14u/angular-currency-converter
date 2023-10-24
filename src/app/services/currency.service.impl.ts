import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import {
  ApiConversionResponse,
  CurrencyRate,
  CurrencyService,
  ApiExchangeRateResponse,
  SupportedCurrency,
} from './currency.service';
import { environment } from 'src/environments/environment';
import { getInvertedCurrencyRate } from '../shared/utils/get-inverted-currency-rate.util';
import { handleServiceError as handleCurrencyApiErrors } from './tools/convert-error.tool';

@Injectable({
  providedIn: 'root',
})
export class CurrencyServiceImpl implements CurrencyService {
  static API_URL = 'https://api.apilayer.com/exchangerates_data';
  static ApiEndpoint = {
    LATEST: '/latest',
    CONVERT: '/convert',
  } as const;

  private headers: HttpHeaders;

  private cachedRates: Map<SupportedCurrency, Map<SupportedCurrency, number>>;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({
      apikey: environment.currencyServiceApiKey,
    });
    this.cachedRates = new Map();
  }

  getExchangeRates<
    Base extends SupportedCurrency = SupportedCurrency,
    Rates extends SupportedCurrency = SupportedCurrency
  >(
    base: Base,
    obtainableRates: Rates[]
  ): Observable<ApiExchangeRateResponse<Base, Rates>> {
    const symbols = obtainableRates.join(',');

    const params = new HttpParams().set('base', base).set('symbols', symbols);

    return this.http
      .get<ApiExchangeRateResponse<Base, Rates>>(
        CurrencyServiceImpl.API_URL + CurrencyServiceImpl.ApiEndpoint.LATEST,
        {
          headers: this.headers,
          params,
        }
      )
      .pipe(
        tap((response) => this.collectRatesToCache(response)),
        catchError(handleCurrencyApiErrors)
      );
  }

  convert<
    From extends SupportedCurrency = SupportedCurrency,
    To extends SupportedCurrency = SupportedCurrency
  >(
    from: From,
    to: To,
    amount: number
  ): Observable<ApiConversionResponse<From, To>> {
    const cachedResult = this.convertUsingCache(from, to, amount);

    if (cachedResult) {
      return of(cachedResult);
    }

    const params = new HttpParams()
      .set('from', from)
      .set('to', to)
      .set('amount', amount.toString());
    return this.http
      .get<ApiConversionResponse<From, To>>(
        CurrencyServiceImpl.API_URL + CurrencyServiceImpl.ApiEndpoint.CONVERT,
        {
          headers: this.headers,
          params,
        }
      )
      .pipe(
        tap((response) => this.collectRatesToCache(response)),
        catchError(handleCurrencyApiErrors)
      );
  }

  public extractRate<
    From extends SupportedCurrency = SupportedCurrency,
    To extends SupportedCurrency = SupportedCurrency
  >(
    rateResponse:
      | ApiExchangeRateResponse<From, To>
      | ApiConversionResponse<From, To>,
    toCurrency: To
  ): CurrencyRate<From, To> {
    if ('rates' in rateResponse) {
      return {
        from: rateResponse.base,
        to: toCurrency,
        rate: rateResponse.rates[toCurrency],
      };
    } else {
      return {
        from: rateResponse.query.from,
        to: rateResponse.query.to,
        rate: rateResponse.info.rate,
      };
    }
  }

  public extractInvertedRate<
    From extends SupportedCurrency = SupportedCurrency,
    To extends SupportedCurrency = SupportedCurrency
  >(
    rateResponse:
      | ApiExchangeRateResponse<From, To>
      | ApiConversionResponse<From, To>,
    toCurrency: To
  ): CurrencyRate<To, From> {
    const normalRate = this.extractRate(rateResponse, toCurrency);
    return {
      from: normalRate.to,
      to: normalRate.from,
      rate: getInvertedCurrencyRate(normalRate.rate),
    };
  }

  private collectRatesToCache<
    From extends SupportedCurrency = SupportedCurrency,
    To extends SupportedCurrency = SupportedCurrency
  >(
    rateResponse:
      | ApiExchangeRateResponse<From, To>
      | ApiConversionResponse<From, To>
  ) {
    if ('rates' in rateResponse) {
      for (const currency of Object.keys(rateResponse.rates) as To[]) {
        const rate = this.extractRate(rateResponse, currency);
        this.addRateToCache(rate);
      }
    } else {
      const rate = this.extractRate(rateResponse, rateResponse.query.to);
      this.addRateToCache(rate);
    }
  }

  // Adds both normal and inverted rates + self-rate
  private addRateToCache(currencyRate: CurrencyRate) {
    const from =
      this.cachedRates.get(currencyRate.from) ||
      new Map<SupportedCurrency, number>();
    const to =
      this.cachedRates.get(currencyRate.to) ||
      new Map<SupportedCurrency, number>();

    from.set(currencyRate.from, 1);
    to.set(currencyRate.to, 1);

    from.set(currencyRate.to, currencyRate.rate);
    to.set(currencyRate.from, getInvertedCurrencyRate(currencyRate.rate));

    this.cachedRates.set(currencyRate.from, from);
    this.cachedRates.set(currencyRate.to, to);
  }

  private convertUsingCache<
    From extends SupportedCurrency = SupportedCurrency,
    To extends SupportedCurrency = SupportedCurrency
  >(
    from: From,
    to: To,
    amount: number
  ): ApiConversionResponse<From, To> | null {
    const cache = this.cachedRates.get(from);
    const rate = cache?.get(to);

    if (!rate) {
      return null;
    }

    return {
      query: {
        from,
        to,
        amount,
      },
      info: {
        rate,
      },
      result: rate * amount,
    };
  }
}
