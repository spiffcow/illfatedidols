/* ============================================================
   ILL-FATED IDOLS — interactions
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Mobile nav toggle ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("nav-menu");

  if (toggle && menu) {
    toggle.addEventListener("click", function () {
      var open = menu.classList.toggle("open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    // Close menu after tapping a link
    menu.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        menu.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* ---------- Current year in footer ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  /* ---------- Scroll reveal ---------- */
  var revealTargets = document.querySelectorAll(
    ".section-title, .about-copy, .about-features, .maker-card, .gallery-item, .gallery-cta, .contact-form, .contact-alt, .section-sub"
  );
  revealTargets.forEach(function (el) { el.classList.add("reveal"); });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach(function (el) { io.observe(el); });
  } else {
    revealTargets.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.getElementById("lightbox");
  var lightboxImg = lightbox ? lightbox.querySelector(".lightbox-img") : null;
  var lightboxCap = lightbox ? lightbox.querySelector(".lightbox-caption") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;

  function openLightbox(src, caption) {
    if (!lightbox || !src) return; // placeholders with no image do nothing
    lightboxImg.src = src;
    lightboxImg.alt = caption || "";
    lightboxCap.textContent = caption || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    lightboxImg.src = "";
    document.body.style.overflow = "";
  }

  document.querySelectorAll(".gallery-item").forEach(function (item) {
    item.addEventListener("click", function () {
      openLightbox(item.getAttribute("data-full"), item.getAttribute("data-caption"));
    });
  });
  if (lightboxClose) lightboxClose.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", function (e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeLightbox();
  });

  /* ---------- Contact form (Formspree AJAX) ---------- */
  var form = document.querySelector(".contact-form");
  var status = form ? form.querySelector(".form-status") : null;

  if (form && status) {
    form.addEventListener("submit", function (e) {
      // If the Formspree endpoint hasn't been configured yet, let the
      // normal POST happen (or surface a hint). Detect placeholder.
      var action = form.getAttribute("action") || "";
      if (action.indexOf("FORMSPREE_ID") !== -1) {
        e.preventDefault();
        status.textContent = "Form not yet connected — add your Formspree ID.";
        status.className = "form-status err";
        return;
      }

      e.preventDefault();
      status.textContent = "Sending…";
      status.className = "form-status";

      var data = new FormData(form);
      fetch(action, {
        method: "POST",
        body: data,
        headers: { Accept: "application/json" }
      })
        .then(function (res) {
          if (res.ok) {
            form.reset();
            status.textContent = "Your message has been received. We will answer in kind.";
            status.className = "form-status ok";
          } else {
            return res.json().then(function (d) {
              throw new Error(d && d.errors ? d.errors.map(function (x) { return x.message; }).join(", ") : "error");
            });
          }
        })
        .catch(function () {
          status.textContent = "Something went wrong. Please email us instead.";
          status.className = "form-status err";
        });
    });
  }
})();
