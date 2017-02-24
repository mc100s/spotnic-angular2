import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ContactComponent } from './contact.component';
import { RequestService } from '../shared/request/index';
import { AUTH_PROVIDERS } from 'angular2-jwt/angular2-jwt';
import { AuthService } from '../shared/auth/index';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [ContactComponent],
  exports: [ContactComponent],
  providers: [
    RequestService,
    AUTH_PROVIDERS,
    AuthService
  ],
})

export class ContactModule { }
