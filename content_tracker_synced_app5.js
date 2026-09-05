function renderCalendar(){
  const title = document.getElementById('cal-title');
  const body = document.getElementById('cal-body');
  const today = new Date();

  if(currentView==='month'){
    title.textContent = MONTH_LABELS[anchorDate.getMonth()] + ' ' + anchorDate.getFullYear();
    const first = startOfMonth(anchorDate);
    const gridStart = startOfWeek(first);
    let html = '<div class="month-grid">';
    DOW_LABELS.forEach(l=> html += `<div class="month-dow">${l}</div>`);
    for(let i=0;i<42;i++){
      const d = addDays(gridStart, i);
      const outside = d.getMonth()!==anchorDate.getMonth();
      const isToday = isSameDay(d, today);
      const lines = dayContentLines(d);
      const linesHtml = lines.map(l=>
        `<div class="cell-line"><span class="chk" style="color:${STATUS_COLOR_VAR[l.status]}">${STATUS_ICON[l.status]}</span><span class="lbl-txt">${escapeHtml(l.label)}</span></div>`
      ).join('');
      html += `<div class="month-cell ${outside?'outside':''} ${isToday?'today':''}" data-date="${dkey(d)}">
        <div class="dnum">${d.getDate()}</div>
        ${linesHtml}
      </div>`;
    }
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.month-cell').forEach(c=>{
      c.addEventListener('click', ()=> goToDay(new Date(c.getAttribute('data-date'))));
    });

  } else if(currentView==='week'){
    const wStart = startOfWeek(anchorDate);
    const wEnd = addDays(wStart,6);
    title.textContent = `${wStart.getDate()} ${MONTH_LABELS[wStart.getMonth()].slice(0,3)} – ${wEnd.getDate()} ${MONTH_LABELS[wEnd.getMonth()].slice(0,3)}`;
    let html = '<div class="week-grid">';
    for(let i=0;i<7;i++){
      const d = addDays(wStart,i);
      const isToday = isSameDay(d,today);
      const lines = dayContentLines(d);
      const linesHtml = lines.map(l=>
        `<div class="week-cell-line"><span class="chk" style="color:${STATUS_COLOR_VAR[l.status]}">${STATUS_ICON[l.status]}</span><span class="lbl-txt">${escapeHtml(l.label)}</span></div>`
      ).join('') || '<div class="empty-hint" style="padding:4px 2px;">—</div>';
      html += `<div class="day-col ${isToday?'today':''}" data-date="${dkey(d)}">
        <h4>${DOW_LABELS[i]}</h4>
        <div class="dnum">${d.getDate()} ${MONTH_LABELS[d.getMonth()].slice(0,3)}</div>
        ${linesHtml}
      </div>`;
    }
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.day-col').forEach(c=>{
      c.addEventListener('click', ()=> goToDay(new Date(c.getAttribute('data-date'))));
    });

  } else if(currentView==='day'){
    title.textContent = `${anchorDate.getDate()} ${MONTH_LABELS[anchorDate.getMonth()]} ${anchorDate.getFullYear()}`;
    const k = dkey(anchorDate);
    let html = `<div class="day-detail"><h3 style="display:flex;justify-content:space-between;align-items:center;">
      <span>${DOW_LABELS[(anchorDate.getDay()+6)%7]}</span>
      <button class="btn ghost small" id="dup-day-btn" data-date="${k}">Duplica questo giorno sulla settimana prossima</button>
    </h3>`;

    const shopSlotCount = countSlotsToShow(k,'shop');
    const pbSlotCount = countSlotsToShow(k,'personal');

    if(shopSlotCount>0){
      html += '<div class="slot-group-label">Shop</div>';
      for(let i=0;i<shopSlotCount;i++){
        html += renderSlot(k,'shop',i);
      }
    }
    if(pbSlotCount>0){
      html += '<div class="slot-group-label personal">Personal brand</div>';
      for(let i=0;i<pbSlotCount;i++){
        html += renderSlot(k,'personal',i);
      }
    }
    if(shopSlotCount===0 && pbSlotCount===0){
      html += '<div class="empty-hint">Target giornaliero impostato a 0. Modificalo qui sopra in "Target giornalieri".</div>';
    }
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.slot select').forEach(sel=>{
      sel.addEventListener('change', async ()=>{
        assignments[sel.getAttribute('data-key')] = sel.value;
        await saveAssignments();
        render();
      });
    });
    body.querySelectorAll('[data-publish]').forEach(btn=>{
      btn.addEventListener('click', ()=> markPublished(btn.getAttribute('data-publish')));
    });
    const dupBtn = document.getElementById('dup-day-btn');
    if(dupBtn){
      dupBtn.addEventListener('click', ()=> duplicateDay(dupBtn.getAttribute('data-date')));
    }

  } else if(currentView==='year'){
    title.textContent = String(anchorDate.getFullYear());
    let html = '<div class="year-grid">';
    for(let m=0;m<12;m++){
      const mDate = new Date(anchorDate.getFullYear(), m, 1);
      const gridStart = startOfWeek(mDate);
      html += `<div class="mini-month"><h5 data-month="${m}">${MONTH_LABELS[m]}</h5><div class="mini-grid">`;
      for(let i=0;i<42;i++){
        const d = addDays(gridStart,i);
        const outside = d.getMonth()!==m;
        const isToday = isSameDay(d,today);
        const dots = dayStatusDots(d).filter(s=>s!=='empty');
        const dominant = dots.length ? dots[dots.length-1] : null;
        html += `<div class="mini-cell ${outside?'outside':''} ${isToday?'today':''} ${dominant?'has-'+dominant:''}" data-date="${dkey(d)}" title="${dkey(d)}"></div>`;
      }
      html += '</div></div>';
    }
    html += '</div>';
    body.innerHTML = html;
    body.querySelectorAll('.mini-month h5').forEach(h=>{
      h.addEventListener('click', ()=> goToMonth(new Date(anchorDate.getFullYear(), parseInt(h.getAttribute('data-month')), 1)));
    });
    body.querySelectorAll('.mini-cell').forEach(c=>{
      c.addEventListener('click', ()=> goToDay(new Date(c.getAttribute('data-date'))));
    });
  }
}

