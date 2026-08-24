(function () {
  "use strict";

  var $ = function (id) { return document.getElementById(id); };
  var state = { services: [], extras: [], dirty: false };

  /* ---------------- tabs ---------------- */
  var tabs = [
    { btn: $("tab-prices"), panel: $("panel-prices") },
    { btn: $("tab-photos"), panel: $("panel-photos") }
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

  /* ---------------- load ---------------- */
  function loadContent() {
    fetch("/api/admin/content")
      .then(function (r) {
        if (r.status === 403) throw new Error("You're not signed in as the studio owner. Close this tab and open the admin link again.");
        if (!r.ok) throw new Error("Your services could not be loaded.");
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
        if (!r.ok) throw new Error("Your photos could not be loaded.");
        return r.json();
      })
      .then(function (data) { renderPhotos(data.photos || []); })
      .catch(function (err) {
        $("photos-body").className = "";
        $("photos-body").innerHTML = "";
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
})();
