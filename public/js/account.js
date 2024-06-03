document.addEventListener('DOMContentLoaded', function () {
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
    const carList = document.getElementById('cars_container');

    auth.onAuthStateChanged((user) => {
        if (user) {
            const userId = user.uid;
            const userDocRef = db.collection('users').doc(userId);

            userDocRef.get().then((doc) => {
                if (doc.exists) {
                    const userData = doc.data();
                    const bids = userData.bids || [];

                    if (bids.length > 0) {
                        carList.innerHTML = ''; // Clear the list before adding items
                        bids.forEach((bid) => {
                            db.collection('cars').doc(bid.vin).get().then((carDoc) => {
                                if (carDoc.exists) {
                                    const carData = carDoc.data();
                                    renderCarCard(carData, bid);
                                } else {
                                    console.error('Car document not found');
                                }
                            }).catch((error) => {
                                console.error('Error fetching car document:', error);
                            });
                        });
                    } else {
                        carList.innerHTML = '<div>No cars bidded on yet.</div>';
                    }
                } else {
                    console.error('User document not found');
                }
            }).catch((error) => {
                console.error('Error fetching user document:', error);
            });
        } else {
            // Handle user not logged in
            carList.innerHTML = '<div>Vă rugăm să vă conectați pentru a vedea licitațiile la care participați.</div>';
        }
    });

    function renderCarCard(car, bid) {
        const carDetailUrl = `car.html?vin=${encodeURIComponent(bid.vin)}`;
        const cardHTML = `
            <div class="cart__card" data-href="${carDetailUrl}">
                <!-- <div class="cart__img"><img src="${car.imageUrls ? car.imageUrls[0] : ''}" alt="${car.Brand} ${car.Model}"></div> -->
                <div class="cart__details">
                    <div class="cart__name">${car.Brand} ${car.Model}</div>
                    <div class="cart__price-row">
                        <div class="cart__current-price"><div class="price-container">Preț curent: ${car.currentPrice}<span> lei</span></div></div>
                        <div class="cart__price"><div class="price-container">Oferta dvs.: ${bid.amount}<span> lei</span></div></div>
                    </div>
                </div>
            </div>
        `;
        carList.insertAdjacentHTML('beforeend', cardHTML);

        // Add click event listener to the newly added card
        const newCard = carList.lastElementChild;
        newCard.addEventListener('click', function () {
            window.location.href = this.getAttribute('data-href');
        });
    }
});
