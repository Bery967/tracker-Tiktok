function renderRetainers(){
  renderRetainerSummary();
  renderRetainerTimeline();
  const container = document.getElementById('retainer-list');
  if(retainers.length===0){
    container.innerHTML = '<div class="empty-hint">Nessun retainer attivo. Aggiungine uno qui sopra.</div>';
    return;
  }
  const levelRank = {critical:0, warn:1, ok:2};
  const sorted = [...retainers].sort((a,b)=>{
    const sa = computeRetainerStats(a), sb = computeRetainerStats(b);
    return levelRank[sa.level] - levelRank[sb.level];
  });

  container.innerHTML = sorted.map(r=>{
    if(editingRetainerId === r.id){
      return `<div class="ret-card" style="border-left-color:var(--teal);">
        <div class="form-row" style="margin-bottom:6px;">
          <input type="text" id="edit-ret-brand-${r.id}" value="${escapeHtml(r.brand)}" list="brand-list" placeholder="Marca">
          <input type="number" id="edit-ret-videos-${r.id}" value="${r.videosRequired}" min="1" placeholder="Video pattuiti" style="width:120px;">
        </div>
        <div class="form-row" style="margin-bottom:6px;">
          <label style="font-size:12px;color:var(--muted);align-self:center;">Inizio:</label>
          <input type="date" id="edit-ret-start-${r.id}" value="${r.start}">
          <label style="font-size:12px;color:var(--muted);align-self:center;">Fine:</label>
          <input type="date" id="edit-ret-end-${r.id}" value="${r.end}">
        </div>
        <div class="form-row" style="margin-bottom:8px;">
          <input type="number" id="edit-ret-price-${r.id}" value="${r.price}" min="0" step="0.01" placeholder="Prezzo pattuito ($)" style="width:160px;">
          <select id="edit-ret-price-type-${r.id}">
            <option value="video" ${r.priceType==='video'?'selected':''}>$ per video</option>
            <option value="total" ${r.priceType==='total'?'selected':''}>$ totale periodo</option>
          </select>
          <select id="edit-ret-payment-${r.id}">
            <option value="Bonifico bancario" ${r.paymentMethod==='Bonifico bancario'?'selected':''}>Bonifico bancario</option>
            <option value="BILL" ${r.paymentMethod==='BILL'?'selected':''}>BILL</option>
            <option value="PayPal" ${r.paymentMethod==='PayPal'?'selected':''}>PayPal</option>
            <option value="Altro" ${r.paymentMethod==='Altro'?'selected':''}>Altro</option>
          </select>
        </div>
        <div class="form-row" style="margin-bottom:8px;">
          <input type="text" id="edit-ret-notes-${r.id}" value="${escapeHtml(r.notes||'')}" placeholder="Note" style="flex:1;">
        </div>
        <div class="actions">
          <button data-ret-save="${r.id}" style="background:var(--teal);color:var(--ink-2);border:none;">${t('btn_save')}</button>
          <button data-ret-cancel="${r.id}">${t('btn_cancel')}</button>
        </div>
      </div>`;
    }
    const s = computeRetainerStats(r);
    const barColor = s.level==='critical' ? 'var(--red)' : s.level==='warn' ? 'var(--amber)' : 'var(--teal)';
    const pct = Math.min(100, Math.round(s.actualProgress*100));
    const priceLabel = r.priceType==='video' ? `$${r.price}/video` : `$${r.price} totale`;
    const paidDateTxt = r.paid && r.paidDate ? ` (${formatDateItalian(r.paidDate)})` : '';
    const paidBadge = r.paid
      ? `<button class="btn small" data-ret-paid="${r.id}" style="padding:4px 10px;font-size:10px;background:var(--teal);color:var(--ink-2);border:none;">${t('ret_pagato')}${paidDateTxt}</button>`
      : `<button class="btn small" data-ret-paid="${r.id}" style="padding:4px 10px;font-size:10px;background:var(--amber);color:var(--paper);">${t('ret_segna_pagato')}</button>`;
    const chip = (flag, label, active) => `<button data-ret-flag="${r.id}" data-flag="${flag}"
      style="font-size:10px;padding:4px 9px;border-radius:12px;border:1px solid ${active?'var(--teal)':'var(--line)'};background:${active?'rgba(62,142,126,0.2)':'transparent'};color:${active?'var(--teal)':'var(--muted)'};cursor:pointer;font-family:'Space Grotesk',sans-serif;">
      ${active?'✓ ':''}${label}</button>`;
    const doneDateTxt = r.manualDone && r.manualDoneDate ? ` (${formatDateItalian(r.manualDoneDate)})` : '';
    return `<div class="ret-card ${s.level}">
      <div class="ret-head">
        <div class="ret-brand">${escapeHtml(r.brand)}</div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;">
          <span class="ret-badge" style="background:rgba(247,242,231,0.1);color:var(--paper);">${s.phaseLabel}</span>
          <span class="ret-badge ${s.level}">${s.label}</span>
        </div>
      </div>
      <div class="ret-meta">${formatDateItalian(r.start)} → ${formatDateItalian(r.end)} · ${priceLabel} (valore contratto $${s.contractValue.toLocaleString('it-IT',{maximumFractionDigits:0})} → $${(r.videosRequired>0 ? s.contractValue/r.videosRequired : 0).toLocaleString('it-IT',{maximumFractionDigits:2})}/video) · ${escapeHtml(r.paymentMethod||'Non specificato')}${r.notes ? ' · '+escapeHtml(r.notes) : ''}</div>
      <div class="ret-stats">
        <div class="ret-stat"><div class="v">${s.published}/${r.videosRequired}</div>pubblicati</div>
        <div class="ret-stat"><div class="v">${s.scheduled}</div>pianificati nel periodo</div>
        <div class="ret-stat"><div class="v">${s.remaining}</div>ancora da fare</div>
        <div class="ret-stat"><div class="v">${s.daysRemaining}</div>giorni rimasti</div>
        <div class="ret-stat"><div class="v">$${(r.videosRequired>0 ? s.contractValue/r.videosRequired : 0).toLocaleString('it-IT',{maximumFractionDigits:2})}</div>tariffa/video</div>
      </div>
      <div class="ret-bar-bg"><div class="ret-bar-fill" style="width:${pct}%;background:${barColor};"></div></div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
        ${chip('contractSigned',t('ret_contrattualizzato'), !!r.contractSigned)}
        ${chip('sampleArrived',t('ret_sample_arrivato'), !!r.sampleArrived)}
        ${chip('manualDone',t('ret_terminato_manuale')+doneDateTxt, !!r.manualDone)}
      </div>
      <div class="actions" style="align-items:center;">
        ${paidBadge}
        <button data-ret-edit="${r.id}">${t('ret_modifica')}</button>
        <button data-ret-dup="${r.id}">${t('ret_duplica')}</button>
        <button class="del" data-ret-del="${r.id}">${t('ret_elimina')}</button>
      </div>
    </div>`;
  }).join('');

  container.querySelectorAll('[data-ret-del]').forEach(btn=>{
    btn.addEventListener('click', ()=> deleteRetainer(btn.getAttribute('data-ret-del')));
  });
  container.querySelectorAll('[data-ret-dup]').forEach(btn=>{
    btn.addEventListener('click', ()=> duplicateRetainer(btn.getAttribute('data-ret-dup')));
  });
  container.querySelectorAll('[data-ret-paid]').forEach(btn=>{
    btn.addEventListener('click', ()=> toggleRetainerPaid(btn.getAttribute('data-ret-paid')));
  });
  container.querySelectorAll('[data-ret-flag]').forEach(btn=>{
    btn.addEventListener('click', ()=> toggleRetainerFlag(btn.getAttribute('data-ret-flag'), btn.getAttribute('data-flag')));
  });
  container.querySelectorAll('[data-ret-edit]').forEach(btn=>{
    btn.addEventListener('click', ()=> startEditRetainer(btn.getAttribute('data-ret-edit')));
  });
  container.querySelectorAll('[data-ret-save]').forEach(btn=>{
    btn.addEventListener('click', ()=> saveEditRetainer(btn.getAttribute('data-ret-save')));
  });
  container.querySelectorAll('[data-ret-cancel]').forEach(btn=>{
    btn.addEventListener('click', cancelEditRetainer);
  });
}

