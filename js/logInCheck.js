var auth = firebase.auth();

document.addEventListener('DOMContentLoaded', function() {
  // Elements
  var authButton = document.getElementById('authButton');
  var authButtonText = document.getElementById('authButtonText');
  var settingsItem = document.getElementById('settingsItem');
  var profileButton = document.getElementById('profileButton');
  var dropdownMenu = document.getElementById('dropdownMenu');

  // Check the authentication state
  auth.onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in
      authButtonText.textContent = 'Deconectare';
      authButton.href = '#';
      authButton.onclick = function(e) {
        e.preventDefault();
        auth.signOut().then(function() {
          showModal('Deconectat cu succes!');
          setTimeout(function() {
            window.location.reload();
          }, 1500);
        }).catch(function(error) {
          console.error('Sign out error', error);
        });
      };
      settingsItem.style.display = 'block';
      profileButton.onclick = function(e) {
        e.preventDefault();
        dropdownMenu.classList.toggle('show');
      };
    } else {
      // No user is signed in
      authButtonText.textContent = 'Autentificare';
      authButton.href = 'signInUp.html';
      authButton.onclick = null;
      settingsItem.style.display = 'none';
      profileButton.onclick = function(e) {
        e.preventDefault();
        window.location.href = 'signInUp.html';
      };
    }
  });
});

function showModal(message) {
  document.querySelector('#logoutModal .modal-body').textContent = message;
  var myModal = new bootstrap.Modal(document.getElementById('logoutModal'));
  myModal.show();
}
