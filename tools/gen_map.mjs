import * as topojson from 'topojson-client';
import { geoConicConformal, geoPath } from 'd3-geo';
import { Delaunay } from 'd3-delaunay';
import pc from 'polygon-clipping';
import { readFileSync, writeFileSync } from 'fs';

const W = 1000, H = 800, PAD = 8;

// ---- province seeds: id, display name, lon, lat, terrain, dev ----
const SEEDS = [
 // England
 ['cornwall','Cornwall',-5.05,50.30,'hills',1], ['devon','Devon',-3.53,50.75,'hills',1],
 ['wessex','Wessex',-1.31,51.06,'plains',3], ['sussex','Sussex',-0.77,50.86,'plains',2],
 ['kent','Kent',1.08,51.28,'plains',3], ['essex','Middlesex',-0.12,51.51,'plains',4],
 ['oxford','Oxford',-1.26,51.75,'plains',2], ['hereford','Hereford',-2.72,52.06,'plains',2],
 ['eastanglia','East Anglia',1.10,52.55,'marsh',3], ['lincoln','Lincoln',-0.54,53.23,'marsh',2],
 ['mercia','Mercia',-1.60,52.68,'plains',3], ['chester','Chester',-2.89,53.19,'forest',2],
 ['lancaster','Lancaster',-2.80,54.05,'forest',1], ['york','York',-1.08,53.96,'plains',2],
 ['northumbria','Northumbria',-1.80,55.35,'hills',1], ['cumbria','Cumbria',-2.94,54.80,'hills',1],
 // Wales
 ['gwynedd','Gwynedd',-4.13,53.10,'hills',1], ['powys','Powys',-3.42,52.35,'hills',1],
 ['deheubarth','Deheubarth',-4.20,51.90,'hills',1],
 // Scotland
 ['lothian','Lothian',-3.19,55.85,'plains',2], ['strathclyde','Galloway',-4.30,55.20,'hills',1],
 ['argyll','Argyll',-5.45,56.40,'hills',1], ['alba','Alba',-3.43,56.55,'hills',1],
 ['moray','Moray',-4.10,57.55,'hills',1],
 // Ireland
 ['ulster','Ulster',-6.65,54.55,'hills',1], ['connacht','Connacht',-8.85,53.45,'hills',1],
 ['meath','Meath',-7.00,53.75,'plains',1], ['leinster','Leinster',-6.45,52.95,'plains',2],
 ['munster','Munster',-8.30,52.35,'plains',2],
 // Norway
 ['trondelag','Trøndelag',10.39,63.20,'hills',1], ['vestland','Vestland',5.90,60.60,'hills',1],
 ['agder','Agder',7.60,58.60,'hills',1], ['viken','Viken',10.75,59.75,'forest',2],
 // Sweden
 ['svealand','Svealand',17.00,59.75,'forest',2], ['gotaland','Västergötland',13.20,58.20,'forest',1],
 ['ostergotland','Östergötland',15.62,58.35,'forest',1], ['smaland','Småland',14.50,56.95,'forest',1],
 // Denmark
 ['jylland','Jylland',9.40,56.60,'forest',2], ['slesvig','Slesvig',9.30,54.80,'plains',2],
 ['fyn','Fyn',10.39,55.35,'plains',2], ['sjaelland','Sjaelland',11.85,55.55,'plains',3],
 ['skane','Skåne',13.30,55.85,'plains',2],
 // France & Low Countries
 ['flanders','Flanders',3.22,50.95,'plains',4], ['ponthieu','Ponthieu',1.85,50.15,'plains',2],
 ['vermandois','Vermandois',3.40,49.60,'plains',3], ['rouen','Rouen',1.09,49.44,'plains',3],
 ['caen','Caen',-0.90,49.10,'plains',2], ['brittany','Brittany',-1.68,48.11,'hills',2],
 ['leon','Cornouaille',-4.10,48.20,'hills',1], ['maine','Maine',0.20,48.10,'forest',2],
 ['anjou','Anjou',-0.55,47.47,'plains',2], ['touraine','Touraine',0.68,47.39,'plains',2],
 ['orleans','Orléans',1.90,47.90,'plains',3], ['idf','Île-de-France',2.35,48.85,'plains',4],
 ['champagne','Champagne',4.07,48.55,'plains',3], ['burgundy','Burgundy',4.85,47.25,'hills',2],
 ['berry','Berry',2.40,46.95,'plains',2], ['poitou','Poitou',0.10,46.55,'plains',2],
 ['aquitaine','Aquitaine',-0.58,44.84,'plains',3], ['gascony','Gascony',0.30,43.75,'plains',2],
 ['toulouse','Toulouse',1.44,43.70,'plains',3], ['auvergne','Auvergne',3.09,45.60,'hills',1],
 ['provence','Provence',5.45,43.70,'hills',2],
 // The Empire
 ['frisia','Frisia',5.90,53.10,'marsh',2], ['holland','Holland',4.90,52.20,'marsh',3],
 ['cologne','Cologne',6.96,50.94,'plains',3], ['saxony','Saxony',9.60,52.40,'forest',2],
 ['lorraine','Lorraine',6.18,48.90,'forest',2], ['franconia','Franconia',9.93,49.90,'forest',2],
 ['swabia','Swabia',9.50,48.30,'hills',2],
 ['bavaria','Bavaria',12.10,49.02,'forest',2], ['austria','Austria',16.37,48.21,'plains',2],
 ['carinthia','Carinthia',14.31,46.62,'hills',1],
 // Iberia
 ['galicia','Galicia',-8.54,42.88,'hills',1], ['leonp','León',-5.57,42.60,'plains',2],
 ['castile','Castile',-3.70,42.00,'plains',2], ['navarre','Navarre',-1.64,42.60,'hills',2],
 ['aragon','Aragon',-0.88,41.65,'plains',2], ['barcelona','Barcelona',1.80,41.55,'plains',3],
 ['portugal','Portugal',-8.43,40.21,'hills',2], ['toledo','Toledo',-4.03,39.86,'plains',3],
 ['andalusia','Andalusia',-5.30,37.50,'plains',3], ['valencia','Valencia',-0.80,39.20,'plains',2],
 // Italy
 ['savoy','Savoy',7.50,45.07,'hills',2], ['lombardy','Lombardy',9.60,45.40,'plains',4],
 ['venice','Venice',12.34,45.44,'marsh',4], ['genoa','Genoa',8.93,44.20,'hills',3],
 ['tuscany','Tuscany',11.25,43.60,'plains',3], ['romagna','Romagna',11.80,44.30,'plains',2],
 ['latium','Latium',12.48,41.89,'plains',4], ['apulia','Apulia',16.60,41.00,'plains',2],
 ['naples','Naples',14.25,40.85,'plains',3], ['calabria','Calabria',16.25,39.10,'hills',1],
 ['sicily','Sicily',13.80,37.70,'plains',3],
 // Balkans & Byzantium
 ['croatia','Croatia',15.80,44.80,'hills',1], ['serbia','Serbia',20.90,43.70,'hills',1],
 ['hungary','Hungary',19.04,47.30,'plains',3], ['transylvania','Transylvania',23.60,46.77,'hills',1],
 ['wallachia','Wallachia',25.46,44.70,'plains',1], ['bulgaria','Bulgaria',25.30,43.00,'hills',2],
 ['macedonia','Macedonia',22.94,40.75,'plains',3], ['hellas','Hellas',23.00,38.60,'hills',2],
 ['epirus','Epirus',20.60,39.80,'hills',1], ['dyrrachion','Dyrrachion',19.60,41.40,'hills',2],
 ['thrace','Thrace',27.60,41.30,'plains',5], ['nicaea','Nicaea',29.30,40.00,'plains',3],
 ['paphlagonia','Paphlagonia',32.85,40.60,'plains',2], ['cappadocia','Cappadocia',34.80,38.72,'plains',2],
 ['armeniakon','Armeniakon',38.00,39.90,'hills',1], ['trebizond','Trebizond',39.30,40.80,'hills',2],
 ['cilicia','Cilicia',34.80,36.90,'plains',2],
 // Eastern Europe
 ['bohemia','Bohemia',14.42,50.09,'forest',2], ['poland','Poland',19.40,50.60,'plains',2],
 ['masovia','Masovia',21.01,52.23,'forest',1], ['pomerania','Pomerania',17.00,53.80,'forest',1],
 ['volhynia','Volhynia',24.90,50.40,'forest',1], ['kiev','Kiev',30.52,50.45,'plains',3],
];
const DUMMIES_NEW = [
 [13.5,64.3],[16.5,65.2],[19.5,64.8],[34.5,52.5],[38.5,50.5],[36.0,51.8],[40.0,48.5],[41.5,52.0],
 [-7.0,38.5],[-2.5,36.9],[35.5,34.0],[36.2,33.5],[38.5,35.5],[40.5,37.0],[41.5,42.0],[44.0,40.0],
 [34.0,44.6],[36.5,45.3],[33.0,47.0],[35.0,48.5],[39.0,47.2],[37.5,55.7],[30.3,59.9],[27.5,53.9],
 [25.3,54.7],[24.1,56.9],[24.7,59.4],[10.0,36.8],[3.0,36.7],[-6.8,34.0],[13.2,32.9],[22.6,32.1],
 [28.0,63.0],[31.0,61.0],[23.8,61.5],[32.0,34.7],[33.4,35.2],
];
const DUMMIES = [...DUMMIES_NEW,
 
 
 
 
 [15.5,62.8],[19.5,63.5],[24.5,60.5],[22.5,58.8],[24.0,57.0],[21.0,55.6], // Norrland/Finland/Baltics
 [7.9,46.4],[10.3,46.6],                                                  // high Alps
];

