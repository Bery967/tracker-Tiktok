const STATUSES = ['idea','girato','editato','pubblicato'];
const DOW_LABELS_BY_LANG = {
  it: ['Lun','Mar','Mer','Gio','Ven','Sab','Dom'],
  en: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
  es: ['Lun','Mar','Mié','Jue','Vie','Sáb','Dom']
};
const MONTH_LABELS_BY_LANG = {
  it: ['Gennaio','Febbraio','Marzo','Aprile','Maggio','Giugno','Luglio','Agosto','Settembre','Ottobre','Novembre','Dicembre'],
  en: ['January','February','March','April','May','June','July','August','September','October','November','December'],
  es: ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
};
let currentLang = 'it';
let DOW_LABELS = DOW_LABELS_BY_LANG[currentLang];
let MONTH_LABELS = MONTH_LABELS_BY_LANG[currentLang];

const I18N = {
  it: {
    add_form_title:'Aggiungi contenuto al backlog', tab_dashboard:'Quadro generale', tab_backlog:'Backlog & pipeline', tab_calendario:'Calendario',
    tab_retainer:'Retainer', tab_affiliazioni:'Affiliazioni', tab_guadagni:'Riepilogo guadagni',
    export_backup:'Esporta backup (JSON)', import_backup:'Importa backup', reset_all:'Cancella tutti i dati',
    stat_idea:'Da girare', stat_girato:'Girati', stat_editato:'Editati', stat_pubblicato:'Pubblicati (tot)',
    today_published:'pubblicati oggi', today_vs_target:'Pubblicati oggi (rispetto al target)',
    week_published:'Pubblicati questa settimana', report_title:'Report video pubblicati per marca',
    period_giorno:'Giorno', period_settimana:'Settimana', period_mese:'Mese', period_anno:'Anno', period_custom:'Personalizzato',
    th_marca:'Marca', th_daGirare:'Da girare', th_girato:'Girato', th_editato:'Editato', th_pubblicato:'Pubblicato', th_totale:'Totale',
    no_content_period:'Nessun contenuto assegnato in questo periodo.',
    search_placeholder:'Cerca marca, tipologia, nome video...', filter_active:'Attivi (esclude pubblicati)',
    filter_daGirare:'Da girare', filter_girato:'Girato', filter_editato:'Editato', filter_archivio:'Archivio pubblicati',
    no_filtered:'Nessun contenuto trovato con questi filtri. (I pubblicati sono archiviati: seleziona "Archivio pubblicati" per vederli.)',
    senza_data:'Senza data assegnata', contenuti_singolare:'contenuto', contenuti_plurale:'contenuti',
    btn_prev_status:'←', btn_edit:'modifica', btn_dup:'duplica', btn_del:'elimina', btn_save:'salva', btn_cancel:'annulla',
    bulk_title:'Aggiunta rapida per periodo', bulk_marca:'Marca', bulk_tipologia:'Tipologia supplemento',
    bulk_dal:'Dal:', bulk_al:'Al:', bulk_tutti_giorni:'Tutti i giorni', bulk_giorni_specifici:'Giorni specifici del mese',
    bulk_giorni_placeholder:'es. 11,13,15,17', bulk_video_giorno:'Video/giorno', bulk_nome_base:'Nome video base (opzionale)',
    bulk_genera:'Genera contenuti', add_form_marca:'Marca', add_form_tipologia:'Tipologia supplemento',
    add_form_nome_video:'Nome video (anche solo il nome del file)...', add_giorno_pub:'Giorno di pubblicazione:',
    add_al_calendario:'Aggiungi al calendario', shop:'Shop', personal_brand:'Personal brand',
    target_title:'Target giornalieri', target_video_giorno:'video/giorno', target_al_giorno:'al giorno', target_a_settimana:'a settimana', target_save:'Salva target', target_saved:'Salvato ✓',
    view_giorno:'Giorno', view_settimana:'Settimana', view_mese:'Mese', view_anno:'Anno', nav_today:'Oggi',
    dup_day_btn:'Duplica questo giorno sulla settimana prossima',
    status_idea:'da girare', status_girato:'girato', status_editato:'editato', status_pubblicato:'pubblicato',
    confirm_publish:'Conferma pubblicato', already_published:'✓ pubblicato',
    ret_new:'Nuovo retainer', ret_marca:'Marca', ret_video_pattuiti:'Video pattuiti', ret_inizio:'Inizio:', ret_fine:'Fine:',
    ret_prezzo:'Prezzo pattuito ($)', ret_per_video:'$ per video', ret_totale_periodo:'$ totale periodo',
    ret_note:'Note (opzionale)', ret_aggiungi:'Aggiungi retainer', ret_pagamento_bonifico:'Bonifico bancario',
    ret_summary_earn:'Guadagno totale contratti', ret_summary_total:'Retainer presi', ret_summary_progress:'In corso', ret_summary_done:'Terminati',
    ret_timeline_title:'Calendario retainer per mese', ret_add_first:'Aggiungi un retainer per vedere la timeline.',
    ret_pubblicati:'pubblicati', ret_pianificati:'pianificati nel periodo', ret_ancora_da_fare:'ancora da fare',
    ret_giorni_rimasti:'giorni rimasti', ret_tariffa_video:'tariffa/video', ret_contrattualizzato:'Contrattualizzato',
    ret_sample_arrivato:'Sample arrivato', ret_terminato_manuale:'Terminato', ret_segna_pagato:'Segna come pagato', ret_pagato:'✓ Pagato',
    ret_modifica:'modifica', ret_duplica:'duplica', ret_elimina:'elimina retainer', ret_in_linea:'In linea', ret_completato:'Completato',
    ret_scaduto:'Scaduto, incompleto', ret_in_ritardo:'In ritardo', ret_da_monitorare:'Da monitorare',
    ret_non_iniziato:'Non iniziato', ret_terminato_completato:'Terminato — completato', ret_terminato_incompleto:'Terminato — incompleto', ret_in_corso:'In corso',
    aff_add:'Aggiungi guadagno affiliazioni', aff_mese:'Mese:', aff_importo:'Importo generato ($)', aff_note:'Note (opzionale)',
    aff_aggiungi:'Aggiungi', aff_none:'Nessun guadagno da affiliazioni inserito.',
    earn_periodo:'Periodo', earn_affiliazioni:'Affiliazioni', earn_retainer:'Retainer', earn_totale:'Totale periodo',
    earn_dettaglio_aff:'Dettaglio affiliazioni nel periodo', earn_dettaglio_ret:'Dettaglio retainer nel periodo (per data di inizio)',
    earn_no_aff:'Nessuna voce affiliazioni in questo periodo.', earn_no_ret:'Nessun retainer iniziato in questo periodo.',
    lang_label:'Lingua',
    legend_title:'Legenda colori', legend_idea:'grigio = da girare', legend_girato:'ambra = girato', legend_editato:'verde prato = editato', legend_pubblicato:'rosso = pubblicato',
    guide_backlog_title:'Come si lavora qui', guide_backlog_text:'Apri il Calendario per vedere quali video pubblicare per primi (i giorni più vicini in alto). Una volta girato un video, torna qui, trovalo nella lista, e clicca "girato →" per farlo avanzare. Quando è stato montato dall\'editor, clicca "editato →". Quando è pronto per uscire, vai nel Calendario e clicca "Conferma pubblicato" sul giorno giusto.',
    guide_calendario_title:'Come leggere il calendario', guide_calendario_text:'Ogni pallino colorato indica lo stato di un video in quel giorno (vedi legenda sotto). Clicca su un giorno per aprirlo e vedere il dettaglio, oppure usa le viste Settimana/Mese/Anno per una panoramica più ampia.',
    notif_title:'Notifiche', notif_clear:'Segna tutte come lette', notif_empty:'Nessuna nuova notifica.',
    notif_girato_msg:'Video {marca} girato', notif_editato_msg:'Video del {data} editato e pronto da scaricare',
    target_dal:'Dal:', target_add_rule:'Aggiungi regola', target_rule_line:'Dal {data}: {shop} shop + {personal} personal/giorno', target_rules_none:'Nessuna regola impostata, uso il default (3 shop + 1 personal).',
    editcount_title:'Conteggio video editati dall\'editore', editcount_label:'video editati nel periodo',
    add_stato:'Stato:', add_no_date:'Nessuna data', add_no_date_hint:'Senza data, il contenuto va nel backlog senza essere assegnato al calendario.',
    bulk_nessuna_data:'Nessuna data (solo quantità)', bulk_quantita:'Quantità totale'
  },
  en: {
    add_form_title:'Add content to backlog', tab_dashboard:'Overview', tab_backlog:'Backlog & pipeline', tab_calendario:'Calendar',
    tab_retainer:'Retainers', tab_affiliazioni:'Affiliates', tab_guadagni:'Earnings summary',
    export_backup:'Export backup (JSON)', import_backup:'Import backup', reset_all:'Clear all data',
    stat_idea:'To film', stat_girato:'Filmed', stat_editato:'Edited', stat_pubblicato:'Published (tot)',
    today_published:'published today', today_vs_target:'Published today (vs target)',
    week_published:'Published this week', report_title:'Published videos report by brand',
    period_giorno:'Day', period_settimana:'Week', period_mese:'Month', period_anno:'Year', period_custom:'Custom',
    th_marca:'Brand', th_daGirare:'To film', th_girato:'Filmed', th_editato:'Edited', th_pubblicato:'Published', th_totale:'Total',
    no_content_period:'No content assigned in this period.',
    search_placeholder:'Search brand, type, video name...', filter_active:'Active (excludes published)',
    filter_daGirare:'To film', filter_girato:'Filmed', filter_editato:'Edited', filter_archivio:'Published archive',
    no_filtered:'No content found with these filters. (Published items are archived: select "Published archive" to see them.)',
    senza_data:'No date assigned', contenuti_singolare:'item', contenuti_plurale:'items',
    btn_prev_status:'←', btn_edit:'edit', btn_dup:'duplicate', btn_del:'delete', btn_save:'save', btn_cancel:'cancel',
    bulk_title:'Quick add for a period', bulk_marca:'Brand', bulk_tipologia:'Supplement type',
    bulk_dal:'From:', bulk_al:'To:', bulk_tutti_giorni:'Every day', bulk_giorni_specifici:'Specific days of month',
    bulk_giorni_placeholder:'e.g. 11,13,15,17', bulk_video_giorno:'Videos/day', bulk_nome_base:'Base video name (optional)',
    bulk_genera:'Generate content', add_form_marca:'Brand', add_form_tipologia:'Supplement type',
    add_form_nome_video:'Video name (even just the file name)...', add_giorno_pub:'Publish date:',
    add_al_calendario:'Add to calendar', shop:'Shop', personal_brand:'Personal brand',
    target_title:'Daily targets', target_video_giorno:'videos/day', target_al_giorno:'per day', target_a_settimana:'per week', target_save:'Save targets', target_saved:'Saved ✓',
    view_giorno:'Day', view_settimana:'Week', view_mese:'Month', view_anno:'Year', nav_today:'Today',
    dup_day_btn:'Duplicate this day to next week',
    status_idea:'to film', status_girato:'filmed', status_editato:'edited', status_pubblicato:'published',
    confirm_publish:'Confirm published', already_published:'✓ published',
    ret_new:'New retainer', ret_marca:'Brand', ret_video_pattuiti:'Agreed videos', ret_inizio:'Start:', ret_fine:'End:',
    ret_prezzo:'Agreed price ($)', ret_per_video:'$ per video', ret_totale_periodo:'$ total period',
    ret_note:'Notes (optional)', ret_aggiungi:'Add retainer', ret_pagamento_bonifico:'Bank transfer',
    ret_summary_earn:'Total contract earnings', ret_summary_total:'Retainers signed', ret_summary_progress:'In progress', ret_summary_done:'Ended',
    ret_timeline_title:'Retainer calendar by month', ret_add_first:'Add a retainer to see the timeline.',
    ret_pubblicati:'published', ret_pianificati:'scheduled in period', ret_ancora_da_fare:'still to do',
    ret_giorni_rimasti:'days left', ret_tariffa_video:'rate/video', ret_contrattualizzato:'Contracted',
    ret_sample_arrivato:'Sample arrived', ret_terminato_manuale:'Ended', ret_segna_pagato:'Mark as paid', ret_pagato:'✓ Paid',
    ret_modifica:'edit', ret_duplica:'duplicate', ret_elimina:'delete retainer', ret_in_linea:'On track', ret_completato:'Completed',
    ret_scaduto:'Expired, incomplete', ret_in_ritardo:'Behind schedule', ret_da_monitorare:'To monitor',
    ret_non_iniziato:'Not started', ret_terminato_completato:'Ended — completed', ret_terminato_incompleto:'Ended — incomplete', ret_in_corso:'In progress',
    aff_add:'Add affiliate earnings', aff_mese:'Month:', aff_importo:'Amount generated ($)', aff_note:'Notes (optional)',
    aff_aggiungi:'Add', aff_none:'No affiliate earnings entered.',
    earn_periodo:'Period', earn_affiliazioni:'Affiliates', earn_retainer:'Retainers', earn_totale:'Period total',
    earn_dettaglio_aff:'Affiliate detail for the period', earn_dettaglio_ret:'Retainer detail for the period (by start date)',
    earn_no_aff:'No affiliate entries in this period.', earn_no_ret:'No retainer started in this period.',
    lang_label:'Language',
    legend_title:'Color legend', legend_idea:'grey = to film', legend_girato:'amber = filmed', legend_editato:'grass green = edited', legend_pubblicato:'red = published',
    guide_backlog_title:'How to work here', guide_backlog_text:'Open the Calendar to see which videos need to go out first (closest days are on top). Once you\'ve filmed a video, come back here, find it in the list, and click "filmed →" to move it forward. Once the editor has cut it, click "edited →". When it\'s ready to go live, go to the Calendar and click "Confirm published" on the right day.',
    guide_calendario_title:'How to read the calendar', guide_calendario_text:'Each colored dot shows the status of a video that day (see legend below). Click a day to open it and see the detail, or use the Week/Month/Year views for a wider overview.',
    notif_title:'Notifications', notif_clear:'Mark all as read', notif_empty:'No new notifications.',
    notif_girato_msg:'Video {marca} filmed', notif_editato_msg:'Video from {data} edited and ready to download',
    target_dal:'From:', target_add_rule:'Add rule', target_rule_line:'From {data}: {shop} shop + {personal} personal/day', target_rules_none:'No rule set, using default (3 shop + 1 personal).',
    editcount_title:'Count of videos edited by the editor', editcount_label:'edited videos in this period',
    add_stato:'Status:', add_no_date:'No date', add_no_date_hint:'Without a date, the item goes into the backlog without being assigned to the calendar.',
    bulk_nessuna_data:'No date (quantity only)', bulk_quantita:'Total quantity'
  },
  es: {
    add_form_title:'Añadir contenido al backlog', tab_dashboard:'Resumen general', tab_backlog:'Backlog y pipeline', tab_calendario:'Calendario',
    tab_retainer:'Retainers', tab_affiliazioni:'Afiliados', tab_guadagni:'Resumen de ingresos',
    export_backup:'Exportar backup (JSON)', import_backup:'Importar backup', reset_all:'Borrar todos los datos',
    stat_idea:'Por grabar', stat_girato:'Grabados', stat_editato:'Editados', stat_pubblicato:'Publicados (tot)',
    today_published:'publicados hoy', today_vs_target:'Publicados hoy (vs objetivo)',
    week_published:'Publicados esta semana', report_title:'Informe de videos publicados por marca',
    period_giorno:'Día', period_settimana:'Semana', period_mese:'Mes', period_anno:'Año', period_custom:'Personalizado',
    th_marca:'Marca', th_daGirare:'Por grabar', th_girato:'Grabado', th_editato:'Editado', th_pubblicato:'Publicado', th_totale:'Total',
    no_content_period:'Ningún contenido asignado en este periodo.',
    search_placeholder:'Buscar marca, tipo, nombre del video...', filter_active:'Activos (excluye publicados)',
    filter_daGirare:'Por grabar', filter_girato:'Grabado', filter_editato:'Editado', filter_archivio:'Archivo de publicados',
    no_filtered:'No se encontró contenido con estos filtros. (Los publicados están archivados: selecciona "Archivo de publicados" para verlos.)',
    senza_data:'Sin fecha asignada', contenuti_singolare:'contenido', contenuti_plurale:'contenidos',
    btn_prev_status:'←', btn_edit:'editar', btn_dup:'duplicar', btn_del:'eliminar', btn_save:'guardar', btn_cancel:'cancelar',
    bulk_title:'Añadir rápido por periodo', bulk_marca:'Marca', bulk_tipologia:'Tipo de suplemento',
    bulk_dal:'Desde:', bulk_al:'Hasta:', bulk_tutti_giorni:'Todos los días', bulk_giorni_specifici:'Días específicos del mes',
    bulk_giorni_placeholder:'ej. 11,13,15,17', bulk_video_giorno:'Videos/día', bulk_nome_base:'Nombre base del video (opcional)',
    bulk_genera:'Generar contenidos', add_form_marca:'Marca', add_form_tipologia:'Tipo de suplemento',
    add_form_nome_video:'Nombre del video (o solo el nombre del archivo)...', add_giorno_pub:'Fecha de publicación:',
    add_al_calendario:'Añadir al calendario', shop:'Shop', personal_brand:'Marca personal',
    target_title:'Objetivos diarios', target_video_giorno:'videos/día', target_al_giorno:'al día', target_a_settimana:'a la semana', target_save:'Guardar objetivos', target_saved:'Guardado ✓',
    view_giorno:'Día', view_settimana:'Semana', view_mese:'Mes', view_anno:'Año', nav_today:'Hoy',
    dup_day_btn:'Duplicar este día en la próxima semana',
    status_idea:'por grabar', status_girato:'grabado', status_editato:'editado', status_pubblicato:'publicado',
    confirm_publish:'Confirmar publicado', already_published:'✓ publicado',
    ret_new:'Nuevo retainer', ret_marca:'Marca', ret_video_pattuiti:'Videos acordados', ret_inizio:'Inicio:', ret_fine:'Fin:',
    ret_prezzo:'Precio acordado ($)', ret_per_video:'$ por video', ret_totale_periodo:'$ total del periodo',
    ret_note:'Notas (opcional)', ret_aggiungi:'Añadir retainer', ret_pagamento_bonifico:'Transferencia bancaria',
    ret_summary_earn:'Ganancia total de contratos', ret_summary_total:'Retainers firmados', ret_summary_progress:'En curso', ret_summary_done:'Finalizados',
    ret_timeline_title:'Calendario de retainers por mes', ret_add_first:'Añade un retainer para ver la línea de tiempo.',
    ret_pubblicati:'publicados', ret_pianificati:'planificados en el periodo', ret_ancora_da_fare:'aún por hacer',
    ret_giorni_rimasti:'días restantes', ret_tariffa_video:'tarifa/video', ret_contrattualizzato:'Contratado',
    ret_sample_arrivato:'Muestra recibida', ret_terminato_manuale:'Finalizado', ret_segna_pagato:'Marcar como pagado', ret_pagato:'✓ Pagado',
    ret_modifica:'editar', ret_duplica:'duplicar', ret_elimina:'eliminar retainer', ret_in_linea:'En orden', ret_completato:'Completado',
    ret_scaduto:'Vencido, incompleto', ret_in_ritardo:'Atrasado', ret_da_monitorare:'Por vigilar',
    ret_non_iniziato:'No iniciado', ret_terminato_completato:'Finalizado — completado', ret_terminato_incompleto:'Finalizado — incompleto', ret_in_corso:'En curso',
    aff_add:'Añadir ingresos por afiliados', aff_mese:'Mes:', aff_importo:'Importe generado ($)', aff_note:'Notas (opcional)',
    aff_aggiungi:'Añadir', aff_none:'No se han registrado ingresos por afiliados.',
    earn_periodo:'Periodo', earn_affiliazioni:'Afiliados', earn_retainer:'Retainers', earn_totale:'Total del periodo',
    earn_dettaglio_aff:'Detalle de afiliados en el periodo', earn_dettaglio_ret:'Detalle de retainers en el periodo (por fecha de inicio)',
    earn_no_aff:'Ninguna entrada de afiliados en este periodo.', earn_no_ret:'Ningún retainer iniciado en este periodo.',
    lang_label:'Idioma',
    legend_title:'Leyenda de colores', legend_idea:'gris = por grabar', legend_girato:'ámbar = grabado', legend_editato:'verde césped = editado', legend_pubblicato:'rojo = publicado',
    guide_backlog_title:'Cómo trabajar aquí', guide_backlog_text:'Abre el Calendario para ver qué videos hay que publicar primero (los días más próximos están arriba). Una vez grabado un video, vuelve aquí, búscalo en la lista y haz clic en "grabado →" para avanzarlo. Cuando el editor lo haya montado, haz clic en "editado →". Cuando esté listo para salir, ve al Calendario y haz clic en "Confirmar publicado" en el día correspondiente.',
    guide_calendario_title:'Cómo leer el calendario', guide_calendario_text:'Cada punto de color indica el estado de un video ese día (ver leyenda abajo). Haz clic en un día para abrirlo y ver el detalle, o usa las vistas Semana/Mes/Año para una visión más amplia.',
    notif_title:'Notificaciones', notif_clear:'Marcar todas como leídas', notif_empty:'No hay notificaciones nuevas.',
    notif_girato_msg:'Video {marca} grabado', notif_editato_msg:'Video del {data} editado y listo para descargar',
    target_dal:'Desde:', target_add_rule:'Añadir regla', target_rule_line:'Desde {data}: {shop} shop + {personal} personal/día', target_rules_none:'Ninguna regla configurada, se usa el valor por defecto (3 shop + 1 personal).',
    editcount_title:'Conteo de videos editados por el editor', editcount_label:'videos editados en el periodo',
    add_stato:'Estado:', add_no_date:'Sin fecha', add_no_date_hint:'Sin fecha, el contenido va al backlog sin asignarse al calendario.',
    bulk_nessuna_data:'Sin fecha (solo cantidad)', bulk_quantita:'Cantidad total'
  }
};
function t(key){ return (I18N[currentLang] && I18N[currentLang][key]) || I18N.it[key] || key; }

