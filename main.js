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
    ".section-title, .about-copy, .about-features, .maker-card, .gallery-item, .lamp-item, .gallery-cta, .contact-form, .contact-alt, .section-sub"
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
  var lightboxDesc = lightbox ? lightbox.querySelector(".lightbox-desc") : null;
  var lightboxClose = lightbox ? lightbox.querySelector(".lightbox-close") : null;

  function openLightbox(src, caption, desc) {
    if (!lightbox || !src) return; // placeholders with no image do nothing
    lightboxImg.src = src;
    lightboxImg.alt = caption || "";
    lightboxCap.textContent = caption || "";
    if (lightboxDesc) lightboxDesc.textContent = desc || "";
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

  // Gallery images are static — only the lamps still open the lightbox.
  document.querySelectorAll(".lamp-item").forEach(function (item) {
    item.addEventListener("click", function () {
      openLightbox(item.getAttribute("data-full"), item.getAttribute("data-caption"), item.getAttribute("data-desc"));
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

  /* ---------- Lamp video autoplay (mobile-friendly) ---------- */
  // Mobile browsers won't autoplay muted <video> reliably from markup alone.
  // Force muted + inline, play when scrolled into view, and allow tap-to-toggle
  // as a fallback (covers iOS Low Power Mode, which blocks autoplay entirely).
  var lampVideos = document.querySelectorAll(".lamp-video video");
  lampVideos.forEach(function (v) {
    v.muted = true;
    v.setAttribute("muted", "");
    v.playsInline = true;
    function tryPlay() {
      var p = v.play();
      if (p && p.catch) p.catch(function () {}); // ignore autoplay rejections
    }
    if ("IntersectionObserver" in window) {
      var vio = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) tryPlay(); else v.pause();
        });
      }, { threshold: 0.25 });
      vio.observe(v);
    } else {
      tryPlay();
    }
    v.addEventListener("click", function () {
      if (v.paused) tryPlay(); else v.pause();
    });
  });

  /* ---------- Contact form (Web3Forms background submit → contact@illfatedidols.com) ---------- */
  var form = document.querySelector(".contact-form");
  var status = form ? form.querySelector(".form-status") : null;

  if (form && status) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var nameEl = document.getElementById("name");
      var emailEl = document.getElementById("email");
      var msgEl = document.getElementById("message");
      if (!(nameEl && nameEl.value.trim()) ||
          !(emailEl && emailEl.value.trim()) ||
          !(msgEl && msgEl.value.trim())) {
        status.textContent = "Please fill in every field first.";
        status.className = "form-status err";
        return;
      }

      var btn = form.querySelector("button[type=submit]");
      if (btn) btn.disabled = true;
      status.textContent = "Sending…";
      status.className = "form-status";

      fetch(form.action, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form)
      })
        .then(function (res) { return res.json().then(function (d) { return { ok: res.ok, d: d }; }); })
        .then(function (r) {
          if (r.ok && r.d && r.d.success) {
            form.reset();
            status.textContent = "Your message has crossed the void. We'll answer soon.";
            status.className = "form-status ok";
          } else {
            throw new Error((r.d && r.d.message) || "error");
          }
        })
        .catch(function () {
          status.textContent = "Something went wrong — please email contact@illfatedidols.com instead.";
          status.className = "form-status err";
        })
        .then(function () { if (btn) btn.disabled = false; });
    });
  }
})();
