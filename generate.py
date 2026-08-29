#!/usr/bin/env python3
"""
SkinByKLB site generator.

Writes every .html page from one set of templates plus the SERVICES data below.
The header/footer markup lives here once instead of being copy-pasted into
thirteen files, so nav changes mean editing this script and re-running it.

    python3 generate.py

Output goes to ../site (or OUT_DIR below).

WARNING (2026-08-29): this generator is now OUT OF DATE. The HTML in this repo
has been edited directly since it was last run — live copy hooks, the gallery
containers and the photo slots are all in the .html files but not in here. It
writes to a sandbox path that no longer exists, so running it won't overwrite
anything, but do NOT treat it as the source of truth. Edit the .html files.
"""

import os
import re
import shutil

OUT_DIR = os.environ.get("OUT_DIR", "/mnt/user-data/outputs/skinbyklb")

# ---------------------------------------------------------------- service data

SERVICES = [
    {
        "slug": "signature-facial",
        "name": "Signature Facial",
        "category": "Facials",
        "price": "$00",
        "duration": "60 min",
        "tagline": "A full reset, built around whatever your skin is doing this week.",
        "intro": [
            "Placeholder copy. The signature facial is the one to book if you're not sure "
            "where to start. It covers a double cleanse, exfoliation, extractions where "
            "they're needed, a mask chosen on the day, and a massage that isn't rushed.",
            "Nothing is decided before you arrive. The products change based on what your "
            "skin needs, which is why this works for most people regardless of skin type.",
        ],
        "includes": [
            "Skin consultation and analysis",
            "Double cleanse and gentle exfoliation",
            "Extractions, if your skin needs them",
            "Custom mask and serum",
            "Facial and décolleté massage",
            "Aftercare plan you can actually follow",
        ],
        "good_for": [
            "First-time facial clients",
            "Skin that feels dull, congested or generally off",
            "Anyone wanting a maintenance appointment every four to six weeks",
        ],
        "aftercare": "Skip actives for 48 hours and wear sunscreen daily. You may see a small "
                     "purge in the first week if extractions were heavy — that's normal.",
        "related": ["express-facial", "acne-treatment-facial", "chemical-peel"],
    },
    {
        "slug": "express-facial",
        "name": "Express Facial",
        "category": "Facials",
        "price": "$00",
        "duration": "30 min",
        "tagline": "A short reset for a lunch break or the day before something important.",
        "intro": [
            "Placeholder copy. The express facial covers the essentials — cleanse, "
            "exfoliation, a quick mask and moisturiser — without the massage and the longer "
            "extraction work.",
            "It's the right call when you want your skin to look good on Friday and you only "
            "have half an hour on Thursday.",
        ],
        "includes": [
            "Cleanse and exfoliation",
            "Light extractions if time allows",
            "Hydrating mask",
            "SPF to finish",
        ],
        "good_for": [
            "Pre-event prep",
            "Regulars topping up between signature facials",
            "Anyone short on time",
        ],
        "aftercare": "No downtime. You can wear makeup the same day if you need to.",
        "related": ["signature-facial", "chemical-peel", "lash-lift-and-tint"],
    },
    {
        "slug": "acne-treatment-facial",
        "name": "Acne Treatment Facial",
        "category": "Facials",
        "price": "$00",
        "duration": "75 min",
        "tagline": "Deep-cleansing and extraction focused. Best booked as a short series.",
        "intro": [
            "Placeholder copy. This is the longest facial on the menu because extractions "
            "take time to do properly. The goal is to clear congestion without damaging the "
            "skin around it.",
            "One appointment helps. Three or four spaced two weeks apart is where you'll "
            "actually see the change — and part of the appointment is working out what's "
            "causing the breakouts in the first place.",
        ],
        "includes": [
            "Detailed consultation about routine, diet and hormones",
            "Steam and thorough extractions",
            "Anti-inflammatory treatment mask",
            "High-frequency or LED, depending on your skin",
            "A written routine to follow at home",
        ],
        "good_for": [
            "Persistent congestion, blackheads and closed comedones",
            "Teen and adult acne",
            "Anyone who's tried a lot of products with no result",
        ],
        "aftercare": "Expect some redness for a few hours. Don't pick, and hold off on "
                     "exfoliants for five days.",
        "related": ["signature-facial", "chemical-peel", "express-facial"],
    },
    {
        "slug": "chemical-peel",
        "name": "Chemical Peel",
        "category": "Facials",
        "price": "$00",
        "duration": "45 min",
        "tagline": "Strength chosen at consultation. Real results, honest downtime.",
        "intro": [
            "Placeholder copy. Peels resurface the top layer of skin to soften texture, fade "
            "dark marks and clear congestion. Strength is decided in person, never booked "
            "blind.",
            "If you've never had one, you'll start light. There's no benefit to going hard on "
            "the first appointment.",
        ],
        "includes": [
            "Patch test and consultation",
            "Prepped cleanse and degrease",
            "Peel applied and monitored",
            "Neutralise, soothe and SPF",
            "Post-peel kit guidance",
        ],
        "good_for": [
            "Post-acne marks and uneven tone",
            "Fine lines and rough texture",
            "Sun damage",
        ],
        "aftercare": "Peeling usually starts on day two or three and lasts up to a week. Daily "
                     "SPF isn't optional here. No retinol for a week either side.",
        "related": ["signature-facial", "acne-treatment-facial", "express-facial"],
    },
    {
        "slug": "waxing",
        "name": "Waxing",
        "category": "Hair removal",
        "price": "From $00",
        "duration": "10–45 min",
        "tagline": "Brows, face and body — hard wax or soft, depending on the area.",
        "intro": [
            "Placeholder copy. Every area gets the wax that suits it. Hard wax for sensitive "
            "skin and coarser hair, soft wax where speed matters and the skin can take it.",
            "Brows are shaped to your face rather than a template, then tidied with tweezers "
            "so the edge is clean.",
        ],
        "includes": [
            "Brow shaping — $00",
            "Lip or chin — $00",
            "Full face — $00",
            "Underarm — $00",
            "Half or full leg — from $00",
            "Bikini services — from $00",
        ],
        "good_for": [
            "Anyone maintaining a regular three-to-four week schedule",
            "First-time waxers who want it explained as it goes",
        ],
        "aftercare": "No heat, sweat or sun for 24 hours. Exfoliate gently from day three to "
                     "keep ingrowns down.",
        "related": ["brow-lamination", "lash-lift-and-tint", "signature-facial"],
    },
    {
        "slug": "lash-lift-and-tint",
        "name": "Lash Lift & Tint",
        "category": "Lashes & brows",
        "price": "$00",
        "duration": "60 min",
        "tagline": "Your own lashes, lifted at the root. Roughly six weeks, no upkeep.",
        "intro": [
            "Placeholder copy. A lift curls your natural lashes from the base and a tint "
            "darkens them, so you get the open-eye effect without extensions or daily mascara.",
            "It's the low-maintenance option — nothing to fill, nothing to brush, and no "
            "adhesive.",
        ],
        "includes": [
            "Lash mapping for your eye shape",
            "Lifting and setting solutions",
            "Tint in your chosen depth",
            "Nourishing treatment to finish",
        ],
        "good_for": [
            "Straight or downward-growing lashes",
            "Anyone who doesn't want the upkeep of extensions",
            "Holidays and travel",
        ],
        "aftercare": "Keep them dry for 24 hours and avoid oil-based cleansers around the eyes.",
        "related": ["lash-extensions", "brow-lamination", "waxing"],
    },
    {
        "slug": "lash-extensions",
        "name": "Lash Extensions",
        "category": "Lashes & brows",
        "price": "$00 full set · $00 fill",
        "duration": "120 min · 60 min fill",
        "tagline": "Mapped to your eye shape so they still read as your lashes.",
        "intro": [
            "Placeholder copy. A classic set places one extension on each natural lash. The "
            "length and curl are mapped to your eye shape rather than applied uniformly, "
            "which is the difference between subtle and obvious.",
            "Fills are booked every two to three weeks. Leave it longer and it becomes a new "
            "set.",
        ],
        "includes": [
            "Consultation and lash mapping",
            "Classic one-to-one application",
            "Under-eye care throughout",
            "Aftercare brush and instructions",
        ],
        "good_for": [
            "Anyone wanting a done look without daily makeup",
            "Weddings and events — book the trial early",
        ],
        "aftercare": "No water or steam for 24 hours. Brush daily, don't pick, and book your "
                     "fill within three weeks.",
        "related": ["lash-lift-and-tint", "brow-lamination", "signature-facial"],
    },
    {
        "slug": "brow-lamination",
        "name": "Brow Lamination",
        "category": "Lashes & brows",
        "price": "$00",
        "duration": "45 min",
        "tagline": "Fuller, brushed-up brows using the hair you already have.",
        "intro": [
            "Placeholder copy. Lamination resets the direction your brow hairs grow in, so "
            "gaps close up and the shape holds without daily gel.",
            "It pairs well with a wax and tint in the same appointment — ask when you book.",
        ],
        "includes": [
            "Brow mapping and shaping",
            "Lamination and setting",
            "Optional tint",
            "Nourishing finish",
        ],
        "good_for": [
            "Unruly or patchy brows",
            "Anyone growing brows out from over-plucking",
        ],
        "aftercare": "Keep dry for 24 hours and brush into shape each morning. Lasts six to "
                     "eight weeks.",
        "related": ["waxing", "lash-lift-and-tint", "lash-extensions"],
    },
]

