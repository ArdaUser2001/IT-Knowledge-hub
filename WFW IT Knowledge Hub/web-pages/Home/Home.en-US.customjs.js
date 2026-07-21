 /* ========================================
   WFW Knowledge Hub Theme Toggle
======================================== */

document.addEventListener("DOMContentLoaded", function () {

    const STORAGE_KEY = "wfw-theme";

    const toggleButton = document.createElement("button");

    toggleButton.className = "theme-toggle";
    toggleButton.id = "themeToggle";
    toggleButton.setAttribute("aria-label", "Toggle Theme");

    const savedTheme = localStorage.getItem(STORAGE_KEY);

    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        toggleButton.innerHTML = "☀️";
    } else {
        toggleButton.innerHTML = "🌙";
    }

    toggleButton.addEventListener("click", function () {

        document.body.classList.toggle("dark-mode");

        const darkModeEnabled =
            document.body.classList.contains("dark-mode");

        localStorage.setItem(
            STORAGE_KEY,
            darkModeEnabled ? "dark" : "light"
        );

        toggleButton.innerHTML =
            darkModeEnabled ? "☀️" : "🌙";
    });

    const navbar = document.querySelector(".navbar");

    if (navbar) {

        const wrapper = document.createElement("div");

        wrapper.style.display = "flex";
        wrapper.style.alignItems = "center";
        wrapper.style.marginLeft = "12px";

        wrapper.appendChild(toggleButton);

        navbar.appendChild(wrapper);
    }

});