function countSlotsToShow(dateKey, type){
  const dt = getTargetsForDate(dateKey);
  const target = dt[type] || 0;
  const occupied = getOccupiedIndices(dateKey, type);
  const maxOccupied = occupied.length ? Math.max(...occupied)+1 : 0;
  return Math.max(target, maxOccupied);
}

async function duplicateDay(dateKey){
  const targetDate = dkey(addDays(new Date(dateKey), 7));
  const ok = confirm(`Duplicare tutti i contenuti del ${formatDateItalian(dateKey)} sul ${formatDateItalian(targetDate)}?`);
  if(!ok) return;

  const ids = dayAssignedIds(new Date(dateKey));
  if(ids.length===0){ alert('Nessun contenuto da duplicare in questo giorno.'); return; }

  let created = 0;
  ids.forEach(id=>{
    const it = items.find(i=>i.id===id);
    if(!it) return;
    const copy = {...it, id: uid(), createdAt: Date.now()+created, status:'idea'};
    items.push(copy);
    const slotIndex = findFreeSlotIndex(targetDate, copy.type);
    assignments[targetDate+'::'+copy.type+'::'+slotIndex] = copy.id;
    created++;
  });

  await saveItems();
  await saveAssignments();
  goToDay(new Date(targetDate));
  alert(`Duplicati ${created} contenuti su ${formatDateItalian(targetDate)}.`);
}

