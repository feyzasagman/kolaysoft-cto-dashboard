"""
Compose GitHub Social Preview (1280x640) from Product Tour screenshots.

  python docs/tools/compose_social_preview.py

Does not modify application source. Output:
  docs/assets/social/kolaysoft-cto-dashboard-social-preview.png
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[2]
SHOTS = ROOT / "docs" / "assets" / "screenshots"
OUT_DIR = ROOT / "docs" / "assets" / "social"
OUT_PATH = OUT_DIR / "kolaysoft-cto-dashboard-social-preview.png"

CANVAS_W, CANVAS_H = 1280, 640


def load_font(size: int, bold: bool = False) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    candidates = [
        r"C:\Windows\Fonts\segoeuib.ttf" if bold else r"C:\Windows\Fonts\segoeui.ttf",
        r"C:\Windows\Fonts\arialbd.ttf" if bold else r"C:\Windows\Fonts\arial.ttf",
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
        if bold
        else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
    ]
    for path in candidates:
        try:
            return ImageFont.truetype(path, size=size)
        except OSError:
            continue
    return ImageFont.load_default()


def rounded(im: Image.Image, radius: int) -> Image.Image:
    im = im.convert("RGBA")
    mask = Image.new("L", im.size, 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle((0, 0, im.width, im.height), radius=radius, fill=255)
    out = im.copy()
    out.putalpha(mask)
    return out


def drop_shadow(im: Image.Image, offset: tuple[int, int] = (0, 10), blur: int = 18, opacity: int = 90) -> Image.Image:
    shadow = Image.new("RGBA", (im.width + blur * 2 + abs(offset[0]), im.height + blur * 2 + abs(offset[1])), (0, 0, 0, 0))
    layer = Image.new("RGBA", im.size, (0, 0, 0, opacity))
    layer.putalpha(im.split()[-1].point(lambda a: min(a, opacity)))
    shadow.paste(layer, (blur + max(offset[0], 0), blur + max(offset[1], 0)), layer)
    shadow = shadow.filter(ImageFilter.GaussianBlur(blur // 2))
    base = Image.new("RGBA", shadow.size, (0, 0, 0, 0))
    base.alpha_composite(shadow)
    base.alpha_composite(im, (blur + max(-offset[0], 0), blur + max(-offset[1], 0)))
    return base


def crop_resize(path: Path, box: tuple[int, int, int, int], width: int) -> Image.Image:
    im = Image.open(path).convert("RGB")
    im = im.crop(box)
    ratio = width / im.width
    height = max(1, int(im.height * ratio))
    im = im.resize((width, height), Image.Resampling.LANCZOS)
    return rounded(im, radius=12)


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    # Neutral dark canvas — product screenshots keep their native colors.
    canvas = Image.new("RGBA", (CANVAS_W, CANVAS_H), (18, 24, 33, 255))
    draw = ImageDraw.Draw(canvas)
    # Soft vertical vignette (edges only; no mid-band artifact)
    for x in range(0, 48):
        a = int(28 * (1 - x / 48))
        draw.line([(x, 0), (x, CANVAS_H)], fill=(8, 12, 18, a))
        draw.line([(CANVAS_W - 1 - x, 0), (CANVAS_W - 1 - x, CANVAS_H)], fill=(8, 12, 18, a))

    title_font = load_font(34, bold=True)
    subtitle_font = load_font(17, bold=False)
    strip_font = load_font(13, bold=False)

    title = "Kolaysoft CTO Dashboard"
    subtitle = "Role-based project reporting & CTO portfolio monitoring"

    draw.text((44, 28), title, font=title_font, fill=(245, 247, 250, 255))
    draw.text((44, 72), subtitle, font=subtitle_font, fill=(168, 178, 192, 255))

    # Dashboard: KPI + Attention Center
    dash = crop_resize(
        SHOTS / "01-dashboard.png",
        box=(0, 48, 1440, 760),
        width=760,
    )
    # Project Detail: hero + metrics + Executive Insight (nav cropped for density)
    detail = crop_resize(
        SHOTS / "03-project-detail.png",
        box=(210, 48, 1440, 700),
        width=580,
    )

    dash_shadow = drop_shadow(dash, offset=(0, 10), blur=20, opacity=95)
    detail_shadow = drop_shadow(detail, offset=(0, 12), blur=22, opacity=105)

    # Primary dashboard left; detail overlaps right — readable product focus.
    canvas.alpha_composite(dash_shadow, (24, 118))
    canvas.alpha_composite(detail_shadow, (670, 138))

    # Quality strip (text only — no badges / no unverified scores)
    strip = "Spring Boot  ·  React  ·  PostgreSQL  ·  Docker  ·  Playwright  ·  CI"
    strip_bbox = draw.textbbox((0, 0), strip, font=strip_font)
    strip_w = strip_bbox[2] - strip_bbox[0]
    draw.rectangle((0, CANVAS_H - 34, CANVAS_W, CANVAS_H), fill=(12, 16, 22, 255))
    draw.text(
        ((CANVAS_W - strip_w) // 2, CANVAS_H - 26),
        strip,
        font=strip_font,
        fill=(150, 162, 178, 255),
    )

    final = canvas.convert("RGB")
    if final.size != (CANVAS_W, CANVAS_H):
        raise SystemExit(f"Unexpected size: {final.size}")
    final.save(OUT_PATH, format="PNG", optimize=True)
    print(f"Wrote {OUT_PATH} ({OUT_PATH.stat().st_size} bytes) {final.size}")


if __name__ == "__main__":
    main()
