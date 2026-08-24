/**
 * Skin by Kassie — live content.
 *
 * The pages ship with the last-published prices baked into the HTML, so the
 * site is complete and readable before this runs (and if it never runs at all,
 * or JavaScript is off, nothing looks broken). This just refreshes anything
 * Kassie has changed since the last deploy.
 */

(function () {
  "use strict";

  /* ---------------- prices, durations, taglines ---------------- */

  fetch("/api/content", { headers: { accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !Array.isArray(data.services)) return;

      var bySlug = {};
      data.services.forEach(function (s) { bySlug[s.slug] = s; });

      // Text fields: <span data-svc="waxing" data-field="price">
      Array.prototype.forEach.call(
        document.querySelectorAll("[data-svc][data-field]"),
        function (el) {
          var s = bySlug[el.getAttribute("data-svc")];
          if (!s) return;
          var field = el.getAttribute("data-field");
          var value = field === "meta"
            ? [s.price, s.duration].filter(Boolean).join(" · ")
            : s[field];
          if (typeof value === "string" && value.trim()) {
            el.textContent = value;
          }
        }
      );

      // Anything belonging to a hidden service comes off the page entirely.
      Array.prototype.forEach.call(
        document.querySelectorAll("[data-svc-block]"),
        function (el) {
          var s = bySlug[el.getAttribute("data-svc-block")];
          if (s && s.hidden) {
            var li = el.closest("li");
            (li || el).remove();
          }
        }
      );

      renderExtras(data.extras || []);
    })
    .catch(function () { /* keep the built-in values */ });

  function renderExtras(extras) {
    var host = document.querySelector("[data-extras]");
    if (!host) return;
    if (!extras.length) { host.remove(); return; }

    var list = host.querySelector("[data-extras-list]");
    if (!list) return;

    list.innerHTML = extras.map(function (x) {
      return '<div class="menu__item">' +
        '<span class="menu__name"></span>' +
        '<span class="menu__price"></span>' +
        "</div>";
    }).join("");

    // Set text separately so nothing from the API is ever parsed as HTML.
    Array.prototype.forEach.call(list.children, function (row, i) {
      row.querySelector(".menu__name").textContent = extras[i].name;
      row.querySelector(".menu__price").textContent = extras[i].price;
    });

    host.hidden = false;
  }

  /* ---------------- gallery photos ---------------- */

  var galleries = document.querySelectorAll("[data-gallery]");
  if (!galleries.length) return;

  fetch("/api/gallery", { headers: { accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data || !Array.isArray(data.photos) || !data.photos.length) return;

      Array.prototype.forEach.call(galleries, function (host) {
        var category = host.getAttribute("data-gallery");
        var mine = data.photos.filter(function (p) { return p.category === category; });
        if (!mine.length) return; // leave the placeholders in place

        host.innerHTML = "";
        mine.forEach(function (p) {
          var fig = document.createElement("figure");
          fig.className = "shot";

          var img = document.createElement("img");
          img.src = "/img/" + p.key;
          img.loading = "lazy";
          img.alt = p.caption || "Skin by Kassie gallery photo";
          fig.appendChild(img);

          if (p.caption) {
            var cap = document.createElement("figcaption");
            cap.textContent = p.caption;
            fig.appendChild(cap);
          }
          host.appendChild(fig);
        });
      });
    })
    .catch(function () { /* placeholders stay */ });

  /* ---------------- about / bio copy ---------------- */

  fetch("/api/copy", { headers: { accept: "application/json" } })
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (data) {
      if (!data) return;
      Array.prototype.forEach.call(
        document.querySelectorAll("[data-copy][data-field]"),
        function (el) {
          var section = data[el.getAttribute("data-copy")];
          var field = el.getAttribute("data-field");
          if (section && typeof section[field] === "string" && section[field].trim()) {
            el.textContent = section[field];
          }
        }
      );
    })
    .catch(function () { /* built-in copy stays */ });

  /* ---------------- testimonials ---------------- */

  var testimonialHost = document.querySelector("[data-testimonials]");
  if (testimonialHost) {
    fetch("/api/testimonials", { headers: { accept: "application/json" } })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (data) {
        if (!data || !Array.isArray(data.testimonials) || !data.testimonials.length) return;

        testimonialHost.innerHTML = "";
        data.testimonials.forEach(function (t) {
          var fig = document.createElement("figure");
          fig.className = "quote reveal is-visible";

          var bq = document.createElement("blockquote");
          bq.textContent = t.quote;
          fig.appendChild(bq);

          var cap = document.createElement("figcaption");
          cap.textContent = t.author;
          fig.appendChild(cap);

          testimonialHost.appendChild(fig);
        });
      })
      .catch(function () { /* built-in placeholder testimonial stays */ });
  }

  /* ---------------- review submission form ---------------- */

  var reviewForm = document.getElementById("review-form");
  if (reviewForm) {
    reviewForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var status = document.getElementById("review-status");
      var button = reviewForm.querySelector("button[type=submit]");

      var payload = {
        author: reviewForm.author.value,
        rating: parseInt(reviewForm.rating.value, 10),
        quote: reviewForm.quote.value,
        website: reviewForm.website.value // honeypot
      };

      button.disabled = true;
      status.textContent = "Sending…";
      status.style.color = "";

      fetch("/api/testimonials", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
        .then(function (res) {
          button.disabled = false;
          if (!res.ok) throw new Error(res.b.error || "That didn't go through.");
          reviewForm.reset();
          status.textContent = "Thank you — your review is on its way to Kassie for a quick look before it goes live.";
        })
        .catch(function (err) {
          button.disabled = false;
          status.textContent = err.message + " Please try again.";
          status.style.color = "#8a2f24";
        });
    });
  }
})();
