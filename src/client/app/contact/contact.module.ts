import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ContactComponent } from './contact.component';
import { AUTH_PROVIDERS } from 'angular2-jwt/angular2-jwt';
import { AuthService } from '../shared/auth/index';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [ContactComponent],
  providers: [AUTH_PROVIDERS, AuthService],
  exports: [ContactComponent]
})

export class ContactModule { }