function renderSlot(dateKey, type, index){
  const key = dateKey+'::'+type+'::'+index;
  const assignedId = assignments[key] || '';
  const assignedItem = assignedId ? items.find(i=>i.id===assignedId) : null;
  const candidates = items.filter(i=> i.type===type);
  const options = ['<option value="">— vuoto —</option>']
    .concat(candidates.map(c=>{
      const label = buildLabel(c) + ' — ' + c.hook.slice(0,32) + (c.hook.length>32?'…':'') + ` [${c.status}]`;
      return `<option value="${c.id}" ${c.id===assignedId?'selected':''}>${escapeHtml(label)}</option>`;
    }));
  const label = type==='shop' ? ('Shop '+(index+1)) : 'Personal';
  let statusRow = '';
  if(assignedItem){
    const isPub = assignedItem.status === 'pubblicato';
    statusRow = `<div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
      <span class="dot ${assignedItem.status}" style="width:9px;height:9px;"></span>
      <span style="font-size:10px;color:var(--muted);flex:1;margin-left:6px;">${assignedItem.status}</span>
      ${isPub
        ? '<span style="font-size:10px;color:var(--red);font-weight:600;">' + t('already_published') + '</span>'
        : `<button class="btn small" data-publish="${assignedItem.id}" style="padding:4px 10px;font-size:10px;">${t('confirm_publish')}</button>`}
    </div>`;
  }
  return `<div class="slot ${assignedId?'filled':''}">
    <div class="slot-label">${label}</div>
    <select data-key="${key}">${options.join('')}</select>
    ${statusRow}
  </div>`;
}

function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function updatePeriodInputs(){
  const period = document.getElementById('report-period').value;
  document.getElementById('report-day').style.display = period==='giorno' ? 'inline-block':'none';
  document.getElementById('report-week-anchor').style.display = period==='settimana' ? 'inline-block':'none';
  document.getElementById('report-month').style.display = period==='mese' ? 'inline-block':'none';
  document.getElementById('report-year').style.display = period==='anno' ? 'inline-block':'none';
  document.getElementById('report-start').style.display = period==='personalizzato' ? 'inline-block':'none';
  document.getElementById('report-dash').style.display = period==='personalizzato' ? 'inline-block':'none';
  document.getElementById('report-end').style.display = period==='personalizzato' ? 'inline-block':'none';
}

function updateEditcountPeriodInputs(){
  const period = document.getElementById('editcount-period').value;
  document.getElementById('editcount-day').style.display = period==='giorno' ? 'inline-block':'none';
  document.getElementById('editcount-week-anchor').style.display = period==='settimana' ? 'inline-block':'none';
  document.getElementById('editcount-month').style.display = period==='mese' ? 'inline-block':'none';
  document.getElementById('editcount-year').style.display = period==='anno' ? 'inline-block':'none';
  document.getElementById('editcount-start').style.display = period==='personalizzato' ? 'inline-block':'none';
  document.getElementById('editcount-dash').style.display = period==='personalizzato' ? 'inline-block':'none';
  document.getElementById('editcount-end').style.display = period==='personalizzato' ? 'inline-block':'none';
}

function computeGenericRange(prefix){
  const period = document.getElementById(prefix+'-period').value;
  let start, end;
  if(period==='giorno'){
    const v = document.getElementById(prefix+'-day').value;
    start = end = v;
  } else if(period==='settimana'){
    const v = document.getElementById(prefix+'-week-anchor').value;
    if(!v) return {start:null,end:null};
    const wStart = startOfWeek(new Date(v));
    const wEnd = addDays(wStart,6);
    start = dkey(wStart); end = dkey(wEnd);
  } else if(period==='mese'){
    const v = document.getElementById(prefix+'-month').value;
    if(!v) return {start:null,end:null};
    const [y,m] = v.split('-').map(Number);
    start = dkey(new Date(y,m-1,1)); end = dkey(new Date(y,m,0));
  } else if(period==='anno'){
    const y = parseInt(document.getElementById(prefix+'-year').value);
    if(!y) return {start:null,end:null};
    start = y+'-01-01'; end = y+'-12-31';
  } else {
    start = document.getElementById(prefix+'-start').value;
    end = document.getElementById(prefix+'-end').value;
  }
  return {start, end};
}

function generateEditCount(){
  const {start, end} = computeGenericRange('editcount');
  const numEl = document.getElementById('editcount-number');
  if(!start || !end){ numEl.textContent = '0'; return; }
  const count = items.filter(it => it.editatoViaTransition && it.editatoDate && it.editatoDate >= start && it.editatoDate <= end).length;
  numEl.textContent = count;
}

