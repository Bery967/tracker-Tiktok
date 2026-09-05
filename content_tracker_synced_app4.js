function renderPipeline(){
  const container = document.getElementById('backlog-agenda');
  const searchVal = (document.getElementById('backlog-search').value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('backlog-status-filter').value;

  let filtered = items.filter(it=>{
    if(statusFilter === 'all' && it.status === 'pubblicato') return false; // archiviati: fuori dalla vista di default
    if(statusFilter !== 'all' && it.status !== statusFilter) return false;
    if(searchVal){
      const hay = [it.brand, it.suppType, it.hook].filter(Boolean).join(' ').toLowerCase();
      if(!hay.includes(searchVal)) return false;
    }
    return true;
  });

  // raggruppa per data assegnata (senza data va in un gruppo a parte, in cima)
  const groups = {}; // dateKey|'senza-data' -> [items]
  filtered.forEach(it=>{
    const d = findAssignedDate(it.id) || 'senza-data';
    if(!groups[d]) groups[d] = [];
    groups[d].push(it);
  });

  const dateKeys = Object.keys(groups).filter(k=>k!=='senza-data').sort();
  const orderedKeys = groups['senza-data'] ? ['senza-data', ...dateKeys] : dateKeys;

  if(orderedKeys.length===0){
    container.innerHTML = '<div class="empty-hint">' + t('no_filtered') + '</div>';
    return;
  }

  container.innerHTML = orderedKeys.map(k=>{
    const groupItems = groups[k].sort((a,b)=>b.createdAt-a.createdAt);
    const headerLabel = k==='senza-data' ? t('senza_data') : formatDateItalian(k);
    const rowsHtml = groupItems.map(it=>{
      if(editingItemId === it.id){
        const currentDate = findAssignedDate(it.id) || '';
        return `<div class="agenda-edit-form">
          <div class="form-row" style="margin-bottom:6px;">
            <select id="edit-type-${it.id}" style="width:130px;">
              <option value="shop" ${it.type==='shop'?'selected':''}>Shop</option>
              <option value="personal" ${it.type==='personal'?'selected':''}>Personal brand</option>
            </select>
            <input type="text" id="edit-brand-${it.id}" value="${escapeHtml(it.brand||'')}" placeholder="Marca">
            <input type="text" id="edit-supptype-${it.id}" value="${escapeHtml(it.suppType||'')}" placeholder="Tipologia supplemento">
          </div>
          <div class="form-row" style="margin-bottom:6px;">
            <input type="text" id="edit-hook-${it.id}" value="${escapeHtml(it.hook)}" placeholder="Nome video" style="flex:1;">
            <input type="date" id="edit-date-${it.id}" value="${currentDate}">
          </div>
          <div class="actions">
            <button data-act="save-edit" data-id="${it.id}" style="background:var(--teal);color:var(--ink-2);border:none;">${t('btn_save')}</button>
            <button data-act="cancel-edit" data-id="${it.id}">${t('btn_cancel')}</button>
          </div>
        </div>`;
      }
      const tagLabel = buildLabel(it);
      const tagClass = it.type==='shop' ? 'shop' : 'personal';
      let next = nextStatus(it.status), prev = prevStatus(it.status);
      // l'editor puo' muoversi liberamente tra girato/editato/pubblicato, ma non puo' riportare un contenuto a 'idea'
      if(currentRole==='editor' && prev==='idea') prev = null;
      const statusOptions = currentRole==='editor' ? STATUSES.filter(s=>s!=='idea' || it.status==='idea') : STATUSES;
      const dateBits = [];
      if(it.giratoDate) dateBits.push(`${t('status_girato')}: ${formatDateItalian(it.giratoDate)}`);
      if(it.editatoDate) dateBits.push(`${t('status_editato')}: ${formatDateItalian(it.editatoDate)}`);
      const datesLine = dateBits.length ? `<span style="font-size:10px;color:var(--muted);">${dateBits.join(' · ')}</span>` : '';
      return `<div class="agenda-row">
        <span class="dot ${it.status}"></span>
        <span class="tag ${tagClass}">${escapeHtml(tagLabel)}</span>
        <span class="agenda-title">${it.hook ? escapeHtml(it.hook) : '<span style="color:var(--muted);font-style:italic;">(senza nome)</span>'}</span>
        ${datesLine}
        <div class="agenda-actions">
          ${prev ? `<button data-act="prev" data-id="${it.id}" data-prev-status="${prev}">← ${prev}</button>` : ''}
          ${next ? `<button data-act="next" data-id="${it.id}" data-next-status="${next}">${next} →</button>` : ''}
          <select data-act="setstatus" data-id="${it.id}" style="font-size:10px;padding:4px 6px;border-radius:5px;border:1px solid var(--line);background:transparent;color:var(--paper);font-family:'Space Grotesk',sans-serif;">
            ${statusOptions.map(s=>`<option value="${s}" ${s===it.status?'selected':''}>${t('status_'+s)}</option>`).join('')}
          </select>
          <button data-act="edit" data-id="${it.id}">${t('btn_edit')}</button>
          <button data-act="dup" data-id="${it.id}">${t('btn_dup')}</button>
          <button class="del" data-act="del" data-id="${it.id}">${t('btn_del')}</button>
        </div>
      </div>`;
    }).join('');

    return `<div class="agenda-group">
      <div class="agenda-date-header"><span>${headerLabel}</span><span class="count">${groupItems.length} ${groupItems.length===1?t('contenuti_singolare'):t('contenuti_plurale')}</span></div>
      ${rowsHtml}
    </div>`;
  }).join('');

  container.querySelectorAll('[data-act]').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const id = btn.getAttribute('data-id'); const act = btn.getAttribute('data-act');
      if(act==='next') setStatus(id, nextStatus(items.find(i=>i.id===id).status));
      else if(act==='prev') setStatus(id, prevStatus(items.find(i=>i.id===id).status));
      else if(act==='del') deleteItem(id);
      else if(act==='dup') duplicateItem(id);
      else if(act==='edit') startEdit(id);
      else if(act==='save-edit') saveEdit(id);
      else if(act==='cancel-edit') cancelEdit();
    });
    if(btn.tagName === 'SELECT' && btn.getAttribute('data-act')==='setstatus'){
      btn.addEventListener('change', ()=>{
        const id = btn.getAttribute('data-id');
        setStatus(id, btn.value);
      });
    }
  });
}
document.getElementById('bulk-days-mode').addEventListener('change', ()=>{
  const mode = document.getElementById('bulk-days-mode').value;
  document.getElementById('bulk-specific-days').style.display = mode==='specifici' ? 'inline-block' : 'none';
  document.getElementById('bulk-start').style.display = mode==='nessuna' ? 'none' : 'inline-block';
  document.getElementById('bulk-end').style.display = mode==='nessuna' ? 'none' : 'inline-block';
  const countInput = document.getElementById('bulk-count');
  if(mode==='nessuna'){
    countInput.setAttribute('data-i18n-placeholder','bulk_quantita');
    countInput.placeholder = t('bulk_quantita');
  } else {
    countInput.setAttribute('data-i18n-placeholder','bulk_video_giorno');
    countInput.placeholder = t('bulk_video_giorno');
  }
});

