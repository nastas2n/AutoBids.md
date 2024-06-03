import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js';
import { getFirestore, collection, getDocs } from 'https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js';


const firebaseConfig = {
    apiKey: "AIzaSyAeCIbmss03BOr5keyXporv6LLAkqbnij8",
    authDomain: "webtja-fb215.firebaseapp.com",
    projectId: "webtja-fb215",
    storageBucket: "webtja-fb215.appspot.com",
    messagingSenderId: "642807450348",
    appId: "1:642807450348:web:cd1919fa9dd3cfe9b033c9"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app);


async function fetchAllDocuments() {
    const querySnapshot = await getDocs(collection(db, 'cars'));
    const cars = [];
    querySnapshot.forEach((doc) => {
        console.log(doc.id, " => ", doc.data());
        cars.push({ id: doc.id, ...doc.data() });
    });
    document.getElementById('data').textContent = JSON.stringify(cars, null, 2);
}

window.addEventListener('DOMContentLoaded', () => {
    fetchAllDocuments().catch(console.error);
});
