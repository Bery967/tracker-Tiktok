/* ================================================================
   SUPABASE + AUTENTICAZIONE — versione con accesso protetto
   ================================================================
   1. Vai su supabase.com, crea un account gratuito e un nuovo progetto
   2. Nel progetto vai su "SQL Editor" ed esegui:

      create table storage (
        key text primary key,
        value text,
        updated_at timestamptz default now()
      );
      alter table storage enable row level security;
      create policy "allow all for authenticated"
      on storage for all
      to authenticated
      using (true)
      with check (true);

   3. Vai su "Authentication" -> "Users" -> "Add user" per creare
      un account (email + password) per te e per ogni editor.
      Per revocare l'accesso a qualcuno, elimina il suo utente da qui.
   4. Vai su "Project Settings" -> "API", copia Project URL e anon key
      e incollali qui sotto.
   ================================================================ */
const SUPABASE_URL = 'https://cshlrxskhcgwakossgua.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_T1m_dMNOUuPDF25vmbqctg_3Jv1WUqN';

const AUTH_STORAGE_KEY = 'ciak_auth_session';

function getStoredSession(){
  try{ return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY)); }catch(e){ return null; }
}
function saveSession(session){
  try{ localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session)); }catch(e){}
}
function clearSession(){
  try{ localStorage.removeItem(AUTH_STORAGE_KEY); }catch(e){}
}

let currentRole = null; // 'admin' | 'editor' | 'guest'
let isGuestMode = false;

async function fetchUserRole(accessToken){
  try{
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` }
    });
    if(!res.ok) return 'editor';
    const user = await res.json();
    const role = user.app_metadata && user.app_metadata.role;
    return role === 'admin' ? 'admin' : 'editor';
  }catch(e){ return 'editor'; }
}

async function signIn(email, password){
  const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  const data = await res.json();
  if(!res.ok) throw new Error(data.error_description || data.msg || 'Sign in failed. Check your email and password.');
  saveSession({
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + (data.expires_in*1000),
    email
  });
  return data;
}

async function refreshSession(){
  const s = getStoredSession();
  if(!s || !s.refresh_token) return null;
  try{
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: s.refresh_token })
    });
    if(!res.ok){ clearSession(); return null; }
    const data = await res.json();
    saveSession({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: Date.now() + (data.expires_in*1000),
      email: s.email
    });
    return data;
  }catch(e){ return null; }
}

async function getValidAccessToken(){
  let s = getStoredSession();
  if(!s) return null;
  if(Date.now() > s.expires_at - 60000){
    const refreshed = await refreshSession();
    if(!refreshed) return null;
    s = getStoredSession();
  }
  return s.access_token;
}

function signOut(){
  clearSession();
  location.reload();
}
document.getElementById('logout-btn').addEventListener('click', signOut);

/* ================================================================
   MODALITA' DEMO — dati finti per i visitatori, isolati dal database vero
   ================================================================ */
let demoStore = null;

function generateDemoData(){
  const today = new Date();
  const dkeyLocal = (d)=> d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  const addDaysLocal = (d,n)=>{ const r=new Date(d); r.setDate(r.getDate()+n); return r; };

  const demoBrands = [
    {brand:'Demo Vitamix', suppType:'Magnesio'},
    {brand:'Demo Wellness Co.', suppType:'Probiotici'},
    {brand:'Demo Pure Fit', suppType:'Proteine'}
  ];

  const items = [];
  const assignments = {};
  let idCounter = 0;
  const uidLocal = ()=> 'demo'+(idCounter++)+Math.random().toString(36).slice(2,6);

  for(let dayOffset=-3; dayOffset<=10; dayOffset++){
    const d = addDaysLocal(today, dayOffset);
    const dk = dkeyLocal(d);
    for(let s=0; s<3; s++){
      const b = demoBrands[((dayOffset+s)%demoBrands.length+demoBrands.length)%demoBrands.length];
      const status = dayOffset < -1 ? 'pubblicato' : dayOffset < 1 ? 'editato' : dayOffset < 3 ? 'girato' : 'idea';
      const it = {id:uidLocal(), type:'shop', brand:b.brand, suppType:b.suppType, hook:`Video demo ${s+1}`, status, createdAt: Date.now()};
      items.push(it);
      assignments[dk+'::shop::'+s] = it.id;
    }
    const pb = {id:uidLocal(), type:'personal', brand:'', suppType:'', hook:'Contenuto personal brand demo', status: dayOffset<0?'pubblicato':'idea', createdAt: Date.now()};
    items.push(pb);
    assignments[dk+'::personal::0'] = pb.id;
  }

  const retainers = [
    {id:uidLocal(), brand:'Demo Vitamix', videosRequired:15, start:dkeyLocal(addDaysLocal(today,-10)), end:dkeyLocal(addDaysLocal(today,20)),
     price:200, priceType:'video', paymentMethod:'Bonifico bancario', paid:false, notes:'Retainer di esempio', contractSigned:true, sampleArrived:true, manualDone:false, createdAt:Date.now()},
    {id:uidLocal(), brand:'Demo Wellness Co.', videosRequired:10, start:dkeyLocal(addDaysLocal(today,-30)), end:dkeyLocal(addDaysLocal(today,-2)),
     price:1500, priceType:'total', paymentMethod:'PayPal', paid:true, notes:'', contractSigned:true, sampleArrived:true, manualDone:true, createdAt:Date.now()}
  ];

  const affiliateEntries = [
    {id:uidLocal(), date: dkeyLocal(new Date(today.getFullYear(), today.getMonth(), 1)), monthLabel: today.getFullYear()+'-'+String(today.getMonth()+1).padStart(2,'0'), amount: 3200, notes:'Esempio', createdAt:Date.now()},
    {id:uidLocal(), date: dkeyLocal(new Date(today.getFullYear(), today.getMonth()-1, 1)), monthLabel: today.getFullYear()+'-'+String(today.getMonth()).padStart(2,'0'), amount: 2750, notes:'Esempio', createdAt:Date.now()}
  ];

  const profiles = [
    {id:'demo-profilo', handle:'@demo.creator'}
  ];

  const data = {};
  data['content-items::demo-profilo'] = JSON.stringify(items);
  data['calendar-assignments::demo-profilo'] = JSON.stringify(assignments);
  data['daily-targets::demo-profilo'] = JSON.stringify({shop:3, personal:1});
  data['retainers::demo-profilo'] = JSON.stringify(retainers);
  data['affiliate-entries::demo-profilo'] = JSON.stringify(affiliateEntries);
  data['profiles'] = JSON.stringify(profiles);
  data['current-profile-id'] = JSON.stringify('demo-profilo');
  return data;
}

const demoStorage = {
  async get(key){
    if(!demoStore) demoStore = generateDemoData();
    if(!(key in demoStore)) return null;
    return { key, value: demoStore[key] };
  },
  async set(key, value){
    if(!demoStore) demoStore = generateDemoData();
    demoStore[key] = value;
    return { key, value };
  },
  async delete(key){
    if(!demoStore) demoStore = generateDemoData();
    delete demoStore[key];
    return { key, deleted:true };
  },
  async list(prefix){
    if(!demoStore) demoStore = generateDemoData();
    return { keys: Object.keys(demoStore).filter(k=>k.startsWith(prefix||'')) };
  }
};

window.storage = {
  async get(key){
    if(isGuestMode) return demoStorage.get(key);
    const token = await getValidAccessToken();
    if(!token) return null;
    try{
      const res = await fetch(`${SUPABASE_URL}/rest/v1/storage?key=eq.${encodeURIComponent(key)}&select=value`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
      });
      if(!res.ok) return null;
      const data = await res.json();
      if(!data || data.length===0) return null;
      return { key, value: data[0].value };
    }catch(e){ console.error('storage.get error', e); return null; }
  },
  async set(key, value){
    if(isGuestMode) return demoStorage.set(key, value);
    const token = await getValidAccessToken();
    if(!token) return null;
    try{
      const res = await fetch(`${SUPABASE_URL}/rest/v1/storage`, {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=merge-duplicates'
        },
        body: JSON.stringify({ key, value, updated_at: new Date().toISOString() })
      });
      if(!res.ok) return null;
      return { key, value };
    }catch(e){ console.error('storage.set error', e); return null; }
  },
  async delete(key){
    if(isGuestMode) return demoStorage.delete(key);
    const token = await getValidAccessToken();
    if(!token) return null;
    try{
      await fetch(`${SUPABASE_URL}/rest/v1/storage?key=eq.${encodeURIComponent(key)}`, {
        method: 'DELETE',
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
      });
      return { key, deleted:true };
    }catch(e){ console.error('storage.delete error', e); return null; }
  },
  async list(prefix){
    if(isGuestMode) return demoStorage.list(prefix);
    const token = await getValidAccessToken();
    if(!token) return null;
    try{
      const res = await fetch(`${SUPABASE_URL}/rest/v1/storage?key=like.${encodeURIComponent((prefix||'')+'*')}&select=key`, {
        headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${token}` }
      });
      if(!res.ok) return null;
      const data = await res.json();
      return { keys: data.map(r=>r.key) };
    }catch(e){ console.error('storage.list error', e); return null; }
  }
};

