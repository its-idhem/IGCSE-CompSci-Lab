'use strict';
/* ================================================================
   CIE Flowchart Lab — flowcharts.js  (v5)

   v4 fixes (already applied):
     1. Wire drawing   — port-dot pointer-events:none in CSS
     2. Zoom controls  — position:fixed via positionZoomControls()
     3. Theme icon     — updates on toggle + load
     4. Decision top   — 'top' port added to DECISION
     5. Dynamic size   — sym.w/h computed from text, migrated on load
     6. dblclick       — event delegation on nodesG / connsG
     7. Export bounds  — crops to content bbox

   v5 new features:
     A. Loops          — back-connections to any port (already works with fix 4);
                         hint updated. Multiple conns into same port allowed.
     B. Rename         — "Components" sidebar → "Symbols" (HTML change)
     C. dblclick edit  — confirmed working via nodesG delegation
     D. Branch modal   — replaces browser confirm() with in-page modal
     E. Arrow keys     — nudge selected symbol(s); Shift = 10px step
     F. Closable panel — ✕ in tab row; ◀ re-open button
     G. Export fix     — remove conn-hit from clone; inline all styles so
                         CSS class rules are not needed for canvas rendering
     H. Marquee select — fixed (uses sym.w/h; also works without them)
     I. Multi-select   — Shift+click toggles; marquee adds to set;
                         dragging a selected sym moves all selected
   ================================================================ */

const NS = 'http://www.w3.org/2000/svg';
const CW = 3000, CH = 2000;

function svgEl(tag, attrs) {
  attrs = attrs || {};
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  return e;
}
function uid() { return 's' + Math.random().toString(36).slice(2, 9); }

// ── Symbol definitions ─────────────────────────────────────
const DEFS = {
  START:    { w:120, h:50, ports:['bottom'],                        prefix:null   },
  STOP:     { w:120, h:50, ports:['top'],                           prefix:null   },
  INPUT:    { w:150, h:55, ports:['top','bottom'],                  prefix:'INPUT'  },
  OUTPUT:   { w:150, h:55, ports:['top','bottom'],                  prefix:'OUTPUT' },
  PROCESS:  { w:150, h:55, ports:['top','bottom','left','right'],   prefix:null   },
  DECISION: { w:140, h:85, ports:['top','bottom','left','right'],   prefix:null   },
  EMBEDDED: { w:150, h:55, ports:['top','bottom','left','right'],   prefix:null   },
  MODULE:   { w:130, h:50, ports:['top','bottom','left','right'],   prefix:null   },
  JUNCTION: { w:10,  h:10, ports:['top','bottom','left','right'],   prefix:null   },
  COMMENT:  { w:160, h:70, ports:[],                                prefix:null   },
};

// ── Text measurement for dynamic sizing ───────────────────
let _mc = null;
function measureTextPx(str) {
  if (!str) return 0;
  if (!_mc) {
    try { _mc = document.createElement('canvas').getContext('2d'); _mc.font = '12px Outfit, sans-serif'; }
    catch(e) { return String(str).length * 7; }
  }
  return _mc.measureText(String(str)).width;
}

function getFullLabel(sym) {
  const def = DEFS[sym.type];
  let label;
  if (def.prefix) label = def.prefix + ' ' + (sym.text || '');
  else label = sym.text || defaultText(sym.type);
  if (sym.type === 'DECISION') label = label + ' ?';
  return label;
}

function computeSymDims(type, fullLabel) {
  const def = DEFS[type];
  if (type === 'JUNCTION') return { w: def.w, h: def.h };
  if (type === 'COMMENT')  return { w: def.w, h: def.h };
  const tw  = measureTextPx(fullLabel || '');
  let w;
  if      (type === 'DECISION')                         w = Math.max(def.w, tw + 90);
  else if (type === 'INPUT' || type === 'OUTPUT')       w = Math.max(def.w, tw + 56);
  else                                                  w = Math.max(def.w, tw + 32);
  return { w: Math.ceil(w), h: def.h };
}

// ── Port positions ────────────────────────────────────────
function portPos(sym, portName) {
  if (sym.type === 'JUNCTION') {
    const cx = sym.x + sym.w/2, cy = sym.y + sym.h/2;
    // top/bottom stay at centre so the vertical through-wire is seamless.
    // left/right return the actual edge so loop arrowheads sit visibly on
    // the correct side instead of being buried inside the through-wire.
    switch (portName) {
      case 'left':  return { x: sym.x,         y: cy };
      case 'right': return { x: sym.x + sym.w, y: cy };
      default:      return { x: cx,             y: cy };
    }
  }
  const w = sym.w, h = sym.h;
  switch (portName) {
    case 'top':    return { x: sym.x + w/2, y: sym.y     };
    case 'bottom': return { x: sym.x + w/2, y: sym.y + h };
    case 'left':   return { x: sym.x,        y: sym.y + h/2 };
    case 'right':  return { x: sym.x + w,    y: sym.y + h/2 };
  }
}

// ── State ─────────────────────────────────────────────────
let symbols     = [];
let connections = [];
let zoom        = 1;
let selId       = null;   // single selected id (conn or sym)
let selSet      = new Set(); // multi-selected sym ids

let wireDrag = null;
let symDrag  = null;
let panDrag  = null;
let marqDrag = null;
let commentResize = null;  // {id, ox, oy, ow, oh}
let connSegDrag = null; // {connId, ptIndex, startX, startY, origX, origY}
let _marqDidSelect = false; // prevents svg click from wiping marquee selection
let _lastTapTime = 0; // double-tap detection on touch
let _lastTapSymId = null;
let _longPressTimer = null;
let _longPressSymId = null;
let _longPressStartX = 0;
let _longPressStartY = 0;
let _longPressMoveOk = false;

// ── DOM refs ──────────────────────────────────────────────
const wrap        = document.getElementById('canvas-wrapper');
const svg         = document.getElementById('canvas');
const connsG      = document.getElementById('connections-layer');
const nodesG      = document.getElementById('nodes-layer');
const tempConn    = document.getElementById('temp-conn');
const snapRing    = document.getElementById('snap-ring');
const selBox      = document.getElementById('sel-box');
const pseudoOut   = document.getElementById('pseudocode-out');
const consoleOut  = document.getElementById('console-out');
const traceWrap   = document.getElementById('trace-wrap');
const cInput      = document.getElementById('c-input');
const cSubmit     = document.getElementById('c-submit');
const cPrompt     = document.getElementById('c-prompt');
const zoomLabel   = document.getElementById('zoom-label');
const embOverlay  = document.getElementById('embedded-overlay');
const embEditor   = document.getElementById('embedded-editor');
const inlineEdit  = document.getElementById('inline-edit');
const inlineInp   = document.getElementById('inline-input');
const dragGhost   = document.getElementById('drag-ghost');
const rightPanel  = document.getElementById('right-panel');
const branchOverlay = document.getElementById('branch-label-overlay');

// ── Coordinate helper ─────────────────────────────────────
function clientToSVG(cx, cy) {
  const r = wrap.getBoundingClientRect();
  return {
    x: (cx - r.left + wrap.scrollLeft) / zoom,
    y: (cy - r.top  + wrap.scrollTop)  / zoom,
  };
}

// ── Zoom controls position ────────────────────────────────
function positionZoomControls() {
  const zc  = document.getElementById('zoom-controls');
  const obp = document.getElementById('btn-open-panel');
  if (!zc) return;
  const isNarrowMobile = window.innerWidth <= 640;
  const isLandscapePhone = !isNarrowMobile && window.innerHeight <= 500 && window.innerWidth <= 1000;
  if (isNarrowMobile) {
    zc.style.right  = '12px';
    zc.style.bottom = window.innerHeight <= 450 ? '12px' : '52px';
    if (obp) obp.style.display = 'none';
    return;
  }
  if (rightPanel.classList.contains('rp-collapsed')) {
    zc.style.right  = '16px';
    if (obp) obp.style.display = 'block';
  } else {
    const rp = rightPanel.getBoundingClientRect();
    zc.style.right  = (window.innerWidth - rp.left + 8) + 'px';
    if (obp) obp.style.display = 'none';
  }
  zc.style.bottom = isLandscapePhone ? '12px' : '50px';
}

// ══════════════════════════════════════════════════════════
//  RENDER
// ══════════════════════════════════════════════════════════

function renderAll() {
  connsG.innerHTML = '';
  nodesG.innerHTML = '';
  connections.forEach(renderConn);
  symbols.forEach(renderSym);
  updatePseudocode();
}

function _syncSelectionClasses() {
  nodesG.querySelectorAll('.node-group').forEach(function(g) {
    var id = g.getAttribute('data-id');
    g.classList.toggle('selected', selId === id || selSet.has(id));
  });
  connsG.querySelectorAll('.conn-group').forEach(function(g) {
    g.classList.toggle('selected', g.getAttribute('data-conn-id') === selId);
  });
}