BY_SLUG = {s["slug"]: s for s in SERVICES}

CATEGORY_ORDER = ["Facials", "Hair removal", "Lashes & brows"]


def esc(text):
    """Escape bare ampersands for valid HTML."""
    return re.sub(r"&(?![a-zA-Z]+;|#\d+;)", "&amp;", text)


def services_in(category):
    return [s for s in SERVICES if s["category"] == category]


# ------------------------------------------------------------------ templates

FONTS = (
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n'
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
    '<link href="https://fonts.googleapis.com/css2?'
    "family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400"
    '&amp;family=Jost:wght@300;400;500&amp;display=swap" rel="stylesheet">'
)


def nav_link(href, label, current, extra=""):
    aria = ' aria-current="page"' if href == current else ""
    return f'<a href="{href}"{aria}{extra}>{label}</a>'


def header(current):
    """current = filename of the page being rendered, e.g. 'about.html'"""
    sub = []
    for cat in CATEGORY_ORDER:
        sub.append(f'          <li class="dropdown__label">{esc(cat)}</li>')
        for s in services_in(cat):
            href = f'service-{s["slug"]}.html'
            sub.append(f"          <li>{nav_link(href, esc(s['name']), current)}</li>")
    sub_html = "\n".join(sub)

    services_open = ' open' if current.startswith("service") else ""

    return f"""<a class="skip-link" href="#main">Skip to content</a>

<div class="scrim" data-open="false" hidden></div>

<header class="site-header">
  <div class="wrap site-header__inner">

    <button class="menu-btn" type="button" id="menu-btn"
            aria-expanded="false" aria-controls="site-menu" aria-label="Open menu">
      <span class="menu-btn__lines" aria-hidden="true">
        <span></span><span></span><span></span>
      </span>
      <span class="menu-btn__text">Menu</span>
    </button>

    <a class="brand" href="index.html">Skin<span>By</span>KLB</a>

    <a class="btn btn--small header-cta" href="contact.html">Book</a>

    <nav class="dropdown" id="site-menu" data-open="false" aria-label="Primary">
      <ul class="dropdown__list">
        <li>{nav_link("index.html", "Home", current)}</li>
        <li>{nav_link("about.html", "About", current)}</li>
        <li class="dropdown__group">
          <details{services_open}>
            <summary>
              <span>Services</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
                   stroke-width="1.3" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>
            </summary>
            <ul class="dropdown__sub">
              <li class="dropdown__all">{nav_link("services.html", "All services", current)}</li>
{sub_html}
            </ul>
          </details>
        </li>
        <li>{nav_link("gallery.html", "Gallery", current)}</li>
        <li>{nav_link("contact.html", "Contact", current)}</li>
      </ul>
      <div class="dropdown__foot">
        <p>By appointment only</p>
        <a href="https://www.facebook.com/skinbykassie">facebook.com/skinbykassie</a>
      </div>
    </nav>

  </div>
</header>"""


