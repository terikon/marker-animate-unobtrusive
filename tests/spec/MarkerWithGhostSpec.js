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
                            if (animateCompleteDeferred) {
                                animateCompleteDeferred.resolve();
                            }
                        }
                    });
                };

            beforeEach(function () {

                marker = new MarkerWithGhost({
                    position: myLatlng,
                    map: map,
                    title: 'Hello World!',
                    duration: 300,
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

            describe("with second marker", function () {

                var secondMarker, secondLatlng = new google.maps.LatLng(2, 2), thirdLatlng = new google.maps.LatLng(3, 3);

                beforeEach(function () {

                    secondMarker = new MarkerWithGhost({
                        position: secondLatlng,
                        map: map,
                        title: 'Title of second marker',
                        duration: 300
                    });

                });

                describe("binding position property", function () {

                    beforeEach(function () {

                        marker.bindTo('position', secondMarker);

                    });

                    it("positions should have same value", function () {

                        expect(marker.get('position')).toEqual(secondLatlng);

                        expect(marker.get('position')).toEqual(secondMarker.get('position'));

                    });

                    it("ghostPositions should be equal to position", function () {

                        expect(marker.get('ghostPosition')).toEqual(marker.get('position'));

                    });

                    describe("after change", function () {

                        beforeEach(function () {

                            secondMarker.set('position', thirdLatlng);

                        });

                        it("positionsstill should have same value", function () {

                            expect(marker.get('position')).toEqual(thirdLatlng);

                            expect(marker.get('position')).toEqual(secondMarker.get('position'));

                        });

                        it("ghostPositions still should be equal to position", function () {

                            expect(marker.get('ghostPosition')).toEqual(marker.get('position'));

                        });

                    });

                    afterEach(function () {

                        marker.unbind('position');

                    });

                });

                describe("binding ghostPosition property", function () {

                    beforeEach(function () {

                        marker.bindTo("ghostPosition", secondMarker);

                    });

                    it("ghostPositions should have same value", function () {

                        expect(marker.get('ghostPosition')).toEqual(secondLatlng);

                        expect(marker.get('ghostPosition')).toEqual(secondMarker.get('ghostPosition'));

                    });

                    it("should have no influence on position property", function () {

                        expect(marker.get('position')).toEqual(myLatlng);

                        expect(secondMarker.get('position')).toEqual(secondLatlng);

                    });

                    describe("after change", function () {

                        beforeEach(function () {

                            secondMarker.set('ghostPosition', thirdLatlng);

                        });

                        it("ghostPositions still should have same value", function () {

                            expect(marker.get('ghostPosition')).toEqual(thirdLatlng);

                            expect(marker.get('ghostPosition')).toEqual(secondMarker.get('ghostPosition'));

                        });

                        it("still should have no influence on position property", function () {

                            expect(marker.get('position')).toEqual(myLatlng);

                            expect(secondMarker.get('position')).toEqual(secondLatlng);

                        });

                    });

                    afterEach(function () {

                        marker.unbind('ghostPosition');

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