import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { CurrencyServiceImpl } from '../services/currency.service.impl';
import { type SupportedCurrency } from '../services/currency.service';
import { SupportedCurrency as Currency } from '../services/supported-currency.enum';
import {
  Subscription,
  catchError,
  debounceTime,
  distinctUntilChanged,
  map,
  throwError,
} from 'rxjs';
import { formatCurrency } from '../shared/utils/format-currency.util';

@Component({
  selector: 'app-currency-converter',
  templateUrl: './currency-converter.component.html',
  styleUrls: ['./currency-converter.component.sass'],
})
export class CurrencyConverterComponent implements OnInit, OnDestroy {
  static readonly CONVERSION_REQUEST_ERROR =
    'An error occurred during conversion. Please try again later.';
  static readonly DEBOUNCE_TIME_MS = 500;

  currencyConversionForm: FormGroup;

  supportedCurrencies = Object.values(Currency);

  firstAmount: FormControl<number | null>;

  firstCurrency: FormControl<SupportedCurrency | null>;

  secondAmount: FormControl<number | null>;

  secondCurrency: FormControl<SupportedCurrency | null>;

  errorMessage: string | null = null;

  valueChangeSubscription: Subscription | null = null;

  constructor(
    private formBuilder: FormBuilder,
    private currencyService: CurrencyServiceImpl
  ) {
    this.firstAmount = new FormControl(0, [Validators.min(0)]);
    this.firstCurrency = new FormControl(Currency.UAH);
    this.secondAmount = new FormControl(0, [Validators.min(0)]);
    this.secondCurrency = new FormControl(Currency.USD);

    this.currencyConversionForm = this.formBuilder.group({
      firstAmount: this.firstAmount,
      firstCurrency: this.firstCurrency,
      secondAmount: this.secondAmount,
      secondCurrency: this.secondCurrency,
    });
  }

  ngOnInit() {
    this.subscribeFieldChanges();
  }

  ngOnDestroy() {
    this.unsubscribeFieldChanges();
  }

  updateConversion() {
    this.unsubscribeFieldChanges();

    if (!this.firstCurrency.value || !this.secondCurrency.value) {
      this.subscribeFieldChanges();
      return; // No need to convert if no currencies been selected
    }

    if (this.firstAmount.value === null && this.secondAmount.value === null) {
      this.subscribeFieldChanges();
      return; // No need to convert if both amounts are empty
    }

    if (this.firstAmount.dirty || this.firstCurrency.dirty) {
      this.doConversion(
        this.firstCurrency.value,
        this.secondCurrency.value,
        this.firstAmount,
        this.secondAmount
      );
    } else if (this.secondAmount.dirty || this.secondCurrency.dirty) {
      this.doConversion(
        this.secondCurrency.value,
        this.firstCurrency.value,
        this.secondAmount,
        this.firstAmount
      );
    }

    this.subscribeFieldChanges();
  }

  private doConversion(
    fromCurrency: SupportedCurrency,
    toCurrency: SupportedCurrency,
    fromAmountControl: FormControl<number | null>,
    toAmountControl: FormControl<number | null>
  ) {
    if (fromAmountControl.value === null || !fromAmountControl.valid) {
      return;
    }

    if (fromAmountControl.value === 0) {
      toAmountControl.patchValue(0);
      this.currencyConversionForm.markAsPristine();
      return;
    }

    this.currencyService
      .convert(fromCurrency, toCurrency, fromAmountControl.value)
      .pipe(
        map((response) => {
          if (response.success) {
            return response;
          }
          throw new Error();
        }),
        catchError((error) => {
          this.errorMessage =
            CurrencyConverterComponent.CONVERSION_REQUEST_ERROR;
          return throwError(() => error);
        })
      )
      .subscribe((response) => {
        toAmountControl.patchValue(formatCurrency(response.result));
        this.errorMessage = null;
      });
    this.currencyConversionForm.markAsPristine();
  }

  private unsubscribeFieldChanges() {
    this.valueChangeSubscription?.unsubscribe();
  }

  private subscribeFieldChanges() {
    this.valueChangeSubscription = this.currencyConversionForm.valueChanges
      .pipe(
        debounceTime(CurrencyConverterComponent.DEBOUNCE_TIME_MS),
        distinctUntilChanged()
      )
      .subscribe(() => {
        this.updateConversion();
      });
  }
}