/* ---------- affiliazioni ---------- */
document.getElementById('add-aff-btn').addEventListener('click', async ()=>{
  const monthVal = document.getElementById('aff-month').value; // "YYYY-MM"
  const amount = parseFloat(document.getElementById('aff-amount').value) || 0;
  const notes = document.getElementById('aff-notes').value.trim();
  if(!monthVal || !amount){ alert('Servono mese e importo.'); return; }
  affiliateEntries.push({id:uid(), date: monthVal+'-01', monthLabel: monthVal, amount, notes, createdAt:Date.now()});
  document.getElementById('aff-amount').value='';
  document.getElementById('aff-notes').value='';
  await saveAffiliateEntries();
  render();
});

function deleteAffiliateEntry(id){
  affiliateEntries = affiliateEntries.filter(e=>e.id!==id);
  saveAffiliateEntries();
  render();
}

function formatMonthItalian(monthKey){
  if(!monthKey) return '';
  const [y,m] = monthKey.split('-').map(Number);
  return MONTH_LABELS[m-1] + ' ' + y;
}

function renderAffiliateList(){
  const container = document.getElementById('affiliate-list');
  if(affiliateEntries.length===0){
    container.innerHTML = '<div class="empty-hint">' + t('aff_none') + '</div>';
    return;
  }
  const sorted = [...affiliateEntries].sort((a,b)=> b.monthLabel.localeCompare(a.monthLabel));
  container.innerHTML = sorted.map(e=>`
    <div class="agenda-row">
      <span class="tag personal" style="min-width:110px;text-align:center;">${formatMonthItalian(e.monthLabel)}</span>
      <span class="agenda-title" style="font-family:'Fraunces',serif;font-weight:700;color:var(--amber-strong);">$${e.amount.toLocaleString('it-IT',{maximumFractionDigits:2})}</span>
      <span class="agenda-title" style="color:var(--muted);font-size:11px;">${e.notes ? escapeHtml(e.notes) : ''}</span>
      <div class="agenda-actions">
        <button class="del" data-aff-del="${e.id}">${t('btn_del')}</button>
      </div>
    </div>`).join('');
  container.querySelectorAll('[data-aff-del]').forEach(btn=>{
    btn.addEventListener('click', ()=> deleteAffiliateEntry(btn.getAttribute('data-aff-del')));
  });
}