function renderSym(sym) {
  const def   = DEFS[sym.type];
  const w     = sym.w, h = sym.h;
  const isSel = selId === sym.id || selSet.has(sym.id);

  const g = svgEl('g', {
    class: 'node-group' + (isSel ? ' selected' : ''),
    'data-id': sym.id,
    transform: 'translate('+sym.x+','+sym.y+')',
  });

  // Body shape
  let body = null;
  if (sym.type==='JUNCTION') {
    // No visible dot — junctions render as invisible merge points so the
    // wires form a clean T-intersection with no filled circle.
    const hit = svgEl('circle',{cx:w/2,cy:h/2,r:8,class:'port-hit'});
    g.appendChild(hit);
  } else if (sym.type==='COMMENT') {
    // Dashed note box: draggable border + editable text + resize handle
    const box=svgEl('rect',{x:0,y:0,width:w,height:h,rx:4,class:'comment-shape'});
    g.appendChild(box);
    const fo=document.createElementNS(NS,'foreignObject');
    fo.setAttribute('x','8'); fo.setAttribute('y','6');
    fo.setAttribute('width',String(w-24)); fo.setAttribute('height',String(h-14));
    const div=document.createElement('div');
    div.contentEditable='true';
    div.className='comment-editable';
    div.textContent=sym.text||'// Note...';
    div.addEventListener('input',function(){sym.text=div.textContent;save();});
    div.addEventListener('mousedown',function(e){e.stopPropagation();});
    fo.appendChild(div);
    g.appendChild(fo);
    // Resize handle — bottom-right triangle
    const RS=14;
    const rh=svgEl('polygon',{
      points:(w-RS)+','+h+' '+w+','+h+' '+w+','+(h-RS),
      class:'comment-resize','data-resize-id':sym.id,
    });
    g.appendChild(rh);
    // Drag: clicking the border box (not the text area) starts a move
    box.addEventListener('mousedown',function(e){
      if(e.button!==0)return; e.stopPropagation(); e.preventDefault();
      if(!selSet.has(sym.id)){selId=sym.id;selSet.clear();}
      const sp=clientToSVG(e.clientX,e.clientY);
      const toMove=selSet.size>0?[...selSet]:[sym.id];
      const origPositions={};
      toMove.forEach(function(id){
        const s=symbols.find(function(ss){return ss.id===id;});
        if(s)origPositions[id]={x:s.x,y:s.y};
      });
      symDrag={id:sym.id,startX:sp.x,startY:sp.y,origPositions};
      renderAll();
      document.addEventListener('mousemove',onSymMove);
      document.addEventListener('mouseup',onSymUp);
    });
    box.addEventListener('click',function(e){
      e.stopPropagation();
      if(!e.shiftKey){selId=sym.id;selSet.clear();}
      else{selSet.has(sym.id)?selSet.delete(sym.id):selSet.add(sym.id);}
      renderAll();
    });
    // Resize
    rh.addEventListener('mousedown',function(e){
      if(e.button!==0)return; e.stopPropagation(); e.preventDefault();
      const sp=clientToSVG(e.clientX,e.clientY);
      commentResize={id:sym.id,ox:sp.x,oy:sp.y,ow:sym.w,oh:sym.h};
      document.addEventListener('mousemove',onCommentResizeMove);
      document.addEventListener('mouseup',onCommentResizeUp);
    });
    nodesG.appendChild(g);
    return; // no ports for COMMENT
  } else if (sym.type==='START'||sym.type==='STOP') {
    body = svgEl('rect', {x:1,y:1,width:w-2,height:h-2,rx:h/2,ry:h/2});
  } else if (sym.type==='INPUT'||sym.type==='OUTPUT') {
    const off=14;
    body = svgEl('polygon',{points:off+',1 '+(w-1)+',1 '+(w-off-1)+','+(h-1)+' 1,'+(h-1)});
  } else if (sym.type==='PROCESS'||sym.type==='MODULE') {
    body = svgEl('rect',{x:1,y:1,width:w-2,height:h-2});
  } else if (sym.type==='EMBEDDED') {
    body = svgEl('rect',{x:1,y:1,width:w-2,height:h-2});
    body.setAttribute('class','node-shape'); g.appendChild(body);
    const b1=svgEl('line',{x1:13,y1:1,x2:13,y2:h-1}); b1.setAttribute('class','node-bar'); g.appendChild(b1);
    const b2=svgEl('line',{x1:w-13,y1:1,x2:w-13,y2:h-1}); b2.setAttribute('class','node-bar'); g.appendChild(b2);
    body=null;
  } else if (sym.type==='DECISION') {
    body = svgEl('polygon',{points:(w/2)+',1 '+(w-1)+','+(h/2)+' '+(w/2)+','+(h-1)+' 1,'+(h/2)});
  }
  if (body) { body.setAttribute('class','node-shape'); g.appendChild(body); }

  // Label (skip for JUNCTION)
  if (sym.type !== 'JUNCTION') {
    const lbl = svgEl('text',{x:w/2,y:h/2,class:'node-text','text-anchor':'middle','dominant-baseline':'central'});
    lbl.textContent = getFullLabel(sym);
    g.appendChild(lbl);
  }

  // Ports — hit circle BEFORE dot so dot (visual only) is on top visually
  // port-dot has pointer-events:none in CSS, so clicks pass through to port-hit
  // Skip port dots/hits for JUNCTION (it's programmatically managed)
  if (sym.type !== 'JUNCTION') {
    for (let pi=0; pi<def.ports.length; pi++) {
    const pname = def.ports[pi];
    const pp = portPos(sym, pname);
    const lx = pp.x-sym.x, ly = pp.y-sym.y;

    const hit = svgEl('circle',{cx:lx,cy:ly,r:10,class:'port-hit','data-port':pname});
    const dot = svgEl('circle',{cx:lx,cy:ly,r:5, class:'port-dot','data-port':pname});

    (function(fromId, fromPort, fpPos){
      hit.addEventListener('mousedown', function(e){
        e.stopPropagation(); e.preventDefault();
        wireDrag = {fromId, fromPort};
        tempConn.setAttribute('visibility','visible');
        tempConn.setAttribute('d','M'+fpPos.x+','+fpPos.y);
        document.addEventListener('mousemove', onWireMove);
        document.addEventListener('mouseup',   onWireUp);
      });
      // Touch: tap port to enter pending-wire mode; or complete a pending wire
      hit.addEventListener('touchstart', function(e){
        e.stopPropagation(); e.preventDefault();
        touchPanMob = null;
        if(pendingWireMob){
          // This port is the target — connect and done
          addConnection(pendingWireMob.fromId, pendingWireMob.fromPort, fromId, fromPort);
          cancelPendingWireMob();
          return;
        }
        // Start a wire drag; touchend decides tap vs drag
        wireDrag = {fromId, fromPort};
        touchWireStartMob = {clientX: e.touches[0].clientX, clientY: e.touches[0].clientY};
        tempConn.setAttribute('visibility','visible');
        tempConn.setAttribute('d','M'+fpPos.x+','+fpPos.y+' L'+fpPos.x+','+fpPos.y);
      }, {passive:false});
      hit.addEventListener('touchend', function(e){
        e.stopPropagation();
        if(!wireDrag || !touchWireStartMob) return;
        const touch = e.changedTouches[0];
        const moved = Math.abs(touch.clientX - touchWireStartMob.clientX) > 18 ||
                      Math.abs(touch.clientY - touchWireStartMob.clientY) > 18;
        touchWireStartMob = null;
        if(!moved){
          // Tap → pending mode
          const srcSym = symbols.find(function(s){return s.id===fromId;});
          const fp = srcSym ? portPos(srcSym, fromPort) : fpPos;
          wireDrag = null;
          tempConn.setAttribute('visibility','hidden');
          setPendingWireMob({fromId, fromPort, fp});
          e.preventDefault();
        }
        // else: global touchend resolves the drag-wire
      }, {passive:false});
    })(sym.id, pname, portPos(sym, pname));

    g.appendChild(hit);
    g.appendChild(dot);
  }
  }

  // ── Symbol mousedown: select / drag / multi-select ─────
  g.addEventListener('mousedown', function(e){
    if (e.button!==0 || e.target.classList.contains('port-hit')) return;
    e.stopPropagation();

    if (e.shiftKey) {
      // FIX I: Shift+click toggles membership in selSet
      if (selSet.has(sym.id)) selSet.delete(sym.id);
      else { selSet.add(sym.id); selId = null; }
      _syncSelectionClasses();
      return;
    }

    // Single select: if sym not already in selSet, clear selSet
    if (!selSet.has(sym.id)) { selId = sym.id; selSet.clear(); }

    const sp = clientToSVG(e.clientX, e.clientY);
    // Store origPositions for every symbol that will move
    const toMove = selSet.size>0 ? [...selSet] : [sym.id];
    const origPositions = {};
    toMove.forEach(function(id){
      const s=symbols.find(function(s){return s.id===id;});
      if (s) origPositions[id]={x:s.x,y:s.y};
    });

    symDrag = { id:sym.id, startX:sp.x, startY:sp.y, origPositions, moved:false };
    document.addEventListener('mousemove', onSymMove);
    document.addEventListener('mouseup',   onSymUp);
    _syncSelectionClasses();
  });

  // dblclick and contextmenu handled via delegation on nodesG (see below)
  nodesG.appendChild(g);

  // ── Touch drag + long-press context menu for this symbol ──
  g.addEventListener('touchstart', function(e){
    if(e.target.classList.contains('port-hit')) return; // handled by port-hit
    if(e.target.getAttribute('data-resize-id')) return;
    e.stopPropagation(); e.preventDefault();
    touchPanMob = null; // cancel any canvas pan
    if(!selSet.has(sym.id)){ selId=sym.id; selSet.clear(); _syncSelectionClasses(); }
    const touch = e.touches[0];
    const sp = clientToSVG(touch.clientX, touch.clientY);
    const toMove = selSet.size>0 ? [...selSet] : [sym.id];
    const origPositions = {};
    toMove.forEach(function(id){
      const s=symbols.find(function(ss){return ss.id===id;}); if(s) origPositions[id]={x:s.x,y:s.y};
    });
    symDrag = {id:sym.id, startX:sp.x, startY:sp.y, origPositions};
    // Start long-press timer for context menu
    _longPressSymId = sym.id;
    _longPressStartX = touch.clientX;
    _longPressStartY = touch.clientY;
    _longPressMoveOk = true;
    _longPressTimer = setTimeout(function(){
      if(_longPressMoveOk && _longPressSymId === sym.id){
        _longPressMoveOk = false;
        symDrag = null;
        showCtxMenu({clientX: _longPressStartX, clientY: _longPressStartY}, sym);
      }
    }, 500);
  }, {passive:false});
}

function renderConn(conn) {
  const fs=symbols.find(function(s){return s.id===conn.fromId;});
  const ts=symbols.find(function(s){return s.id===conn.toId;});
  if (!fs||!ts) return;
  const fp=portPos(fs,conn.fromPort), tp=portPos(ts,conn.toPort);
  const full=orthPathFull(fp,conn.fromPort,tp,conn.toPort,conn.fromId,conn.toId,conn.customPts);
  const d=full.d;
  const isSel=selId===conn.id;

  const cg=svgEl('g',{class:'conn-group'+(isSel?' selected':''),'data-conn-id':conn.id});
  cg.appendChild(svgEl('path',{d,class:'conn-hit'}));
  // Suppress arrowhead only on the top-port entry to a junction (the main pass-through).
  // Side-port loop-back wires keep their arrowhead so the loop direction is clear.
  const connPathAttrs={d,class:'conn-path'};
  const isJuncTop = ts.type==='JUNCTION' && conn.toPort==='top';
  if(!isJuncTop) connPathAttrs['marker-end']='url(#arr)';
  cg.appendChild(svgEl('path',connPathAttrs));

  // Add waypoint handles when connection is selected
  if (isSel) {
    const pts = full.pts;
    // Skip first and last points (they're at the ports)
    for (let i = 1; i < pts.length - 1; i++) {
      const pt = pts[i];
      const handle = svgEl('circle', {
        cx: pt[0], cy: pt[1], r: 6,
        class: 'conn-waypoint',
        'data-conn-id': conn.id,
        'data-pt-index': i
      });
      (function(ci, pi) {
        handle.addEventListener('mousedown', function(e) {
          e.stopPropagation(); e.preventDefault();
          const sp = clientToSVG(e.clientX, e.clientY);
          connSegDrag = {
            connId: ci,
            ptIndex: pi,
            startX: sp.x,
            startY: sp.y,
            origX: pt[0],
            origY: pt[1]
          };
          document.addEventListener('mousemove', onConnSegMove);
          document.addEventListener('mouseup', onConnSegUp);
        });
      })(conn.id, i);
      cg.appendChild(handle);
    }
  }

  if (conn.label) {
    // Use actual path midpoint (midpoint of the central run) for accurate label placement
    const pts=full.pts;
    const mid={x:(pts[2][0]+pts[3][0])/2, y:(pts[2][1]+pts[3][1])/2};
    const isYes=conn.label==='Yes';
    cg.appendChild(svgEl('rect',{
      x:mid.x-14,y:mid.y-9,width:28,height:18,rx:3,
      fill:'var(--bg-panel)',stroke:'var(--border-bright)','stroke-width':'1',
      class:'conn-label-bg',
    }));
    const lt=svgEl('text',{x:mid.x,y:mid.y,'text-anchor':'middle','dominant-baseline':'central',
      class:'conn-label '+(isYes?'conn-label-yes':'conn-label-no')});
    lt.textContent=conn.label; cg.appendChild(lt);
  }
  connsG.appendChild(cg);
}

// Returns array of [x,y] waypoints for a standard orthogonal path (no avoidance)
function orthPathPts(fp,fDir,tp,tDir){
  const G=24,ex={top:[0,-G],bottom:[0,G],left:[-G,0],right:[G,0]};
  const fd=ex[fDir]||[0,G],td=ex[tDir]||[0,-G];
  const p1x=fp.x+fd[0],p1y=fp.y+fd[1],p4x=tp.x+td[0],p4y=tp.y+td[1];
  let m1x,m1y,m2x,m2y;
  if(fDir==='top'||fDir==='bottom'){const my=(p1y+p4y)/2;m1x=p1x;m1y=my;m2x=p4x;m2y=my;}
  else{const mx=(p1x+p4x)/2;m1x=mx;m1y=p1y;m2x=mx;m2y=p4y;}
  return [[fp.x,fp.y],[p1x,p1y],[m1x,m1y],[m2x,m2y],[p4x,p4y],[tp.x,tp.y]];
}
// True if an axis-aligned segment hits a padded rect
function segCollidesRect(x1,y1,x2,y2,rx,ry,rw,rh,pad){
  rx-=pad;ry-=pad;rw+=pad*2;rh+=pad*2;
  if(x1===x2){if(x1<rx||x1>rx+rw)return false;const lo=Math.min(y1,y2),hi=Math.max(y1,y2);return hi>ry&&lo<ry+rh;}
  if(y1===y2){if(y1<ry||y1>ry+rh)return false;const lo=Math.min(x1,x2),hi=Math.max(x1,x2);return hi>rx&&lo<rx+rw;}
  return false;
}
// Full path: returns {d, pts} where pts is the actual 6 waypoints used
function orthPathFull(fp,fDir,tp,tDir,fromId,toId,customPts){
  const pts=orthPathPts(fp,fDir,tp,tDir);
  // Apply custom waypoint overrides if provided
  if (customPts && customPts.length) {
    for (let i = 0; i < customPts.length; i++) {
      const cp = customPts[i];
      if (cp && pts[i + 1]) {
        pts[i + 1] = [cp.x, cp.y];
      }
    }
  }
  const mkPath=function(p){return p.map(function(pt,i){return(i?'L':'M')+pt[0]+','+pt[1];}).join(' ');};
  if(!fromId&&!toId) return {d:mkPath(pts),pts};
  const PAD=10;
  const obstaclesBase   = symbols.filter(function(s){return s.id!==toId&&s.type!=='JUNCTION';});
  const obstaclesNoFrom = obstaclesBase.filter(function(s){return s.id!==fromId;});
  const colliders=[];
  for(let i=0;i<pts.length-1;i++){
    const obs=(i===0)?obstaclesNoFrom:obstaclesBase;
    obs.forEach(function(sym){
      if(segCollidesRect(pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1],sym.x,sym.y,sym.w,sym.h,PAD)){
        if(!colliders.find(function(c){return c.id===sym.id;})) colliders.push(sym);
      }
    });
  }
  if(!colliders.length) return {d:mkPath(pts),pts};
  let bminX=Infinity,bmaxX=-Infinity;
  colliders.forEach(function(s){bminX=Math.min(bminX,s.x);bmaxX=Math.max(bmaxX,s.x+s.w);});
  const BYPASS=32;
  const p1=pts[1],p4=pts[pts.length-2];
  const leftPts =[[pts[0][0],pts[0][1]],[p1[0],p1[1]],[bminX-BYPASS,p1[1]],[bminX-BYPASS,p4[1]],[p4[0],p4[1]],[pts[5][0],pts[5][1]]];
  const rightPts=[[pts[0][0],pts[0][1]],[p1[0],p1[1]],[bmaxX+BYPASS,p1[1]],[bmaxX+BYPASS,p4[1]],[p4[0],p4[1]],[pts[5][0],pts[5][1]]];
  function countColl(p){
    let n=0;
    for(let i=0;i<p.length-1;i++){
      // Same rule as main detection: exclude fromId only on segment 0
      const obs=(i===0)?obstaclesNoFrom:obstaclesBase;
      obs.forEach(function(s){if(segCollidesRect(p[i][0],p[i][1],p[i+1][0],p[i+1][1],s.x,s.y,s.w,s.h,PAD))n++;});
    }
    return n;
  }
  const chosen=countColl(leftPts)<=countColl(rightPts)?leftPts:rightPts;
  return {d:mkPath(chosen),pts:chosen};
}
// Wrapper that returns only the path string (used by wire-drag preview)
function orthPath(fp,fDir,tp,tDir,fromId,toId){
  return orthPathFull(fp,fDir,tp,tDir,fromId,toId).d;
}