document.getElementById('editcount-period').addEventListener('change', ()=>{ updateEditcountPeriodInputs(); generateEditCount(); });
['editcount-day','editcount-week-anchor','editcount-month','editcount-year','editcount-start','editcount-end'].forEach(id=>{
  document.getElementById(id).addEventListener('change', generateEditCount);
});

function computeReportRange(){
  const period = document.getElementById('report-period').value;
  let start, end;
  if(period==='giorno'){
    const v = document.getElementById('report-day').value;
    start = end = v;
  } else if(period==='settimana'){
    const v = document.getElementById('report-week-anchor').value;
    if(!v) return {start:null,end:null};
    const wStart = startOfWeek(new Date(v));
    const wEnd = addDays(wStart,6);
    start = dkey(wStart); end = dkey(wEnd);
  } else if(period==='mese'){
    const v = document.getElementById('report-month').value; // "YYYY-MM"
    if(!v) return {start:null,end:null};
    const [y,m] = v.split('-').map(Number);
    const first = new Date(y, m-1, 1);
    const last = new Date(y, m, 0);
    start = dkey(first); end = dkey(last);
  } else if(period==='anno'){
    const y = parseInt(document.getElementById('report-year').value);
    if(!y) return {start:null,end:null};
    start = y+'-01-01'; end = y+'-12-31';
  } else {
    start = document.getElementById('report-start').value;
    end = document.getElementById('report-end').value;
  }
  return {start, end};
}

function generateReport(){
  const {start, end} = computeReportRange();
  const container = document.getElementById('report-results');
  if(!start || !end){ container.innerHTML = ''; return; }
  const tally = {};
  items.forEach(it=>{
    const d = findAssignedDate(it.id);
    if(!d) return;
    if(d < start || d > end) return; // stringhe YYYY-MM-DD si confrontano correttamente
    const label = buildLabel(it);
    const normKey = label.toLowerCase().replace(/\s+/g,' ').trim();
    if(!tally[normKey]) tally[normKey] = {display: label.replace(/\s+/g,' ').trim(), idea:0, girato:0, editato:0, pubblicato:0};
    tally[normKey][it.status] = (tally[normKey][it.status]||0) + 1;
  });
  const rows = Object.entries(tally).sort((a,b)=>{
    const totA = a[1].idea+a[1].girato+a[1].editato+a[1].pubblicato;
    const totB = b[1].idea+b[1].girato+b[1].editato+b[1].pubblicato;
    return totB - totA;
  });
  if(rows.length===0){
    container.innerHTML = '<div class="empty-hint">' + t('no_content_period') + '</div>';
    return;
  }
  const grandTotals = {idea:0, girato:0, editato:0, pubblicato:0};
  rows.forEach(([,c])=>{ STATUSES.forEach(s=> grandTotals[s]+=c[s]); });
  const grandTotal = STATUSES.reduce((s,k)=>s+grandTotals[k],0);

  container.innerHTML = `
    <table style="width:100%;border-collapse:collapse;margin-top:10px;font-size:12.5px;">
      <thead><tr style="text-align:left;font-size:10px;text-transform:uppercase;color:var(--muted);letter-spacing:0.04em;">
        <th style="padding:6px 4px;border-bottom:1px solid var(--line);">Marca</th>
        <th style="padding:6px 4px;border-bottom:1px solid var(--line);text-align:right;">Da girare</th>
        <th style="padding:6px 4px;border-bottom:1px solid var(--line);text-align:right;">Girato</th>
        <th style="padding:6px 4px;border-bottom:1px solid var(--line);text-align:right;">Editato</th>
        <th style="padding:6px 4px;border-bottom:1px solid var(--line);text-align:right;">Pubblicato</th>
        <th style="padding:6px 4px;border-bottom:1px solid var(--line);text-align:right;">Totale</th>
      </tr></thead>
      <tbody>
      ${rows.map(([, c])=>{
        const tot = c.idea+c.girato+c.editato+c.pubblicato;
        return `<tr>
          <td style="padding:7px 4px;border-bottom:1px solid var(--line);">${escapeHtml(c.display)}</td>
          <td style="padding:7px 4px;border-bottom:1px solid var(--line);text-align:right;color:var(--muted);">${c.idea}</td>
          <td style="padding:7px 4px;border-bottom:1px solid var(--line);text-align:right;color:var(--amber-strong);">${c.girato}</td>
          <td style="padding:7px 4px;border-bottom:1px solid var(--line);text-align:right;color:var(--green-editato);">${c.editato}</td>
          <td style="padding:7px 4px;border-bottom:1px solid var(--line);text-align:right;color:var(--red);font-weight:600;">${c.pubblicato}</td>
          <td style="padding:7px 4px;border-bottom:1px solid var(--line);text-align:right;font-family:'Fraunces',serif;font-weight:700;">${tot}</td>
        </tr>`;
      }).join('')}
      <tr>
        <td style="padding:8px 4px;font-weight:600;">Totale</td>
        <td style="padding:8px 4px;text-align:right;color:var(--muted);">${grandTotals.idea}</td>
        <td style="padding:8px 4px;text-align:right;color:var(--amber-strong);">${grandTotals.girato}</td>
        <td style="padding:8px 4px;text-align:right;color:var(--green-editato);">${grandTotals.editato}</td>
        <td style="padding:8px 4px;text-align:right;color:var(--red);font-weight:600;">${grandTotals.pubblicato}</td>
        <td style="padding:8px 4px;text-align:right;font-family:'Fraunces',serif;font-weight:700;color:var(--amber-strong);">${grandTotal}</td>
      </tr>
      </tbody>
    </table>`;
}

