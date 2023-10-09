(() => {
  const state = {
    showSearchModal: false,
  };

  const searchBoxDialog = document.querySelector('#search-box');
  const searchForm = document.querySelector('#search-form');
  const searchInput = document.querySelector('#search-input');

  const map = L.map('map', {
    trackResize: true,
    center: [21.3, -80],
    zoom: 5,
    zoomSnap: 0,
  });

  map.addEventListener('zoom', (e) => console.log('Zoom:', map.getZoom()));
  map.addEventListener('move', (e) => console.log('Coordinates:', map.getCenter()));

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  function setShowModal(value) {
    state.showSearchModal = value;

    if (value) {
      searchBoxDialog.showModal();
    } else {
      searchBoxDialog.close();
    }
  }

  function search(q) {
    fetch(`https://nominatim.openstreetmap.org/search.php?q=${q}&polygon_geojson=1&format=json`)
      .then((response) => response.json())
      .then((results) => {
        if (results.length === 0) {
          return;
        }

        const data = {
          type: 'Feature',
          geometry: results[0].geojson,
        };

        L.geoJSON(data, {
          style: {
            fillColor: '#ff0000',
            fill: true
          }
        }).addTo(map);
      });
  }

  /**
   * @param {InputEvent} e
   */
  function onSearchInput(e) {
    console.log(e);
  }

  /**
   * @param {SubmitEvent} e 
   */
  function onSearchFormSubmit(e) {
    e.preventDefault();
    search(searchInput.value.trim());
    setShowModal(false);
  }

  /**
   * @param {KeyboardEvent} e
   */
  function onKeyPress(e) {
    if (e.ctrlKey && e.key === '/') {
      setShowModal(!state.showSearchModal);
    }
  }

  document.addEventListener('keyup', onKeyPress);
  searchForm.addEventListener('submit', onSearchFormSubmit);
  searchInput.addEventListener('input', onSearchInput);
})();