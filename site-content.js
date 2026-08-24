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
})();