// ---- projection fitted to region ----
const regionGeo = { type:'Polygon', coords:null };
const bbox = { type: 'Polygon', coordinates: [[[-11,34.5],[-11,64.8],[42,64.8],[42,34.5],[-11,34.5]]] };
const proj = geoConicConformal().parallels([40,60]).rotate([-15,0]);
proj.fitExtent([[PAD,PAD],[W-PAD,H-PAD]], bbox);

// ---- land polygons (projected, clipped to viewport) ----
const world = JSON.parse(readFileSync('node_modules/world-atlas/land-50m.json'));
const land = topojson.feature(world, world.objects.land);
const viewRect = [[[PAD,PAD],[W-PAD,PAD],[W-PAD,H-PAD],[PAD,H-PAD],[PAD,PAD]]];
function ringArea(r){ let a=0; for(let i=0;i<r.length-1;i++) a += r[i][0]*r[i+1][1]-r[i+1][0]*r[i][1]; return Math.abs(a/2); }
let landMP = [];
const geoRect = [[[-11,34.5],[42,34.5],[42,64.8],[-11,64.8],[-11,34.5]]];
const geom = land.type==='FeatureCollection' ? land.features[0].geometry : land.geometry;
console.log('land polygons in source:', geom.coordinates.length);
for(const poly of geom.coordinates){
  let clipped;
  try{ clipped = pc.intersection([poly], [geoRect]); }catch(e){ continue; }
  for(const p of clipped){
    const projPoly = p.map(ring => ring.map(pt => proj(pt)));
    if(projPoly[0] && projPoly[0].length>3 && ringArea(projPoly[0]) > 30) landMP.push(projPoly);
  }
}
console.log('land pieces:', landMP.length);

