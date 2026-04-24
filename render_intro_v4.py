#!/usr/bin/env python3
"""
Hollywood NotebookLM intro — v4 (numpy-blended, ~50fps capable)
KEY OPTIMIZATION: All compositing via numpy float32. No per-frame PIL Images for blending.
Duration: 41s × 30fps = 1230 frames → stdout raw RGB24
"""
import sys, math
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1920, 1080, 30
TOTAL = int(41 * FPS)

# Brand palette
BG     = (10, 14, 26)
ORANGE = (255, 115, 0)
GOLD   = (245, 166, 35)
TEAL   = (0, 229, 255)
WHITE  = (255, 255, 255)
GRAY   = (110, 125, 145)

BOLD = '/usr/share/fonts/truetype/google-fonts/Poppins-Bold.ttf'
REG  = '/usr/share/fonts/truetype/lato/Lato-Regular.ttf'

_fc = {}
def F(size, bold=True):
    k=(size,bold)
    if k not in _fc: _fc[k]=ImageFont.truetype(BOLD if bold else REG,size)
    return _fc[k]

# ── Easing ────────────────────────────────────────────────────────────────────
def xo(t): t=max(0.,min(1.,t)); return 1. if t>=1 else 1-2**(-10*t)
def bo(t,s=1.7): t=max(0.,min(1.,t)); return 1+(s+1)*(t-1)**3+s*(t-1)**2
def rm(t,a,b): return max(0.,min(1.,(t-a)/(b-a))) if b>a else (1. if t>=b else 0.)
def lp(a,b,t): return a+(b-a)*t

# ── Text size helper ──────────────────────────────────────────────────────────
_dd = ImageDraw.Draw(Image.new('L',(1,1)))
def tsz(txt, f): b=_dd.textbbox((0,0),txt,font=f); return b[2]-b[0],b[3]-b[1]

# ── Grain ─────────────────────────────────────────────────────────────────────
_gr = np.random.default_rng(42).integers(0,18,(H,W,3),dtype=np.uint8)

def base_canvas():
    c=np.full((H,W,3),BG,dtype=np.float32)
    c+=(_gr*0.04)
    return np.clip(c,0,255)

# ── Precompute glow layers as (RGB float32, alpha float32) ────────────────────
def build_glow(text, cx, cy, f, color, radius):
    g=Image.new('RGBA',(W,H),0)
    ImageDraw.Draw(g).text((cx,cy),text,font=f,fill=(*color,255),anchor='mm')
    b=np.array(g.filter(ImageFilter.GaussianBlur(radius)),dtype=np.float32)
    return b[:,:,:3], b[:,:,3:4]/255.0  # (H,W,3), (H,W,1)

