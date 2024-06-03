import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-auth.js";
import { getFirestore, doc, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.6.10/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAeCIbmss03BOr5keyXporv6LLAkqbnij8",
  authDomain: "webtja-fb215.firebaseapp.com",
  projectId: "webtja-fb215",
  storageBucket: "webtja-fb215.appspot.com",
  messagingSenderId: "642807450348",
  appId: "1:642807450348:web:cd1919fa9dd3cfe9b033c9",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const submitButton = document.getElementById("submit");
const signupButton = document.getElementById("sign-up");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const main = document.getElementById("main");
const createacct = document.getElementById("create-acct");

const signupEmailIn = document.getElementById("email-signup");
const confirmSignupEmailIn = document.getElementById("confirm-email-signup");
const signupPasswordIn = document.getElementById("password-signup");
const confirmSignUpPasswordIn = document.getElementById("confirm-password-signup");
const createacctbtn = document.getElementById("create-acct-btn");
const signInLink = document.querySelector(".signInLink");

const returnBtn = document.getElementById("return-btn");

var email, password, signupEmail, signupPassword, confirmSignupEmail, confirmSignUpPassword;

createacctbtn.addEventListener("click", function() {
  var isVerified = true;

  signupEmail = signupEmailIn.value;
  confirmSignupEmail = confirmSignupEmailIn.value;
  if (signupEmail != confirmSignupEmail) {
    showModal("Eroare", "Câmpurile de e-mail nu se potrivesc. Încercați din nou.");
    isVerified = false;
  }

  signupPassword = signupPasswordIn.value;
  confirmSignUpPassword = confirmSignUpPasswordIn.value;
  if (signupPassword != confirmSignUpPassword) {
    showModal("Eroare", "Câmpurile pentru parolă nu se potrivesc. Încercați din nou.");
    isVerified = false;
  }

  if (signupEmail == null || confirmSignupEmail == null || signupPassword == null || confirmSignUpPassword == null) {
    showModal("Eroare", "Completați toate câmpurile");
    isVerified = false;
  }

  if (isVerified) {
    createUserWithEmailAndPassword(auth, signupEmail, signupPassword)
      .then((userCredential) => {
        const user = userCredential.user;

        // Create a user document in Firestore
        const userDocRef = doc(db, "users", user.uid);
        return setDoc(userDocRef, {
          carsBiddedOn: []
        }).then(() => {
          localStorage.setItem('userRegistered', 'true');
          showModal("Succes", "Cont creat cu succes!");

          setTimeout(() => {
            window.location.href = "index.html";
          }, 800);
        });
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        showModal("Eroare", "A apărut o eroare. Încercați din nou.");
      });
  }
});

submitButton.addEventListener("click", function() {
  email = emailInput.value;
  console.log(email);
  password = passwordInput.value;
  console.log(password);

  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      localStorage.setItem('userRegistered', 'true');
      console.log("Success! Welcome back!"); 
      showModal("Succes", "Bine ai venit înapoi!");
      setTimeout(() => {
        window.location.href = "index.html";
      }, 800); 
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.log("Error occurred. Try again.");
      showModal("Eroare", "A apărut o eroare. Încercați din nou.");
    });
});

signupButton.addEventListener("click", function() {
    main.style.display = "none";
    createacct.style.display = "block";
});

returnBtn.addEventListener("click", function() {
    main.style.display = "block";
    createacct.style.display = "none";
});

function showModal(title, message) {
  document.getElementById('bidModalLabel').textContent = title;
  document.querySelector('#bidModal .modal-body').textContent = message;

  var myModal = new bootstrap.Modal(document.getElementById('bidModal'), {});
  myModal.show();
}
