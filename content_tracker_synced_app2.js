
document.getElementById('profile-switcher').addEventListener('click', (e)=>{
  e.stopPropagation();
  const menu = document.getElementById('profile-menu');
  menu.style.display = menu.style.display==='none' ? 'block' : 'none';
});
document.addEventListener('click', (e)=>{
  const menu = document.getElementById('profile-menu');
  if(menu && !menu.contains(e.target) && e.target.id!=='profile-switcher' && !document.getElementById('profile-switcher').contains(e.target)){
    menu.style.display = 'none';
  }
});
document.getElementById('add-profile-btn').addEventListener('click', async ()=>{
  const input = document.getElementById('new-profile-input');
  let handle = input.value.trim();
  if(!handle) return;
  if(!handle.startsWith('@')) handle = '@' + handle;
  const id = handle.replace('@','').toLowerCase().replace(/[^a-z0-9._-]/g,'-');
  if(profiles.find(p=>p.id===id)){ alert('Questo profilo esiste già.'); return; }
  profiles.push({id, handle});
  await window.storage.set('profiles', JSON.stringify(profiles), true);
  input.value='';
  currentProfileId = id;
  try{ await window.storage.set('current-profile-id', JSON.stringify(currentProfileId), false); }catch(e){}
  document.getElementById('profile-menu').style.display='none';
  await loadData();
});

function buildLabel(it){
  const parts = [];
  if(it.brand) parts.push(it.brand);
  if(it.suppType) parts.push(it.suppType);
  if(parts.length) return parts.join(' — ');
  return it.type==='shop' ? 'Shop' : 'Personal brand';
}

function findAssignedDate(itemId){
  for(const k in assignments){
    if(assignments[k] === itemId){
      return k.split('::')[0]; // "YYYY-MM-DD::type::index" -> data
    }
  }
  return null;
}
function formatDateItalian(dateKey){
  if(!dateKey) return null;
  const [y,m,d] = dateKey.split('-').map(Number);
  const date = new Date(y, m-1, d);
  return d + ' ' + MONTH_LABELS[m-1].slice(0,3) + ' ' + y;
}
function applyStaticTranslations(){
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el=>{
    el.placeholder = t(el.getAttribute('data-i18n-placeholder'));
  });
  document.getElementById('lang-select').value = currentLang;
}

document.getElementById('lang-select').addEventListener('change', async (e)=>{
  currentLang = e.target.value;
  DOW_LABELS = DOW_LABELS_BY_LANG[currentLang];
  MONTH_LABELS = MONTH_LABELS_BY_LANG[currentLang];
  try{ await window.storage.set('ui-lang', currentLang, false); }catch(err){}
  applyStaticTranslations();
  render();
});

function uid(){ return 'i' + Date.now() + Math.random().toString(36).slice(2,7); }

/* ---------- backlog form ---------- */
document.getElementById('add-btn').addEventListener('click', async ()=>{
  const type = document.getElementById('new-type').value;
  const brand = document.getElementById('new-brand').value.trim();
  const suppType = document.getElementById('new-supptype').value.trim();
  const hookEl = document.getElementById('new-hook');
  const hook = hookEl.value.trim(); // opzionale: puoi lasciarlo vuoto
  const dateVal = document.getElementById('new-date').value; // opzionale
  const initialStatus = document.getElementById('new-status').value;

  const newItem = {id:uid(), type, brand, suppType, hook, status: initialStatus, createdAt: Date.now()};
  if(initialStatus === 'girato') newItem.giratoDate = dkey(new Date());
  if(initialStatus === 'editato'){ newItem.giratoDate = dkey(new Date()); newItem.editatoDate = dkey(new Date()); }
  items.push(newItem);

  if(dateVal){
    // assegna al primo slot libero di quel giorno per quel tipo (se pieni, aggiunge uno slot extra)
    const slotIndex = findFreeSlotIndex(dateVal, type);
    assignments[dateVal+'::'+type+'::'+slotIndex] = newItem.id;
  }

  hookEl.value='';
  document.getElementById('new-brand').value = brand; // ricorda l'ultima marca usata
  document.getElementById('new-supptype').value = suppType; // ricorda l'ultima tipologia usata
  await saveItems();
  await saveAssignments();
  render();
});

document.getElementById('new-date-clear').addEventListener('click', ()=>{
  document.getElementById('new-date').value = '';
  document.getElementById('new-date-hint').style.display = 'block';
});
document.getElementById('new-date').addEventListener('input', ()=>{
  document.getElementById('new-date-hint').style.display = 'none';
});

function findFreeSlotIndex(dateKey, type){
  let i = 0;
  while(assignments[dateKey+'::'+type+'::'+i]) i++;
  return i; // se tutti gli slot target sono pieni, crea uno slot extra oltre il target
}

async function markPublished(itemId){
  const it = items.find(i=>i.id===itemId);
  if(it) it.status = 'pubblicato';
  await saveItems();
  render();
}

