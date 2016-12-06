import { Pipe, PipeTransform } from '@angular/core'
import * as moment from 'moment'

@Pipe({
   name: 'momentDate'
})
export class DatePipe implements PipeTransform {
   transform(date: any, format: string = 'dddd Do MMMM YYYY [à] HH[h]mm'): any {
     if (date) {
       let d = new Date(date)
       return moment(d).format(format);
     }
     return "";
   }
}