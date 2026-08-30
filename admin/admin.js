(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var state = { services: [], extras: [], dirty: false };

  /* ---------------- tabs ---------------- */
  var tabs = [
    { btn: $("tab-prices"), panel: $("panel-prices") },
    { btn: $("tab-content"), panel: $("panel-content") },
    { btn: $("tab-photos"), panel: $("panel-photos") },
    { btn: $("tab-reviews"), panel: $("panel-reviews") }
  ];
  tabs.forEach(function (t) {
    t.btn.addEventListener("click", function () {
      tabs.forEach(function (other) {
        var on = other === t;
        other.btn.setAttribute("aria-selected", String(on));
        other.panel.hidden = !on;
      });
      $("savebar").hidden = !(t.panel.id === "panel-prices" && state.dirty);
    });
  });

  /* ---------------- helpers ---------------- */
  function showError(where, message) {
    $(where).innerHTML = '<div class="error">' + message + "</div>";
  }
  function clearError(where) { $(where).innerHTML = ""; }

  function markDirty() {
    state.dirty = true;
    $("savebar").hidden = $("panel-prices").hidden;
    $("savestate").className = "savestate";
    $("savestate").textContent = "You have unsaved changes";
  }

  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  /* ---------------- prices ---------------- */
  function renderServices() {
    var host = $("prices-body");
    host.className = "";
    host.innerHTML = state.services.map(function (s, i) {
      return '' +
      '<div class="card' + (s.hidden ? " is-hidden" : "") + '" data-i="' + i + '">' +
        "<h3>" + esc(s.name) + "</h3>" +
        '<div class="row">' +
          '<div class="field"><label for="p' + i + '">Price</label>' +
          '<input type="text" id="p' + i + '" data-f="price" value="' + esc(s.price) + '"></div>' +
          '<div class="field"><label for="d' + i + '">How long</label>' +
          '<input type="text" id="d' + i + '" data-f="duration" value="' + esc(s.duration) + '"></div>' +
        "</div>" +
        '<div class="field"><label for="t' + i + '">One-line description</label>' +
        '<textarea id="t' + i + '" data-f="tagline">' + esc(s.tagline) + "</textarea></div>" +
        '<label class="toggle"><input type="checkbox" data-f="hidden"' +
          (s.hidden ? " checked" : "") + ">Hide this from the website</label>" +
      "</div>";
    }).join("");

    host.addEventListener("input", onServiceEdit);
    host.addEventListener("change", onServiceEdit);
  }

  function onServiceEdit(e) {
    var field = e.target.getAttribute("data-f");
    if (!field) return;
    var card = e.target.closest(".card");
    var i = Number(card.getAttribute("data-i"));
    state.services[i][field] =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    card.classList.toggle("is-hidden", Boolean(state.services[i].hidden));
    markDirty();
  }

  function renderExtras() {
    var host = $("extras");
    host.innerHTML = state.extras.map(function (x, i) {
      return '' +
      '<div class="extra" data-i="' + i + '">' +
        '<div><label for="xn' + i + '">Item</label>' +
        '<input type="text" id="xn' + i + '" data-f="name" value="' + esc(x.name) + '"></div>' +
        '<div><label for="xp' + i + '">Price</label>' +
        '<input type="text" id="xp' + i + '" data-f="price" value="' + esc(x.price) + '"></div>' +
        '<button class="btn btn--danger" type="button" data-remove="' + i + '">Remove</button>' +
      "</div>";
    }).join("");
  }

  $("extras").addEventListener("input", function (e) {
    var field = e.target.getAttribute("data-f");
    if (!field) return;
    var i = Number(e.target.closest(".extra").getAttribute("data-i"));
    state.extras[i][field] = e.target.value;
    markDirty();
  });

  $("extras").addEventListener("click", function (e) {
    var idx = e.target.getAttribute("data-remove");
    if (idx === null) return;
    state.extras.splice(Number(idx), 1);
    renderExtras();
    markDirty();
  });

  $("add-extra").addEventListener("click", function () {
    state.extras.push({ name: "", price: "" });
    renderExtras();
    markDirty();
  });

  $("save").addEventListener("click", function () {
    var btn = $("save");
    btn.disabled = true;
    $("savestate").className = "savestate";
    $("savestate").textContent = "Saving…";

    fetch("/api/admin/content", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ services: state.services, extras: state.extras })
    })
      .then(function (r) { return r.json().then(function (b) { return { ok: r.ok, b: b }; }); })
      .then(function (res) {
        btn.disabled = false;
        if (!res.ok) throw new Error(res.b.error || "Save failed");
        state.dirty = false;
        $("savestate").className = "savestate ok";
        $("savestate").textContent = "Saved — it's live on the website now";
        setTimeout(function () { $("savebar").hidden = true; }, 2500);
      })
      .catch(function (err) {
        btn.disabled = false;
        $("savestate").className = "savestate bad";
        $("savestate").textContent = err.message + ". Try again.";
      });
  });

  window.addEventListener("beforeunload", function (e) {
    if (state.dirty) { e.preventDefault(); e.returnValue = ""; }
  });

  /* ---------------- photos ---------------- */
  var MAX_EDGE = 1600, QUALITY = 0.82;

  function shrink(file) {
    return new Promise(function (resolve) {
      if (!/^image\//.test(file.type)) return resolve(file);
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function () {
        var scale = Math.min(1, MAX_EDGE / Math.max(img.width, img.height));
        if (scale === 1 && file.size < 900 * 1024) {
          URL.revokeObjectURL(url);
          return resolve(file);
        }
        var c = document.createElement("canvas");
        c.width = Math.round(img.width * scale);
        c.height = Math.round(img.height * scale);
        c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
        c.toBlob(function (blob) {
          URL.revokeObjectURL(url);
          resolve(blob ? new File([blob], "photo.jpg", { type: "image/jpeg" }) : file);
        }, "image/jpeg", QUALITY);
      };
      img.onerror = function () { URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  $("pick").addEventListener("click", function () { $("file").click(); });

  $("file").addEventListener("change", function (e) {
    var files = Array.prototype.slice.call(e.target.files);
    e.target.value = "";
    if (!files.length) return;
    clearError("photos-error");

    var category = $("upload-category").value;
    var queue = $("queue");

    files.reduce(function (chain, file, n) {
      return chain.then(function () {
        var row = document.createElement("div");
        row.className = "queue__item";
        row.innerHTML = '<span>Photo ' + (n + 1) + '</span>' +
                        '<span class="queue__bar"><i style="width:20%"></i></span>' +
                        '<span class="queue__label">preparing…</span>';
        queue.appendChild(row);
        var bar = row.querySelector("i");
        var label = row.querySelector(".queue__label");

        return shrink(file).then(function (small) {
          bar.style.width = "60%";
          label.textContent = "uploading…";
          var fd = new FormData();
          fd.append("file", small);
          fd.append("category", category);
          fd.append("caption", "");
          return fetch("/api/admin/gallery", { method: "POST", body: fd });
        }).then(function (r) {
          return r.json().then(function (b) { return { ok: r.ok, b: b }; });
        }).then(function (res) {
          if (!res.ok) throw new Error(res.b.error || "Upload failed");
          bar.style.width = "100%";
          label.textContent = "done";
          setTimeout(function () { row.remove(); }, 1800);
          loadPhotos();
        }).catch(function (err) {
          bar.style.width = "100%";
          bar.style.background = "#a8443c";
          label.textContent = err.message;
        });
      });
    }, Promise.resolve());
  });

  /* ---------------- where photos show up ---------------- */

  var SLOTS = [
    { key: "hero", label: "Home page banner", hint: "The big photo behind the welcome text" },
    { key: "tileA", label: "Home page — left photo", hint: "Next to \u201cThe studio\u201d" },
    { key: "tileB", label: "Home page — right photo", hint: "Next to \u201cThe studio\u201d" },
    { key: "portrait", label: "Photo of you", hint: "Home page and about page" }
  ];

  var SERVICES = [
    { slug: "signature-facial", name: "Signature Facial", group: "Facials" },
    { slug: "express-facial", name: "Express Facial", group: "Facials" },
    { slug: "acne-treatment-facial", name: "Acne Treatment Facial", group: "Facials" },
    { slug: "chemical-peel", name: "Chemical Peel", group: "Facials" },
    { slug: "waxing", name: "Waxing", group: "Hair removal" },
    { slug: "sugaring", name: "Sugaring", group: "Hair removal" },
    { slug: "lash-extensions", name: "Lash Extensions", group: "Lashes & brows" },
    { slug: "lash-lift-and-tint", name: "Lash Lift & Tint", group: "Lashes & brows" },
    { slug: "brow-lamination", name: "Brow Lamination", group: "Lashes & brows" },
    { slug: "brow-permanent-makeup", name: "Brow Permanent Makeup", group: "Permanent makeup" },
    { slug: "lip-blush", name: "Lip Blush", group: "Permanent makeup" },
    { slug: "fine-line-tattoo", name: "Fine-Line Tattoo", group: "Permanent makeup" }
  ];

  // Everything the picker needs, refreshed on every load.
  var state = { photos: [], slots: {}, services: {}, resolved: {}, resolvedServices: {} };

  function thumb(photo, selected, extra) {
    return '<button type="button" class="pick' + (selected ? " is-picked" : "") + '" ' +
           'data-photo-id="' + esc(photo.id) + '" ' +
           'aria-pressed="' + (selected ? "true" : "false") + '">' +
             '<img src="/img/' + esc(photo.key) + '" alt="' + esc(photo.caption || "Photo") + '" loading="lazy">' +
             (extra ? '<span class="pick__badge">' + esc(extra) + "</span>" : "") +
           "</button>";
  }

  /* ---- the four fixed spots ---- */

  function renderSlots() {
    var host = $("slots-body");
    host.className = "";

    if (!state.photos.length) {
      host.innerHTML = '<div class="empty">Add a photo above and these spots will fill themselves in.</div>';
      return;
    }

    host.innerHTML = SLOTS.map(function (slot) {
      var live = state.resolved[slot.key];
      var pinned = state.slots[slot.key] || "";
      var open = openSlot === slot.key;

      return '' +
      '<div class="spot" data-slot="' + esc(slot.key) + '">' +
        '<div class="spot__head">' +
          (live ? '<img class="spot__now" src="/img/' + esc(live.key) + '" alt="" loading="lazy">' : '<span class="spot__now spot__now--empty"></span>') +
          '<div class="spot__text">' +
            "<h3>" + esc(slot.label) + "</h3>" +
            "<p>" + esc(slot.hint) + "</p>" +
            '<p class="spot__state">' + (pinned ? "You chose this one" : "Chosen automatically") + "</p>" +
          "</div>" +
          '<button type="button" class="btn btn--ghost" data-open-slot>' + (open ? "Close" : "Change") + "</button>" +
        "</div>" +
        (open
          ? '<div class="picker">' +
              '<p class="picker__note">Tap a photo to use it here.</p>' +
              '<div class="picks">' +
                state.photos.map(function (p) { return thumb(p, pinned === p.id, ""); }).join("") +
              "</div>" +
              (pinned ? '<button type="button" class="btn btn--ghost" data-auto>Go back to choosing automatically</button>' : "") +
            "</div>"
          : "") +
        '<span class="flash">Saved</span>' +
      "</div>";
    }).join("");
  }

  var openSlot = null;

  $("slots-body").addEventListener("click", function (e) {
    var spot = e.target.closest("[data-slot]");
    if (!spot) return;
    var slot = spot.getAttribute("data-slot");

    if (e.target.closest("[data-open-slot]")) {
      openSlot = openSlot === slot ? null : slot;
      renderSlots();
      return;
    }

    if (e.target.closest("[data-auto]")) {
      saveSlot(slot, "auto");
      return;
    }

    var pick = e.target.closest("[data-photo-id]");
    if (pick) saveSlot(slot, pick.getAttribute("data-photo-id"));
  });

  function saveSlot(slot, value) {
    clearError("slots-error");
    var payload = {};
    payload[slot] = value;

    put({ slots: payload })
      .then(function (b) {
        state.slots = b.slots || {};
        state.resolved = b.resolved || {};
        openSlot = null;
        renderSlots();
      })
      .catch(function (err) { showError("slots-error", err.message); });
  }

  /* ---- photos on individual service pages ---- */

  var openService = null;

  function renderServices() {
    var host = $("services-body");
    host.className = "";

    if (!state.photos.length) {
      host.innerHTML = '<div class="empty">Once you\u2019ve added photos, you can put them on individual service pages here.</div>';
      return;
    }

    var lastGroup = "";
    host.innerHTML = SERVICES.map(function (svc) {
      var chosen = state.services[svc.slug] || [];
      var open = openService === svc.slug;
      var heading = "";

      if (svc.group !== lastGroup) {
        lastGroup = svc.group;
        heading = '<h3 class="group">' + esc(svc.group) + "</h3>";
      }

      return heading +
      '<div class="spot" data-service="' + esc(svc.slug) + '">' +
        '<div class="spot__head">' +
          '<div class="spot__text">' +
            "<h3>" + esc(svc.name) + "</h3>" +
            '<p class="spot__state">' +
              (chosen.length
                ? chosen.length + (chosen.length === 1 ? " photo on this page" : " photos on this page")
                : "No photos on this page yet") +
            "</p>" +
          "</div>" +
          '<button type="button" class="btn btn--ghost" data-open-service>' + (open ? "Close" : "Choose") + "</button>" +
        "</div>" +
        (open
          ? '<div class="picker">' +
              '<p class="picker__note">Tap photos to add or remove them from this page. The number shows the order they\u2019ll appear in.</p>' +
              '<div class="picks">' +
                state.photos.map(function (p) {
                  var at = chosen.indexOf(p.id);
                  return thumb(p, at > -1, at > -1 ? String(at + 1) : "");
                }).join("") +
              "</div>" +
            "</div>"
          : "") +
        '<span class="flash">Saved</span>' +
      "</div>";
    }).join("");
  }

  $("services-body").addEventListener("click", function (e) {
    var spot = e.target.closest("[data-service]");
    if (!spot) return;
    var slug = spot.getAttribute("data-service");

    if (e.target.closest("[data-open-service]")) {
      openService = openService === slug ? null : slug;
      renderServices();
      return;
    }

    var pick = e.target.closest("[data-photo-id]");
    if (!pick) return;

    var id = pick.getAttribute("data-photo-id");
    var chosen = (state.services[slug] || []).slice();
    var at = chosen.indexOf(id);
    if (at > -1) chosen.splice(at, 1);
    else chosen.push(id);

    clearError("services-error");
    var payload = {};
    payload[slug] = chosen;

    put({ services: payload })
      .then(function (b) {
        state.services = b.services || {};
        renderServices();
      })
      .catch(function (err) { showError("services-error", err.message); });
  });

  function put(body) {
    return fetch("/api/admin/gallery", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body)
    }).then(function (r) {
      return r.json().then(
        function (b) { if (!r.ok) throw new Error(b.error || "That change was not saved."); return b; },
        function () { throw new Error("That change was not saved."); }
      );
    });
  }

  function renderPhotos(photos) {
    var host = $("photos-body");
    host.className = "";
    if (!photos.length) {
      host.innerHTML = '<div class="empty">No photos yet. Use the button above to add your first one.</div>';
      return;
    }
    host.innerHTML = '<div class="photos">' + photos.map(function (p) {
      return '' +
      '<div class="photo" data-id="' + esc(p.id) + '">' +
        '<img src="/img/' + esc(p.key) + '" alt="' + esc(p.caption || "Gallery photo") + '" loading="lazy">' +
        '<div class="photo__body">' +
          '<div class="field"><label>Caption</label>' +
          '<input type="text" data-f="caption" value="' + esc(p.caption) + '" placeholder="Optional"></div>' +
          '<div class="field"><label>Section</label><select data-f="category">' +
            '<option value="before-after"' + (p.category === "before-after" ? " selected" : "") + '>Before &amp; after</option>' +
            '<option value="detail"' + (p.category === "detail" ? " selected" : "") + '>Lashes, brows &amp; finish</option>' +
            '<option value="studio"' + (p.category === "studio" ? " selected" : "") + '>Inside the studio</option>' +
          "</select></div>" +
          '<div class="photo__foot">' +
            '<button class="btn btn--danger" type="button" data-delete>Delete</button>' +
            '<span class="flash">Saved</span>' +
          "</div>" +
        "</div>" +
      "</div>";
    }).join("") + "</div>";
  }

  $("photos-body").addEventListener("change", function (e) {
    var field = e.target.getAttribute("data-f");
    if (!field) return;
    var card = e.target.closest(".photo");
    var flash = card.querySelector(".flash");

    fetch("/api/admin/gallery", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: card.getAttribute("data-id"),
        caption: card.querySelector('[data-f="caption"]').value,
        category: card.querySelector('[data-f="category"]').value
      })
    }).then(function (r) {
      if (!r.ok) throw new Error();
      flash.textContent = "Saved";
      flash.style.color = "";
      flash.classList.add("show");
      setTimeout(function () { flash.classList.remove("show"); }, 1600);
    }).catch(function () {
      flash.textContent = "Not saved";
      flash.style.color = "#a8443c";
      flash.classList.add("show");
    });
  });

  $("photos-body").addEventListener("click", function (e) {
    if (!e.target.hasAttribute("data-delete")) return;
    var card = e.target.closest(".photo");
    if (!confirm("Delete this photo? It will disappear from the website straight away.")) return;
    e.target.disabled = true;

    fetch("/api/admin/gallery?id=" + encodeURIComponent(card.getAttribute("data-id")), {
      method: "DELETE"
    }).then(function (r) {
      if (!r.ok) throw new Error();
      card.remove();
      if (!document.querySelector(".photo")) loadPhotos();
    }).catch(function () {
      e.target.disabled = false;
      showError("photos-error", "That photo could not be deleted. Check your connection and try again.");
    });
  });

  /* ---------------- content (About the studio / Meet Kassie) ---------------- */
  function renderCopy(copy) {
    var host = $("content-body");
    host.className = "";
    var sections = [
      { key: "aboutStudio", label: "About the studio", data: copy.aboutStudio },
      { key: "meetKassie", label: "Meet Kassie", data: copy.meetKassie }
    ];
    host.innerHTML = sections.map(function (s, i) {
      return '' +
      '<div class="card" data-copy-key="' + s.key + '" style="margin-bottom:1.5rem;">' +
        "<h3>" + esc(s.label) + "</h3>" +
        '<div class="field"><label for="cp-h' + i + '">Heading</label>' +
        '<input type="text" id="cp-h' + i + '" data-f="heading" value="' + esc(s.data.heading) + '"></div>' +
        '<div class="field"><label for="cp-b' + i + '">Text</label>' +
        '<textarea id="cp-b' + i + '" data-f="body">' + esc(s.data.body) + "</textarea></div>" +
        '<button class="btn" type="button" data-save-copy="' + s.key + '">Save</button> ' +
        '<span class="flash" data-flash-copy="' + s.key + '">Saved</span>' +
      "</div>";
    }).join("");
  }

  document.addEventListener("click", function (e) {
    var key = e.target.getAttribute && e.target.getAttribute("data-save-copy");
    if (!key) return;
    var card = e.target.closest(".card");
    var heading = card.querySelector('[data-f="heading"]').value;
    var body = card.querySelector('[data-f="body"]').value;
    var flash = card.querySelector("[data-flash-copy]");

    e.target.disabled = true;
    fetch("/api/admin/copy")
      .then(function (r) { return r.json(); })
      .then(function (current) {
        current[key] = { heading: heading, body: body };
        return fetch("/api/admin/copy", {
          method: "PUT",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(current)
        });
      })
      .then(function (r) { if (!r.ok) throw new Error(); return r.json(); })
      .then(function () {
        e.target.disabled = false;
        flash.textContent = "Saved — live on the site now";
        flash.style.color = "";
        flash.classList.add("show");
        setTimeout(function () { flash.classList.remove("show"); }, 2200);
      })
      .catch(function () {
        e.target.disabled = false;
        flash.textContent = "Could not save — try again";
        flash.style.color = "#8a2f24";
        flash.classList.add("show");
      });
  });

  function loadCopy() {
    fetch("/api/admin/copy")
      .then(function (r) {
        if (r.status === 403) throw new Error("You're not signed in as the studio owner. Close this tab and open the admin link again.");
        if (!r.ok) return r.json().then(function (b) { throw new Error(b.error || "Your content could not be loaded."); }, function () { throw new Error("Your content could not be loaded."); });
        return r.json();
      })
      .then(renderCopy)
      .catch(function (err) {
        $("content-body").className = "";
        $("content-body").innerHTML = "";
        showError("content-error", err.message);
      });
  }

  /* ---------------- reviews ---------------- */
  function renderReviews(list) {
    var host = $("reviews-body");
    host.className = "";
    if (!list.length) {
      host.innerHTML = '<div class="empty">No reviews yet.</div>';
      return;
    }
    // Pending first, so anything needing a decision is easy to find
    var sorted = list.slice().sort(function (a, b) {
      return (a.approved === b.approved) ? 0 : (a.approved ? 1 : -1);
    });
    host.innerHTML = sorted.map(function (t) {
      return '' +
      '<div class="card' + (t.approved ? "" : " is-hidden") + '" data-id="' + esc(t.id) + '" style="margin-bottom:1rem;">' +
        '<div class="field"><label>Name</label>' +
        '<input type="text" data-f="author" value="' + esc(t.author) + '"></div>' +
        '<div class="field"><label>Review</label>' +
        '<textarea data-f="quote">' + esc(t.quote) + "</textarea></div>" +
        '<div class="photo__foot">' +
          "<span>" + (t.approved ? "Live on site" : "Pending — not shown yet") +
            (t.source === "client" ? " · from a client" : " · added by you") + "</span>" +
          "<span>" +
            '<button class="btn btn--ghost" type="button" data-approve="' + (!t.approved) + '">' +
              (t.approved ? "Unpublish" : "Approve") + "</button> " +
            '<button class="btn btn--danger" type="button" data-delete-review>Delete</button>' +
          "</span>" +
        "</div>" +
      "</div>";
    }).join("");
  }

  $("panel-reviews").addEventListener("click", function (e) {
    var card = e.target.closest(".card[data-id]");
    if (!card) return;
    var id = card.getAttribute("data-id");

    if (e.target.hasAttribute("data-approve")) {
      var approved = e.target.getAttribute("data-approve") === "true";
      var author = card.querySelector('[data-f="author"]').value;
      var quote = card.querySelector('[data-f="quote"]').value;
      e.target.disabled = true;
      fetch("/api/admin/testimonials", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id: id, approved: approved, author: author, quote: quote })
      }).then(function () { loadReviews(); }).catch(function () { e.target.disabled = false; });
    }

    if (e.target.hasAttribute("data-delete-review")) {
      if (!confirm("Delete this review permanently?")) return;
      e.target.disabled = true;
      fetch("/api/admin/testimonials?id=" + encodeURIComponent(id), { method: "DELETE" })
        .then(function () { loadReviews(); })
        .catch(function () { e.target.disabled = false; });
    }
  });

  $("rv-add").addEventListener("click", function () {
    var author = $("rv-author").value.trim();
    var quote = $("rv-quote").value.trim();
    if (!author || !quote) return;
    $("rv-add").disabled = true;
    fetch("/api/admin/testimonials", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ author: author, quote: quote })
    })
      .then(function () {
        $("rv-add").disabled = false;
        $("rv-author").value = "";
        $("rv-quote").value = "";
        loadReviews();
      })
      .catch(function () { $("rv-add").disabled = false; });
  });

  function loadReviews() {
    fetch("/api/admin/testimonials")
      .then(function (r) {
        if (r.status === 403) throw new Error("You're not signed in as the studio owner. Close this tab and open the admin link again.");
        if (!r.ok) return r.json().then(function (b) { throw new Error(b.error || "Reviews could not be loaded."); }, function () { throw new Error("Reviews could not be loaded."); });
        return r.json();
      })
      .then(function (data) { renderReviews(data.testimonials || []); })
      .catch(function (err) {
        $("reviews-body").className = "";
        $("reviews-body").innerHTML = "";
        showError("reviews-error", err.message);
      });
  }

  /* ---------------- load ---------------- */
  function loadContent() {
    fetch("/api/admin/content")
      .then(function (r) {
        if (r.status === 403) throw new Error("You're not signed in as the studio owner. Close this tab and open the admin link again.");
        if (!r.ok) return r.json().then(function (b) { throw new Error(b.error || "Your services could not be loaded."); }, function () { throw new Error("Your services could not be loaded."); });
        return r.json();
      })
      .then(function (data) {
        state.services = data.services;
        state.extras = data.extras;
        renderServices();
        renderExtras();
      })
      .catch(function (err) {
        $("prices-body").className = "";
        $("prices-body").innerHTML = "";
        showError("prices-error", err.message);
      });
  }

  function loadPhotos() {
    fetch("/api/admin/gallery")
      .then(function (r) {
        if (r.status === 403) throw new Error("You're not signed in as the studio owner. Close this tab and open the admin link again.");
        if (!r.ok) return r.json().then(function (b) { throw new Error(b.error || "Your photos could not be loaded."); }, function () { throw new Error("Your photos could not be loaded."); });
        return r.json();
      })
      .then(function (data) {
        state.photos = data.photos || [];
        state.slots = data.slots || {};
        state.services = data.services || {};
        state.resolved = data.resolved || {};
        state.resolvedServices = data.resolvedServices || {};

        renderPhotos(state.photos);
        renderSlots();
        renderServices();
      })
      .catch(function (err) {
        $("photos-body").className = "";
        $("photos-body").innerHTML = "";
        $("slots-body").className = "";
        $("slots-body").innerHTML = "";
        $("services-body").className = "";
        $("services-body").innerHTML = "";
        showError("photos-error", err.message);
      });
  }

  // Cloudflare Access puts the signed-in email in a cookie-backed endpoint;
  // the API echoes it back on save, so just show a friendly placeholder here.
  fetch("/cdn-cgi/access/get-identity")
    .then(function (r) { return r.ok ? r.json() : null; })
    .then(function (id) { if (id && id.email) $("who").textContent = id.email; })
    .catch(function () {});

  loadContent();
  loadPhotos();
  loadCopy();
  loadReviews();
})();
