# Ill-Fated Idols

One-page site for **Ill-Fated Idols** — dark / eldritch / Lovecraftian 3D-printed
and hand-painted sculptures. Static site, hosted on GitHub Pages.

**Live:** https://spiffcow.github.io/illfatedidols/

## Structure

```
index.html          # all page content (header, hero, about, makers, gallery, contact, footer)
style.css           # all styling + responsive + animations
main.js             # nav toggle, scroll reveal, lightbox, contact-form submit
favicon.png         # circular eye icon
images/
  logo-*.png        # transparent brand logos (hero wordmark, header, icon)
  hero.jpg          # optimized hero/header background (from IMG_0009_2)
  gallery/          # web-optimized gallery images:
                    #   NAME.jpg        = full-size (lightbox)
                    #   NAME_thumb.jpg  = 800px square thumbnail (grid)
  photos/           # RAW camera originals — NOT committed (see .gitignore),
                    #   kept locally as the source for regenerating web images
```

### Regenerating web images

`images/gallery/*` and `images/hero.jpg` are generated from `images/photos/`.
The originals are git-ignored (they're ~90 MB), so keep your own backup. To add
or re-optimize photos, drop new files in `images/photos/` and re-run the resize
step (center-square 800px thumbs + 1600px full images).

## Placeholders to fill in

Search the source for these tokens and replace them:

| Token | Where | Replace with |
|-------|-------|--------------|
| `ETSY_URL` | index.html (nav, hero, gallery, footer) | Your Etsy shop URL |
| `INSTAGRAM_URL` | index.html (footer) | Your Instagram URL |
| `NSMINIS_MMF_URL` | index.html (about, footer) | NS Miniatures MyMiniFactory page URL |
| `FORMSPREE_ID` | index.html (form action) | Your Formspree form ID |
| `CONTACT_EMAIL` | index.html (contact-alt) | Display email address |
| `HERO TAGLINE` | index.html (`.hero-tagline`) | One-line tagline |
| `ABOUT COPY` | index.html (`.about-copy`) | Your About text |
| Maker names/bios | index.html (`.makers`) | Real names, roles, bios for E & D |
| Gallery captions | index.html (`.gallery-item` `data-caption`) | Real idol names (currently placeholder names) |

## Local preview

```sh
python -m http.server
# then open http://localhost:8000
```

## Deployment

Pushing to `main` auto-publishes via GitHub Pages (source: `main` / root).
