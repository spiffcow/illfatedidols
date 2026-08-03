"""
Generates the decorative section-divider PNGs in images/.

Colour is sampled from the logo wordmark (#DF70FF), not the CSS --accent,
so the rules match the brand mark exactly.

    python scripts/make-dividers.py            # write the six dividers
    python scripts/make-dividers.py preview    # ...and a contact sheet

Each motif is emitted twice: "center" (symmetric, fades out both ends) and
"left" (ornament at the left margin, rule trails off to the right).
"""

import math
import sys

from PIL import Image, ImageDraw

OUT = "images"
COLOR = (0xDF, 0x70, 0xFF)
S = 3  # supersample factor, downscaled with LANCZOS for clean edges

DIMS = {"flourish": (2400, 240), "eye": (2400, 180), "rune": (2400, 120)}
REACH = {"flourish": 330, "eye": 105, "rune": 78}
ORN_X = {"flourish": 370, "eye": 140, "rune": 105}


def bez(p0, p1, p2, p3, n=260):
    o = []
    for i in range(n + 1):
        t = i / n
        m = 1 - t
        o.append((m*m*m*p0[0] + 3*m*m*t*p1[0] + 3*m*t*t*p2[0] + t*t*t*p3[0],
                  m*m*m*p0[1] + 3*m*m*t*p1[1] + 3*m*t*t*p2[1] + t*t*t*p3[1]))
    return o


def curl(x0, y0, a0, length, k0, k1, n=300, flip=1, p=2):
    """Centreline whose turn rate ramps up along its length, so the tip
    spirals — that curl is what makes the shape read as a tentacle.

    A high `p` keeps the body nearly straight and saves almost all the
    turning for the last stretch; low `p` arcs the whole length (which
    reads as a flourish, not a limb)."""
    ds = length / n
    x, y, a = x0, y0, a0
    pts = [(x, y)]
    for i in range(n):
        t = i / n
        a += (k0 + (k1 - k0) * t ** p) * ds
        x += math.cos(a) * ds * flip
        y += math.sin(a) * ds
        pts.append((x, y))
    return pts


def taper(pts, wfun):
    n = len(pts)
    L, R = [], []
    for i, (x, y) in enumerate(pts):
        t = i / (n - 1)
        if i == 0:
            dx, dy = pts[1][0] - x, pts[1][1] - y
        elif i == n - 1:
            dx, dy = x - pts[i-1][0], y - pts[i-1][1]
        else:
            dx, dy = pts[i+1][0] - pts[i-1][0], pts[i+1][1] - pts[i-1][1]
        m = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / m, dx / m
        w = wfun(t) / 2.0
        L.append((x + nx*w, y + ny*w))
        R.append((x - nx*w, y - ny*w))
    return L + R[::-1]


def stroke(d, pts, wfun, v=255):
    d.polygon([(x*S, y*S) for x, y in taper(pts, wfun)], fill=v)


def rule(d, x0, x1, cy, w0, w1, v=255):
    pts = [(x0 + (x1 - x0) * i / 60.0, cy) for i in range(61)]
    stroke(d, pts, lambda t: w0 + (w1 - w0) * t, v)


def suckers(d, pts, wfun, side, count, t0, t1, v=70):
    n = len(pts)
    for k in range(count):
        t = t0 + (t1 - t0) * k / (count - 1)
        i = int(t * (n - 1))
        x, y = pts[i]
        if i == 0:
            dx, dy = pts[1][0] - x, pts[1][1] - y
        elif i == n - 1:
            dx, dy = x - pts[i-1][0], y - pts[i-1][1]
        else:
            dx, dy = pts[i+1][0] - pts[i-1][0], pts[i+1][1] - pts[i-1][1]
        m = math.hypot(dx, dy) or 1.0
        nx, ny = -dy / m, dx / m
        w = wfun(t)
        r = max(1.3, w * 0.20)
        o = w * 0.21 * side
        cx, cy = (x + nx*o) * S, (y + ny*o) * S
        d.ellipse([cx - r*S, cy - r*S, cx + r*S, cy + r*S], fill=v)


def diamond(d, cx, cy, rx, ry, v=255):
    d.polygon([((cx-rx)*S, cy*S), (cx*S, (cy-ry)*S),
               ((cx+rx)*S, cy*S), (cx*S, (cy+ry)*S)], fill=v)


