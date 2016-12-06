import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SearchComponent } from './search.component';
import { GoogleMapsApiService } from '../shared/google-maps-api/index';
import { VehicleService } from '../shared/vehicle/index';
import { RequestService } from '../shared/request/index';
import { AUTH_PROVIDERS } from 'angular2-jwt/angular2-jwt';
// import { AUTH_PROVIDERS } from 'angular2-jwt';
import { AuthService } from '../shared/auth/index';
import { DatetimepickerModule } from '../shared/ng2-datetimepicker-wrapper/datetimepicker.module';
import { PipesModule } from '../shared/pipes/pipes.module';
// import { AgmCoreModule } from 'angular2-google-maps/core';

@NgModule({
  imports: [
    CommonModule, 
    ReactiveFormsModule,
    FormsModule,
    DatetimepickerModule,
    PipesModule,
    // AgmCoreModule.forRoot({apiKey: 'AIzaSyDg7Bv_Lg8bshdlF_WkMXAerHjzoHqqrVM'})
  ],
  declarations: [
    SearchComponent,
  ],
  exports: [SearchComponent],
  providers: [
    VehicleService,
    RequestService,
    GoogleMapsApiService,
    AUTH_PROVIDERS,
    AuthService
  ]
})

export class SearchModule { }
  