document.getElementById('bulk-generate-btn').addEventListener('click', async ()=>{
  const type = document.getElementById('bulk-type').value;
  const brand = document.getElementById('bulk-brand').value.trim();
  const suppType = document.getElementById('bulk-supptype').value.trim();
  const start = document.getElementById('bulk-start').value;
  const end = document.getElementById('bulk-end').value;
  const mode = document.getElementById('bulk-days-mode').value;
  const specificDaysRaw = document.getElementById('bulk-specific-days').value.trim();
  const count = Math.max(1, parseInt(document.getElementById('bulk-count').value) || 1);
  const namePrefix = document.getElementById('bulk-name').value.trim();
  const initialStatus = document.getElementById('bulk-status').value;

  let created = 0;

  if(mode === 'nessuna'){
    // modalità solo quantità: nessuna data, nessuna assegnazione al calendario
    for(let i=0;i<count;i++){
      const hook = namePrefix ? `${namePrefix} #${i+1}` : '';
      const newItem = {id:uid(), type, brand, suppType, hook, status:initialStatus, createdAt: Date.now()+created};
      const todayForBulk = dkey(new Date());
      if(initialStatus==='girato'){ newItem.giratoDate = todayForBulk; }
      if(initialStatus==='editato'){ newItem.giratoDate = todayForBulk; newItem.editatoDate = todayForBulk; }
      if(initialStatus==='pubblicato'){ newItem.giratoDate = todayForBulk; newItem.editatoDate = todayForBulk; }
      items.push(newItem);
      created++;
    }
    document.getElementById('bulk-preview').textContent = `Creati ${created} contenuti senza data assegnata.`;
    await saveItems();
    render();
    return;
  }

  if(!start || !end){ alert('Servono data inizio e data fine.'); return; }

  // costruisce l'elenco di date su cui generare i contenuti
  let targetDates = [];
  const dStart = new Date(start), dEnd = new Date(end);
  if(mode==='tutti'){
    let cur = new Date(dStart);
    while(cur <= dEnd){ targetDates.push(dkey(cur)); cur = addDays(cur,1); }
  } else {
    if(!specificDaysRaw){ alert('Inserisci i giorni del mese, es. 11,13,15,17'); return; }
    const dayNumbers = specificDaysRaw.split(',').map(s=>parseInt(s.trim())).filter(n=>!isNaN(n));
    let cur = new Date(dStart);
    while(cur <= dEnd){
      if(dayNumbers.includes(cur.getDate())) targetDates.push(dkey(cur));
      cur = addDays(cur,1);
    }
  }

  if(targetDates.length===0){ alert('Nessuna data corrisponde ai criteri scelti.'); return; }

  targetDates.forEach(dateVal=>{
    for(let i=0;i<count;i++){
      const hook = namePrefix ? (count>1 ? `${namePrefix} #${i+1}` : namePrefix) : '';
      const newItem = {id:uid(), type, brand, suppType, hook, status:initialStatus, createdAt: Date.now()+created};
      const todayForBulk = dkey(new Date());
      if(initialStatus==='girato'){ newItem.giratoDate = todayForBulk; }
      if(initialStatus==='editato'){ newItem.giratoDate = todayForBulk; newItem.editatoDate = todayForBulk; }
      if(initialStatus==='pubblicato'){ newItem.giratoDate = todayForBulk; newItem.editatoDate = todayForBulk; }
      items.push(newItem);
      const slotIndex = findFreeSlotIndex(dateVal, type);
      assignments[dateVal+'::'+type+'::'+slotIndex] = newItem.id;
      created++;
    }
  });

  document.getElementById('bulk-preview').textContent = `Creati ${created} contenuti su ${targetDates.length} giorni (${formatDateItalian(targetDates[0])} → ${formatDateItalian(targetDates[targetDates.length-1])}).`;

  await saveItems();
  await saveAssignments();
  render();
});

