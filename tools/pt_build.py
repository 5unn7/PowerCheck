import sys; sys.path.insert(0,'.')
import numpy as np, json
import pt_pairs as P

HPL=[-1000,0,2000,4000,6000,8000,10000]
OATL=[-50,-40,-30,-20,-10,0,10,20,30]

def geom(key):
    """the two fans of one sheet, keyed by label, rejecting fragments"""
    S=P.sheet(key,verbose=False); C=S["C"]
    hp={}
    # An altitude curve is entered from the torque axis, so a track that never
    # reaches the axis is a fragment, not a curve -- and a fragment silently
    # shifts every label past it.
    cand=[t for t in S["hp"] if S["car"](t[1]).min() < 1.5 and np.ptp(S["car"](t[1])) > 18]
    for (x0,Y,M,sd,n),h in zip(cand[:7],HPL): hp[h]=(S["tq"](M),S["car"](Y))
    oat={}
    for (x0,Y,M,sd,n),o in zip(S["oat"][:9],OATL): oat[o]=(S["car"](Y),S["itt"](M))
    return hp,oat,len(cand)

def ev(x,y,q):
    o=np.argsort(x); a,b=np.asarray(x)[o],np.asarray(y)[o]
    if not (a.min()<=q<=a.max()): return None
    return float(np.interp(q,a,b))

def fuse(A,B,tol,label,lo,hi,step=0.5):
    """average two independent tracings of the same curve where they agree"""
    out={};report=[]
    for k in sorted(set(A)&set(B)):
        xa,ya=A[k]; xb,yb=B[k]
        g=np.arange(lo,hi+1e-9,step)
        pts=[];d=[]
        for q in g:
            va,vb=ev(xa,ya,q),ev(xb,yb,q)
            if va is None or vb is None: continue
            d.append(abs(vb-va))
            if abs(vb-va)<=tol: pts.append((q,(va+vb)/2))
        if len(pts)<8: report.append((k,None,len(pts))); continue
        report.append((k,float(np.median(d)),len(pts)))
        out[k]=(np.array([p[0] for p in pts]),np.array([p[1] for p in pts]))
    print(f"  {label}: {len(out)}/{len(set(A)&set(B))} curves fused")
    for k,md,n in report:
        print(f"     {k:>6}  "+("dropped — no usable overlap" if md is None
              else f"median disagreement {md:5.2f}  over {n} samples"))
    return out

PAIR={"hover":("sh1_hover_gage101","sh3_hover_gage113"),
      "inflight":("sh2_inflight_gage101","sh4_inflight_gage113")}
if __name__=="__main__":
    for nm,(a,b) in PAIR.items():
        ha,oa,na=geom(a); hb,ob,nb=geom(b)
        print(f"=== {nm}   ({na} and {nb} altitude candidates reaching the axis)")
        # the altitude fan is read torque -> carry, so compare it over torque
        fuse(ha,hb,0.6,"altitude fan (carry, at common torque)",42,84,0.5)
        fuse(oa,ob,2.5,"ITT fan (°C, at common carry)",0.5,34,0.5)