FOOTER = """<footer class="site-footer">
  <div class="wrap">
    <div class="site-footer__grid">
      <div>
        <a class="brand" href="index.html">Skin<span>By</span>KLB</a>
        <p class="site-footer__blurb">Classy, unhurried esthetics in a one-chair studio.</p>
      </div>
      <div>
        <h4>Services</h4>
        <ul>
%(footer_services)s
        </ul>
      </div>
      <div>
        <h4>Studio</h4>
        <ul>
          <li>Street address — placeholder</li>
          <li>City, State ZIP</li>
          <li>Phone number — placeholder</li>
        </ul>
      </div>
      <div>
        <h4>Elsewhere</h4>
        <ul>
          <li><a href="about.html">About Kassie</a></li>
          <li><a href="gallery.html">Gallery</a></li>
          <li><a href="contact.html">Book an appointment</a></li>
          <li><a href="https://www.facebook.com/skinbykassie">Facebook</a></li>
        </ul>
      </div>
    </div>
    <div class="site-footer__base">
      <span>&copy; 2026 SkinByKLB</span>
      <span>By appointment only</span>
    </div>
  </div>
</footer>

<script src="main.js"></script>
</body>
</html>
"""


def footer():
    items = "\n".join(
        f'          <li><a href="service-{s["slug"]}.html">{esc(s["name"])}</a></li>'
        for s in SERVICES
    )
    return FOOTER % {"footer_services": items}


