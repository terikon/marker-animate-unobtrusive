/* global define,module,require,google */

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'SlidingMarker'], factory.bind(null, root));
    } else if (typeof module !== "undefined" && module !== null && module.exports != null) { // jshint ignore:line
        // Node module.
        module.exports = factory(root, require('jquery'), require('SlidingMarker'));
    } else {
        // Browser globals
        root.MarkerWithGhost = factory(root, root.jQuery, root.SlidingMarker);
    }
}(this,
    function (root, $, SlidingMarker) {
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

        var inherits = function (childCtor, parentCtor) {
            /* @constructor */
            function TempCtor() { }

            TempCtor.prototype = parentCtor.prototype;
            childCtor.superClass_ = parentCtor.prototype;
            childCtor.prototype = new TempCtor();
            /* @override */
            childCtor.prototype.constructor = childCtor;
        };

        //constructor
        var MarkerWithGhost = function (opt_options) {

            this.ghostPosition = null;
            this.ghostAnimationPosition = null;

            // Call the parent constructor.
            SlidingMarker.call(this, opt_options);

            this.bindTo("ghostPosition", this, "position");
            this.bindTo("ghostAnimationPosition", this._instance, "position");
        };

        inherits(MarkerWithGhost, SlidingMarker);

        //Overrides
        $.extend(MarkerWithGhost.prototype, {

            _isGhost: false,

            set: function (key, value) {
                if (key === "position") {

                    this._turnGhostModeOff();

                } else if (key === "ghostPosition") {

                    this._turnGhostModeOn();   

                    this.originalSet("ghostPosition", value);

                    SlidingMarker.prototype._setInstancePositionAnimated.call(this, value);

                    return;

                }

                SlidingMarker.prototype.set.apply(this, arguments);
            },

            _rebindEventListener: null,

            _turnGhostModeOn: function () {
                if (!this._isGhost) {

                    if (!this._rebindEventListener) {
                        google.maps.event.removeListener(this._rebindEventListener);
                        this._rebindEventListener = null;
                    }

                    this.unbind("animationPosition");
                    this.unbind("ghostPosition");

                    this._isGhost = true;
                }
            },

            _turnGhostModeOff: function () {
                var that = this;

                if (this._isGhost) {

                    //rebind only after _instance's position equals position, to prevent raising animationposition_change events for ghost
                    this._rebindEventListener = google.maps.event.addListener(this._instance, "position_changed", function () {
                        if (that.getPosition() === that._instance.getPosition()) {

                            that.bindTo("animationPosition", that._instance, "position");

                            google.maps.event.removeListener(that._rebindEventListener);
                            that._rebindEventListener = null;
                        }
                    });

                    this.bindTo("ghostPosition", this, "position");

                    this._isGhost = false;
                }
            },

            getGhostPosition: function () {
                return this.get("ghostPosition");
            },

            setGhostPosition: function (ghostPosition) {
                this.set("ghostPosition", ghostPosition);
            },

            getGhostAnimationPosition: function () {
                return this.get("ghostAnimationPosition");
            },

            //This will be called by binding created with marker.bindTo() method, instead of call to set("position").
            position_changed: function () {
                this._turnGhostModeOff();
                SlidingMarker.prototype.position_changed.apply(this, arguments);
            }

        });

        MarkerWithGhost.initializeGlobally = function () {
            google.maps.Marker = MarkerWithGhost;
        };

        return MarkerWithGhost;

    }));