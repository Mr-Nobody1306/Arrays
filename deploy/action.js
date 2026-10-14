
(function(){
  const CAPACITY = 8;
  const ICON_PHONE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.34 1.79.66 2.64a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.44-1.23a2 2 0 0 1 2.11-.45c.85.32 1.74.54 2.64.66A2 2 0 0 1 22 16.92z"/></svg>';
  const ICON_X = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>';
  let contacts = [
    {name:"Mr Nobody", phone:"059-780-8824"},
    {name:"Kwame Mensah", phone:"024-987-6543"},
    {name:"Auntie Efya", phone:"020-555-0192"},
    {name:"Yaw Darko", phone:"027-342-8890"},
    {name:"Mama Akos", phone:"054-718-2301"},
    {name:"Kofi Boateng", phone:"023-456-7890"},
  ];
  let selected=-1, query="", lastCmp=null, sortedFlag=false;
  const listCtn=document.getElementById('contactListCtn');
  const logCtn=document.getElementById('logCtn');
  const cppView=document.getElementById('cppViewEl');
  const $=id=>document.getElementById(id);
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function log(code,res,isErr){
    const d=document.createElement('div');
    d.innerHTML='<span class="'+(isErr?'err':'info')+'">›</span> '+esc(code)+(res!==undefined?' <span class="'+(isErr?'err':'ok')+'">→ '+esc(res)+'</span>':'');
    logCtn.prepend(d); while(logCtn.children.length>50) logCtn.lastChild.remove();
  }
  function showCpp(s){cppView.textContent=s;}
  function showTab(which){
    $('pageContactsCtn').hidden = which!=='contacts';
    $('pageArrayCtn').hidden = which!=='array';
    $('tabContactsBtn').classList.toggle('active',which==='contacts');
    $('tabArrayBtn').classList.toggle('active',which==='array');
  }
  $('tabContactsBtn').onclick=()=>showTab('contacts');
  $('tabArrayBtn').onclick=()=>showTab('array');
  function render(hl){
    listCtn.innerHTML='';
    let rows;
    if(!query){ rows=contacts.map((c,i)=>({c,i})); }
    else { rows=[]; let cmp=0; for(let i=0;i<contacts.length;i++){cmp++; if(contacts[i].name.toLowerCase().includes(query.toLowerCase())) rows.push({c:contacts[i],i});} lastCmp=cmp; }
    rows.forEach(({c,i})=>{
      const r=document.createElement('div');
      r.className='cRow'+(i===selected?' selected':'');
      const initial=(c.name.trim()[0]||'?').toUpperCase();
      r.innerHTML='<span class="idxBadge">['+i+']</span><div class="avatar">'+esc(initial)+'</div><div class="cInfo"><b>'+esc(c.name)+'</b><span>'+esc(c.phone)+'</span></div><button class="callBtn" title="Call">'+ICON_PHONE+'</button><button class="delBtn" title="Delete">'+ICON_X+'</button>';
      r.onclick=(e)=>{
        if(e.target.closest('.callBtn')){startCall(i);return;}
        if(e.target.closest('.delBtn')){removeAt(i);return;}
        selected=i; render();
      };
      listCtn.appendChild(r);
    });
    if(!rows.length) listCtn.innerHTML='<div style="padding:20px;text-align:center;color:#999">No matches</div>';
    $('countEl').textContent=contacts.length+' / '+CAPACITY+' • array of struct';
    $('stNEl').textContent=contacts.length+'/'+CAPACITY;
    $('stCmpEl').textContent=lastCmp===null?'–':lastCmp+' cmp';
    $('stSortEl').textContent=sortedFlag?'yes':'no';
    $('selInfoEl').textContent=(selected<0||selected>=contacts.length)?'tap a row to select':('['+selected+'] '+contacts[selected].name);
  }
  function removeAt(i){
    showCpp('bool removeAt(Contact c[], int &n, int idx) {\n  for(int i=idx;i+1<n;++i) c[i]=c[i+1]; // shift left\n  --n;\n} // removeAt('+i+')');
    if(i<0||i>=contacts.length){log('removeAt('+i+')','invalid index',true);return;}
    const gone=contacts[i].name;
    for(let k=i;k+1<contacts.length;++k) contacts[k]=contacts[k+1];
    contacts.pop(); selected=-1; sortedFlag=false;
    log('removeAt('+i+')','deleted '+gone); render(); showTab('contacts');
  }
  let editing=-1;
  function openSheet(mode,idx){
    editing=mode==='edit'?idx:-1;
    $('sheetTitleEl').textContent=mode==='edit'?('Edit ['+idx+']'):'New contact';
    $('nameInput').value=mode==='edit'?contacts[idx].name:'';
    $('phoneInput').value=mode==='edit'?contacts[idx].phone:'';
    $('sheetMsgEl').textContent=''; $('addSheetCtn').hidden=false;
    setTimeout(()=>$('nameInput').focus(),50);
  }
  $('tabAddBtn').onclick=()=>openSheet('add');
  $('editBtn').onclick=()=>{if(selected<0){log('edit','select a row first',true);showTab('array');return;}openSheet('edit',selected);};
  $('cancelSheetBtn').onclick=()=>{$('addSheetCtn').hidden=true;};
  $('saveContactBtn').onclick=()=>{
    const nm=$('nameInput').value.trim(), ph=$('phoneInput').value.trim();
    if(!nm||!ph){$('sheetMsgEl').textContent='name + phone required';return;}
    if(editing>=0){
      showCpp('strcpy(contacts['+editing+'].name, "..."); // O(1) update');
      contacts[editing]={name:nm.slice(0,29),phone:ph.slice(0,15)};
      log('contacts['+editing+'] update',nm); $('addSheetCtn').hidden=true; selected=editing; render(); return;
    }
    if(contacts.length>=CAPACITY){$('sheetMsgEl').textContent='Memory full (8/8) — delete one first'; showCpp('addContact: if(n>=CAPACITY) return false; // overflow'); log('addContact','overflow 8/8',true); return;}
    contacts.push({name:nm.slice(0,29),phone:ph.slice(0,15)}); sortedFlag=false;
    showCpp('strcpy(c[n].name, name); strcpy(c[n].phone, phone); ++n; // O(1)');
    log('addContact("'+nm+'")','n='+contacts.length);
    $('addSheetCtn').hidden=true; render(contacts.length-1);
  };
  $('delBtn').onclick=()=>{if(selected<0){log('delete','select a row first',true);return;}removeAt(selected);};
  $('callBtn').onclick=()=>{if(selected<0){log('call','select a row first',true);return;}startCall(selected);};
  let searchTimer=null;
  $('searchInput').addEventListener('input',e=>{
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>{
      query=e.target.value.trim();
      if(!query){lastCmp=null;render();return;}
      let cmp=0,first=-1,hits=0;
      for(let i=0;i<contacts.length;i++){cmp++;if(contacts[i].name.toLowerCase().includes(query.toLowerCase())){if(first<0)first=i;hits++;}}
      lastCmp=cmp;
      showCpp('linearSearch: '+cmp+' comparisons, '+hits+' hit(s)');
      log('linearSearch("'+query+'")',hits?('first ['+first+'], '+hits+' hits, '+cmp+' cmp'):('not found, '+cmp+' cmp'));
      render(first);
    },180);
  });
  $('clearSearchBtn').onclick=()=>{$('searchInput').value='';query='';lastCmp=null;render();showTab('contacts');};
  function doSort(){
    showCpp('sort(c, c+n, [](auto &a, auto &b){return strcmp(a.name,b.name)<0;});');
    contacts.sort((a,b)=>a.name.localeCompare(b.name));
    sortedFlag=true; log('sortByName()','A–Z'); render(); showTab('contacts');
  }
  $('tabSortBtn').onclick=doSort; $('sortBtn2').onclick=doSort;
  $('shuffleBtn').onclick=()=>{
    for(let i=contacts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=contacts[i];contacts[i]=contacts[j];contacts[j]=t;}
    sortedFlag=false; showCpp('Fisher-Yates shuffle O(n)'); log('shuffle','randomized'); render();
  };
  $('fillBtn').onclick=()=>{
    const pool=[["Ama J.","055-000-0001"],["Yaw J.","055-000-0002"],["Kofi J.","055-000-0003"],["Efya J.","055-000-0004"]];
    for(const [nm,ph] of pool){if(contacts.length>=CAPACITY)break;contacts.push({name:nm,phone:ph});}
    showCpp('while(n<CAPACITY) addContact(...); // fill'); log('fill','n='+contacts.length+'/'+CAPACITY); render();
  };
  let callInt=null,callTimeout=null,secs=0;
  function startCall(i){
    selected=i; render();
    $('callingAvatarEl').textContent=(contacts[i].name[0]||'?').toUpperCase();
    $('callingNameEl').textContent=contacts[i].name;
    $('callingNumEl').textContent='mobile  •  '+contacts[i].phone;
    $('callingCtn').hidden=false; secs=0; $('callingTimerEl').textContent='calling…';
    clearInterval(callInt); clearTimeout(callTimeout);
    log('call contacts['+i+']','dialing '+contacts[i].phone);
    callTimeout=setTimeout(()=>{if(!$('callingCtn').hidden){$('callingTimerEl').textContent='00:00';callInt=setInterval(()=>{secs++;$('callingTimerEl').textContent='00:'+String(secs).padStart(2,'0');},1000);}},1200);
  }
  $('endCallBtn').onclick=()=>{$('callingCtn').hidden=true;clearInterval(callInt);clearTimeout(callTimeout);log('call ended',secs+'s');};
  async function getCpp(){
    if(typeof EMBEDDED_CPP==='string'&&EMBEDDED_CPP.includes('int main'))return EMBEDDED_CPP;
    for(const u of ['src/contacts.cpp','contacts.cpp']){try{const r=await fetch(u);if(r.ok){const t=await r.text();if(t.includes('int main'))return t;}}catch(e){}}
    return '';
  }
  function openPdf(){
    (async()=>{
      for(const u of ['src/explanation.pdf','explanation.pdf','Arrays-Explanation.pdf']){try{const r=await fetch(u,{method:'HEAD'});if(r.ok){window.open(u,'_blank');return;}}catch(e){}}
      window.open('src/explanation.pdf','_blank');
    })();
  }
  $('pdfBtn').onclick=openPdf; $('pdfBtn2').onclick=openPdf;
  $('copyCppBtn').onclick=async()=>{const t=await getCpp();if(!t){$('cppMsgEl').textContent='C++ not loaded';return;}try{await navigator.clipboard.writeText(t);$('cppMsgEl').textContent='✓ copied ('+t.length+' chars)';}catch(e){$('cppMsgEl').textContent='Copy blocked';}};
  $('dlCppBtn').onclick=async()=>{const t=await getCpp();if(!t){$('cppMsgEl').textContent='C++ not loaded';return;}const b=new Blob([t],{type:'text/x-c++src'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='contacts.cpp';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
  $('cppBtn').onclick=async()=>{const t=await getCpp();if(!t)return;const b=new Blob([t],{type:'text/x-c++src'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='contacts.cpp';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
  $('resetBtn').onclick=()=>{
    contacts=[
      {name:"Mr Nobody", phone:"059-780-8824"},
      {name:"Kwame Mensah", phone:"024-987-6543"},
      {name:"Auntie Efya", phone:"020-555-0192"},
      {name:"Yaw Darko", phone:"027-342-8890"},
      {name:"Mama Akos", phone:"054-718-2301"},
      {name:"Kofi Boateng", phone:"023-456-7890"},
    ];
    selected=-1;query='';$('searchInput').value='';lastCmp=null;sortedFlag=false;
    showCpp('Contact contacts[8]; int n = 6;'); log('reset','n=6'); render(); showTab('contacts');
  };
  render(); showTab('contacts');
})();