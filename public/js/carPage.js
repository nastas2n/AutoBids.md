document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const vin = urlParams.get('vin');
    const offerButton = document.querySelector('.offer__rent');
    const aiRecommendationButton = document.getElementById('aiRecommendationButton');
    const aiRecommendationText = document.getElementById('aiRecommendationText');

    // Firebase configuration
    const firebaseConfig = {
        apiKey: "AIzaSyAeCIbmss03BOr5keyXporv6LLAkqbnij8",
        authDomain: "webtja-fb215.firebaseapp.com",
        projectId: "webtja-fb215",
        storageBucket: "webtja-fb215.appspot.com",
        messagingSenderId: "642807450348",
        appId: "1:642807450348:web:cd1919fa9dd3cfe9b033c9",
    };

    // Initialize Firebase if it hasn't been initialized already
    if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
    }

    const auth = firebase.auth();
    const db = firebase.firestore();

    checkUserAuthentication();

    db.collection("cars").doc(vin).get()
        .then((doc) => {
            if (doc.exists) {
                const car = doc.data();
                updateBreadcrumb(car);
                updateTitle(car);
                loadCarImages(car);
                updateOffersAndDetails(car);
                updateCarSpecifications(car);
                initializeCountdownTimer('remainingTime', car.ISO_End_Date, vin);
                // Initialize Swiper only after loading the images
                initializeCarSlider();
            } else {
                console.error('Car not found');
            }
        })
        .catch(error => console.error('Error fetching car data:', error));

    let animationStarted = false;
    let typingTimeout; // To store the timeout ID
    
    aiRecommendationButton.addEventListener('click', () => {
        if (animationStarted) {
            // Stop the animation
            clearTimeout(typingTimeout);
            animationStarted = false;
            return;
        }
        
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
        animationStarted = true;
    
        function typeNextCharacter() {
            if (index < formattedText.length) {
                if (formattedText[index] === '\n') {
                    aiRecommendationText.innerHTML += '<br>';
                } else {
                    aiRecommendationText.innerHTML += formattedText[index];
                }
                index++;
                typingTimeout = setTimeout(typeNextCharacter, 50); // Adjust typing speed here
            } else {
                animationStarted = false; // Animation finished
            }
        }
    
        typeNextCharacter();
    }

    function updateBreadcrumb(car) {
        const breadcrumbActiveItem = document.querySelector('.breadcrumbs__item--active');
        if (breadcrumbActiveItem) {
            breadcrumbActiveItem.textContent = `${car.Brand} ${car.Model}`;
        }
    }

    function checkUserAuthentication() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                offerButton.disabled = false;
                offerButton.removeEventListener('click', showLoginModal);
                offerButton.addEventListener('click', placeBid);
            } else {
                offerButton.disabled = false; // Make sure button is clickable to show modal
                offerButton.removeEventListener('click', placeBid);
                offerButton.addEventListener('click', showLoginModal);
            }
        });
    }

    function showLoginModal(event) {
        event.preventDefault();
        showModal("Utilizatorul nu este autentificat", "Trebuie să vă creați un cont sau să vă logați pentru a putea plasa o ofertă.", 'bidModal');
    }

    function placeBid() {
        const user = auth.currentUser;
        if (user) {
            user.getIdToken(/* forceRefresh */ true).then(function (idToken) {
                // Send token to your backend via HTTPS
                const bidAmountInput = document.getElementById('bidAmount').value;
                const bidAmount = Number(bidAmountInput);

                if (isNaN(bidAmount) || bidAmount <= 0) {
                    showModal("Eroare de ofertă", "Vă rugăm să introduceți o sumă validă pentru ofertă.", 'bidModal');
                    return;
                }

                console.log('Placing bid:', bidAmount);

                db.collection("cars").doc(vin).get().then((doc) => {
                    if (!doc.exists) {
                        console.error("Document does not exist!");
                        showModal("Eroare de ofertă", "Documentul nu există.", 'bidModal');
                        return;
                    }

                    const carData = doc.data();
                    const currentPrice = carData.currentPrice;

                    console.log('Current price:', currentPrice);

                    if (bidAmount > currentPrice) {
                        db.collection("cars").doc(vin).update({
                            currentPrice: bidAmount,
                            Num_of_bids: carData.Num_of_bids + 1
                        }).then(() => {
                            const userId = user.uid;
                            const userDocRef = db.collection("users").doc(userId);

                            userDocRef.get().then((userDoc) => {
                                if (!userDoc.exists) {
                                    userDocRef.set({
                                        bids: [{
                                            vin: vin,
                                            amount: bidAmount
                                        }]
                                    }).then(() => {
                                        document.getElementById('bidAmount').value = '';
                                        showModal("Ofertă reușită", "Oferta dvs. a fost trimisă cu succes!", 'bidModal');
                                        console.log('User document created and bid added successfully');
                                    }).catch((error) => {
                                        console.error("Error creating user document: ", error);
                                        showModal("Eroare de ofertă", "A apărut o eroare la crearea contului dvs. Vă rugăm să încercați din nou.", 'bidModal');
                                    });
                                } else {
                                    userDocRef.update({
                                        bids: firebase.firestore.FieldValue.arrayUnion({
                                            vin: vin,
                                            amount: bidAmount
                                        })
                                    }).then(() => {
                                        document.getElementById('bidAmount').value = '';
                                        showModal("Ofertă reușită", "Oferta dvs. a fost trimisă cu succes!", 'bidModal');
                                        console.log('Bid updated and added to user account successfully');
                                    }).catch((error) => {
                                        console.error("Error updating user document: ", error);
                                        showModal("Eroare de ofertă", "A apărut o eroare la actualizarea contului dvs. Vă rugăm să încercați din nou.", 'bidModal');
                                    });
                                }
                            }).catch((error) => {
                                console.error("Error fetching user document: ", error);
                                showModal("Eroare de ofertă", "A apărut o eroare la verificarea contului dvs. Vă rugăm să încercați din nou.", 'bidModal');
                            });
                        }).catch((error) => {
                            console.error("Error updating price: ", error);
                            showModal("Eroare de ofertă", "A apărut o eroare la trimiterea ofertei dvs. Vă rugăm să încercați din nou.", 'bidModal');
                        });
                    } else {
                        showModal("Eroare de ofertă", "Oferta dvs. trebuie să fie mai mare decât prețul curent.", 'bidModal');
                        console.log('Bid amount is not greater than current price');
                    }
                }).catch((error) => {
                    console.error("Error getting document:", error);
                    showModal("Eroare de ofertă", "A apărut o eroare la obținerea informațiilor despre ofertă. Vă rugăm să încercați din nou.", 'bidModal');
                });
            }).catch(function (error) {
                // Handle error
                console.error("Error getting user token:", error);
                showModal("Eroare de ofertă", "A apărut o eroare la autentificare. Vă rugăm să încercați din nou.", 'bidModal');
            });
        } else {
            showModal("Eroare de ofertă", "Utilizatorul nu este autentificat.", 'bidModal');
        }
    }

    function showModal(title, message, modalId) {
        const modalElement = document.getElementById(modalId);
        if (!modalElement) {
            console.error(`Modal with ID ${modalId} not found`);
            return;
        }

        document.getElementById(`${modalId}Label`).textContent = title;
        modalElement.querySelector('.modal-body').textContent = message;

        var myModal = new bootstrap.Modal(modalElement, {
            backdrop: false // This removes the dark background
        });
        myModal.show();

        // Ensure the modal can be closed
        modalElement.addEventListener('hidden.bs.modal', function () {
            // Add any cleanup or reset code here if necessary
        });

        // Check if close button exists before adding event listener
        const closeButton = modalElement.querySelector('.close-modal-button');
        if (closeButton) {
            closeButton.addEventListener('click', () => {
                myModal.hide();
            });
        }

        // Auto close the modal after 5 seconds (5000 milliseconds)
        setTimeout(() => {
            myModal.hide();
        }, 5000);
    }

    // Example close button in the HTML modal structure
    // Assuming you have a button with class 'close-modal-button' in your modal's HTML
    // <button type="button" class="btn btn-secondary close-modal-button" data-bs-dismiss="modal">Close</button>

    function updateTitle(car) {
        const titleElement = document.querySelector('.main__title--page h1');
        if (titleElement) {
            titleElement.textContent = `${car.Brand} ${car.Model}`;
        }
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
        }).slice(0, 37); // Limit to 42 images

        prioritizedImages.forEach(photo => {
            const listItem = document.createElement('div');
            listItem.className = 'swiper-slide';

            const img = document.createElement('img');
            img.src = photo;
            img.alt = `${car.Brand} ${car.Model}`;

            listItem.appendChild(img);
            imagesListElement.appendChild(listItem);
        });

        document.querySelector('.offer__rent').addEventListener('click', placeBid);
    }

    function initializeCarSlider() {
        // Initialize Swiper
        new Swiper('.swiper-container', {
            loop: true,
            navigation: {
                nextEl: '.swiper-button-next',
                prevEl: '.swiper-button-prev',
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            autoplay: {
                delay: 5000,
            },
        });
    }

    function updateOffersAndDetails(car) {
        document.getElementById('currentBid').textContent = `${car.currentPrice} lei`;
        document.getElementById('numOfBids').textContent = car.Num_of_bids;

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