def page(filename, title, description, body):
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{description}">
{FONTS}
<link rel="stylesheet" href="styles.css">
</head>
<body>

{header(filename)}

<main id="main">
{body}
</main>

{footer()}"""
    with open(os.path.join(OUT_DIR, filename), "w") as f:
        f.write(html)


CTA = """
  <section class="cta">
    <div class="wrap">
      <h2>%(head)s</h2>
      <p>%(body)s</p>
      <a class="btn" href="contact.html">Book an appointment</a>
    </div>
  </section>
"""


def cta(head, body):
    return CTA % {"head": head, "body": body}


def banner(eyebrow, h1, blurb):
    return f"""
  <section class="banner">
    <div class="wrap">
      <p class="eyebrow">{eyebrow}</p>
      <h1>{h1}</h1>
      <hr class="rule rule--center">
      <p>{blurb}</p>
    </div>
  </section>
"""


# ---------------------------------------------------------------------- pages

def build_home():
    cards = []
    for cat in CATEGORY_ORDER:
        group = services_in(cat)
        links = " · ".join(
            f'<a href="service-{s["slug"]}.html">{esc(s["name"])}</a>' for s in group
        )
        cards.append(f"""        <article class="card reveal">
          <h3>{esc(cat)}</h3>
          <p class="card__links">{links}</p>
        </article>""")
    cards_html = "\n".join(cards)

    body = f"""
  <section class="hero">
    <div class="hero__media" aria-hidden="true"></div>
    <div class="hero__inner wrap">
      <p class="eyebrow">Esthetics Studio</p>
      <h1>Skin that looks like <em>you</em>, on your best day</h1>
      <p>Facials, waxing and lashes in a small studio where you get the whole
         appointment to yourself.</p>
      <div class="hero__actions">
        <a class="btn" href="contact.html">Book an appointment</a>
        <a class="btn btn--ghost" href="services.html">See the menu</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section__head section__head--center reveal">
        <p class="eyebrow">Why SkinByKLB</p>
        <h2>Treatments built around your skin, not a script</h2>
        <hr class="rule rule--center">
      </div>
      <div class="grid grid--3">
        <article class="card reveal">
          <span class="card__num">01</span>
          <h3>One client at a time</h3>
          <p>No double-booking and no rushing you out the door. Your appointment is
             yours from start to finish.</p>
        </article>
        <article class="card reveal">
          <span class="card__num">02</span>
          <h3>Licensed and trained</h3>
          <p>Every treatment is performed by a licensed esthetician who keeps up with
             continuing education.</p>
        </article>
        <article class="card reveal">
          <span class="card__num">03</span>
          <h3>Honest aftercare</h3>
          <p>You leave knowing exactly what to do next — and what you don't need to buy.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--blush">
    <div class="wrap split">
      <div class="reveal">
        <div class="ph">Portrait photo<br>goes here</div>
      </div>
      <div class="reveal">
        <p class="eyebrow">Meet your esthetician</p>
        <h2>Hi, I'm Kassie</h2>
        <hr class="rule">
        <p><em>Placeholder bio.</em> A short, warm introduction goes here — how long
           you've been doing this, what drew you to skincare, and the kind of clients
           you love working with.</p>
        <p>Two or three sentences is plenty. People mostly want to know they'll be in
           good hands.</p>
        <a class="btn btn--dark" href="about.html">More about the studio</a>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section__head section__head--center reveal">
        <p class="eyebrow">Services</p>
        <h2>Eight treatments, each with its own page</h2>
        <hr class="rule rule--center">
        <p>Pick the one you're curious about and you'll get the full picture — what's
           included, who it suits, and what happens afterwards.</p>
      </div>
      <div class="grid grid--3">
{cards_html}
      </div>
      <p class="center-action">
        <a class="btn" href="services.html">Browse all services</a>
      </p>
    </div>
  </section>

  <section class="section section--dark">
    <div class="wrap">
      <figure class="quote reveal">
        <blockquote>Placeholder testimonial. Swap this for a real review — the specific
        ones land hardest, so pick a client who mentions how their skin actually
        changed.</blockquote>
        <figcaption>Client name — Treatment</figcaption>
      </figure>
    </div>
  </section>
{cta("Ready when you are",
     "Send an inquiry and you'll hear back with availability, usually within a day.")}"""

    page("index.html", "SkinByKLB — Esthetics Studio",
         "SkinByKLB is a boutique esthetics studio offering facials, waxing and lash "
         "services in a calm, unhurried setting.", body)


def build_about():
    body = banner("About", "The studio",
                  "A one-chair space built around unhurried appointments and skin that "
                  "gets better between visits.") + """
  <section class="section">
    <div class="wrap split">
      <div class="reveal">
        <div class="ph">Portrait photo<br>goes here</div>
      </div>
      <div class="reveal">
        <p class="eyebrow">Your esthetician</p>
        <h2>Hi, I'm Kassie</h2>
        <hr class="rule">
        <p><em>Placeholder bio — replace with real copy.</em> Start with how you got into
           skincare and how long you've been licensed. People connect with the origin
           story more than the credential list.</p>
        <p>Then say what you specialise in and who you love working with — acne-prone
           teens, brides, people who've never had a facial before. Being specific here is
           what makes someone book.</p>
        <p>Close with something human. A line about your family, your town, or why you
           opened your own space.</p>
      </div>
    </div>
  </section>

  <section class="section section--blush">
    <div class="wrap">
      <div class="section__head section__head--center reveal">
        <p class="eyebrow">What to expect</p>
        <h2>How an appointment goes</h2>
        <hr class="rule rule--center">
      </div>
      <div class="grid grid--3">
        <article class="card reveal">
          <span class="card__num">01</span>
          <h3>We talk first</h3>
          <p>A short consultation about your skin, your routine and anything that's been
             bothering you lately.</p>
        </article>
        <article class="card reveal">
          <span class="card__num">02</span>
          <h3>The treatment</h3>
          <p>Adjusted on the spot to what your skin actually needs that day, not what was
             booked three weeks ago.</p>
        </article>
        <article class="card reveal">
          <span class="card__num">03</span>
          <h3>You leave with a plan</h3>
          <p>Clear aftercare, a realistic timeline, and honest advice about what's worth
             buying and what isn't.</p>
        </article>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div class="reveal">
        <p class="eyebrow">The space</p>
        <h2>Small on purpose</h2>
        <hr class="rule">
        <p><em>Placeholder.</em> Describe the studio in a few lines — quiet, private, easy
           parking, whatever is actually true and makes someone feel comfortable walking
           in.</p>
        <p>If there's anything practical worth flagging (stairs, entrance around the back,
           buzzer code), this is the right place for it.</p>
        <a class="btn btn--dark" href="contact.html">Get in touch</a>
      </div>
      <div class="reveal">
        <div class="ph ph--wide">Studio photo<br>goes here</div>
      </div>
    </div>
  </section>