let items = [];
let assignments = {};
let targetRules = [{startDate:'2000-01-01', shop:3, personal:1, personalMode:'giorno'}];
let currentView = 'month';
let anchorDate = new Date();
let editingItemId = null;
let profiles = [];
let currentProfileId = null;
let retainers = [];
let editingRetainerId = null;
let affiliateEntries = [];

/* ---------- date helpers ---------- */
function dkey(d){
  return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
}
function isSameDay(a,b){ return dkey(a)===dkey(b); }
function addDays(d,n){ const r=new Date(d); r.setDate(r.getDate()+n); return r; }
function addMonths(d,n){ const r=new Date(d); r.setMonth(r.getMonth()+n); return r; }
function addYears(d,n){ const r=new Date(d); r.setFullYear(r.getFullYear()+n); return r; }
function startOfWeek(d){ // Monday-based
  const r=new Date(d);
  const day = (r.getDay()+6)%7; // 0=Mon
  r.setDate(r.getDate()-day);
  r.setHours(0,0,0,0);
  return r;
}
function startOfMonth(d){ return new Date(d.getFullYear(), d.getMonth(), 1); }

/* ---------- storage ---------- */
async function loadProfiles(){
  try{
    const r = await window.storage.get('profiles', true);
    profiles = r ? JSON.parse(r.value) : null;
  }catch(e){ profiles = null; }
  if(!profiles || profiles.length===0){
    profiles = [
      {id:'the.realitalian', handle:'@the.realitalian'},
      {id:'andresdeitaly', handle:'@andresdeitaly'}
    ];
    await window.storage.set('profiles', JSON.stringify(profiles), true);
  }
  // profilo corrente: preferenza locale (per browser), non condivisa
  try{
    const r2 = await window.storage.get('current-profile-id', false);
    currentProfileId = r2 ? JSON.parse(r2.value) : profiles[0].id;
  }catch(e){ currentProfileId = profiles[0].id; }
  if(!profiles.find(p=>p.id===currentProfileId)) currentProfileId = profiles[0].id;
}