// ══════════════════════════════════════════════════════════
//  EVENT DELEGATION (survives renderAll)
// ══════════════════════════════════════════════════════════

// FIX C: dblclick to edit via persistent delegation
nodesG.addEventListener('dblclick', function(e){
  const g=e.target.closest('[data-id]'); if(!g) return;
  e.stopPropagation(); e.preventDefault();
  const sym=symbols.find(function(s){return s.id===g.dataset.id;});
  if(sym && sym.type!=='JUNCTION' && sym.type!=='COMMENT') startInlineEdit(sym);
});

// Double-tap to edit on touch devices
nodesG.addEventListener('touchend', function(e){
  const g=e.target.closest('[data-id]'); if(!g) return;
  const sym=symbols.find(function(s){return s.id===g.dataset.id;});
  if(!sym||sym.type==='JUNCTION'||sym.type==='COMMENT') return;
  const now=Date.now();
  if(sym.id===_lastTapSymId&&now-_lastTapTime<350){
    e.stopPropagation(); e.preventDefault();
    startInlineEdit(sym);
    _lastTapTime=0; _lastTapSymId=null;
    return;
  }
  _lastTapTime=now; _lastTapSymId=sym.id;
});

// Right-click context menu via delegation
nodesG.addEventListener('contextmenu', function(e){
  e.preventDefault(); e.stopPropagation();
  const g=e.target.closest('[data-id]'); if(!g) return;
  const sym=symbols.find(function(s){return s.id===g.dataset.id;});
  if(sym) showCtxMenu(e,sym);
});

// Connection click + contextmenu via delegation
connsG.addEventListener('click', function(e){
  const cg=e.target.closest('[data-conn-id]'); if(!cg) return;
  e.stopPropagation(); selId=cg.dataset.connId; selSet.clear(); renderAll();
});
connsG.addEventListener('contextmenu', function(e){
  e.preventDefault(); e.stopPropagation();
  const cg=e.target.closest('[data-conn-id]'); if(!cg) return;
  const conn=connections.find(function(c){return c.id===cg.dataset.connId;});
  if(conn) showConnCtx(e,conn);
});

// Connection long-press on mobile
(function(){
  let _connLongPressTimer=null;
  let _connLongPressId=null;
  let _connLongPressX=0,_connLongPressY=0;
  connsG.addEventListener('touchstart',function(e){
    const cg=e.target.closest('[data-conn-id]'); if(!cg) return;
    const touch=e.touches[0];
    _connLongPressId=cg.dataset.connId;
    _connLongPressX=touch.clientX;
    _connLongPressY=touch.clientY;
    _connLongPressTimer=setTimeout(function(){
      const conn=connections.find(function(c){return c.id===_connLongPressId;});
      if(conn){
        selId=conn.id; selSet.clear(); renderAll();
        showConnCtx({clientX:_connLongPressX,clientY:_connLongPressY},conn);
      }
      _connLongPressTimer=null;
    },500);
  },{passive:true});
  connsG.addEventListener('touchmove',function(e){
    if(_connLongPressTimer){
      const touch=e.touches[0];
      if(Math.abs(touch.clientX-_connLongPressX)>10||Math.abs(touch.clientY-_connLongPressY)>10){
        clearTimeout(_connLongPressTimer); _connLongPressTimer=null;
      }
    }
  },{passive:true});
  connsG.addEventListener('touchend',function(e){
    if(_connLongPressTimer){clearTimeout(_connLongPressTimer);_connLongPressTimer=null;}
  },{passive:true});
})();

// ══════════════════════════════════════════════════════════
//  SIDEBAR DRAG-TO-PLACE
// ══════════════════════════════════════════════════════════
let sbType=null;

document.querySelectorAll('.comp-item').forEach(function(item){
  item.addEventListener('mousedown', function(e){
    if(e.button!==0) return;
    if(window.innerWidth <= 640) return; // mobile uses tap-to-place
    e.preventDefault();
    sbType=item.dataset.type;
    const dTxt=defaultText(sbType);
    const full=DEFS[sbType].prefix?DEFS[sbType].prefix+' '+dTxt:dTxt;
    const dims=computeSymDims(sbType,full);
    dragGhost.style.display='block';
    dragGhost.setAttribute('viewBox','0 0 '+dims.w+' '+dims.h);
    dragGhost.setAttribute('width', dims.w*0.65);
    dragGhost.setAttribute('height',dims.h*0.65);
    posGhost(e,dims); buildGhost(sbType,dims);
    document.addEventListener('mousemove',onSbMove);
    document.addEventListener('mouseup',  onSbUp);
  });
});

function posGhost(e,dims){
  if(!dims){const dt=defaultText(sbType);const f=DEFS[sbType].prefix?DEFS[sbType].prefix+' '+dt:dt;dims=computeSymDims(sbType,f);}
  dragGhost.style.left=(e.clientX-dims.w*0.33)+'px';
  dragGhost.style.top =(e.clientY-dims.h*0.33)+'px';
}
function buildGhost(type,dims){
  dragGhost.innerHTML='';
  const w=dims.w,h=dims.h;
  let body=null;
  if(type==='START'||type==='STOP'){body=svgEl('rect',{x:1,y:1,width:w-2,height:h-2,rx:h/2});}
  else if(type==='INPUT'||type==='OUTPUT'){const off=14;body=svgEl('polygon',{points:off+',1 '+(w-1)+',1 '+(w-off-1)+','+(h-1)+' 1,'+(h-1)});}
  else if(type==='PROCESS'||type==='MODULE'){body=svgEl('rect',{x:1,y:1,width:w-2,height:h-2});}
  else if(type==='EMBEDDED'){
    body=svgEl('rect',{x:1,y:1,width:w-2,height:h-2});body.setAttribute('class','node-shape');dragGhost.appendChild(body);
    const b1=svgEl('line',{x1:13,y1:1,x2:13,y2:h-1});b1.setAttribute('class','node-bar');dragGhost.appendChild(b1);
    const b2=svgEl('line',{x1:w-13,y1:1,x2:w-13,y2:h-1});b2.setAttribute('class','node-bar');dragGhost.appendChild(b2);
    body=null;
  } else if(type==='DECISION'){body=svgEl('polygon',{points:(w/2)+',1 '+(w-1)+','+(h/2)+' '+(w/2)+','+(h-1)+' 1,'+(h/2)});}
  else if(type==='COMMENT'){body=svgEl('rect',{x:1,y:1,width:w-2,height:h-2,rx:4,'stroke-dasharray':'6 3'});}
  if(body){body.setAttribute('class','node-shape');dragGhost.appendChild(body);}
}
function onSbMove(e){if(sbType)posGhost(e);}
function onSbUp(e){
  document.removeEventListener('mousemove',onSbMove);
  document.removeEventListener('mouseup',  onSbUp);
  dragGhost.style.display='none';
  if(!sbType) return;
  const r=wrap.getBoundingClientRect();
  if(e.clientX>=r.left&&e.clientX<=r.right&&e.clientY>=r.top&&e.clientY<=r.bottom){
    const sp=clientToSVG(e.clientX,e.clientY);
    const dTxt=defaultText(sbType);
    const full=DEFS[sbType].prefix?DEFS[sbType].prefix+' '+dTxt:dTxt;
    const dims=computeSymDims(sbType,full);
    const sym={
      id:uid(),type:sbType,
      x:Math.round(Math.max(10,Math.min(CW-dims.w-10,sp.x-dims.w/2))),
      y:Math.round(Math.max(10,Math.min(CH-dims.h-10,sp.y-dims.h/2))),
      text:dTxt, w:dims.w, h:dims.h, embeddedCode:'',
    };
    symbols.push(sym); selId=sym.id; selSet.clear(); renderAll(); save();
  }
  sbType=null;
}
function defaultText(type){
  const m={START:'START',STOP:'STOP',PROCESS:'x \u2190 x + 1',DECISION:'x > 0',
           EMBEDDED:'Procedure',MODULE:'Module',INPUT:'x',OUTPUT:'x',COMMENT:'// Note...'};
  return m[type]||'';
}

// ══════════════════════════════════════════════════════════
//  SYMBOL DRAG (moves all selected symbols together)
// ══════════════════════════════════════════════════════════
function onSymMove(e){
  if(!symDrag) return;
  symDrag.moved=true;
  const sp=clientToSVG(e.clientX,e.clientY);
  const dx=sp.x-symDrag.startX, dy=sp.y-symDrag.startY;
  const toMove=Object.keys(symDrag.origPositions);
  toMove.forEach(function(id){
    const sym=symbols.find(function(s){return s.id===id;});
    const orig=symDrag.origPositions[id]; if(!sym||!orig) return;
    sym.x=Math.round(Math.max(0,Math.min(CW-sym.w,orig.x+dx)));
    sym.y=Math.round(Math.max(0,Math.min(CH-sym.h,orig.y+dy)));
    const g=nodesG.querySelector('[data-id="'+id+'"]');
    if(g) g.setAttribute('transform','translate('+sym.x+','+sym.y+')');
  });
  // Invalidate custom waypoints on connections that touch moved symbols
  connections.forEach(function(c){
    if(toMove.indexOf(c.fromId)>=0||toMove.indexOf(c.toId)>=0) c.customPts=null;
  });
  connsG.innerHTML=''; connections.forEach(renderConn);
}
function onSymUp(e){
  const drag = symDrag;
  symDrag=null;
  document.removeEventListener('mousemove',onSymMove);
  document.removeEventListener('mouseup',  onSymUp);
  // Drop on left sidebar → delete all dragged symbols + their connections
  if(drag){
    const sb=document.getElementById('left-sidebar');
    const sbr=sb.getBoundingClientRect();
    if(e.clientX>=sbr.left&&e.clientX<=sbr.right&&e.clientY>=sbr.top&&e.clientY<=sbr.bottom){
      const toDelete=selSet.size>0?[...selSet]:[drag.id];
      toDelete.forEach(function(id){deleteSym(id);});
      selId=null;selSet.clear();renderAll();save();return;
    }
  }
  if(drag&&drag.moved){
    renderAll();
  }
  save();
}

// ── Comment box resize ────────────────────────────────────
function onCommentResizeMove(e){
  if(!commentResize)return;
  const sp=clientToSVG(e.clientX,e.clientY);
  const sym=symbols.find(function(s){return s.id===commentResize.id;}); if(!sym)return;
  sym.w=Math.round(Math.max(80, commentResize.ow+(sp.x-commentResize.ox)));
  sym.h=Math.round(Math.max(36, commentResize.oh+(sp.y-commentResize.oy)));
  // Live-update in place without full re-render for smooth resizing
  const gEl=nodesG.querySelector('[data-id="'+commentResize.id+'"]'); if(!gEl)return;
  const RS=14;
  const box=gEl.querySelector('.comment-shape');
  if(box){box.setAttribute('width',sym.w);box.setAttribute('height',sym.h);}
  const fo=gEl.querySelector('foreignObject');
  if(fo){fo.setAttribute('width',sym.w-24);fo.setAttribute('height',sym.h-14);}
  const rh=gEl.querySelector('[data-resize-id]');
  if(rh)rh.setAttribute('points',(sym.w-RS)+','+sym.h+' '+sym.w+','+sym.h+' '+sym.w+','+(sym.h-RS));
}
function onCommentResizeUp(){
  commentResize=null;
  document.removeEventListener('mousemove',onCommentResizeMove);
  document.removeEventListener('mouseup',  onCommentResizeUp);
  renderAll(); save();
}

function onConnSegMove(e){
  if(!connSegDrag) return;
  const sp=clientToSVG(e.clientX,e.clientY);
  const conn=connections.find(function(c){return c.id===connSegDrag.connId;});
  if(!conn) return;
  if(!conn.customPts) conn.customPts=[];
  const idx=connSegDrag.ptIndex-1;
  if(!conn.customPts[idx]) conn.customPts[idx]={x:connSegDrag.origX,y:connSegDrag.origY};
  conn.customPts[idx].x=Math.round(connSegDrag.origX+(sp.x-connSegDrag.startX));
  conn.customPts[idx].y=Math.round(connSegDrag.origY+(sp.y-connSegDrag.startY));
  connsG.innerHTML=''; connections.forEach(renderConn);
}
function onConnSegUp(){
  connSegDrag=null;
  document.removeEventListener('mousemove',onConnSegMove);
  document.removeEventListener('mouseup',  onConnSegUp);
  save();
}

