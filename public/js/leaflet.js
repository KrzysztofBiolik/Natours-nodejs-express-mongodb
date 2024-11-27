export const displayMap = (locationsData) => {
  const [longStart, latStart] = locationsData[0].coordinates;

  const map = L.map('map', {
    zoomControl: false,
    scrollWheelZoom: false,
  }).setView([latStart, longStart], 8);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  }).addTo(map);

  locationsData.forEach((location) => {
    const [long, lat] = location.coordinates;

    const marker = L.marker([lat, long]).addTo(map);

    marker
      .bindPopup(
        `<h1>Arrive on Day ${location.day}</h1><br><h1>Location: ${location.description}.</h1>`,
        {
          autoClose: false,
        },
      )
      .openPopup();
  });
};
