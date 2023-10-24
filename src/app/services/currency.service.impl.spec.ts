import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CurrencyServiceImpl } from './currency.service.impl';
import { ConversionResponse, ExchangeRateResponse } from './currency.service';
import { SupportedCurrency } from './supported-currency.enum';
import { HttpErrorResponse } from '@angular/common/http';

describe('CurrencyServiceImpl', () => {
  let service: CurrencyServiceImpl;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CurrencyServiceImpl],
    });
    service = TestBed.inject(CurrencyServiceImpl);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should retrieve exchange rates', (done) => {
    const baseCurrency = SupportedCurrency.UAH;
    const obtainableRates = [SupportedCurrency.USD, SupportedCurrency.EUR];
    const mockResponse: ExchangeRateResponse<
      typeof SupportedCurrency.UAH,
      typeof SupportedCurrency.USD | typeof SupportedCurrency.EUR
    > = {
      base: baseCurrency,
      rates: {
        [SupportedCurrency.USD]: 1.0,
        [SupportedCurrency.EUR]: 0.85,
      },
    };

    service
      .getExchangeRates(baseCurrency, obtainableRates)
      .subscribe((response) => {
        expect(response).toEqual(mockResponse);
        done();
      });

    const req = httpTestingController.expectOne((request) => {
      return (
        request.url ===
          CurrencyServiceImpl.API_URL +
            CurrencyServiceImpl.ApiEndpoint.LATEST &&
        request.headers.has('apikey') &&
        request.params.get('base') === mockResponse.base &&
        request.params.get('symbols') ===
          Object.keys(mockResponse.rates).join(',')
      );
    });

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should convert currency', (done) => {
    const fromCurrency = SupportedCurrency.USD;
    const toCurrency = SupportedCurrency.EUR;
    const amount = 100;
    const mockResponse: ConversionResponse<
      typeof SupportedCurrency.USD,
      typeof SupportedCurrency.EUR
    > = {
      query: { from: fromCurrency, to: toCurrency, amount },
      info: { rate: 0.85 },
      result: amount * 0.85,
    };

    service.convert(fromCurrency, toCurrency, amount).subscribe((response) => {
      expect(response).toEqual(mockResponse);
      done();
    });

    const req = httpTestingController.expectOne((request) => {
      return (
        request.url ===
          CurrencyServiceImpl.API_URL +
            CurrencyServiceImpl.ApiEndpoint.CONVERT &&
        request.headers.has('apikey')
      );
    });

    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should handle errors when retrieving exchange rates', (done) => {
    const errorEvent = new ProgressEvent('error', {
      loaded: 0,
      total: 0,
      lengthComputable: false,
    });

    service
      .getExchangeRates(SupportedCurrency.UAH, [SupportedCurrency.USD])
      .subscribe({
        error: (error) => {
          expect(error).toBeTruthy();
          expect(error instanceof HttpErrorResponse).toBeTruthy();
          done();
        },
      });

    httpTestingController
      .expectOne((req) => {
        return (
          req.url ===
          CurrencyServiceImpl.API_URL + CurrencyServiceImpl.ApiEndpoint.LATEST
        );
      })
      .error(errorEvent);
  });
  afterEach(() => {
    httpTestingController.verify();
  });
});
