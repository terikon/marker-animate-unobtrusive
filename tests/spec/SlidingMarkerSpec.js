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
                            if (animateCompleteDeferred) {
                                animateCompleteDeferred.resolve();
                            }
                        }
                    });
                };

            beforeEach(function () {

                marker = new SlidingMarker({
                    position: myLatlng,
                    anchorPoint: new google.maps.Point(12, 23),
                    map: map,
                    title: 'Hello World!',
                    duration: 300,
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

            describe("defining newPosition", function () {

                var startPosition,
                    newPosition = new google.maps.LatLng(51, 12),
                    positionEventSpy,
                    animationPositionEventSpy;

                beforeEach(function () {
                    startPosition = marker.getPosition();

                    positionEventSpy = testHelper.spyEvent(marker, "position_changed", marker.getPosition);
                    animationPositionEventSpy = testHelper.spyEvent(marker, "animationposition_changed", marker.getAnimationPosition);

                });

                describe("and calling setPosition(newPosition)", function () {

                    beforeEach(function (done) {
                        animateCompleteDeferred = new $.Deferred();
                        animateCompleteDeferred.then(done);

                        marker.setPosition(newPosition);
                    });

                    it("getPosition should return newPosition", function () {
                        expect(marker.getPosition()).toEqual(newPosition);
                    });

                    it("position should return newPosition", function () {
                        expect(marker.position).toEqual(newPosition);
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
                        expect(changes[changes.length - 1].value).toEqual(newPosition);
                    });

                    it("anchorPoint of marker and marker._instance should be the same", function () {
                        expect(marker.get("anchorPoint")).toEqual(marker._instance.get("anchorPoint"));
                    });

                    it("internalPosition of marker and marker._instance should be the same", function () {
                        expect(marker.get("internalPosition")).toEqual(marker._instance.get("internalPosition"));
                    });

                    afterEach(function (done) {
                        animateCompleteDeferred = new $.Deferred();
                        animateCompleteDeferred.then(function () {
                            animateCompleteDeferred = null;
                            done();
                        });

                        marker.setPosition(myLatlng);
                    });

                });

                describe("with null", function () {

                    beforeEach(function () {
                        marker.setPosition(null);
                    });

                    it("position_changed should be called once", function () {
                        expect(positionEventSpy.changes.length).toEqual(1);
                    });

                    it("position_changed call should be null", function () {
                        expect(positionEventSpy.changes[0].value).toBeNull();
                    });

                    it("animationposition_changed should be called once", function () {
                        expect(animationPositionEventSpy.changes.length).toEqual(1);
                    });

                    it("animationposition_changed last call should be null", function () {
                        expect(animationPositionEventSpy.changes[0].value).toBeNull();
                    });

                    afterEach(function (done) {
                        animateCompleteDeferred = new $.Deferred();
                        animateCompleteDeferred.then(function () {
                            animateCompleteDeferred = null;
                            done();
                        });

                        marker.setPosition(myLatlng);
                    });

                });

                afterEach(function () {
                    positionEventSpy.dispose();
                    animationPositionEventSpy.dispose();
                });

            });

            it("should have animationPosition initialized", function () {
                expect(marker.getAnimationPosition()).toEqual(myLatlng);
            });

            describe("with second marker", function () {

                var secondMarker;

                beforeEach(function () {

                    secondMarker = new SlidingMarker({
                        position: myLatlng,
                        map: map,
                        title: "Title of second marker",
                        duration: 300
                    });

                });

                describe("binding a property", function () {

                    beforeEach(function () {

                        marker.bindTo('title', secondMarker);

                    });

                    it("should have same value", function () {

                        expect(marker.get('title')).toEqual("Title of second marker");

                        //Accessing marker.title causes problem - the value will not update. Use getter!
                        expect(marker.get('title')).toEqual(secondMarker.get('title'));

                    });

                    describe("after change", function () {

                        beforeEach(function () {

                            secondMarker.set('title', "New title of second marker");

                        });

                        it("still should have same value", function () {

                            expect(marker.get('title')).toEqual("New title of second marker");

                            expect(marker.get('title')).toEqual(secondMarker.get('title'));

                        });

                    });

                    afterEach(function () {

                        marker.unbind("title");

                    });

                });

                afterEach(function () {
                    secondMarker.setMap(null);
                    secondMarker = null;
                });

            });

            afterEach(function () {
                marker.setMap(null);
                marker = null;
            });

        });

    });
});