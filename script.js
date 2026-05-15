const observerOptions = {
  threshold: 0.15, //  animation starts when 15% of the section is visible
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("active");
    }
  });
}, observerOptions);

// target all sections that have the 'reveal' class
document.querySelectorAll(".reveal").forEach((section) => {
  observer.observe(section);
});
const menuBtn = document.getElementById("menu-btn");
const mobileMenu = document.getElementById("mobile-menu");

menuBtn.addEventListener("click", () => {
  menuBtn.classList.toggle("active");
  mobileMenu.classList.toggle("open");
});

// Close menu when a link is clicked
const navLinks = document.querySelectorAll(".mobile-link");
navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    menuBtn.classList.remove("active");
    mobileMenu.classList.remove("open");
  });
});
