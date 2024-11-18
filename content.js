(() => {
    // Constants
    let BACKEND_BASE_URL;
    const ortam = "prod";
   
    if (ortam == "dev") {
      BACKEND_BASE_URL = "http://localhost:5000/api";
    } else if (ortam == "prod") {
      BACKEND_BASE_URL = "https://sahibinden-backend-production.up.railway.app/api";
    }
    const EVALUATE_BUTTON_ID = 'evaluateCarButton';
    const EVALUATION_TABLE_ID = 'evaluationResultTable';
    const STYLE_ID = 'customStyles';
    const LOADING_INDICATOR_ID = 'loadingIndicator';
    const NOTIFICATION_DURATION = 3000;
    const URL_CHECK_INTERVAL = 1000;
  
    // Variables
    let chatHistory = [];
  
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
      if (isCarDetailPage()) {
        injectEvaluateButton();
        injectChatbot();
      } else if (isListingPage()) {
        processListingPage();
     
      } else {
        removeInjectedElements();
      }
    }
  

  
    // Check if the current page is a car detail page
    function isCarDetailPage() {
      return (
        window.location.href.includes("/ilan/vasita") &&
        (document.querySelector(".classifiedUserBox") ||
          document.querySelector(".user-info-module"))
      );
    }
  
    // Check if the current page is a listing page
    function isListingPage() {
      return document.querySelector("#searchResultsTable");
    }
  
    // Remove injected elements when navigating away
    function removeInjectedElements() {
      removeElementById(EVALUATE_BUTTON_ID);
      removeElementById(EVALUATION_TABLE_ID);
      removeElementById('chatbotIcon');
      removeElementById('chatbotWindow');
    }
  
    // Remove an element by its ID
    function removeElementById(elementId) {
      const element = document.getElementById(elementId);
      if (element) element.remove();
    }
  
    // Inject styles into the page
    function injectStyles() {
      if (document.getElementById(STYLE_ID)) return;
  
      const styles = `
        /* Combined styles from both versions */
        .evaluate-btn {
          padding: 10px 20px;
          background-color: #ffe800;
          color: #000;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          font-size: 16px;
          margin-bottom: 12px;
        }
        .evaluate-btn:disabled {
          background-color: #999;
          cursor: not-allowed;
        }
        #searchResultsSearchForm {
          position: relative;
        }
        .arc-dgr-next {
    padding: 10px 20px;
    background-color: #ffe800;
    color: #000;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 16px;
    margin-bottom: 12px;
    display: flex;
    width: fit-content;
        }
        #${EVALUATION_TABLE_ID} {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
        }
        #${EVALUATION_TABLE_ID} th,
        #${EVALUATION_TABLE_ID} td {
          border: 1px solid #ccc;
          padding: 8px;
          text-align: left;
          font-size: 14px;
        }
        #${EVALUATION_TABLE_ID} th {
          background-color: #f2f2f2;
        }
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
        #chatbotIcon {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 50px;
          height: 50px;
          background-color: #ffe800;
          color: #000;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          font-size: 30px;
          z-index: 10000;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
        }
        #chatbotWindow {
          position: fixed;
          bottom: 80px;
          right: 20px;
          width: 390px;
          max-height: 600px;
          min-height: 400px;
          background-color: #fff;
          border: 1px solid #000;
          border-radius: 10px;
          display: none;
          flex-direction: column;
          z-index: 10000;
        }
        #chatbotHeader {
          background-color: #ffe800;
          color: #000;
          padding: 10px;
          border-top-left-radius: 10px;
          border-top-right-radius: 10px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        #chatbotHeader h2 {
          margin: 0;
          font-size: 16px;
        }
        #chatbotSettingsIcon {
          cursor: pointer;
          font-size: 20px;
        }
        #chatbotContent {
          flex: 1;
          padding: 10px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        #chatbotInputContainer {
          display: flex;
          border-top: 1px solid #ccc;
        }
        #chatbotInput {
          flex: 1;
          padding: 12px;
          border: none;
          outline: none;
          border-radius: 0 0 0 10px;
        }
        #chatbotSendButton {
          padding: 10px;
          background-color: #ffe800;
          color: #000;
          border: none;
          cursor: pointer;
          font-weight: 600;
          border-radius: 0 0  10px 0;
          font-size: 13px;
        }
        .chatbot-message {
          margin-bottom: 10px;
          padding: 8px 12px;
          border-radius: 10px;
          max-width: 80%;
          word-wrap: break-word;
          font-size: 13px;
        }
        .chatbot-message.user {
          background-color: #ffe800;
          align-self: flex-end;
        }
        .chatbot-message.bot {
          background-color: #f2f2f2;
          align-self: flex-start;
        }
      `;
      const styleElement = document.createElement('style');
      styleElement.id = STYLE_ID;
      styleElement.textContent = styles;
      document.head.appendChild(styleElement);
    }
  
    // Inject the "Evaluate Car" button on the car detail page
    function injectEvaluateButton() {
      if (document.getElementById(EVALUATE_BUTTON_ID)) return;
  
      const evaluateButton = createEvaluateButton();
  
      const buttonContainer = document.createElement('div');
      buttonContainer.appendChild(evaluateButton);
  
      const targetElement =
        document.querySelector('.classifiedUserBox') || document.querySelector('.user-info-module');
  
      if (targetElement) {
        targetElement.insertAdjacentElement('afterend', buttonContainer);
        evaluateButton.addEventListener('click', evaluateCar);
      }
    }
  
    // Create the "Evaluate Car" button element
    function createEvaluateButton() {
      const button = document.createElement('div');
      button.className = 'evaluate-btn';
      button.id = EVALUATE_BUTTON_ID;
      button.textContent = 'Aracı Değerlendir';
      return button;
    }
  
    // Fetch and evaluate car data
    async function evaluateCar() {
      const evaluateButton = document.getElementById(EVALUATE_BUTTON_ID);
      if (!evaluateButton) return;
      if (evaluateButton.innerText !== 'Aracı Değerlendir') return;
  
      // Disable the button and change its text
      evaluateButton.disabled = true;
      const originalButtonText = evaluateButton.textContent;
      evaluateButton.textContent = 'Araç Değerlendiriliyor...';
  
      try {
        const carData = extractCarDetailData();
        if (!carData) {
          showNotification('Araç bilgileri alınamadı.');
          evaluateButton.disabled = false;
          evaluateButton.textContent = originalButtonText;
          return;
        }
  
        const response = await fetch(`${BACKEND_BASE_URL}/cars/evaluate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(carData),
        });
        const data = await response.json();
  
        if (response.ok) {
          displayEvaluationResult(data, carData);
        } else {
          showNotification(`Değerlendirme yapılamadı: ${data.message}`);
        }
      } catch (error) {
        console.error('evaluateCar error:', error);
        showNotification('Değerlendirme yapılamadı.');
      } finally {
        // Re-enable the button and restore original text
        evaluateButton.disabled = false;
        evaluateButton.textContent = originalButtonText;
      }
    }
  
    // Display the evaluation result in a table below the button
    function displayEvaluationResult(data, carData) {
      removeElementById(EVALUATION_TABLE_ID);
  
      const resultTable = document.createElement('table');
      resultTable.id = EVALUATION_TABLE_ID;
  
      // Format average price
      const averagePriceNumber = Number(data.averagePrice) || 0;
      const formattedAveragePrice = averagePriceNumber.toLocaleString('tr-TR') + ' TL';
  
      // Get current car price as number
      const carPrice = parseInt(carData.fiyat.replace(/\D/g, '')) || 0;
  
      // Calculate price difference percentage
      let priceDifferencePercentage = 0;
      let priceComparisonText = '';
  
      if (averagePriceNumber > 0) {
        priceDifferencePercentage = ((carPrice - averagePriceNumber) / averagePriceNumber) * 100;
  
        if (priceDifferencePercentage < 0) {
          priceComparisonText = `%${Math.abs(priceDifferencePercentage.toFixed(2))} daha ucuz`;
        } else if (priceDifferencePercentage > 0) {
          priceComparisonText = `%${priceDifferencePercentage.toFixed(2)} daha pahalı`;
        } else {
          priceComparisonText = `Fiyat ortalama ile aynı`;
        }
      } else {
        priceComparisonText = 'Ortalama fiyat bulunamadı, karşılaştırma yapılamıyor.';
      }
  
      const tableRows = [
        createTableRow(
          `<strong>Marka / Seri / Model / Yıl:</strong> ${carData.Marka || ''} / ${carData.Seri || ''} / ${carData.Model || ''}/ ${carData.Yıl || ''}`
        ),
        createTableRow(`<strong>Benzer Araç Sayısı:</strong> ${data.similarCount || 0}`),
        createTableRow(`<strong>Ortalama Fiyat:</strong> ${formattedAveragePrice}`),
        createTableRow(`<strong>Bu araç ortalama fiyattan:</strong> ${priceComparisonText}`),
        createTableRow(`<strong>Değerlendirme:</strong><br>${data.evaluation}`),
      ];
  
      // Add remaining usage count if available
      if (data.remainingEvaluations !== undefined) {
        tableRows.push(
          createTableRow(`<strong>Kalan kullanım hakkı:</strong> ${data.remainingEvaluations}`)
        );
      }
  
      tableRows.forEach((row) => resultTable.appendChild(row));
  
      const evaluateButton = document.getElementById(EVALUATE_BUTTON_ID);
      if (evaluateButton) {
        evaluateButton.insertAdjacentElement('afterend', resultTable);
      }
    }
  
    // Create a table row with given HTML content
    function createTableRow(htmlContent) {
      const row = document.createElement('tr');
      const cell = document.createElement('td');
      cell.colSpan = 2;
      cell.innerHTML = htmlContent;
      row.appendChild(cell);
      return row;
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
  
    // Inject the chatbot icon and window
    function injectChatbot() {
      injectChatbotIcon();
      createChatbotWindow();
      loadChatHistory();
    }
  
    function injectChatbotIcon() {
      if (document.getElementById("chatbotIcon")) return;
  
      const icon = document.createElement("div");
      icon.id = "chatbotIcon";
      icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="35px" height="27px" viewBox="0 0 206.000000 167.000000" preserveAspectRatio="xMidYMid meet">
  <metadata>
  Created by potrace 1.10, written by Peter Selinger 2001-2011
  </metadata>
  <g transform="translate(0.000000,167.000000) scale(0.050000,-0.050000)" fill="#000000" stroke="none">
  <path d="M2301 2958 c-289 -56 -520 -289 -581 -585 -115 -559 484 -1030 1003 -789 l113 52 63 -65 c51 -53 61 -75 50 -120 -13 -50 18 -86 386 -455 l400 -401 102 -10 c96 -9 106 -6 173 61 161 161 102 262 -487 842 -220 215 -247 236 -300 226 -46 -10 -69 0 -120 53 l-62 64 52 129 c214 529 -244 1106 -792 998z m375 -158 c373 -161 475 -666 196 -975 -223 -247 -662 -246 -886 2 -441 488 86 1233 690 973z"></path>
  <path d="M2492 2663 c-7 -11 -22 -135 -33 -275 -23 -282 -30 -309 -50 -195 -28 153 -99 199 -147 93 l-25 -54 -44 79 c-42 76 -48 79 -159 85 -150 8 -179 -69 -29 -80 80 -6 88 -12 141 -111 61 -114 95 -129 141 -63 34 48 41 29 94 -215 23 -111 71 -153 111 -97 13 18 30 153 38 311 14 271 31 336 59 224 24 -94 46 -105 203 -105 135 0 148 4 148 40 0 36 -13 40 -120 40 -135 0 -117 -18 -204 210 -43 112 -95 160 -124 113z"></path>
  <path d="M1038 2390 c-47 -25 -378 -561 -378 -612 0 -10 241 -18 572 -18 514 0 571 3 560 32 -7 17 -12 35 -12 40 0 4 -211 8 -470 8 -258 0 -470 7 -470 16 0 8 57 114 127 235 151 261 164 269 471 266 172 -2 211 3 226 30 25 46 -544 48 -626 3z"></path>
  <path d="M133 1903 c-87 -96 -16 -223 124 -223 73 0 87 -7 105 -55 l21 -55 79 88 c89 99 101 179 38 242 -56 56 -317 59 -367 3z"></path>
  <path d="M3273 1903 c-36 -39 -45 -123 -14 -123 11 0 49 -26 85 -57 159 -138 419 10 305 173 -43 61 -323 66 -376 7z"></path>
  <path d="M623 1703 c4 -9 95 -94 203 -190 l196 -173 860 0 860 0 79 63 c150 121 83 187 -117 116 -261 -92 -518 -54 -744 113 l-120 88 -612 0 c-336 0 -608 -7 -605 -17z"></path>
  <path d="M460 1577 c-125 -145 -138 -172 -140 -297 -1 -77 -12 -125 -40 -160 -36 -46 -39 -84 -40 -472 0 -522 -14 -498 284 -498 239 0 276 26 276 190 0 107 15 120 140 120 69 0 87 13 200 140 l124 140 624 0 624 0 117 -135 c111 -128 121 -136 219 -145 l102 -10 12 -100 c22 -191 66 -218 329 -207 240 10 249 22 249 344 l0 242 -154 155 -153 154 -66 -68 c-103 -106 -370 -130 -384 -34 -9 63 151 224 223 224 82 0 77 24 -25 131 l-96 101 -63 -56 -63 -56 -875 0 -876 0 -225 200 c-266 236 -215 221 -323 97z m250 -400 c184 -64 276 -146 266 -234 -10 -91 -244 -84 -357 11 -111 93 -196 335 -104 295 19 -8 107 -41 195 -72z m2010 29 c0 -7 -56 -88 -125 -179 l-125 -165 -581 -1 -581 -1 -134 170 c-74 94 -134 175 -134 180 0 6 378 10 840 10 462 0 840 -6 840 -14z m-2116 -450 c-59 -59 6 -156 104 -157 59 0 60 -2 23 -30 -49 -37 -98 -37 -172 2 -75 38 -82 130 -15 178 53 37 95 42 60 7z m2669 -70 c24 -97 -111 -171 -225 -123 l-58 25 60 8 c87 11 136 61 122 128 -14 73 82 36 101 -38z"></path>
  <path d="M1160 1148 c0 -7 37 -59 82 -115 l82 -103 549 -10 549 -10 46 50 c25 28 71 84 101 125 l56 75 -733 0 c-402 0 -732 -5 -732 -12z"></path>
  <path d="M1218 605 c-150 -160 -220 -145 671 -145 l793 0 -95 110 -95 110 -602 0 -602 0 -70 -75z"></path>
  </g>
  </svg>`; // İkon olarak bir SVG kullanıyoruz
      document.body.appendChild(icon);
  
      icon.addEventListener("click", toggleChatbot);
    }
  
    function toggleChatbot() {
      const chatbotWindow = document.getElementById("chatbotWindow");
      if (chatbotWindow.style.display === "none") {
        chatbotWindow.style.display = "flex";
      } else {
        chatbotWindow.style.display = "none";
      }
    }
  
    function createChatbotWindow() {
      if (document.getElementById("chatbotWindow")) return;
  
      const chatbotWindow = document.createElement("div");
      chatbotWindow.id = "chatbotWindow";
      chatbotWindow.style.display = "none";
  
      // Sohbet başlığı
      const header = document.createElement("div");
      header.id = "chatbotHeader";
  
      const headerTitle = document.createElement("h2");
      headerTitle.innerText = "Akıllı Eksper";
      header.appendChild(headerTitle);
  
      // Ayarlar ikonu
      const settingsIcon = document.createElement("span");
      settingsIcon.id = "chatbotSettingsIcon";
      settingsIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="#000000" height="25px" width="25px" viewBox="0 0 54 54"><g><path d="M51.22,21h-5.052c-0.812,0-1.481-0.447-1.792-1.197s-0.153-1.54,0.42-2.114l3.572-3.571   c0.525-0.525,0.814-1.224,0.814-1.966c0-0.743-0.289-1.441-0.814-1.967l-4.553-4.553c-1.05-1.05-2.881-1.052-3.933,0l-3.571,3.571   c-0.574,0.573-1.366,0.733-2.114,0.421C33.447,9.313,33,8.644,33,7.832V2.78C33,1.247,31.753,0,30.22,0H23.78   C22.247,0,21,1.247,21,2.78v5.052c0,0.812-0.447,1.481-1.197,1.792c-0.748,0.313-1.54,0.152-2.114-0.421l-3.571-3.571   c-1.052-1.052-2.883-1.05-3.933,0l-4.553,4.553c-0.525,0.525-0.814,1.224-0.814,1.967c0,0.742,0.289,1.44,0.814,1.966l3.572,3.571   c0.573,0.574,0.73,1.364,0.42,2.114S8.644,21,7.832,21H2.78C1.247,21,0,22.247,0,23.78v6.439C0,31.753,1.247,33,2.78,33h5.052   c0.812,0,1.481,0.447,1.792,1.197s0.153,1.54-0.42,2.114l-3.572,3.571c-0.525,0.525-0.814,1.224-0.814,1.966   c0,0.743,0.289,1.441,0.814,1.967l4.553,4.553c1.051,1.051,2.881,1.053,3.933,0l3.571-3.572c0.574-0.573,1.363-0.731,2.114-0.42   c0.75,0.311,1.197,0.98,1.197,1.792v5.052c0,1.533,1.247,2.78,2.78,2.78h6.439c1.533,0,2.78-1.247,2.78-2.78v-5.052   c0-0.812,0.447-1.481,1.197-1.792c0.751-0.312,1.54-0.153,2.114,0.42l3.571,3.572c1.052,1.052,2.883,1.05,3.933,0l4.553-4.553   c0.525-0.525,0.814-1.224,0.814-1.967c0-0.742-0.289-1.44-0.814-1.966l-3.572-3.571c-0.573,0.574-0.73,1.364-0.42-2.114   S45.356,33,46.168,33h5.052c1.533,0,2.78-1.247,2.78-2.78V23.78C54,22.247,52.753,21,51.22,21z M52,30.22   C52,30.65,51.65,31,51.22,31h-5.052c-1.624,0-3.019,0.932-3.64,2.432c-0.622,1.5-0.295,3.146,0.854,4.294l3.572,3.571   c0.305,0.305,0.305,0.8,0,1.104l-4.553,4.553c-0.304,0.304-0.799,0.306-1.104,0l-3.571-3.572c-1.149-1.149-2.794-1.474-4.294-0.854   c-1.5,0.621-2.432,2.016-2.432,3.64v5.052C31,51.65,30.65,52,30.22,52H23.78C23.35,52,23,51.65,23,51.22v-5.052   c0-1.624-0.932-3.019-2.432-3.64c-0.503-0.209-1.021-0.311-1.533-0.311c-1.014,0-1.997,0.4-2.761,1.164l-3.571,3.572   c-0.306,0.306-0.801,0.304-1.104,0l-4.553-4.553c-0.305-0.305-0.305-0.8,0-1.104l3.572-3.571c1.148-1.148,1.476-2.794,0.854-4.294   C10.851,31.932,9.456,31,7.832,31H2.78C2.35,31,2,30.65,2,30.22V23.78C2,23.35,2.35,23,2.78,23h5.052   c1.624,0,3.019-0.932,3.64-2.432c0.622-1.5,0.295-3.146-0.854-4.294l-3.572-3.571c-0.305-0.305-0.305-0.8,0-1.104l4.553-4.553   c0.304-0.305,0.799-0.305,1.104,0l3.571,3.571c1.147,1.147,2.792,1.476,4.294,0.854C22.068,10.851,23,9.456,23,7.832V2.78   C23,2.35,23.35,2,23.78,2h6.439C30.65,2,31,2.35,31,2.78v5.052c0,1.624,0.932,3.019,2.432,3.64   c1.502,0.622,3.146,0.294,4.294-0.854l3.571-3.571c0.306-0.305,0.801-0.305,1.104,0l4.553,4.553c0.305,0.305,0.305,0.8,0,1.104   l-3.572,3.571c-1.148,1.148-1.476,2.794-0.854,4.294c0.621,1.5,2.016,2.432,3.64,2.432h5.052C51.65,23,52,23.35,52,23.78V30.22z"/><path d="M27,18c-4.963,0-9,4.037-9,9s4.037,9,9,9s9-4.037,9-9S31.963,18,27,18z M27,34c-3.859,0-7-3.141-7-7s3.141-7,7-7   s7,3.141,7,7S30.859,34,27,34z"/></g></svg>`;
      settingsIcon.addEventListener("click", openApiKeyPopup);
      header.appendChild(settingsIcon);
  
      // Sohbet içeriği
      const chatContent = document.createElement("div");
      chatContent.id = "chatbotContent";
  
      // Mesaj giriş alanı
      const inputContainer = document.createElement("div");
      inputContainer.id = "chatbotInputContainer";
  
      const inputField = document.createElement("input");
      inputField.id = "chatbotInput";
      inputField.type = "text";
      inputField.placeholder = "Mesajınızı yazın...";
  
      const sendButton = document.createElement("button");
      sendButton.id = "chatbotSendButton";
      sendButton.innerText = "Gönder";
      sendButton.addEventListener("click", sendMessage);
  
      inputContainer.appendChild(inputField);
      inputContainer.appendChild(sendButton);
  
      chatbotWindow.appendChild(header);
      chatbotWindow.appendChild(chatContent);
      chatbotWindow.appendChild(inputContainer);
  
      document.body.appendChild(chatbotWindow);
    }
  
    function sendMessage() {
      const inputField = document.getElementById("chatbotInput");
      const message = inputField.value.trim();
      if (!message) return;
  
      // Kullanıcı mesajını sohbet penceresine ekleyelim
      appendMessage("user", message);
  
      // Mesaj alanını temizle
      inputField.value = "";
  
      // Mesajı işleyelim
      handleUserMessage(message);
    }
  
    function appendMessage(sender, text) {
      const chatContent = document.getElementById("chatbotContent");
      const messageDiv = document.createElement("div");
      messageDiv.className = `chatbot-message ${sender}`;
      messageDiv.innerText = text;
      chatContent.appendChild(messageDiv);
  
      // Sohbet içeriğini en alta kaydır
      chatContent.scrollTop = chatContent.scrollHeight;
  
      // Mesajı sohbet geçmişine ekle
      chatHistory.push({ sender, text });
      saveChatHistory();
    }
  
    function saveChatHistory() {
      sessionStorage.setItem("chatHistory", JSON.stringify(chatHistory));
    }
  
    async function loadChatHistory() {
      const savedHistory = sessionStorage.getItem("chatHistory");
      if (savedHistory) {
        chatHistory = await JSON.parse(savedHistory);
  
        chatHistory.forEach((msg) => {
          if (msg.text != "Yazıyor...") {
            const chatContent = document.getElementById("chatbotContent");
            const messageDiv = document.createElement("div");
            messageDiv.className = `chatbot-message ${msg.sender}`;
            messageDiv.innerText = msg.text;
            chatContent.appendChild(messageDiv);
          }
        });
        // Sohbet içeriğini en alta kaydır
        const chatContent = document.getElementById("chatbotContent");
        chatContent.scrollTop = chatContent.scrollHeight;
      }
    }
  
    async function handleUserMessage(message) {
      // Önce 'Yazıyor...' mesajını ekleyelim
      appendMessage("bot", "Yazıyor...");
  
      // Son eklenen mesajı referans alalım
      const chatContent = document.getElementById("chatbotContent");
      const typingMessage = chatContent.lastChild;
  
      // Animasyonu başlatmak için değişkenler
      let dotCount = 1;
      const maxDots = 3;
      const typingAnimationInterval = setInterval(() => {
        typingMessage.innerText = "Yazıyor" + ".".repeat(dotCount);
        dotCount = (dotCount % maxDots) + 1;
      }, 500);
  
      // Kullanıcının API anahtarını kontrol edin
      const userApiKeyEncoded = localStorage.getItem("openaiApiKey");
      const userApiKey = userApiKeyEncoded
        ? window.atob(userApiKeyEncoded)
        : null;
  
      // Araç verilerini çekelim
      const carData = extractCarDetailData();
      if (!carData) {
        clearInterval(typingAnimationInterval);
        typingMessage.remove();
        appendMessage("bot", "Araç bilgileri alınamadı.");
        return;
      }
  
      // Kullanıcının IP adresini almak için
      const ipData = await fetch("https://api.ipify.org?format=json");
      const ipJson = await ipData.json();
      const userIp = ipJson.ip;
  
      // Kullanıcı mesajını backend'e gönderelim
      const requestData = {
        message,
        carData,
        ip: userIp,
      };
  
      if (userApiKey) {
        requestData.openaiApiKey = userApiKey;
      }
  
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/cars/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
        });
        const data = await response.json();
  
        clearInterval(typingAnimationInterval);
        typingMessage.remove();
  
        if (response.ok) {
          appendMessage("bot", data.reply);
        } else {
          appendMessage("bot", `Hata: ${data.message}`);
        }
      } catch (error) {
        console.error("handleUserMessage error:", error);
        clearInterval(typingAnimationInterval);
        typingMessage.remove();
        appendMessage(
          "bot",
          "Bir hata oluştu. Lütfen daha sonra tekrar deneyin."
        );
      }
    }
  
    function openApiKeyPopup() {
      // Popup arka planını oluştur
      const overlay = document.createElement("div");
      overlay.id = "apiKeyOverlay";
      Object.assign(overlay.style, {
        position: "fixed",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        zIndex: "10000",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      });
  
      // Popup içeriğini oluştur
      const popup = document.createElement("div");
      Object.assign(popup.style, {
        backgroundColor: "#fff",
        padding: "20px",
        borderRadius: "5px",
        maxWidth: "400px",
        width: "100%",
      });
  
      const title = document.createElement("h2");
      title.textContent = "OpenAI API Keyinizi Girin";
  
      const input = document.createElement("input");
      input.type = "text";
      input.style.width = "100%";
      input.placeholder = "sk-...";
  
      // Mevcut API anahtarını yükle
      const existingApiKeyEncoded = localStorage.getItem("openaiApiKey");
      let existingApiKey = null;
      if (existingApiKeyEncoded) {
        try {
          existingApiKey = window.atob(existingApiKeyEncoded);
          input.value = existingApiKey;
        } catch (e) {
          console.error("API anahtarı çözülürken hata oluştu:", e);
          existingApiKey = null;
          // Hata durumunda kullanıcıya bilgi verin
          showNotification(
            "Geçersiz API anahtarı tespit edildi. Lütfen yeniden girin.",
            "error"
          );
          // Geçersiz anahtarı localStorage'dan kaldırın
          localStorage.removeItem("openaiApiKey");
        }
      }
  
      const saveButton = document.createElement("button");
      saveButton.textContent = "Kaydet";
      saveButton.style.marginTop = "10px";
  
      saveButton.addEventListener("click", () => {
        const apiKey = input.value.trim();
        if (apiKey) {
          localStorage.setItem("openaiApiKey", window.btoa(apiKey));
          showNotification("API anahtarınız kaydedildi.", "success");
          document.body.removeChild(overlay);
        } else {
          showNotification("Lütfen geçerli bir API anahtarı girin.", "error");
        }
      });
  
      popup.appendChild(title);
      popup.appendChild(input);
      popup.appendChild(saveButton);
      overlay.appendChild(popup);
  
      document.body.appendChild(overlay);
  
      // Popup dışında tıklanınca kapat
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          document.body.removeChild(overlay);
        }
      });
    }
  
    // Extract car data from the detail page
    function extractCarDetailData() {
      try {
        const carData = {};
        const classifiedInfoElement = document.querySelector(
          ".classifiedInfoList"
        );
        if (!classifiedInfoElement) return null;
  
        Object.assign(
          carData,
          parseClassifiedInfo(classifiedInfoElement.innerText)
        );
  
        const detailElement = document.querySelector(".classifiedDescription");
        if (detailElement?.innerHTML) {
          carData.detail = parseDetailSections(detailElement.innerHTML);
        }
  
        const techDetailsElement = document.querySelector(
          ".classifiedTechDetails"
        );
        if (techDetailsElement?.innerHTML) {
          carData.techDetails = parseTechDetails(techDetailsElement.innerHTML);
        }
  
        if (
          document.querySelector("#classifiedDescription") &&
          document.querySelector("#classifiedDescription").innerText.length > 0
        ) {
          carData.detailText = document
            .querySelector("#classifiedDescription")
            .innerText.replaceAll("\n", "-");
        }
  
        const priceElement = document.querySelector(".classified-price-wrapper");
        if (priceElement) {
          carData.fiyat = priceElement.innerText.trim();
        }
  
        console.log("Extracted car data:", carData);
        return carData;
      } catch (error) {
        console.error("extractCarDetailData error:", error);
        return null;
      }
    }
  
    // Parse classified information text into an object
    function parseClassifiedInfo(text) {
      const data = {};
      let key = null;
      text.split("\n").forEach((line) => {
        const trimmedLine = line.trim();
        if (trimmedLine && !key) {
          key = trimmedLine;
        } else if (trimmedLine && key) {
          data[key.replace(/\s+/g, "")] = trimmedLine;
          key = null;
        }
      });
      return data;
    }
  
    // Parse detail sections from HTML
    function parseDetailSections(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const sections = {};
  
      doc.querySelectorAll("h3").forEach((h3) => {
        const sectionTitle = h3.textContent.trim();
        const ulElement =
          h3.nextElementSibling?.tagName === "UL" ? h3.nextElementSibling : null;
        if (ulElement) {
          const items = Array.from(ulElement.querySelectorAll("li")).map((li) => ({
            name: li.textContent.trim(),
            selected: li.classList.contains("selected"),
          }));
          sections[sectionTitle] = items;
        }
      });
      return sections;
    }
  
    // Parse technical details from HTML
    function parseTechDetails(html) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, "text/html");
      const techDetails = {};
  
      doc.querySelectorAll("h3").forEach((h3) => {
        const sectionTitle = h3.textContent.trim();
        const tableElement =
          h3.nextElementSibling?.tagName === "TABLE"
            ? h3.nextElementSibling
            : null;
        if (tableElement) {
          const specs = {};
          tableElement.querySelectorAll("tr").forEach((row) => {
            const key = row
              .querySelector("td.title")
              ?.textContent.trim()
              .replace(/\s+/g, " ");
            const value = row
              .querySelector("td.value")
              ?.textContent.trim()
              .replace(/\s+/g, " ");
            if (key && value) {
              specs[key] = value;
            }
          });
          techDetails[sectionTitle] = specs;
        }
      });
      return techDetails;
    }
  
    // Process the listing page
    async function processListingPage() {
      try {
        const table = document.querySelector("#searchResultsTable");
        if (!table) return;
  
        const rows = table.querySelectorAll("tbody tr");
        if (rows.length === 0) return;
  
        const cars = [];
        const rowCarMap = new Map();
  
        rows.forEach((row) => {
          const car = extractCarListingData(row);
          if (car) {
            cars.push(car);
            rowCarMap.set(car.adId, row);
          }
        });
  
        const result = await saveCarData(cars);
        console.log(result);
  
        if (result) {
          processPriceHistories(result.data, rowCarMap);
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
  async function saveCarData(cars) {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/cars`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cars),
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Veri gönderilirken bir hata oluştu.');
      }

      return data;
    } catch (error) {
      console.error('saveCarData error:', error);
      // showNotification('Veri gönderilirken bir hata oluştu.', 'error');
      return null;
    }
  }

    // Process price histories and update the UI
function processPriceHistories(carDataList, rowCarMap) {
    carDataList.forEach((item) => {
      const { carData } = item;
      const { priceHistory, adId } = carData;
      const row = rowCarMap.get(adId);
  
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
    });
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
  