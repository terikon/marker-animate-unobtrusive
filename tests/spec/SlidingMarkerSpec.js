describe("SlidingMarker", function () {

    describe("google.maps.Marker", function () {

        describe("before calling initializeGlobally()", function () {

            it("should differ from SlidingMarker", function () {
                expect(google.maps.Marker).not.toBe(SlidingMarker);
            });

        });

        describe("after calling initializeGlobally()", function () {

            var originalMarker;
            beforeEach(function () {
                originalMarker = google.maps.Marker;

                SlidingMarker.initializeGlobally();
            });

            it("should be replaced with SlidingMarker", function () {
                expect(google.maps.Marker).toBe(SlidingMarker);
            });

            afterEach(function () {
                google.maps.Marker = originalMarker;
            });

        });

    });

    describe("SlidingMarker", function () {

        var map, marker, myLatlng = new google.maps.LatLng(53.871963457471786, 10.689697265625);

        beforeAll(function () {
            //Create map
            
            var mapOptions = {
                zoom: 4,
                center: myLatlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            var canvas = $("<canvas/>");
            map = new google.maps.Map(canvas[0], mapOptions);
        });

        describe("when marker created with map option", function () {

            beforeEach(function () {
                marker = new SlidingMarker({
                    position: myLatlng,
                    map: map,
                    title: 'Hello World!'
                });
            });

            describe("getMap()", function () {
                var result;
                beforeEach(function () {
                    result = marker.getMap();
                });
                it("should return map", function () {
                    expect(result).toBe(map);
                });
            });

            describe("field map", function () {
                var result;
                beforeEach(function () {
                    result = marker.map;
                });
                it("should be equal to map", function () {
                    expect(result).toBe(map);
                });
            });

            describe("_instance.getMap()", function () {
                var result;
                beforeEach(function () {
                    result = marker._instance.getMap();
                });
                it("should return map", function () {
                    expect(result).toBe(map);
                });
            });

            afterEach(function () {
                marker.setMap(null);
                marker = null;
            });

        });


        describe("when marker created without map", function () {

            beforeEach(function () {
                marker = new SlidingMarker({
                    position: myLatlng,
                    title: 'Hello World!'
                });
            });

            describe("getMap()", function () {
                var result;
                beforeEach(function () {
                    result = marker.getMap();
                });
                it("should return empty", function () {
                    expect(result).toBeUndefined();
                });
            });

            describe("_instance.getMap()", function () {
                var result;
                beforeEach(function () {
                    result = marker._instance.getMap();
                });
                it("should return empty", function () {
                    expect(result).toBeUndefined();
                });
            });

            describe("after calling setMap()", function () {

                var mapEventSpy;

                beforeEach(function () {
                    mapEventSpy = testHelper.spyEvent(marker, "map_changed", marker.getMap);

                    marker.setMap(map);
                });

                describe("getMap()", function () {
                    var result;
                    beforeEach(function () {
                        result = marker.getMap();
                    });
                    it("should return map", function () {
                        expect(result).toBe(map);
                    });
                });

                describe("field map", function () {
                    var result;
                    beforeEach(function () {
                        result = marker.map;
                    });
                    it("should be equal to map", function () {
                        expect(result).toBe(map);
                    });
                });

                describe("_instance.getMap()", function () {
                    var result;
                    beforeEach(function () {
                        result = marker._instance.getMap();
                    });
                    it("should return map", function () {
                        expect(result).toBe(map);
                    });
                });

                describe("map_changed", function () {

                    it("should be triggered once", function () {
                        expect(mapEventSpy.changes.length).toEqual(1);
                    });
                    it("should contain correct map value while in handler", function () {
                        expect(mapEventSpy.changes[0].value).toBe(map);
                    });

                });

                afterEach(function () {
                    mapEventSpy.dispose();
                    marker.setMap(null);
                });

            });

            afterEach(function () {
                marker = null;
            });

        });

        describe("marker", function () {

            var animateCompleteDeferred,
                testAnimateFunctionAdapter = function (m, destPosition, easing, duration) {
                    google.maps.Marker.prototype.animateTo.call(m, destPosition, {
                        easing: easing,
                        duration: duration,
                        complete: function () {
                            animateCompleteDeferred.resolve();
                        }
                    });
                };

            beforeEach(function () {

                marker = new SlidingMarker({
                    position: myLatlng,
                    map: map,
                    title: 'Hello World!',
                    duration: 500,
                    animateFunctionAdapter: testAnimateFunctionAdapter
                });

            });

            describe("click event on _instance", function () {

                var handler, listener;

                beforeEach(function () {

                    handler = jasmine.createSpy();
                    listener = google.maps.event.addListener(marker, "click", handler);

                    google.maps.event.trigger(marker._instance, "click", { eventSource: 333 });

                });

                it("should propagate to marker itself", function () {
                    expect(handler).toHaveBeenCalled();
                    expect(handler.calls.mostRecent().args[0]).toEqual({ eventSource: 333 });
                });

                afterEach(function () {
                    google.maps.event.removeListener(listener);
                });

            });

            describe("modifying a property", function () {

                beforeEach(function () {
                    marker.setZIndex(12321);
                });

                it("should cause modification of _instance.property", function () {

                    expect(marker._instance.getZIndex()).toEqual(12321);

                });

            });

            describe("calling setPosition", function () {

                var startPosition,
                    newPosition = new google.maps.LatLng(51, 12),
                    positionEventSpy,
                    animationPositionEventSpy;

                beforeEach(function (done) {
                    startPosition = marker.getPosition();

                    positionEventSpy = testHelper.spyEvent(marker, "position_changed", marker.getPosition);
                    animationPositionEventSpy = testHelper.spyEvent(marker, "animationposition_changed", marker.getAnimationPosition);

                    animateCompleteDeferred = new $.Deferred();
                    animateCompleteDeferred.then(done);

                    marker.setPosition(newPosition);
                });

                it("position_changed should be called once", function () {
                    expect(positionEventSpy.changes.length).toEqual(1);
                });

                it("position_changed call should be new position", function () {
                    expect(positionEventSpy.changes[0].value).toEqual(newPosition);
                });

                it("animationposition_changed should be called multiple times", function () {
                    expect(animationPositionEventSpy.changes.length).toBeGreaterThan(1);
                });

                it("animationposition_changed last call should be new position", function () {
                    var changes = animationPositionEventSpy.changes;
                    expect(changes[changes.length-1].value).toEqual(newPosition);
                });

                afterEach(function (done) {
                    positionEventSpy.dispose();
                    animationPositionEventSpy.dispose();

                    animateCompleteDeferred = new $.Deferred();
                    animateCompleteDeferred.then(function () {
                        animateCompleteDeferred = null;
                        done();
                    });

                    marker.setPosition(myLatlng);
                });

            });

            it("should have animationPosition initialized", function () {
                expect(marker.getAnimationPosition()).toEqual(myLatlng);
            });

            afterEach(function () {
                marker.setMap(null);
                marker = null;
            });

        });

    });
});