def draw_flourish(d, cx, cy):
    wf = lambda t: 23 * (1 - t) ** 1.5 + 1.4
    for s in (1, -1):
        arm = curl(cx + 16*s, cy + 2, -0.34, 340, 0.0022, 0.0345, flip=s)
        stroke(d, arm, wf)
        suckers(d, arm, wf, -s, 11, 0.08, 0.72)
    diamond(d, cx, cy, 16, 9)
    d.ellipse([(cx-5)*S, (cy-5)*S, (cx+5)*S, (cy+5)*S], fill=60)


def draw_eye(d, cx, cy):
    for s in (1, -1):
        arc = bez((cx-72, cy), (cx-30, cy-38*s), (cx+30, cy-38*s), (cx+72, cy))
        stroke(d, arc, lambda t: 3.0 + 5.5 * math.sin(math.pi*t) ** 0.8)
    d.ellipse([(cx-13)*S, (cy-19)*S, (cx+13)*S, (cy+19)*S], fill=255)
    d.ellipse([(cx-4.5)*S, (cy-8)*S, (cx+4.5)*S, (cy+8)*S], fill=55)
    for dx in (-42, 0, 42):
        h = 26 if dx == 0 else 18
        for s in (1, -1):
            ray = [(cx + dx + dx*0.10*i/12.0, cy - s*(34 + h*i/12.0)) for i in range(13)]
            stroke(d, ray, lambda t: 3.4 * (1 - t) ** 1.2 + 0.5)


def draw_rune(d, cx, cy):
    diamond(d, cx, cy, 26, 13)
    diamond(d, cx, cy, 15, 7.4, 0)
    diamond(d, cx, cy, 7, 3.4)
    for s in (1, -1):
        d.ellipse([(cx + s*62 - 3.6)*S, (cy-3.6)*S,
                   (cx + s*62 + 3.6)*S, (cy+3.6)*S], fill=255)


DRAW = {"flourish": draw_flourish, "eye": draw_eye, "rune": draw_rune}


def fade(mask, mode):
    W, H = mask.size
    px = mask.load()
    f = [1.0] * W
    if mode == "center":
        e = int(W * 0.19)
        for x in range(W):
            if x < e:
                f[x] = (x / e) ** 1.7
            elif x > W - 1 - e:
                f[x] = ((W - 1 - x) / e) ** 1.7
    else:
        lead, ts = int(W * 0.006), int(W * 0.55)
        for x in range(W):
            if x < lead:
                f[x] = (x / lead) ** 1.1
            elif x > ts:
                f[x] = (1 - (x - ts) / (W - 1 - ts)) ** 1.6
    for y in range(H):
        for x in range(W):
            v = px[x, y]
            if v:
                px[x, y] = int(v * f[x])
    return mask


def build(name, mode):
    W, H = DIMS[name]
    r = REACH[name]
    mask = Image.new("L", (W*S, H*S), 0)
    d = ImageDraw.Draw(mask)
    cx = W // 2 if mode == "center" else ORN_X[name]
    cy = H // 2
    if mode == "center":
        rule(d, 40, cx - r, cy, 2.2, 4.0)
        rule(d, cx + r, W - 40, cy, 4.0, 2.2)
    else:
        rule(d, cx + r, W - 30, cy, 4.0, 2.0)
    DRAW[name](d, cx, cy)
    mask = mask.resize((W, H), Image.LANCZOS)
    fade(mask, mode)
    img = Image.new("RGBA", (W, H), COLOR + (0,))
    img.putalpha(mask)
    return img


def main():
    variants = [(n, m) for n in DIMS for m in ("center", "left")]
    built = []
    for name, mode in variants:
        img = build(name, mode)
        img.save(f"{OUT}/divider-{name}-{mode}.png", optimize=True)
        built.append(img)
        print(f"divider-{name}-{mode}.png  {img.width}x{img.height}")

    if "preview" in sys.argv:
        PW, pad = 1300, 26
        scaled = [b.resize((PW, max(1, round(b.height * PW / b.width))), Image.LANCZOS)
                  for b in built]
        sheet = Image.new(
            "RGB",
            (PW + pad*2, sum(s.height for s in scaled) + pad * (len(scaled) + 1)),
            (0x15, 0x04, 0x21),
        )
        y = pad
        for s in scaled:
            sheet.paste(s, (pad, y), s)
            y += s.height + pad
        sheet.save(f"{OUT}/_preview-dividers.png")
        print("_preview-dividers.png")


if __name__ == "__main__":
    main()
