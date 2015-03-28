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

                var mapChangedListener, map_changes = [];

                beforeEach(function () {
                    mapChangedListener = google.maps.event.addListener(marker, "map_changed", function () {
                        map_changes.push({ value: marker.getMap() });
                    });

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
                        expect(map_changes.length).toEqual(1);
                    });
                    it("should contain correct map value while in handler", function () {
                        expect(map_changes[0].value).toBe(map);
                    });

                });

                afterEach(function () {
                    google.maps.event.removeListener(mapChangedListener);
                    map_changes = [];
                    marker.setMap(null);
                });

            });

            afterEach(function () {
                marker = null;
            });

        });


        describe("marker created", function () {

            beforeEach(function () {
                marker = new SlidingMarker({
                    position: myLatlng,
                    map: map,
                    title: 'Hello World!'
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

            afterEach(function () {
                marker.setMap(null);
                marker = null;
            });

        });

    });
});