/* ---------- riepilogo guadagni ---------- */
function updateEarnPeriodInputs(){
  const period = document.getElementById('earn-period').value;
  document.getElementById('earn-day').style.display = period==='giorno' ? 'inline-block':'none';
  document.getElementById('earn-week-anchor').style.display = period==='settimana' ? 'inline-block':'none';
  document.getElementById('earn-month').style.display = period==='mese' ? 'inline-block':'none';
  document.getElementById('earn-year').style.display = period==='anno' ? 'inline-block':'none';
  document.getElementById('earn-start').style.display = period==='personalizzato' ? 'inline-block':'none';
  document.getElementById('earn-dash').style.display = period==='personalizzato' ? 'inline-block':'none';
  document.getElementById('earn-end').style.display = period==='personalizzato' ? 'inline-block':'none';
}

function computeEarnRange(){
  const period = document.getElementById('earn-period').value;
  let start, end;
  if(period==='giorno'){
    const v = document.getElementById('earn-day').value;
    start = end = v;
  } else if(period==='settimana'){
    const v = document.getElementById('earn-week-anchor').value;
    if(!v) return {start:null,end:null};
    const wStart = startOfWeek(new Date(v));
    const wEnd = addDays(wStart,6);
    start = dkey(wStart); end = dkey(wEnd);
  } else if(period==='mese'){
    const v = document.getElementById('earn-month').value;
    if(!v) return {start:null,end:null};
    const [y,m] = v.split('-').map(Number);
    start = dkey(new Date(y,m-1,1)); end = dkey(new Date(y,m,0));
  } else if(period==='anno'){
    const y = parseInt(document.getElementById('earn-year').value);
    if(!y) return {start:null,end:null};
    start = y+'-01-01'; end = y+'-12-31';
  } else {
    start = document.getElementById('earn-start').value;
    end = document.getElementById('earn-end').value;
  }
  return {start, end};
}

