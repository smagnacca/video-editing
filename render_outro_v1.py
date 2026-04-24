#!/usr/bin/env python3
"""
Hollywood animated outro — 15-Minute Sales Sprint CTA  (31 seconds)
Replaces static outro card in notebooklm-FINAL-v4.mp4 (t=170–201s)

PHASE 1 (0–13s):  Event announce — badge slam, headline typewriter, subtitle
PHASE 2 (13–28s): Full CTA card — "15 min. One idea. Zero fluff." + stats + button
PHASE 3 (28–31s): Gold pulse + fade to black

TIME GATE RULE: every element has BOTH start AND end — no open-ended if t>X
All phases are mutually exclusive from the main render() function.
"""
import sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 30
TOTAL = int(31 * FPS)   # 930 frames

BG    = (10, 14, 26)
GOLD  = (245, 166, 35)
TEAL  = (0, 229, 255)
WHITE = (255, 255, 255)
GRAY  = (110, 125, 145)
DARK  = (5, 8, 18)
ORANGE= (255, 115, 0)

BOLD = '/usr/share/fonts/truetype/lato/Lato-Black.ttf'
REG  = '/usr/share/fonts/truetype/lato/Lato-Regular.ttf'

_fc = {}
def F(size, bold=True):
    k = (size, bold)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(BOLD if bold else REG, size)
    return _fc[k]

# ── Easing ─────────────────────────────────────────────────────────────────────
def xo(t): t=max(0.,min(1.,t)); return 1. if t>=1 else 1-2**(-10*t)
def bo(t, s=1.7): t=max(0.,min(1.,t)); return 1+(s+1)*(t-1)**3+s*(t-1)**2
def rm(t, a, b): return max(0.,min(1.,(t-a)/(b-a))) if b>a else (1. if t>=b else 0.)
def lp(a, b, t): return a+(b-a)*t

_dd = ImageDraw.Draw(Image.new('L', (1,1)))
def tsz(txt, f): b=_dd.textbbox((0,0),txt,font=f); return b[2]-b[0], b[3]-b[1]

# ── Film grain ─────────────────────────────────────────────────────────────────
_gr = np.random.default_rng(99).integers(0, 18, (H,W,3), dtype=np.uint8)
def base_canvas():
    c = np.full((H,W,3), BG, dtype=np.float32)
    c += (_gr * 0.035)
    return np.clip(c, 0, 255)

# ── Glow layers (precomputed) ──────────────────────────────────────────────────
def build_glow(text, cx, cy, f, color, radius):
    g = Image.new('RGBA', (W,H), 0)
    ImageDraw.Draw(g).text((cx,cy), text, font=f, fill=(*color,255), anchor='mm')
    b = np.array(g.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)
    return b[:,:,:3], b[:,:,3:4]/255.0

