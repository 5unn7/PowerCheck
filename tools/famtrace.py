"""Trace a family of non-crossing curves off a scanned nomogram.

The whole family is carried at once. At each raster row every active curve
predicts where it should be, and the row's ink blobs are assigned to curves by
an order-preserving match -- because the curves cannot cross, the assignment
cannot either. That single constraint is what stops a trace hopping onto its
neighbour where the family converges, which is the fault that independent
per-curve following cannot see."""
import numpy as np
from PIL import Image
from scipy import ndimage
INF = 1e18

def runlen(bw, axis):
    out = np.zeros_like(bw, dtype=np.int32); m = bw if axis == 1 else bw.T
    for i, row in enumerate(m):
        j = 0; n = len(row)
        while j < n:
            if row[j]:
                k = j
                while k < n and row[k]: k += 1
                if axis == 1: out[i, j:k] = k - j
                else: out[j:k, i] = k - j
                j = k
            else: j += 1
    return out

def thick(path, thr, half=1.8, grow=3, maxrun=10, minpx=45):
    """Keep the drawn curves, drop the grid, by stroke thickness.

    Where a scan renders the grid as solid line rather than a dither, run-length
    filtering alone cannot separate them -- both are continuous. But the
    draughtsman drew his curves at two or three times the weight of his grid, so
    the distance transform does separate them: only curve pixels sit far enough
    from white. Take the thick cores, grow them back inside the ink to recover
    the full stroke, then run-length filter what is left -- the residue is grid
    intersections, which are locally thick but axis-aligned and short."""
    a = np.asarray(Image.open(path).convert("L"), float)
    bw = a < thr
    core = ndimage.distance_transform_edt(bw) >= half
    rec = (ndimage.binary_dilation(core, np.ones((3, 3)), iterations=grow) & bw).astype(np.uint8)
    d = ((rec == 1) & (runlen(rec, 1) < maxrun) & (runlen(rec, 0) < maxrun)).astype(np.uint8)
    lab, n = ndimage.label(d, structure=np.ones((3, 3)))
    sz = np.bincount(lab.ravel()); sz[0] = 0
    return (sz >= minpx)[lab].astype(np.uint8)

def clean(path, thr, maxrun, minpx):
    a = np.asarray(Image.open(path).convert("L"), float)
    bw = (a < thr).astype(np.uint8)
    d = ((bw == 1) & (runlen(bw, 1) < maxrun) & (runlen(bw, 0) < maxrun)).astype(np.uint8)
    lab, n = ndimage.label(d, structure=np.ones((3, 3)))
    sz = np.bincount(lab.ravel()); sz[0] = 0
    return (sz >= minpx)[lab].astype(np.uint8)

def blobrows(c, x0, x1, y0, y1, maxw=13):
    B = {}
    for y in range(y0, y1):
        row = c[y, x0:x1]; out = []; i = 0; n = len(row)
        while i < n:
            if row[i]:
                j = i
                while j < n and row[j]: j += 1
                if j - i <= maxw: out.append((i + j - 1) / 2 + x0)
                i = j
            else: i += 1
        B[y] = out
    return B

def assign(pred, blobs, tol, skip_curve, skip_blob):
    """order-preserving assignment of blobs to predicted curve positions"""
    m, n = len(pred), len(blobs)
    D = np.full((m + 1, n + 1), INF); D[0, 0] = 0.0
    P = np.zeros((m + 1, n + 1), np.int8)
    for i in range(m + 1):
        for j in range(n + 1):
            if D[i, j] >= INF: continue
            if i < m and D[i, j] + skip_curve < D[i + 1, j]:
                D[i + 1, j] = D[i, j] + skip_curve; P[i + 1, j] = 1      # curve unseen
            if j < n and D[i, j] + skip_blob < D[i, j + 1]:
                D[i, j + 1] = D[i, j] + skip_blob; P[i, j + 1] = 2       # blob is not ours
            if i < m and j < n:
                c = abs(pred[i] - blobs[j])
                if c <= tol and D[i, j] + c < D[i + 1, j + 1]:
                    D[i + 1, j + 1] = D[i, j] + c; P[i + 1, j + 1] = 3   # matched
    out = [None] * m; i, j = m, n
    while i or j:
        p = P[i, j]
        if p == 3: out[i - 1] = blobs[j - 1]; i -= 1; j -= 1
        elif p == 1: i -= 1
        else: j -= 1
    return out