function generateEarningsSummary(){
  const {start, end} = computeEarnRange();
  const breakdownEl = document.getElementById('earn-breakdown');
  if(!start || !end){
    document.getElementById('earn-aff-total').textContent = '$0';
    document.getElementById('earn-ret-total').textContent = '$0';
    document.getElementById('earn-grand-total').textContent = '$0';
    breakdownEl.innerHTML = '';
    return;
  }

  const affInRange = affiliateEntries.filter(e => e.date >= start && e.date <= end);
  const affTotal = affInRange.reduce((s,e)=>s+e.amount, 0);

  // il valore del retainer viene attribuito alla sua data di INIZIO (evita doppio conteggio nei periodi)
  const retInRange = retainers.filter(r => r.start >= start && r.start <= end);
  const retTotal = retInRange.reduce((s,r)=>{
    const val = r.priceType==='video' ? r.price*r.videosRequired : r.price;
    return s+val;
  }, 0);

  const grandTotal = affTotal + retTotal;

  document.getElementById('earn-aff-total').textContent = '$'+affTotal.toLocaleString('it-IT',{maximumFractionDigits:0});
  document.getElementById('earn-ret-total').textContent = '$'+retTotal.toLocaleString('it-IT',{maximumFractionDigits:0});
  document.getElementById('earn-grand-total').textContent = '$'+grandTotal.toLocaleString('it-IT',{maximumFractionDigits:0});

  let html = '';
  html += `<div class="progress-block"><div class="top"><span class="t">Dettaglio affiliazioni nel periodo</span></div>`;
  if(affInRange.length===0){
    html += '<div class="empty-hint">Nessuna voce affiliazioni in questo periodo.</div>';
  } else {
    html += affInRange.sort((a,b)=>b.date.localeCompare(a.date)).map(e=>
      `<div class="agenda-row"><span class="tag personal">${formatMonthItalian(e.monthLabel)}</span><span class="agenda-title">$${e.amount.toLocaleString('it-IT',{maximumFractionDigits:2})}</span></div>`
    ).join('');
  }
  html += '</div>';

  html += `<div class="progress-block"><div class="top"><span class="t">Dettaglio retainer nel periodo (per data di inizio)</span></div>`;
  if(retInRange.length===0){
    html += '<div class="empty-hint">Nessun retainer iniziato in questo periodo.</div>';
  } else {
    html += retInRange.map(r=>{
      const val = r.priceType==='video' ? r.price*r.videosRequired : r.price;
      return `<div class="agenda-row"><span class="tag shop">${escapeHtml(r.brand)}</span><span class="agenda-title">$${val.toLocaleString('it-IT',{maximumFractionDigits:2})} · inizio ${formatDateItalian(r.start)}</span></div>`;
    }).join('');
  }
  html += '</div>';

  breakdownEl.innerHTML = html;
}

document.getElementById('earn-period').addEventListener('change', ()=>{ updateEarnPeriodInputs(); generateEarningsSummary(); });
['earn-day','earn-week-anchor','earn-month','earn-year','earn-start','earn-end'].forEach(id=>{
  document.getElementById(id).addEventListener('change', generateEarningsSummary);
});

function targetStatusForRole(){
  if(currentRole === 'admin') return 'editato';
  if(currentRole === 'editor') return 'girato';
  return null;
}

async function getLastSeenTs(status){
  try{
    const r = await window.storage.get('last-seen-'+status+'::'+currentProfileId, false);
    return r ? parseInt(r.value) : 0;
  }catch(e){ return 0; }
}
async function setLastSeenTs(status, ts){
  try{ await window.storage.set('last-seen-'+status+'::'+currentProfileId, String(ts), false); }catch(e){}
}

let currentNotifications = [];

async function computeNotifications(){
  const targetStatus = targetStatusForRole();
  if(!targetStatus || isGuestMode) return [];
  const lastSeen = await getLastSeenTs(targetStatus);
  const newItems = items.filter(it => it.status === targetStatus && (it.statusUpdatedAt || 0) > lastSeen);
  return newItems
    .sort((a,b)=> (b.statusUpdatedAt||0) - (a.statusUpdatedAt||0))
    .map(it=>{
      let msg;
      if(targetStatus === 'girato'){
        const marca = it.brand || (it.type==='personal' ? t('personal_brand') : t('shop'));
        msg = t('notif_girato_msg').replace('{marca}', marca);
      } else {
        const d = findAssignedDate(it.id);
        msg = t('notif_editato_msg').replace('{data}', d ? formatDateItalian(d) : '—');
      }
      return { id: it.id, msg, ts: it.statusUpdatedAt || 0 };
    });
}