// ---- voronoi over all seeds ----
const pts = [...SEEDS.map(s=>proj([s[2],s[3]])), ...DUMMIES.map(d=>proj(d))];
console.log('pts valid:', pts.every(p=>p&&isFinite(p[0])&&isFinite(p[1])), 'count', pts.length);
pts.forEach((p,i)=>{ if(!p||!isFinite(p[0])||!isFinite(p[1])) console.log('BAD PT', i, i<SEEDS.length?SEEDS[i][0]:'dummy'+(i-SEEDS.length), p); });
const delaunay = Delaunay.from(pts);
const vor = delaunay.voronoi([0,0,W,H]);

function dpSimplify(ring, eps){
  const n = ring.length;
  if(n<5) return ring;
  const keep = new Array(n).fill(false);
  keep[0]=keep[n-1]=true;
  const stack=[];
  const closed = ring[0][0]===ring[n-1][0] && ring[0][1]===ring[n-1][1];
  if(closed){ const m=Math.floor(n/2); keep[m]=true; stack.push([0,m],[m,n-1]); }
  else stack.push([0,n-1]);
  while(stack.length){
    const [a,b]=stack.pop();
    let dm=0, im=-1;
    const [ax,ay]=ring[a], [bx,by]=ring[b];
    const dx=bx-ax, dy=by-ay, len=Math.hypot(dx,dy)||1e-9;
    for(let i=a+1;i<b;i++){
      const d=Math.abs(dy*ring[i][0]-dx*ring[i][1]+bx*ay-by*ax)/len;
      if(d>dm){dm=d;im=i;}
    }
    if(dm>eps){keep[im]=true;stack.push([a,im],[im,b]);}
  }
  return ring.filter((_,i)=>keep[i]);
}

