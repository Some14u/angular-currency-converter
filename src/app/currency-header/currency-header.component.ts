import { Component, OnInit } from '@angular/core';
import { CurrencyServiceImpl } from '../services/currency.service.impl';
import {
  CurrencyRate,
  ExchangeRateResponse,
} from '../services/currency.service';
import { SupportedCurrency } from '../services/supported-currency.enum';
import { formatCurrency } from '../shared/utils/format-currency.util';

@Component({
  selector: 'app-currency-header',
  templateUrl: './currency-header.component.html',
  styleUrls: ['./currency-header.component.sass'],
})
export class CurrencyHeaderComponent implements OnInit {
  exchangeRates: ExchangeRateResponse | undefined;
  usdToUah: CurrencyRate | undefined;
  eurToUah: CurrencyRate | undefined;

  constructor(private currencyService: CurrencyServiceImpl) {}

  ngOnInit(): void {
    this.currencyService
      .getExchangeRates(SupportedCurrency.UAH, [
        SupportedCurrency.EUR,
        SupportedCurrency.USD,
      ])
      .subscribe((exchangeRates) => {
        if (!exchangeRates.success) {
          return;
        }
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
      });
  }
}