// ══════════════════════════════════════════════════════════
//  WIRE DRAWING (enables loops: any port → any port)
// ══════════════════════════════════════════════════════════
function onWireMove(e){
  if(!wireDrag) return;
  const sp=clientToSVG(e.clientX,e.clientY);
  const fs=symbols.find(function(s){return s.id===wireDrag.fromId;}); if(!fs) return;
  const fp=portPos(fs,wireDrag.fromPort);
  const snp=findSnap(sp.x,sp.y,wireDrag.fromId);
  if(snp){
    wireDrag.lineSnap=null;
    snapRing.setAttribute('cx',snp.x); snapRing.setAttribute('cy',snp.y);
    snapRing.setAttribute('visibility','visible');
    tempConn.setAttribute('d',orthPath(fp,wireDrag.fromPort,snp,snp.port));
  } else {
    const lsnp=findSnapOnLine(sp.x,sp.y,null);
    if(lsnp){
      wireDrag.lineSnap=lsnp;
      snapRing.setAttribute('cx',lsnp.x); snapRing.setAttribute('cy',lsnp.y);
      snapRing.setAttribute('visibility','visible');
      tempConn.setAttribute('d','M'+fp.x+','+fp.y+' L'+lsnp.x+','+lsnp.y);
    } else {
      wireDrag.lineSnap=null;
      snapRing.setAttribute('visibility','hidden');
      tempConn.setAttribute('d','M'+fp.x+','+fp.y+' L'+sp.x+','+sp.y);
    }
  }
}
function onWireUp(e){
  document.removeEventListener('mousemove',onWireMove);
  document.removeEventListener('mouseup',  onWireUp);
  tempConn.setAttribute('visibility','hidden');
  snapRing.setAttribute('visibility','hidden');
  if(!wireDrag) return;
  const sp=clientToSVG(e.clientX,e.clientY);
  if(wireDrag.lineSnap){
    const ls=wireDrag.lineSnap;
    addJunctionOnConn(ls.connId,ls.x,ls.y,wireDrag.fromId,wireDrag.fromPort,sp.x);
  } else {
    const snp=findSnap(sp.x,sp.y,wireDrag.fromId);
    if(snp) addConnection(wireDrag.fromId,wireDrag.fromPort,snp.symId,snp.port);
  }
  wireDrag=null;
}
function findSnap(x,y,excludeId){
  let best=null,bestD=36;
  for(let i=0;i<symbols.length;i++){
    const sym=symbols[i]; if(sym.id===excludeId) continue;
    const ports=DEFS[sym.type].ports;
    for(let j=0;j<ports.length;j++){
      const p=portPos(sym,ports[j]);
      const d=Math.hypot(p.x-x,p.y-y);
      if(d<bestD){bestD=d;best={x:p.x,y:p.y,port:ports[j],symId:sym.id};}
    }
  }
  return best;
}
function closestPtOnSeg(px,py,ax,ay,bx,by){
  const dx=bx-ax,dy=by-ay,len2=dx*dx+dy*dy;
  if(len2===0) return {x:ax,y:ay};
  const t=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/len2));
  return {x:ax+t*dx,y:ay+t*dy};
}
function findSnapOnLine(x,y,excludeConnIds){
  const THRESH=18;
  let best=null,bestD=THRESH;
  connections.forEach(function(conn){
    if(excludeConnIds&&excludeConnIds.indexOf(conn.id)>=0) return;
    const fs=symbols.find(function(s){return s.id===conn.fromId;});
    const ts=symbols.find(function(s){return s.id===conn.toId;});
    if(!fs||!ts) return;
    const fp=portPos(fs,conn.fromPort),tp=portPos(ts,conn.toPort);
    const pts=orthPathPts(fp,conn.fromPort,tp,conn.toPort);
    // Check middle segments only (skip first & last tiny stubs at the ports)
    for(let i=1;i<pts.length-2;i++){
      const cp=closestPtOnSeg(x,y,pts[i][0],pts[i][1],pts[i+1][0],pts[i+1][1]);
      const d=Math.hypot(cp.x-x,cp.y-y);
      if(d<bestD){bestD=d;best={x:cp.x,y:cp.y,connId:conn.id};}
    }
  });
  return best;
}

// FIX D: In-page branch label modal replaces browser confirm()
let _pendingConn = null;
let _pendingConnJunction = null; // for DECISION→line-drop loops

function addConnection(fromId,fromPort,toId,toPort){
  // Allow duplicate from-port combinations only if different to
  const dup=connections.find(function(c){
    return c.fromId===fromId&&c.fromPort===fromPort&&c.toId===toId&&c.toPort===toPort;
  });
  if(dup) return;
  const fromSym=symbols.find(function(s){return s.id===fromId;});
  if(fromSym.type==='DECISION'){
    const used=connections.filter(function(c){return c.fromId===fromId;}).map(function(c){return c.label;});
    const avail=['Yes','No'].filter(function(l){return !used.includes(l);});
    if(avail.length===0) return;
    if(avail.length===1){
      connections.push({id:uid(),fromId,fromPort,toId,toPort,label:avail[0]});
      renderAll(); save();
    } else {
      _pendingConn={fromId,fromPort,toId,toPort};
      branchOverlay.style.display='flex';
    }
  } else {
    connections.push({id:uid(),fromId,fromPort,toId,toPort,label:null});
    renderAll(); save();
  }
}

document.getElementById('blm-yes').addEventListener('click',function(){
  branchOverlay.style.display='none';
  if(_pendingConn){
    connections.push({id:uid(),..._pendingConn,label:'Yes'});
    renderAll();save();
    _pendingConn=null;
  } else if(_pendingConnJunction){
    const p=_pendingConnJunction; _pendingConnJunction=null;
    _doAddJunctionOnConn(p.connId,p.jx,p.jy,p.srcId,p.srcPort,'Yes',p.approachX);
  }
});
document.getElementById('blm-no').addEventListener('click',function(){
  branchOverlay.style.display='none';
  if(_pendingConn){
    connections.push({id:uid(),..._pendingConn,label:'No'});
    renderAll();save();
    _pendingConn=null;
  } else if(_pendingConnJunction){
    const p=_pendingConnJunction; _pendingConnJunction=null;
    _doAddJunctionOnConn(p.connId,p.jx,p.jy,p.srcId,p.srcPort,'No',p.approachX);
  }
});
document.getElementById('blm-cancel').addEventListener('click',function(){
  branchOverlay.style.display='none'; _pendingConn=null; _pendingConnJunction=null;
});

// Split an existing connection with a JUNCTION node (enables loop routing)
function addJunctionOnConn(connId,jx,jy,srcId,srcPort,approachX){
  const srcSym=symbols.find(function(s){return s.id===srcId;});
  if(srcSym&&srcSym.type==='DECISION'){
    // DECISION branches need a Yes/No label — show the modal first, then create junction
    const used=connections.filter(function(c){return c.fromId===srcId;}).map(function(c){return c.label;});
    const avail=['Yes','No'].filter(function(l){return !used.includes(l);});
    if(avail.length===0) return;
    if(avail.length===1){
      _doAddJunctionOnConn(connId,jx,jy,srcId,srcPort,avail[0],approachX);
    } else {
      _pendingConnJunction={connId,jx,jy,srcId,srcPort,approachX};
      branchOverlay.style.display='flex';
    }
  } else {
    _doAddJunctionOnConn(connId,jx,jy,srcId,srcPort,null,approachX);
  }
}
function _doAddJunctionOnConn(connId,jx,jy,srcId,srcPort,label,approachX){
  const orig=connections.find(function(c){return c.id===connId;});
  if(!orig) return;
  const junc={id:uid(),type:'JUNCTION',x:Math.round(jx-5),y:Math.round(jy-5),w:10,h:10,text:'',embeddedCode:''};
  symbols.push(junc);
  const fromId=orig.fromId,fromPort=orig.fromPort,toId=orig.toId,toPort=orig.toPort,origLabel=orig.label;
  connections=connections.filter(function(c){return c.id!==connId;});
  // Re-route original flow through the junction
  connections.push({id:uid(),fromId,fromPort,toId:junc.id,toPort:'top',label:origLabel});
  connections.push({id:uid(),fromId:junc.id,fromPort:'bottom',toId,toPort,label:null});
  // Determine which side the loop wire actually routes to by tracing the real path.
  // orthPathFull runs the same obstacle-avoidance logic used to draw the wire, so its
  // pts[2] waypoint (the first turn after the exit stub) tells us whether the wire
  // loops to the left or right of the junction — regardless of source position or
  // how avoidance reroutes the path.
  const srcSym=symbols.find(function(s){return s.id===srcId;});
  const fp=srcSym?portPos(srcSym,srcPort):{x:jx,y:jy};
  const preview=orthPathFull(fp,srcPort,{x:jx,y:jy},'top',srcId,null);
  const pathX=preview.pts[2]?preview.pts[2][0]:fp.x;
  const inPort=pathX<=jx?'left':'right';
  connections.push({id:uid(),fromId:srcId,fromPort:srcPort,toId:junc.id,toPort:inPort,label:label,loopEntry:true});
  renderAll(); save();
}

// ══════════════════════════════════════════════════════════
//  CANVAS BACKGROUND — deselect + marquee select
// ══════════════════════════════════════════════════════════
document.getElementById('canvas-bg').addEventListener('mousedown',function(e){
  if(e.button!==0) return; e.preventDefault();
  if(!e.shiftKey){ selId=null; selSet.clear(); }
  const sp=clientToSVG(e.clientX,e.clientY);
  marqDrag={startX:sp.x,startY:sp.y,shift:e.shiftKey};
  selBox.setAttribute('x',sp.x); selBox.setAttribute('y',sp.y);
  selBox.setAttribute('width',0); selBox.setAttribute('height',0);
  selBox.setAttribute('visibility','visible');
  document.addEventListener('mousemove',onMarqMove);
  document.addEventListener('mouseup',  onMarqUp);
  if(!e.shiftKey) renderAll();
});
function onMarqMove(e){
  if(!marqDrag) return;
  const sp=clientToSVG(e.clientX,e.clientY);
  const rx=Math.min(sp.x,marqDrag.startX),ry=Math.min(sp.y,marqDrag.startY);
  selBox.setAttribute('x',rx); selBox.setAttribute('y',ry);
  selBox.setAttribute('width',Math.abs(sp.x-marqDrag.startX));
  selBox.setAttribute('height',Math.abs(sp.y-marqDrag.startY));
}
// FIX H + I: selection box correctly uses sym.w/h; adds to existing set with shift
function onMarqUp(e){
  document.removeEventListener('mousemove',onMarqMove);
  document.removeEventListener('mouseup',  onMarqUp);
  if(!marqDrag){selBox.setAttribute('visibility','hidden');return;}
  const sp=clientToSVG(e.clientX,e.clientY);
  const rx=Math.min(sp.x,marqDrag.startX),ry=Math.min(sp.y,marqDrag.startY);
  const rw=Math.abs(sp.x-marqDrag.startX),rh=Math.abs(sp.y-marqDrag.startY);
  if(rw>4||rh>4){
    if(!marqDrag.shift) selSet.clear();
    symbols.forEach(function(sym){
      const sw=sym.w||DEFS[sym.type].w, sh=sym.h||DEFS[sym.type].h;
      if(sym.x<rx+rw&&sym.x+sw>rx&&sym.y<ry+rh&&sym.y+sh>ry) selSet.add(sym.id);
    });
    selId=null;
    if(selSet.size>0){
      _marqDidSelect=true;
      setTimeout(function(){_marqDidSelect=false;},100);
    }
  }
  marqDrag=null;
  selBox.setAttribute('visibility','hidden');
  renderAll();
}

// ══════════════════════════════════════════════════════════
//  RIGHT-CLICK PAN
// ══════════════════════════════════════════════════════════
wrap.addEventListener('contextmenu',function(e){e.preventDefault();});
wrap.addEventListener('mousedown',function(e){
  if(e.button!==2) return; e.preventDefault();
  panDrag={startX:e.clientX,startY:e.clientY,scrollX:wrap.scrollLeft,scrollY:wrap.scrollTop};
  wrap.style.cursor='grabbing';
  document.addEventListener('mousemove',onPanMove);
  document.addEventListener('mouseup',  onPanUp);
});
function onPanMove(e){if(!panDrag)return;wrap.scrollLeft=panDrag.scrollX-(e.clientX-panDrag.startX);wrap.scrollTop=panDrag.scrollY-(e.clientY-panDrag.startY);}
function onPanUp(){panDrag=null;wrap.style.cursor='';document.removeEventListener('mousemove',onPanMove);document.removeEventListener('mouseup',onPanUp);}

// ══════════════════════════════════════════════════════════
//  INLINE EDIT (double-click or right-click → Edit text)
// ══════════════════════════════════════════════════════════
let editingSymId=null;
function startInlineEdit(sym){
  if(!sym||sym.type==='JUNCTION'||sym.type==='COMMENT') return;
  const g=nodesG.querySelector('[data-id="'+sym.id+'"]'); if(!g) return;
  const bbox=g.getBoundingClientRect();
  inlineEdit.style.display='block';
  inlineEdit.style.left  =bbox.left+'px';
  inlineEdit.style.top   =(bbox.top+bbox.height/2-14)+'px';
  inlineEdit.style.width =Math.max(bbox.width,100)+'px';
  editingSymId=sym.id;
  inlineInp.value=sym.text||'';
  inlineInp.placeholder=DEFS[sym.type].prefix?'variable name':'text';
  // Defer focus so any blur from the triggering click settles first
  setTimeout(function(){inlineInp.focus();inlineInp.select();},20);
}
function commitEdit(){
  if(!editingSymId) return;
  const sym=symbols.find(function(s){return s.id===editingSymId;});
  if(sym){
    let t=inlineInp.value.trim();
    if(t){
      // Normalise ASCII pseudocode operators → Unicode display symbols
      // Order matters: handle multi-char sequences before single-char ones
      t=t.replace(/<-/g,'←')   // assignment arrow
          .replace(/<>/g,'≠')   // not-equal  (before <= so < isn't eaten)
          .replace(/<=/g,'≤')   // less-than-or-equal
          .replace(/>=/g,'≥');  // greater-than-or-equal
      sym.text=t;
    }
    const full=getFullLabel(sym);
    const dims=computeSymDims(sym.type,full);
    sym.w=dims.w; sym.h=dims.h;
    renderAll(); save();
  }
  inlineEdit.style.display='none'; editingSymId=null;
}
inlineInp.addEventListener('keydown',function(e){
  if(e.key==='Enter'||e.key==='Escape') commitEdit();
  e.stopPropagation();
});
inlineInp.addEventListener('blur',commitEdit);

