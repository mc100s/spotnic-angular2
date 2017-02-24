import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

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
              private formBuilder: FormBuilder,
              private router: Router
              ){
  }

  ngOnInit() {
    if (localStorage.getItem('mustRedirect') == 'true' && this.windowMobileCheck()) {
      localStorage.removeItem('mustRedirect');
      this.router.navigateByUrl('contact');
    }

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
    var circle = new google.maps.Circle({
        center: this.getNavigatorLocation(),
        radius: 500*1000
    });
    var autocomplete = new google.maps.places.Autocomplete(inputElement,{
      types: ['geocode'],
      bounds: circle.getBounds(),
    });

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

  getNavigatorLocation(): any {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position: any) {
        return new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
      });
    }
    // Default location: Paris
    return new google.maps.LatLng(48.85, 2.35);
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


  /**
   * To detect if the user use a mobile
   * Return true if the browser is from a smartphone (and not a tablet)
   */
  windowMobileCheck() {
    var check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) check = true;})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
  };

}
