document.addEventListener("DOMContentLoaded", function() {
    const passwordForm = document.getElementById("passwordForm");
    const contentTabs = document.getElementById("contentTabs");
    const licitatileMele = document.getElementById("licitatileMele");

    const showPasswordForm = document.getElementById("showPasswordForm");
    const showContentTabs = document.getElementById("showContentTabs");
    const showLicitatileMele = document.getElementById("showLicitatileMele");

    if (showPasswordForm) {
        showPasswordForm.addEventListener("click", function() {
            passwordForm.style.display = "block";
            contentTabs.style.display = "none";
            if (licitatileMele) licitatileMele.style.display = "none"; // Ascundeți alte secțiuni dacă este necesar
        });
    }

    if (showContentTabs) {
        showContentTabs.addEventListener("click", function() {
            contentTabs.style.display = "block";
            passwordForm.style.display = "none";
            if (licitatileMele) licitatileMele.style.display = "none"; // Ascundeți alte secțiuni dacă este necesar
        });
    }

    if (showLicitatileMele) {
        showLicitatileMele.addEventListener("click", function() {
            if (licitatileMele) licitatileMele.style.display = "block";
            contentTabs.style.display = "none";
            passwordForm.style.display = "none";
        });
    }
});