document.getElementById('backlog-search').addEventListener('input', renderPipeline);
document.getElementById('backlog-status-filter').addEventListener('change', renderPipeline);

function renderBrandList(){
  const known = ['Rainbow Light','Vitafusion','Micro Ingredients','Dr. Blet','Selerb','K2O','Bite'];
  const used = items.filter(i=>i.brand).map(i=>i.brand);
  const all = Array.from(new Set([...known, ...used])).sort();
  document.getElementById('brand-list').innerHTML = all.map(b=>`<option value="${escapeHtml(b)}"></option>`).join('');

  const knownTypes = ['Magnesio','Probiotici','Collagene','Proteine','Vitamina D','Omega-3','Ashwagandha','Turkesterone','Multivitaminico','Melatonina','Ferro','Zinco'];
  const usedTypes = items.filter(i=>i.suppType).map(i=>i.suppType);
  const allTypes = Array.from(new Set([...knownTypes, ...usedTypes])).sort();
  document.getElementById('supptype-list').innerHTML = allTypes.map(t=>`<option value="${escapeHtml(t)}"></option>`).join('');
}

/* ---------- dashboard ---------- */
function renderDashboard(){
  STATUSES.forEach(st=>{ document.getElementById('cnt-'+st).textContent = items.filter(i=>i.status===st).length; });
  const today = new Date();
  const todayKey = dkey(today);
  const todayIds = dayAssignedIds(today);
  const todayItems = items.filter(i=>todayIds.includes(i.id));
  const todayPub = todayItems.filter(i=>i.status==='pubblicato').length;
  document.getElementById('todayN').textContent = todayPub;
  const todayTargetObj = getTargetsForDate(todayKey);
  const todayTarget = todayTargetObj.shop + todayTargetObj.personal;
  updateBar('today', todayPub, todayTarget || 1);

  const wStart = startOfWeek(today);
  let weekPub = 0;
  let weekTarget = 0;
  for(let i=0;i<7;i++){
    const d = addDays(wStart,i);
    const ids = dayAssignedIds(d);
    weekPub += items.filter(it=>ids.includes(it.id) && it.status==='pubblicato').length;
    const dt = getTargetsForDate(dkey(d));
    weekTarget += dt.shop + dt.personal;
  }
  updateBar('week', weekPub, weekTarget || 1);
}
function updateBar(prefix, val, target){
  const pct = Math.min(100, Math.round((val/target)*100));
  document.getElementById(prefix+'-bar').style.width = pct+'%';
  document.getElementById(prefix+'-progress-txt').textContent = `${val} / ${target}`;
}

function getOccupiedIndices(dateKey, type){
  const result = [];
  for(let i=0;i<50;i++){
    if(assignments[dateKey+'::'+type+'::'+i]) result.push(i);
  }
  return result;
}