// ══════════════════════════════════════════════════════════
//  CONTEXT MENUS
// ══════════════════════════════════════════════════════════
let ctxMenu=null;
function closeCtx(){if(ctxMenu){ctxMenu.remove();ctxMenu=null;}}
function showCtxMenu(e,sym){
  closeCtx();
  const m=document.createElement('div'); m.className='ctx-menu';
  m.style.left=e.clientX+'px'; m.style.top=e.clientY+'px';
  const items=[['Edit text',function(){startInlineEdit(sym);}]];
  if(sym.type==='EMBEDDED') items.push(['Edit pseudocode\u2026',function(){openEmbModal(sym.id);}]);
  items.push(['Delete',function(){deleteSym(sym.id);}]);
  items.forEach(function(it){
    const b=document.createElement('button'); b.textContent=it[0];
    b.addEventListener('click',function(){closeCtx();it[1]();}); m.appendChild(b);
  });
  document.body.appendChild(m); ctxMenu=m;
  setTimeout(function(){document.addEventListener('click',closeCtx,{once:true});},0);
}
function showConnCtx(e,conn){
  closeCtx();
  const m=document.createElement('div'); m.className='ctx-menu';
  m.style.left=e.clientX+'px'; m.style.top=e.clientY+'px';
  const b=document.createElement('button'); b.textContent='Delete connection';
  b.addEventListener('click',function(){closeCtx();deleteConn(conn.id);}); m.appendChild(b);
  document.body.appendChild(m); ctxMenu=m;
  setTimeout(function(){document.addEventListener('click',closeCtx,{once:true});},0);
}
function deleteSym(id){
  symbols=symbols.filter(function(s){return s.id!==id;});
  connections=connections.filter(function(c){return c.fromId!==id&&c.toId!==id;});
  if(selId===id)selId=null; selSet.delete(id);
  // Clean up orphaned junctions left behind after deleting a connected symbol
  _cleanupOrphanedJunctions();
  renderAll(); save();
}
function _cleanupOrphanedJunctions(){
  // Find junctions that lost a through-path or have dangling connections
  var changed=true;
  while(changed){
    changed=false;
    for(var ji=0;ji<symbols.length;ji++){
      var sym=symbols[ji];
      if(sym.type!=='JUNCTION') continue;
      var jConns=connections.filter(function(c){return c.fromId===sym.id||c.toId===sym.id;});
      if(jConns.length===0){
        // Isolated junction — remove it
        symbols=symbols.filter(function(s){return s.id!==sym.id;});
        connections=connections.filter(function(c){return c.fromId!==sym.id&&c.toId!==sym.id;});
        changed=true; break;
      }
      var throughIn =jConns.find(function(c){return c.toId===sym.id&&!c.loopEntry;});
      var throughOut=jConns.find(function(c){return c.fromId===sym.id&&!c.loopEntry;});
      if(!throughIn||!throughOut){
        // Through-path broken — dissolve junction
        // Reconnect remaining non-loop connections directly
        var otherConns=jConns.filter(function(c){return c!==throughIn&&c!==throughOut;});
        if(throughIn&&throughOut){
          // Shouldn't happen since we checked above, but just in case
        } else if(throughIn&&!throughOut){
          // Has an incoming through-wire but no outgoing — reconnect to next available
          // If there's a loopEntry outgoing, keep it but redirect
          var loopOut=jConns.find(function(c){return c.fromId===sym.id&&c.loopEntry;});
          if(loopOut&&otherConns.length===0){
            // Only loop outgoing left, no through — remove junction and loop connection
            connections=connections.filter(function(c){return c.fromId!==sym.id&&c.toId!==sym.id;});
          }
        } else if(!throughIn&&throughOut){
          // Has outgoing through-wire but no incoming — orphaned
          connections=connections.filter(function(c){return c.fromId!==sym.id&&c.toId!==sym.id;});
        } else {
          // No through-path at all — remove all connections to/from this junction
          connections=connections.filter(function(c){return c.fromId!==sym.id&&c.toId!==sym.id;});
        }
        symbols=symbols.filter(function(s){return s.id!==sym.id;});
        changed=true; break;
      }
    }
  }
}
function deleteConn(id){
  const conn=connections.find(function(c){return c.id===id;});
  if(!conn){connections=connections.filter(function(c){return c.id!==id;});if(selId===id)selId=null;renderAll();save();return;}
  // If either endpoint is a JUNCTION, dissolve it cleanly.
  // When the loop wire (loopEntry:true) is deleted, restore the original through-path.
  // When a through-wire is deleted, dissolve the junction without reconnecting.
  const fromSym=symbols.find(function(s){return s.id===conn.fromId;});
  const toSym  =symbols.find(function(s){return s.id===conn.toId;});
  const juncSym=(toSym  &&toSym.type  ==='JUNCTION')?toSym
               :(fromSym&&fromSym.type==='JUNCTION')?fromSym:null;
  if(juncSym){
    const juncId=juncSym.id;
    const jConns=connections.filter(function(c){return c.fromId===juncId||c.toId===juncId;});
    const throughIn =jConns.find(function(c){return c.toId===juncId&&!c.loopEntry;});
    const throughOut=jConns.find(function(c){return c.fromId===juncId;});
    connections=connections.filter(function(c){return c.fromId!==juncId&&c.toId!==juncId;});
    symbols=symbols.filter(function(s){return s.id!==juncId;});
    // Restore the original through-path only when user deleted the loop wire
    if(conn.loopEntry&&throughIn&&throughOut){
      connections.push({id:uid(),
        fromId:throughIn.fromId,fromPort:throughIn.fromPort,
        toId:throughOut.toId,toPort:throughOut.toPort,
        label:throughIn.label});
    }
  } else {
    connections=connections.filter(function(c){return c.id!==id;});
  }
  if(selId===id)selId=null;
  renderAll(); save();
}

// ══════════════════════════════════════════════════════════
//  KEYBOARD SHORTCUTS
// ══════════════════════════════════════════════════════════
document.addEventListener('keydown',function(e){
  if(e.target.tagName==='INPUT'||e.target.tagName==='TEXTAREA'||
     e.target.contentEditable==='true') return;

  // FIX E: Arrow keys nudge selected symbol(s)
  if(e.key==='ArrowLeft'||e.key==='ArrowRight'||e.key==='ArrowUp'||e.key==='ArrowDown'){
    e.preventDefault();
    const step=e.shiftKey?10:1;
    const dx=e.key==='ArrowLeft'?-step:e.key==='ArrowRight'?step:0;
    const dy=e.key==='ArrowUp'  ?-step:e.key==='ArrowDown' ?step:0;
    const toMove=selSet.size>0?[...selSet]:(selId&&symbols.find(function(s){return s.id===selId;})?[selId]:[]);
    if(!toMove.length) return;
    toMove.forEach(function(id){
      const sym=symbols.find(function(s){return s.id===id;}); if(!sym) return;
      sym.x=Math.max(0,Math.min(CW-sym.w,sym.x+dx));
      sym.y=Math.max(0,Math.min(CH-sym.h,sym.y+dy));
    });
    renderAll(); save(); return;
  }

  // Delete / Backspace
  if(e.key==='Delete'||e.key==='Backspace'){
    if(selSet.size){selSet.forEach(function(id){deleteSym(id);});return;}
    if(selId){
      const isConn=connections.find(function(c){return c.id===selId;});
      if(isConn)deleteConn(selId);else deleteSym(selId);
    }
  }
});

svg.addEventListener('click',function(e){
  if(_marqDidSelect) return; // don't wipe marquee selection
  if(e.target===svg||e.target===document.getElementById('canvas-bg')){
    if(placingTypeMob){
      e.preventDefault();
      const sp=clientToSVG(e.clientX,e.clientY);
      const dTxt=defaultText(placingTypeMob);
      const full=DEFS[placingTypeMob].prefix?DEFS[placingTypeMob].prefix+' '+dTxt:dTxt;
      const dims=computeSymDims(placingTypeMob,full);
      const sym={
        id:uid(),type:placingTypeMob,
        x:Math.round(Math.max(10,Math.min(CW-dims.w-10,sp.x-dims.w/2))),
        y:Math.round(Math.max(10,Math.min(CH-dims.h-10,sp.y-dims.h/2))),
        text:dTxt,w:dims.w,h:dims.h,embeddedCode:'',
      };
      symbols.push(sym);selId=sym.id;selSet.clear();renderAll();save();
      setPlacingTypeMob(null);closeMobileSidebars();return;
    }
    selId=null;selSet.clear();renderAll();
  }
});

// ══════════════════════════════════════════════════════════
//  EMBEDDED MODAL
// ══════════════════════════════════════════════════════════
let embSymId=null;
function openEmbModal(id){
  embSymId=id;
  const sym=symbols.find(function(s){return s.id===id;});
  embEditor.value=sym.embeddedCode||'';
  embOverlay.style.display='flex'; embEditor.focus();
}
document.getElementById('embedded-save').addEventListener('click',function(){
  if(embSymId){const sym=symbols.find(function(s){return s.id===embSymId;});if(sym)sym.embeddedCode=embEditor.value;save();}
  embOverlay.style.display='none';
});
document.getElementById('embedded-cancel').addEventListener('click',function(){embOverlay.style.display='none';});
document.getElementById('embedded-close').addEventListener('click',function(){embOverlay.style.display='none';});

// ══════════════════════════════════════════════════════════
//  ZOOM
// ══════════════════════════════════════════════════════════
function applyZoom(){
  svg.style.width =Math.round(CW*zoom)+'px';
  svg.style.height=Math.round(CH*zoom)+'px';
  zoomLabel.textContent=Math.round(zoom*100)+'%';
  positionZoomControls();
}
document.getElementById('btn-zi').addEventListener('click',function(){zoom=Math.min(3,parseFloat((zoom+0.15).toFixed(2)));applyZoom();});
document.getElementById('btn-zo').addEventListener('click',function(){zoom=Math.max(0.25,parseFloat((zoom-0.15).toFixed(2)));applyZoom();});
document.getElementById('btn-zf').addEventListener('click',function(){
  if(!symbols.length){zoom=1;applyZoom();wrap.scrollLeft=0;wrap.scrollTop=0;return;}
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  symbols.forEach(function(s){
    const sw=s.w||DEFS[s.type].w,sh=s.h||DEFS[s.type].h;
    minX=Math.min(minX,s.x);minY=Math.min(minY,s.y);maxX=Math.max(maxX,s.x+sw);maxY=Math.max(maxY,s.y+sh);
  });
  const pad=60,r=wrap.getBoundingClientRect();
  zoom=Math.max(0.25,Math.min(3,parseFloat(Math.min((r.width-pad*2)/(maxX-minX),(r.height-pad*2)/(maxY-minY)).toFixed(2))));
  applyZoom(); wrap.scrollLeft=(minX-pad)*zoom; wrap.scrollTop=(minY-pad)*zoom;
});
wrap.addEventListener('wheel',function(e){
  if(!e.ctrlKey&&!e.metaKey) return; e.preventDefault();
  zoom=Math.max(0.25,Math.min(3,parseFloat((zoom-e.deltaY*0.001).toFixed(3)))); applyZoom();
},{passive:false});

// ══════════════════════════════════════════════════════════
//  RIGHT PANEL RESIZE + TOGGLE (FIX F)
// ══════════════════════════════════════════════════════════
const resizer=document.getElementById('right-resizer');
let resDrag=null;
resizer.addEventListener('mousedown',function(e){
  resDrag={startX:e.clientX,startW:rightPanel.offsetWidth};
  document.addEventListener('mousemove',onResMove);
  document.addEventListener('mouseup',  onResUp);
});
function onResMove(e){
  if(!resDrag) return;
  rightPanel.style.width=Math.max(200,Math.min(600,resDrag.startW+(resDrag.startX-e.clientX)))+'px';
  positionZoomControls();
}
function onResUp(){resDrag=null;document.removeEventListener('mousemove',onResMove);document.removeEventListener('mouseup',onResUp);}

document.getElementById('btn-close-panel').addEventListener('click',function(){
  rightPanel.classList.add('rp-collapsed');
  resizer.style.display='none';
  positionZoomControls();
});
document.getElementById('btn-open-panel').addEventListener('click',function(){
  rightPanel.classList.remove('rp-collapsed');
  resizer.style.display='';
  // Wait for the panel's 0.2s CSS width transition to fully complete.
  // e.target check is critical: transitionend bubbles, so child-element
  // transitions (buttons, shapes, etc.) would otherwise fire this too early.
  var _done=false;
  function _place(){
    if(_done)return; _done=true;
    rightPanel.removeEventListener('transitionend',_onT);
    positionZoomControls();
  }
  function _onT(e){
    if(e.target===rightPanel&&e.propertyName==='width') _place();
  }
  rightPanel.addEventListener('transitionend',_onT);
  setTimeout(_place,250); // fallback: 50ms after transition should have ended
});

// ══════════════════════════════════════════════════════════
//  TABS + TOOLBAR
// ══════════════════════════════════════════════════════════
document.querySelectorAll('.rp-tab:not(#btn-close-panel)').forEach(function(btn){
  btn.addEventListener('click',function(){
    document.querySelectorAll('.rp-tab').forEach(function(b){b.classList.remove('active');});
    document.querySelectorAll('.rp-pane').forEach(function(p){p.classList.remove('active');});
    btn.classList.add('active');
    document.getElementById('pane-'+btn.dataset.tab).classList.add('active');
  });
});

