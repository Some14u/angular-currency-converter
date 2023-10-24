import { InjectionToken } from '@angular/core';
import { CurrencyService } from './currency.service';

export const CurrencyServiceToken = new InjectionToken<CurrencyService>(
  'CurrencyService'
);