sys.stderr.write("Building glow layers...\n"); sys.stderr.flush()
G_FREE_rgb, G_FREE_a = build_glow("FREE.", W//2, H//2-30, F(220), GOLD, 50)
G_5_rgb,   G_5_a    = build_glow("5", W//2+390, H//2-80, F(220), GOLD, 50)
sys.stderr.write("Done.\n"); sys.stderr.flush()

def glow(canvas_f, rgb, alpha, strength):
    """Blend precomputed glow onto float32 canvas in-place."""
    a=alpha*strength
    canvas_f[:]=canvas_f*(1-a)+rgb*a

# ── Overlay helpers (numpy, no PIL Image creation) ────────────────────────────
def fade_to(canvas_f, color_rgb, alpha_01):
    """alpha_01 0=canvas 1=color"""
    if alpha_01<=0: return
    col=np.array(color_rgb,dtype=np.float32)
    canvas_f[:]=canvas_f*(1-alpha_01)+col*alpha_01

# ── Draw text utilities (PIL → numpy paste) ───────────────────────────────────
def draw_text_on(canvas_f, text, cx_center, cy_center, f, color, x_shift=0, y_shift=0):
    """Draw text centered at (cx_center,cy_center). cx_center=0 → screen center."""
    w_,h_=tsz(text,f)
    base_x = W//2 if cx_center==0 else cx_center
    px=base_x-w_//2+x_shift; py=cy_center-h_//2+y_shift
    # Clip to canvas
    if px+w_<=0 or py+h_<=0 or px>=W or py>=H: return
    # Create small text layer
    x0=max(0,px); y0=max(0,py)
    x1=min(W,px+w_); y1=min(H,py+h_)
    if x1<=x0 or y1<=y0: return
    layer=Image.new('RGBA',(w_,h_),0)
    ImageDraw.Draw(layer).text((0,0),text,font=f,fill=(*color,255))
    arr=np.array(layer,dtype=np.float32)
    # Crop layer to visible region
    lx0=x0-px; ly0=y0-py; lx1=lx0+(x1-x0); ly1=ly0+(y1-y0)
    rgb=arr[ly0:ly1,lx0:lx1,:3]
    a=arr[ly0:ly1,lx0:lx1,3:4]/255.0
    canvas_f[y0:y1,x0:x1]=canvas_f[y0:y1,x0:x1]*(1-a)+rgb*a

def draw_line_on(canvas_f, x0, y0, x1, y1, color, width=5):
    """Draw horizontal/vertical line on float32 canvas."""
    c=np.array(color,dtype=np.float32)
    if y0==y1:  # horizontal
        ya=max(0,y0); yb=min(H,y0+width); xa=max(0,x0); xb=min(W,x1)
        if ya<yb and xa<xb: canvas_f[ya:yb,xa:xb]=c
    else:  # vertical
        xa=max(0,x0); xb=min(W,x0+width); ya=max(0,y0); yb=min(H,y1)
        if xa<xb and ya<yb: canvas_f[ya:yb,xa:xb]=c

def lower_third(canvas_f):
    y=H-72
    canvas_f[y:H,:]=np.array([5,8,18],dtype=np.float32)
    canvas_f[y:y+3,:]=np.array(GOLD,dtype=np.float32)
    # Text via PIL
    tmp=Image.fromarray(canvas_f.astype(np.uint8))
    d=ImageDraw.Draw(tmp)
    d.text((60,y+8),"Scott Magnacca",font=F(36),fill=WHITE)
    d.text((60,y+46),"Harvard ALM  ·  Babson MBA  ·  4,127+ Sales Pros Trained",
           font=F(24,bold=False),fill=GRAY)
    canvas_f[:]=np.array(tmp,dtype=np.float32)

def draw_rays(canvas_f, cx, cy, progress, color, n=24, max_len=200):
    c=np.array(color,dtype=np.float32)
    length=int(max_len*xo(progress))
    if length<5: return
    tmp=Image.fromarray(canvas_f.astype(np.uint8))
    d=ImageDraw.Draw(tmp)
    for i in range(n):
        ang=i/n*2*math.pi+0.2
        x1i=cx+int(math.cos(ang)*40); y1i=cy+int(math.sin(ang)*40)
        x2i=cx+int(math.cos(ang)*(40+length)); y2i=cy+int(math.sin(ang)*(40+length))
        d.line([(x1i,y1i),(x2i,y2i)],fill=(*color,),width=3)
    canvas_f[:]=np.array(tmp,dtype=np.float32)

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 1 — THE PAIN (t=0–17s)
# ─────────────────────────────────────────────────────────────────────────────
def phase1(cv, t):
    # Particles
    rng=np.random.default_rng(0)
    for i in range(16):
        _r=np.random.default_rng(i*17)
        px=int(_r.integers(80,W-80)); py_b=int(_r.integers(60,H-280))
        py=int((py_b-22*t)%(H-280)); sz=int(_r.integers(2,5))
        if 0<=px<W and 0<=py<H:
            cv[max(0,py-sz):py+sz,max(0,px-sz):px+sz]=np.array(GRAY,dtype=np.float32)

    # "MOST" word slam — t=1.2, clears at t=4.8 before counter
    if 1.2<t<4.8:
        pt=rm(t,1.2,1.65)
        draw_text_on(cv,"MOST",0,220+int(lp(-110,0,bo(pt))),F(148),WHITE)

    # "SALESPEOPLE" — t=1.7, clears at t=4.8
    if 1.7<t<4.8:
        pt=rm(t,1.7,2.15)
        draw_text_on(cv,"SALESPEOPLE",0,355+int(lp(-110,0,bo(pt))),F(148),WHITE)

    # Context line — clears at t=4.8
    if 3.0<t<4.8:
        xt=rm(t,3.0,4.0)
        xs=int(lp(-65,0,xo(xt)))
        draw_text_on(cv,"spend preparing for every important first meeting.",0,415,
                     F(48,bold=False),GRAY,x_shift=xs)

    # Orange sweep bar — clears at t=4.8
    if 3.5<t<4.8:
        bt=rm(t,3.5,4.2)
        bw=int(W*0.52*xo(bt))
        draw_line_on(cv,W//2-bw//2,458,W//2+bw//2,458,ORANGE,5)

    # Counter 30→45, slides in from right (t=5.0–9.0)
    if t>5.0:
        vals=[30,33,36,39,42,44,45]
        ct=rm(t,5.0,9.0)
        idx=min(int(ct*(len(vals)-1)),len(vals)-1)
        val=vals[idx]
        numstr=str(val)
        f_big=F(280)
        nw,nh=tsz(numstr,f_big)
        slide_t=rm(t,5.0,6.5)
        x=int(lp(W+60,W//2-nw//2,xo(slide_t)))
        if val==45 and ct>0.96:
            sh_t=(ct-0.96)/0.10
            x+=int(10*math.exp(-sh_t*5)*math.cos(sh_t*25))
        # Draw via PIL (large text)
        tmp=Image.fromarray(cv.astype(np.uint8))
        ImageDraw.Draw(tmp).text((x,H//2-nh//2-40),numstr,font=f_big,fill=ORANGE)
        cv[:]=np.array(tmp,dtype=np.float32)

    # "MINUTES OF SALES PREP"
    if t>9.2:
        lw=int(W*0.46*xo(rm(t,9.2,10.0)))
        draw_line_on(cv,W//2-lw//2,H//2+158,W//2+lw//2,H//2+158,ORANGE,6)
        draw_text_on(cv,"MINUTES OF SALES PREP",0,H//2+195,F(68),WHITE)

    # Flash-out to white (t=16.3–17.0)
    if t>16.3:
        fade_to(cv,WHITE,min(1.0,0.94*math.sin(rm(t,16.3,17.0)*math.pi)))

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 2 — THE TRANSFORMATION (lt=0–12s)
# ─────────────────────────────────────────────────────────────────────────────
def phase2(cv, lt):
    # Flash-in from white
    if lt<0.5:
        fade_to(cv,WHITE,1-lt/0.5)

    # "WHAT IF" scale slam — clears at lt=2.8 before 45 slides in at lt=3.0
    if 0.4<lt<2.8:
        wt=rm(lt,0.4,1.6)
        sc=lp(0.25,1.0,bo(wt))
        draw_text_on(cv,"WHAT IF",0,H//2-80,F(max(24,int(180*sc))),WHITE)

    # Subtitle — clears at lt=2.8
    if 2.0<lt<2.8:
        draw_text_on(cv,"you could compress this...",0,H//2+80,F(50,bold=False),GRAY)

    # Number row: center at H//2-80 (upper half of frame, balanced)
    NUM_CY = H//2 - 80   # 460px — gives room above and below
    LBL_CY = NUM_CY + 148  # 608px — label below number

    # LEFT: 45 slides to left
    rx_left=W//2-390
    if lt>3.0:
        lt2=rm(lt,3.0,4.2)
        cxl=int(lp(W//2,rx_left,xo(lt2)))
        draw_text_on(cv,"45",cxl,NUM_CY,F(220),ORANGE)
        draw_text_on(cv,"MINUTES",cxl,LBL_CY,F(58),ORANGE)

    # Arrow
    if lt>4.2:
        at=rm(lt,4.2,5.0)
        draw_text_on(cv,"→",0,NUM_CY+20,F(100),WHITE)

    # RIGHT: countdown 45→5
    rx=W//2+390
    if lt>4.5:
        vals=[45,40,35,30,25,20,15,10,8,6,5]
        ct=rm(lt,4.5,9.5)
        idx=min(int(ct*(len(vals)-1)),len(vals)-1)
        cv_val=vals[idx]
        step_p=(ct*(len(vals)-1))-int(ct*(len(vals)-1))
        slam_s=lp(1.4,1.0,bo(min(step_p*6,1.0)))
        rcolor=GOLD if cv_val==5 else WHITE
        draw_text_on(cv,str(cv_val),rx,NUM_CY,F(max(24,int(220*slam_s))),rcolor)
        draw_text_on(cv,"MINUTES",rx,LBL_CY,F(58),rcolor)

        # Explosion when 5 lands
        if cv_val==5:
            bt=rm(lt,9.2,11.5)
            if bt>0:
                draw_rays(cv,rx,NUM_CY,bt,GOLD)
            gs=0.55+0.25*math.sin(lt*3)
            glow(cv,G_5_rgb,G_5_a,gs)
            # Redraw sharp 5
            draw_text_on(cv,"5",rx,NUM_CY,F(220),GOLD)
            # Gold pulse
            if bt>0 and bt<0.4:
                fade_to(cv,GOLD,0.12*(1-bt/0.4))

    # Checklist (lt=9.8)
    if lt>9.8:
        checks=[">>  Full Research Quality",
                ">>  Complete Prospect Profile",
                ">>  Walk In Warm + Ready"]
        for ci,ch in enumerate(checks):
            cht=rm(lt,9.8+ci*0.65,10.5+ci*0.65)
            if cht>0:
                # Slide in from right (800→0), land centered
                draw_text_on(cv,ch,0,H-290+ci*72,F(42,bold=False),TEAL,
                             x_shift=int(lp(800,0,xo(cht))))

    # Flash to black
    if lt>11.2:
        fade_to(cv,(0,0,0),xo(rm(lt,11.2,12.0)))

# ─────────────────────────────────────────────────────────────────────────────
# PHASE 3 — FREE + NOTEBOOKLM (lt=0–12s)
# ─────────────────────────────────────────────────────────────────────────────
def phase3(cv, lt):
    # "...for"
    if lt>0.5 and lt<9.0:
        draw_text_on(cv,"...for",0,H//2-200,F(68,bold=False),GRAY)

    # "FREE." slams from top, clears at lt=9.2 before NotebookLM
    if 0.8<lt<9.2:
        flt=rm(lt,0.8,1.8)
        y_pos=int(lp(-160,H//2-30,bo(flt,s=2.2)))
        if flt>0.82 and flt<1.0:
            sp=(flt-0.82)/0.18
            y_pos+=int(14*math.exp(-sp*4)*math.cos(sp*30))
        fw,fh=tsz("FREE.",F(220))
        tmp=Image.fromarray(cv.astype(np.uint8))
        ImageDraw.Draw(tmp).text((W//2-fw//2,y_pos-fh//2),"FREE.",font=F(220),fill=GOLD)
        cv[:]=np.array(tmp,dtype=np.float32)

    # Pulsing glow (steady)
    if 1.8<lt<8.5:
        gs=0.55+0.25*math.sin(lt*3.5)
        glow(cv,G_FREE_rgb,G_FREE_a,gs)
        # Redraw sharp FREE on top
        fw,fh=tsz("FREE.",F(220))
        tmp=Image.fromarray(cv.astype(np.uint8))
        ImageDraw.Draw(tmp).text((W//2-fw//2,H//2-fh//2-30),"FREE.",font=F(220),fill=GOLD)
        cv[:]=np.array(tmp,dtype=np.float32)

    # "Powered by Google"
    if lt>2.8 and lt<8.5:
        draw_text_on(cv,"Powered by Google  ·  100% Free to Use",
                     0,H//2+175,F(50,bold=False),TEAL)

    # Fade FREE out
    if lt>7.5 and lt<9.5:
        fade_to(cv,(0,0,0),xo(rm(lt,7.5,9.2)))

    # "NotebookLM" typewriter
    if lt>9.2:
        nlm="NotebookLM"
        type_t=rm(lt,9.2,11.2)
        n_chars=max(1,int(len(nlm)*type_t))
        cursor="|" if int(lt*2.5)%2==0 else ""
        display=nlm[:n_chars]+cursor
        fw,fh=tsz(display,F(200))
        tmp=Image.fromarray(cv.astype(np.uint8))
        ImageDraw.Draw(tmp).text((W//2-fw//2,H//2-fh//2-30),display,font=F(200),fill=GOLD)
        cv[:]=np.array(tmp,dtype=np.float32)
        if type_t>0.9:
            draw_text_on(cv,"Your AI Research Co-Pilot",0,H//2+110,F(54,bold=False),TEAL)

# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────
def render(fi):
    t=fi/FPS
    cv=base_canvas()

    if   t<17.0: phase1(cv,t)
    elif t<29.0: phase2(cv,t-17.0)
    else:        phase3(cv,t-29.0)

    lower_third(cv)

    # Global fade in/out
    if t<1.5:  fade_to(cv,(0,0,0),1-xo(t/1.5))
    if t>40.0: fade_to(cv,(0,0,0),xo(rm(t,40.0,41.0)))

    return np.clip(cv,0,255).astype(np.uint8)

if __name__=='__main__':
    sys.stderr.write(f"Rendering {TOTAL} frames...\n"); sys.stderr.flush()
    for i in range(TOTAL):
        if i%150==0:
            sys.stderr.write(f"  {i}/{TOTAL}  t={i/FPS:.1f}s\n"); sys.stderr.flush()
        sys.stdout.buffer.write(render(i).tobytes())
    sys.stderr.write("Done.\n")