function profileKey(base){ return base + '::' + currentProfileId; }

async function migrateLegacyDataIfNeeded(){
  // Solo per il profilo originale (the.realitalian), quello che esisteva prima dei profili multipli
  if(currentProfileId !== 'the.realitalian') return;
  let alreadyMigrated = false;
  try{
    const check = await window.storage.get(profileKey('content-items'), true);
    if(check && check.value) alreadyMigrated = true;
  }catch(e){ /* non esiste ancora sotto la chiave nuova, procedo con la migrazione */ }
  if(alreadyMigrated) return;

  try{
    let legacyItems = null, legacyAssign = null, legacyTargets = null;
    try{ legacyItems = await window.storage.get('content-items', true); }catch(e){}
    try{ legacyAssign = await window.storage.get('calendar-assignments', true); }catch(e){}
    try{ legacyTargets = await window.storage.get('daily-targets', true); }catch(e){}

    if(legacyItems && legacyItems.value){
      await window.storage.set(profileKey('content-items'), legacyItems.value, true);
    }
    if(legacyAssign && legacyAssign.value){
      await window.storage.set(profileKey('calendar-assignments'), legacyAssign.value, true);
    }
    if(legacyTargets && legacyTargets.value){
      await window.storage.set(profileKey('daily-targets'), legacyTargets.value, true);
    }
  }catch(e){ console.error('Migrazione dati vecchi fallita', e); }
}

