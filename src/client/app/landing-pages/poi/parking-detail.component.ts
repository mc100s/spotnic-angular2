import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, RadioControlValueAccessor } from '@angular/forms';
import * as moment from 'moment'
import { Moment } from 'moment';
import { RequestService } from '../../shared/request/index';
import { Parking, Offer } from '../../shared/parking/index';
import { EurCurrencyPipe } from '../../shared/pipes/index';

declare var google: any;
declare var window: any;
declare var z: any;

@Component({
  moduleId: module.id,
  selector: 'sd-parking-detail',
  templateUrl: 'parking-detail.component.html',
  styleUrls: ['poi.component.css']
})
export class ParkingDetailComponent implements OnInit, OnChanges {
  @Input() offer: Offer;
  @Input() dateFrom: Moment;
  @Input() dateTo: Moment;
  @Input() map: any;
  @Input() lat: any;
  @Input() lng: any;
  @Output() onClosed = new EventEmitter<boolean>();

  bookingForm: FormGroup;
  step: number = 1;
  imgUrl: string;


  close() {
    this.onClosed.emit();
  }
              
  constructor(private requestService: RequestService,
              private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.resizeElements();

    this.bookingForm = this.formBuilder.group({
      firstname: '',
      lastname: '',
      email: ['', Validators.required],
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    // changes.prop contains the old and the new value...
    this.moveMap();
    this.imgUrl = 'img/parkings/' + this.offer.parking.id + '.jpg';

    if (this.offer.parking.streetView) {
      let lat = this.offer.parking.streetView.lat;
      let lng = this.offer.parking.streetView.lng;
      let heading = this.offer.parking.streetView.heading;
      let pitch = this.offer.parking.streetView.pitch;
      if (!lat) lat = 0;
      if (!lng) lng = 0;
      if (!heading) heading = 0;
      if (!pitch) pitch = 0;

      setTimeout(() => {
        let panorama = new google.maps.StreetViewPanorama(
          document.getElementById('street-view'),
          {
            position: {lat: lat, lng: lng},
            pov: {heading: heading, pitch: pitch},
            zoom: 1,
            addressControl: false,
            trackingOption: false,
            linksControl: false,
            panControl: false,
            enableCloseButton: false,
            motionTracking: false,
            motionTrackingControl: false,
          }
        );

        let priceMarker = new google.maps.Marker({
          map: panorama,
          position: {lat: this.offer.parking.coord.lat, lng: this.offer.parking.coord.lng},
          title: this.offer.parking.name,
          icon: 'img/marker-parking.png',
        });

        let destinationMarker = new google.maps.Marker({
          map: panorama,
          position: {lat: this.lat, lng: this.lng},
          title: 'Destination',
          icon: 'img/marker.png',
        });
      }, 200);
    }
  }

  resizeElements() {
    let windowElement: any = window.document.getElementsByTagName('sd-parking-detail')[0];
    windowElement.style.height = (window.innerHeight - windowElement.getBoundingClientRect().top - 10) + 'px';
  }

  moveMap() {
    // The right side of the map will be centerd on (lat, lng)
    // TODO: take the barycenter of the search and the parking
    let lat = (this.lat + this.offer.parking.coord.lat) / 2;
    let lng = (this.lng + this.offer.parking.coord.lng) / 2;
    
    let bounds = this.map.getBounds();
    let boundsLngWidth: number = bounds.getNorthEast().lng() - bounds.getSouthWest().lng();

    let windowElement: any = window.document.getElementsByTagName('sd-parking-detail')[0];
    if (windowElement) {
      let offsetPercentage = (windowElement.offsetLeft + windowElement.offsetWidth) / window.innerWidth / 2;
      this.map.setCenter(new google.maps.LatLng(lat, lng - boundsLngWidth * offsetPercentage));
    }
  }

  dateFromSelected(date: Moment): void {
    console.log(date);
    console.log(moment(date));
    // this.dateFrom = moment(date);
    // this.searchForm.get('dates.from').setValue(date);

    // if (!this.dateTo)
    //   this.dateTo = moment(date).add(1, 'h');
    // let datetimepickerElement = jQuery('#dateTo');
    // datetimepickerElement.data("DateTimePicker").date(this.dateTo);
    // setTimeout(() => {
      // datetimepickerElement.data("DateTimePicker").minDate(this.dateFrom);
    // }, 100);
  }


  updateUrl(event: any) {
    console.log("updateUrl", event);
    this.imgUrl = 'img/parkings/default-image.jpg';
  }

  onSubmit(value: any): void {
    console.log("Call of onSubmit");
    value.offer = this.offer;
    if (this.bookingForm.controls['email'].valid) {
      this.requestService.sendBookingRequest(value);
      this.step = 2;
    }
  }
}