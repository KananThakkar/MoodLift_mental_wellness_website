const MOODS = [
  {key:'angry', label:'Angry', color:'#FFD6D6'},
  {key:'anxiety', label:'Anxiety', color:'#FFF1B8'},
  {key:'affected', label:'Affected', color:'#DFF7E6'},
  {key:'annoyed', label:'Annoyed', color:'#DDEBFF'},
  {key:'bored', label:'Bored', color:'#F3E8FF'},
  {key:'confused', label:'Confused', color:'#EAD1FF'},
  {key:'disappointed', label:'Disappointed', color:'#E0FBFB'},
  {key:'envy', label:'Envy', color:'#FFEAF3'},
  {key:'fear', label:'Fear', color:'#F7D6F7'},
  {key:'guilt', label:'Guilt', color:'#EDE7FF'},
  {key:'upset', label:'Upset', color:'#FFD6D6'}
];

const partsOfDay = ['Morning','Afternoon','Evening','Night']; // inner -> outer
const hoursPerPart = 6; // 0-5 Morning, 6-11 Afternoon, 12-17 Evening, 18-23 Night

/* ====== STATE & STORAGE KEYS ====== */
const STORAGE_KEYS = {
  TRACKER: 'trackerData_v1',      // saved colors per segment
  LAST_MOOD: 'lastMood_v1',       // last selected color (cross-tab)
  LAST_MOOD_TS: 'lastMoodTs_v1',  // timestamp to force storage event even if same color
  SAVED: 'savedTrackers_v1'       // array of saved PNGs
};

let trackerData = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRACKER) || '{}'); // { "d{day}_p{part}": "#color", ... }
let selectedColor = localStorage.getItem(STORAGE_KEYS.LAST_MOOD) || MOODS[0].color;

/* ====== DOM refs ====== */
const svg = document.getElementById('wheelSvg');
const centerMonth = document.getElementById('centerMonth');
const centerYear = document.getElementById('centerYear');
const moodList = document.getElementById('moodList');
const saveBtn = document.getElementById('saveBtn');
const viewBtn = document.getElementById('viewBtn');

/* ====== CALCULATED VALUES ====== */
const now = new Date();
const YEAR = now.getFullYear();
const MONTH = now.getMonth(); // 0-based
const DAYS = new Date(YEAR, MONTH+1, 0).getDate();

centerMonth.textContent = now.toLocaleString(undefined,{month:'long'});
centerYear.textContent = YEAR;

/* SVG geometry */
const width = 600, height = 600;
svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
const cx = width/2, cy = height/2;

// ring radii
const innerR = 90;
const outerR = 260;
const ringThickness = (outerR - innerR) / partsOfDay.length; // thickness for each ring

// utility: degrees -> point (place 0deg at top)
function polar(cx, cy, r, deg){
  const a = (deg - 90) * Math.PI / 180;
  return { x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) };
}

// build donut segment path between startAngleDeg and endAngleDeg
function donutSegmentPath(cx, cy, rOuter, rInner, startDeg, endDeg){
  // ensure positive difference
  let largeArc = ((endDeg - startDeg) % 360) > 180 ? 1 : 0;
  // points: outer end, outer start, inner start, inner end
  const p1 = polar(cx, cy, rOuter, endDeg);
  const p2 = polar(cx, cy, rOuter, startDeg);
  const p3 = polar(cx, cy, rInner, startDeg);
  const p4 = polar(cx, cy, rInner, endDeg);

  const d = [
    `M ${p1.x} ${p1.y}`,
    `A ${rOuter} ${rOuter} 0 ${largeArc} 0 ${p2.x} ${p2.y}`,
    `L ${p3.x} ${p3.y}`,
    `A ${rInner} ${rInner} 0 ${largeArc} 1 ${p4.x} ${p4.y}`,
    'Z'
  ].join(' ');
  return d;
}

