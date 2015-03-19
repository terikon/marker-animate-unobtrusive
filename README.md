# marker-animate-unobtrusive aka SlidingMarker

Makes Google Maps markers to move naturally in animated way. This looks more natural for user than just marker jump to position.
Like this:

[![alt tag](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/SlidingMarker.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/markermove-sliding.html)

It can work in two modes.

- In one mode, you create SlidingMarker instead of google.maps.Marker. SlidingMarker inherits google's
marker, so working with it is pretty straight-forward.

- In other mode, SlidingMarker replaces google.maps.Marker with itself, so you just can just forget about it and enjoy
nice and smooth movement of all of your markers.

In both cases, animated and non-animated marker will behave exactly the same.

marker.getPosition() will always return final destination of marker, and position_changed event will only trigger when
movement starts. That's why it called unobtrusive - your current code will not event notice animation, it's completely
transparent.

SlidingMarker is a complete rewrite of markerAnimateUnobtrusive library, with much-much more features and greatly improved
architecture.

# Table of contents

- [Install](#install)
- [Use](#use)
- [Demo](#demo)
- [API](#api)
- [AMD](#amd)
- [Under the hood](#under-the-hood)
- [Things to consider for future versions](#things-to-consider-for-future-versions)
- [Contribute](#contribute)

This project is based on excellent [marker-animate](https://github.com/combatwombat/marker-animate) project by Robert Gerlach.

This project is one big step towards animated [OverlappingMarkerSpiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier).

# Install

## with npm

```
npm install marker-animate-unobtrusive
```

## manually

Download **SlidingMarker.js**
[minified](https://raw.githubusercontent.com/terikon/marker-animate-unobtrusive/master/dist/SlidingMarker.min.js) or
[debug](https://raw.githubusercontent.com/terikon/marker-animate-unobtrusive/master/SlidingMarker.js)
from Github, and include it in your page.

SlidingMarker depends on Google Maps and [jquery](http://jquery.com/download) libraries, so include them as well.

jquery.easing may be downloaded from [here](http://gsgd.co.uk/sandbox/jquery/easing/).

Download marker-animate [from here](https://raw.githubusercontent.com/combatwombat/marker-animate/master/markerAnimate.js).

So dependencies look like follows:

```html
<!-- Dependencies -->
<script src="jquery.min.js"></script>
<script src="jquery.easing.js"></script>
<script src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>
<script src="markerAnimate.js"></script>
<script src="SlidingMarker.min.js"></script>
```

# Use

## locally

When you create marker, instantiate SlidingMarker instance with same parameter you used to instantiate google.maps.Marker:

```js
//old code
//var marker = new google.maps.Marker();

//new code
var marker = new SlidingMarker();
```

## globally

If you want to make all markers on map animate, first of all, call SlidingMarker.initializeGlobally() method.
Do it as soon as SlidingMarker script loads, before any other script:  

```html
<script src="SlidingMarker.min.js"></script>
<script>
  SlidingMarker.initializeGlobally();
</script>
```

That's it. Now all marker movements will be animated, e.g. :

```js
var marker = new google.maps.Marker();
...
marker.setPosition(latLng); //Will cause smooth animation
```


# API

**SlidingMarker** object that inherits google.maps.Marker is created in global scope (on injected with [AMD](#amd)), with following method in it:

<a name="initializeGlobally"></a>
[SlidingMarker.initializeGlobally()](#decorateMarker) when called, replaces google.maps.Marker with SlidingMarker, so all
markers of google maps will be animated.

SlidingMarker has all the events, methods and options of google.maps.Marker - that's its beauty. In addition, following
options are supported to fine-tune animation for each marker:

- easing - "easeInOutQuint" by default
- duration - in ms, 1000 by default
- animateFunction - by default, SlidingMarker assumes that marker is enhanced with animateTo method, but you can provide
alternative animation function to call on marker.
- isOverridePositionCallback - callback for advanced scenarios, to tell when marker movement should go to "override mode", 
meaning that movement is ignored. This used by OverlappingMarkerSpiderfier integration.

Example:

```js
var marker = new SlidingMarker({
    position: myLatlng,
    map: map,
    title: 'I\m sliding marker',
    duration: 2000
});
...
marker.setDuration(1000);
```

# Demo

Demos reside in demo folder.

In following demo you can see that position_changed is called in natural way. Click any point on map to see marker move. 

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/SlidingMarker.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/markermove-sliding.html)

You can use SlidingMarker with other libraries that enhance original marker, like
[MarkerWithLabel](http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerwithlabel/docs/reference.html) or
[Geolocation Marker](http://google-maps-utility-library-v3.googlecode.com/svn/trunk/geolocationmarker/docs/reference.html).

Here is animated MarkerWithLabel for a first time:

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/markerWithLabel.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/markerwithlabelmove-sliding.html)

Here is animated version of Geolocation Marker:

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/geolocationmarker.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/geolocationmarker-sliding.html)

Sometimes libraries should be slightly modified to make use of animation. Animated versions of MarkerWithLabel and
Geolocation Marker are in vendor folder.

# AMD

marker-animate-unobtrusive can be used with [requirejs](http://requirejs.org/).

'jquery' library should be configured with requirejs. markerAnimate should be configured as well.

```js
requirejs.config({
  shim: {
    "jquery.easing": ["jquery"],
    "markerAnimate": { deps: ["jquery.easing"] }
  }
});
```

The usage is simple:

```js
define(['SlidingMarker'], function (SlidingMarker) {
	//Use it here
}
``` 

# Under the hood

Here's demonstration of difficulties we met with original [marker-animate](https://github.com/combatwombat/marker-animate) library.

- With it you should call animateTo() method instead of usual setPosition(). We wanted fire-and-forget functionality,
so all markers will just animate.
- Huge issue is that original library causes masses of position_changed event while marker is being animated. You can see it in this demo (of original library), with large amount of position_changed event occur: 

[![alt obtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/obtrusive.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/obtrusive/markermove-obtrusive.html)

- While marker moves in original library, it reports its intermediate position when getPosition() called. If we call
marker.setPosition(point), we want to receive the point from marker.getPosition(), and not some useless animation state.

These facts prevents marker-animate from usage with other libraries that depend on markers.

# Things to consider for future versions

- Make it possible to use any easing library, not just jquery_easing
- Make it possible to restore google maps to original state after initializeGlobally() called. 

# Contribute

Use [GitHub issues](https://github.com/terikon/marker-animate-unobtrusive/issues) and [Pull Requests](https://github.com/terikon/marker-animate-unobtrusive/pulls).

Ideas are welcome as well :)

To build:
	
    npm run build

Before committing, please run jshint:

    npm run jshint

To run tests:

    npm run test

