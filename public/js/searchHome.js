document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('searchButton').addEventListener('click', function () {
      var carName = document.getElementById('carName').value;
      var carPrice = document.getElementById('carPrice').value;
      var carYear = document.getElementById('carYear').value;
  
      var queryString = `?carName=${encodeURIComponent(carName)}&carPrice=${encodeURIComponent(carPrice)}&carYear=${encodeURIComponent(carYear)}`;
      window.location.href = 'activeBids.html' + queryString;
    });
  });
