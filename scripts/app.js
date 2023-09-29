const highligthedCountryTextElement = document.querySelector('#highlighted-country');

let highlightedCountryElement = null;
let selectedCountryElement = null;

/**
 * @param {SVGAElement} element 
 */
function setHighlightedCountry(element) {
  if (element !== highlightedCountryElement) {
    if (highlightedCountryElement !== null) {
      highlightedCountryElement.classList.remove('country-highlighted');
    }

    highlightedCountryElement = element;

    if (highlightedCountryElement) {
      highlightedCountryElement.classList.add('country-highlighted');
    }

    updateSelectedCountryTextElement();
  }
}

/**
 * @param {SVGAElement} element 
 */
function setSelectedCountry(element) {
  if (element !== selectedCountryElement) {
    if (selectedCountryElement !== null) {
      selectedCountryElement.classList.remove('country-selected');
    }

    selectedCountryElement = element;

    if (selectedCountryElement) {
      selectedCountryElement.classList.add('country-selected');
    }

    updateSelectedCountryTextElement();
  }
}

function updateSelectedCountryTextElement() {
  if (selectedCountryElement && highlightedCountryElement) {
    highligthedCountryTextElement.innerText = `[${selectedCountryElement.id}] ${highlightedCountryElement.id}`;
    return;
  }
  
  if (selectedCountryElement) {
    highligthedCountryTextElement.innerText = selectedCountryElement.id;
    return;
  } 
  
  if (highlightedCountryElement) {
    highligthedCountryTextElement.innerText = highlightedCountryElement.id;
    return;
  }

  highligthedCountryTextElement.innerText = '';
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
  setHighlightedCountry(e.target);
});

document.querySelector('#Countries').addEventListener('mouseup', function (e) {
  console.log('Clicked:', e.target.id);
  setSelectedCountry(e.target);
});

document.querySelector('#search').addEventListener('input', function (e) {
  const country = search(e.target.value);
  setHighlightedCountry(country);
});