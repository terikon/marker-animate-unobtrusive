/* global define,module,require,google */

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'markerAnimate'], factory.bind(null, root));
    } else if (typeof module !== "undefined" && module !== null && module.exports != null) { // jshint ignore:line
        // Node module.
        module.exports.SlidingMarker = factory(root, require('jquery'));
    } else {
        // Browser globals
        root.SlidingMarker = factory(root, root.jQuery);
    }
}(this,
    function (root, $) {
        'use strict';

        var GoogleMarker = google.maps.Marker; //Store original in case it will be replaced in initializeGlobally().

        //default options
        var defaultOptions = {
            easing: "easeInOutQuint",
            duration: 1000,
            animateFunctionAdapter: function (marker, destPosition, easing, duration) {
                google.maps.Marker.prototype.animateTo.call(marker, destPosition, {
                    easing: easing,
                    duration: duration,
                    complete: function () {
                    }
                });
            }
        };

        var inherits = function (childCtor, parentCtor) {
            /* @constructor */
            function TempCtor() {}

            TempCtor.prototype = parentCtor.prototype;
            childCtor.superClass_ = parentCtor.prototype;
            childCtor.prototype = new TempCtor();
            /* @override */
            childCtor.prototype.constructor = childCtor;
        };

        var decorates = function (childCtor, parentCtor) {
            inherits(childCtor, parentCtor);

            var parentPrototype = parentCtor.prototype;

            //TODO: google.maps.MVCObject.prototype.set if object instanceof GoogleMarker

            $.extend(childCtor.prototype, {
                _instance: null, //override it in constructor

                originalSet: function () {
                    return parentPrototype.set.apply(this, arguments);
                },

                //from MVCObject
                set: function (key, value) {
                    var that = this;

                    that.originalSet.apply(that, arguments);

                    if (key === "position" && that instanceof SlidingMarker) {
                        that._setInstancePositionAnimated(value);
                    } else {
                        that.originalSet.apply(that._instance, arguments);
                    }
                },

                _setInstancePositionAnimated: function (position) {
                    var that = this;

                    if (that._constructing) { //pass by
                        return;
                    }

                    if (!position || !that._instance.getPosition()) { //If position is set for a first time, no animation should be applied
                        if (that._instance.getPosition() !== position) {
                            that._instance.setPosition(position);
                        }
                        return;
                    }

                    //apply animation function
                    //this will cause many animationposition_changed events
                    that.get("animateFunctionAdapter").call(null, that._instance, position, that.get("easing"), that.get("duration"));
                },

                //setValues() will call set(), no need to override

                originalAddListener: function () {
                    return parentPrototype.addListener.apply(this, arguments);
                },

                //from MVCObject
                addListener: function (eventName, handler) {
                    var target = (eventName === "map_changed") ? this._instance : getEventTarget.call(this, eventName);
                    return this.originalAddListener.apply(target, arguments);
                },

                map_changed: function () {
                    //Should be empty
                    //Prevents this marker from appearing on map. Only this._instance marker will appear.
                },

                //This will be called by binding created with marker.bindTo() method, instead of call to set("position").
                position_changed: function () {
                    this._setInstancePositionAnimated(this.getPosition());
                }
                
            });

        };

        //call it on SlidingMarker
        var getEventTarget = function (eventName) {
            //redirect _changed events to this, other events to _instance
            if (eventName.endsWith("_changed")) { //all _changed redirect to this
                return this;
            } 
            return this._instance;
        };

        var originalAddListener = google.maps.event.addListener;
        google.maps.event.addListener = function (instance, eventName, handler) {
            //Redirect listener to target
            if (instance instanceof SlidingMarker) {
                var target = (eventName === "map_changed") ? instance._instance : getEventTarget.call(instance, eventName);
                return originalAddListener.call(this, target, eventName, handler);
            }

            return originalAddListener.apply(this, arguments);
        };

        var originalTrigger = google.maps.event.trigger;
        google.maps.event.trigger = function (instance, eventName) {
            //Replace instance parameter to target
            if (instance instanceof SlidingMarker) {
                var target = (eventName === "map_changed") ? instance : getEventTarget.call(instance, eventName),
                    newArgs = [target].concat(Array.prototype.slice.call(arguments, 1)); //replaces instance parameter with target

                return originalTrigger.apply(this, newArgs);
            }

            return originalTrigger.apply(this, arguments);
        };

        //just string helper
        String.prototype.endsWith = String.prototype.endsWith || function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };

        //constructor
        var SlidingMarker = function (opt_options) {

            opt_options = $.extend({}, defaultOptions, opt_options);

            this._instance = new GoogleMarker(opt_options);

            this.animationPosition = null;

            this._constructing = true;
            // Call the parent constructor.
            GoogleMarker.call(this, opt_options);
            delete this._constructing;

            this.bindTo("animationPosition", this._instance, "position");

        };

        decorates(SlidingMarker, GoogleMarker);

        //Overrides
        $.extend(SlidingMarker.prototype, {

            getAnimationPosition: function () {
                return this.get("animationPosition");
            },

            //Changes marker position immediately
            setPositionNotAnimated: function (position) {
                this.originalSet("position", position);
            },

            setDuration: function (value) {
                this.set("duration", value);
            },

            getDuration: function () {
                return this.get("duration");
            },

            setEasing: function (value) {
                this.set("easing", value);
            },

            getEasing: function () {
                return this.get("easing");
            }

        });

        SlidingMarker.initializeGlobally = function () {
            google.maps.Marker = SlidingMarker;
        };

        return SlidingMarker;

    }));