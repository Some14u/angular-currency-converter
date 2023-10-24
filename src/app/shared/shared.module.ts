import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ErrorComponent } from './error/error.component';
import { LoaderComponent } from './loader/loader.component';

@NgModule({
  declarations: [ErrorComponent, LoaderComponent],
  imports: [CommonModule],
  exports: [ErrorComponent, LoaderComponent],
})
export class SharedModule {}