// FIX 3: Theme icon updates on toggle
const btnTheme=document.getElementById('btn-theme');
btnTheme.addEventListener('click',function(){
  const light=document.body.classList.toggle('light-mode');
  btnTheme.textContent=light?'☀':'⏾';
  localStorage.setItem('cie_theme',light?'light':'dark');
});

document.getElementById('btn-export-png').addEventListener('click',exportBW);
document.getElementById('btn-clear').addEventListener('click',function(){
  if(confirm('Clear the entire canvas?')){symbols=[];connections=[];selId=null;selSet.clear();renderAll();save();}
});
document.getElementById('btn-copy-pseudo').addEventListener('click',function(){
  navigator.clipboard.writeText(pseudoOut.textContent).catch(function(){});
});
document.getElementById('btn-run').addEventListener('click',  function(){runFlowchart(false);});
document.getElementById('btn-step').addEventListener('click', function(){if(!runCtx)runFlowchart(true);});
document.getElementById('btn-reset').addEventListener('click',resetExec);

// ══════════════════════════════════════════════════════════
//  PSEUDOCODE GENERATOR
// ══════════════════════════════════════════════════════════
function updatePseudocode(){
  const start=symbols.find(function(s){return s.type==='START';});
  if(!start){pseudoOut.textContent='// Add a START block to\n// generate pseudocode.';return;}
  try{
    const lines=[];
    // Collect all EMBEDDED (Subroutine) symbols reachable from START and output
    // PROCEDURE...ENDPROCEDURE blocks at the top before the main program.
    const embeds=[];
    const scanVis=new Set();
    (function scanEmbeds(id){
      if(!id||scanVis.has(id))return; scanVis.add(id);
      const sym=symbols.find(function(s){return s.id===id;}); if(!sym) return;
      if(sym.type==='EMBEDDED') embeds.push(sym);
      connections.filter(function(c){return c.fromId===id;}).forEach(function(c){scanEmbeds(c.toId);});
    })(start.id);
    embeds.forEach(function(sym){
      lines.push('PROCEDURE '+(sym.text||'Procedure'));
      (sym.embeddedCode||'').split('\n').filter(Boolean).forEach(function(l){lines.push(ind(1)+l);});
      lines.push('ENDPROCEDURE');
      lines.push('');
    });
    const vis=new Set();
    crawl(start.id,lines,vis,0);
    pseudoOut.textContent=lines.join('\n')||'// (empty)';
  }
  catch(err){pseudoOut.textContent='// Error: '+err.message;}
}

// ── Loop detection helpers ─────────────────────────────
// Trace from juncId's bottom output, collecting body nodes until we reach
// targetDecId. Returns the ordered array of body node IDs, or null if unreachable.
function traceBodyToDecision(juncId, targetDecId){
  const bottomOut=connections.find(function(c){return c.fromId===juncId&&c.fromPort==='bottom';});
  if(!bottomOut) return null;
  const bodyIds=[]; const seen=new Set([juncId]); let cur=bottomOut.toId; let steps=0;
  while(cur&&steps++<60){
    if(cur===targetDecId) return bodyIds;
    if(seen.has(cur)) return null; seen.add(cur);
    const sym=symbols.find(function(s){return s.id===cur;}); if(!sym) return null;
    if(sym.type==='DECISION'||sym.type==='START'||sym.type==='STOP') return null;
    if(sym.type!=='JUNCTION') bodyIds.push(cur);
    const outs=connections.filter(function(c){return c.fromId===cur;});
    if(outs.length!==1) return null;
    cur=outs[0].toId;
  }
  return null;
}
// Check if following single-output connections from startId reaches targetId
function connectionLeadsTo(startId, targetId){
  let cur=startId; const seen=new Set(); let steps=0;
  while(cur&&steps++<60){
    if(cur===targetId) return true;
    if(seen.has(cur)) return false; seen.add(cur);
    const outs=connections.filter(function(c){return c.fromId===cur;});
    if(outs.length!==1) return false;
    cur=outs[0].toId;
  }
  return false;
}
// Mark all nodes reachable from startId (following single outputs) as visited,
// stopping before stopId.
function markBodyVisited(startId, stopId, vis){
  let cur=startId; const seen=new Set(); let steps=0;
  while(cur&&cur!==stopId&&steps++<60){
    if(seen.has(cur)) break; seen.add(cur); vis.add(cur);
    const outs=connections.filter(function(c){return c.fromId===cur;});
    if(outs.length!==1) break;
    cur=outs[0].toId;
  }
}
// Detect loop structure at a junction.
// Returns null or {kind:'REPEAT'|'WHILE', ...} describing the loop.
function detectJunctionLoop(juncId){
  const sideIns=connections.filter(function(c){
    return c.toId===juncId&&(c.toPort==='left'||c.toPort==='right');
  });
  if(!sideIns.length) return null;

  // ── REPEAT pattern: side-incoming directly from a DECISION ──
  for(var si=0;si<sideIns.length;si++){
    const sideIn=sideIns[si];
    const loopSrc=symbols.find(function(s){return s.id===sideIn.fromId;});
    if(!loopSrc||loopSrc.type!=='DECISION') continue;
    const bodyIds=traceBodyToDecision(juncId,loopSrc.id);
    if(bodyIds===null) continue; // can't reach that decision from junction bottom
    const decOuts=connections.filter(function(c){return c.fromId===loopSrc.id;});
    // sideIn goes FROM decision TO junction — that is the looping branch
    const exitConn=decOuts.find(function(c){return c.toId!==juncId;});
    // Standard IGCSE REPEAT...UNTIL exits when condition is TRUE (Yes branch exits)
    // If the exit branch label is 'Yes' → UNTIL condition
    // If the exit branch label is 'No'  → UNTIL NOT (condition)
    const cond=loopSrc.text||'condition';
    const untilCond=(exitConn&&exitConn.label==='Yes')?cond:'NOT ('+cond+')';
    return{kind:'REPEAT',decId:loopSrc.id,bodyIds,untilCond,
           exitId:exitConn?exitConn.toId:null};
  }

  // ── WHILE pattern: junction → DECISION immediately, body loops back ──
  const bottomOut=connections.find(function(c){return c.fromId===juncId&&c.fromPort==='bottom';});
  if(!bottomOut) return null;
  const nextSym=symbols.find(function(s){return s.id===bottomOut.toId;});
  if(!nextSym||nextSym.type!=='DECISION') return null;
  const decId=nextSym.id;
  const decOuts=connections.filter(function(c){return c.fromId===decId;});
  for(var di=0;di<decOuts.length;di++){
    const branch=decOuts[di];
    if(connectionLeadsTo(branch.toId,juncId)){
      // branch is the looping branch; find the exit
      const exitConn=decOuts.find(function(c){return c.id!==branch.id;});
      const cond=nextSym.text||'condition';
      // Looping on Yes → WHILE condition DO; looping on No → WHILE NOT (condition) DO
      const whileCond=(branch.label==='Yes')?cond:'NOT ('+cond+')';
      return{kind:'WHILE',decId,whileCond,bodyStartId:branch.toId,
             exitId:exitConn?exitConn.toId:null};
    }
  }
  return null;
}

function crawl(id,lines,vis,depth){
  if(!id||vis.has(id)) return;
  const sym=symbols.find(function(s){return s.id===id;}); if(!sym) return;
  vis.add(id);
  const outs=connections.filter(function(c){return c.fromId===id;});
  switch(sym.type){
    case 'START':  lines.push(ind(depth)+'// START'); break;
    case 'STOP':   lines.push(ind(depth)+'// STOP'); return;
    case 'INPUT':  lines.push(ind(depth)+'INPUT '+(sym.text||'x')); break;
    case 'OUTPUT': lines.push(ind(depth)+'OUTPUT '+(sym.text||'x')); break;
    case 'PROCESS':lines.push(ind(depth)+(sym.text||'// process')); break;
    case 'COMMENT':break; // notes have no pseudocode
    case 'EMBEDDED':
      // PROCEDURE blocks are emitted at the top by updatePseudocode; here just CALL
      lines.push(ind(depth)+'CALL '+(sym.text||'Procedure'));
      break;
    case 'JUNCTION':{
      const loopInfo=detectJunctionLoop(sym.id);
      if(loopInfo){
        if(loopInfo.kind==='REPEAT'){
          lines.push(ind(depth)+'REPEAT');
          // Walk body nodes in order, marking them visited
          loopInfo.bodyIds.forEach(function(bid){
            vis.add(bid);
            const bs=symbols.find(function(s){return s.id===bid;}); if(!bs) return;
            switch(bs.type){
              case 'INPUT':    lines.push(ind(depth+1)+'INPUT '+(bs.text||'x')); break;
              case 'OUTPUT':   lines.push(ind(depth+1)+'OUTPUT '+(bs.text||'x')); break;
              case 'PROCESS':  lines.push(ind(depth+1)+(bs.text||'// process')); break;
              case 'EMBEDDED': lines.push(ind(depth+1)+'CALL '+(bs.text||'Procedure')); break;
            }
          });
          vis.add(loopInfo.decId);
          lines.push(ind(depth)+'UNTIL '+loopInfo.untilCond);
          if(loopInfo.exitId) crawl(loopInfo.exitId,lines,vis,depth);
          return;
        } else if(loopInfo.kind==='WHILE'){
          lines.push(ind(depth)+'WHILE '+loopInfo.whileCond+' DO');
          vis.add(loopInfo.decId);
          // Walk body, marking body nodes visited in main vis so we don't re-traverse
          walkBlock(loopInfo.bodyStartId,lines,new Set(vis),depth+1);
          markBodyVisited(loopInfo.bodyStartId,sym.id,vis);
          lines.push(ind(depth)+'ENDWHILE');
          if(loopInfo.exitId) crawl(loopInfo.exitId,lines,vis,depth);
          return;
        }
      }
      break; // plain pass-through junction
    }
    case 'DECISION':{
      const cond=sym.text||'condition';
      const yes=outs.find(function(c){return c.label==='Yes';}),no=outs.find(function(c){return c.label==='No';});
      if(yes&&no){
        lines.push(ind(depth)+'IF '+cond+' THEN'); walkBlock(yes.toId,lines,new Set(vis),depth+1);
        lines.push(ind(depth)+'ELSE'); walkBlock(no.toId,lines,new Set(vis),depth+1);
        lines.push(ind(depth)+'ENDIF');
        const merge=findMerge(yes.toId,no.toId,vis); if(merge)crawl(merge,lines,vis,depth);
      }else{
        const branch=yes||outs[0]; lines.push(ind(depth)+'IF '+cond+' THEN');
        if(branch)walkBlock(branch.toId,lines,new Set(vis),depth+1);
        lines.push(ind(depth)+'ENDIF');
      }
      return;
    }
  }
  if(outs.length===1)crawl(outs[0].toId,lines,vis,depth);
}
function walkBlock(startId,lines,vis,depth){
  let cur=startId,steps=0;
  while(cur&&steps++<100){
    const sym=symbols.find(function(s){return s.id===cur;}); if(!sym||vis.has(cur))break;
    vis.add(cur);
    if(sym.type==='DECISION'||sym.type==='START'||sym.type==='STOP')break;
    switch(sym.type){
      case 'INPUT':    lines.push(ind(depth)+'INPUT '+(sym.text||'x')); break;
      case 'OUTPUT':   lines.push(ind(depth)+'OUTPUT '+(sym.text||'x')); break;
      case 'PROCESS':  lines.push(ind(depth)+(sym.text||'// process')); break;
      case 'EMBEDDED': lines.push(ind(depth)+'CALL '+(sym.text||'Procedure')); break;
    }
    const o=connections.filter(function(c){return c.fromId===cur;});
    if(o.length===1)cur=o[0].toId;else break;
  }
}
function findMerge(aId,bId,vis){
  const aSet=new Set();let cur=aId,s=0;
  while(cur&&s++<50){aSet.add(cur);const o=connections.filter(function(c){return c.fromId===cur;});if(o.length!==1)break;cur=o[0].toId;}
  cur=bId;s=0;
  while(cur&&s++<50){if(aSet.has(cur))return cur;const o=connections.filter(function(c){return c.fromId===cur;});if(o.length!==1)break;cur=o[0].toId;}
  return null;
}
function ind(n){return'   '.repeat(n);}

