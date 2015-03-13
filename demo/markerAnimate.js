// Animated Marker Movement. Robert Gerlach 2012-2013 https://github.com/combatwombat/marker-animate
// MIT license
//
// params:
// newPosition        - the new Position as google.maps.LatLng()
// options            - optional options object (optional)
// options.duration   - animation duration in ms (default 1000)
// options.easing     - easing function from jQuery and/or the jQuery easing plugin (default 'linear')
// options.complete   - callback function. Gets called, after the animation has finished
// options.startLat   - alternative start latitude, if not provided marker's position will be used
// options.startLng   - alternative start longitude, if not provided marker's position will be used
google.maps.Marker.prototype.animateTo = function(newPosition, options) {
  defaultOptions = {
    duration: 1000,
    easing: 'linear',
    complete: null,
    startLat: this.getPosition().lat(),
    startLng: this.getPosition().lng(),
  }
  options = options || {};

  // complete missing options
  for (key in defaultOptions) {
    options[key] = options[key] || defaultOptions[key];
  }

  // throw exception if easing function doesn't exist
  if (options.easing != 'linear') {            
    if (typeof jQuery == 'undefined' || !jQuery.easing[options.easing]) {
      throw '"' + options.easing + '" easing function doesn\'t exist. Include jQuery and/or the jQuery easing plugin and use the right function name.';
      return;
    }
  }
  
  window.requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

  // save current position. prefixed to avoid name collisions. separate for lat/lng to avoid calling lat()/lng() in every frame
  this._AT = {
      startPosition_lat: options.startLat,
      startPosition_lng: options.startLng,
      options: options,
      newPosition: newPosition
  };
  var newPosition_lat = newPosition.lat();
  var newPosition_lng = newPosition.lng();
  
  // crossing the 180° meridian and going the long way around the earth?
  if (Math.abs(newPosition_lng - this._AT.startPosition_lng) > 180) {
    if (newPosition_lng > this._AT.startPosition_lng) {      
      newPosition_lng -= 360;      
    } else {
      newPosition_lng += 360;
    }
  }

  //if AT_setPositionNoAnimation set, it will be called instead of setPosition.
  var setPosition = this.AT_setPositionNoAnimation || this.setPosition;

  var animateStep = function(marker, startTime) {            
    var ellapsedTime = (new Date()).getTime() - startTime;
    var durationRatio = ellapsedTime / options.duration; // 0 - 1
    var easingDurationRatio = durationRatio;

    // use jQuery easing if it's not linear
    if (options.easing !== 'linear') {
      easingDurationRatio = jQuery.easing[options.easing](durationRatio, ellapsedTime, 0, 1, options.duration);
    }
    
    if (durationRatio < 1) {
      var deltaPosition = new google.maps.LatLng( marker._AT.startPosition_lat + (newPosition_lat - marker._AT.startPosition_lat)*easingDurationRatio,
                                                  marker._AT.startPosition_lng + (newPosition_lng - marker._AT.startPosition_lng)*easingDurationRatio);
      setPosition.call(marker, deltaPosition);

      // use requestAnimationFrame if it exists on this browser. If not, use setTimeout with ~60 fps
      if (window.requestAnimationFrame) {
        marker._AT.animationHandler = window.requestAnimationFrame(function() {animateStep(marker, startTime)});                
      } else {
        marker._AT.animationHandler = setTimeout(function() {animateStep(marker, startTime)}, 17); 
      }

    } else {
      
      setPosition.call(marker, newPosition);

      if (typeof options.complete === 'function') {
        options.complete();
      }

    }            
  }

  // stop possibly running animation
  if (window.cancelAnimationFrame) {
    window.cancelAnimationFrame(this._AT.animationHandler);
  } else {
    clearTimeout(this._AT.animationHandler); 
  }
  
  animateStep(this, (new Date()).getTime());
}

//jumpToEnd - default true.
google.maps.Marker.prototype.stopAnimation = function (jumpToEnd) {
    if (this._AT) {

        if (jumpToEnd === undefined) {
            jumpToEnd = true;
        }

        if (window.cancelAnimationFrame) {
            window.cancelAnimationFrame(this._AT.animationHandler);
        } else {
            clearTimeout(this._AT.animationHandler);
        }

        var setPosition = this.AT_setPositionNoAnimation || this.setPosition;

        if (jumpToEnd) {
            setPosition.call(this, this._AT.newPosition);
        }

        var options = this._AT.options;

        //free up resources
        delete this._AT;

        if (typeof options.complete === 'function') {
            options.complete();
        }
    }
}