import { Injectable } from '@angular/core';
import { Http, Response, Headers } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Config } from '../index';

var JSON: any;
var URLSearchParams: any; 
var z: any; 

@Injectable()
export class RequestService {
  
  constructor(private http: Http) {}

  sendSearchRequest(data: any): void {
    if (Config.ENV != "PROD") {
      console.log("Request are only sent on 'PROD' environment");
      return;
    }
    this.sendSearchRequestToIfttt(data);
    // this.sendSearchRequestToZapier(data);
  }

  sendSearchRequestToZapier(data: any): void {
    let url = 'https://hooks.zapier.com/hooks/catch/1340295/6fvyfs/';

    let headers = new Headers();
    // To override the default Content-Type
    headers.append('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');

    this.http.post(url, data, {headers})
      .map((res: Response) => res.json())
      .subscribe(
        data => console.log("Success"),
        err => console.log("Error"),
        () => console.log("Complete")
      );
  }

  sendSearchRequestToIfttt(data: any, event: string = 'spotnicSearchCompleted'): void {
    if (Config.ENV != "PROD") {
      console.log("Requests are only sent on 'PROD' environment");
      return;
    }
    let value1 =
// `
// dest.:     ${data.destination}
// from:      ${data.from}
// to:        ${data.to}
// vehicle:   ${data.vehicle}
// firstname: ${data.firstname}
// lastname:  ${data.lastname}
// email:     ${data.email}
// phone:     ${data.phone}
// `
`
# ${data.destination}
# ${data.from}
# ${data.to}
# ${data.vehicle}
# ${data.firstname}
# ${data.lastname}
# ${data.email}
# ${data.phone}
----------------
# ${data.preferedContact}
# ${data.preferedTime} - ${data.preferedTimeDetail ? data.preferedTimeDetail: ''}
`
    if (data.comments) {
      value1 += '----------------\n';
      value1 += data.comments + '\n';
    }

    if (data.mobileAndNow) {
      value1 += '----------------\n';
      value1 += '# !!! Recherche immédiate !!!\n';
    }

    let url = 'https://maker.ifttt.com/trigger/'+ event +'/with/key/f28lZ3ZHqQtduDbWEBGSy6K-Qyqar7AhBymco0UVx25?value1=' + encodeURIComponent(value1);

    this.http.get(url)
      .map((res: Response) => res.json())
      .subscribe(
        data => console.log("Success"),
        err => console.log("The no 'Access-Control-Allow-Origin' is normal"),
        () => console.log("Complete")
      );
  }

  sendBookingRequest(data: any): void {
    // if (Config.ENV != "PROD") {
    //   console.log("Request are only sent on 'PROD' environment");
    //   return;
    // }
    let event = 'spotnicBookingRequest';
    let value1 = this.stringifyObject(data);
    // for (let key in data) {
    //   value1 += key + ': ' + data[key] + '\n';
    // }
    console.log(value1);
    // value1 = "Maxence";
    let url = 'https://maker.ifttt.com/trigger/'+ event +'/with/key/f28lZ3ZHqQtduDbWEBGSy6K-Qyqar7AhBymco0UVx25?value1=' + encodeURIComponent(value1);
    // let url = 'https://maker.ifttt.com/trigger/'+ event +'/with/key/f28lZ3ZHqQtduDbWEBGSy6K-Qyqar7AhBymco0UVx25?value1=Maxence';

    this.http.get(url)
      .map((res: Response) => res.json())
      .subscribe(
        data => console.log("Success"),
        err => console.log("The no 'Access-Control-Allow-Origin' is normal"),
        () => console.log("Complete")
      );
  }

  sendRequest(data: any, event: string): void {
    let value1 = this.stringifyObject(data);
    console.log(value1);
    let url = 'https://maker.ifttt.com/trigger/'+ event +'/with/key/f28lZ3ZHqQtduDbWEBGSy6K-Qyqar7AhBymco0UVx25?value1=' + encodeURIComponent(value1);
    this.http.get(url)
      .map((res: Response) => res.json())
      .subscribe(
        data => console.log("Success"),
        err => console.log("The no 'Access-Control-Allow-Origin' is normal"),
        () => console.log("Complete")
      );
  }



  stringifyObject(o: any, depth: number = 0): string {
    if (typeof o !== 'object')
      return o + '';
    let res = depth == 0 ? '' : '<br>';
    for (var key in o) {
      for (let i = 0; i < depth; i++)
        res += '-';
      res += key + ': ' + this.stringifyObject(o[key], depth+1) + '<br>';
    }
    return res;
  }

  /**
    * Handle HTTP error
    */
  private handleError (error: any) {
    let errMsg = (error.message) ? error.message :
      error.status ? `${error.status} - ${error.statusText}` : 'Server error';
    console.error(errMsg);
    return Observable.throw(errMsg);
  }
}