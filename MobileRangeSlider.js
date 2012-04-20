/*
 * 
 * Find more about this plugin by visiting
 * http://miniapps.co.uk/
 *
 * Copyright (c) 2010 - 2012 Alex Gibson, http://miniapps.co.uk/
 * Released under MIT license 
 * http://miniapps.co.uk/license/
 * 
 */

 
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }

    var aArgs = Array.prototype.slice.call(arguments, 1), 
        fToBind = this, 
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP
                                 ? this
                                 : oThis || window,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };

    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();

    return fBound;
  };
}
 
(function(undefined) {
  var events = {
    start: ['touchstart', 'mousedown'],
    move: ['touchmove', 'mousemove'],
    end: ['touchend', 'touchcancel', 'mouseup']
  };

  function MobileRangeSlider(element, options) {

    this.element = element;
    
    this.options = {};
    
    options = options || {};
    
    var property;
    
    for (property in this.defaultOptions){
      if (options[property] !== undefined){
         this.options[property] = options[property];
      } else {
        this.options[property] = this.defaultOptions[property];
      }
    }
 
    if (typeof element === 'string'){
      this.element = document.getElementById(element);
    }
    
    //detect support for Webkit CSS 3d transforms
    this.supportsWebkit3dTransform = ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
    this.knob = this.element.getElementsByClassName('knob')[0];
    this.track = this.element.getElementsByClassName('track')[0];
    
    this.start = this.start.bind(this);
    this.move = this.move.bind(this);
    this.end = this.end.bind(this);
    
    this.addEvents("start");
    this.setValue(this.options.value);
    
    
    window.addEventListener("resize", (function(){
      this.setValue(this.value);
    }).bind(this));    
  }
  
  MobileRangeSlider.prototype.defaultOptions = {
    value: 0,
    min: 0,
    max: 100,
    callback: null
  };
  
  MobileRangeSlider.prototype.handle = function(event){
    
    event.preventDefault();
    
    if (event.targetTouches){
      event = event.targetTouches[0];
    }
    
    this.moveKnobTo(event.pageX);
  };
  
  
  MobileRangeSlider.prototype.addEvents = function(name){
    
    var list = events[name], 
      handler = this[name],
      all;
    
    for (all in list){
      this.element.addEventListener(list[all], handler, false);
    }
  };
  
  MobileRangeSlider.prototype.removeEvents = function(name){ 
    var list = events[name], 
      handler = this[name],
      all;
      
    for (all in list){
      this.element.removeEventListener(list[all], handler, false);
    }
  };
  
  MobileRangeSlider.prototype.start = function(event) {
    this.addEvents("move");
    this.addEvents("end");
    this.handle(event);
  };
  
  MobileRangeSlider.prototype.move = function(event) {
    this.handle(event);
  }; 

  MobileRangeSlider.prototype.end = function() {
    this.removeEvents("move");
    this.removeEvents("end");
  };
  
  MobileRangeSlider.prototype.setValue = function(value) {
    
    if (value === undefined){
      value = this.options.min;
    }
    
    var 
      knobWidth = this.knob.offsetWidth - 2,
      trackWidth = this.track.offsetWidth,
      range = this.options.max - this.options.min,
      width = trackWidth - knobWidth,
      pos = Math.round((value - this.options.min) * width / range);
    
    //use Webkit CSS 3d transforms for hardware acceleration if available 
    if (this.supportsWebkit3dTransform) {
      this.knob.style.webkitTransform = 'translate3d(' + pos + 'px, 0, 0)';
    } else {
      this.knob.style.webkitTransform = 
      this.knob.style.MozTransform = 
      this.knob.style.msTransform = 
      this.knob.style.OTransform = 
      this.knob.style.transform = 'translateX(' + pos + 'px)';
    }
    
    this.value = value;
    this.callback(value);
  };

  //moves the slider
  MobileRangeSlider.prototype.moveKnobTo = function(pos) {

    var element,
      knobWidth = this.knob.offsetWidth - 2,
      trackWidth = this.track.offsetWidth,
      width = trackWidth - knobWidth,
      range = this.options.max - this.options.min,
      value;
      
    for (element = this.element; element; element = element.offsetParent){
      pos -= element.offsetLeft;
    }

    pos += knobWidth / 2;
    pos = Math.min(pos, trackWidth);
    pos = Math.max(pos - knobWidth, 0);
  
    //use Webkit CSS 3d transforms for hardware acceleration if available 
    if (this.supportsWebkit3dTransform) {
      this.knob.style.webkitTransform = 'translate3d(' + pos + 'px, 0, 0)';
    } else {
      this.knob.style.webkitTransform = 
      this.knob.style.MozTransform = 
      this.knob.style.msTransform = 
      this.knob.style.OTransform = 
      this.knob.style.transform = 'translateX(' + pos + 'px)';
    }
  
    //return value change as a percentage
    value = this.options.min + Math.round(pos  * range / width );
        
    this.setValue(value);
  };

  //callback method will be implemented by user
  MobileRangeSlider.prototype.callback = function(value) { 
    
    if (this.options.callback){
      this.options.callback(value);
    }
  };

  //public function
  window.MobileRangeSlider = MobileRangeSlider;
  
})();