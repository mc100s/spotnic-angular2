import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, RadioControlValueAccessor } from '@angular/forms';
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import { Vehicle, VehicleService } from '../shared/vehicle/index';
import { AuthService } from '../shared/auth/index';
import { RequestService } from '../shared/request/index';
import { GooglePlace, GoogleMapsApiService } from '../shared/google-maps-api/index';
import { DatetimepickerComponent } from '../shared/ng2-datetimepicker-wrapper/index';
import { DatePipe } from '../shared/pipes/index';
import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/distinctUntilChanged';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/observable/of';
import * as moment from 'moment'
import { Moment } from 'moment';

// See: http://www.syntaxsuccess.com/viewarticle/using-jquery-with-angular-2.0
declare var jQuery:any;
// See: https://www.thepolyglotdeveloper.com/2016/01/include-external-javascript-libraries-in-an-angular-2-typescript-project/
declare var datetimepicker: any;
declare var google: any;
declare var z: any; // DEBUG

/**
 * This class represents the lazy loaded SearchComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-search',
  templateUrl: 'search.component.html',
  styleUrls: ['search.component.css'],
})
export class SearchComponent implements OnInit {

  // To see how it works: http://blog.thoughtram.io/angular/2016/01/06/taking-advantage-of-observables-in-angular2.html
  vehicles: Observable<Array<Vehicle>>;
  searchVehiclesTerms = new FormControl();
  places: Observable<Array<GooglePlace>>;
  searchPlacesTerms = new FormControl();
  step: number = 1;
  displayErrors: boolean = false;

  searchForm: FormGroup;
  inputSelected: string;
  private dateFrom: Moment;
  private dateTo: Moment;
  private allFieldsAreFilled: boolean = false;

  private iChildSelected = 0;


  constructor(private googleMapsApiService: GoogleMapsApiService,
              private vehicleService: VehicleService,
              private requestService: RequestService,
              private authService: AuthService,
              private formBuilder: FormBuilder) {
  }

  ngOnInit(): void {
    let that = this;

    this.recursiveTimeout(100);

    this.searchForm = this.formBuilder.group({
      destination: ['', Validators.required],
      dates: this.formBuilder.group({
        from: '',
        to: ''
      }),
      vehicle: '',
      // firstname: '',
      // lastname: '',
      // phone: '',
      // email: '',
      firstname: this.authService.userProfile.firstname,
      lastname: this.authService.userProfile.lastname,
      phone: this.authService.userProfile.phone,
      email: this.authService.userProfile.email,
      // password: '',
      mobileAndNow: false,
      preferedContact: 'nothing',
      preferedTime: 'nothing',
      preferedTimeDetail: '',
      comments: ''
    });

    this.places = this.searchPlacesTerms.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(searchPlacesTerms => this.googleMapsApiService.search(searchPlacesTerms));

    this.vehicles = this.searchVehiclesTerms.valueChanges
      .debounceTime(400)
      .distinctUntilChanged()
      .switchMap(searchVehiclesTerms => this.vehicleService.search(searchVehiclesTerms));

    // To launch a first empty search on vehicles
    setTimeout(() => {
      this.searchVehiclesTerms.setValue("");
    }, 10);

    // Init the search list selections when the places or vehicles change
    this.places.subscribe(() => {this.initSearchListSelection()});
    this.vehicles.subscribe(() => {this.initSearchListSelection()});

    // For text inputs, select all on click/focus
    jQuery(document).ready(() => {
      jQuery('input[type=text]').click(function () {
         jQuery(this).select();
      });
    });

    // To manage key events
    jQuery(document).keydown(function(e: any) {
      switch(e.which) {
        case 13: // enter
        if (that.inputSelected == "destination")
          that.placeSelected(that.getSearchListItemHover('.search-box-destination'));
        else if (that.inputSelected == "vehicle")
          that.vehicleSelected(that.getSearchListItemHover('.search-box-vehicle'));
        else
          return;
        break;
        case 38: // up
        that.moveSearchListSelection(false);
        break;
        case 40: // down
        that.moveSearchListSelection(true);
        break;
        default: return; // exit this handler for other keys
      }
      e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    
  }

  initSearchListSelection() {
    this.iChildSelected = 0;
  }

  moveSearchListSelection(isDown: boolean): void {
    let searchListItems = jQuery('.search-list:visible .search-list-item');
    this.iChildSelected += isDown ? 1 : -1;
    this.iChildSelected = Math.min(searchListItems.length-1, Math.max(0, this.iChildSelected));
  }

  recursiveTimeout(ms: number = 500, log: boolean = false): void {
    setTimeout(() => {
      if (log)
        console.log("timeout");
      this.recursiveTimeout(ms);
    }, ms);
  }

  inputFocused(inputName: string): void {
    let formerInputSelected = this.inputSelected;
    this.inputSelected = inputName;

    if (this.inputSelected == "to") {
      let datetimepickerElement = jQuery('#dateTo');
      datetimepickerElement.data("DateTimePicker").minDate(this.dateFrom);
      if (!this.dateTo) {
        setTimeout(() => {
          this.dateTo = moment(this.dateFrom).add(1, 'h');
          datetimepickerElement.data("DateTimePicker").date(this.dateTo);
        }, 500);
      }
    }

    if (this.inputSelected != formerInputSelected){
      if (formerInputSelected == "destination"){
        console.log(this.searchForm.get('destination'));
        let newText: string = jQuery('.search-box-destination .search-list .search-list-item.hover').text().trim();
        this.searchForm.get('destination').setValue(newText);
      }
      if (formerInputSelected == "vehicle"){
        let newText: string = jQuery('.search-box-vehicle .search-list .search-list-item.hover').text().trim();
        this.searchForm.get('vehicle').setValue(newText);
      }
    }
    this.initSearchListSelection();
  }


  placeSelected(description: string): void {
    jQuery('input[formControlName=from]').focus(); // Go to next input
    this.searchForm.get('destination').setValue(description);
  }

  dateFromSelected(date: Moment): void {
    this.dateFrom = moment(date);
    this.searchForm.get('dates.from').setValue(date);
    // if (!this.dateTo)
    //   this.dateTo = moment(date).add(1, 'h');
    // let datetimepickerElement = jQuery('#dateTo');
    // datetimepickerElement.data("DateTimePicker").date(this.dateTo);
    // setTimeout(() => {
      // datetimepickerElement.data("DateTimePicker").minDate(this.dateFrom);
    // }, 100);
  }

  dateToSelected(date: Moment): void {
    this.dateTo = moment(date);
    this.searchForm.get('dates.to').setValue(date);
  }

  vehicleSelected(vehicleName: string): void {
    this.searchForm.get('vehicle').setValue(vehicleName);
    // this.searchForm.patchValue({vehicle: vehicleName}); // it should does the same thing 
  }

  getSearchListItemHover(parentSelector: string): string {
    return jQuery(parentSelector+' .search-list .search-list-item.hover').text().trim();
  }

  checkIfAllFieldsAreFilled(): void {
    this.allFieldsAreFilled = this.searchForm.value['firstname'] != ''
        && this.searchForm.value['lastname'] != ''
        && this.searchForm.value['phone'] != ''
        && this.searchForm.value['email'] != ''
        // && this.searchForm.value['password'] != ''
        ;
  }

  goToStep2(value: any): void {
    this.step = 2;
    this.displayErrors = true;
    let format = 'DD/MM/YYYY [à] HH[h]mm';
    let dataToSend = {
      destination: value.destination,
      from: moment.isMoment(value.dates.from) ? value.dates.from.format(format) : "",
      to: moment.isMoment(value.dates.to) ? value.dates.to.format(format) : "",
      vehicle: value.vehicle,
      firstname: value.firstname,
      lastname: value.lastname,
      email: value.email,
      phone: value.phone
    };

    console.log(dataToSend);
    z = value;

    this.requestService.sendSearchRequestToIfttt(dataToSend, 'spotnicSearchInProgress');
  }

  onSubmit(value: any): void {
    console.log("Call of onSubmit");
    console.log(value);

    this.step = 3;

    let format = 'DD/MM/YYYY [à] HH[h]mm';
    let dataToSend = {
      destination:        value.destination,
      from:               moment.isMoment(value.dates.from) ? value.dates.from.format(format) : "",
      to:                 moment.isMoment(value.dates.to) ? value.dates.to.format(format) : "",
      vehicle:            value.vehicle,
      firstname:          value.firstname,
      lastname:           value.lastname,
      email:              value.email,
      phone:              value.phone,
      mobileAndNow:       value.mobileAndNow,
      preferedContact:    value.preferedContact,
      preferedTime:       value.preferedTime,
      preferedTimeDetail: value.preferedTimeDetail,
      comments:           value.comments,
    };

    this.requestService.sendSearchRequest(dataToSend);
  }
}