sys.stderr.write("Building glow layers...\n"); sys.stderr.flush()
G_ZF_rgb, G_ZF_a  = build_glow("Zero fluff.", W//2, H//2-40, F(140), GOLD, 60)
G_BTN_rgb,G_BTN_a = build_glow("Reserve My Spot  >>", W//2, H//2+220, F(72), GOLD, 40)
sys.stderr.write("Done.\n"); sys.stderr.flush()

def glow(canvas_f, rgb, alpha, strength):
    a = np.clip(alpha * strength, 0, 1)
    canvas_f[:] = canvas_f*(1-a) + rgb*a

# ── Drawing helpers ────────────────────────────────────────────────────────────
def fade_to(canvas_f, color_rgb, alpha_01):
    if alpha_01 <= 0: return
    col = np.array(color_rgb, dtype=np.float32)
    canvas_f[:] = canvas_f*(1-alpha_01) + col*alpha_01

def draw_text_on(canvas_f, text, cx_center, cy_center, f, color, x_shift=0, y_shift=0):
    """cx_center=0 → screen center. Nonzero → text centered at that x."""
    w_, h_ = tsz(text, f)
    base_x = W//2 if cx_center == 0 else cx_center
    px = base_x - w_//2 + x_shift
    py = cy_center - h_//2 + y_shift
    if px+w_ <= 0 or py+h_ <= 0 or px >= W or py >= H: return
    x0=max(0,px); y0=max(0,py); x1=min(W,px+w_); y1=min(H,py+h_)
    if x1<=x0 or y1<=y0: return
    layer = Image.new('RGBA', (w_,h_), 0)
    ImageDraw.Draw(layer).text((0,0), text, font=f, fill=(*color,255))
    arr = np.array(layer, dtype=np.float32)
    lx0=x0-px; ly0=y0-py
    rgb = arr[ly0:ly0+(y1-y0), lx0:lx0+(x1-x0), :3]
    a   = arr[ly0:ly0+(y1-y0), lx0:lx0+(x1-x0), 3:4] / 255.0
    canvas_f[y0:y1, x0:x1] = canvas_f[y0:y1, x0:x1]*(1-a) + rgb*a

def draw_hline(canvas_f, x0, x1, y, color, width=4):
    ya=max(0,y); yb=min(H,y+width); xa=max(0,x0); xb=min(W,x1)
    if ya<yb and xa<xb:
        canvas_f[ya:yb, xa:xb] = np.array(color, dtype=np.float32)

def draw_rect_outline(canvas_f, x0, y0, x1, y1, color, bw=4):
    """Draws a rectangle outline (border only)."""
    c = np.array(color, dtype=np.float32)
    # Top/bottom
    canvas_f[y0:y0+bw, x0:x1] = c
    canvas_f[y1-bw:y1, x0:x1] = c
    # Left/right
    canvas_f[y0:y1, x0:x0+bw] = c
    canvas_f[y0:y1, x1-bw:x1] = c

def particles(canvas_f, t, seed_off=0, n=20):
    for i in range(n):
        _r = np.random.default_rng(i*13 + seed_off)
        px = int(_r.integers(60, W-60))
        py_b = int(_r.integers(40, H-200))
        py = int((py_b - 18*t) % (H-200))
        sz = int(_r.integers(2, 5))
        alpha = 0.5 + 0.4*math.sin(t*2 + i*0.8)
        if 0<=px<W and 0<=py<H:
            canvas_f[max(0,py-sz):py+sz, max(0,px-sz):px+sz] = \
                np.array(GRAY, dtype=np.float32) * alpha

# ── Stat box helper ────────────────────────────────────────────────────────────
def draw_stat_box(canvas_f, cx, cy, value, label, color, progress):
    """Animates a stat: border draws in, value slams up, label fades in."""
    bw, bh = 280, 130
    x0, y0 = cx-bw//2, cy-bh//2
    x1, y1 = cx+bw//2, cy+bh//2
    # Border draws clockwise proportional to progress
    p = xo(progress)
    # Draw solid border when fully in
    if p > 0.05:
        # Fade-in the box border
        alpha_border = min(1.0, p*3)
        bc = np.array(color, dtype=np.float32) * alpha_border
        # Top line (draws left to right)
        top_x = x0 + int((x1-x0) * min(1.0, p*2))
        canvas_f[y0:y0+3, x0:top_x] = bc
        if p > 0.5:
            canvas_f[y0:y1, x1-3:x1] = bc
            canvas_f[y1-3:y1, x0:x1] = bc
            canvas_f[y0:y1, x0:x0+3] = bc
    # Value slams in
    if progress > 0.3:
        slam_p = min(1.0, (progress-0.3)/0.4)
        draw_text_on(canvas_f, value, cx, cy-18, F(68), color,
                     y_shift=int(lp(-40, 0, bo(slam_p))))
    # Label fades in
    if progress > 0.6:
        draw_text_on(canvas_f, label, cx, cy+38, F(28, bold=False), GRAY)

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1 — Event Announce (t=0–13s)
# ─────────────────────────────────────────────────────────────────────────────
def phase1(cv, t):
    particles(cv, t, seed_off=0)

    # Fade in from black (0–2s)
    if 0 < t < 2.0:
        fade_to(cv, DARK, 1 - xo(rm(t, 0, 2.0)))

    # "FREE LIVE EVENT" badge slams in (1.0–13s)
    if 1.0 < t < 13.0:
        bt = rm(t, 1.0, 1.8)
        sy = int(lp(-80, 220, bo(bt, s=2.0)))
        # Badge background pill
        bw, bh = 520, 72
        bx, by = W//2-bw//2, sy-bh//2
        if 0 < bt and by > 0 and by+bh < H:
            tmp = Image.fromarray(cv.astype(np.uint8))
            d = ImageDraw.Draw(tmp)
            d.rounded_rectangle([bx, by, bx+bw, by+bh], radius=36, fill=(*GOLD,255))
            d.text((W//2, sy), "FREE LIVE EVENT", font=F(44), fill=DARK, anchor='mm')
            cv[:] = np.array(tmp, dtype=np.float32)

    # "The 15-Minute" typewriter (2.5–8s)
    if 2.5 < t < 13.0:
        txt = "The 15-Minute"
        tp = rm(t, 2.5, 5.5)
        n = max(1, int(len(txt)*tp))
        cursor = "|" if int(t*3)%2==0 and t < 6.0 else ""
        draw_text_on(cv, txt[:n]+cursor, 0, 370, F(110), WHITE)

    # "Sales Sprint" slams in (5.0–13s)
    if 5.0 < t < 13.0:
        st = rm(t, 5.0, 5.8)
        draw_text_on(cv, "Sales Sprint", 0, 510, F(110), GOLD,
                     y_shift=int(lp(120, 0, bo(st, s=1.8))))

    # Shimmer scan on "Sales Sprint" (6.5–13s)
    if 6.5 < t < 13.0:
        # Scanning highlight line sweeps across text
        scan_x = int(W//2 - 680 + (1360 * ((t-6.5)/6.5 % 1.0)))
        sw = 60
        y0, y1 = 440, 580
        sx0 = max(0, scan_x-sw); sx1 = min(W, scan_x+sw)
        if sx0 < sx1:
            alpha = 0.12 * (1 - abs(scan_x - W//2) / 680)
            cv[y0:y1, sx0:sx1] = np.clip(
                cv[y0:y1, sx0:sx1] + np.array(GOLD, dtype=np.float32) * alpha, 0, 255)

    # Subtitle (7.5–13s)
    if 7.5 < t < 13.0:
        sub_t = rm(t, 7.5, 9.0)
        draw_text_on(cv, "One powerful play.  Fifteen focused minutes.", 0, 650,
                     F(54, bold=False), GRAY, x_shift=int(lp(-60, 0, xo(sub_t))))

    # Gold accent line under subtitle (8.5–13s)
    if 8.5 < t < 13.0:
        lw = int(W * 0.55 * xo(rm(t, 8.5, 10.0)))
        draw_hline(cv, W//2-lw//2, W//2+lw//2, 690, GOLD, 4)

    # Bottom info bar (10–13s)
    if 10.0 < t < 13.0:
        bt2 = rm(t, 10.0, 11.5)
        draw_text_on(cv, "No pitch  ·  No upsell  ·  Replay if you miss it",
                     0, 820, F(40, bold=False), GRAY,
                     y_shift=int(lp(40, 0, xo(bt2))))
        if t > 11.0:
            url_t = rm(t, 11.0, 12.5)
            n = max(1, int(33*url_t))
            draw_text_on(cv, "15-minute-sales-sprint.netlify.app"[:n],
                         0, 870, F(36, bold=False), TEAL)

    # Flash transition out (12.0–13.0s)
    if 12.0 < t < 13.0:
        fade_to(cv, WHITE, xo(rm(t, 12.0, 13.0)))

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — Full CTA Card (lt = t−13s, runs 0–15s)
# ─────────────────────────────────────────────────────────────────────────────
def phase2(cv, lt):
    particles(cv, lt, seed_off=77, n=14)

    # Flash in from white (0–1.5s)
    if 0 < lt < 1.5:
        fade_to(cv, WHITE, 1 - xo(rm(lt, 0, 1.5)))

    # "FREE REGISTRATION" badge (0.5–15s)
    if 0.5 < lt < 15.0:
        bt = rm(lt, 0.5, 1.3)
        sy = int(lp(-60, 130, bo(bt, s=2.0)))
        bw, bh = 480, 64
        bx, by = W//2-bw//2, sy-bh//2
        if 0 < bt and by > 0 and by+bh < H:
            tmp = Image.fromarray(cv.astype(np.uint8))
            d = ImageDraw.Draw(tmp)
            d.rounded_rectangle([bx, by, bx+bw, by+bh], radius=32,
                                 fill=None, outline=(*GOLD,255), width=3)
            d.text((W//2, sy), "FREE REGISTRATION", font=F(38), fill=GOLD, anchor='mm')
            cv[:] = np.array(tmp, dtype=np.float32)

    # "15 minutes. One idea." — staggered word slam (1.2–15s)
    if 1.2 < lt < 15.0:
        w1t = rm(lt, 1.2, 2.0); w2t = rm(lt, 1.7, 2.5)
        draw_text_on(cv, "15 minutes.", 0, 270, F(110), WHITE,
                     y_shift=int(lp(-120, 0, bo(w1t))))
        draw_text_on(cv, "One idea.", 0, 410, F(110), WHITE,
                     y_shift=int(lp(-120, 0, bo(w2t))))

    # "Zero fluff." with gold glow (2.8–15s)
    if 2.8 < lt < 15.0:
        zt = rm(lt, 2.8, 3.8)
        gs = 0.45 + 0.25*math.sin(lt*4.0)
        if zt > 0.5:
            glow(cv, G_ZF_rgb, G_ZF_a, gs)
        draw_text_on(cv, "Zero fluff.", 0, 540, F(140), GOLD,
                     y_shift=int(lp(80, 0, bo(zt, s=2.2))))

    # Gold separator (4.0–15s)
    if 4.0 < lt < 15.0:
        lw = int(W * 0.70 * xo(rm(lt, 4.0, 5.0)))
        draw_hline(cv, W//2-lw//2, W//2+lw//2, 615, GOLD, 3)

    # Stats: $0 | 10 Min | 82% — staggered (5.0–15s)
    stat_data = [
        (W//2-580, "$0",    "Ad spend required"),
        (W//2,      "10 Min","Done before coffee #2"),
        (W//2+580,  "82%",   "B2B buyers on LinkedIn first"),
    ]
    for si, (cx, val, lbl) in enumerate(stat_data):
        sp = rm(lt, 5.0 + si*0.5, 15.0)
        if sp > 0:
            draw_stat_box(cv, cx, 710, val, lbl, TEAL, sp)

    # "Reserve My Spot >>" button (8.5–15s)
    if 8.5 < lt < 15.0:
        rp = rm(lt, 8.5, 9.5)
        pulse = 1.0 + 0.04*math.sin(lt*6) if lt > 10 else 1.0
        gs = (0.30 + 0.20*math.sin(lt*5)) if lt > 10 else 0
        if gs > 0:
            glow(cv, G_BTN_rgb, G_BTN_a, gs)
        btn_txt = "Reserve My Spot  >>"
        bw, bh = int(820*pulse), int(96*pulse)
        bx, by = W//2-bw//2, 870-bh//2
        by_anim = by + int(lp(80, 0, bo(rp)))
        if by_anim > 0:
            tmp = Image.fromarray(cv.astype(np.uint8))
            d = ImageDraw.Draw(tmp)
            d.rounded_rectangle([bx, by_anim, bx+bw, by_anim+bh],
                                 radius=48, fill=(*GOLD,255))
            d.text((W//2, by_anim+bh//2), btn_txt, font=F(52), fill=DARK, anchor='mm')
            cv[:] = np.array(tmp, dtype=np.float32)

    # URL typewriter (10.5–15s)
    if 10.5 < lt < 15.0:
        url = "15-minute-sales-sprint.netlify.app"
        up = rm(lt, 10.5, 12.5)
        n = max(1, int(len(url)*up))
        cursor = "|" if int(lt*3)%2==0 and lt < 13 else ""
        draw_text_on(cv, url[:n]+cursor, 0, 970, F(40, bold=False), TEAL)

    # Date line (12.5–15s)
    if 12.5 < lt < 15.0:
        dt = rm(lt, 12.5, 13.5)
        draw_text_on(cv, "Wed June 17  ·  7:00 PM ET  ·  15 Minutes  ·  100% Free",
                     0, 1025, F(32, bold=False), GRAY,
                     x_shift=int(lp(-50, 0, xo(dt))))

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3 — Gold Pulse + Fade Out (lt = t−28s, runs 0–3s)
# ─────────────────────────────────────────────────────────────────────────────
def phase3(cv, lt):
    # Brief gold screen flash then to black
    if 0 < lt < 1.2:
        glow(cv, G_BTN_rgb, G_BTN_a, 0.6 * (1 - lt/1.2))
    fade_to(cv, (0,0,0), xo(rm(lt, 0.3, 3.0)))

# ─────────────────────────────────────────────────────────────────────────────
# MAIN RENDER
# ─────────────────────────────────────────────────────────────────────────────
def render(fi):
    t = fi / FPS
    cv = base_canvas()

    if   t < 13.0: phase1(cv, t)
    elif t < 28.0: phase2(cv, t-13.0)
    else:          phase3(cv, t-28.0)

    return np.clip(cv, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    sys.stderr.write(f"Rendering outro {TOTAL} frames...\n"); sys.stderr.flush()
    for i in range(TOTAL):
        if i%150==0:
            sys.stderr.write(f"  {i}/{TOTAL}  t={i/FPS:.1f}s\n"); sys.stderr.flush()
        sys.stdout.buffer.write(render(i).tobytes())
    sys.stderr.write("Done.\n")
