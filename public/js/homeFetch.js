document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  const currentCarVin = urlParams.get('vin');

  fetchCarsData(currentCarVin);
});

function fetchCarsData(currentCarVin) {
  db.collection("cars").where("BidStatus", "==", "Active").get()
      .then(querySnapshot => {
          const cars = [];
          querySnapshot.forEach((doc) => {
              let carData = doc.data();
              carData.VIN = doc.id;
              cars.push(carData);
          });
          const shuffledCars = shuffleArray(cars).slice(0, 6);
          renderCars(shuffledCars);
      })
      .catch((error) => {
          console.log('Error fetching Firestore data:', error);
      });
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function renderCars(cars) {
  const container = document.getElementById('cars_container');
  if (!container) {
      console.error('Container for cars not found');
      return;
  }

  container.innerHTML = '';

  cars.forEach(car => {
      const carDetailUrl = `car.html?vin=${encodeURIComponent(car.VIN)}`;

      const coverPhotos = (car.imageUrls || []).filter(photo =>
          /\/1\.jpg$|\/1\.jpeg$|\/2\.jpg$|\/2\.jpeg$|\/3\.jpg$|\/3\.jpeg$/i.test(photo)
      ).slice(0, 3);

      let carHTML = `
      <div class="col-12 col-md-4">
        <div class="car">
          <div class="splide splide--card car__slider">
            <div class="splide__arrows">
              <button class="splide__arrow splide__arrow--prev" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M17,11H9.41l3.3-3.29a1,1,0,1,0-1.42-1.42l-5,5a1,1,0,0,0-.21.33,1,1,0,0,0,0,.76,1,1,0,0,0,.21.33l5,5a1,1,0,0,0,1.42,0,1,1,0,0,0,0-1.42L9.41,13H17a1,1,0,0,0,0-2Z"></path>
                </svg>
              </button>
              <button class="splide__arrow splide__arrow--next" type="button">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <path d="M17.92,11.62a1,1,0,0,0-.21-.33l-5-5a1,1,0,0,0-1.42,1.42L14.59,11H7a1,1,0,0,0,0,2h7.59l-3.3,3.29a1,1,0,0,0,0,1.42,1,1,0,0,0,1.42,0l5-5a1,1,0,0,0,.21-.33A1,1,0,0,0,17.92,11.62Z"></path>
                </svg>
              </button>
            </div>
            <div class="splide__track">
              <ul class="splide__list">
                ${coverPhotos.map(photo => `<li class="splide__slide"><a href="${carDetailUrl}"><img src="${photo}" alt="Car image"></a></li>`).join('')}
              </ul>
            </div>
          </div>
          <div class="car__title">
            <h3 class="car__name"><a href="${carDetailUrl}">${car.Brand} ${car.Model}</a></h3>
            <span class="car__year">${car.Year}</span>
          </div>
          <ul class="car__list">
            <li><img src="../assets/icons/odometer.svg" alt="Odometer"><span>${car.Odometer}</span></li>
            <li><img src="../assets/icons/car_type.svg" alt="Status"><span>${car.Status}</span></li>
            <li><img src="../assets/icons/calendar.svg" alt="End date"><span>${car.End_date}</span></li>
            <li><img src="../assets/icons/timer.svg" alt="Time left"><span id="timer-${car.VIN}">Timp rămas: N/A</span></li>
          </ul>
          <div class="car__footer">
            <div class="car__offer">
              <span class="car__offer-text">Oferta curentă:</span>
              <span class="car__price" id="car__price-${car.VIN}">Așteaptă...</span>
            </div>

            <a href="${carDetailUrl}" class="car__more"><span>Plasează oferta</span></a>
          </div>
        </div>
      </div>
    </div>
  </div>
  `;

      container.insertAdjacentHTML('beforeend', carHTML);

      // Add click event to the car name to navigate to carDetailUrl
      const carNameElement = container.lastElementChild.querySelector('.car__name');
      carNameElement.addEventListener('click', function() {
          window.location.href = this.getAttribute('data-href');
      });

      // Add event listeners to stop event propagation for Splide buttons
      const splideArrows = container.lastElementChild.querySelectorAll('.splide__arrow');
      splideArrows.forEach(button => {
          button.addEventListener('click', function(event) {
              event.stopPropagation();
          });
      });

      // Start listening for price updates from Firestore for this car
      listenForCarPriceUpdates(car.VIN);

      // Initialize countdown timer with ISO end date from Firebase
      initializeCountdownTimer(`timer-${car.VIN}`, car.ISO_End_Date, car.VIN);
  });

  initializeSliders();
}

function initializeSliders() {
  document.querySelectorAll('.splide').forEach(slider => {
      new Splide(slider, {}).mount();
  });
}

function listenForCarPriceUpdates(vin) {
  const db = firebase.firestore();
  db.collection("cars").doc(vin).onSnapshot((doc) => {
      if (doc.exists) {
          const carData = doc.data();
          const priceElement = document.getElementById(`car__price-${vin}`);
          if (priceElement) {
              priceElement.textContent = `${carData.currentPrice} lei`;
          }
      } else {
          console.error("No such document for VIN:", vin);
      }
  });
}

function initializeCountdownTimer(elementId, isoEndDate, vin) {
  const endTime = new Date(isoEndDate).getTime();
  const timerElement = document.getElementById(elementId);

  const updateTimer = () => {
      const currentTime = Date.now();
      const timeLeft = endTime - currentTime;

      if (!timerElement) {
          console.error('Timer element not found:', elementId);
          return;
      }

      if (timeLeft <= 0) {
          timerElement.textContent = 'Expirat';
          updateBidStatus(vin, 'Ended');
          return;
      }

      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

      if (days > 0) {
          timerElement.textContent = `${days} z și ${hours} h`;
      } else {
          timerElement.textContent = `${hours}h ${minutes}m ${seconds}s`;
      }

      setTimeout(updateTimer, 1000);
  };

  updateTimer();
}

function updateBidStatus(vin, status) {
  db.collection("cars").doc(vin).update({
      BidStatus: status
  }).then(() => {
      console.log(`Bid status updated to ${status} for VIN: ${vin}`);
  }).catch((error) => {
      console.error('Error updating bid status:', error);
  });
}
