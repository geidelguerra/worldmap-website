(async () => {
  class Storage {
    constructor(prefix) {
      this.prefix = prefix || '';
    }

    /**
     * @param {String} key 
     * @param {any} value 
     */
    put(key, value) {
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }

      window.localStorage.setItem(this.prefix + key, value);
    }

    /**
     * @param {String} key 
     * @returns {null|any}
     */
    pop(key) {
      const value = this.get(key);
      window.localStorage.removeItem(this.prefix + key);
      return value;
    }

    /**
     * @param {String} key 
     * @returns {null|any}
     */
    get(key, defaultValue = null) {
      return JSON.parse(window.localStorage.getItem(this.prefix + key)) || defaultValue;
    }

    clear() {
      window.localStorage.clear();
    }
  }

  class Database {
    constructor(name) {
      this.name = name;
      this.db = null;
    }

    async open() {
      return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(this.name);
        request.onsuccess = (e) => {
          console.log('Connected');
          this.db = e.target.result;
          resolve(e);
        };

        request.onerror = (e) => {
          console.error('Fail to connect to db:', e);
          reject(e);
        };

        request.onupgradeneeded = (e) => {
          const db = e.target.result;

          db.onerror = (e) => {
            console.log('Fail to init db:', e);
            reject(e);
          };

          db.createObjectStore('searchResults', { keyPath: 'query' });
        }
      });
    }

    async insertOne(storeName, data) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        transaction.onsuccess = resolve;
        transaction.onerror = reject;
        const store = transaction.objectStore(storeName);
        const request = store.add(data);
        request.onsuccess = resolve;
      });
    }

    async findOne(storeName, key) {
      return new Promise((resolve, reject) => {
        const transaction = this.db.transaction(storeName, 'readwrite');
        transaction.onerror = reject;
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        request.onsuccess = (e) => resolve(e.target.result);
      });
    }
  }

  const state = {
    showSearchModal: false,
  };

  const settings = new Storage('settings_');
  const database = new Database('worldmap');
  await database.open();

  /** @type {HTMLElement} */
  const sidebarContainer = document.querySelector('#sidebar');
  // const searchBoxDialog = document.querySelector('#search-box');
  const searchForm = document.querySelector('#search-form');
  const searchInput = document.querySelector('#search-input');
  const searchResultsContainer = document.querySelector('#search-results');

  const map = L.map('map', {
    trackResize: true,
    center: settings.get('map_center', [21.3, -80]),
    zoom: settings.get('map_zoom', 5),
    zoomSnap: 0,
  });

  map.addEventListener('zoom', onMapZoom);
  map.addEventListener('move', onMapMove);

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);

  function setShowModal(value) {
    state.showSearchModal = value;

    if (value) {
      // searchBoxDialog.showModal();
      sidebarContainer.style.visibility = 'visible';
    } else {
      sidebarContainer.style.visibility = 'hidden';
      // searchBoxDialog.close();
    }
  }

  /**
   * 
   * @param {String} query 
   * @returns {Object}
   */
  async function search(query) {
    query = query.toLocaleLowerCase();
    let results = (await database.findOne('searchResults', query))?.results;
    
    if (!results) {
      results = await fetch(`https://nominatim.openstreetmap.org/search.php?q=${query}&polygon_geojson=1&format=json`).then((response) => response.json());
      await database.insertOne('searchResults', { query, results });
    }

    console.log(query, results);

    return results;
  }

  /**
   * @param {InputEvent} e
   */
  function onSearchInput(e) {
    // console.log(e);
  }

  function setSelectedSearchResult(result) {
    console.log(result);

    const data = {
      type: 'Feature',
      geometry: result.geojson,
    };

    L.geoJSON(data, {
      style: {
        fillColor: '#ff0000',
        fill: true
      }
    }).addTo(map);

    map.panTo([result.lat, result.lon]);
  }

  /**
   * @param {SubmitEvent} e 
   */
  async function onSearchFormSubmit(e) {
    e.preventDefault();
    
    searchResultsContainer.innerHTML = '';

    const results = await search(searchInput.value.trim());
    
    results.forEach((result) => {
      const button = document.createElement('button');
      button.classList.add('result-button');
      button.onclick = () => setSelectedSearchResult(result);
      button.innerHTML = `<span>${result.addresstype}</span><span>${result.display_name}</span>`;

      searchResultsContainer.insertAdjacentElement('beforeend', button);
    });
  }

  /**
   * @param {KeyboardEvent} e
   */
  function onKeyPress(e) {
    if (e.ctrlKey && e.key === '/') {
      setShowModal(!state.showSearchModal);
    }
  }

  function onMapZoom(e) {
    console.log('Zoom:', map.getZoom());
    settings.put('map_zoom', map.getZoom());
  }

  function onMapMove(e) {
    console.log('Coordinates:', map.getCenter());
    settings.put('map_center', [map.getCenter().lat, map.getCenter().lng]);
  }

  document.addEventListener('keyup', onKeyPress);
  searchForm.addEventListener('submit', onSearchFormSubmit);
  searchInput.addEventListener('input', onSearchInput);
})();