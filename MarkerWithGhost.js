/* global define,module,require,google */

(function (root, factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'SlidingMarker'], factory.bind(null, root));
    } else if (typeof module !== "undefined" && module !== null && module.exports != null) { // jshint ignore:line
        // Node module.
        module.exports.MarkerWithGhost = factory(root, require('jquery'), require('SlidingMarker'));
    } else {
        // Browser globals
        root.MarkerWithGhost = factory(root, root.jQuery, root.SlidingMarker);
    }
}(this,
    function (root, $, SlidingMarker) {
        'use strict';

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

                    if (this._isGhost) {

                        this.bindTo("animationPosition", this._instance, "position");
                        this.bindTo("ghostPosition", this, "position");

                        this._isGhost = false;
                    }

                } else if (key === "ghostPosition") {

                    if (!this._isGhost) {

                        this.unbind("animationPosition");
                        this.unbind("ghostPosition");

                        this._isGhost = true;
                    }

                    this.originalSet("ghostPosition", value);

                    SlidingMarker.prototype._setInstancePositionAnimated.call(this, value);

                    return;

                }

                SlidingMarker.prototype.set.apply(this, arguments);
            },

            getGhostPosition: function () {
                return this.get("ghostPosition");
            },

            setGhostPosition: function (ghostPosition) {
                this.set("ghostPosition", ghostPosition);
            },

            getGhostAnimationPosition: function () {
                return this.get("ghostAnimationPosition");
            }

        });

        MarkerWithGhost.initializeGlobally = function () {
            google.maps.Marker = MarkerWithGhost;
        };

        return MarkerWithGhost;

    }));