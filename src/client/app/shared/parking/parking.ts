export class Parking {
  id: string;
  name: string;

  coord: Coord;
  address: string;
  postcode: string;
  city: string;
  country: string;

  maxHeight: number; // In meters
  openingHours: string;
  parkingAccess: string;
  company: string;
  
  services: any; // Object like: {guard: true, charger: true}
  pricingRules: PricingRule[];

  streetView: StreetView;
}

export class Coord {
  lat: number;
  lng: number;
}

export class PricingRule {
  duration: number; // In minutes
  price: number; // In euro
  isAddable: boolean;
}

export class StreetView {
  lat: number;
  lng: number;
  heading: number;
  pitch: number;
}