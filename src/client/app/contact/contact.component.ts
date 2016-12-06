import { Component, OnInit } from '@angular/core';
import { AuthService } from '../shared/auth/index';

declare var firebase: any;


/**
 * This class represents the lazy loaded ContactComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-contact',
  templateUrl: 'contact.component.html',
  styleUrls: ['contact.component.css']
})
export class ContactComponent implements OnInit {
  constructor(private auth: AuthService) {}

  ngOnInit() {
    var starCountRef = firebase.database().ref('parkings');
    starCountRef.on('value', function(snapshot: any) {
      console.log("SNAPSHOT!!!!!!!!!!!!!!!!");
      console.log(snapshot.val());
    });
  }

}
