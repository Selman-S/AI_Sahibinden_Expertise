(() => {


// Constants
let BACKEND_BASE_URL;
const ortam = "prod";

if (ortam == "dev") {
  BACKEND_BASE_URL = "http://localhost:5000/api";
} else if (ortam == "prod") {
  BACKEND_BASE_URL = "https://sahibinden-backend-production.up.railway.app/api";
}

const STYLE_ID = 'customStyles';
const NOTIFICATION_DURATION = 3000;
const URL_CHECK_INTERVAL = 1000;

// Initialize the script
init();

function init() {
  injectStyles(); // Stil dosyalarını her sayfada yükle
  monitorUrlChanges();
  processCurrentPage();
}

// Monitor URL changes to handle SPA navigation
function monitorUrlChanges() {
  let lastUrl = location.href;
  setInterval(() => {
    const currentUrl = location.href;
    if (currentUrl !== lastUrl) {
      lastUrl = currentUrl;
      processCurrentPage();
    }
  }, URL_CHECK_INTERVAL);
}

// Determine which page we're on and act accordingly
function processCurrentPage() {
  if (isListingPage()) {
    processListingPage();
  }
}

// Check if the current page is a listing page
function isListingPage() {
  return document.querySelector("#searchResultsTable") && (window.location.pathname.startsWith('/otomobil') || window.location.pathname.startsWith('/arazi-suv')) && document.querySelector("#searchResultsTable thead tr").innerText.includes('Marka') && document.querySelector("#searchResultsTable thead tr").innerText.includes('Seri') && document.querySelector("#searchResultsTable thead tr").innerText.includes('Model');
}

// Inject styles into the page
function injectStyles() {
  if (document.getElementById(STYLE_ID)) return;

  const styles = `
    /* Stil kodları buraya gelecek (carlisting.js için gerekli olanlar) */
    .notification {
      position: fixed;
      top: 20px;
      right: 20px;
      color: #fff;
      padding: 15px;
      z-index: 9999;
      border-radius: 4px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      max-width:300px;
    }
    .notification-success {
      background-color: #4caf50;
    }
    .notification-error {
      background-color: #f44336;
    }
    .notification-info {
      background-color: #2196f3;
    }
    .tooltip {
      position: absolute;
      background-color: #fff;
      color: #333;
      padding: 8px 12px;
      border-radius: 4px;
      z-index: 1000;
      font-size: 12px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
      border: 1px solid #ccc;
      max-width: 200px;
    }
    .tooltip-item {
      display: flex;
      align-items: center;
      margin-bottom: 4px;
    }
    .tooltip-item:last-child {
      margin-bottom: 0;
    }
    .tooltip-date {
      flex: 1;
    }
    .tooltip-price {
      flex: 1;
      text-align: right;
      margin-left: 8px;
    }
    .price-up {
      color: red;
    }
    .price-down {
      color: green;
    }
  `;
  const styleElement = document.createElement('style');
  styleElement.id = STYLE_ID;
  styleElement.textContent = styles;
  document.head.appendChild(styleElement);
}

// Process the listing page
async function processListingPage() {
  try {
    const table = document.querySelector("#searchResultsTable");
    if (!table) return;

    const rows = table.querySelectorAll("tbody tr");
    if (rows.length === 0) return;

    for (const row of rows) {
      const car = extractCarListingData(row);
      if (car) {
        const result = await saveCarData(car);
        if (result && result.carData) {
          processPriceHistory(result.carData, row);
        }
      }
    }
  } catch (error) {
    console.error("processListingPage error:", error);
  }
}

// Extract car data from a listing row
function extractCarListingData(row) {
  try {
    const adId = row.getAttribute('data-id');
    if (!adId) return null;

    const index = getTableColumnIndices();
    const dataCells = row.querySelectorAll('td');

    const car = {
      adId: parseInt(adId),
      imageUrl: dataCells[index.imageUrl]?.querySelector('img')?.src || '',
      brand:
        index.brand !== null
          ? dataCells[index.brand]?.innerText.trim()
          : document.querySelector('#search_cats ul .cl2')?.innerText.trim() || '',
      series:
        index.series !== null
          ? dataCells[index.series]?.innerText.trim()
          : document.querySelector('#search_cats ul .cl3')?.innerText.trim() || '',
      model:
        index.model !== null
          ? dataCells[index.model]?.innerText.trim()
          : document.querySelector('#search_cats ul .cl4')?.innerText.trim() || '',
      title: row.querySelector('.classifiedTitle')?.innerText.trim() || '',
      year: parseInt(dataCells[index.year]?.innerText.trim()) || null,
      km: parseInt(dataCells[index.km]?.innerText.replace(/\D/g, '')) || null,
      price: parseInt(dataCells[index.price]?.innerText.replace(/\D/g, '')) || null,
      adDate: dataCells[index.adDate]?.innerText.trim().replace('\n', ' ') || '',
      adUrl:
        'https://www.sahibinden.com' +
          row.querySelector('.classifiedTitle')?.getAttribute('href') || '',
    };

    // Extract location data
    const { city, ilce, semt, mahalle } = extractLocationData(dataCells, index.location);
    Object.assign(car, { city, ilce, semt, mahalle });

    return car;
  } catch (error) {
    console.error('extractCarListingData error:', error);
    return null;
  }
}

// Get column indices based on table headers
function getTableColumnIndices() {
  const index = {
    imageUrl: 0,
    brand: null,
    series: null,
    model: null,
    title: null,
    year: null,
    km: null,
    price: null,
    adDate: null,
    location: null,
  };

  const headers = document.querySelectorAll('#searchResultsTable thead tr td');
  headers.forEach((el) => {
    const headerText = el.innerText.trim();
    switch (headerText) {
      case 'Marka':
        index.brand = el.cellIndex;
        break;
      case 'Seri':
        index.series = el.cellIndex;
        break;
      case 'Model':
        index.model = el.cellIndex;
        break;
      case 'İlan Başlığı':
        index.title = el.cellIndex;
        break;
      case 'Yıl':
        index.year = el.cellIndex;
        break;
      case 'KM':
        index.km = el.cellIndex;
        break;
      case 'Fiyat':
        index.price = el.cellIndex;
        break;
      case 'İlan Tarihi':
        index.adDate = el.cellIndex;
        break;
      case 'İlçe / Semt':
      case 'İl / İlçe':
      case 'Semt / Mahalle':
        index.location = el.cellIndex;
        break;
    }
  });

  return index;
}

// Extract location data from a table row
function extractLocationData(dataCells, locationIndex) {
  let city = '';
  let ilce = '';
  let semt = '';
  let mahalle = '';

  const locationHeaderTitle = document
    .querySelector('.searchResultsLocationHeader a')
    ?.getAttribute('title');
  const locationCell = dataCells[locationIndex];
  const locationTexts = locationCell?.innerText.trim().split('\n') || [];

  switch (locationHeaderTitle) {
    case 'İl / İlçe':
      city = locationTexts[0] || '';
      ilce = locationTexts[1] || '';
      break;
    case 'İlçe / Semt':
      city = document.querySelector('[data-address="city"] a')?.innerText.trim() || '';
      ilce = locationTexts[0] || '';
      semt = locationTexts[1] || '';
      break;
    case 'Semt / Mahalle':
      city = document.querySelector('[data-address="city"] a')?.innerText.trim() || '';
      ilce = document.querySelector('[data-address="town"] a')?.innerText.trim() || '';
      semt = locationTexts[0] || '';
      mahalle = locationTexts[1] || '';
      break;
  }

  return { city, ilce, semt, mahalle };
}

// Save car data to the backend
async function saveCarData(car) {
  try {
    const response = await fetch(`${BACKEND_BASE_URL}/cars/single`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(car), // Tek bir araç gönderiyoruz
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Veri gönderilirken bir hata oluştu.');
    }

    return data; // Tek bir araç verisi dönüyor
  } catch (error) {
    console.error('saveCarData error:', error);
    return null;
  }
}

function processPriceHistory(carData, row) {
  const { priceHistory } = carData;

  if (row && priceHistory && priceHistory.length > 0) {
    const firstPrice = priceHistory[0].price;
    const lastPrice = priceHistory[priceHistory.length - 1].price;

    if (firstPrice !== lastPrice) {
      const priceDifference = ((lastPrice - firstPrice) / firstPrice) * 100;
      const priceCell = row.querySelector('.searchResultsPriceValue');

      const differenceElement = document.createElement('div');
      differenceElement.style.fontSize = '12px';
      differenceElement.style.fontWeight = 'bold';
      differenceElement.style.color = priceDifference < 0 ? 'green' : 'red';
      differenceElement.innerText = `${Math.abs(priceDifference.toFixed(2))}% ${
        priceDifference < 0 ? '↓' : '↑'
      }`;
      priceCell.appendChild(differenceElement);

      // Tooltip için fiyat geçmişini hazırlama
      const tooltipData = [];

      for (let i = 0; i < priceHistory.length; i++) {
        const item = priceHistory[i];
        const date = new Date(item.updatedAt).toLocaleDateString('tr-TR');
        const price = item.price.toLocaleString() + ' TL';

        let trend = '';
        if (i > 0) {
          const previousPrice = priceHistory[i - 1].price;
          if (item.price > previousPrice) {
            trend = 'up';
          } else if (item.price < previousPrice) {
            trend = 'down';
          }
        }

        tooltipData.push({ date, price, trend });
      }

      priceCell.addEventListener('mouseenter', (e) => {
        showTooltip(priceCell, tooltipData, e);
      });
    }
  }
}

// Show a notification message
function showNotification(message, type = 'info') {
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  notification.textContent = message;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, NOTIFICATION_DURATION);
}

// Show a tooltip with given message
function showTooltip(element, data, event) {
  const tooltip = document.createElement('div');
  tooltip.className = 'tooltip';

  data.forEach((item) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'tooltip-item';

    const dateSpan = document.createElement('span');
    dateSpan.className = 'tooltip-date';
    dateSpan.innerText = item.date;

    const priceSpan = document.createElement('span');
    priceSpan.className = 'tooltip-price';
    priceSpan.innerText = item.price;

    if (item.trend === 'up') {
      priceSpan.classList.add('price-up');
      priceSpan.innerHTML += ' ↑';
    } else if (item.trend === 'down') {
      priceSpan.classList.add('price-down');
      priceSpan.innerHTML += ' ↓';
    }

    itemDiv.appendChild(dateSpan);
    itemDiv.appendChild(priceSpan);
    tooltip.appendChild(itemDiv);
  });

  document.body.appendChild(tooltip);

  const moveTooltip = (e) => {
    tooltip.style.left = e.pageX + 10 + 'px';
    tooltip.style.top = e.pageY + 10 + 'px';
  };

  element.addEventListener('mousemove', moveTooltip);

  const removeTooltip = () => {
    tooltip.remove();
    element.removeEventListener('mousemove', moveTooltip);
    element.removeEventListener('mouseleave', removeTooltip);
  };

  element.addEventListener('mouseleave', removeTooltip);

  // Tooltip'i ilk konumlandırma
  tooltip.style.left = event.pageX + 10 + 'px';
  tooltip.style.top = event.pageY + 10 + 'px';
}

})();