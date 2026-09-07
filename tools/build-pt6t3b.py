import sys; sys.path.insert(0,'.')
import numpy as np, json
import pt_build as B
HOT=[20,30]; CORE=[-50,-40,-30,-20,-10,0,10]

def ev(x,y,q):
    o=np.argsort(x); a,b=np.asarray(x)[o],np.asarray(y)[o]
    return None if not (a.min()<=q<=a.max()) else float(np.interp(q,a,b))

def build(nm, tolPair=2.5, tolLadder=9.0, step=0.25):
    A,Bk=B.PAIR[nm]
    ha,oa,_=B.geom(A); hb,ob,_=B.geom(Bk)
    hp=B.fuse(ha,hb,0.6,f"{nm} altitude",42,84,step)
    grid=np.arange(0.5,34.0+1e-9,step)
    core={}
    for o in CORE:
        pts=[]
        for q in grid:
            va,vb=ev(oa[o][0],oa[o][1],q),ev(ob[o][0],ob[o][1],q)
            if va is None or vb is None or abs(va-vb)>tolPair: continue
            pts.append((q,(va+vb)/2))
        if len(pts)>=20: core[o]=pts
    byq={}
    for o,pts in core.items():
        for q,v in pts: byq.setdefault(round(q,3),{})[o]=v
    hot={o:[] for o in HOT}
    kept={o:0 for o in HOT}; seen={o:0 for o in HOT}
    for q in grid:
        row=byq.get(round(q,3),{})
        if len(row)<4: continue
        os_=sorted(row); vs=[row[o] for o in os_]
        m,c=np.polyfit(os_[-4:],vs[-4:],1)          # the fan's local step, from curves both tracings agree on
        for o in HOT:
            pred=m*o+c
            cands=[v for v in (ev(oa[o][0],oa[o][1],q) if o in oa else None,
                               ev(ob[o][0],ob[o][1],q) if o in ob else None) if v is not None]
            if cands: seen[o]+=1
            good=[v for v in cands if abs(v-pred)<=tolLadder]
            if good: hot[o].append((q,float(np.mean(good)))); kept[o]+=1
    out={"hp":sorted(hp),"tqCarry":[],"oat":[],"carryItt":[]}
    def samp(pts,n=41):
        x=np.array([p[0] for p in pts]); y=np.array([p[1] for p in pts]); o=np.argsort(x)
        g=np.linspace(x[o].min(),x[o].max(),n); return g,np.interp(g,x[o],y[o])
    for h in out["hp"]:
        g,v=samp(list(zip(*hp[h])))
        out["tqCarry"].append([[round(float(p),2),round(float(r),3)] for p,r in zip(g,v)])
    for o in CORE+HOT:
        pts=core.get(o) or hot.get(o)
        if not pts or len(pts)<20: print(f"    {nm}: dropping OAT {o} ({0 if not pts else len(pts)} samples)"); continue
        out["oat"].append(o); g,v=samp(pts)
        out["carryItt"].append([[round(float(p),3),round(float(r),2)] for p,r in zip(g,v)])
    print(f"  {nm}: {len(out['hp'])} altitude, {len(out['oat'])} OAT {out['oat']}")
    for o in HOT: print(f"     OAT +{o}: {kept[o]} of {seen[o]} samples matched the ladder")
    return out
if __name__=="__main__":
    out={nm:build(nm) for nm in B.PAIR}
    json.dump(out,open("/home/user/PowerCheck/src/aircraft/bell-212-pt6t3b/charts.json","w"),separators=(",",":"))
    for nm,c in out.items():
        print(f"  {nm} ITT spans: "+" ".join(f"{o}:{cv[0][0]:.1f}-{cv[-1][0]:.1f}" for o,cv in zip(c["oat"],c["carryItt"])))
