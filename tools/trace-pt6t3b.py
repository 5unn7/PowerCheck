import sys; sys.path.insert(0,'.')
import numpy as np, json
from famtrace import clean, blobrows, sweep, merge
U="/root/.claude/uploads/c1e080e0-41e7-589d-9c2b-797677ada293/"
CAL=json.load(open("/home/user/PowerCheck/docs/pt6t3b-calibration.json"))
HP=[-1000,0,2000,4000,6000,8000,10000]
OAT=[-50,-40,-30,-20,-10,0,10,20,30,40]

def atrow(Y,M,y):
    if Y.min()<=y<=Y.max(): return float(np.interp(y,Y,M))
    k=min(len(Y),80); s=slice(0,k) if y<Y.min() else slice(-k,None)
    return float(np.polyval(np.polyfit(Y[s],M[s],1),y))

def tracks(m,x0,x1,YT,YB,spines,tol=4.5,maxgap=55,minlen=70):
    B=blobrows(m,x0,x1,YT,YB); raw=[]
    for r in spines:
        s=B.get(r,[])
        if len(s)<4: continue
        up=sweep(B,r,s,-1,YT-1,tol,maxgap); dn=sweep(B,r,s,+1,YB,tol,maxgap)  # maxgap carries a dashed curve: the hottest OAT line on every sheet is dashed
        for a,b in zip(up,dn):
            d=dict(a); d.update(b); Y=np.array(sorted(d))
            raw.append((Y,np.array([d[v] for v in Y])))
    out=[]
    for Y,M,sd,n in merge(raw):
        if n<minlen: continue
        sl=abs((M[-1]-M[0])/max(Y[-1]-Y[0],1))
        # the cutoffs (MAXIMUM FOR TAKEOFF / CONTINUOUS) are vertical; the
        # BLEED VALVE OPENS boundaries are near-horizontal. The fans sit
        # between, at roughly 45 degrees, so slope alone rejects both.
        if not (0.30 <= sl <= 2.2): continue
        out.append((Y,M,sd,n))
    return out

def dedupe(ts,gap):
    ts=sorted(ts,key=lambda t:t[0]); out=[]
    for t in ts:
        if out and abs(t[0]-out[-1][0])<gap:
            if t[4]>out[-1][4]: out[-1]=t
            continue
        out.append(t)
    return out

def sheet(key,verbose=True):
    C=CAL[key]; YT,YB=C["plotTop"],C["plotBot"]
    m=clean(U+C["file"],150,20,30)
    tq =lambda x:(x-C["tq40"])/C["pxTq"]+40
    itt=lambda x:(x-C["itt500"])/C["pxItt"]+500
    n1 =lambda x:(x-C["n1x"])/C["pxN1"]+C["n1lo"]
    car=lambda y:(YB-y)/C["pxTq"]
    SP=[YT+30,YT+70,YT+115,YT+165,YT+225,YT+290,(YT+YB)//2,
        YB-230,YB-180,YB-135,YB-95,YB-60,YB-32,YB-14]
    L=tracks(m,250,1580,YT,YB,SP)
    R=tracks(m,int(C["n1x"])-80,2320,YT,YB,SP)
    lo=[(atrow(Y,M,YB-8),Y,M,sd,n) for Y,M,sd,n in L]
    hp =dedupe([t for t in lo if 40<=tq(t[0])<=88], 10)[::-1]
    top=lambda ts:[(atrow(t[1],t[2],YT+6),)+t[1:] for t in ts]
    oat=dedupe(top([t for t in lo if tq(t[0])>88]), 16)
    n1f=dedupe(top([(atrow(Y,M,YB-8),Y,M,sd,n) for Y,M,sd,n in R
                    if C["n1lo"]-4 <= n1(atrow(Y,M,YT+6)) <= C["n1lo"]+24]), 12)
    if verbose:
        h=[tq(t[0]) for t in hp]; iv=[itt(t[0]) for t in oat]; nv=[n1(t[0]) for t in n1f]
        print(f"=== {key}")
        print(f"  Hp  {len(h):2d}/7   tq@axis "+" ".join(f"{v:.1f}" for v in h)
              +"  | steps "+" ".join(f"{a-b:.2f}" for a,b in zip(h,h[1:])))
        print(f"  ITT {len(iv):2d}/10  @top    "+" ".join(f"{v:.0f}" for v in iv)
              +"  | steps "+" ".join(f"{b-a:.0f}" for a,b in zip(iv,iv[1:])))
        print(f"  N1  {len(nv):2d}/10  @top    "+" ".join(f"{v:.1f}" for v in nv)
              +"  | steps "+" ".join(f"{b-a:.2f}" for a,b in zip(nv,nv[1:])))
    return dict(C=C,tq=tq,itt=itt,n1=n1,car=car,YT=YT,YB=YB,hp=hp,oat=oat,n1f=n1f)
if __name__=="__main__":
    for k in CAL: sheet(k)