function duplicateItem(id){
  const it = items.find(i=>i.id===id);
  if(!it) return;
  const copy = {...it, id: uid(), createdAt: Date.now(), status:'idea'};
  items.push(copy);
  const origDate = findAssignedDate(id);
  if(origDate){
    const slotIdx = findFreeSlotIndex(origDate, copy.type);
    assignments[origDate+'::'+copy.type+'::'+slotIdx] = copy.id;
  }
  saveItems(); saveAssignments(); render();
}

function startEdit(id){ editingItemId = id; render(); }
function cancelEdit(){ editingItemId = null; render(); }

async function saveEdit(id){
  const it = items.find(i=>i.id===id);
  if(!it) return;
  const type = document.getElementById('edit-type-'+id).value;
  const brand = document.getElementById('edit-brand-'+id).value.trim();
  const suppType = document.getElementById('edit-supptype-'+id).value.trim();
  const hook = document.getElementById('edit-hook-'+id).value.trim();
  const dateVal = document.getElementById('edit-date-'+id).value;

  // rimuove le vecchie assegnazioni di questo contenuto prima di riassegnarlo
  for(const k in assignments){ if(assignments[k]===id) delete assignments[k]; }

  it.type = type; it.brand = brand; it.suppType = suppType; it.hook = hook;

  if(dateVal){
    const slotIdx = findFreeSlotIndex(dateVal, type);
    assignments[dateVal+'::'+type+'::'+slotIdx] = id;
  }

  editingItemId = null;
  await saveItems();
  await saveAssignments();
  render();
}

document.getElementById('add-retainer-btn').addEventListener('click', async ()=>{
  const brand = document.getElementById('ret-brand').value.trim();
  const videos = parseInt(document.getElementById('ret-videos').value) || 0;
  const start = document.getElementById('ret-start').value;
  const end = document.getElementById('ret-end').value;
  const price = parseFloat(document.getElementById('ret-price').value) || 0;
  const priceType = document.getElementById('ret-price-type').value;
  const paymentMethod = document.getElementById('ret-payment-method').value;
  const notes = document.getElementById('ret-notes').value.trim();
  if(!brand || !start || !end || !videos){
    alert('Servono almeno: marca, video pattuiti, data inizio e data fine.');
    return;
  }
  retainers.push({id:uid(), brand, videosRequired:videos, start, end, price, priceType, paymentMethod, paid:false, notes, createdAt:Date.now()});
  document.getElementById('ret-brand').value='';
  document.getElementById('ret-videos').value='';
  document.getElementById('ret-start').value='';
  document.getElementById('ret-end').value='';
  document.getElementById('ret-price').value='';
  document.getElementById('ret-notes').value='';
  await saveRetainers();
  render();
});

function deleteRetainer(id){
  retainers = retainers.filter(r=>r.id!==id);
  saveRetainers();
  render();
}

async function duplicateRetainer(id){
  const r = retainers.find(x=>x.id===id);
  if(!r) return;
  const copy = {...r, id: uid(), paid:false, paidDate:null, contractSigned:false, sampleArrived:false, manualDone:false, manualDoneDate:null, createdAt: Date.now()};
  retainers.push(copy);
  await saveRetainers();
  render();
}

function startEditRetainer(id){ editingRetainerId = id; render(); }
function cancelEditRetainer(){ editingRetainerId = null; render(); }

async function saveEditRetainer(id){
  const r = retainers.find(x=>x.id===id);
  if(!r) return;
  const brand = document.getElementById('edit-ret-brand-'+id).value.trim();
  const videos = parseInt(document.getElementById('edit-ret-videos-'+id).value) || 0;
  const start = document.getElementById('edit-ret-start-'+id).value;
  const end = document.getElementById('edit-ret-end-'+id).value;
  const price = parseFloat(document.getElementById('edit-ret-price-'+id).value) || 0;
  const priceType = document.getElementById('edit-ret-price-type-'+id).value;
  const paymentMethod = document.getElementById('edit-ret-payment-'+id).value;
  const notes = document.getElementById('edit-ret-notes-'+id).value.trim();
  if(!brand || !start || !end || !videos){ alert('Servono almeno: marca, video pattuiti, data inizio e data fine.'); return; }

  r.brand = brand; r.videosRequired = videos; r.start = start; r.end = end;
  r.price = price; r.priceType = priceType; r.paymentMethod = paymentMethod; r.notes = notes;

  editingRetainerId = null;
  await saveRetainers();
  render();
}

async function toggleRetainerFlag(id, flag){
  const r = retainers.find(x=>x.id===id);
  if(r){
    r[flag] = !r[flag];
    if(flag === 'manualDone'){
      r.manualDoneDate = r.manualDone ? dkey(new Date()) : null;
    }
  }
  await saveRetainers();
  render();
}

async function toggleRetainerPaid(id){
  const r = retainers.find(x=>x.id===id);
  if(r){
    r.paid = !r.paid;
    r.paidDate = r.paid ? dkey(new Date()) : null;
  }
  await saveRetainers();
  render();
}

