import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about.component';
import { AUTH_PROVIDERS } from 'angular2-jwt/angular2-jwt';
import { AuthService } from '../shared/auth/index';

@NgModule({
  imports: [CommonModule],
  declarations: [AboutComponent],
  providers: [AUTH_PROVIDERS, AuthService],
  exports: [AboutComponent]
})

export class AboutModule { }


