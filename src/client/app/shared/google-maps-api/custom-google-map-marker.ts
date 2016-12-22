declare var google: any;
declare var jQuery: any;

export class CustomMarker {
  latLng: any;
  args: any;
  price: number;
  parkingId: string;

  constructor(map: any, latLng: any, price: number, parkingId: string, args: any = {}) {
    this.setMap(map); 
    this.latLng = latLng; 
    this.price = price;
    this.parkingId = parkingId;
    this.args = args; 
  }

  setMap(map: any) {}
  draw() {}
  remove() {}
  getPosition() {}

  addClass(className: string) {}
  removeClass(className: string) {}
  adjustMarkerPosition() {}
}

CustomMarker.prototype = new google.maps.OverlayView();

CustomMarker.prototype.draw = function() {
  
  var self = this;
  
  var div = this.div;
  
  if (!div) {
  
    div = this.div = document.createElement('div');
    let units = this.price == null ? 'P' : Math.floor(this.price);
    let decimals = this.price == null ? '' : this.price.toFixed(2).slice(-2);
    let currency = this.price == null ? '' : '€';
    
    div.className = 'map-marker';
    if (typeof(self.args.otherClassNames) !== 'undefined') {
      div.className += ' ' + self.args.otherClassNames;
    }
    div.innerHTML = `
      <span class='units'>${units}</span><span class='decimals'>${decimals}</span>
      <span class='currency'>${currency}</span>
    `;

    if (typeof(self.parkingId) !== 'undefined') {
      div.dataset.parkingId = self.parkingId;
    }

    let cardElement = jQuery('.card.id-' + self.parkingId);
    
    google.maps.event.addDomListener(div, "click", function(event: any) {
      // alert('You clicked on a custom marker!');     
      cardElement.click();
      // google.maps.event.trigger(self, "click");
    });

    google.maps.event.addDomListener(div, "mouseenter", function(event: any) {
      self.addClass('hover');
      cardElement.addClass('hover');
      // google.maps.event.trigger(self, "click");
    });
    google.maps.event.addDomListener(div, "mouseleave", function(event: any) {
      self.removeClass('hover');   
      cardElement.removeClass('hover');
      // google.maps.event.trigger(self, "click");
    });
    
    var panes = this.getPanes();
    panes.overlayImage.appendChild(div);
  }
  
  this.adjustMarkerPosition();
};

CustomMarker.prototype.remove = function() {
  if (this.div) {
    this.div.parentNode.removeChild(this.div);
    this.div = null;
  } 
};

CustomMarker.prototype.getPosition = function() {
  return this.latLng; 
};

CustomMarker.prototype.addClass = function(className: string) {
  this.div.className += ' ' + className;
  this.adjustMarkerPosition();
}

CustomMarker.prototype.removeClass = function(className: string) {
  this.div.className = this.div.className
    .replace(new RegExp('(?:^|\\s)'+ className + '(?:\\s|$)'), ' ');
  this.adjustMarkerPosition();
}

CustomMarker.prototype.adjustMarkerPosition = function() {
  let point = this.getProjection().fromLatLngToDivPixel(this.latLng);
  if (point) {
    this.div.style.left = (point.x - this.div.offsetWidth/2.0) + 'px';
    this.div.style.top = (point.y - this.div.offsetHeight) + 'px';
  }
}