""" + cta("Come see for yourself",
          "Send an inquiry and you'll hear back with availability, usually within a day.")

    page("about.html", "About — SkinByKLB",
         "Meet Kassie, the esthetician behind SkinByKLB, and learn how appointments at "
         "the studio work.", body)


def build_services_index():
    sections = []
    for cat in CATEGORY_ORDER:
        tiles = []
        for s in services_in(cat):
            tiles.append(f"""        <a class="tile reveal" href="service-{s['slug']}.html">
          <div class="tile__media ph ph--wide">Photo</div>
          <div class="tile__body">
            <h3>{esc(s['name'])}</h3>
            <p class="tile__meta">{s['price']} · {s['duration']}</p>
            <p>{s['tagline']}</p>
            <span class="tile__more">Read more</span>
          </div>
        </a>""")
        tiles_html = "\n".join(tiles)
        sections.append(f"""
  <section class="section">
    <div class="wrap">
      <div class="section__head reveal">
        <p class="eyebrow">{esc(cat)}</p>
        <h2>{esc(cat)}</h2>
        <hr class="rule">
      </div>
      <div class="tiles">
{tiles_html}
      </div>
    </div>
  </section>""")

    body = banner("Services", "Everything on the menu",
                  "Each treatment has its own page with what's included, who it suits and "
                  "what happens afterwards. All prices are placeholders for now.") \
        + "\n".join(sections) \
        + cta("Not sure what to book?",
              "Describe what's going on with your skin and you'll get a recommendation "
              "before you commit.")

    page("services.html", "Services — SkinByKLB",
         "Facials, waxing and lash services at SkinByKLB, each with its own detail page.",
         body)


def build_service(s):
    includes = "\n".join(f"          <li>{i}</li>" for i in s["includes"])
    good_for = "\n".join(f"          <li>{i}</li>" for i in s["good_for"])
    intro = "\n        ".join(f"<p>{p}</p>" for p in s["intro"])

    related = []
    for slug in s["related"]:
        r = BY_SLUG[slug]
        related.append(f"""        <a class="tile tile--compact reveal" href="service-{r['slug']}.html">
          <div class="tile__body">
            <p class="eyebrow">{esc(r['category'])}</p>
            <h3>{esc(r['name'])}</h3>
            <p class="tile__meta">{r['price']} · {r['duration']}</p>
          </div>
        </a>""")
    related_html = "\n".join(related)

    body = f"""
  <section class="banner banner--service">
    <div class="wrap">
      <p class="eyebrow">{esc(s['category'])}</p>
      <h1>{esc(s['name'])}</h1>
      <hr class="rule rule--center">
      <p class="banner__tagline">{s['tagline']}</p>
      <ul class="spec">
        <li><span>Price</span><strong>{s['price']}</strong></li>
        <li><span>Time</span><strong>{s['duration']}</strong></li>
        <li><span>Booking</span><strong>By inquiry</strong></li>
      </ul>
      <a class="btn" href="contact.html">Book this treatment</a>
    </div>
  </section>

  <section class="section">
    <div class="wrap split">
      <div class="reveal">
        <div class="ph ph--wide">{esc(s['name'])}<br>photo goes here</div>
      </div>
      <div class="reveal">
        <p class="eyebrow">The treatment</p>
        <h2>What it is</h2>
        <hr class="rule">
        {intro}
      </div>
    </div>
  </section>

  <section class="section section--blush">
    <div class="wrap grid grid--2">
      <div class="reveal">
        <p class="eyebrow">Included</p>
        <h2>What's in the appointment</h2>
        <hr class="rule">
        <ul class="ticks">
{includes}
        </ul>
      </div>
      <div class="reveal">
        <p class="eyebrow">Suitability</p>
        <h2>Book this if</h2>
        <hr class="rule">
        <ul class="ticks">
{good_for}
        </ul>
        <div class="note">
          <h3>Aftercare</h3>
          <p>{s['aftercare']}</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section__head reveal">
        <p class="eyebrow">Also worth a look</p>
        <h2>Related treatments</h2>
        <hr class="rule">
      </div>
      <div class="tiles">
{related_html}
      </div>
    </div>
  </section>
{cta(f"Book the {esc(s['name']).lower()}",
     "Send an inquiry and you'll hear back with availability, usually within a day.")}"""

    page(f"service-{s['slug']}.html", f"{esc(s['name'])} — SkinByKLB",
         f"{s['tagline']} {esc(s['name'])} at SkinByKLB, {s['duration']}.", body)


def build_gallery():
    body = banner("Gallery", "The work",
                  "Results, close-ups and a look around the studio. Every tile below is a "
                  "placeholder waiting on a real photo.") + """
  <section class="section">
    <div class="wrap">
      <div class="section__head reveal">
        <p class="eyebrow">Results</p>
        <h2>Before &amp; after</h2>
        <hr class="rule">
        <p>Shoot these in the same spot with the same light each time — consistency is
           what makes a before-and-after believable.</p>
      </div>
      <div class="gallery">
        <div class="ph reveal">Before &amp; after 1</div>
        <div class="ph reveal">Before &amp; after 2</div>
        <div class="ph reveal">Before &amp; after 3</div>
      </div>
    </div>
  </section>

  <section class="section section--blush">
    <div class="wrap">
      <div class="section__head reveal">
        <p class="eyebrow">Detail</p>
        <h2>Lashes, brows &amp; finish</h2>
        <hr class="rule">
      </div>
      <div class="gallery">
        <div class="ph ph--square reveal">Lash set</div>
        <div class="ph ph--square reveal">Brow shaping</div>
        <div class="ph ph--square reveal">Post-facial glow</div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="wrap">
      <div class="section__head reveal">
        <p class="eyebrow">The space</p>
        <h2>Inside the studio</h2>
        <hr class="rule">
      </div>
      <div class="gallery">
        <div class="ph ph--wide reveal">Treatment room</div>
        <div class="ph ph--wide reveal">Product shelf</div>
      </div>
    </div>
  </section>
