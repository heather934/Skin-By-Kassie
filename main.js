/* Skin by Kassie — dropdown menu + scroll reveal */

(function () {
  "use strict";

  var btn   = document.getElementById("menu-btn");
  var menu  = document.getElementById("site-menu");
  var scrim = document.querySelector(".scrim");

  if (btn && menu) {
    var setOpen = function (open) {
      menu.setAttribute("data-open", String(open));
      btn.setAttribute("aria-expanded", String(open));
      btn.setAttribute("aria-label", open ? "Close menu" : "Open menu");

      if (scrim) {
        scrim.hidden = false;
        scrim.setAttribute("data-open", String(open));
      }
      document.body.classList.toggle("is-locked", open);

      if (open) {
        var first = menu.querySelector("a, summary");
        if (first) { first.focus(); }
      }
    };

    var isOpen = function () {
      return menu.getAttribute("data-open") === "true";
    };

    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      setOpen(!isOpen());
    });

    if (scrim) {
      scrim.addEventListener("click", function () { setOpen(false); });
    }

    // Close on Escape, return focus to the button
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && isOpen()) {
        setOpen(false);
        btn.focus();
      }
    });

    // Close when clicking anywhere outside the panel
    document.addEventListener("click", function (e) {
      if (isOpen() && !menu.contains(e.target) && !btn.contains(e.target)) {
        setOpen(false);
      }
    });

    // Close when focus leaves the panel entirely (keyboard tabbing out)
    document.addEventListener("focusin", function (e) {
      if (isOpen() && !menu.contains(e.target) && !btn.contains(e.target)) {
        setOpen(false);
      }
    });
  }

  // Hide the fixed mobile "Book now" bar while the hero's own Book button
  // is already on screen — avoids two Book Now buttons stacked a few
  // inches apart the moment the page loads. Pages without a hero (every
  // interior page) simply skip this; the bar behaves as always there.
  var heroBtn = document.querySelector(".hero .btn");
  var mobileBook = document.querySelector(".mobile-book");
  if (heroBtn && mobileBook && "IntersectionObserver" in window) {
    var heroObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        mobileBook.classList.toggle("is-redundant", entry.isIntersecting);
      });
    }, { threshold: 0.3 });
    heroObserver.observe(heroBtn);
  }

  // Scroll reveal
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var items = document.querySelectorAll(".reveal");

  if (reduced || !("IntersectionObserver" in window)) {
    Array.prototype.forEach.call(items, function (el) {
      el.classList.add("is-visible");
    });
    return;
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });

  Array.prototype.forEach.call(items, function (el) { observer.observe(el); });
})();
