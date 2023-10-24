import { Component, OnInit } from '@angular/core';
import { CurrencyServiceImpl } from '../services/currency.service.impl';
import {
  CurrencyRate,
  ApiExchangeRateResponse,
} from '../services/currency.service';
import { SupportedCurrency } from '../services/supported-currency.enum';
import { formatCurrency } from '../shared/utils/format-currency.util';
import { HttpErrorResponse, HttpStatusCode } from '@angular/common/http';

@Component({
  selector: 'app-currency-header',
  templateUrl: './currency-header.component.html',
  styleUrls: ['./currency-header.component.sass'],
})
export class CurrencyHeaderComponent implements OnInit {
  SPINNER_URL = 'assets/spinner.svg';

  exchangeRates: ApiExchangeRateResponse | undefined;
  usdToUah: CurrencyRate | undefined;
  eurToUah: CurrencyRate | undefined;

  isLoading = true;
  errorMessage: string | null = null;

  constructor(private currencyService: CurrencyServiceImpl) {}

  ngOnInit(): void {
    this.currencyService
      .getExchangeRates(SupportedCurrency.UAH, [
        SupportedCurrency.EUR,
        SupportedCurrency.USD,
      ])
      .subscribe({
        next: (exchangeRates) => {
          this.isLoading = false;

          this.usdToUah = this.currencyService.extractInvertedRate(
            exchangeRates,
            SupportedCurrency.USD
          );

          this.eurToUah = this.currencyService.extractInvertedRate(
            exchangeRates,
            SupportedCurrency.EUR
          );

          this.usdToUah.rate = formatCurrency(this.usdToUah.rate);
          this.eurToUah.rate = formatCurrency(this.eurToUah.rate);
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = (error as Error).message;
        },
      });
  }
}