async function loadData(){
  editingItemId = null;
  try{
    const langRes = await window.storage.get('ui-lang', false);
    if(langRes && langRes.value && I18N[langRes.value]){
      currentLang = langRes.value;
      DOW_LABELS = DOW_LABELS_BY_LANG[currentLang];
      MONTH_LABELS = MONTH_LABELS_BY_LANG[currentLang];
    }
  }catch(e){}
  applyStaticTranslations();
  await loadProfiles();
  await migrateLegacyDataIfNeeded();
  try{ const r = await window.storage.get(profileKey('content-items'), true); items = r ? JSON.parse(r.value) : []; }
  catch(e){ items = []; }
  try{ const r2 = await window.storage.get(profileKey('calendar-assignments'), true); assignments = r2 ? JSON.parse(r2.value) : {}; }
  catch(e){ assignments = {}; }
  try{
    const r3 = await window.storage.get(profileKey('daily-targets'), true);
    if(r3){
      const parsed = JSON.parse(r3.value);
      if(Array.isArray(parsed)){
        targetRules = parsed;
      } else {
        // migrazione dal vecchio formato a target unico -> diventa una regola dal 2000-01-01
        targetRules = [{startDate:'2000-01-01', shop: parsed.shop||0, personal: parsed.personal||0, personalMode:'giorno'}];
      }
      // retrocompatibilità: le regole salvate prima dell'opzione settimanale non hanno personalMode
      targetRules = targetRules.map(r => ({personalMode:'giorno', ...r}));
    } else {
      targetRules = [{startDate:'2000-01-01', shop:3, personal:1, personalMode:'giorno'}];
    }
  }catch(e){ targetRules = [{startDate:'2000-01-01', shop:3, personal:1, personalMode:'giorno'}]; }
  try{ const r4 = await window.storage.get(profileKey('retainers'), true); retainers = r4 ? JSON.parse(r4.value) : []; }
  catch(e){ retainers = []; }
  try{ const r5 = await window.storage.get(profileKey('affiliate-entries'), true); affiliateEntries = r5 ? JSON.parse(r5.value) : []; }
  catch(e){ affiliateEntries = []; }

  document.getElementById('target-rule-start').value = dkey(new Date());
  document.getElementById('new-date').value = dkey(new Date());

  const today = new Date();
  document.getElementById('report-day').value = dkey(today);
  document.getElementById('report-week-anchor').value = dkey(today);
  document.getElementById('report-month').value = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0');
  document.getElementById('report-year').value = today.getFullYear();
  updatePeriodInputs();

  document.getElementById('editcount-day').value = dkey(today);
  document.getElementById('editcount-week-anchor').value = dkey(today);
  document.getElementById('editcount-month').value = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0');
  document.getElementById('editcount-year').value = today.getFullYear();
  updateEditcountPeriodInputs();

  document.getElementById('earn-day').value = dkey(today);
  document.getElementById('earn-week-anchor').value = dkey(today);
  document.getElementById('earn-month').value = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0');
  document.getElementById('earn-year').value = today.getFullYear();
  document.getElementById('aff-month').value = today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0');
  updateEarnPeriodInputs();

  const activeProfile = profiles.find(p=>p.id===currentProfileId);
  document.getElementById('profile-title').textContent = activeProfile ? activeProfile.handle : '@profilo';
  renderProfileMenu();

  render();
}
async function saveItems(){ try{ await window.storage.set(profileKey('content-items'), JSON.stringify(items), true); }catch(e){console.error(e);} }
async function saveAssignments(){ try{ await window.storage.set(profileKey('calendar-assignments'), JSON.stringify(assignments), true); }catch(e){console.error(e);} }
async function saveTargetRules(){ try{ await window.storage.set(profileKey('daily-targets'), JSON.stringify(targetRules), true); }catch(e){console.error(e);} }

