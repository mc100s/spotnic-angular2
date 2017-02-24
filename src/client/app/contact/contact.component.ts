import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators, RadioControlValueAccessor } from '@angular/forms';
import { AuthService } from '../shared/auth/index';
import { RequestService } from '../shared/request/index';

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
  contactForm: FormGroup;

  constructor(private auth: AuthService,
              private requestService: RequestService,
              private formBuilder: FormBuilder) {}

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      phone: '',
      destination: '',
      name: '',
      mobileAndNow: false,
    });
  }

  onSubmit(value: any): void {
    console.log("Call of onSubmit");
    console.log(value);
    this.requestService.sendRequest(value, 'spotnicContactRequest');
  }

}