// ══════════════════════════════════════════════════════════
//  EXECUTOR
// ══════════════════════════════════════════════════════════
var runCtx=null;
async function runFlowchart(stepping){
  const start=symbols.find(function(s){return s.type==='START';}); if(!start){logC('// No START block','err');return;}
  clearConsole();clearTrace();activateTab('console');
  runCtx={vars:{},rows:[],stopped:false,stepping};
  enableInput(false); await execFlow(start.id);
  if(runCtx&&!runCtx.stopped)logC('// Execution complete.','info');
  clearHL();renderTraceTable();runCtx=null;
}
async function execFlow(startId){
  let cur=startId,steps=0;
  while(cur&&steps++<2000&&runCtx&&!runCtx.stopped){
    const sym=symbols.find(function(s){return s.id===cur;}); if(!sym)break;
    highlight(cur);
    if(runCtx.stepping)await waitStep();
    if(!runCtx||runCtx.stopped)break;
    let next=null;
    const outs=connections.filter(function(c){return c.fromId===cur;});
    switch(sym.type){
      case 'START':next=outs[0]?outs[0].toId:null;break;
      case 'STOP': runCtx.stopped=true;logC('// STOP','info');break;
      case 'INPUT':{const val=await promptUser(sym.text||'x');if(val===null){runCtx.stopped=true;break;}const k=(sym.text||'x').trim();runCtx.vars[k]=isNaN(val)?val:Number(val);traceRow(sym,k,runCtx.vars[k]);next=outs[0]?outs[0].toId:null;break;}
      case 'OUTPUT':{const v=evalE(sym.text||'',runCtx.vars);logC('OUTPUT: '+v,'out');traceRow(sym,'OUTPUT',v);next=outs[0]?outs[0].toId:null;break;}
      case 'PROCESS':{const m=(sym.text||'').match(/^(\w+)\s*[←=]\s*(.+)$/);if(m){runCtx.vars[m[1]]=evalE(m[2],runCtx.vars);traceRow(sym,m[1],runCtx.vars[m[1]]);}next=outs[0]?outs[0].toId:null;break;}
      case 'EMBEDDED':logC('CALL '+(sym.text||'Procedure'),'info');next=outs[0]?outs[0].toId:null;break;
      case 'COMMENT': next=null; break; // notes are ignored during execution
      case 'DECISION':{const res=evalC(sym.text||'false',runCtx.vars);logC('? '+(sym.text||'cond')+' \u2192 '+(res?'Yes':'No'),'info');const branch=outs.find(function(c){return c.label===(res?'Yes':'No');});next=branch?branch.toId:(outs[0]?outs[0].toId:null);break;}
      case 'JUNCTION':next=outs[0]?outs[0].toId:null;break;
    }
    cur=runCtx.stopped?null:next;
  }
  if(steps>=2000)logC('// Possible infinite loop \u2014 stopped.','err');
}
function evalE(expr,vars){try{let e=expr
  .replace(/←/g,'=')        // pseudocode assignment arrow → JS =
  .replace(/≤/g,'<=')       // Unicode ≤ → JS <=
  .replace(/≥/g,'>=')       // Unicode ≥ → JS >=
  .replace(/≠/g,'!==')      // Unicode ≠ → JS !==
  .replace(/<>/g,'!==')     // ASCII <> not-equal → JS !==
  .replace(/\bMOD\b/gi,'%')
  .replace(/\bDIV\b/gi,'/')
  .replace(/\bAND\b/gi,'&&')
  .replace(/\bOR\b/gi,'||')
  .replace(/\bNOT\s+/gi,'!')
  // Standalone = (not already part of <=, >=, !=, ==, =>) → JS strict equality ===
  .replace(/(?<![<>!=])=(?![=>])/g,'===');
for(const k in vars)e=e.replace(new RegExp('\\b'+k+'\\b','g'),JSON.stringify(vars[k]));
return Function('"use strict";return('+e+')')();}catch{return expr;}}
function evalC(c,v){try{return Boolean(evalE(c,v));}catch{return false;}}
function promptUser(varName){return new Promise(function(res){enableInput(true,'INPUT '+varName+' >');function done(){const v=cInput.value;cInput.value='';enableInput(false);res(v);}cSubmit.onclick=done;cInput.onkeydown=function(e){if(e.key==='Enter')done();};});}
function waitStep(){return new Promise(function(res){const btn=document.getElementById('btn-step');btn.classList.add('waiting');btn.onclick=function(){btn.classList.remove('waiting');btn.onclick=null;res();};});}
function highlight(id){clearHL();const g=nodesG.querySelector('[data-id="'+id+'"]');if(g)g.classList.add('active-exec');}
function clearHL(){nodesG.querySelectorAll('.active-exec').forEach(function(g){g.classList.remove('active-exec');});}
function resetExec(){if(runCtx)runCtx.stopped=true;clearHL();clearConsole();clearTrace();runCtx=null;logC('// CIE Flowchart Simulator','c-welcome');logC('// Press RUN to execute','c-welcome');}
function logC(msg,cls){const d=document.createElement('div');d.className='c-line c-'+(cls||'out');d.textContent=msg;consoleOut.appendChild(d);consoleOut.scrollTop=consoleOut.scrollHeight;}
function clearConsole(){consoleOut.innerHTML='';}
function enableInput(on,lbl){cPrompt.textContent=lbl||'INPUT >';cInput.disabled=!on;cSubmit.disabled=!on;if(on){activateTab('console');cInput.focus();}}
function activateTab(name){document.querySelectorAll('.rp-tab').forEach(function(b){b.classList.toggle('active',b.dataset.tab===name);});document.querySelectorAll('.rp-pane').forEach(function(p){p.classList.toggle('active',p.id==='pane-'+name);});}
function traceRow(sym,k,v){if(runCtx)runCtx.rows.push({step:runCtx.rows.length+1,block:sym.type,v:k,val:v});}
function clearTrace(){traceWrap.innerHTML='<div class="trace-hint">Run your flowchart to populate the trace table.</div>';}
function renderTraceTable(){
  if(!runCtx||!runCtx.rows.length) return;
  const rows=runCtx.rows,vars=[...new Set(rows.map(function(r){return r.v;}))];
  let h='<table class="trace-table"><thead><tr><th>#</th><th>Block</th>';
  vars.forEach(function(v){h+='<th>'+v+'</th>';});
  h+='</tr></thead><tbody>';
  const last={};
  rows.forEach(function(r){
    last[r.v]=r.val; h+='<tr><td>'+r.step+'</td><td>'+r.block+'</td>';
    vars.forEach(function(v){h+='<td>'+(v===r.v?'<strong>'+r.val+'</strong>':(last[v]!==undefined?last[v]:''))+'</td>';});
    h+='</tr>';
  });
  traceWrap.innerHTML=h+'</tbody></table>';
}

// ══════════════════════════════════════════════════════════
//  EXPORT B&W PNG  (FIX G)
//  Root cause of original bug: .conn-hit paths have
//  fill:none/stroke:transparent ONLY via CSS class.
//  When SVG rendered to canvas via blob URL, the external
//  stylesheet is NOT loaded → conn-hit gets SVG defaults
//  (black fill) → big black blobs. Also marker size uses
//  markerUnits="strokeWidth" so a 14px stroke makes the
//  arrowhead 9×14=126 units wide → giant triangles.
//  Fix: remove conn-hit from clone, then inline ALL styles.
// ══════════════════════════════════════════════════════════
function exportBW(){
  if(!symbols.length){alert('Add some shapes first.');return;}

  // Tight content bounding box
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  symbols.forEach(function(s){
    const sw=s.w||DEFS[s.type].w, sh=s.h||DEFS[s.type].h;
    minX=Math.min(minX,s.x);minY=Math.min(minY,s.y);
    maxX=Math.max(maxX,s.x+sw);maxY=Math.max(maxY,s.y+sh);
  });
  const PAD=48; minX-=PAD;minY-=PAD;maxX+=PAD;maxY+=PAD;
  const expW=maxX-minX, expH=maxY-minY;

  const clone=svg.cloneNode(true);
  clone.setAttribute('viewBox',minX+' '+minY+' '+expW+' '+expH);
  clone.setAttribute('width', expW);
  clone.setAttribute('height',expH);
  clone.removeAttribute('style');

  // ── Step 1: Remove interactive/decoration-only elements ──
  // CRITICAL: conn-hit has fill:none;stroke:transparent only via CSS.
  // Without the stylesheet those paths render as solid black → remove them.
  clone.querySelectorAll('.conn-hit,.port-hit,.port-dot').forEach(function(e){e.remove();});
  const hideSel=['#temp-conn','#sel-box','#snap-ring'];
  hideSel.forEach(function(s){const el=clone.querySelector(s);if(el)el.setAttribute('visibility','hidden');});
  clone.querySelectorAll('.node-group').forEach(function(g){
    g.classList.remove('selected','active-exec');
  });

  // ── Step 2: White background ──────────────────────────────
  const bg=clone.querySelector('#canvas-bg'); if(bg){bg.setAttribute('fill','#ffffff');bg.removeAttribute('class');}
  const dg=clone.querySelector('#dot-grid'); if(dg) dg.remove();

  // ── Step 3: Inline all visual styles ─────────────────────
  // Junction dots no longer rendered (clean T-intersections)
  clone.querySelectorAll('.junction-dot').forEach(function(e){e.remove();});
  // Node shapes
  clone.querySelectorAll('.node-shape').forEach(function(e){
    e.setAttribute('fill','#ffffff'); e.setAttribute('stroke','#111111');
    e.setAttribute('stroke-width','2'); e.removeAttribute('filter'); e.removeAttribute('style');
    e.removeAttribute('class');
  });
  // Comment boxes — inline styles so they render correctly without the stylesheet
  clone.querySelectorAll('.comment-shape').forEach(function(e){
    e.setAttribute('fill','#ffffff'); e.setAttribute('stroke','#555555');
    e.setAttribute('stroke-width','1.5'); e.setAttribute('stroke-dasharray','8 4');
    e.removeAttribute('class');
  });
  // Convert comment foreignObjects to plain SVG text (foreignObject + HTML doesn't
  // render in canvas when the SVG is loaded via a blob URL)
  clone.querySelectorAll('[data-id]').forEach(function(g){
    const fo=g.querySelector('foreignObject'); if(!fo)return;
    const xOff=parseFloat(fo.getAttribute('x'))||8;
    const yOff=parseFloat(fo.getAttribute('y'))||6;
    const div=fo.querySelector('div');
    const raw=div?div.textContent:'';
    fo.remove();
    const lines=raw.split('\n');
    lines.forEach(function(line,i){
      if(!line)return;
      const t=document.createElementNS('http://www.w3.org/2000/svg','text');
      t.setAttribute('x',String(xOff+2));
      t.setAttribute('y',String(yOff+13+i*16));
      t.setAttribute('font-family','monospace');
      t.setAttribute('font-size','11');
      t.setAttribute('fill','#444444');
      t.textContent=line;
      g.appendChild(t);
    });
  });
  // Remove comment resize handles
  clone.querySelectorAll('[data-resize-id]').forEach(function(e){e.remove();});
  // Node bars (Embedded subroutine vertical lines)
  clone.querySelectorAll('.node-bar').forEach(function(e){
    e.setAttribute('fill','none'); e.setAttribute('stroke','#111111');
    e.setAttribute('stroke-width','1.5'); e.removeAttribute('class');
  });
  // Node label text — must inline font so it renders in canvas
  clone.querySelectorAll('.node-text').forEach(function(e){
    e.setAttribute('fill','#111111');
    e.setAttribute('font-family','Outfit, Arial, sans-serif');
    e.setAttribute('font-size','12');
    e.removeAttribute('class');
  });
  // Connection paths — MUST set fill:none or the zig-zag area fills black
  clone.querySelectorAll('.conn-path').forEach(function(e){
    e.setAttribute('fill','none'); e.setAttribute('stroke','#111111');
    e.setAttribute('stroke-width','1.5'); e.setAttribute('stroke-linecap','round');
    e.setAttribute('stroke-linejoin','round');
    if(e.hasAttribute('marker-end')) e.setAttribute('marker-end','url(#arr-bw)'); e.removeAttribute('class');
  });
  // Branch label backgrounds
  clone.querySelectorAll('.conn-label-bg').forEach(function(e){
    e.setAttribute('fill','#ffffff'); e.setAttribute('stroke','#999999');
    e.setAttribute('stroke-width','1'); e.removeAttribute('class');
  });
  // Branch label texts
  clone.querySelectorAll('.conn-label,.conn-label-yes,.conn-label-no').forEach(function(e){
    e.setAttribute('fill','#111111');
    e.setAttribute('font-family','monospace'); e.setAttribute('font-size','10');
    e.setAttribute('font-weight','700'); e.removeAttribute('class');
  });

  // ── Step 4: render to canvas at 2× ────────────────────────
  const blob=new Blob([new XMLSerializer().serializeToString(clone)],{type:'image/svg+xml'});
  const url=URL.createObjectURL(blob);
  const img=new Image();
  img.onload=function(){
    const scale=2;
    const c=document.createElement('canvas'); c.width=expW*scale; c.height=expH*scale;
    const ctx=c.getContext('2d');
    ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,c.width,c.height);
    ctx.scale(scale,scale); ctx.drawImage(img,0,0,expW,expH);
    URL.revokeObjectURL(url);
    const a=document.createElement('a');
    a.href=c.toDataURL('image/png'); a.download='flowchart-bw.png'; a.click();
  };
  img.onerror=function(){
    const a=document.createElement('a'); a.href=url; a.download='flowchart-bw.svg'; a.click();
  };
  img.src=url;
}

// ══════════════════════════════════════════════════════════
//  PERSIST + INIT
// ══════════════════════════════════════════════════════════
function save(){
  try{localStorage.setItem('cie_fc_s',JSON.stringify(symbols));localStorage.setItem('cie_fc_c',JSON.stringify(connections));}catch{}
}
function load(){
  try{
    symbols    =JSON.parse(localStorage.getItem('cie_fc_s')||'[]');
    connections=JSON.parse(localStorage.getItem('cie_fc_c')||'[]');
    // Migrate loop-entry connections: recompute toPort so old saved diagrams
    // (which may have 'top' or the wrong 'left'/'right') are corrected on load.
    connections.forEach(function(conn){
      if(!conn.loopEntry) return;
      const junc=symbols.find(function(s){return s.id===conn.toId&&s.type==='JUNCTION';});
      const srcSym=symbols.find(function(s){return s.id===conn.fromId;});
      if(!junc||!srcSym) return;
      const jx=junc.x+junc.w/2, jy=junc.y+junc.h/2;
      const fp=portPos(srcSym,conn.fromPort);
      const preview=orthPathFull(fp,conn.fromPort,{x:jx,y:jy},'top',conn.fromId,null);
      const pathX=preview.pts[2]?preview.pts[2][0]:fp.x;
      conn.toPort=pathX<=jx?'left':'right';
    });
    // Migrate old symbols that predate sym.w / sym.h
    symbols.forEach(function(sym){
      if(!sym.w||!sym.h){
        const full=getFullLabel(sym);
        const dims=computeSymDims(sym.type,full);
        sym.w=dims.w; sym.h=dims.h;
      }
    });
    // Restore theme icon
    if(localStorage.getItem('cie_theme')==='light'){
      document.body.classList.add('light-mode');
      document.getElementById('btn-theme').textContent='☀';
    }
  }catch{symbols=[];connections=[];}
}