function isWeekStartKey(dateKey){
  // lunedì = inizio settimana
  const [y,m,d] = dateKey.split('-').map(Number);
  return new Date(y, m-1, d).getDay() === 1;
}
function resolvePersonalTarget(rule, dateKey){
  if(!rule) return 0;
  if(rule.personalMode === 'settimana') return isWeekStartKey(dateKey) ? rule.personal : 0;
  return rule.personal;
}
function getTargetsForDate(dateKey){
  // trova la regola più recente con startDate <= dateKey, altrimenti fallback di default
  const applicable = targetRules
    .filter(r => r.startDate <= dateKey)
    .sort((a,b)=> b.startDate.localeCompare(a.startDate))[0];
  if(applicable) return {shop: applicable.shop, personal: resolvePersonalTarget(applicable, dateKey)};
  // se la data è prima di tutte le regole, usa la regola più vecchia disponibile
  const earliest = [...targetRules].sort((a,b)=> a.startDate.localeCompare(b.startDate))[0];
  return earliest ? {shop: earliest.shop, personal: resolvePersonalTarget(earliest, dateKey)} : {shop:3, personal:1};
}
async function saveRetainers(){ try{ await window.storage.set(profileKey('retainers'), JSON.stringify(retainers), true); }catch(e){console.error(e);} }
async function saveAffiliateEntries(){ try{ await window.storage.set(profileKey('affiliate-entries'), JSON.stringify(affiliateEntries), true); }catch(e){console.error(e);} }

