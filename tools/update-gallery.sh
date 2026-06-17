#!/bin/bash
# Run after renaming images in the sculptures or paintings & drawings folders.
# Scans both folders and updates data-images paths in index.html.
set -e
cd "$(dirname "$0")/.."

python3 - <<'PYEOF'
import os, json, re

EXTS = {'.jpg','.jpeg','.png','.gif','.webp','.mp4','.mov','.webm','.JPG','.JPEG','.PNG','.GIF'}

def list_images(folder):
    files = [
        f"{folder}/{f}" for f in sorted(os.listdir(folder))
        if os.path.splitext(f)[1] in EXTS
    ]
    return files

def json_for_attr(files):
    # data-images is wrapped in single quotes in the HTML, so any literal
    # apostrophe in a filename (e.g. "Who's") must be entity-escaped or it
    # truncates the attribute. Browsers decode &#39; back to ' before JS
    # ever sees the attribute, so JSON.parse downstream is unaffected.
    return json.dumps(files, ensure_ascii=False).replace("'", "&#39;")

sculpt = list_images("Images/works/sculptures")
paint  = list_images("Images/works/paintings and drawings")

with open("index.html", "r", encoding="utf-8") as fh:
    html = fh.read()

# Anchor on the surrounding structure (not on the closing quote itself —
# filenames may contain apostrophes, which would otherwise be mistaken
# for the attribute's closing delimiter). The tempered-dot token
# (?:(?!data-images=').)*? stops the match from ever crossing into a
# different card's data-images attribute.
def replace_block(html, anchor_title, files):
    pattern = (
        r"(data-images=')(?:(?!data-images=').)*?"
        r"('>\s*<div class=\"work-foot\">\s*<span class=\"work-num\"></span>\s*<h2 class=\"work-title\">"
        + re.escape(anchor_title) + r")"
    )
    new_html, count = re.subn(
        pattern,
        lambda m: m.group(1) + json_for_attr(files) + m.group(2),
        html, flags=re.DOTALL
    )
    if count != 1:
        raise RuntimeError(f"Expected exactly 1 match for '{anchor_title}', got {count}")
    return new_html

html = replace_block(html, "Drawings, Prints, Textile and Paintings", paint)
html = replace_block(html, "Sculptures", sculpt)

# Replace the cover <img> src for paintings and drawings
if paint:
    html = re.sub(
        r'(<img src=")[^"]*paintings and drawings[^"]*(" class="work-cover")',
        lambda m: m.group(1) + paint[0] + m.group(2),
        html
    )

# Replace the cover <img> src for sculptures
if sculpt:
    html = re.sub(
        r'(<img src=")[^"]*sculptures[^"]*(" class="work-cover")',
        lambda m: m.group(1) + sculpt[0] + m.group(2),
        html
    )

with open("index.html", "w", encoding="utf-8") as fh:
    fh.write(html)

print(f"Updated: {len(paint)} paintings & drawings, {len(sculpt)} sculptures.")
print("Review index.html, then run tools/publish.sh to go live.")
PYEOF
