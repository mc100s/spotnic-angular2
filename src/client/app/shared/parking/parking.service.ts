import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { Parking, Offer } from './index';

declare var google: any;
declare var firebase: any; // TODO: change

@Injectable()
export class ParkingService {
  
  constructor(private http: Http) {}

  get(): Observable<Parking[]> {
    return this.http.get('/assets/data-parkings.json')
      .map((res: Response) => res.json())
      .catch(this.handleError);
  }

  getOffers(lat: number, lng: number, duration: number): Observable<Offer[]> {
    return new Observable<Offer[]>((observer: Observer<Offer[]>) => {
      this.get().subscribe(
        (parkings: Parking[]) => {
          let offers: Offer[] = [];
          let destinations: any[] = [];

          for (let i = 0; i < parkings.length; i++) {
            destinations.push(new google.maps.LatLng(parkings[i].coord.lat, parkings[i].coord.lng));

            let o = new Offer;
            o.parking = parkings[i];
            o.price = this.getPrice(parkings[i], duration)
            o.walkingDist = null;
            o.walkingTime = null;
            offers.push(o);
          }

          var distanceMatrix  = new google.maps.DistanceMatrixService();
          var distanceRequest = {
            origins: [new google.maps.LatLng(lat, lng)],
            destinations: destinations,
            travelMode: google.maps.TravelMode.WALKING,
            unitSystem: google.maps.UnitSystem.METRIC
          };
          distanceMatrix.getDistanceMatrix(distanceRequest, (response: any, status: any) => {
            if (status != google.maps.DistanceMatrixStatus.OK) {
              alert('Error was: ' + status);
            }
            else {
              // var origins      = response.originAddresses;
              // var destinations = response.destinationAddresses;
              for (let i = 0; i < parkings.length; i++) {
                offers[i].walkingDist = response.rows[0].elements[i].distance.text;
                offers[i].walkingTime = Math.ceil(response.rows[0].elements[i].duration.value / 60);
              }
              observer.next(offers);
              observer.complete();
            }
          });
        }
      );
    });
  }

  getFirebaseOffers(lat: number, lng: number, duration: number): Observable<Offer[]> {
    return new Observable<Offer[]>((observer: Observer<Offer[]>) => {
      
      firebase.database().ref('test').once('value').then((snapshot: any) => {

        let offers: Offer[] = [];
        let destinations: any[] = [];
        let latLngOrigin = new google.maps.LatLng(lat, lng);
        let oneMin2Meters = 73;

        let snapshotVal = snapshot.val();

        let maxDimensions = 25;
        for(let index in snapshotVal) { 
          let parking = snapshotVal[index];
          let latLngDest = new google.maps.LatLng(parking.coord.lat, parking.coord.lng);

          let orthoDist = this.getOrthodromicDist(latLngOrigin, latLngDest);
          let approxWalkingDistInMeters = orthoDist * 1.15;

          let o = new Offer;
          o.parking = parking;
          o.parking.id = index;
          o.price = this.getPrice(parking, duration)
          o.walkingDist = (approxWalkingDistInMeters/1000).toFixed(1).replace(/\./, ',') + ' km'; // Text
          o.walkingTime = Math.round(approxWalkingDistInMeters/oneMin2Meters); // Number in minutes
          offers.push(o);
        }

        offers.sort(this.compareOffers); // First sort

        for (let i = 0; i < Math.min(offers.length, maxDimensions); i++) {
          destinations.push(new google.maps.LatLng(offers[i].parking.coord.lat, offers[i].parking.coord.lng));
        }


        var distanceMatrix  = new google.maps.DistanceMatrixService();
        var distanceRequest = {
          origins: [new google.maps.LatLng(lat, lng)],
          destinations: destinations,
          travelMode: google.maps.TravelMode.WALKING,
          unitSystem: google.maps.UnitSystem.METRIC
        };
        distanceMatrix.getDistanceMatrix(distanceRequest, (response: any, status: any) => {
          if (status != google.maps.DistanceMatrixStatus.OK) {
            console.log('Error was: ' + status);
          }
          else {
            for (let i = 0; i < Math.min(Object.keys(snapshotVal).length, maxDimensions); i++) {
              offers[i].walkingDist = response.rows[0].elements[i].distance.text;
              offers[i].walkingTime = Math.ceil(response.rows[0].elements[i].duration.value / 60);
            }
            observer.next(offers);
            observer.complete();
          }
        });

        offers.sort(this.compareOffers); // Second and final sort

        observer.next(offers);
        observer.complete();
      });
    });
  }

  compareOffers(a: Offer, b: Offer): number{
    if (a.walkingTime > b.walkingTime)
      return 1;
    if (a.walkingTime < b.walkingTime)
      return -1;
    // a.walkingTime == b.walkingTime
    if (a.price > b.price)
      return 1;
    if (a.price < b.price)
      return -1;
    return 0;
  }

  getPrice(parking: Parking, duration: number): number {
    let infinite = 1000000;
    let res: number = infinite;
    let length = parking.pricingRules ? parking.pricingRules.length : 0;
    for (var i = 0; i < length; ++i) {
      if (parking.pricingRules[i].duration >= duration)
        res = Math.min(res, parking.pricingRules[i].price);
    }
    return res != infinite ? res : null;
  }

  /**
   * Return the orthodromic distance in meters between two points
   * @param a (google.maps.LatLng) Point "a"
   * @param b (google.maps.LatLng) Point "b"
   * @src http://stackoverflow.com/questions/27928/calculate-distance-between-two-latitude-longitude-points-haversine-formula
   */
  getOrthodromicDist(a: any, b: any): number {

    var R = 6371000; // Radius of the earth in meters
    var dLat = this.deg2rad(b.lat()-a.lat());
    var dLon = this.deg2rad(b.lng()-a.lng()); 
    var x = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(a.lat())) * Math.cos(this.deg2rad(b.lat())) * 
      Math.sin(dLon/2) * Math.sin(dLon/2)
      ; 
    var c = 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1-x)); 
    var d = R * c; // Distance in meters
    return d;
  }

  deg2rad(deg: number): number {
    return deg * (Math.PI/180)
  }

  /**
    * Handle HTTP error
    */
  private handleError (error: any) {
    // In a real world app, we might use a remote logging infrastructure
    // We'd also dig deeper into the error to get a better message
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg); // log to console instead
    return Observable.throw(errMsg);
  }
}