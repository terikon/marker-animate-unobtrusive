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



    });


});