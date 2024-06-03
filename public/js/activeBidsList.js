document.addEventListener('DOMContentLoaded', function () {
    const db = firebase.firestore();
    const filterBtn = document.querySelector('.filter__btn');
    const clearFiltersBtn = document.getElementById('clear-filters-btn');
    clearFiltersBtn.addEventListener('click', clearFilters);
    loadFilterOptions(db);

    // Get URL parameters and set filters
    const urlParams = getUrlParams();
    setFiltersFromParams(urlParams);

    // Automatically apply filters without the need for a button click
    applyFilters();

    // Apply filters when button is clicked
    filterBtn.addEventListener('click', function () {
        const filters = getFilters();
        fetchAndDisplayCars(db, filters);
    });
});

let currentPage = 1;
const carsPerPage = 11;

function fetchAndDisplayCars(db, filters = {}) {
    db.collection("cars").where("BidStatus", "==", "Active").get()
        .then(querySnapshot => {
            const cars = [];
            querySnapshot.forEach(doc => {
                const carData = doc.data();
                if (applyFilterToCar(carData, filters)) {
                    cars.push(carData);
                }
            });
            paginateCars(cars);
        })
        .catch(error => console.error('Error fetching car data:', error));
}

function paginateCars(cars) {
    const validCars = cars.filter(car => {
        return car.Brand && car.Model && car.Year && car.Odometer && car.End_date && car.Status && car.currentPrice && car.imageUrls;
    });
    const totalPages = Math.ceil(validCars.length / carsPerPage);
    renderCars(validCars.slice((currentPage - 1) * carsPerPage, currentPage * carsPerPage));
    renderPaginator(totalPages);
    updatePageInfo(totalPages);
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
        const coverPhotos = car.imageUrls ? car.imageUrls.filter(photo => /\/(1|2|3)\.(jpg|jpeg)$/.test(photo)) : [];

        if (coverPhotos.length === 0) {
            console.warn(`No cover photos found for car VIN: ${car.VIN}`);
            return;
        }

        let carHTML = `
            <div class="col-12 col-md-6">
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
                                ${coverPhotos.map(photo => `<li class="splide__slide"><img src="${photo}" alt="Car image"></li>`).join('')}
                            </ul>
                        </div>
                    </div>
                    <div class="car__title">
                        <h3 class="car__name"><a href="${carDetailUrl}">${car.Brand} ${car.Model}</a></h3>
                        <span class="car__year">${car.Year}</span>
                    </div>
                    <ul class="car__list">
                        <li><img src="../assets/icons/odometer.svg" alt="Odometer"><span>${car.Odometer}</span></li>
                        <li><img src="../assets/icons/car_type.svg" alt="Status"><span> ${car.Status}</span></li>
                        <li><img src="../assets/icons/calendar.svg" alt="End date"><span>${car.End_date}</span></li>
                        <li><img src="../assets/icons/timer.svg" alt="Time left"><span id="timer-${car.VIN}">Timp rămas: N/A</span></li>
                    </ul>
                    <div class="car__footer">
                        <div class="car__offer">
                            <span class="car__offer-text">Oferta curentă:</span>
                            <span class="car__price" id="car__price-${car.VIN}">Loading...</span>
                        </div>
                       
                        <a href="${carDetailUrl}" class="car__more"><span>Plasează oferta</span></a>
                    </div>
                </div>
            </div>
        `;

        container.insertAdjacentHTML('beforeend', carHTML);

        // Add click event to the car name to navigate to carDetailUrl
        const carNameElement = container.lastElementChild.querySelector('.car__name');
        carNameElement.addEventListener('click', function() {
            window.location.href = carDetailUrl;
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
    const db = firebase.firestore();
    db.collection("cars").doc(vin).update({
        BidStatus: status
    }).then(() => {
        console.log(`Bid status updated to ${status} for VIN: ${vin}`);
    }).catch((error) => {
        console.error('Error updating bid status:', error);
    });
}

function renderPaginator(totalPages) {
    const paginator = document.querySelector('.paginator__list');
    if (!paginator) {
        console.error('Paginator not found');
        return;
    }

    paginator.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const isActive = i === currentPage ? 'class="active"' : '';
        paginator.insertAdjacentHTML('beforeend', `<li ${isActive}><a href="#" onclick="changePage(${i})">${i}</a></li>`);
    }
}

function changePage(page) {
    currentPage = page;
    fetchAndDisplayCars(firebase.firestore());
}

function updatePageInfo(totalPages) {
    const currentPageElement = document.getElementById('current_page');
    const totalPagesElement = document.getElementById('total_pages');

    if (currentPageElement && totalPagesElement) {
        currentPageElement.textContent = currentPage;
        totalPagesElement.textContent = totalPages;
    }
}

function loadFilterOptions(db) {
    db.collection("cars").get()
        .then(querySnapshot => {
            const brands = new Set();
            const transmissions = new Set();
            const fuels = new Set();
            querySnapshot.forEach(doc => {
                const carData = doc.data();
                if (carData.Brand) brands.add(carData.Brand);
                if (carData.Transmission) transmissions.add(carData.Transmission);
                if (carData.Fuel_type) fuels.add(carData.Fuel_type);
            });
            populateFilterOptions(brands, transmissions, fuels);
        })
        .catch(error => console.error('Error fetching filter options:', error));
}

function populateFilterOptions(brands, transmissions, fuels) {
    const brandList = document.querySelector('.filter__checkboxes[name="brand"]');
    if (!brandList) {
        console.error('Brand checkboxes element not found');
        return;
    }

    // Sort brands alphabetically
    const sortedBrands = Array.from(brands).sort();
    sortedBrands.forEach(brand => {
        brandList.insertAdjacentHTML('beforeend', `
            <li>
                <input id="brand_${brand}" type="checkbox" name="brand" value="${brand}">
                <label for="brand_${brand}">${brand}</label>
            </li>
        `);
    });

    const transmissionList = document.querySelector('.filter__checkboxes[name="transmission"]');
    if (!transmissionList) {
        console.error('Transmission checkboxes element not found');
        return;
    }
    transmissions.forEach(transmission => {
        transmissionList.insertAdjacentHTML('beforeend', `
            <li>
                <input id="transmission_${transmission}" type="checkbox" name="transmission" value="${transmission}">
                <label for="transmission_${transmission}">${transmission}</label>
            </li>
        `);
    });

    const fuelList = document.querySelector('.filter__checkboxes[name="fuel"]');
    if (!fuelList) {
        console.error('Fuel checkboxes element not found');
        return;
    }
    fuels.forEach(fuel => {
        fuelList.insertAdjacentHTML('beforeend', `
            <li>
                <input id="fuel_${fuel}" type="checkbox" name="fuel" value="${fuel}">
                <label for="fuel_${fuel}">${fuel}</label>
            </li>
        `);
    });
}

function getFilters() {
    const filters = {};

    const keywordInput = document.querySelector('.filter__input');
    if (keywordInput.value) {
        filters.keyword = keywordInput.value.toLowerCase();
    }

    const yearInput = document.getElementById('yearInput');
    if (yearInput && yearInput.value) {
        filters.year = yearInput.value;
    }

    const brandCheckboxes = document.querySelectorAll('.filter__checkboxes[name="brand"] input:checked');
    if (brandCheckboxes.length > 0) {
        filters.brand = Array.from(brandCheckboxes).map(cb => cb.value);
    }

    const transmissionCheckboxes = document.querySelectorAll('.filter__checkboxes[name="transmission"] input:checked');
    if (transmissionCheckboxes.length > 0) {
        filters.transmission = Array.from(transmissionCheckboxes).map(cb => cb.value);
    }

    const fuelCheckboxes = document.querySelectorAll('.filter__checkboxes[name="fuel"] input:checked');
    if (fuelCheckboxes.length > 0) {
        filters.fuel = Array.from(fuelCheckboxes).map(cb => cb.value);
    }

    return filters;
}

function applyFilters() {
    const filters = getFilters();
    fetchAndDisplayCars(firebase.firestore(), filters);
}

function applyFilterToCar(car, filters) {
    if (filters.keyword) {
        const keywords = filters.keyword.split(' ').map(word => word.toLowerCase());
        const carString = `${car.Brand} ${car.Model}`.toLowerCase();
        if (!keywords.some(keyword => carString.includes(keyword))) {
            return false;
        }
    }

    if (filters.year && filters.year !== car.Year.toString()) {
        return false;
    }

    if (filters.brand && filters.brand.length > 0 && !filters.brand.includes(car.Brand)) {
        return false;
    }

    if (filters.transmission && filters.transmission.length > 0 && !filters.transmission.includes(car.Transmission)) {
        return false;
    }

    if (filters.fuel && filters.fuel.length > 0 && !filters.fuel.includes(car.Fuel_type)) {
        return false;
    }

    return true;
}

function clearFilters() {
    const keywordInput = document.querySelector('.filter__input');
    keywordInput.value = '';

    const yearInput = document.getElementById('yearInput');
    if (yearInput) {
        yearInput.value = '';
    }

    const brandCheckboxes = document.querySelectorAll('.filter__checkboxes[name="brand"] input:checked');
    brandCheckboxes.forEach(cb => cb.checked = false);

    const transmissionCheckboxes = document.querySelectorAll('.filter__checkboxes[name="transmission"] input:checked');
    transmissionCheckboxes.forEach(cb => cb.checked = false);

    const fuelCheckboxes = document.querySelectorAll('.filter__checkboxes[name="fuel"] input:checked');
    fuelCheckboxes.forEach(cb => cb.checked = false);

    const sortSelect = document.getElementById('filter__status');
    sortSelect.selectedIndex = 0;

    fetchAndDisplayCars(firebase.firestore());
}

function getUrlParams() {
    const params = {};
    const queryString = window.location.search.substring(1);
    const regex = /([^&=]+)=([^&]*)/g;
    let m;
    while (m = regex.exec(queryString)) {
        params[decodeURIComponent(m[1])] = decodeURIComponent(m[2]);
    }
    return params;
}

function setFiltersFromParams(params) {
    if (params.carName) {
        document.getElementById('keywordInput').value = params.carName;
    }

    if (params.carYear) {
        document.getElementById('yearInput').value = params.carYear;
    }

    // Check the appropriate brand checkboxes based on the car name if it matches any brand
    if (params.carName) {
        const brandCheckboxes = document.querySelectorAll('.filter__checkboxes[name="brand"] input');
        brandCheckboxes.forEach(cb => {
            if (cb.value.toLowerCase() === params.carName.toLowerCase()) {
                cb.checked = true;
            }
        });
    }

    applyFilters();
}
