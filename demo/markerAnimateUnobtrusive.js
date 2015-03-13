/* global define,module,require,google */

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory.bind(null, root));
    } else if (typeof module !== "undefined" && module !== null && module.exports != null) { // jshint ignore:line
        // Node module.
        module.exports.markerAnimateUnobtrusive = factory(root, require('jquery'));
    } else {
        // Browser globals
        root.markerAnimateUnobtrusive = factory(root, root.jQuery);
    }
}(this,
    function (root, $) {
        'use strict';

        //default options
        var _options = {
                isOverridePositionCallback: function () { return false; },
                easing: "easeInOutQuint",
                duration: 1000
            };

        return {

            //Marker usually is google.maps.Marker .
            //options:
            //  isOverridePositionCallback will be called to know is currently in position override mode. It is useful for integration with
            //      OverlappingMarkerSpiderfier, in which case overridePositionCallback will trace whether setPosition or getPosition called
            //      from within oms code.
            //  duration - animation duration, 1000 by default.
            //  easing - animation easing, "easeInOutQuint" by default.
            decorateMarker: function (Marker, options) {

                _options = $.extend(_options, options);
                options = _options;

                var originalSetPosition = Marker.prototype.setPosition,
                    originalGetPosition = Marker.prototype.getPosition,
                    originalAddListener = google.maps.event.addListener;

                //AT_setPositionNoAnimation should be called from markerAnimate, so original version will be used instead of animated
                Marker.prototype.AT_setPositionNoAnimation = originalSetPosition;

                Marker.prototype.setPosition = function (latlng) {
                    var that = this,
                        startPosition,
                        endPosition = latlng instanceof google.maps.LatLng ? latlng : new google.maps.LatLng(latlng.lat, latlng.lng); //latLng can also be google.maps.LatLngLiteral.

                    if (!that.getMap() || (startPosition = originalGetPosition.call(that)) === undefined) { //Check position was created (and not changed)

                        delete that._AB_override_value;
                        that._AB_actual_value = endPosition;
                        originalSetPosition.apply(that, arguments);
                        return;

                    }

                    if (!that._AB_animate) { //not in the middle of animation

                        //make position_changed raise with end position, because _AB_animate still not set
                        originalSetPosition.apply(that, arguments);

                        //Keep endPosition, so from now on calls to getPosition() will return endPosition and not intermediate position of animation.
                        that._AB_animate = true;
                        if (options.isOverridePositionCallback()) {
                            that._AB_override_value = endPosition;
                        } else {
                            delete that._AB_override_value;
                            that._AB_actual_value = endPosition;
                        }

                        //return the marker to start position, position_changed will not raise because _AB_animate is set
                        originalSetPosition.call(that, startPosition);

                        that.animateTo(endPosition, {
                            easing: options.easing,
                            duration: options.duration,
                            complete: function () {
                                delete that._AB_animate;
                                delete that._AB_override_value;
                            },
                            startLat: startPosition.lat(),
                            startLng: startPosition.lng()
                        });

                    } else { //In the middle of animation, restart animation
                        that.stopAnimation(false);
                        delete that._AB_animate;
                        that.setPosition.apply(that, arguments);
                    }
                };

                Marker.prototype.getPosition = function () {
                    var that = this;

                    if (options.isOverridePositionCallback() && that._AB_override_value) {
                        return that._AB_override_value;
                    } else if (that._AB_actual_value) {
                        return that._AB_actual_value;
                    }

                    return originalGetPosition.apply(that, arguments);
                };

                google.maps.event.addListener = function (instance, eventName, handler) {
                    var newHandler;

                    //If event is position_changed, supply alternative handler
                    if (eventName === "position_changed") {
                        newHandler = function () {
                            //handler will not be called for instance that has _AB_animate set, or setPosition() called as part of spiderfy() or unspiderfy().
                            if (options.isOverridePositionCallback() || instance._AB_animate) {
                                return undefined;
                            }
                            return handler.apply(this, arguments);
                        };
                        return originalAddListener.call(this, instance, eventName, newHandler);
                    }

                    return originalAddListener.apply(this, arguments);
                };

                return Marker;
            },

            setOptions: function (options) {
                _options = $.extend(_options, options);
            }
        };
    }));