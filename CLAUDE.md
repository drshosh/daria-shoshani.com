# Daria's Website

Portfolio site for visual artist Daria Shoshani (daria.l.sh@gmail.com), deployed at the custom domain via GitHub Pages. Amir (edenakshoti) is the developer collaborating with Daria.

## Stack

Vanilla HTML/CSS/JS — no build step, no framework, single-page site.

- `index.html` — all sections and markup (~51KB)
- `main.js` — all JS, ~1300 lines
- `style.css` — all styles
- `Font/` — CreatoDisplay family (OTF)
- `Images/` — gallery images + media
- `brand_assets/` — logo, CV PDF, portfolio PDF

## Site Sections (top to bottom)

Hero → Works → Archive → About → CV → Contact + Draw (overlay canvas tool)

## Key Features

**Works gallery**: image/video lightbox. Filename encodes metadata:
`Title--Year--Dimensions--SequenceNumber.ext` — parsed for captions.

**Archive**: randomized "lottery" gallery with flicker animation, historical images.

**Draw**: SVG canvas with 38+ color swatches, eraser, PNG export, uploads to ImgBB, sends via EmailJS.

**Misc**: custom cursor, hover link previews (screenshot cache), smooth scroll, mobile hamburger nav, countdown intro video, nav color-change over hero.

## Publishing

```bash
./tools/publish.sh          # stage all, commit, push to GitHub Pages
./tools/update-gallery.sh   # scan Images/ dirs, update data-images in index.html
```

After any `git commit`, the hook in `.claude/settings.local.json` auto-pushes to `origin main`.

## External Services

- **ImgBB**: hosts screenshots from the Draw feature
- **EmailJS**: sends drawings via email from the Draw tool
- **GitHub Pages**: hosting (custom domain in `CNAME` file)

## Conventions

- No framework, no npm — keep it vanilla
- All JS in `main.js`, all styles in `style.css`, no splitting
- Gallery image dirs are inside `Images/` — run `update-gallery.sh` after reorganizing files
- Commit messages are short and descriptive; publishing happens via `publish.sh` or git hook
