# marker-animate-unobtrusive aka SlidingMarker

[![Build Status](https://travis-ci.org/terikon/marker-animate-unobtrusive.svg?branch=master)](https://travis-ci.org/terikon/marker-animate-unobtrusive)

Enables a Google Maps marker to move from its original position to its destination in a natural, animated way
(unlike the current method of suddenly appearing on the destination spot). Please click on the map below in order to see
how it works. Select destination on the map to move marker to.

[![alt tag](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/SlidingMarker.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/markermove-sliding.html)

It can work in two modes.

- In one mode, you create SlidingMarker instead of google.maps.Marker. SlidingMarker inherits google's
marker, so working with it is pretty straight-forward.

- In other mode, SlidingMarker replaces google.maps.Marker with itself, so you just can just forget about it and enjoy
nice and smooth movement of all of your markers.

In both cases, animated and non-animated marker will behave exactly the same.

marker.getPosition() will always return final destination of marker, and position_changed event will only trigger when
movement starts. That's why it called unobtrusive - your current code will not even notice animation, it's completely
transparent.

SlidingMarker is a complete rewrite of markerAnimateUnobtrusive library, with much-much more features and greatly improved
architecture.

# Table of contents

- [Install](#install)
- [Use](#use)
- [Demo](#demo)
- [API](#api)
- [AMD](#amd)
- [MarkerWithGhost](#markerwithghost)
- [Integration with OverlappingMarkerSpiderfier](#integration-with-overlappingmarkerspiderfier)
- [Under the hood](#under-the-hood)
- [Things to consider for future versions](#things-to-consider-for-future-versions)
- [Contribute](#contribute)

This project is based on excellent [marker-animate](https://github.com/combatwombat/marker-animate) project by Robert Gerlach.

This project is one big step towards animated [OverlappingMarkerSpiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier).

# Install

## with bower

```
bower install marker-animate-unobtrusive
```

## include on page

Download **SlidingMarker.js**
[minified](https://raw.githubusercontent.com/terikon/marker-animate-unobtrusive/master/dist/SlidingMarker.min.js) or
[debug](https://raw.githubusercontent.com/terikon/marker-animate-unobtrusive/master/SlidingMarker.js)
from Github, and include it in your page.

SlidingMarker depends on Google Maps and [jquery](http://jquery.com/download) libraries, so include them as well.

jquery.easing may be downloaded from [here](http://gsgd.co.uk/sandbox/jquery/easing/jquery.easing.1.3.js).

Download marker-animate [from here](https://raw.githubusercontent.com/combatwombat/marker-animate/master/markerAnimate.js).

So dependencies look like follows:

```html
<!-- Dependencies -->

<!-- jquery library and jquery.easing plugin are needed -->
<script src="jquery.min.js"></script>
<script src="jquery.easing.1.3.js"></script>

<!-- we provide marker for google maps, so here it comes  -->
<script src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>

<!-- we use markerAnimate to actually animate marker -->
<script src="markerAnimate.js"></script>

<!-- SlidingMarker hides details from you - your markers are just animated automagically -->
<script src="SlidingMarker.min.js"></script>
```
Note: [jQuery](http://jquery.com/download) is soft dependency, you can prefer not to include it. But if you decide not to,
you should provide [alternative animation routine](#SlidingMarker.options.animateFunctionAdapter), and should not include
jquery.easing and markerAnimate libraries.

All needed dependencies are in [vendor](https://github.com/terikon/marker-animate-unobtrusive/tree/master/vendor) folder.

## with npm

```
npm install marker-animate-unobtrusive
```

The library is compatible with [NW.js](http://nwjs.io). Use it following way:

```html
<script type="text/javascript" src="http://maps.google.com/maps/api/js?sensor=true"></script>
<script type="text/javascript">
  global.google = google;
</script>
<script type="text/javascript" src="app.js"></script>
```

```js
var SlidingMarker = require('marker-animate-unobtrusive');
var marker = new SlidingMarker();
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

<a name="SlidingMarker.initializeGlobally"></a>
[SlidingMarker.initializeGlobally()](#SlidingMarker.initializeGlobally) when called, replaces google.maps.Marker with SlidingMarker, so all
markers of google maps will be animated.

SlidingMarker has all the events, methods and options of google.maps.Marker - that's its beauty.

- **getPosition()** function returns discrete position, instead of animated one. That means that when one calls setPosition()
and animation is in place, getPosition() will return final position instead of intermediate. Use
[getAnimationPosition()](#getAnimationPosition) to retrieve intermediate position.

- **position_changed** event will be raised one time per call to setPosition(), even when animation is in place. To receive
updates on animated movement, use [animationposition_changed](#animationposition_changed) event.

In addition, following options are supported to fine-tune animation for each marker:

- **easing** - "easeInOutQuint" by default. Possible values are same as in
[jquery.easing](http://gsgd.co.uk/sandbox/jquery/easing/) library.
- **duration** - in ms, 1000 by default.
<a name="SlidingMarker.options.animateFunctionAdapter"></a>
- **animateFunctionAdapter** - by default, SlidingMarker assumes that google.maps.Marker.prototype is enhanced with animateTo method, but you can provide alternative animation adapter. It should be function with following declaration:
animateFunctionAdapter(marker, destPosition, easing, duration). If destPosition provided is null, adapter should stop animation.

Example:

```js
var marker = new SlidingMarker({
    position: myLatlng,
    map: map,
    title: "I'm sliding marker",
    duration: 2000,
    easing: "easeOutExpo"
});
...
// use marker as ordinal google map's marker.
// few animation customizations are also possible.
marker.setDuration(1000);
```

There are few additions to SlidingMarker instance:

<a name="SlidingMarker.setDuration"></a>
[setDuration(duration)](#SlidingMarker.setDuration) sets duration of animation for marker, in ms.

<a name="SlidingMarker.getDuration"></a>
[getDuration()](#SlidingMarker.getDuration) returns duration of animation.

<a name="SlidingMarker.setEasing"></a>
[setEasing(easing)](#SlidingMarker.setEasing) sets easing type of animation.

<a name="SlidingMarker.getEasing"></a>
[getEasing()](#SlidingMarker.getEasing) return easing type.

<a name="SlidingMarker.getAnimationPosition"></a>
[getAnimationPosition()](#SlidingMarker.getAnimationPosition) returns position of animated marker.

<a name="SlidingMarker.setPositionNotAnimated"></a>
[setPositionNotAnimated(position)](#SlidingMarker.setPositionNotAnimated) performs original not animated setPosition() on marker.

<a name="SlidingMarker.animationposition_changed"></a>
[animationposition_changed](#SlidingMarker.animationposition_changed) event is raised when position of visible animated marker changes.


# Demo

Demos reside in [demo](https://github.com/terikon/marker-animate-unobtrusive/tree/master/demo) folder.

In following demo you can see that position_changed is called in natural way. Click any point on map to see marker move. 

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/SlidingMarker.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/markermove-sliding.html)

You can use SlidingMarker with other libraries that enhance original marker, like
[MarkerWithLabel](http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerwithlabel/docs/reference.html) or
[Geolocation Marker](http://google-maps-utility-library-v3.googlecode.com/svn/trunk/geolocationmarker/docs/reference.html).

It can be used with [OverlappingMarkerSpiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier) as well:

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/oms.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/map-oms-animate.html)

Here is animated MarkerWithLabel for a first time:

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/markerWithLabel.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/markerwithlabelmove-sliding.html)

Here is animated version of Geolocation Marker:

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/geolocationmarker.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/geolocationmarker-sliding.html)

It can be used with InfoWindow:

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/infowindow.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/markermove-infowindow.html)

This demonstrates [MarkerWithGhost](#markerwithghost). Click on map to call setPosition. Right-click to call setGhostPosition.
Only the "ghost" will move, causing no events.

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/SlidingMarker.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/markermove-withghost.html)

Sometimes libraries should be slightly modified to make use of animation. Animated versions of MarkerWithLabel and
Geolocation Marker are in [vendor](https://github.com/terikon/marker-animate-unobtrusive/tree/master/vendor) folder.

# AMD

marker-animate-unobtrusive can be used with [requirejs](http://requirejs.org/).

'jquery' library should be configured with requirejs. marker-animate should be configured as well.

```js
requirejs.config({
  shim: {
    "jquery-easing": ["jquery"],
    "marker-animate": { deps: ["jquery-easing"] }
  }
});
```

The usage is simple:

```js
define(['SlidingMarker'], function (SlidingMarker) {
	//Use it here
}
``` 

# MarkerWithGhost

In addition to SlidingMarker, you can use MarkerWithGhost class. It useful in less scenarios. Example scenario is usage
with [OverlappingMarkerSpiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier).

MarkerWithGhost provides "ghost" mode. When this mode active, the marker moves as usual, but fires no position_changed
events. It's position returned by getPosition method will not change either.

Ghost mode is activated by calling setGhostPosition method. It will deactivate as soon as you call to plain setPosition().

Ghost will move always and provide ghostPosition property, as well as ghostposition_changed event. When not in "ghost mode",
it will move with marker. When "ghost mode" is active, the ghost will move instead of marker.

## API of MarkerWithGhost

MarkerWithGhost inherits SlidingMarker.

<a name="MarkerWithGhost.initializeGlobally"></a>
[MarkerWithGhost.initializeGlobally()](#MarkerWithGhost.initializeGlobally) works just as [same method](#SlidingMarker.initializeGlobally)
of SlidingMarker.

### instance methods

<a name="MarkerWithGhost.setGhostPosition"></a>
[setGhostPosition(ghostPosition)](#MarkerWithGhost.setGhostPosition) starts "ghost mode". Marker moves to provided position,
but will not fire position_changed event, and it's position property will not change. To exit "ghost" mode call setPosition().

<a name="MarkerWithGhost.getGhostPosition"></a>
[getGhostPosition()](#MarkerWithGhost.getGhostPosition) returns position of ghost. If not in ghost mode, it will be equal to
position property.

<a name="MarkerWithGhost.getGhostAnimationPosition"></a>
[getGhostAnimationPosition()](#MarkerWithGhost.getGhostAnimationPosition) return animation position of ghost. If not in 
ghost mode, it will be equal to animationPosition property.

### events

<a name="MarkerWithGhost.ghostposition_changed"></a>
[ghostposition_changed](#MarkerWithGhost.ghostposition_changed) fires as position of ghost changes. If not in ghost mode,
it still will fire.

<a name="MarkerWithGhost.ghostanimationposition_changed"></a>
[ghostanimationposition_changed](#MarkerWithGhost.ghostanimationposition_changed) fires as animationPosition of ghost
changes. If not in ghost mode, it still will fire.

# Integration with OverlappingMarkerSpiderfier

It's possible to add animation to glorious [OverlappingMarkerSpiderfier](https://github.com/jawj/OverlappingMarkerSpiderfier)
project by George MacKerron. You can see a demo here, just click a bunch of markers to see them move:

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/oms.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/unobtrusive/map-oms-animate.html)

*Declaimer: I think this demo is one of few things one can stare are indefinitely, along with classic Windows Defragmenter and Mac
minimize animation :)*

To achieve this, slightly modified version of oms.js was used that you can find in
[vendor folder](https://github.com/terikon/marker-animate-unobtrusive/tree/master/vendor), or
in [this github fork](https://github.com/viskin/OverlappingMarkerSpiderfier/tree/animation).

For curious ones, the trick to make OverlappingMarkerSpiderfier support animation is to use [MarkerWithGhost](#markerwithghost) instead
of plain google.maps.Marker, and make oms.js call ghosted properties, e.g. to getGhostPosition() instead of
getPosition().

Additional bonus arises from using MarkerWithGhost, and it is that no unnecessary position_changed events are triggered
when spiderfying occurs. For you, getPostion on your marker will return its actual position, and will not be effected by spiderfier.

# Under the hood

## Imperfection of marker-animate

Here's demonstration of difficulties we met with original [marker-animate](https://github.com/combatwombat/marker-animate) library.

- With it you should call animateTo() method instead of usual setPosition(). We wanted fire-and-forget functionality,
so all markers will just animate.
- Huge issue is that original library causes masses of position_changed event while marker is being animated. You can see it in this demo (of original library), with large amount of position_changed event occur: 

[![alt obtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/obtrusive.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/obtrusive/markermove-obtrusive.html)

- While marker moves in original library, it reports its intermediate position when getPosition() called. If we call
marker.setPosition(point), we want to receive the point from marker.getPosition(), and not some useless animation state.

These facts prevents marker-animate from usage with other libraries that depend on markers.

## Architecture of SlidingMarker

The solution was to use decorator pattern. SlidingMarker inherits google.maps.Marker, so it can be used anywhere just like
google.maps.Marker itself. For example, following is true:

```js
SlidingMarker instanceof google.maps.Marker // true 
```

But this marker is never attached to the map, even if you call marker.setMap(map). Instead, there's another visible marker,
called _instance, that is attached to the map. You work directly with marker, and every operation you perform on marker is 
redirected to _instance. For example, getMap() method called on marker will call getMap() on _instance .

Every user event, like click, that triggers on visible _instance marker is redirected back to marker itself.

This way animation that occur on visible _instance does not interfere with invisible marker that you work with.

So, storing SlidingMarker takes *2 memory than storing instance of google.maps.Marker. 

# Things to consider for future versions

- ~~ Make it possible to use any easing library, not just jquery_easing ~~
- Make it possible to restore google maps to original state after initializeGlobally() called.
- Make it possible to stop animation. Animation should stop as well when setPositionNotAnimated is called.
- Improve speed.
- Provide support for alternative animation engine, e.g. [Velocity](http://julian.com/research/velocity/).
- Compile with closure-compiler. Annotations are already provided at [annotations folder](https://github.com/terikon/marker-animate-unobtrusive/tree/master/annotations). 

# Contribute

Use [GitHub issues](https://github.com/terikon/marker-animate-unobtrusive/issues) and [Pull Requests](https://github.com/terikon/marker-animate-unobtrusive/pulls).

Ideas are welcome as well :)

To build:
	
    npm run build

Before committing, please run jshint:

    npm run jshint

To run tests:

    npm run test
    

Tests reside in [tests/spec](https://github.com/terikon/marker-animate-unobtrusive/tree/master/tests/spec) folder.

Tests are also runnable in browser and debuggable with [tests/SpecRunner.html](
<https://github.com/terikon/marker-animate-unobtrusive/tree/master/tests/SpecRunner.html>).