import {Component, AfterViewChecked, AfterViewInit, EventEmitter, Output, Input} from '@angular/core';
import * as moment from 'moment'
import { Moment } from 'moment';
import 'moment/locale/fr';


declare var jQuery:any;

@Component({
  moduleId: module.id,
  selector: 'ng2-datetimepicker',
  templateUrl: `datetimepicker.component.html`
})

export class DatetimepickerComponent implements AfterViewInit {
  @Input() ID: string;
  @Input() minDate: Moment;
  @Input() defaultDate: Moment;
  
  @Output() dateSelected: EventEmitter<string> = new EventEmitter<string>();
  
  private date: string;
  private minDateApplied: Moment;

  ngAfterViewInit(): void {
    console.log("##### ngAfterViewInit #####");
    let datetimepickerElement = jQuery('#' + this.ID);
    datetimepickerElement.datetimepicker({
      // format: 'dddd D MMMM YYYY [à] HH[h]mm',
      format: 'DD MM YYYY HH:mm',
      inline: true,
      sideBySide: true,
      stepping: 5,
      locale: 'fr',
      defaultDate: this.defaultDate
    });
    if (this.minDate)
      datetimepickerElement.data("DateTimePicker").minDate(this.minDate);
    datetimepickerElement.on('dp.change', (e: any) => {
      // console.log("dp.change");
      this.date = e.date;
      this.dateSelected.emit(this.date);
    });
  }

}