document.getElementById('report-period').addEventListener('change', ()=>{ updatePeriodInputs(); generateReport(); });
['report-day','report-week-anchor','report-month','report-year','report-start','report-end'].forEach(id=>{
  document.getElementById(id).addEventListener('change', generateReport);
});

function render(){
  renderDashboard();
  renderPipeline();
  renderBrandList();
  renderCalendar();
  renderTargetRulesList();
  generateReport();
  generateEditCount();
  renderRetainers();
  renderAffiliateList();
  generateEarningsSummary();
  renderNotificationBell();
}

document.querySelectorAll('.tab-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('panel-'+btn.getAttribute('data-tab')).classList.add('active');
    if(btn.getAttribute('data-tab')==='calendario') renderCalendar();
  });
});

async function exportAllData(){
  const backup = { exportedAt: new Date().toISOString(), profiles: profiles, data: {} };
  for(const p of profiles){
    const pid = p.id;
    let pi=[], pa={}, pt={shop:3,personal:1}, pr=[], pae=[];
    try{ const r = await window.storage.get('content-items::'+pid, true); pi = r ? JSON.parse(r.value) : []; }catch(e){}
    try{ const r = await window.storage.get('calendar-assignments::'+pid, true); pa = r ? JSON.parse(r.value) : {}; }catch(e){}
    try{ const r = await window.storage.get('daily-targets::'+pid, true); pt = r ? JSON.parse(r.value) : {shop:3,personal:1}; }catch(e){}
    try{ const r = await window.storage.get('retainers::'+pid, true); pr = r ? JSON.parse(r.value) : []; }catch(e){}
    try{ const r = await window.storage.get('affiliate-entries::'+pid, true); pae = r ? JSON.parse(r.value) : []; }catch(e){}
    backup.data[pid] = {items:pi, assignments:pa, targets:pt, retainers:pr, affiliateEntries:pae};
  }
  const blob = new Blob([JSON.stringify(backup,null,2)], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'ciak-backup-'+dkey(new Date())+'.json';
  document.body.appendChild(a); a.click(); document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
document.getElementById('export-backup-btn').addEventListener('click', exportAllData);

document.getElementById('reset-all-btn').addEventListener('click', async ()=>{
  const ok = confirm('Cancellare TUTTI i contenuti, le assegnazioni al calendario, i retainer e le affiliazioni di questo profilo? Questa azione non si può annullare.');
  if(!ok) return;
  items = [];
  assignments = {};
  retainers = [];
  affiliateEntries = [];
  await saveItems();
  await saveAssignments();
  await saveRetainers();
  await saveAffiliateEntries();
  render();
  alert('Fatto, tracker svuotato.');
});

window.startTrackerApp = loadData;
tryAutoLogin();
