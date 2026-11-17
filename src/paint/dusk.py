"""dusk.py — what Ledger's painted cards share.

A card's painting is the mark's tile at card size: the depth ramp, deep to
late, as a dusk, with the mark's figure in it as a thing in the scene
(DESIGN.md, "The marks and the cards"). This is the ramp and the few touches
every such painting uses; the scene is each product's own program.

    import sys; sys.path.insert(0, ".../node_modules/@stdlogits/ledger/src/paint")
    from brush import Canvas
    from dusk import W, H, PAPER, LIGHT, RAMP, GLOW, ramp, wash, disc, vignette

Written by Claude, 2026-11-16.
"""
import numpy as np

from brush import DAB, FILBERT, SOFT, mix, rect, rgb

W, H = 1200, 630                          # a card, in nominal units

PAPER = rgb("#0b0d12")                    # the dark paper: the night the ramp is mixed into
LIGHT = rgb("#f4f6fb")                    # a light, a star, the moon: the paper's colour in the light theme, a breath cooler
# The mark's tile, stop by stop (tokens.css: --deep to --late through their oklch mix).
RAMP = [rgb(h) for h in ("#6a4fe0", "#4c63dc", "#2a73d0", "#007fbf", "#0b87ad")]       # light: the ground
GLOW = [rgb(h) for h in ("#a08bff", "#86a1ff", "#69b6ff", "#52c9ff", "#4fd8f5")]       # dark: what shines on it


def ramp(stops, t):
    """The ramp's colour at depth t, 0 (deep) to 1 (late)."""
    t = float(np.clip(t, 0, 1)) * 4
    i = min(3, int(t))
    return mix(stops[i], stops[i + 1], t - i)


def wash(cv, colour, box=None, width=(44, 34), angle=(-4, 5), length=((180, 420), (160, 380)), curve=8, jitter=0.012):
    """Lay a ground in two passes of a filbert, the second thinner, across the first and dragging it a little.

    `colour` is a function of (x, y); `box` a polygon, the whole card if none.
    """
    box = rect(cv.w / 2, cv.h / 2, cv.w + 80, cv.h + 60) if box is None else box
    cv.fill(box, colour, FILBERT, width=width[0], angle=angle[0], length=length[0], overlap=0.5, streak=0.02, chroma=0.008,
            jitter=jitter, frisket=False, dry=0)
    cv.fill(box, colour, FILBERT, width=width[1], angle=angle[1], length=length[1], overlap=0.4, curve=curve, streak=0.018,
            chroma=0.008, jitter=jitter, frisket=False, opacity=0.6, pickup=0.25, shuffle=True)


def disc(cv, p, r, colour, brush=DAB, **over):
    """A round touch with no bristle seam: a light, an eye, a moon."""
    p = np.asarray(p, float)
    cv.stroke([p - (0.3, 0), p + (0.3, 0)], 2 * r, colour, brush, **{"gap": 0.0, "density": 1.2, "grain": 0.0, **over})


def vignette(cv, strength=0.30):
    """The corners fall off a little, as the mark's tile does not: a card is looked into."""
    with cv.layer(PAPER, "multiply", strength, blur=70):
        for y in (-40, cv.h + 40):
            cv.stroke([(-50, y), (cv.w + 50, y)], 150, PAPER, SOFT, opacity=1)
        for x in (-40, cv.w + 40):
            cv.stroke([(x, -50), (x, cv.h + 50)], 130, PAPER, SOFT, opacity=1)
