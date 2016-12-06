import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatetimepickerComponent } from './index';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [DatetimepickerComponent],
  providers: [],
  exports: [DatetimepickerComponent]
})

export class DatetimepickerModule { }
