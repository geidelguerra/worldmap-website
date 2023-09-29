const highligthedCountryDiv = document.querySelector('#highlighted-country');

let highlightedCountry = null;

/**
 * @param {SVGAElement} element 
 */
function setHighlightedCountry(element) {
  if (element !== highlightedCountry) {
    if (highlightedCountry !== null) {
      highlightedCountry.classList.remove('country-highlighted');
    }

    highlightedCountry = element;

    if (highlightedCountry) {
      highligthedCountryDiv.innerText = highlightedCountry.id;
      highlightedCountry.classList.add('country-highlighted');
    } else {
      highligthedCountryDiv.innerText = '';
    }
  }
}

/**
 * 
 * @param {string} value 
 * @returns {SVGAElement|null}
 */
function search(value) {
  value = value.toLowerCase();
  
  const elements = document.querySelectorAll('#Countries path');
  for (let element of document.querySelectorAll('#Countries path')) {
    if (element.id.toLowerCase().indexOf(value) !== -1) {
      return element;
    }
  }

  return null;
}

document.querySelector('#Countries').addEventListener('mousemove', function (e) {
  console.log(e.target.id);
  setHighlightedCountry(e.target);
});

document.querySelector('#search').addEventListener('input', function (e) {
  const country = search(e.target.value);
  if (country) {
    setHighlightedCountry(country);
  } else {
    
  }
});