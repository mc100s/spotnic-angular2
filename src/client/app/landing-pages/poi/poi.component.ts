import { Component, OnInit } from '@angular/core';
// import { AuthService } from '../../shared/auth/index';
import { Observable } from 'rxjs/Observable';
import { Parking, ParkingService, Offer } from '../../shared/parking/index';
import { CustomMarker } from '../../shared/google-maps-api/index';
import { FormBuilder, FormGroup, FormControl, Validators, RadioControlValueAccessor } from '@angular/forms';
import * as moment from 'moment'
import { Moment } from 'moment';

declare var z: any; // DEBUG
declare var google: any;
declare var window: any;
declare var firebase: any; // TODO: change

@Component({
  moduleId: module.id,
  selector: 'sd-poi',
  templateUrl: 'poi.component.html',
  styleUrls: ['poi.component.css']
})
export class PoiComponent implements OnInit {
  // constructor(private auth: AuthService) {}
  
  // Grand Palais
  // lat: number = 48.865042;
  // lng: number = 2.312889;

  // Pyramide du Louvre
  lat: number = 48.861016;
  lng: number = 2.335839;

  defaultDateFrom: Moment;
  defaultDateTo: Moment;
  nbOfMinutes = 2*60;

  offers: Observable<Offer[]>;
  parkings: any; // Should be removed

  locationMarker : any;
  circles : any[] = [];

  selectedParking: Parking = null;
  selectedOffer: Offer = null;
  selectedPrice: number = null;
  priceMarkers: Map<any, CustomMarker>;

  map: any;

  constructor(private parkingService: ParkingService,
              private formBuilder: FormBuilder){}


