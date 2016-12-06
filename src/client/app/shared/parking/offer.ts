import { Parking } from './index';

export class Offer {
  // id: number;
  parking: Parking;
  price?: number;
  walkingDist: number; // In meters
  walkingTime: number; // In minutes
}
