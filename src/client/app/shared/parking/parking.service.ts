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
      
      firebase.database().ref('parkings').once('value').then((snapshot: any) => {

        let offers: Offer[] = [];
        let destinations: any[] = [];

        let snapshotVal = snapshot.val();

        let i = 0;
        let maxDimensions = 25;
        for(let index in snapshotVal) { 
          if (i >= maxDimensions) // To avoid "MAX_DIMENSIONS_EXCEEDED" error
            break;
          let parking = snapshotVal[index];
          destinations.push(new google.maps.LatLng(parking.coord.lat, parking.coord.lng));

          let o = new Offer;
          o.parking = parking;
          o.parking.id = index;
          o.price = this.getPrice(parking, duration)
          o.walkingDist = null;
          o.walkingTime = null;
          offers.push(o);
          i++;
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
            for (let i = 0; i < Math.min(Object.keys(snapshotVal).length, maxDimensions); i++) {
              offers[i].walkingDist = response.rows[0].elements[i].distance.text;
              offers[i].walkingTime = Math.ceil(response.rows[0].elements[i].duration.value / 60);
            }
            observer.next(offers);
            observer.complete();
          }
        });

        observer.next(offers);
        observer.complete();
      });
    });
  }

  getPrice(parking: Parking, duration: number): number {
    let infinite = 1000000;
    let res: number = infinite;
    for (var i = 0; i < parking.pricingRules.length; ++i) {
      if (parking.pricingRules[i].duration >= duration)
        res = Math.min(res, parking.pricingRules[i].price);
    }
    return res != infinite ? res : null;
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