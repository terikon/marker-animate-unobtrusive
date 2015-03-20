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
            this.animationGhostPosition = null;

            // Call the parent constructor.
            SlidingMarker.call(this, opt_options);

            this.bindTo("ghostAnimationPosition", this._instance, "position");
        };

        inherits(MarkerWithGhost, SlidingMarker);

        //Overrides
        $.extend(MarkerWithGhost.prototype, {

            _isGhost: false,

            setPosition: function (position) {

                if (this._isGhost) {
                    this.bindTo("animationPosition", this._instance, "position");
                }

                this._isGhost = false;

                this.originalSet("ghostPosition", position);

                SlidingMarker.prototype.setPosition.call(this, position);
            },

            getGhostPosition: function () {
                return this.get("ghostPosition");
            },

            setGhostPosition: function (ghostPosition) {

                if (!this._isGhost) {
                    this.unbind("animationPosition");
                }

                this._isGhost = true;

                this.set("ghostPosition", ghostPosition);
                SlidingMarker.prototype._setInstancePositionAnimated.call(this, ghostPosition);
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