const LIBRARY = 'google-maps-react';
const LINK_LIBRARY = 'https://www.npmjs.com/package/google-maps-react';

// ====================== MAP STYLE =================
const LINK_MAP_STYLE = 'https://mapstyle.withgoogle.com/';

// ====================== HANDLE ZOOM =================
const ZOOM_EXAMPLE = 'http://jsfiddle.net/tLk4gfbp/8/';

// Data
const DATA = [
  { lat: 0, lng: 0 },
  { lat: 0, lng: 0 },
  { lat: 0, lng: 0 },
]

// Map dimension
const MAP_DIMENSION = {
  height: 652,
  width: 336,
};

function getBoundsZoomLevel(bounds) {
  const WORLD_DIM = { height: MAP_DIMENSION.height, width: MAP_DIMENSION.width };
  const ZOOM_MAX = 21;

  function latRad(lat) {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

  const lngDiff = ne.lng() - sw.lng();
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoom(MAP_DIMENSION.height, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(MAP_DIMENSION.width, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

const createPointForMarkers = (points, google) =>
  points.map(
    (point) =>
      new google.maps.Marker({
        position: new google.maps.LatLng(point.lat, point.lng),
      }),
  );

const createBoundsForMarkers = (markers, google) => {
  const bounds = new google.maps.LatLngBounds();

  markers.forEach((marker) => {
    bounds.extend(marker.getPosition());
  });

  return bounds;
};

const points = DATA.map((item) => ({ lat: item.latitude, lng: item.longitude }));
const markers = createPointForMarkers(points, google);
const bounds = points.length > 0 ? createBoundsForMarkers(markers, google) : null;
const zoom = bounds ? getBoundsZoomLevel(bounds) : 0;

// RESUME: =>
// DATA have type: [{ lat: Number, lng: Number }],
const getZoomMapLevel = (data, google, mapDim) => {
  const createPointForMarkers = (points) =>
    points.map(
      (point) =>
        new google.maps.Marker({
          position: new google.maps.LatLng(point.lat, point.lng),
        }),
    );

  const createBoundsForMarkers = (markers) => {
    const bounds = new google.maps.LatLngBounds();

    markers.forEach((marker) => {
      bounds.extend(marker.getPosition());
    });

    return bounds;
  };

  const getBoundsZoomLevel = (bounds) => {
    const WORLD_DIM = { height: mapDim.height, width: mapDim.width };
    const ZOOM_MAX = 21;

    function latRad(lat) {
      const sin = Math.sin((lat * Math.PI) / 180);
      const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
      return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
    }

    function zoom(mapPx, worldPx, fraction) {
      return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
    }

    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();

    const latFraction = (latRad(ne.lat()) - latRad(sw.lat())) / Math.PI;

    const lngDiff = ne.lng() - sw.lng();
    const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

    const latZoom = zoom(mapDim.height, WORLD_DIM.height, latFraction);
    const lngZoom = zoom(mapDim.width, WORLD_DIM.width, lngFraction);

    return Math.min(latZoom, lngZoom, ZOOM_MAX);
  };

  const markers = createPointForMarkers(data);
  const bounds = data.length > 0 ? createBoundsForMarkers(markers) : null;
  const zoom = bounds ? getBoundsZoomLevel(bounds) : 0;

  return zoom;
};

// ====================== HANDLE CREATE MARKER =================
const MapMarkers = DATA
  .map((plant) => ({
    latitude: plant.latitude,
    longitude: plant.longitude,
  }))
  .map((store, idx) => (
    <Marker
      key={`${new Date().toLocaleString() + idx}`}
      position={{
        lat: store.latitude,
        lng: store.longitude,
      }}
      icon={{
        url: MarkerIcon, // Custom icon
        scaledSize: new google.maps.Size(36, 36), // Icon size
        anchor: new google.maps.Point(18, 18), // Point
      }}
    />
  ));

// ====================== MAP OPTION =================
const mapLoaded = (_, map) => {
  let lat = 0;
  let lng = 0;
  const dataLength = DATA.length;

  DATA.forEach((plant) => {
    lat += plant?.latitude ?? 0;
    lng += plant?.longitude ?? 0;
  });

  const latAverage = lat / dataLength;
  const lngAverage = lng / dataLength;

  // Get center of points
  const center = condition
    ? { lat: 15.657934, lng: 105.8660125 }
    : { lat: latAverage, lng: lngAverage };

  map.setOptions({
    styles: isDarkMode ? DARK_MODE_MAP : LIGHT_MODE_MAP,
    draggable: false,
    gestureHandling: 'none',
    keyboardShortcuts: false,
    center,
    style: { backgroundColor: 'transparent' },
  });
};