async function renderNotificationBell(){
  const bell = document.getElementById('notif-bell');
  const badge = document.getElementById('notif-badge');
  const targetStatus = targetStatusForRole();
  if(!targetStatus || isGuestMode){ bell.style.display = 'none'; return; }

  currentNotifications = await computeNotifications();
  bell.style.display = 'inline-block';
  if(currentNotifications.length > 0){
    badge.style.display = 'flex';
    badge.textContent = currentNotifications.length > 99 ? '99+' : currentNotifications.length;
  } else {
    badge.style.display = 'none';
  }
  document.getElementById('notif-panel-title').textContent = t('notif_title');
  document.getElementById('notif-clear-btn').textContent = t('notif_clear');
  renderNotificationList();
}

function renderNotificationList(){
  const list = document.getElementById('notif-list');
  if(currentNotifications.length === 0){
    list.innerHTML = `<div style="padding:16px 14px;color:var(--muted);font-size:12px;font-style:italic;">${t('notif_empty')}</div>`;
    return;
  }
  list.innerHTML = currentNotifications.map(n => `
    <div class="notif-item" data-notif-id="${n.id}" style="padding:10px 14px;border-bottom:1px solid var(--line);font-size:12.5px;cursor:pointer;">
      ${escapeHtml(n.msg)}
    </div>`).join('');
  list.querySelectorAll('.notif-item').forEach(row=>{
    row.addEventListener('mouseenter', ()=> row.style.background='rgba(247,242,231,0.06)');
    row.addEventListener('mouseleave', ()=> row.style.background='');
    row.addEventListener('click', ()=> jumpToNotification(row.getAttribute('data-notif-id')));
  });
}

async function jumpToNotification(itemId){
  const targetStatus = targetStatusForRole();
  document.getElementById('notif-panel').style.display = 'none';
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  document.querySelector('.tab-btn[data-tab="backlog"]').classList.add('active');
  document.getElementById('panel-backlog').classList.add('active');
  document.getElementById('backlog-status-filter').value = targetStatus;
  document.getElementById('backlog-search').value = '';
  await setLastSeenTs(targetStatus, Date.now());
  render();
}

document.getElementById('notif-bell').addEventListener('click', (e)=>{
  e.stopPropagation();
  const panel = document.getElementById('notif-panel');
  panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
});
document.getElementById('notif-clear-btn').addEventListener('click', async (e)=>{
  e.stopPropagation();
  const targetStatus = targetStatusForRole();
  if(!targetStatus) return;
  await setLastSeenTs(targetStatus, Date.now());
  render();
});
document.addEventListener('click', (e)=>{
  const panel = document.getElementById('notif-panel');
  const bell = document.getElementById('notif-bell');
  if(panel && panel.style.display!=='none' && !panel.contains(e.target) && !bell.contains(e.target)){
    panel.style.display = 'none';
  }
});

function setStatus(id, status){
  const it = items.find(i=>i.id===id);
  if(it){
    it.status = status;
    it.statusUpdatedAt = Date.now();
    if(status === 'girato'){
      it.giratoDate = dkey(new Date());
      // se si torna indietro da editato, l'editing non conta più nel conteggio dell'editor
      it.editatoDate = null;
      it.editatoViaTransition = false;
    }
    if(status === 'editato'){
      it.editatoDate = dkey(new Date());
      it.editatoViaTransition = true; // vero passaggio girato->editato, conta nel conteggio editor
    }
  }
  saveItems(); render();
}
function deleteItem(id){
  items = items.filter(i=>i.id!==id);
  for(const k in assignments){ if(assignments[k]===id) delete assignments[k]; }
  saveItems(); saveAssignments(); render();
}
function nextStatus(s){ const i=STATUSES.indexOf(s); return i<STATUSES.length-1?STATUSES[i+1]:null; }
function prevStatus(s){ const i=STATUSES.indexOf(s); return i>0?STATUSES[i-1]:null; }