""" + cta("Want results like these?",
          "Tell me what you're working on and we'll start with the right treatment.")

    page("gallery.html", "Gallery — SkinByKLB",
         "Before-and-after results and studio photos from SkinByKLB.", body)


def build_contact():
    options = "\n".join(
        f"              <option>{esc(s['name'])}</option>" for s in SERVICES
    )

    body = banner("Contact", "Book an appointment",
                  "Send a few details and you'll hear back with availability, usually "
                  "within a day.") + f"""
  <section class="section">
    <div class="wrap split">

      <div class="reveal">
        <p class="eyebrow">Inquiry</p>
        <h2>Tell me what you need</h2>
        <hr class="rule">

        <form class="form" action="#" method="post">
          <div class="field">
            <label for="name">Name</label>
            <input id="name" name="name" type="text" autocomplete="name" required>
          </div>

          <div class="field">
            <label for="email">Email</label>
            <input id="email" name="email" type="email" autocomplete="email" required>
          </div>

          <div class="field">
            <label for="phone">Phone</label>
            <input id="phone" name="phone" type="tel" autocomplete="tel">
          </div>

          <div class="field">
            <label for="service">Service</label>
            <select id="service" name="service">
              <option value="">Not sure yet — help me choose</option>
{options}
            </select>
          </div>

          <div class="field">
            <label for="message">What's going on with your skin?</label>
            <textarea id="message" name="message"
              placeholder="Anything you've tried, any sensitivities, and days that usually work for you."></textarea>
          </div>

          <button class="btn" type="submit">Send inquiry</button>

          <p class="form__note">
            This form isn't connected to anything yet — submitting it won't send a
            message. Wire it to Formspree, EmailJS or a similar service before launch.
          </p>
        </form>
      </div>

      <div class="reveal">
        <p class="eyebrow">Studio</p>
        <h2>Find me</h2>
        <hr class="rule">

        <div class="details">
          <div class="details__item">
            <h3>Location</h3>
            <p>Street address — placeholder<br>City, State ZIP</p>
          </div>

          <div class="details__item">
            <h3>Phone</h3>
            <p><a href="tel:+10000000000">(000) 000-0000 — placeholder</a></p>
          </div>

          <div class="details__item">
            <h3>Hours</h3>
            <p>
              Monday — placeholder<br>
              Tuesday to Friday — placeholder<br>
              Saturday — placeholder<br>
              Sunday — closed
            </p>
          </div>

          <div class="details__item">
            <h3>Social</h3>
            <p><a href="https://www.facebook.com/skinbykassie">facebook.com/skinbykassie</a></p>
          </div>
        </div>

        <div class="ph ph--wide map-slot">Map embed<br>goes here</div>
      </div>

    </div>
  </section>
"""

    page("contact.html", "Contact — SkinByKLB",
         "Send an inquiry to SkinByKLB or find the studio's hours and location.", body)


# ------------------------------------------------------------------------ run

def main():
    os.makedirs(OUT_DIR, exist_ok=True)

    build_home()
    build_about()
    build_services_index()
    for s in SERVICES:
        build_service(s)
    build_gallery()
    build_contact()

    here = os.path.dirname(os.path.abspath(__file__))
    for asset in ("styles.css", "main.js"):
        src = os.path.join(here, asset)
        if os.path.exists(src):
            shutil.copy(src, os.path.join(OUT_DIR, asset))

    print(f"Built {len(os.listdir(OUT_DIR))} files into {OUT_DIR}")


if __name__ == "__main__":
    main()
