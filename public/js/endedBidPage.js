document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const vin = urlParams.get('vin');

    const db = firebase.firestore();

    db.collection("cars").doc(vin).get()
        .then((doc) => {
            if (doc.exists) {
                const car = doc.data();
                updateBreadcrumb(car);
                updateTitle(car);
                loadCarImages(car);
                initializeCarSlider();
                updateOffersAndDetails(car);
                updateCarSpecifications(car);
            } else {
                console.error('Car not found');
            }
        })
        .catch(error => console.error('Error fetching car data:', error));

    function updateBreadcrumb(car) {
        const breadcrumbActiveItem = document.querySelector('.breadcrumbs__item--active');
        if (breadcrumbActiveItem) {
            breadcrumbActiveItem.textContent = `${car.Brand} ${car.Model}`;
        }
    }

    function updateTitle(car) {
        const titleElement = document.querySelector('.main__title--page h1');
        if (titleElement) {
            titleElement.textContent = `${car.Brand} ${car.Model}`;
        }
    }

    aiRecommendationButton.addEventListener('click', () => {
        db.collection("cars").doc(vin).get()
            .then((doc) => {
                if (doc.exists) {
                    const car = doc.data();
                    if (car.Gpt) {
                        displayTextWithTypingAnimation(car.Gpt);
                    } else {
                        aiRecommendationText.textContent = 'No AI recommendation available.';
                        aiRecommendationText.style.display = 'block';
                    }
                } else {
                    aiRecommendationText.textContent = 'Car not found.';
                    aiRecommendationText.style.display = 'block';
                }
            })
            .catch(error => {
                aiRecommendationText.textContent = 'Error fetching AI recommendation.';
                aiRecommendationText.style.display = 'block';
                console.error('Error fetching AI recommendation:', error);
            });
    });

    function displayTextWithTypingAnimation(text) {
        aiRecommendationText.innerHTML = ''; // Clear any existing text
        aiRecommendationText.style.display = 'block';

        const formattedText = text.replace(/\{#\}/g, '\n'); // Replace {#} with newline characters
        let index = 0;

        function typeNextCharacter() {
            if (index < formattedText.length) {
                if (formattedText[index] === '\n') {
                    aiRecommendationText.innerHTML += '<br>';
                } else {
                    aiRecommendationText.innerHTML += formattedText[index];
                }
                index++;
                setTimeout(typeNextCharacter, 50); // Adjust typing speed here
            }
        }

        typeNextCharacter();
    }




    function loadCarImages(car) {
        const imagesListElement = document.getElementById('carImagesList');
        if (!imagesListElement) {
            console.error('Images list element not found');
            return;
        }
        imagesListElement.innerHTML = '';

        const prioritizedImages = car.imageUrls.sort((a, b) => {
            const regex = /\/(\d+)\.(jpg|jpeg)$/;
            const aMatch = a.match(regex);
            const bMatch = b.match(regex);

            if (aMatch && bMatch) {
                return parseInt(aMatch[1]) - parseInt(bMatch[1]);
            } else if (aMatch) {
                return -1;
            } else if (bMatch) {
                return 1;
            } else {
                return 0;
            }
        }).slice(0, 40); // Limit to 42 images

        prioritizedImages.forEach(photo => {
            const listItem = document.createElement('li');
            listItem.className = 'splide__slide';

            const img = document.createElement('img');
            img.src = photo;
            img.alt = `${car.Brand} ${car.Model}`;

            listItem.appendChild(img);
            imagesListElement.appendChild(listItem);
        });
    }

    function initializeCarSlider() {
        new Splide('.splide', {}).mount();
    }

    function updateOffersAndDetails(car) {
        document.getElementById('currentBid').textContent = `${car.currentPrice} lei`;
        document.getElementById('numOfBids').textContent = car.Num_of_bids;

        const remainingTimeElement = document.getElementById('remainingTime');
        remainingTimeElement.textContent = car.BidStatus === 'Ended' ? 'Terminat' : 'Active';

        document.getElementById('endDate').textContent = car.End_date;
        document.getElementById('sellerSatisfaction').textContent = car.Seller_enjoyment;
        document.getElementById('detailNumOfPeople').textContent = `${car.Num_of_people} persoane`;
        document.getElementById('detailFuelType').textContent = car.Fuel_type;
        document.getElementById('detailFuelUsage').textContent = car.Fuel_usage;
        document.getElementById('detailTransmission').textContent = car.Transmission;
    }

    function updateCarSpecifications(car) {
        const fields = [
            { id: 'specBrand', value: car.Brand },
            { id: 'specModel', value: car.Model },
            { id: 'specYear', value: car.Year },
            { id: 'specColor', value: car.Color },
            { id: 'specVin', value: car.VIN },
            { id: 'specOdometer', value: car.Odometer },
            { id: 'specDateAdded', value: car.Date_added },
            { id: 'specEndDate', value: car.End_date },
            { id: 'specEngineCapacity', value: car.Engine_capacity },
            { id: 'specHorsePower', value: `${car.Horse_power} HP` },
            { id: 'specDrivetrain', value: car.Drivetrain },
            { id: 'specStatus', value: car.Status }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.id);
            if (element) {
                element.textContent = field.value;
            } else {
                console.error(`Element with ID ${field.id} not found`);
            }
        });
    }

    function listenForPriceUpdates(vin) {
        db.collection("cars").doc(vin).onSnapshot((doc) => {
            if (doc.exists) {
                const carData = doc.data();
                document.getElementById('currentBid').textContent = `${carData.currentPrice} lei`;
                document.getElementById('numOfBids').textContent = carData.Num_of_bids;
                document.getElementById('bidAmount').value = '';
            } else {
                console.log("No such document!");
            }
        });
    }

    // Start listening for price updates when the page loads
    listenForPriceUpdates(vin);
});
