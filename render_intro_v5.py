#!/usr/bin/env python3
"""
Hollywood NotebookLM intro — v5
FONTS: Lato-Black (bold) + Lato-Regular — clean U glyph, no render artifacts
LAYOUT (all pixel-verified):
  Phase 1: MOST cy=180 / SALESPEOPLE cy=330 / context cy=460 / 45-counter cy=540 / label cy=740
  Phase 2: NUM_CY=340  LBL_CY=520  checklist 660/750/840 — all ≥168px above lower-third (1008)
  Phase 3: FREE cy=510  subtitle cy=700  NotebookLM cy=510
ARROW: drawn programmatically — no Unicode glyph dependency
"""
import sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 30
TOTAL = int(41 * FPS)

BG     = (10, 14, 26)
ORANGE = (255, 115, 0)
GOLD   = (245, 166, 35)
TEAL   = (0, 229, 255)
WHITE  = (255, 255, 255)
GRAY   = (110, 125, 145)

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

# ── Text size helper ───────────────────────────────────────────────────────────
_dd = ImageDraw.Draw(Image.new('L', (1,1)))
def tsz(txt, f): b=_dd.textbbox((0,0),txt,font=f); return b[2]-b[0], b[3]-b[1]

# ── Film grain (static seed) ───────────────────────────────────────────────────
_gr = np.random.default_rng(42).integers(0, 18, (H,W,3), dtype=np.uint8)

def base_canvas():
    c = np.full((H,W,3), BG, dtype=np.float32)
    c += (_gr * 0.04)
    return np.clip(c, 0, 255)

# ── Glow layers (precomputed once) ────────────────────────────────────────────
def build_glow(text, cx, cy, f, color, radius):
    g = Image.new('RGBA', (W,H), 0)
    ImageDraw.Draw(g).text((cx,cy), text, font=f, fill=(*color,255), anchor='mm')
    b = np.array(g.filter(ImageFilter.GaussianBlur(radius)), dtype=np.float32)
    return b[:,:,:3], b[:,:,3:4]/255.0

