import { Component } from '@angular/core';
import { AuthService } from '../shared/auth/index';

/**
 * This class represents the lazy loaded AboutComponent.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-about',
  templateUrl: 'about.component.html',
  styleUrls: ['about.component.css']
})
export class AboutComponent {
  constructor(private auth: AuthService) {}

  test(): void {
    console.log(this.auth);
  }
}