function renderProfileMenu(){
  const list = document.getElementById('profile-list');
  list.innerHTML = profiles.map(p=>`
    <div data-pid="${p.id}" style="padding:8px 10px;border-radius:6px;cursor:pointer;font-size:13px;display:flex;align-items:center;justify-content:space-between;gap:8px;${p.id===currentProfileId?'background:var(--teal);color:var(--ink-2);':''}">
      <span class="profile-select-target" style="flex:1;">${escapeHtml(p.handle)}</span>
      <span style="display:flex;align-items:center;gap:6px;">
        ${p.id===currentProfileId ? '<span style="font-size:11px;">✓</span>' : ''}
        <button class="profile-edit-btn" data-edit-pid="${p.id}" style="background:none;border:none;color:inherit;opacity:0.7;cursor:pointer;font-size:12px;padding:2px;">✏️</button>
        ${profiles.length>1 ? `<button class="profile-del-btn" data-del-pid="${p.id}" style="background:none;border:none;color:inherit;opacity:0.7;cursor:pointer;font-size:12px;padding:2px;">🗑️</button>` : ''}
      </span>
    </div>`).join('');
  list.querySelectorAll('.profile-select-target').forEach(el=>{
    el.addEventListener('click', async ()=>{
      const row = el.closest('[data-pid]');
      currentProfileId = row.getAttribute('data-pid');
      try{ await window.storage.set('current-profile-id', JSON.stringify(currentProfileId), false); }catch(e){}
      document.getElementById('profile-menu').style.display='none';
      await loadData();
    });
  });
  list.querySelectorAll('.profile-edit-btn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      e.stopPropagation();
      const pid = btn.getAttribute('data-edit-pid');
      const prof = profiles.find(p=>p.id===pid);
      if(!prof) return;
      const newHandle = prompt('Nuovo nome profilo:', prof.handle);
      if(newHandle === null) return; // annullato
      const trimmed = newHandle.trim();
      if(!trimmed) return;
      prof.handle = trimmed.startsWith('@') ? trimmed : '@'+trimmed;
      await window.storage.set('profiles', JSON.stringify(profiles), true);
      if(pid === currentProfileId){
        document.getElementById('profile-title').textContent = prof.handle;
      }
      renderProfileMenu();
    });
  });
  list.querySelectorAll('.profile-del-btn').forEach(btn=>{
    btn.addEventListener('click', async (e)=>{
      e.stopPropagation();
      if(profiles.length<=1) return; // non si può eliminare l'unico profilo rimasto
      const pid = btn.getAttribute('data-del-pid');
      const prof = profiles.find(p=>p.id===pid);
      if(!prof) return;
      if(!confirm(`Eliminare il profilo ${prof.handle}? I dati associati non saranno più visibili.`)) return;
      profiles = profiles.filter(p=>p.id!==pid);
      await window.storage.set('profiles', JSON.stringify(profiles), true);
      if(pid === currentProfileId){
        currentProfileId = profiles[0].id;
        try{ await window.storage.set('current-profile-id', JSON.stringify(currentProfileId), false); }catch(err){}
        await loadData();
      } else {
        renderProfileMenu();
      }
    });
  });
}
