// Configurable moods: label and color (hex). Order defines the cycle when clicking a cell.
    const MOODS = [
      {key:'none', label:'—', color:'#ffffff'},
      {key:'amazing', label:'Amazing', color:'#ffd6e0'},
      {key:'excited', label:'Excited', color:'#cdb4ff'},
      {key:'motivated', label:'Motivated', color:'#ffd966'},
      {key:'productive', label:'Productive', color:'#5eead4'},
      {key:'normal', label:'Normal', color:'#d9ffb3'},
      {key:'tired', label:'Tired', color:'#bfc7a6'},
      {key:'frustrated', label:'Frustrated', color:'#d98b5b'},
      {key:'overwhelmed', label:'Overwhelmed', color:'#ffb86b'},
      {key:'anxious', label:'Anxious', color:'#a6f0ff'},
      {key:'sad', label:'Sad', color:'#7fb3ff'},
      {key:'stressed', label:'Stressed', color:'#f0d9c8'},
      {key:'annoyed', label:'Annoyed', color:'#ffffff', border:'#666'},
      {key:'sick', label:'Sick', color:'#000000'}
    ];

    const months = ['J','F','M','A','M','J','J','A','S','O','N','D'];
    const grid = document.getElementById('grid');
    const monthsEl = document.getElementById('months');
    const daysEl = document.getElementById('days');
    const legendEl = document.getElementById('legendItems');
    const yearSelect = document.getElementById('year');
    const prevBtn = document.getElementById('prevYear');
    const nextBtn = document.getElementById('nextYear');
    const clearBtn = document.getElementById('clear');
    const exportBtn = document.getElementById('export');
    const importBtn = document.getElementById('import');
    const importFile = document.getElementById('importFile');

    const today = new Date();
    let currentYear = today.getFullYear();
    const STORAGE_PREFIX = 'yearInPixels-';

    function initYearSelect(){
      const start = currentYear - 5;
      for(let y = start; y <= currentYear+5; y++){
        const opt = document.createElement('option');opt.value = y;opt.textContent = y;
        if(y===currentYear) opt.selected = true;
        yearSelect.appendChild(opt);
      }
      yearSelect.addEventListener('change',()=>{currentYear = parseInt(yearSelect.value);render();});
    }

    function buildLegend(){
      legendEl.innerHTML = '';
      MOODS.slice(1).forEach(m=>{
        const r = document.createElement('div');r.className='moodItem';
        const s = document.createElement('div');s.className='swatch';s.style.background = m.color;
        if(m.border) s.style.border = '1px solid '+m.border;
        const t = document.createElement('div');t.textContent = m.label; t.style.fontSize='13px';
        r.appendChild(s);r.appendChild(t);legendEl.appendChild(r);
      });
    }

    function daysInMonth(y,m){return new Date(y,m+1,0).getDate();}

    function keyFor(y){return STORAGE_PREFIX + y;}

    function loadData(y){
      try{
        const raw = localStorage.getItem(keyFor(y));
        return raw ? JSON.parse(raw) : {};
      }catch(e){return {};}
    }
    function saveData(y,data){localStorage.setItem(keyFor(y), JSON.stringify(data));}

    function render(){
      grid.innerHTML='';monthsEl.innerHTML='';daysEl.innerHTML='';
      for(let i=0;i<12;i++){const mdiv=document.createElement('div');mdiv.textContent=months[i];monthsEl.appendChild(mdiv);}      

      const data = loadData(currentYear);
      const maxRows = 31; // show days 1..31 vertically
      for(let d=1; d<=maxRows; d++){
        const dayLabel = document.createElement('div');dayLabel.textContent=d;daysEl.appendChild(dayLabel);
      }

      for(let m=0;m<12;m++){
        const dim = daysInMonth(currentYear,m);
        for(let d=1;d<=31;d++){
          const cell = document.createElement('button');
          cell.className='cell';
          cell.dataset.month = m;
          cell.dataset.day = d;
          cell.setAttribute('aria-label', `Day ${d} of month ${m+1}`);
          // hide days that don't exist in that month
          if(d>dim){cell.style.visibility='hidden';cell.disabled=true;}

          const key = `${m+1}-${d}`;
          const moodKey = data[key] || 'none';
          applyMoodToCell(cell,moodKey);

          cell.addEventListener('click', ()=>{
            const currentMoodIndex = MOODS.findIndex(x=>x.key=== (data[key] || 'none'));
            const nextIndex = (currentMoodIndex + 1) % MOODS.length;
            const nextMood = MOODS[nextIndex];
            if(nextMood.key==='none') delete data[key]; else data[key]=nextMood.key;
            applyMoodToCell(cell,nextMood.key);
            saveData(currentYear,data);
          });

          grid.appendChild(cell);
        }
      }
    }

    function applyMoodToCell(cell, moodKey){
      const mood = MOODS.find(m=>m.key===moodKey) || MOODS[0];
      cell.style.background = mood.color || '#fff';
      if(moodKey === 'annoyed') cell.style.border = '1px solid #666'; else cell.style.border='1px solid #e3e6ea';
      // For better contrast when using black swatch for 'sick'
      if(mood.color === '#000000'){
        cell.style.boxShadow = 'inset 0 0 0 1px rgba(255,255,255,0.06)';
      } else cell.style.boxShadow='none';
    }

    // Controls
    prevBtn.addEventListener('click',()=>{currentYear--; yearSelect.value = currentYear; render();});
    nextBtn.addEventListener('click',()=>{currentYear++; yearSelect.value = currentYear; render();});
    clearBtn.addEventListener('click',()=>{if(confirm('Clear all saved moods for '+currentYear+'?')){localStorage.removeItem(keyFor(currentYear));render();}});

    exportBtn.addEventListener('click', ()=>{
      const payload = {year:currentYear,data:loadData(currentYear)};
      const blob = new Blob([JSON.stringify(payload, null, 2)],{type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');a.href = url; a.download = `mood-${currentYear}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
    });

    importBtn.addEventListener('click', ()=>importFile.click());
    importFile.addEventListener('change', (e)=>{
      const f = e.target.files[0]; if(!f) return; const r = new FileReader();
      r.onload = ev => {
        try{
          const obj = JSON.parse(ev.target.result);
          if(obj.year && obj.data){localStorage.setItem(keyFor(obj.year), JSON.stringify(obj.data)); alert('Imported for '+obj.year); if(obj.year==currentYear) render();}
          else alert('Invalid file format');
        }catch(err){alert('Could not parse file');}
      };
      r.readAsText(f);
      importFile.value = '';
    });

    // init
    initYearSelect(); buildLegend(); render();