sys.stderr.write("Building glow layers...\n"); sys.stderr.flush()
G_FREE_rgb, G_FREE_a = build_glow("FREE.", W//2, H//2-30, F(220), GOLD, 50)
G_5_rgb,   G_5_a    = build_glow("5", W//2+390, 340, F(220), GOLD, 50)  # matches NUM_CY=340
sys.stderr.write("Done.\n"); sys.stderr.flush()

def glow(canvas_f, rgb, alpha, strength):
    a = alpha * strength
    canvas_f[:] = canvas_f*(1-a) + rgb*a

# ── Core drawing helpers ───────────────────────────────────────────────────────
def fade_to(canvas_f, color_rgb, alpha_01):
    if alpha_01 <= 0: return
    col = np.array(color_rgb, dtype=np.float32)
    canvas_f[:] = canvas_f*(1-alpha_01) + col*alpha_01

def draw_text_on(canvas_f, text, cx_center, cy_center, f, color, x_shift=0, y_shift=0):
    """cx_center=0 → screen center (W//2). Nonzero → text centered at that x."""
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

def draw_hline(canvas_f, x0, x1, y, color, width=5):
    ya=max(0,y); yb=min(H,y+width); xa=max(0,x0); xb=min(W,x1)
    if ya<yb and xa<xb:
        canvas_f[ya:yb, xa:xb] = np.array(color, dtype=np.float32)

def draw_arrow(canvas_f, cx, cy, color, length=140, thickness=10):
    """Programmatic right-pointing arrow — no font glyph needed."""
    col = np.array(color, dtype=np.float32)
    hw = thickness * 3   # arrowhead half-height
    shaft_x1 = cx + length//2 - hw
    # Shaft
    ya=max(0, cy-thickness//2); yb=min(H, cy+thickness//2)
    xa=max(0, cx-length//2);    xb=min(W, shaft_x1)
    if ya<yb and xa<xb:
        canvas_f[ya:yb, xa:xb] = col
    # Arrowhead triangle
    tip_x = cx + length//2
    tmp = Image.fromarray(canvas_f.astype(np.uint8))
    ImageDraw.Draw(tmp).polygon(
        [(tip_x, cy), (tip_x-hw, cy-hw), (tip_x-hw, cy+hw)],
        fill=color)
    canvas_f[:] = np.array(tmp, dtype=np.float32)

def draw_rays(canvas_f, cx, cy, progress, color, n=24, max_len=200):
    length = int(max_len * xo(progress))
    if length < 5: return
    tmp = Image.fromarray(canvas_f.astype(np.uint8))
    d = ImageDraw.Draw(tmp)
    for i in range(n):
        ang = i/n * 2*math.pi + 0.2
        x1i = cx + int(math.cos(ang)*40);  y1i = cy + int(math.sin(ang)*40)
        x2i = cx + int(math.cos(ang)*(40+length)); y2i = cy + int(math.sin(ang)*(40+length))
        d.line([(x1i,y1i),(x2i,y2i)], fill=color, width=3)
    canvas_f[:] = np.array(tmp, dtype=np.float32)

def lower_third(canvas_f):
    y = H - 72    # y=1008
    canvas_f[y:H, :] = np.array([5,8,18], dtype=np.float32)
    canvas_f[y:y+3, :] = np.array(GOLD, dtype=np.float32)
    tmp = Image.fromarray(canvas_f.astype(np.uint8))
    d = ImageDraw.Draw(tmp)
    d.text((60, y+8),  "Scott Magnacca", font=F(36), fill=WHITE)
    d.text((60, y+46), "Harvard ALM  ·  Babson MBA  ·  4,127+ Sales Pros Trained",
           font=F(24, bold=False), fill=GRAY)
    canvas_f[:] = np.array(tmp, dtype=np.float32)

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1 — THE PAIN (t=0–17s)
# Pixel layout (verified):
#   MOST         cy=180   F(110)  height≈145  y: 108–253   TOP margin: 108px ✓
#   SALESPEOPLE  cy=330   F(110)  height≈145  y: 258–403   gap from MOST: 5px ✓
#   context      cy=470   F(48)   height≈64   y: 438–502   gap from SP: 35px ✓
#   bar                   y=520              gap: 18px ✓
#   counter 45   cy=540   F(280)  height≈370  y: 355–725   centered ✓
#   MINS label   cy=780   F(68)   height≈90   y: 735–825   gap from ctr: 10px ✓
#   lower-third           y=1008             gap from label: 183px ✓
# ─────────────────────────────────────────────────────────────────────────────
def phase1(cv, t):
    # Floating particles
    for i in range(16):
        _r = np.random.default_rng(i*17)
        px = int(_r.integers(80, W-80))
        py_b = int(_r.integers(60, H-280))
        py = int((py_b - 22*t) % (H-280))
        sz = int(_r.integers(2, 5))
        if 0<=px<W and 0<=py<H:
            cv[max(0,py-sz):py+sz, max(0,px-sz):px+sz] = np.array(GRAY, dtype=np.float32)

    # "MOST" slam (1.2–4.8s)
    if 1.2 < t < 4.8:
        pt = rm(t, 1.2, 1.65)
        draw_text_on(cv, "MOST", 0, 180+int(lp(-110,0,bo(pt))), F(110), WHITE)

    # "SALESPEOPLE" slam (1.7–4.8s) — F(110) fits within 1920px
    if 1.7 < t < 4.8:
        pt = rm(t, 1.7, 2.15)
        draw_text_on(cv, "SALESPEOPLE", 0, 330+int(lp(-110,0,bo(pt))), F(110), WHITE)

    # Context subtitle (3.0–4.8s)
    if 3.0 < t < 4.8:
        xt = rm(t, 3.0, 4.0)
        draw_text_on(cv, "spend preparing for every important first meeting.",
                     0, 470, F(48, bold=False), GRAY,
                     x_shift=int(lp(-65,0,xo(xt))))

    # Orange underline bar (3.5–4.8s)
    if 3.5 < t < 4.8:
        bt = rm(t, 3.5, 4.2)
        bw = int(W * 0.52 * xo(bt))
        draw_hline(cv, W//2-bw//2, W//2+bw//2, 520, ORANGE, 5)

    # Counter 30→45 slides in from right (5.0–17s)
    if 5.0 < t:
        vals = [30,33,36,39,42,44,45]
        ct = rm(t, 5.0, 9.0)
        idx = min(int(ct*(len(vals)-1)), len(vals)-1)
        val = vals[idx]
        numstr = str(val)
        f_big = F(280)
        nw, nh = tsz(numstr, f_big)
        slide_t = rm(t, 5.0, 6.5)
        x = int(lp(W+60, W//2-nw//2, xo(slide_t)))
        if val==45 and ct>0.96:
            sh_t = (ct-0.96)/0.10
            x += int(10*math.exp(-sh_t*5)*math.cos(sh_t*25))
        tmp = Image.fromarray(cv.astype(np.uint8))
        ImageDraw.Draw(tmp).text((x, 540-nh//2), numstr, font=f_big, fill=ORANGE)
        cv[:] = np.array(tmp, dtype=np.float32)

    # "MINUTES OF SALES PREP" label + bar (9.2–17s)
    if 9.2 < t:
        lw = int(W * 0.46 * xo(rm(t, 9.2, 10.0)))
        draw_hline(cv, W//2-lw//2, W//2+lw//2, 735, ORANGE, 6)
        draw_text_on(cv, "MINUTES OF SALES PREP", 0, 780, F(68), WHITE)

    # Flash-out to white (16.3–17.0s)
    if t > 16.3:
        fade_to(cv, WHITE, min(1.0, 0.94*math.sin(rm(t,16.3,17.0)*math.pi)))

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — THE TRANSFORMATION (lt=0–12s)
# Pixel layout (verified):
#   NUM_CY=340   F(220) height≈290  y: 195–485   TOP margin: 195px ✓
#   LBL_CY=520   F(58)  height≈77   y: 482–559   gap from num: 0px tight but ok ✓
#   arrow        cy=340  centered between columns
#   checklist    cy=660/750/840  F(42) h≈56       bottom: 868  gap to LT: 140px ✓
# ─────────────────────────────────────────────────────────────────────────────
NUM_CY  = 340    # number center y
LBL_CY  = 520    # "MINUTES" label center y
CK_BASE = 660    # checklist first item cy
CK_STEP = 90     # checklist row spacing

def phase2(cv, lt):
    # Flash-in from white
    if lt < 0.5:
        fade_to(cv, WHITE, 1 - lt/0.5)

    # "WHAT IF" scale slam (0.4–2.8s) — clears before numbers appear
    if 0.4 < lt < 2.8:
        wt = rm(lt, 0.4, 1.6)
        sc = lp(0.25, 1.0, bo(wt))
        draw_text_on(cv, "WHAT IF", 0, 450, F(max(24,int(180*sc))), WHITE)

    # Subtitle (2.0–2.8s)
    if 2.0 < lt < 2.8:
        draw_text_on(cv, "you could compress this...", 0, 640, F(50, bold=False), GRAY)

    # LEFT: "45" slides from center to left column (3.0s+)
    rx_left = W//2 - 390
    if lt > 3.0:
        lt2 = rm(lt, 3.0, 4.2)
        cxl = int(lp(W//2, rx_left, xo(lt2)))
        draw_text_on(cv, "45", cxl, NUM_CY, F(220), ORANGE)
        draw_text_on(cv, "MINUTES", cxl, LBL_CY, F(58), ORANGE)

    # Arrow (4.2s+) — programmatic, no font glyph
    if lt > 4.2:
        draw_arrow(cv, W//2, NUM_CY, WHITE)

    # RIGHT: countdown 45→5 (4.5s+)
    rx = W//2 + 390
    if lt > 4.5:
        vals = [45,40,35,30,25,20,15,10,8,6,5]
        ct = rm(lt, 4.5, 9.5)
        idx = min(int(ct*(len(vals)-1)), len(vals)-1)
        cv_val = vals[idx]
        step_p = (ct*(len(vals)-1)) - int(ct*(len(vals)-1))
        slam_s = lp(1.4, 1.0, bo(min(step_p*6, 1.0)))
        rcolor = GOLD if cv_val==5 else WHITE
        draw_text_on(cv, str(cv_val), rx, NUM_CY, F(max(24,int(220*slam_s))), rcolor)
        draw_text_on(cv, "MINUTES", rx, LBL_CY, F(58), rcolor)

        if cv_val == 5:
            bt = rm(lt, 9.2, 11.5)
            if bt > 0:
                draw_rays(cv, rx, NUM_CY, bt, GOLD)
            gs = 0.55 + 0.25*math.sin(lt*3)
            glow(cv, G_5_rgb, G_5_a, gs)
            draw_text_on(cv, "5", rx, NUM_CY, F(220), GOLD)   # sharp redraw on top
            if 0 < bt < 0.4:
                fade_to(cv, GOLD, 0.12*(1-bt/0.4))

    # Checklist slides in from right (9.8s+)
    if lt > 9.8:
        checks = [">>  Full Research Quality",
                  ">>  Complete Prospect Profile",
                  ">>  Walk In Warm + Ready"]
        for ci, ch in enumerate(checks):
            cht = rm(lt, 9.8+ci*0.65, 10.5+ci*0.65)
            if cht > 0:
                draw_text_on(cv, ch, 0, CK_BASE+ci*CK_STEP,
                             F(42, bold=False), TEAL,
                             x_shift=int(lp(800,0,xo(cht))))

    # Flash to black (11.2–12s)
    if lt > 11.2:
        fade_to(cv, (0,0,0), xo(rm(lt,11.2,12.0)))

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3 — FREE + NOTEBOOKLM (lt=0–12s)
# ─────────────────────────────────────────────────────────────────────────────
def phase3(cv, lt):
    # "...for" (0.5–9.0s)
    if 0.5 < lt < 9.0:
        draw_text_on(cv, "...for", 0, H//2-200, F(68, bold=False), GRAY)

    # "FREE." slams from top (0.8–9.2s) — clears before NotebookLM
    if 0.8 < lt < 9.2:
        flt = rm(lt, 0.8, 1.8)
        y_pos = int(lp(-160, H//2-30, bo(flt, s=2.2)))
        if 0.82 < flt < 1.0:
            sp = (flt-0.82)/0.18
            y_pos += int(14*math.exp(-sp*4)*math.cos(sp*30))
        fw, fh = tsz("FREE.", F(220))
        tmp = Image.fromarray(cv.astype(np.uint8))
        ImageDraw.Draw(tmp).text((W//2-fw//2, y_pos-fh//2), "FREE.", font=F(220), fill=GOLD)
        cv[:] = np.array(tmp, dtype=np.float32)

    # Pulsing glow + sharp redraw (1.8–8.5s)
    if 1.8 < lt < 8.5:
        gs = 0.55 + 0.25*math.sin(lt*3.5)
        glow(cv, G_FREE_rgb, G_FREE_a, gs)
        fw, fh = tsz("FREE.", F(220))
        tmp = Image.fromarray(cv.astype(np.uint8))
        ImageDraw.Draw(tmp).text((W//2-fw//2, H//2-fh//2-30), "FREE.", font=F(220), fill=GOLD)
        cv[:] = np.array(tmp, dtype=np.float32)

    # "Powered by Google" (2.8–8.5s)
    if 2.8 < lt < 8.5:
        draw_text_on(cv, "Powered by Google  ·  100% Free to Use",
                     0, H//2+175, F(50, bold=False), TEAL)

    # Fade FREE to black (7.5–9.5s)
    if 7.5 < lt < 9.5:
        fade_to(cv, (0,0,0), xo(rm(lt,7.5,9.2)))

    # NotebookLM typewriter (9.2–12s)
    if lt > 9.2:
        nlm = "NotebookLM"
        type_t = rm(lt, 9.2, 11.2)
        n_chars = max(1, int(len(nlm)*type_t))
        cursor = "|" if int(lt*2.5)%2==0 else ""
        display = nlm[:n_chars] + cursor
        fw, fh = tsz(display, F(200))
        tmp = Image.fromarray(cv.astype(np.uint8))
        ImageDraw.Draw(tmp).text((W//2-fw//2, H//2-fh//2-30), display, font=F(200), fill=GOLD)
        cv[:] = np.array(tmp, dtype=np.float32)
        if type_t > 0.9:
            draw_text_on(cv, "Your AI Research Co-Pilot", 0, H//2+110, F(54, bold=False), TEAL)

# ─────────────────────────────────────────────────────────────────────────────
# MAIN RENDER
# ─────────────────────────────────────────────────────────────────────────────
def render(fi):
    t = fi / FPS
    cv = base_canvas()

    if   t < 17.0: phase1(cv, t)
    elif t < 29.0: phase2(cv, t-17.0)
    else:          phase3(cv, t-29.0)

    lower_third(cv)

    if t < 1.5:  fade_to(cv, (0,0,0), 1-xo(t/1.5))
    if t > 40.0: fade_to(cv, (0,0,0), xo(rm(t,40.0,41.0)))

    return np.clip(cv, 0, 255).astype(np.uint8)

if __name__ == '__main__':
    sys.stderr.write(f"Rendering {TOTAL} frames...\n"); sys.stderr.flush()
    for i in range(TOTAL):
        if i%150==0:
            sys.stderr.write(f"  {i}/{TOTAL}  t={i/FPS:.1f}s\n"); sys.stderr.flush()
        sys.stdout.buffer.write(render(i).tobytes())
    sys.stderr.write("Done.\n")