async function tryAutoLogin(){
  const token = await getValidAccessToken();
  if(token){
    currentRole = await fetchUserRole(token);
    isGuestMode = false;
    applyRoleRestrictions();
    document.getElementById('login-overlay').style.display = 'none';
    window.startTrackerApp();
    return true;
  }
  return false;
}

function enterGuestMode(){
  isGuestMode = true;
  currentRole = 'guest';
  applyRoleRestrictions();
  document.getElementById('login-overlay').style.display = 'none';
  window.startTrackerApp();
}

function applyRoleRestrictions(){
  document.body.classList.remove('role-admin','role-editor','role-guest');
  document.body.classList.add('role-' + currentRole);

  if(currentRole === 'editor'){
    document.querySelectorAll('.tab-btn').forEach(btn=>{
      const tab = btn.getAttribute('data-tab');
      btn.style.display = (tab==='dashboard' || tab==='backlog' || tab==='calendario') ? '' : 'none';
    });
  } else if(currentRole === 'guest'){
    document.querySelectorAll('.tab-btn').forEach(btn=>{ btn.style.display=''; });
  } else {
    document.querySelectorAll('.tab-btn').forEach(btn=>{ btn.style.display=''; });
  }
}

document.getElementById('login-btn').addEventListener('click', doLogin);
document.getElementById('login-password').addEventListener('keydown', (e)=>{ if(e.key==='Enter') doLogin(); });

async function doLogin(){
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const errEl = document.getElementById('login-error');
  errEl.textContent = '';
  if(!email || !password){ errEl.textContent = 'Please enter email and password.'; return; }
  const btn = document.getElementById('login-btn');
  btn.disabled = true; btn.textContent = 'Signing in...';
  try{
    const data = await signIn(email, password);
    currentRole = await fetchUserRole(data.access_token);
    isGuestMode = false;
    applyRoleRestrictions();
    document.getElementById('login-overlay').style.display = 'none';
    window.startTrackerApp();
  }catch(err){
    errEl.textContent = err.message;
  }
  btn.disabled = false; btn.textContent = 'Sign in';
}
document.getElementById('guest-link').addEventListener('click', (e)=>{
  e.preventDefault();
  enterGuestMode();
});
