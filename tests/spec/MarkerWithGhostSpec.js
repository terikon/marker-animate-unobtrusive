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

    
});