function dayAssignedIds(date){
  const k = dkey(date);
  const ids = [];
  ['shop','personal'].forEach(type=>{
    getOccupiedIndices(k,type).forEach(i=> ids.push(assignments[k+'::'+type+'::'+i]));
  });
  return ids;
}
function dayStatusDots(date){
  const ids = dayAssignedIds(date);
  const dt = getTargetsForDate(dkey(date));
  const totalSlots = dt.shop + dt.personal;
  const dots = [];
  for(let i=0;i<totalSlots;i++){
    if(ids[i]){
      const it = items.find(x=>x.id===ids[i]);
      dots.push(it ? it.status : 'idea');
    } else { dots.push('empty'); }
  }
  return dots;
}
function dayContentLines(date){
  const ids = dayAssignedIds(date);
  return ids.map(id=>{
    const it = items.find(x=>x.id===id);
    if(!it) return null;
    return {label: buildLabel(it), status: it.status};
  }).filter(Boolean);
}
const STATUS_ICON = {idea:'○', girato:'●', editato:'●', pubblicato:'✓'};
const STATUS_COLOR_VAR = {idea:'var(--muted)', girato:'var(--amber)', editato:'var(--green-editato)', pubblicato:'var(--red)'};

/* ---------- targets ---------- */
document.getElementById('save-targets').addEventListener('click', async ()=>{
  const startDate = document.getElementById('target-rule-start').value;
  const shop = Math.max(0, parseInt(document.getElementById('target-shop').value)||0);
  const personal = Math.max(0, parseInt(document.getElementById('target-personal').value)||0);
  const personalMode = document.getElementById('target-personal-mode').value === 'settimana' ? 'settimana' : 'giorno';
  if(!startDate){ alert('Seleziona una data di inizio per la regola.'); return; }

  // rimuove eventuale regola già esistente per la stessa data, poi la sostituisce
  targetRules = targetRules.filter(r => r.startDate !== startDate);
  targetRules.push({startDate, shop, personal, personalMode});
  targetRules.sort((a,b)=> a.startDate.localeCompare(b.startDate));

  await saveTargetRules();
  const msg = document.getElementById('targets-saved-msg');
  msg.style.display='inline'; setTimeout(()=>msg.style.display='none', 1500);
  render();
});

function renderTargetRulesList(){
  const container = document.getElementById('target-rules-list');
  if(!container) return;
  const sorted = [...targetRules].sort((a,b)=> a.startDate.localeCompare(b.startDate));
  if(sorted.length===0){
    container.innerHTML = `<div class="empty-hint">${t('target_rules_none')}</div>`;
    return;
  }
  container.innerHTML = sorted.map(r=>{
    const modeLabel = r.personalMode === 'settimana' ? t('target_a_settimana') : t('target_al_giorno');
    const line = t('target_rule_line')
      .replace('{data}', formatDateItalian(r.startDate))
      .replace('{shop}', r.shop)
      .replace('{personal}', r.personal) + ' (' + modeLabel + ')';
    return `<div class="target-rule-row">
      <span>${escapeHtml(line)}</span>
      <button class="del-rule" data-rule-date="${r.startDate}">✕</button>
    </div>`;
  }).join('');
  container.querySelectorAll('.del-rule').forEach(btn=>{
    btn.addEventListener('click', async ()=>{
      targetRules = targetRules.filter(r => r.startDate !== btn.getAttribute('data-rule-date'));
      if(targetRules.length===0) targetRules = [{startDate:'2000-01-01', shop:3, personal:1, personalMode:'giorno'}];
      await saveTargetRules();
      render();
    });
  });
}

/* ---------- nav ---------- */
document.getElementById('nav-prev').addEventListener('click', ()=>{
  if(currentView==='day') anchorDate = addDays(anchorDate,-1);
  else if(currentView==='week') anchorDate = addDays(anchorDate,-7);
  else if(currentView==='month') anchorDate = addMonths(anchorDate,-1);
  else anchorDate = addYears(anchorDate,-1);
  renderCalendar();
});
document.getElementById('nav-next').addEventListener('click', ()=>{
  if(currentView==='day') anchorDate = addDays(anchorDate,1);
  else if(currentView==='week') anchorDate = addDays(anchorDate,7);
  else if(currentView==='month') anchorDate = addMonths(anchorDate,1);
  else anchorDate = addYears(anchorDate,1);
  renderCalendar();
});
document.getElementById('nav-today').addEventListener('click', ()=>{ anchorDate = new Date(); renderCalendar(); });
document.querySelectorAll('.view-switch button').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    currentView = btn.getAttribute('data-view');
    document.querySelectorAll('.view-switch button').forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderCalendar();
  });
});

function goToDay(date){ anchorDate = date; currentView='day';
  document.querySelectorAll('.view-switch button').forEach(b=>b.classList.toggle('active', b.getAttribute('data-view')==='day'));
  renderCalendar();
}
function goToMonth(date){ anchorDate = date; currentView='month';
  document.querySelectorAll('.view-switch button').forEach(b=>b.classList.toggle('active', b.getAttribute('data-view')==='month'));
  renderCalendar();
}

/* ---------- calendar renderers ---------- */