// ══════════════════════════════════════════════════════════
//  MOBILE / TOUCH SUPPORT
// ══════════════════════════════════════════════════════════
let pinchStartMob    = null;  // {dist, zoom}
let touchPanMob      = null;  // {startX,startY,scrollX,scrollY}
let placingTypeMob   = null;  // type string for tap-to-place
let placingTypeMobTimeout = null; // auto-dismiss timeout
let pendingWireMob   = null;  // {fromId, fromPort, fp} tap-to-connect
let touchWireStartMob = null; // {clientX,clientY} to detect tap vs drag on port

function touchDistMob(e){
  const t=e.touches;
  if(t.length<2) return null;
  const dx=t[0].clientX-t[1].clientX, dy=t[0].clientY-t[1].clientY;
  return Math.sqrt(dx*dx+dy*dy);
}

function setPendingWireMob(data){
  pendingWireMob = data;
  tempConn.setAttribute('visibility','visible');
  tempConn.setAttribute('d','M'+data.fp.x+','+data.fp.y+' L'+(data.fp.x+30)+','+data.fp.y);
  // Pulse the source port dot
  nodesG.querySelectorAll('.port-dot').forEach(function(d){
    d.classList.toggle('port-pending',
      d.closest('[data-id]')&&d.closest('[data-id]').dataset.id===data.fromId&&
      d.getAttribute('data-port')===data.fromPort);
  });
  snapRing.setAttribute('visibility','hidden');
  const hint=document.getElementById('place-hint');
  if(hint){hint.textContent='Tap another port to connect';hint.classList.add('visible');}
}
function cancelPendingWireMob(){
  pendingWireMob=null; touchWireStartMob=null;
  tempConn.setAttribute('visibility','hidden');
  snapRing.setAttribute('visibility','hidden');
  nodesG.querySelectorAll('.port-pending').forEach(function(d){d.classList.remove('port-pending');});
  const hint=document.getElementById('place-hint');
  if(hint) hint.classList.remove('visible');
}
function setPlacingTypeMob(type){
  placingTypeMob=type;
  const hint=document.getElementById('place-hint');
  if(!hint) return;
  if(placingTypeMobTimeout){
    clearTimeout(placingTypeMobTimeout);
    placingTypeMobTimeout=null;
  }
  if(type){
    hint.textContent='Tap canvas to place '+type;
    hint.classList.add('visible');
    placingTypeMobTimeout=setTimeout(function(){
      setPlacingTypeMob(null);
    },10000);
  } else {
    hint.classList.remove('visible');
  }
}
function closeMobileSidebars(){
  document.getElementById('left-sidebar').classList.remove('mobile-open');
  document.getElementById('right-panel').classList.remove('mobile-open');
  const bd=document.getElementById('mobile-backdrop');
  if(bd) bd.classList.remove('visible');
  document.querySelectorAll('.mobile-nav-btn').forEach(function(b){b.classList.remove('active');});
}

// Canvas-wrapper: pan + pinch + place-mode tap
wrap.addEventListener('touchstart',function(e){
  if(e.touches.length===2){
    e.preventDefault();
    pinchStartMob={dist:touchDistMob(e),zoom};
    touchPanMob=null;
    return;
  }
  if(e.touches.length===1){
    const tgt=e.target;
    if(tgt===svg||tgt===document.getElementById('canvas-bg')||
       tgt===document.getElementById('connections-layer')||
       tgt===document.getElementById('nodes-layer')){
      if(pendingWireMob){e.preventDefault();cancelPendingWireMob();return;}
      if(placingTypeMob){
        e.preventDefault();
        const touch=e.touches[0];
        const sp=clientToSVG(touch.clientX,touch.clientY);
        const dTxt=defaultText(placingTypeMob);
        const full=DEFS[placingTypeMob].prefix?DEFS[placingTypeMob].prefix+' '+dTxt:dTxt;
        const dims=computeSymDims(placingTypeMob,full);
        const sym={
          id:uid(),type:placingTypeMob,
          x:Math.round(Math.max(10,Math.min(CW-dims.w-10,sp.x-dims.w/2))),
          y:Math.round(Math.max(10,Math.min(CH-dims.h-10,sp.y-dims.h/2))),
          text:dTxt,w:dims.w,h:dims.h,embeddedCode:'',
        };
        symbols.push(sym);selId=sym.id;selSet.clear();renderAll();save();
        setPlacingTypeMob(null);closeMobileSidebars();return;
      }
      touchPanMob={startX:e.touches[0].clientX,startY:e.touches[0].clientY,
                   scrollX:wrap.scrollLeft,scrollY:wrap.scrollTop};
    }
  }
},{passive:false});

document.addEventListener('touchmove',function(e){
  // Cancel long-press if finger moves significantly
  if(_longPressTimer){
    if(e.touches.length===1){
      const t=e.touches[0];
      if(Math.abs(t.clientX-_longPressStartX)>10||Math.abs(t.clientY-_longPressStartY)>10){
        clearTimeout(_longPressTimer);
        _longPressTimer=null;
        _longPressMoveOk=false;
      }
    }
  }
  if(e.touches.length===2&&pinchStartMob){
    e.preventDefault();
    const d=touchDistMob(e); if(!d) return;
    zoom=Math.max(0.25,Math.min(3,parseFloat((pinchStartMob.zoom*(d/pinchStartMob.dist)).toFixed(2))));
    applyZoom();return;
  }
  const touch=e.touches[0];
  if(symDrag){
    e.preventDefault();
    const sp=clientToSVG(touch.clientX,touch.clientY);
    const dx=sp.x-symDrag.startX, dy=sp.y-symDrag.startY;
    Object.keys(symDrag.origPositions).forEach(function(id){
      const sym=symbols.find(function(s){return s.id===id;});
      const orig=symDrag.origPositions[id]; if(!sym||!orig) return;
      sym.x=Math.round(Math.max(0,Math.min(CW-sym.w,orig.x+dx)));
      sym.y=Math.round(Math.max(0,Math.min(CH-sym.h,orig.y+dy)));
      const g=nodesG.querySelector('[data-id="'+id+'"]');
      if(g) g.setAttribute('transform','translate('+sym.x+','+sym.y+')');
    });
    connsG.innerHTML=''; connections.forEach(renderConn);
    return;
  }
  if(touchPanMob){
    e.preventDefault();
    wrap.scrollLeft=touchPanMob.scrollX-(touch.clientX-touchPanMob.startX);
    wrap.scrollTop =touchPanMob.scrollY-(touch.clientY-touchPanMob.startY);
    return;
  }
  if(wireDrag){
    e.preventDefault();
    const sp=clientToSVG(touch.clientX,touch.clientY);
    const fs=symbols.find(function(s){return s.id===wireDrag.fromId;}); if(!fs)return;
    const fp=portPos(fs,wireDrag.fromPort);
    const snp=findSnap(sp.x,sp.y,wireDrag.fromId);
    if(snp){
      snapRing.setAttribute('cx',snp.x);snapRing.setAttribute('cy',snp.y);
      snapRing.setAttribute('visibility','visible');
      tempConn.setAttribute('d',orthPath(fp,wireDrag.fromPort,snp,snp.port));
    } else {
      snapRing.setAttribute('visibility','hidden');
      tempConn.setAttribute('d','M'+fp.x+','+fp.y+' L'+sp.x+','+sp.y);
    }
    return;
  }
  if(pendingWireMob){
    e.preventDefault();
    const sp=clientToSVG(touch.clientX,touch.clientY);
    const fp=pendingWireMob.fp;
    const snp=findSnap(sp.x,sp.y,pendingWireMob.fromId);
    if(snp){
      snapRing.setAttribute('cx',snp.x);snapRing.setAttribute('cy',snp.y);
      snapRing.setAttribute('visibility','visible');
      tempConn.setAttribute('d',orthPath(fp,pendingWireMob.fromPort,snp,snp.port));
    } else {
      snapRing.setAttribute('visibility','hidden');
      tempConn.setAttribute('d','M'+fp.x+','+fp.y+' L'+sp.x+','+sp.y);
    }
    return;
  }
},{passive:false});

document.addEventListener('touchend',function(e){
  // Cancel long-press timer
  if(_longPressTimer){
    clearTimeout(_longPressTimer);
    _longPressTimer=null;
    _longPressMoveOk=false;
  }
  pinchStartMob=null;
  if(touchPanMob){touchPanMob=null;return;}
  if(symDrag){
    const touch=e.changedTouches[0];
    const drag=symDrag; symDrag=null;
    // Drop on left sidebar → delete
    const sb=document.getElementById('left-sidebar');
    const sbr=sb.getBoundingClientRect();
    if(touch.clientX>=sbr.left&&touch.clientX<=sbr.right&&
       touch.clientY>=sbr.top &&touch.clientY<=sbr.bottom){
      const toDelete=selSet.size>0?[...selSet]:[drag.id];
      toDelete.forEach(function(id){deleteSym(id);});
      selId=null;selSet.clear();renderAll();save();return;
    }
    renderAll();save();return;
  }
  if(wireDrag){
    // Drag-wire completed by lifting finger
    const touch=e.changedTouches[0];
    const sp=clientToSVG(touch.clientX,touch.clientY);
    const snp=findSnap(sp.x,sp.y,wireDrag.fromId);
    tempConn.setAttribute('visibility','hidden');
    snapRing.setAttribute('visibility','hidden');
    if(snp) addConnection(wireDrag.fromId,wireDrag.fromPort,snp.symId,snp.port);
    wireDrag=null;return;
  }
},{passive:true});

// ── Setup mobile UI (injected elements) ───────────────
function setupMobileUI(){
  // Place hint bar
  const hint=document.createElement('div');
  hint.id='place-hint'; document.body.appendChild(hint);
  hint.addEventListener('click',function(){cancelPendingWireMob();setPlacingTypeMob(null);});

  // Backdrop
  const bd=document.createElement('div');
  bd.id='mobile-backdrop'; document.body.appendChild(bd);
  bd.addEventListener('click',closeMobileSidebars);

  // Drag-handle pills
  document.querySelectorAll('.sidebar-header').forEach(function(h){
    const pill=document.createElement('div');
    pill.className='sidebar-drag-handle';
    h.parentElement.insertBefore(pill,h);
  });

  // Bottom nav
  const nav=document.createElement('div'); nav.id='mobile-nav';
  nav.innerHTML='<button class="mobile-nav-btn" id="mob-btn-sym">'+
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+
    '<rect x="3" y="3" width="5" height="5"/><rect x="3" y="16" width="5" height="5"/>'+
    '<path d="M12 5h7M12 12h7M12 19h7"/></svg> Symbols</button>'+
    '<button class="mobile-nav-btn" id="mob-btn-code">'+
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">'+
    '<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg> Code &amp; Run</button>';
  document.body.appendChild(nav);

  const ls=document.getElementById('left-sidebar');
  const rp=document.getElementById('right-panel');

  document.getElementById('mob-btn-sym').addEventListener('click',function(){
    const isOpen=ls.classList.contains('mobile-open');
    closeMobileSidebars();
    if(!isOpen){ls.classList.add('mobile-open');bd.classList.add('visible');this.classList.add('active');}
    cancelPendingWireMob();setPlacingTypeMob(null);
  });
  document.getElementById('mob-btn-code').addEventListener('click',function(){
    const isOpen=rp.classList.contains('mobile-open');
    closeMobileSidebars();
    if(!isOpen){rp.classList.add('mobile-open');bd.classList.add('visible');this.classList.add('active');}
  });

  // Swipe-down to close
  [ls,rp].forEach(function(sidebar){
    let sy=null;
    sidebar.addEventListener('touchstart',function(e){sy=e.touches[0].clientY;},{passive:true});
    sidebar.addEventListener('touchend',function(e){
      if(sy===null)return;
      if(e.changedTouches[0].clientY-sy>60)closeMobileSidebars();
      sy=null;
    },{passive:true});
  });

  // Tap-to-place from component library
  document.getElementById('component-library').addEventListener('click',function(e){
    const item=e.target.closest('.comp-item');
    if(!item||!item.dataset.type) return;
    closeMobileSidebars();
    setPlacingTypeMob(item.dataset.type);
  });

  // Override positionZoomControls on mobile
  if(window.innerWidth<=640){
    const zc=document.getElementById('zoom-controls');
    if(zc){zc.style.right='12px';zc.style.bottom='52px';}
  }
}

load();
applyZoom();
renderAll();
setupMobileUI();
requestAnimationFrame(function(){
  wrap.scrollLeft=(CW*zoom-wrap.clientWidth)/2;
  wrap.scrollTop =(CH*zoom-wrap.clientHeight)/2;
  positionZoomControls();
});
window.addEventListener('resize',positionZoomControls);
window.addEventListener('orientationchange',function(){
  setTimeout(positionZoomControls,300);
});