function computeRetainerStats(r){
  const normBrand = (s) => (s||'').toLowerCase().replace(/\s+/g,' ').trim();
  const brandItems = items.filter(it=> normBrand(it.brand) === normBrand(r.brand));
  let scheduled = 0, published = 0;
  brandItems.forEach(it=>{
    const d = findAssignedDate(it.id);
    if(!d) return;
    if(d < r.start || d > r.end) return;
    scheduled++;
    if(it.status==='pubblicato') published++;
  });

  const todayKey = dkey(new Date());
  const dStart = new Date(r.start), dEnd = new Date(r.end), dToday = new Date();
  const totalDays = Math.max(1, Math.round((dEnd-dStart)/86400000)+1);
  let daysElapsed = Math.round((dToday-dStart)/86400000)+1;
  daysElapsed = Math.max(0, Math.min(totalDays, daysElapsed));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);

  const expectedProgress = daysElapsed/totalDays;
  const actualProgress = r.videosRequired>0 ? published/r.videosRequired : 0;
  const remaining = Math.max(0, r.videosRequired - published);

  let level = 'ok';
  let label = t('ret_in_linea');
  if(todayKey > r.end && remaining>0){
    level='critical'; label=t('ret_scaduto');
  } else if(remaining===0){
    level='ok'; label=t('ret_completato');
  } else if(actualProgress + 0.15 < expectedProgress){
    level='critical'; label=t('ret_in_ritardo');
  } else if(actualProgress + 0.30 < expectedProgress + 0.15){
    level='warn'; label=t('ret_da_monitorare');
  }

  // fase esplicita del ciclo di vita del contratto (distinta dall'urgenza)
  let phase, phaseLabel;
  if(remaining===0){
    phase='completato'; phaseLabel=t('ret_terminato_completato');
  } else if(todayKey < r.start){
    phase='non_iniziato'; phaseLabel=t('ret_non_iniziato');
  } else if(todayKey > r.end){
    phase='scaduto'; phaseLabel=t('ret_terminato_incompleto');
  } else {
    phase='in_corso'; phaseLabel=t('ret_in_corso');
  }

  const contractValue = r.priceType==='video' ? r.price * r.videosRequired : r.price;

  return {scheduled, published, remaining, totalDays, daysElapsed, daysRemaining, expectedProgress, actualProgress, level, label, phase, phaseLabel, contractValue};
}

function renderRetainerSummary(){
  const totalEarn = retainers.reduce((sum,r)=>{
    const val = r.priceType==='video' ? r.price * r.videosRequired : r.price;
    return sum + val;
  }, 0);
  let inCorso = 0, terminati = 0;
  retainers.forEach(r=>{
    const s = computeRetainerStats(r);
    if(s.phase==='completato' || s.phase==='scaduto' || r.manualDone) terminati++;
    else inCorso++;
  });
  document.getElementById('ret-sum-earn').textContent = '$' + totalEarn.toLocaleString('it-IT', {maximumFractionDigits:0});
  document.getElementById('ret-sum-total').textContent = retainers.length;
  document.getElementById('ret-sum-progress').textContent = inCorso;
  document.getElementById('ret-sum-done').textContent = terminati;
}

function renderRetainerTimeline(){
  const container = document.getElementById('retainer-timeline');
  if(retainers.length===0){
    container.innerHTML = '<div class="empty-hint">' + t('ret_add_first') + '</div>';
    return;
  }
  let minDate=null, maxDate=null;
  retainers.forEach(r=>{
    const s = new Date(r.start), e = new Date(r.end);
    if(!minDate || s<minDate) minDate=s;
    if(!maxDate || e>maxDate) maxDate=e;
  });
  const months = [];
  let cur = new Date(minDate.getFullYear(), minDate.getMonth(), 1);
  const last = new Date(maxDate.getFullYear(), maxDate.getMonth(), 1);
  while(cur <= last && months.length < 24){
    months.push({y:cur.getFullYear(), m:cur.getMonth()});
    cur = addMonths(cur,1);
  }

  const sortedRetainers = [...retainers].sort((a,b)=> a.start.localeCompare(b.start));

  let html = '<table class="ret-timeline-table"><thead><tr><th class="brand-col" style="text-align:left;">Marca</th>';
  months.forEach(mo=> html += `<th>${MONTH_LABELS[mo.m].slice(0,3)} '${String(mo.y).slice(2)}</th>`);
  html += '</tr></thead><tbody>';

  sortedRetainers.forEach(r=>{
    const s = computeRetainerStats(r);
    html += `<tr><td class="brand-col">${escapeHtml(r.brand)}</td>`;
    months.forEach(mo=>{
      const monthStart = new Date(mo.y, mo.m, 1);
      const monthEnd = new Date(mo.y, mo.m+1, 0);
      const rStart = new Date(r.start), rEnd = new Date(r.end);
      const active = rStart <= monthEnd && rEnd >= monthStart;
      const cellClass = active ? `active-cell ${s.level==='critical'?'critical':s.level==='warn'?'warn':''}` : '';
      html += `<td class="${cellClass}" title="${escapeHtml(r.brand)}: ${s.phaseLabel}"></td>`;
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  container.innerHTML = html;
}