  ngOnInit() {
    this.offers = null;

    this.recursiveTimeout(200);

    this.resizeElements();

    this.priceMarkers = new Map<any, CustomMarker>();

    this.offers = this.parkingService.getFirebaseOffers(this.lat, this.lng, this.nbOfMinutes);

    // Source: https://developers.google.com/maps/documentation/javascript/?hl=fr
    let latLng = {lat: this.lat, lng: this.lng};

    // Create a map object and specify the DOM element for display.
    this.map = new google.maps.Map(document.getElementById('map'), {
      center: latLng,
      zoom: 14,
      scrollwheel: false,
      clickableIcons: false,
      disableDefaultUI: true, // a way to quickly hide all controls
      scaleControl: true,
      zoomControl: true,
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE 
      },
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    this.offers
      .subscribe(
        (offers: Offer[]) => {
          // setTimeout(() => {
          // }, 1000);

          this.priceMarkers = new Map<any, CustomMarker>();
          for(var i = 0; i < offers.length; i++) {
            this.priceMarkers.set(offers[i].parking.id, new CustomMarker(
              this.map,
              new google.maps.LatLng(offers[i].parking.coord.lat, offers[i].parking.coord.lng),
              this.parkingService.getPrice(offers[i].parking, this.nbOfMinutes),
              offers[i].parking.id,
              {parkingId: offers[i].parking.id}
            ));
          }
        },
        error =>  console.log(error)
      );

    this.drawMarkerWithCircles();

    this.initSearch();
  }

  drawMarkerWithCircles(drawCircles: boolean = true): void {
    if (this.locationMarker) {
      this.locationMarker.setMap(null);
    }
    if (this.circles) {
      for (let i = 0; i < this.circles.length; i++) {
          this.circles[i].setMap(null);
      }
    }
    this.circles = [];

    let latLng = {lat: this.lat, lng: this.lng};
    
    // Create a marker and set its position.
    this.locationMarker = new google.maps.Marker({
      map: this.map,
      position: latLng,
      // title: 'Grand Palais',
      // icon: 'img/marker.svg',
      icon: 'img/marker.png',
      optimized: true,
      zIndex: 20 // Doesn't seem to work
    });

    if (drawCircles) {
      let oneMin2Meters = 73;

      // Create circles
      this.circles.push(new google.maps.Circle({
        strokeColor: '#FF0000',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#FF0000',
        fillOpacity: 0.02,
        map: this.map,
        center: latLng,
        radius: 15 * oneMin2Meters // 15 min
      }));
      this.circles.push(new google.maps.Circle({
        strokeColor: '#EEAA00',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#EEAA00',
        fillOpacity: 0.05,
        map: this.map,
        center: latLng,
        radius: 10 * oneMin2Meters // 10 min
      }));
      this.circles.push(new google.maps.Circle({
        strokeColor: '#00DD00',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#00DD00',
        fillOpacity: 0.08,
        map: this.map,
        center: latLng,
        radius: 5 * oneMin2Meters // 5 min
      }));
      let legend = document.getElementById('legend');
      this.map.controls[google.maps.ControlPosition.BOTTOM].push(legend);
    }
  }

  recursiveTimeout(ms: number = 500, log: boolean = false): void {
    setTimeout(() => {
      if (log)
        console.log("timeout");
      this.recursiveTimeout(ms);
    }, ms);
  }

  onSelect(offer: Offer) {
    let parking = offer.parking; 
    this.onParkingDetailClosed();

    this.selectedOffer = offer;
    this.selectedParking = parking;
    this.selectedPrice = this.parkingService.getPrice(parking, this.nbOfMinutes);
    
    let marker = this.priceMarkers.get(parking.id);
    if (marker)
      marker.addClass('select');
  }

  onParkingDetailClosed() {
    if (this.selectedOffer) {
      let marker = this.priceMarkers.get(this.selectedOffer.parking.id);
      if (marker)
        marker.removeClass('select');
      this.selectedOffer = null;
    }
  }

  onHover(parking: Parking) {
    let marker = this.priceMarkers.get(parking.id);
    if (marker)
      marker.addClass('hover');
  }

  onEndHover(parking: Parking) {
    let marker = this.priceMarkers.get(parking.id);
    if (marker)
      marker.removeClass('hover');
  }


  resizeElements() {
    let windowMap = window.document.getElementById('map');
    let windowParkingList = window.document.getElementById('parkings-list');
    windowMap.style.height = (window.innerHeight - windowMap.getBoundingClientRect().top - 0) + 'px';
    windowParkingList.style.height = (window.innerHeight - windowParkingList.getBoundingClientRect().top - 0) + 'px';
  }



  private dateFrom: Moment;
  private dateTo: Moment;
  searchForm: FormGroup;
  inputSelected: string;

  initSearch(): void {
    this.searchForm = this.formBuilder.group({
      destination: '',
      from: '',
      to: ''
    });

    // Google Autocomplete
    let inputElement = document.getElementById('autocomplete');
    // Don't submit form on enter
    google.maps.event.addDomListener(inputElement, 'keydown', function(e: any) { 
      if (e.keyCode == 13)
          e.preventDefault(); 
    }); 
    console.log(inputElement);
    var autocomplete = new google.maps.places.Autocomplete(inputElement,{types: ['geocode']});

    // When the user selects an address from the dropdown, populate the address
    // fields in the form.
    autocomplete.addListener('place_changed', () => {
      let place = autocomplete.getPlace();
      this.lat = place.geometry.location.lat();
      this.lng = place.geometry.location.lng();
    });


    this.defaultDateFrom = moment().minute(0).second(0).millisecond(0).add(1, 'hour');
    this.defaultDateTo = moment(this.defaultDateFrom).add(this.nbOfMinutes, 'minute');
    this.dateFromSelected(this.defaultDateFrom);
    this.dateToSelected(this.defaultDateTo);
  }

  dateFromSelected(date: Moment): void {
    this.dateFrom = moment(date);
    this.searchForm.get('from').setValue(date);
    this.defaultDateFrom = date;
  }

  dateToSelected(date: Moment): void {
    this.dateTo = moment(date);
    this.searchForm.get('to').setValue(date);
    this.defaultDateTo = date;
  }

  onSubmit(value: any, isValid: boolean): void {
    console.log(value, isValid);
    // return;

    // TEST
    this.drawMarkerWithCircles();

    let diff = value.to.diff(value.from);
    let d: any = moment.duration(diff);
    this.nbOfMinutes = Math.floor(d.asMinutes());

    // Compute the new price
    if (this.selectedOffer)
      this.selectedOffer.price = this.parkingService.getPrice(this.selectedOffer.parking, this.nbOfMinutes);

    this.offers = this.parkingService.getFirebaseOffers(this.lat, this.lng, this.nbOfMinutes);
    this.deleteMarkers();
    this.offers
      .subscribe(
        (offers: Offer[]) => {
          // setTimeout(() => {
          // }, 1000);
          this.priceMarkers = new Map<any, CustomMarker>();
          for(var i = 0; i < offers.length; i++) {
            this.priceMarkers.set(offers[i].parking.id, new CustomMarker(
              this.map,
              new google.maps.LatLng(offers[i].parking.coord.lat, offers[i].parking.coord.lng),
              this.parkingService.getPrice(offers[i].parking, this.nbOfMinutes),
              offers[i].parking.id,
              {parkingId: offers[i].parking.id}
            ));
          }
        },
        error =>  console.log(error)
      );

    this.map.setCenter(new google.maps.LatLng(this.lat, this.lng));
  }

  deleteMarkers() {
    this.priceMarkers.forEach((value: CustomMarker, index: any, map: any) => {
      value.setMap(null);
    });
    this.priceMarkers.clear();
  }

}
