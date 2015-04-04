describe("MarkerWithGhost", function () {

    describe("google.maps.Marker", function () {

        describe("before calling initializeGlobally()", function () {

            it("should differ from MarkerWithGhost", function () {
                expect(google.maps.Marker).not.toBe(MarkerWithGhost);
            });

        });

        describe("after calling initializeGlobally()", function () {

            var originalMarker;
            beforeEach(function () {
                originalMarker = google.maps.Marker;

                MarkerWithGhost.initializeGlobally();
            });

            it("should be replaced with MarkerWithGhost", function () {
                expect(google.maps.Marker).toBe(MarkerWithGhost);
            });

            afterEach(function () {
                google.maps.Marker = originalMarker;
            });

        });

    });

    describe("MarkerWithGhost", function () {

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

                marker = new MarkerWithGhost({
                    position: myLatlng,
                    map: map,
                    title: 'Hello World!',
                    duration: 500,
                    animateFunctionAdapter: testAnimateFunctionAdapter
                });

            });

            it("should have position initialized", function () {
                expect(marker.getPosition()).toEqual(myLatlng);
            });

            it("should have ghostPosition initialized", function () {
                expect(marker.getGhostPosition()).toEqual(myLatlng);
            });

            it("should have animationPosition initialized", function () {
                expect(marker.getAnimationPosition()).toEqual(myLatlng);
            });

            it("should have ghostAnimationPosition initialized", function () {
                expect(marker.getGhostAnimationPosition()).toEqual(myLatlng);
            });

            describe("calling position method", function () {

                var startPosition,
                    newPosition = new google.maps.LatLng(51, 12),
                    positionEventSpy,
                    ghostPositionEventSpy,
                    animationPositionEventSpy,
                    ghostAnimationPositionEventSpy;

                beforeEach(function () {
                    startPosition = marker.getPosition();

                    positionEventSpy = testHelper.spyEvent(marker, "position_changed", marker.getPosition);
                    ghostPositionEventSpy = testHelper.spyEvent(marker, "ghostposition_changed", marker.getGhostPosition);
                    animationPositionEventSpy = testHelper.spyEvent(marker, "animationposition_changed", marker.getAnimationPosition);
                    ghostAnimationPositionEventSpy = testHelper.spyEvent(marker, "ghostanimationposition_changed", marker.getGhostAnimationPosition);
                });

                describe("setGhostPosition", function () {

                    beforeEach(function (done) {
                        animateCompleteDeferred = new $.Deferred();
                        animateCompleteDeferred.then(done);

                        marker.setGhostPosition(newPosition);
                    });

                    it("position_changed should not be called", function () {
                        expect(positionEventSpy.changes.length).toEqual(0);
                    });

                    it("ghostposition_changed should be called once", function () {
                        expect(ghostPositionEventSpy.changes.length).toEqual(1);
                    });

                    it("ghostposition_changed call should be new position", function () {
                        expect(ghostPositionEventSpy.changes[0].value).toEqual(newPosition);
                    });

                    it("animationposition_changed should not be called", function () {
                        expect(animationPositionEventSpy.changes.length).toEqual(0);
                    });

                    it("ghostanimationposition_changed should be called multiple times", function () {
                        expect(ghostAnimationPositionEventSpy.changes.length).toBeGreaterThan(1);
                    });

                    it("ghostanimationposition_changed last call should be new position", function () {
                        var changes = ghostAnimationPositionEventSpy.changes;
                        expect(changes[changes.length - 1].value).toEqual(newPosition);
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

                describe("setPosition", function () {

                    beforeEach(function (done) {
                        animateCompleteDeferred = new $.Deferred();
                        animateCompleteDeferred.then(done);

                        marker.setPosition(newPosition);
                    });

                    it("ghostposition_changed should be called once", function () {
                        expect(ghostPositionEventSpy.changes.length).toEqual(1);
                    });

                    it("ghostposition_changed call should be new position", function () {
                        expect(ghostPositionEventSpy.changes[0].value).toEqual(newPosition);
                    });

                    it("ghostanimationposition_changed should be called multiple times", function () {
                        expect(ghostAnimationPositionEventSpy.changes.length).toBeGreaterThan(1);
                    });

                    it("ghostanimationposition_changed last call should be new position", function () {
                        var changes = ghostAnimationPositionEventSpy.changes;
                        expect(changes[changes.length - 1].value).toEqual(newPosition);
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
                    ghostPositionEventSpy.dispose();
                    animationPositionEventSpy.dispose();
                    ghostAnimationPositionEventSpy.dispose();
                });

            });

            afterEach(function () {
                marker.setMap(null);
                marker = null;
            });

        });


    });


});