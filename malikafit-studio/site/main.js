(function () {
  "use strict";

  function navigateWithButtons() {
    document.querySelectorAll("[data-nav]").forEach(function (el) {
      el.addEventListener("click", function () {
        var target = el.getAttribute("data-nav");
        if (target) window.location.href = target;
      });
    });
  }

  /** Grille dynamique si présente (listing HTTP du dossier ; optionnel). */
  async function renderTransformationImages() {
    var grid = document.getElementById("transformation-grid");
    if (!grid || typeof getImagesFromFolder !== "function") return;

    try {
      var images = await getImagesFromFolder("assets/images/transformation/");
      grid.innerHTML = "";
      images.forEach(function (src) {
        var img = document.createElement("img");
        img.src = src;
        img.alt = "Transformation";
        grid.appendChild(img);
      });
    } catch (e) {
      grid.innerHTML = "<p>Impossible de charger les images pour le moment.</p>";
      console.error(e);
    }
  }

  function initContactForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var nom = (form.querySelector("#nom") || {}).value || "";
      var email = (form.querySelector("#email") || {}).value || "";
      if (!String(nom).trim() || !String(email).trim()) return;
      alert("Merci " + nom.trim() + " — ta demande a bien été enregistrée. Nous te recontactons très bientôt.");
      form.reset();
    });
  }

  function initHeaderScroll() {
    if (!document.querySelector(".mf-header__bar")) return;
    function onScroll() {
      var y = window.scrollY || document.documentElement.scrollTop;
      if (y > 12) document.documentElement.classList.add("mf-header--scrolled");
      else document.documentElement.classList.remove("mf-header--scrolled");
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  document.addEventListener("DOMContentLoaded", function () {
    navigateWithButtons();
    renderTransformationImages();
    initContactForm();
    initHeaderScroll();
  });
})();
