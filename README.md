# Ill-Fated Idols

One-page site for **Ill-Fated Idols** — dark / eldritch / Lovecraftian 3D-printed
and hand-painted sculptures. Static site, hosted on GitHub Pages.

**Live:** https://spiffcow.github.io/illfatedidols/

## Structure

```
index.html        # all page content (header, hero, about, gallery, contact, footer)
style.css         # all styling + responsive + animations
main.js           # nav toggle, scroll reveal, lightbox, contact-form submit
favicon.png       # circular eye icon
images/           # brand graphics (logo, wordmarks, icon) + product photos
```

## Placeholders to fill in

Search the source for these tokens and replace them:

| Token | Where | Replace with |
|-------|-------|--------------|
| `ETSY_URL` | index.html (nav, hero, gallery, footer) | Your Etsy shop URL |
| `INSTAGRAM_URL` | index.html (footer) | Your Instagram URL |
| `FORMSPREE_ID` | index.html (form action) | Your Formspree form ID |
| `CONTACT_EMAIL` | index.html (contact-alt) | Display email address |
| `HERO TAGLINE` | index.html (`.hero-tagline`) | One-line tagline |
| `ABOUT COPY` | index.html (`.about-copy`) | Your About text |
| Gallery items | index.html (`.gallery-item`) | Product photos (set `data-full` + add `<img>`) |

### Adding a real gallery image

Replace a placeholder button with:

```html
<button class="gallery-item" data-full="images/your-photo.jpg" data-caption="Idol Name">
  <img src="images/your-photo.jpg" alt="Idol Name" loading="lazy" />
</button>
```

## Local preview

```sh
python -m http.server
# then open http://localhost:8000
```

## Deployment

Pushing to `main` auto-publishes via GitHub Pages (source: `main` / root).
