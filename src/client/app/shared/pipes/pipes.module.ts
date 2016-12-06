import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatePipe, EurCurrencyPipe } from './index';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [DatePipe, EurCurrencyPipe],
  providers: [],
  exports: [DatePipe, EurCurrencyPipe]
})

export class PipesModule { }
