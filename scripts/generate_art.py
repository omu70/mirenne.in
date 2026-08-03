#!/usr/bin/env python3
"""
Procedural art generator for Mirenne.

This sandbox cannot reach any stock-photo CDN (Unsplash/Pexels/etc. are all
network-blocked), so instead of photography we generate a cohesive library of
soft, editorial "mood field" images: color-field blooms in the brand palette,
a diagonal soft-light sweep, gentle vignette, and fine film grain.
Deterministic (seeded) so it's fully reproducible.

Usage:
    python3 scripts/generate_art.py --test     # handful of previews
    python3 scripts/generate_art.py            # full library + manifest.json
"""
import argparse
import json
import math
import os
import random

import numpy as np
from PIL import Image, ImageEnhance, ImageFilter

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "images")
OUT = os.path.abspath(OUT)


def hx(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


# Mirenne's real brand palette (warm terracotta/brown on cream), matching
# app/globals.css's @theme tokens 1:1 so the procedural art and the UI chrome
# always read as one coherent system. ink_deep has no direct CSS token — it's
# an art-only deeper tone for the darkest "evening/festive" mood recipes.
PALETTE = {
    "ivory": hx("#EDE6CF"),
    "paper": hx("#F7F4E9"),
    "beige": hx("#FCDBB2"),
    "stone": hx("#FFCB9F"),
    "taupe": hx("#E4BC95"),
    "taupe_dark": hx("#B78A5F"),
    "ink": hx("#763400"),
    "ink_soft": hx("#84400A"),
    "ink_deep": hx("#4D2200"),
    "gold": hx("#934C14"),
    "gold_light": hx("#DA884E"),
    "gold_dark": hx("#682E00"),
}

# (color, position, radius-as-fraction-of-diagonal, opacity)
RECIPES = {
    "ivory-gold-veil": dict(base="ivory", blooms=[("gold_light", "top-right", 0.75, 0.55), ("beige", "bottom-left", 0.6, 0.55)], vignette=0.05, mood="light"),
    "paper-quiet": dict(base="paper", blooms=[("stone", "center", 0.65, 0.5), ("taupe", "bottom-right", 0.5, 0.3)], vignette=0.05, mood="light"),
    "beige-warm-light": dict(base="beige", blooms=[("gold_light", "bottom", 0.65, 0.58), ("ivory", "top", 0.5, 0.42)], vignette=0.06, mood="light"),
    "stone-hush": dict(base="stone", blooms=[("taupe", "top-left", 0.65, 0.6), ("paper", "bottom-right", 0.5, 0.42)], vignette=0.07, mood="light"),
    "ivory-breeze": dict(base="ivory", blooms=[("beige", "bottom", 0.6, 0.5), ("gold_light", "top-right", 0.42, 0.38)], vignette=0.04, mood="light"),
    "taupe-gold-dusk": dict(base="taupe", blooms=[("gold", "top", 0.55, 0.55), ("taupe_dark", "bottom", 0.5, 0.6)], vignette=0.11, mood="mid"),
    "stone-taupe-soft": dict(base="stone", blooms=[("taupe", "bottom", 0.6, 0.65), ("paper", "top", 0.45, 0.45)], vignette=0.07, mood="light"),
    "paper-gold-hush": dict(base="paper", blooms=[("gold_light", "top-left", 0.45, 0.5), ("beige", "bottom-right", 0.6, 0.55)], vignette=0.06, mood="light"),
    "gold-wash": dict(base="beige", blooms=[("gold", "diagonal", 0.8, 0.6)], vignette=0.07, mood="mid"),
    "taupe-dark-editorial": dict(base="taupe_dark", blooms=[("taupe", "top", 0.6, 0.55), ("gold", "bottom-left", 0.5, 0.4)], vignette=0.12, mood="mid"),
    "ink-gold-evening": dict(base="ink_soft", blooms=[("gold", "top-right", 0.7, 0.5), ("ink", "bottom-left", 0.55, 0.55)], vignette=0.18, mood="deep"),
    "ink-veil-festive": dict(base="ink_deep", blooms=[("gold_dark", "center", 0.65, 0.48), ("gold_light", "top", 0.4, 0.3)], vignette=0.2, mood="deep"),
    "banner-monochrome": dict(base="ink", blooms=[("ivory", "top-right", 0.95, 0.8), ("stone", "bottom-left", 0.55, 0.28)], vignette=0.14, mood="banner"),
}
RECIPE_KEYS = list(RECIPES.keys())

POSITIONS = {
    "top-right": lambda w, h: (w * 0.82, h * 0.18),
    "top-left": lambda w, h: (w * 0.18, h * 0.16),
    "bottom-left": lambda w, h: (w * 0.16, h * 0.86),
    "bottom-right": lambda w, h: (w * 0.85, h * 0.85),
    "top": lambda w, h: (w * 0.5, h * 0.08),
    "bottom": lambda w, h: (w * 0.5, h * 0.94),
    "center": lambda w, h: (w * 0.5, h * 0.5),
    "diagonal": lambda w, h: (w * 0.5, h * 0.5),
}

# Garment-silhouette archetypes: a soft shoulder-to-hem shape on an implied
# invisible form. Deliberately no head/limbs -- these read as an out-of-focus
# editorial still-life of a dress (a real, respected fashion-photography
# technique), not an attempt at a figure, which would risk looking uncanny.
SILHOUETTE_VARIANTS = ["column", "a-line", "fit-flare", "cape", "drape"]

SILHOUETTE_WIDTHS = {
    "column": (0.115, 0.105, 0.13),
    "a-line": (0.09, 0.14, 0.23),
    "fit-flare": (0.12, 0.075, 0.24),
    "cape": (0.20, 0.15, 0.165),
    "drape": (0.15, 0.12, 0.19),
}


def silhouette_mask(width, height, variant, rng):
    Y, X = np.mgrid[0:height, 0:width]
    ny = Y / height
    cx = width * rng.uniform(0.44, 0.56)
    nx = (X - cx) / width

    top_y = rng.uniform(0.09, 0.15)
    hem_y = rng.uniform(0.82, 0.93)

    w_top, w_mid, w_bot = SILHOUETTE_WIDTHS.get(variant, SILHOUETTE_WIDTHS["column"])
    jitter = rng.uniform(0.92, 1.08)
    w_top, w_mid, w_bot = w_top * jitter, w_mid * jitter, w_bot * jitter

    t = np.clip((ny - top_y) / max(hem_y - top_y, 1e-6), 0, 1)
    half_width = np.where(
        t < 0.5,
        w_top + (w_mid - w_top) * (t / 0.5),
        w_mid + (w_bot - w_mid) * ((t - 0.5) / 0.5),
    )

    dist = np.abs(nx) / np.maximum(half_width, 1e-6)
    core = np.clip(1 - dist, 0, 1)
    core = core * core * (3 - 2 * core)

    fade_top = np.clip((ny - top_y) / 0.07, 0, 1)
    fade_bot = np.clip((hem_y - ny) / 0.11, 0, 1)
    return core * fade_top * fade_bot


def make_grain(seed=7):
    rng = np.random.default_rng(seed)
    noise = rng.normal(128, 34, (220, 220))
    noise = np.clip(noise, 0, 255).astype("uint8")
    img = Image.fromarray(noise, mode="L").convert("RGBA")
    arr = np.array(img)
    arr[..., 3] = 18
    return Image.fromarray(arr, mode="RGBA")


def radial_mask(w, h, cx, cy, radius):
    Y, X = np.ogrid[:h, :w]
    dist = np.sqrt((X - cx) ** 2 + (Y - cy) ** 2)
    mask = np.clip(1 - dist / radius, 0, 1)
    return mask * mask * (3 - 2 * mask)


def make_field(width, height, recipe_key, seed, blur_strength=1.0, grain_img=None, weave=False, silhouette=None):
    recipe = RECIPES[recipe_key]
    rng = random.Random(seed)
    base_color = np.array(PALETTE[recipe["base"]], dtype=float)
    canvas = np.ones((height, width, 3)) * base_color
    diag = math.hypot(width, height)

    for color_key, pos_key, size_frac, opacity in recipe["blooms"]:
        cx, cy = POSITIONS[pos_key](width, height)
        cx += rng.uniform(-0.05, 0.05) * width
        cy += rng.uniform(-0.05, 0.05) * height
        radius = diag * size_frac * rng.uniform(0.9, 1.1)
        mask = radial_mask(width, height, cx, cy, radius) * opacity
        color = np.array(PALETTE[color_key], dtype=float)
        canvas = canvas * (1 - mask[..., None]) + color[None, None, :] * mask[..., None]

    Y, X = np.mgrid[0:height, 0:width]
    theta = math.radians(35 + rng.uniform(-8, 8))
    ramp = X * math.cos(theta) + Y * math.sin(theta)
    ramp = (ramp - ramp.min()) / (ramp.max() - ramp.min() + 1e-6)
    band_center = rng.uniform(0.35, 0.65)
    band = np.exp(-((ramp - band_center) ** 2) / (2 * 0.12 ** 2))
    canvas = np.clip(canvas + band[..., None] * 255 * 0.06, 0, 255)

    if silhouette:
        sil_mask = silhouette_mask(width, height, silhouette, rng)
        base_lum = sum(PALETTE[recipe["base"]]) / 3
        # Blend proportionally toward a fixed dark/light target rather than
        # adding a flat delta -- a flat delta can wash out wherever a bright
        # bloom already sits near white (or a dark bloom near black), which
        # made the shape disappear on some recipe/variant combinations.
        target = np.array(PALETTE["ink_soft"] if base_lum > 140 else PALETTE["paper"], dtype=float)
        strength = rng.uniform(0.32, 0.44)
        blend = (sil_mask * strength)[..., None]
        canvas = canvas * (1 - blend) + target[None, None, :] * blend

    if weave:
        line_val = -7
        wv = np.zeros((height, width))
        wv[::5, :] = line_val
        wv[:, ::5] += line_val
        canvas = np.clip(canvas + wv[..., None], 0, 255)

    cx, cy = width / 2, height / 2
    Yv, Xv = np.ogrid[:height, :width]
    dist = np.sqrt(((Xv - cx) / (width / 2)) ** 2 + ((Yv - cy) / (height / 2)) ** 2)
    vig = np.clip(dist - 0.5, 0, None)
    vig = np.clip(vig, 0, 1) * recipe["vignette"]
    canvas = canvas * (1 - vig[..., None])
    canvas = np.clip(canvas, 0, 255).astype("uint8")

    img = Image.fromarray(canvas, mode="RGB")
    blur_radius = max(width, height) * 0.006 * blur_strength
    if blur_radius > 0.5:
        img = img.filter(ImageFilter.GaussianBlur(blur_radius))

    img = ImageEnhance.Color(img).enhance(1.12)
    img = ImageEnhance.Contrast(img).enhance(1.07)

    if grain_img is not None:
        full_grain = Image.new("RGBA", (width, height))
        for gy in range(0, height, 220):
            for gx in range(0, width, 220):
                full_grain.paste(grain_img, (gx, gy))
        img = Image.alpha_composite(img.convert("RGBA"), full_grain).convert("RGB")

    return img, recipe["mood"]


POOLS = {
    "hero": dict(count=6, size=(2000, 1250), blur=1.15, dir="mood", prefix="hero", silhouette=True),
    "wide": dict(count=8, size=(1600, 900), blur=0.95, dir="mood", prefix="wide", silhouette=True),
    "portrait": dict(count=24, size=(1000, 1300), blur=0.55, dir="mood", prefix="portrait", silhouette=True),
    "square": dict(count=14, size=(1100, 1100), blur=0.65, dir="mood", prefix="square", silhouette=True),
    "detail": dict(count=10, size=(900, 1100), blur=0.35, dir="mood", prefix="detail", weave=True),
    "atelier": dict(count=3, size=(1400, 1000), blur=0.7, dir="mood", prefix="atelier"),
}

COLLECTION_RECIPES = {
    "evening-wear": "ink-gold-evening",
    "resort": "beige-warm-light",
    "cocktail": "taupe-gold-dusk",
    "wedding-guest": "gold-wash",
    "festive": "ink-veil-festive",
    "vacation": "ivory-breeze",
    "signature": "paper-gold-hush",
}

# Home page black/white banner section — one wide crop for desktop (19:6),
# one tall crop for mobile (4:5). Same recipe + seed so both read as the
# same piece of art, just framed differently per breakpoint.
BANNERS = {
    "banner-desktop": dict(size=(2280, 720), blur=1.05, seed_key="home-banner"),
    "banner-mobile": dict(size=(1200, 1500), blur=0.75, seed_key="home-banner"),
}
BANNER_RECIPE = "banner-monochrome"


def run(test=False):
    os.makedirs(os.path.join(OUT, "texture"), exist_ok=True)
    os.makedirs(os.path.join(OUT, "mood"), exist_ok=True)
    os.makedirs(os.path.join(OUT, "banner"), exist_ok=True)

    grain = make_grain()
    grain.save(os.path.join(OUT, "texture", "grain.png"))

    manifest = {"generated": [], "collections": {}}

    pools = POOLS
    if test:
        pools = {k: {**v, "count": 2} for k, v in POOLS.items()}

    for pool_name, cfg in pools.items():
        w, h = cfg["size"]
        for i in range(cfg["count"]):
            recipe_key = RECIPE_KEYS[i % len(RECIPE_KEYS)]
            seed = hash((pool_name, i)) % (2**31)
            variant = SILHOUETTE_VARIANTS[i % len(SILHOUETTE_VARIANTS)] if cfg.get("silhouette") else None
            img, mood = make_field(w, h, recipe_key, seed, blur_strength=cfg["blur"], grain_img=grain, weave=cfg.get("weave", False), silhouette=variant)
            fname = f"{cfg['prefix']}-{i+1:02d}.jpg"
            path = os.path.join(OUT, cfg["dir"], fname)
            img.save(path, quality=90)
            manifest["generated"].append({
                "pool": pool_name, "file": f"/images/{cfg['dir']}/{fname}",
                "width": w, "height": h, "recipe": recipe_key, "mood": mood,
            })

    for idx, (slug, recipe_key) in enumerate(COLLECTION_RECIPES.items()):
        w, h = (1200, 1500)
        seed = hash(("collection", slug)) % (2**31)
        variant = SILHOUETTE_VARIANTS[idx % len(SILHOUETTE_VARIANTS)]
        img, mood = make_field(w, h, recipe_key, seed, blur_strength=0.6, grain_img=grain, silhouette=variant)
        fname = f"collection-{slug}.jpg"
        path = os.path.join(OUT, "mood", fname)
        img.save(path, quality=90)
        manifest["collections"][slug] = {
            "file": f"/images/mood/{fname}", "width": w, "height": h,
            "recipe": recipe_key, "mood": mood,
        }

    for name, cfg in BANNERS.items():
        w, h = cfg["size"]
        seed = hash(cfg["seed_key"]) % (2**31)
        img, mood = make_field(w, h, BANNER_RECIPE, seed, blur_strength=cfg["blur"], grain_img=grain)
        fname = f"{name}.jpg"
        path = os.path.join(OUT, "banner", fname)
        img.save(path, quality=92)
        manifest["banners"] = manifest.get("banners", {})
        manifest["banners"][name] = {
            "file": f"/images/banner/{fname}", "width": w, "height": h,
            "recipe": BANNER_RECIPE, "mood": mood,
        }

    with open(os.path.join(OUT, "manifest.json"), "w") as f:
        json.dump(manifest, f, indent=2)

    total = len(manifest["generated"]) + len(manifest["collections"]) + len(manifest["banners"])
    print(f"Generated {total} images -> {OUT}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--test", action="store_true")
    args = parser.parse_args()
    run(test=args.test)
