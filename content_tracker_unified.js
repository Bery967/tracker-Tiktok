/* Read-only planning across profiles. No content or assignment is written here. */
function unifiedBuildEntries(snapshots){
  return snapshots.flatMap(snapshot=>{
    const datesByItem = new Map();
    for(const [slot,id] of Object.entries(snapshot.assignments)){
      const date = slot.split('::')[0];
      if(!/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
      if(!datesByItem.has(id)) datesByItem.set(id,new Set());
      datesByItem.get(id).add(date);
    }
    return snapshot.items.flatMap(item=>{
      const dates = datesByItem.get(item.id);
      return (dates ? [...dates].sort() : [null]).map(date=>({
        profileId:snapshot.profile.id, handle:snapshot.profile.handle,
        id:item.id, date, status:item.status, type:item.type,
        brand:item.brand||'', suppType:item.suppType||'', hook:item.hook||''
      }));
    });
  }).sort((a,b)=>(a.date||'9999').localeCompare(b.date||'9999') || a.handle.localeCompare(b.handle) || a.id.localeCompare(b.id));
}

function unifiedPartition(entries,start,end,today){
  return {
    period:entries.filter(e=>e.date && e.date>=start && e.date<=end),
    overdue:entries.filter(e=>e.date && e.date<today && e.status!=='pubblicato'),
    undated:entries.filter(e=>!e.date && e.status!=='pubblicato')
  };
}

function canViewUnifiedCalendar(){ return currentRole==='admin' && !isGuestMode; }

const UNIFIED_TEXT = {
  it:{title:'Regia personale',private:'Solo per te',intro:'I tuoi profili, un solo piano di lavoro. Controlla cosa girare, editare e pubblicare; apri il profilo originale per fare le modifiche.',refresh:'Aggiorna',loading:'Aggiornamento dei calendari…',error:'Non è stato possibile leggere tutti i calendari. Riprova: nessun dato è stato modificato.',updated:'Aggiornato alle',profiles:'Profili inclusi',search:'Cerca marca o nome video',phase:'Fase',all:'Tutte le fasi',idea:'Da girare',girato:'Da editare',editato:'Da pubblicare',pubblicato:'Pubblicati',today:'Oggi',day:'Giorno',week:'7 giorni',month:'Mese',previous:'Periodo precedente',next:'Periodo successivo',open:'Apri nel profilo',calendar:'Calendario',backlog:'Pipeline',empty:'Nessun video programmato',noProfiles:'Seleziona almeno un profilo.',noMatches:'Nessun contenuto con questi filtri.',overdue:'Arretrati da completare',undated:'Senza data · da pianificare',summary:'Conteggi del periodo selezionato, prima del filtro per fase. Arretrati e contenuti senza data sono elencati separatamente.',count:'video',personal:'Marca personale',unnamed:'Nome video da definire',scheduled:'Previsto per',monthHint:'Apri un giorno per vedere video e fasi dei singoli profili.'},
  es:{title:'Mi calendario unificado',private:'Solo para ti',intro:'Tus perfiles, un solo plan de trabajo. Revisa qué grabar, editar y publicar; abre el perfil original para hacer cambios.',refresh:'Actualizar',loading:'Actualizando los calendarios…',error:'No se pudieron leer todos los calendarios. Inténtalo de nuevo: no se modificó ningún dato.',updated:'Actualizado a las',profiles:'Perfiles incluidos',search:'Buscar marca o nombre del video',phase:'Etapa',all:'Todas las etapas',idea:'Por grabar',girato:'Por editar',editato:'Por publicar',pubblicato:'Publicados',today:'Hoy',day:'Día',week:'7 días',month:'Mes',previous:'Periodo anterior',next:'Periodo siguiente',open:'Abrir en el perfil',calendar:'Calendario',backlog:'Pipeline',empty:'Ningún video programado',noProfiles:'Selecciona al menos un perfil.',noMatches:'No hay contenido con estos filtros.',overdue:'Pendientes atrasados',undated:'Sin fecha · por planificar',summary:'Conteos del periodo seleccionado, antes del filtro por etapa. Los atrasados y sin fecha aparecen por separado.',count:'videos',personal:'Marca personal',unnamed:'Nombre del video por definir',scheduled:'Previsto para',monthHint:'Abre un día para ver los videos y etapas de cada perfil.'},
  en:{title:'My unified calendar',private:'Only for you',intro:'Your profiles, one work plan. See what to film, edit and publish; open the original profile to make changes.',refresh:'Refresh',loading:'Refreshing calendars…',error:'Could not read every calendar. Please retry: no data was changed.',updated:'Updated at',profiles:'Included profiles',search:'Search brand or video name',phase:'Stage',all:'All stages',idea:'To film',girato:'To edit',editato:'To publish',pubblicato:'Published',today:'Today',day:'Day',week:'7 days',month:'Month',previous:'Previous period',next:'Next period',open:'Open in profile',calendar:'Calendar',backlog:'Pipeline',empty:'No videos scheduled',noProfiles:'Select at least one profile.',noMatches:'No content matches these filters.',overdue:'Overdue work',undated:'Undated · to plan',summary:'Counts for the selected period, before the stage filter. Overdue and undated content is listed separately.',count:'videos',personal:'Personal brand',unnamed:'Video name to be decided',scheduled:'Scheduled for',monthHint:'Open a day to see videos and stages for each profile.'}
};
const UNIFIED_STATUS = {
  idea:{color:'#77736d',bg:'#f0efec',text:'#595650'},
  girato:{color:'#d39316',bg:'#fff3d6',text:'#805805'},
  editato:{color:'#21833b',bg:'#e6f4e8',text:'#206633'},
  pubblicato:{color:'#ce5050',bg:'#fbe9e9',text:'#9c3434'}
};
const UNIFIED_COLORS = ['#2a78d6','#8b56b9','#198178','#b66328','#ad4774'];
let unifiedState = {snapshots:[], selected:null, anchor:null, view:'week', phase:'all', search:'',updated:null,error:false,loading:false,request:0};

function unifiedText(key){ return (UNIFIED_TEXT[currentLang]||UNIFIED_TEXT.it)[key]; }
function unifiedLocale(){ return ({it:'it-IT',es:'es-ES',en:'en-GB'})[currentLang]||'it-IT'; }
function unifiedDate(date){ return new Date(date+'T12:00:00'); }
function unifiedFormat(date,short=false){ return unifiedDate(date).toLocaleDateString(unifiedLocale(),short ? {day:'numeric',month:'short'} : {weekday:'long',day:'numeric',month:'long'}); }
function unifiedRange(){
  const anchor=unifiedState.anchor||dkey(new Date());
  if(unifiedState.view==='month'){
    const d=unifiedDate(anchor);
    return {start:dkey(new Date(d.getFullYear(),d.getMonth(),1)),end:dkey(new Date(d.getFullYear(),d.getMonth()+1,0))};
  }
  return {start:anchor,end:dkey(addDays(unifiedDate(anchor),unifiedState.view==='day'?0:6))};
}
function unifiedColor(id){ const i=unifiedState.snapshots.findIndex(s=>s.profile.id===id); return UNIFIED_COLORS[Math.max(0,i)%UNIFIED_COLORS.length]; }
function unifiedStyle(entry){ const s=UNIFIED_STATUS[entry.status]||UNIFIED_STATUS.idea; return `--status-color:${s.color};--status-bg:${s.bg};--status-text:${s.text};--profile-color:${unifiedColor(entry.profileId)}`; }

async function refreshUnifiedCalendar(){
  const root=document.getElementById('unified-root');
  if(!canViewUnifiedCalendar()){ unifiedState.request++; unifiedState.snapshots=[]; root.replaceChildren(); return; }
  const request=++unifiedState.request;
  unifiedState.loading=true; unifiedState.error=false; renderUnifiedCalendar();
  try{
    // A failed read must never turn into an apparently empty calendar.
    const snapshots=await Promise.all(profiles.map(async profile=>{
      const [content,calendar]=await Promise.all([
        window.storage.get('content-items::'+profile.id),
        window.storage.get('calendar-assignments::'+profile.id)
      ]);
      if(!content || !calendar) throw new Error('Calendar unavailable');
      const parsedItems=JSON.parse(content.value), parsedAssignments=JSON.parse(calendar.value);
      if(!Array.isArray(parsedItems) || !parsedAssignments || typeof parsedAssignments!=='object' || Array.isArray(parsedAssignments)) throw new Error('Invalid calendar');
      return {profile:{id:profile.id,handle:profile.handle},items:parsedItems,assignments:parsedAssignments};
    }));
    if(request!==unifiedState.request || !canViewUnifiedCalendar()) return;
    unifiedState.snapshots=snapshots;
    // The tab can be opened while loadData is still loading the profile list.
    // An empty bootstrap read must not deselect every profile on the real read.
    if(unifiedState.selected===null && snapshots.length) unifiedState.selected=new Set(snapshots.map(s=>s.profile.id));
    unifiedState.updated=new Date();
  }catch(error){ if(request===unifiedState.request) unifiedState.error=true; }
  finally{ if(request===unifiedState.request){ unifiedState.loading=false; renderUnifiedCalendar(); } }
}

function unifiedEntryHtml(entry,showContext=false){
  const label=entry.type==='personal' ? unifiedText('personal') : [entry.brand,entry.suppType].filter(Boolean).join(' — ')||'Shop';
  return `<article class="unified-entry" style="${unifiedStyle(entry)}">
    ${showContext?`<div class="unified-account">${escapeHtml(entry.handle)}${entry.date?' · '+escapeHtml(unifiedFormat(entry.date,true)):''}</div>`:''}
    <span class="unified-status">${escapeHtml(unifiedText(entry.status)||entry.status)}</span>
    <strong>${escapeHtml(label)}</strong>
    <p>${escapeHtml(entry.hook||unifiedText('unnamed'))}</p>
    <button type="button" data-unified-open="${escapeHtml(entry.profileId)}" data-unified-date="${entry.date||''}" data-unified-item="${escapeHtml(entry.id)}">${escapeHtml(unifiedText('open'))} ↗</button>
  </article>`;
}

function renderUnifiedCalendar(){
  const root=document.getElementById('unified-root');
  if(!canViewUnifiedCalendar()){ root.replaceChildren(); return; }
  const state=unifiedState, range=unifiedRange(), today=dkey(new Date());
  const selected=state.snapshots.filter(s=>state.selected?.has(s.profile.id));
  const search=state.search.toLocaleLowerCase();
  const entries=unifiedBuildEntries(selected).filter(e=>!search || [e.brand,e.suppType,e.hook,e.handle,e.type==='personal'?unifiedText('personal'):'Shop'].join(' ').toLocaleLowerCase().includes(search));
  const groups=unifiedPartition(entries,range.start,range.end,today);
  const phaseFilter=e=>state.phase==='all'||e.status===state.phase;
  const period=groups.period.filter(phaseFilter), overdue=groups.overdue.filter(phaseFilter), undated=groups.undated.filter(phaseFilter);
  const periodTitle=state.view==='month' ? unifiedDate(range.start).toLocaleDateString(unifiedLocale(),{month:'long',year:'numeric'}) : unifiedFormat(range.start,true)+(range.end!==range.start?' – '+unifiedFormat(range.end,true):'');
  root.innerHTML=`<div class="unified-header"><div><span class="unified-private">${unifiedText('private')}</span><h1>${unifiedText('title')}</h1><p>${unifiedText('intro')}</p><div class="unified-updated" role="status">${state.updated?unifiedText('updated')+' '+state.updated.toLocaleTimeString(unifiedLocale(),{hour:'2-digit',minute:'2-digit'}):''}</div></div><button type="button" class="btn ghost small" id="unified-refresh" ${state.loading?'disabled':''}>↻ ${unifiedText('refresh')}</button></div>
    <div class="unified-controls"><label>${unifiedText('phase')} <select id="unified-phase"><option value="all">${unifiedText('all')}</option>${STATUSES.map(s=>`<option value="${s}" ${state.phase===s?'selected':''}>${unifiedText(s)}</option>`).join('')}</select></label><input type="search" id="unified-search" value="${escapeHtml(state.search)}" placeholder="${unifiedText('search')}" aria-label="${unifiedText('search')}"></div>
    <div class="unified-profiles" role="group" aria-label="${unifiedText('profiles')}">${state.snapshots.map(s=>`<label class="unified-profile-choice" style="--profile-color:${unifiedColor(s.profile.id)}"><input type="checkbox" data-unified-profile="${escapeHtml(s.profile.id)}" ${state.selected?.has(s.profile.id)?'checked':''}><span class="unified-profile-dot"></span>${escapeHtml(s.profile.handle)}</label>`).join('')}</div>
    ${state.loading?`<div class="unified-loading" role="status">${unifiedText('loading')}</div>`:''}
    ${state.error?`<div class="unified-error" role="alert">${unifiedText('error')}</div>`:''}
    <div class="unified-summary">${STATUSES.map(s=>`<div class="unified-stat" style="--status-color:${UNIFIED_STATUS[s].color}"><strong>${groups.period.filter(e=>e.status===s).length}</strong><span>${unifiedText(s)}</span></div>`).join('')}</div><div class="unified-summary-note">${unifiedText('summary')}</div>
    <div class="unified-period"><button type="button" class="btn ghost small" id="unified-prev" aria-label="${unifiedText('previous')}">‹</button><h2>${escapeHtml(periodTitle)}</h2><button type="button" class="btn ghost small" id="unified-next" aria-label="${unifiedText('next')}">›</button><button type="button" class="btn ghost small" id="unified-today">${unifiedText('today')}</button><input type="date" id="unified-date" value="${range.start}" aria-label="${unifiedText('day')}">${['day','week','month'].map(view=>`<button type="button" class="btn ghost small" data-unified-view="${view}" aria-pressed="${state.view===view}">${unifiedText(view)}</button>`).join('')}</div>
    ${!selected.length?`<div class="unified-empty">${unifiedText('noProfiles')}</div>`:state.view==='month'?unifiedMonthHtml(period,selected,range,today):unifiedDaysHtml(period,selected,range,today)}
    <details class="unified-extra" open><summary>${unifiedText('overdue')} (${overdue.length})</summary><div class="unified-extra-grid">${overdue.map(e=>unifiedEntryHtml(e,true)).join('')||`<p class="unified-empty">${unifiedText('noMatches')}</p>`}</div></details>
    <details class="unified-extra" ${undated.length?'open':''}><summary>${unifiedText('undated')} (${undated.length})</summary><div class="unified-extra-grid">${undated.map(e=>unifiedEntryHtml(e,true)).join('')||`<p class="unified-empty">${unifiedText('noMatches')}</p>`}</div></details>`;
  unifiedBindControls(root);
}

function unifiedDaysHtml(entries,selected,range,today){
  let html='';
  for(let date=range.start;date<=range.end;date=dkey(addDays(unifiedDate(date),1))){
    const dayEntries=entries.filter(e=>e.date===date);
    html+=`<section class="unified-date ${date===today?'is-today':''}"><h3>${escapeHtml(unifiedFormat(date))}<small>${dayEntries.length} ${unifiedText('count')}</small></h3><div class="unified-columns" style="--profile-count:${selected.length}">${selected.map(s=>`<div class="unified-column" style="--profile-color:${unifiedColor(s.profile.id)}"><h4><span class="unified-profile-dot"></span>${escapeHtml(s.profile.handle)}<button type="button" data-unified-open="${escapeHtml(s.profile.id)}" data-unified-date="${date}">${unifiedText('calendar')} ↗</button></h4>${dayEntries.filter(e=>e.profileId===s.profile.id).map(e=>unifiedEntryHtml(e)).join('')||`<div class="unified-empty">${unifiedText(unifiedState.phase!=='all'||unifiedState.search?'noMatches':'empty')}</div>`}</div>`).join('')}</div></section>`;
  }
  return html;
}

function unifiedMonthHtml(entries,selected,range,today){
  let html=`<p class="unified-summary-note">${unifiedText('monthHint')}</p><div class="unified-month">${DOW_LABELS.map(d=>`<div class="unified-month-dow">${d}</div>`).join('')}`;
  const first=startOfWeek(unifiedDate(range.start));
  const end=addDays(startOfWeek(unifiedDate(range.end)),6);
  for(let d=first;d<=end;d=addDays(d,1)){
    const date=dkey(d), dayEntries=entries.filter(e=>e.date===date), outside=date<range.start||date>range.end;
    html+=`<button type="button" class="unified-month-day ${outside?'is-outside':''} ${date===today?'is-today':''}" data-unified-day="${date}" aria-label="${escapeHtml(unifiedFormat(date))}"><b>${d.getDate()}</b>${selected.map(s=>{
      const profileEntries=dayEntries.filter(e=>e.profileId===s.profile.id);
      if(!profileEntries.length) return '';
      return `<span class="unified-month-account" style="--profile-color:${unifiedColor(s.profile.id)}"><span class="unified-month-handle" style="color:inherit">${escapeHtml(s.profile.handle)}</span>${STATUSES.map(st=>{const n=profileEntries.filter(e=>e.status===st).length;return n?`<span>${n} ${unifiedText(st)}</span>`:'';}).join('')}</span>`;
    }).join('')||'—'}</button>`;
  }
  return html+'</div>';
}

function unifiedBindControls(root){
  root.querySelector('#unified-refresh').addEventListener('click',refreshUnifiedCalendar);
  root.querySelector('#unified-phase').addEventListener('change',e=>{unifiedState.phase=e.target.value;renderUnifiedCalendar();});
  root.querySelector('#unified-search').addEventListener('input',e=>{const start=e.target.selectionStart;unifiedState.search=e.target.value;renderUnifiedCalendar();const input=root.querySelector('#unified-search');input.focus();if(start!==null)input.setSelectionRange(start,start);});
  root.querySelectorAll('[data-unified-profile]').forEach(input=>input.addEventListener('change',()=>{const id=input.dataset.unifiedProfile;if(input.checked)unifiedState.selected.add(id);else unifiedState.selected.delete(id);renderUnifiedCalendar();}));
  root.querySelector('#unified-date').addEventListener('change',e=>{if(e.target.value){unifiedState.anchor=e.target.value;renderUnifiedCalendar();}});
  root.querySelector('#unified-today').addEventListener('click',()=>{unifiedState.anchor=dkey(new Date());renderUnifiedCalendar();});
  for(const direction of ['prev','next']) root.querySelector('#unified-'+direction).addEventListener('click',()=>{
    const d=unifiedDate(unifiedState.anchor||dkey(new Date())), sign=direction==='prev'?-1:1;
    unifiedState.anchor=unifiedState.view==='month'?dkey(new Date(d.getFullYear(),d.getMonth()+sign,1)):dkey(addDays(d,sign*(unifiedState.view==='day'?1:7)));
    renderUnifiedCalendar();
  });
  root.querySelectorAll('[data-unified-view]').forEach(btn=>btn.addEventListener('click',()=>{unifiedState.view=btn.dataset.unifiedView;renderUnifiedCalendar();}));
  root.querySelectorAll('[data-unified-day]').forEach(btn=>btn.addEventListener('click',()=>{unifiedState.anchor=btn.dataset.unifiedDay;unifiedState.view='day';renderUnifiedCalendar();}));
  root.querySelectorAll('[data-unified-open]').forEach(btn=>btn.addEventListener('click',()=>openUnifiedSource(btn.dataset.unifiedOpen,btn.dataset.unifiedDate,btn.dataset.unifiedItem,btn)));
}

async function openUnifiedSource(profileId,date,itemId,button){
  if(!canViewUnifiedCalendar() || !profiles.some(p=>p.id===profileId)) return;
  button.disabled=true;
  currentProfileId=profileId;
  try{ await window.storage.set('current-profile-id',JSON.stringify(profileId),false); }catch(error){}
  await loadData();
  document.querySelectorAll('.tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
  const tab=date?'calendario':'backlog';
  document.querySelector(`.tab-btn[data-tab="${tab}"]`).classList.add('active');
  document.getElementById('panel-'+tab).classList.add('active');
  if(date) goToDay(unifiedDate(date));
  else{
    document.getElementById('backlog-search').value='';
    document.getElementById('backlog-status-filter').value='all';
    renderPipeline();
    const target=[...document.querySelectorAll('#backlog-agenda [data-act="edit"]')].find(el=>el.dataset.id===itemId);
    target?.closest('.agenda-row')?.scrollIntoView({block:'center'});
  }
}

if(typeof document!=='undefined'){
  for(const lang of Object.keys(UNIFIED_TEXT)) I18N[lang].tab_unified=UNIFIED_TEXT[lang].title;
  const refreshWhenVisible=()=>{
    if(document.visibilityState==='visible' && canViewUnifiedCalendar() && document.getElementById('panel-unified').classList.contains('active') && !unifiedState.loading) refreshUnifiedCalendar();
  };
  document.addEventListener('visibilitychange',refreshWhenVisible);
  setInterval(refreshWhenVisible,60000);
}
if(typeof module!=='undefined' && module.exports) module.exports={unifiedBuildEntries,unifiedPartition};