/* ====== Drawing the wheel ====== */
function drawWheel(){
  svg.innerHTML = ''; // clear

  // outer ring border
  const border = document.createElementNS('http://www.w3.org/2000/svg','circle');
  border.setAttribute('cx',cx); border.setAttribute('cy',cy); border.setAttribute('r',outerR+3);
  border.setAttribute('fill','none'); border.setAttribute('stroke','#d8d0da'); border.setAttribute('stroke-width',2);
  svg.appendChild(border);

  const totalSegments = DAYS; // one wedge per day (outer angle)
  // build segments: for each day -> build 4 concentric slices (inner->outer)
  for (let day = 1; day <= DAYS; day++){
    const startDeg = ( (day-1)/DAYS ) * 360;
    const endDeg = ( day / DAYS ) * 360;

    partsOfDay.forEach((part, partIndex) => {
      const ringInner = innerR + partIndex*ringThickness;
      const ringOuter = ringInner + ringThickness - 6; // small gap between rings

      const pathD = donutSegmentPath(cx,cy,ringOuter,ringInner,startDeg,endDeg);
      const path = document.createElementNS('http://www.w3.org/2000/svg','path');
      path.setAttribute('d', pathD);
      path.setAttribute('class','segment');
      path.dataset.day = day;
      path.dataset.part = partIndex; // 0..3
      path.dataset.key = `d${day}_p${partIndex}`;

      // fill from saved data if present
      const key = path.dataset.key;
      const fill = trackerData[key] || '#ffffff';
      path.setAttribute('fill', fill);

      // accessibility + tooltip
      path.setAttribute('role','button');
      path.setAttribute('aria-label', `Day ${day}, ${part}`);

      // click handler
      path.addEventListener('click', (ev) => {
        // compute if allowed (not future)
        if (isFutureSegment(day, partIndex)){
          // simple feedback
          flashMessage('Cannot fill a future slot.');
          return;
        }
        // clear on Alt/Ctrl/Meta click
        if (ev.altKey || ev.ctrlKey || ev.metaKey){
          delete trackerData[key];
          persist();
          applyColors();
          return;
        }
        // normal fill with selected color
        trackerData[key] = selectedColor;
        persist();
        applyColors();
      });

      svg.appendChild(path);
    });

    // day label outside ring
    const midDeg = (startDeg + endDeg)/2;
    const textR = outerR + 18;
    const pt = polar(cx,cy,textR,midDeg);
    const txt = document.createElementNS('http://www.w3.org/2000/svg','text');
    txt.setAttribute('x', pt.x);
    txt.setAttribute('y', pt.y);
    txt.setAttribute('class','day-label');
    txt.textContent = day;
    svg.appendChild(txt);
  }

  // apply persisted colors & lock future segments
  applyColors();
  markFutureAndHighlight();
}

/* ====== Helpers ====== */
function persist(){
  try{
    localStorage.setItem(STORAGE_KEYS.TRACKER, JSON.stringify(trackerData));
    // notify other tabs if needed
    localStorage.setItem(STORAGE_KEYS.TRACKER + '_ts', Date.now());
  }catch(e){
    console.warn('Unable to save trackerData', e);
  }
}

function applyColors(){
  const paths = svg.querySelectorAll('path.segment');
  paths.forEach(p => {
    const k = p.dataset.key;
    const fill = trackerData[k] || '#ffffff';
    p.setAttribute('fill', fill);
    p.classList.toggle('empty', fill === '#ffffff');
  });
}

// compute current segment index (0-based across day*4)
function currentGlobalIndex(){
  const now2 = new Date();
  const today = now2.getDate();
  const hour = now2.getHours();
  const curPart = Math.floor(hour / hoursPerPart); // 0..3
  return (today - 1) * partsOfDay.length + curPart;
}

// check if a segment is future
function isFutureSegment(day, partIndex){
  const segIndex = (day - 1) * partsOfDay.length + partIndex;
  return segIndex > currentGlobalIndex();
}

// mark future segments & highlight current segment
function markFutureAndHighlight(){
  const now2 = new Date();
  const today = now2.getDate();
  const hour = now2.getHours();
  const curPart = Math.floor(hour / hoursPerPart);

  svg.querySelectorAll('path.segment').forEach(p => {
    p.classList.remove('future','highlight');
    const d = parseInt(p.dataset.day,10);
    const part = parseInt(p.dataset.part,10);
    if ( isFutureSegment(d, part) ){
      p.classList.add('future');
      p.setAttribute('cursor','not-allowed');
    } else {
      p.classList.remove('future');
      p.setAttribute('cursor','pointer');
    }
    if (d === today && part === curPart){
      p.classList.add('highlight');
    }
  });
}

/* ====== Mood list UI + selection ====== */
function buildMoods(){
  moodList.innerHTML = '';
  MOODS.forEach(m=>{
    const btn = document.createElement('button');
    btn.className = 'mood-btn';
    btn.dataset.color = m.color;
    btn.title = m.label;
    const sw = document.createElement('span');
    sw.className = 'sw';
    sw.style.background = m.color;
    btn.appendChild(sw);
    const txt = document.createElement('span');
    txt.textContent = m.label;
    btn.appendChild(txt);

    btn.addEventListener('click', () => {
      selectMood(m.color, btn);
      // store to localStorage for cross-tab
      localStorage.setItem(STORAGE_KEYS.LAST_MOOD, m.color);
      localStorage.setItem(STORAGE_KEYS.LAST_MOOD_TS, Date.now().toString());
      // auto-fill current slot too
      autoFillCurrentSlot();
    });

    // highlight if currently selected
    if (m.color === selectedColor) btn.classList.add('selected');

    moodList.appendChild(btn);
  });
}

