import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ng2-tooltip';
import { PoiComponent, ParkingDetailComponent } from './index';
import { AgmCoreModule } from 'angular2-google-maps/core/index';
import { Ng2Bs3ModalModule } from 'ng2-bs3-modal/ng2-bs3-modal';
import { DatetimepickerModule } from '../../shared/ng2-datetimepicker-wrapper/datetimepicker.module';
import { ParkingService } from '../../shared/parking/index';
import { PipesModule } from '../../shared/pipes/pipes.module';

import { SanitizeHtml } from 'ng2-sanitize/ng2-sanitize';


@NgModule({
  imports: [
    CommonModule,
    TooltipModule,
    Ng2Bs3ModalModule,
    FormsModule,
    ReactiveFormsModule,
    DatetimepickerModule,
    PipesModule,
    // AgmCoreModule.forRoot({apiKey: 'AIzaSyDg7Bv_Lg8bshdlF_WkMXAerHjzoHqqrVM'}),
  ],
  declarations: [
    PoiComponent,
    ParkingDetailComponent,
    SanitizeHtml,
   ],
  // providers: [AUTH_PROVIDERS, AuthService],
  providers: [ParkingService],
  exports: [
    PoiComponent,
    ParkingDetailComponent
  ],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA]
})

export class PoiModule {
}


