import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { APP_BASE_HREF } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpModule } from '@angular/http';
// import { Ng2BootstrapModule } from 'ng2-bootstrap/ng2-bootstrap';
import { AppComponent } from './app.component';
import { routes } from './app.routes';

import { AboutModule } from './about/about.module';
import { ContactModule } from './contact/contact.module';
import { HomeModule } from './home/home.module';
import { SearchModule } from './search/search.module';
import { SharedModule } from './shared/shared.module';

import { PoiModule } from './landing-pages/poi/poi.module';

@NgModule({
  imports: [
    BrowserModule,
    HttpModule,
    // Ng2BootstrapModule,
    RouterModule.forRoot(routes),
    AboutModule,
    ContactModule,
    HomeModule,
    SearchModule,
    SharedModule.forRoot(),
    PoiModule
   ],
  declarations: [AppComponent],
  providers: [{
    provide: APP_BASE_HREF,
    useValue: '<%= APP_BASE %>'
  }],
  bootstrap: [AppComponent]

})

export class AppModule { }
