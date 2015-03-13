# marker-animate-unobtrusive

Makes Google Maps markers to move naturally in animated way. When added to map, it makes google.maps.marker.setPosition()
method to cause nice animation of movement. This looks more natural for user than just marker jump to position.
Like this:

[![alt tag](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/map.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/markermove-unobtrusive.html)

marker.getPosition() will always return final destination of marker, and position_changed event will only trigger when
movement starts. That's why it called unobtrusive - your current code will not event notice animation, it's completely
transparent.

# Table of contents

- [Install](#install)
- [Use](#use)
- [Demo](#demo)
- [API](#api)
- [AMD](#amd)
- [Things to consider for future versions](#things-to-consider-for-future-versions)
- [Contribute](#contribute)

This project is based on excellent [marker-animate](https://github.com/combatwombat/marker-animate) project by Robert Gerlach.
The project was modified slightly to provide additional functionality, so modified forked version found
[here](https://github.com/viskin/marker-animate) should be used.

This project is one big step towards animated OverlappingMarkerSpiderfier.

# Install

To install with npm, you can

```
npm install marker-animate-unobtrusive
```

Or you can download **markerAnimateUnobtrusive.js**
[minified](https://raw.githubusercontent.com/terikon/marker-animate-unobtrusive/master/dist/markerAnimateUnobtrusive.min.js) or
[source](https://raw.githubusercontent.com/terikon/marker-animate-unobtrusive/master/markerAnimateUnobtrusive.js)
from Github, and include it in your page.

marker-animate-unobtrusive depends on Google Maps and [jquery](http://jquery.com/download) libraries, so include them as well.

```html
<!-- Dependencies -->
<script src="jquery.min.js"></script>
<script src="jquery_easing.js"></script>
<script src="https://maps.googleapis.com/maps/api/js?sensor=false"></script>
<script src="markerAnimateUnobtrusive.min.js"></script>
```

# Use

First of all, call decorateMarker() method that will inject animation into Google Maps: 

```js
markerAnimateUnobtrusive.decorateMarker(google.maps.Marker)
```

That's it. Now all marker movements will be animated, e.g. :

```js
marker.setPosition(latLng); //Will cause smooth animation
```

**Do not** call animateTo() method on marker, this will not work in current version. Just call setPosition().

# API

markerAnimateUnobtrusive object is created in global scope (on injected with [AMD](#amd)), with following methods in it:

<a name="decorateMarker"></a>
[markerAnimateUnobtrusive.decorateMarker(Marker, options)](#decorateMarker) initialize the mechanism. google.maps.Marker
should be provided as Marker parameter at most cases. options is optional:

- easing - "easeInOutQuint" by default
- duration - in ms, 1000 by default
- isOverridePositionCallback - callback for advanced scenarios, to tell when marker movement should go to "override mode", 
meaning that movement is ignored. This used by OverlappingMarkerSpiderfier integration.

<a name="setOptions"></a>
[setOptions(options)](#setOptions) replaced previously set options, for all markers globally. 

Important - your code should never directly access marker's *position* field, only with *marker.getPosition()* method.

# Demo

Here's demonstration of difficulties we met with original [marker-animate](https://github.com/combatwombat/marker-animate) library.

- With it you should call animateTo() method instead of usual setPosition(). We wanted fire-and-forget functionality,
so all markers will just animate.
- Huge issue is that original library causes masses of position_changed event while marker is being animated. You can see it in this demo (of original library), with large amount of position_changed event occur: 

[![alt obtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/map.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/markermove-obtrusive.html)

- While marker moves in original library, it reports its intermediate position when getPosition() called. If we call
marker.setPosition(point), we want to receive the point from marker.getPosition(), and not some useless animation state.

In following demo you can see that position_changed is called in natural way: 

[![alt unobtrusive](http://terikon.github.io/marker-animate-unobtrusive/demo/screenshots/map.jpg)](http://terikon.github.io/marker-animate-unobtrusive/demo/markermove-unobtrusive.html)

# AMD

marker-animate-unobtrusive can be used with [requirejs](http://requirejs.org/).

'jquery' library should be configured with requirejs. The usage is simple:

```js
define(['markerAnimateUnobtrusive'], function (markerAnimateUnobtrusive) {
	//Use it here
}
``` 

# Things to consider for future versions

- Make it possible to use original animateTo() method
- Make it possible to use any easing library, not just jquery_easing
- Add tests
- Make initialization simpler, with just call to decorateMarker() without parameters

# Contribute

Use [GitHub issues](https://github.com/terikon/marker-animate-unobtrusive/issues) and [Pull Requests](https://github.com/terikon/marker-animate-unobtrusive/pulls).

Ideas are welcome as well :)

To build:
	
	npm run build

Before committing, please run jshint:

	npm run jshint
