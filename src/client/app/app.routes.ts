import { Routes } from '@angular/router';

import { AboutRoutes } from './about/index';
import { ContactRoutes } from './contact/index';
import { HomeRoutes } from './home/index';
import { SearchRoutes } from './search/index';

import { PoiRoutes } from './landing-pages/poi/index';

export const routes: Routes = [
  ...AboutRoutes,
  ...ContactRoutes,
  ...HomeRoutes,
  ...SearchRoutes,
  ...PoiRoutes
];