function selectMood(color, clickedEl){
  selectedColor = color;
  moodList.querySelectorAll('.mood-btn').forEach(x => x.classList.remove('selected'));
  if (clickedEl) clickedEl.classList.add('selected');
}

function autoFillCurrentSlot(){
  const now2 = new Date();
  const day = now2.getDate();
  const hour = now2.getHours();
  const part = Math.floor(hour / hoursPerPart);
  const key = `d${day}_p${part}`;
  trackerData[key] = selectedColor;
  persist();
  applyColors();
  markFutureAndHighlight();
  flashMessage('Filled current slot with selected mood');
}

/* ====== Small message feedback (temporary toast) ====== */
let toastTimer = null;
function flashMessage(text){
  // create ephemeral element near Save button
  let el = document.getElementById('toastMsg');
  if (!el){
    el = document.createElement('div');
    el.id = 'toastMsg';
    el.style.position = 'fixed';
    el.style.left = '28px';
    el.style.bottom = '28px';
    el.style.background = '#5C735F';
    el.style.color = '#FDF6EC';
    el.style.padding = '10px 14px';
    el.style.borderRadius = '10px';
    el.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
    el.style.fontWeight = '700';
    el.style.zIndex = 9999;
    document.body.appendChild(el);
  }
  el.textContent = text;
  el.style.opacity = '1';
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>{ el.style.opacity = '0'; }, 1800);
}

/* ====== Save SVG -> PNG and persist image ====== */
function saveSvgAsPngAndStore(){
  // clone the SVG node and inline fills (we already set fill on paths)
  const clone = svg.cloneNode(true);
  // ensure width/height are present
  clone.setAttribute('width', width);
  clone.setAttribute('height', height);
  // serialize
  const svgString = new XMLSerializer().serializeToString(clone);
  const svg64 = btoa(unescape(encodeURIComponent(svgString)));
  const img64 = 'data:image/svg+xml;base64,' + svg64;

  const img = new Image();
  img.onload = function(){
    const canvas = document.createElement('canvas');
    // use 2x for crispness
    canvas.width = width*2;
    canvas.height = height*2;
    const ctx = canvas.getContext('2d');
    // white background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const png = canvas.toDataURL('image/png');

    try {
      const arr = JSON.parse(localStorage.getItem(STORAGE_KEYS.SAVED) || '[]');
      arr.push({date: new Date().toISOString(), img});
      localStorage.setItem(STORAGE_KEYS.SAVED, JSON.stringify(arr));
      flashMessage('Tracker image saved');
    }catch(e){
      console.error(e);
      flashMessage('Failed to save image');
    }
  };
  img.onerror = function(e){
    console.error('Image load error', e);
    flashMessage('Could not render image. See console.');
  };
  img.src = img64;
}

/* ====== Storage synchronization across tabs ====== */
window.addEventListener('storage', (e) => {
  if (!e.key) return;
  if (e.key === STORAGE_KEYS.LAST_MOOD || e.key === STORAGE_KEYS.LAST_MOOD_TS) {
    const newColor = localStorage.getItem(STORAGE_KEYS.LAST_MOOD);
    if (newColor) {
      selectedColor = newColor;
      // update UI selection
      moodList.querySelectorAll('.mood-btn').forEach(btn=> btn.classList.toggle('selected', btn.dataset.color === newColor));
      // auto-fill current (this is desired behavior when other tab sets mood)
      autoFillCurrentSlot();
    }
  } else if (e.key === STORAGE_KEYS.TRACKER || e.key === STORAGE_KEYS.TRACKER + '_ts'){
    trackerData = JSON.parse(localStorage.getItem(STORAGE_KEYS.TRACKER) || '{}');
    applyColors();
    markFutureAndHighlight();
  }
});

/* ====== Auto-update highlight & future locks every minute ====== */
setInterval(()=>{
  markFutureAndHighlight();
}, 60*1000);

/* ====== Init ====== */
function init(){
  // build mood list
  buildMoods();
  drawWheel();

  // set selection from storage if present
  const last = localStorage.getItem(STORAGE_KEYS.LAST_MOOD);
  if (last){
    selectedColor = last;
    moodList.querySelectorAll('.mood-btn').forEach(btn=> btn.classList.toggle('selected', btn.dataset.color === last));
  }

  // save / view btn handlers
  saveBtn.addEventListener('click', () => saveSvgAsPngAndStore());
  viewBtn.addEventListener('click', () => window.location.href = 'saved.html');

  // accessibility: allow keyboard selection of moods
  moodList.addEventListener('keydown', (ev) => {
    if (ev.key === 'Enter' && ev.target && ev.target.classList.contains('mood-btn')){
      ev.target.click();
    }
  });
}
init();