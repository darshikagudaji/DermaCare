const menuToggle = document.getElementById("menuToggle");
const mobileSidebar = document.getElementById("mobileSidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

function openMenu() {

    mobileSidebar.classList.add("active");
    sidebarOverlay.classList.add("active");

    const icon = menuToggle.querySelector("i");

    icon.classList.remove("bi-list");
    icon.classList.add("bi-x-lg");

    menuToggle.setAttribute("aria-label", "Close menu");
    menuToggle.setAttribute("aria-expanded", "true");
}

function closeMenu() {

    mobileSidebar.classList.remove("active");
    sidebarOverlay.classList.remove("active");

    const icon = menuToggle.querySelector("i");

    icon.classList.remove("bi-x-lg");
    icon.classList.add("bi-list");

    menuToggle.setAttribute("aria-label", "Open menu");
    menuToggle.setAttribute("aria-expanded", "false");
}

menuToggle.addEventListener("click", function () {

    if (mobileSidebar.classList.contains("active")) {

        closeMenu();

    } else {

        openMenu();

    }

});

sidebarOverlay.addEventListener("click", function () {

    closeMenu();

});

mobileSidebar.querySelectorAll(".mobile-nav a").forEach(function (link) {

    link.addEventListener("click", function () {

        closeMenu();

    });

});

document.addEventListener("keydown", function (event) {

    if (event.key === "Escape") {

        closeMenu();

    }

});

window.addEventListener("resize", function () {

    if (window.innerWidth > 768) {

        closeMenu();

    }

});