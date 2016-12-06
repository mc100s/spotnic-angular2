import { Component } from '@angular/core';
import { AuthService } from '../auth/index';

/**
 * This class represents the navigation bar component.
 */
@Component({
  moduleId: module.id,
  selector: 'sd-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: ['navbar.component.css'],
})

export class NavbarComponent {
  constructor(private authService: AuthService) {}
}
