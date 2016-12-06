import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'eurCurrency'
})
export class EurCurrencyPipe implements PipeTransform {
  transform(value: number): string {
    try {
      return value.toFixed(2).replace('.', ',') + "€";
    }
    catch (error) {
      return 'Prix inconnu';
    }
  }
}