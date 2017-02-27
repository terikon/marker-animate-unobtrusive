export class MarkerMoveSlidingApp {

  marker: SlidingMarker;
  map: google.maps.Map;

  constructor() {

    this.initialize();
    this.run();

  }

  initialize() {

    var myLatlng = new google.maps.LatLng(32.520204, 34.937258);
    var mapOptions: google.maps.MapOptions = {
      zoom: 4,
      center: myLatlng,
      mapTypeId: google.maps.MapTypeId.ROADMAP,
    }
    this.map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

    this.marker = new SlidingMarker({
      position: myLatlng,
      map: this.map,
      title: 'I\m sliding marker'
    });

    var $log = $("#log");

    $log.html(
      "<b>left click</b> to call setPosition<br/>" +
      "<b>right click</b> to call setPositionNotAnimated<br/>");

    google.maps.event.addListener(this.marker, 'position_changed', function () {
      $log.html($log.html() + "marker.position_changed<br/>");
    });

  }

  run() {

    const marker = this.marker;
    const map = this.map;

    var clickHandler = function (event, clickType) {
      var duration = parseInt($('#durationOption').val());

      if (duration < 0) {
        duration = 1;
        $('#durationOption').val(duration);
      }

      marker.setDuration(duration);
      marker.setEasing($('#easingOption').val());

      if (clickType === "left") {
        marker.setPosition(event.latLng);
      } else {
        marker.setPositionNotAnimated(event.latLng);
      }
    };

    var leftClickHandler = function (event) { clickHandler(event, "left") };
    var rightClickHandler = function (event) { clickHandler(event, "right") };

    google.maps.event.addListener(map, 'click', leftClickHandler);
    google.maps.event.addListener(map, 'rightclick', rightClickHandler);

    var printEvent = function (instance, eventName) {
      google.maps.event.addListener(instance, eventName, function () {
        console.log("Event: " + eventName);
      });
    };

    printEvent(marker, "click");
    printEvent(marker, "map_changed");
    printEvent(marker, "position_changed");
    printEvent(marker, "animationposition_changed");

    if (window.location.hash == "#iframe") {
      $('#backLink').hide();
      $('#controls').css('height', '55px');
    }

  }


}