def sweep(B, y0, seeds, step, ylim, tol=4.5, maxgap=40, hist=30):
    """seeds: x positions on row y0, ordered. returns {curve index: {y: x}}"""
    tracks = [{y0: s} for s in seeds]
    gap = [0] * len(seeds); dead = [False] * len(seeds)
    y = y0
    while True:
        y += step
        if (step > 0 and y >= ylim) or (step < 0 and y <= ylim): break
        idx = [i for i in range(len(tracks)) if not dead[i]]
        if not idx: break
        pred = []
        for i in idx:
            ys = sorted(tracks[i])[-hist:] if step > 0 else sorted(tracks[i])[:hist]
            xs = [tracks[i][v] for v in ys]
            pred.append(float(np.polyval(np.polyfit(ys, xs, 1), y)) if len(ys) >= 6 else xs[-1 if step > 0 else 0])
        order = np.argsort(pred)
        pl = [pred[k] for k in order]
        got = assign(pl, B.get(y, []), tol + 0.10 * max(gap), 3.0, 1.2)
        for k, g in zip(order, got):
            i = idx[k]
            if g is None:
                gap[i] += 1
                if gap[i] > maxgap: dead[i] = True
            else:
                tracks[i][y] = g; gap[i] = 0
    return tracks

def famtrace(path, thr, maxrun, minpx, box, spine, seeds, tol=4.5, maxgap=40, smooth_win=31):
    """box = (x0,x1,y0,y1); spine = row to start from; seeds = x on that row"""
    x0, x1, y0, y1 = box
    c = clean(path, thr, maxrun, minpx)
    B = blobrows(c, x0, x1, y0, y1)
    up = sweep(B, spine, seeds, -1, y0 - 1, tol, maxgap)
    dn = sweep(B, spine, seeds, +1, y1, tol, maxgap)
    out = []
    for a, b in zip(up, dn):
        d = dict(a); d.update(b)
        Y = np.array(sorted(d)); X = np.array([d[v] for v in Y])
        S = X.copy()
        for i in range(len(X)):
            lo, hi = max(0, i - smooth_win // 2), min(len(X), i + smooth_win // 2 + 1)
            S[i] = np.median(X[lo:hi])
        M = S.copy()
        for i in range(len(S)):
            lo, hi = max(0, i - 7), min(len(S), i + 8)
            M[i] = S[lo:hi].mean()
        out.append((Y, M, float(np.std(X - M)), len(Y)))
    return out, B, c

def merge(curves, tol=6.0, minoverlap=40):
    """union curves from several sweeps: same curve if they agree where they overlap"""
    groups = []
    for Y, X in sorted(curves, key=lambda t: -len(t[0])):
        placed = False
        for g in groups:
            gy = np.array(sorted(g)); gx = np.array([g[v] for v in gy])
            a, b = max(Y.min(), gy.min()), min(Y.max(), gy.max())
            if b - a < minoverlap: continue
            gr = np.arange(a, b)
            if np.median(np.abs(np.interp(gr, Y, X) - np.interp(gr, gy, gx))) < tol:
                for y, x in zip(Y, X): g.setdefault(int(y), x)
                placed = True; break
        if not placed: groups.append({int(y): x for y, x in zip(Y, X)})
    out = []
    for g in groups:
        Y = np.array(sorted(g)); X = np.array([g[v] for v in Y])
        S = X.copy()
        for i in range(len(X)):
            lo, hi = max(0, i - 15), min(len(X), i + 16); S[i] = np.median(X[lo:hi])
        M = S.copy()
        for i in range(len(S)):
            lo, hi = max(0, i - 7), min(len(S), i + 8); M[i] = S[lo:hi].mean()
        out.append((Y, M, float(np.std(X - M)), len(Y)))
    return out

def sweeps(path, thr, maxrun, minpx, box, spines, tol=4.5, maxgap=45, drop=()):
    """spines: [(row, [seed x, ...], top_row, bottom_row), ...]

    Each sweep is bounded. A sweep that runs the full height of a nomogram will
    eventually meet a boundary line -- the OAT operating limit, a bleed-valve
    edge -- that the family's curves *terminate on*, and follow it onward,
    because at the junction it is tangent to the curve it is ending. Bounding
    each sweep to the band it was seeded for, and seeding the boundary itself
    where it is visible so the ordering constraint can see it, is what keeps a
    curve from being carried past its own end.

    drop: indices of seeds (per spine, as (spine index, seed index)) that are
    boundaries rather than family members -- traced so the assignment can use
    them, then discarded."""
    x0, x1, y0, y1 = box
    c = clean(path, thr, maxrun, minpx)
    B = blobrows(c, x0, x1, y0, y1)
    raw, dropped = [], []
    for si, (spine, seeds, ytop, ybot) in enumerate(spines):
        up = sweep(B, spine, seeds, -1, max(ytop, y0) - 1, tol, maxgap)
        dn = sweep(B, spine, seeds, +1, min(ybot, y1), tol, maxgap)
        for k, (a, b) in enumerate(zip(up, dn)):
            d = dict(a); d.update(b)
            Y = np.array(sorted(d))
            (dropped if (si, k) in drop else raw).append((Y, np.array([d[v] for v in Y])))
    return merge(raw), B, c, (merge(dropped) if dropped else [])