const out = {};
const edgeKeys = {}; // provId -> Set of vertex keys
for(let i=0;i<SEEDS.length;i++){
  const [id,name,lon,lat,terr,dev] = SEEDS[i];
  const cell = vor.cellPolygon(i);
  if(!cell){ console.log('NO CELL', id); continue; }
  let pieces;
  try{ pieces = pc.intersection([[cell]], landMP); }catch(e){ console.log('clip fail', id, e.message); pieces=[]; }
  const rings = [];
  const keys = new Set();
  let landArea = 0;
  for(const poly of pieces){
    for(const ring of poly){
      const a = ringArea(ring);
      if(a < 40) continue;
      landArea += a;
      for(const p of ring) keys.add(Math.round(p[0]*2)+','+Math.round(p[1]*2));
      let r = dpSimplify(ring, 1.1).map(p=>[Math.round(p[0]*10)/10, Math.round(p[1]*10)/10]);
      if(r.length>=4) rings.push(r);
    }
  }
  if(!rings.length){ console.log('EMPTY', id); continue; }
  const cellArea = ringArea(cell);
  const coast = landArea < cellArea*0.985 ? 1 : 0;
  const lp = proj([lon,lat]).map(v=>Math.round(v));
  out[id] = { n:name, t:terr, d:dev, lbl:lp, coast, polys:rings, adj:[] };
  edgeKeys[id] = keys;
}

// ---- adjacency: voronoi neighbours that share >=2 boundary vertices ----
const ids = SEEDS.map(s=>s[0]);
for(let i=0;i<SEEDS.length;i++){
  const a = ids[i]; if(!out[a]) continue;
  for(const j of delaunay.neighbors(i)){
    if(j>=SEEDS.length || j<0) continue;
    const b = ids[j]; if(!out[b] || out[a].adj.includes(b)) continue;
    let shared=0;
    for(const k of edgeKeys[a]) if(edgeKeys[b].has(k)){ shared++; if(shared>=2) break; }
    if(shared>=2){ out[a].adj.push(b); out[b].adj.push(a); }
  }
}
// ---- manual straits (crossable like land) ----
for(const [a,b] of [['jylland','fyn'],['slesvig','fyn'],['fyn','sjaelland'],['sjaelland','skane'],['sicily','calabria'],['thrace','nicaea']]){
  if(out[a]&&out[b]&&!out[a].adj.includes(b)){ out[a].adj.push(b); out[b].adj.push(a); }
}
const sizeKB = Math.round(JSON.stringify(out).length/1024);
console.log('provinces:', Object.keys(out).length, '| size', sizeKB, 'KB');
console.log('landlocked:', Object.entries(out).filter(([,v])=>!v.coast).map(([k])=>k).join(','));
console.log('isolated (no adj):', Object.entries(out).filter(([,v])=>!v.adj.length).map(([k])=>k).join(',')||'none');
writeFileSync('provdata.json', JSON.stringify(out));
// preview page
let svg = `<svg viewBox="0 0 1000 800" xmlns="http://www.w3.org/2000/svg" style="background:#a9bdb1">`;
const cols = ['#8c2f39','#3d5a76','#5b4a7d','#a5622a','#3e6b4f','#4e7a45','#6e5340','#7a6a3a','#6d4b30','#44518f','#a8862a','#4f6b6b','#7f9a4e','#467d8f','#5d5d70','#96604e','#7d4e7a'];
let ci=0;
for(const [id,p] of Object.entries(out)){
  const col = cols[(ci++)%cols.length];
  const d = p.polys.map(r=>'M'+r.map(pt=>pt.join(',')).join('L')+'Z').join(' ');
  svg += `<path d="${d}" fill="${col}" stroke="#3a2c18" stroke-width="1" opacity=".92"/>`;
  svg += `<text x="${p.lbl[0]}" y="${p.lbl[1]}" font-size="9" text-anchor="middle" fill="#fff">${p.n}</text>`;
}
svg += '</svg>';
writeFileSync('preview.html', '<!doctype html><body style="margin:0">'+svg);
console.log('preview written');
