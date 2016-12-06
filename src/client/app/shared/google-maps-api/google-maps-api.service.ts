import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { GooglePlace } from './index';

declare var google: any;


@Injectable()
export class GoogleMapsApiService {
  constructor(private http: Http) {}

  search(term: string): Observable<GooglePlace[]> {
    return new Observable<GooglePlace[]>((observer: any) => {
      if (!term) {
        observer.complete();
        return; 
      }
      let service = new google.maps.places.AutocompleteService();
      let options = {
        input: term,
      };
      service.getQueryPredictions(options, (predictions: any, status: string) => {
        let result: GooglePlace[] = [];
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          // There is no result result result result
          // alert(status);
          observer.next(result);
          observer.complete();
          return;
        }

        // console.log("GoogleMapsApiService::search Start of predictions");
        predictions.forEach(function(prediction: any) {
          // console.log(prediction);
          let country: string = prediction.terms[prediction.terms.length-1].value;
          let score: number;
          switch (country) {
            case "France":
              score = 1;
              break;
            case "Allemagne":
            case "Belgique":
            case "Espagne":
            case "Italie":
            case "Luxembourg":
            case "Royaume-Uni":
            case "Suisse":
              score = 0.8;
              break;
            case "Autriche":
            case "Danemark":
            case "Finlande":
            case "Irlande":
            case "Norvège":
            case "Pays-Bas":
            case "Portugal":
            case "Suède":
              score = 0.6;
              break;
            default:
              score = 0;
              break;
          }
          result.push(new GooglePlace(prediction.place_id, prediction.description, score));
        });
        result.sort(function(a: GooglePlace, b: GooglePlace){return b.score - a.score});
        // console.log(result); // DEBUG
        observer.next(result);
        observer.complete();
      });
    });
  }

  searchBackup(term: string): Observable<GooglePlace[]> {
    return new Observable<GooglePlace[]>((observer: any) => {
      let result: GooglePlace[] = [];

      let displaySuggestions = function(predictions: any, status: string) {
        if (status != google.maps.places.PlacesServiceStatus.OK) {
          // TODO: change the behavior
          alert(status);
          return;
        }

        console.log("GoogleMapsApiService::search Start of predictions");
        // for (var i = 0; i < predictions.length; i++) {
        //   predictions[i]
        // }
        predictions.forEach(function(prediction: any) {
          console.log(prediction.terms);
          let country: string = prediction.terms[prediction.terms.length-1].value;
          let score: number;
          switch (country) {
            case "France":
              score = 1;
              break;
            case "Allemagne":
            case "Belgique":
            case "Espagne":
            case "Italie":
            case "Luxembourg":
            case "Royaume-Uni":
            case "Suisse":
              score = 0.8;
              break;
            case "Autriche":
            case "Danemark":
            case "Finlande":
            case "Irlande":
            case "Norvège":
            case "Pays-Bas":
            case "Portugal":
            case "Suède":
              score = 0.6;
              break;
            default:
              score = 0;
              break;
          }
          result.push(new GooglePlace(prediction.place_id, prediction.description, score));
        });
        result.sort(function(a: GooglePlace, b: GooglePlace){return b.score - a.score});
        console.log(result); // DEBUG
        observer.next(result);
        observer.complete();
      };
      if (term) {
        let service = new google.maps.places.AutocompleteService();
        service.getPlacePredictions({ input: term }, displaySuggestions);
      }
    });
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


