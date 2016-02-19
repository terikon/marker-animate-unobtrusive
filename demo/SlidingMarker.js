/* global define,module,require,google */

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'marker-animate'], factory.bind(null, root));
    } else if (typeof module !== "undefined" && module !== null && module.exports != null) { // jshint ignore:line
        // Node module.
        module.exports = factory(root, require('jquery'), require('marker-animate'));
    } else {
        // Browser globals
        root.SlidingMarker = factory(root, root.jQuery);
    }
}(this,
    function (root, $) {
        'use strict';

        //Let jQuery be soft dependency
        $ = $ || {};
        $.extend = $.extend || function extend(obj) {
            //Taken (and modified) from here: http://stackoverflow.com/a/14604815/1691132
            Array.prototype.slice.call(arguments, 1).forEach(function (source) {
                if (source) {
                    for (var prop in source) {
                        if (source[prop] && source[prop].constructor === Object) {
                            if (!obj[prop] || obj[prop].constructor === Object) {
                                obj[prop] = obj[prop] || {};
                                extend(obj[prop], source[prop]);
                            } else {
                                obj[prop] = source[prop];
                            }
                        } else {
                            obj[prop] = source[prop];
                        }
                    }
                }
            });
            return obj;
        };

        var GoogleMarker = google.maps.Marker; //Store original in case it will be replaced in initializeGlobally().

        var animateTo,
            markerAnimate_AnimateTo_Wrapper = function(destPosition, easing, duration) { //default implementation based on markerAnimate
                if (destPosition === null || destPosition === undefined) {
                    //as markerAnimate provides no means to stop animation, do it manually, even though it leaks markerAnimate implementation.
                    if (window.cancelAnimationFrame) {
                        window.cancelAnimationFrame(this.AT_animationHandler);
                    } else {
                        clearTimeout(this.AT_animationHandler); 
                    }
                    return;
                }
                google.maps.Marker.prototype.animateTo.apply(this, arguments);
            };

        //default options
        var defaultOptions = {
            easing: "easeInOutQuint",
            duration: 1000,
            animateFunctionAdapter: function (marker, destPosition, easing, duration) {
                if (!animateTo) {
                    if (!google.maps.Marker.prototype.animateTo) {
                        throw new Error("Please either reference markerAnimate.js, or provide an alternative animateFunctionAdapter");
                    }
                    animateTo = markerAnimate_AnimateTo_Wrapper;
                }
                animateTo.call(marker, destPosition, {
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
                    if (!this._suppress_animation) {
                        this._setInstancePositionAnimated(this.getPosition());
                    } else {
                        delete this._suppress_animation;
                    }
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
            this.bindTo("anchorPoint", this._instance, "anchorPoint"); //This makes InfoWindow.open(map, marker) work.
            this.bindTo("internalPosition", this._instance, "internalPosition"); //This makes InfoWindow.open(map, marker) work.

        };

        decorates(SlidingMarker, GoogleMarker);

        //Overrides
        $.extend(SlidingMarker.prototype, {

            getAnimationPosition: function () {
                return this.get("animationPosition");
            },

            //Changes marker position immediately
            setPositionNotAnimated: function (position) {
                this._suppress_animation = true; //will be unset by position_changed handler
                this.get("animateFunctionAdapter").call(null, this._instance, null); //stop current animation
                this.originalSet("position", position);
                this._instance.setPosition(position);
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