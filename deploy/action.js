
(function(){
  const CAPACITY = 8;
  let contacts = [
    {name:"Ama Serwaa", phone:"055-123-4567"},
    {name:"Kwame Mensah", phone:"024-987-6543"},
    {name:"Auntie Efya", phone:"020-555-0192"},
    {name:"Yaw Darko", phone:"027-342-8890"},
    {name:"Mama Akos", phone:"054-718-2301"},
    {name:"Kofi Boateng", phone:"023-456-7890"},
  ];
  let selected = -1;
  let query = "";
  let lastCmp = null, sortedFlag = false;
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
  function tickClock(){ const d=new Date(); $('clockEl').textContent=d.getHours()+':'+String(d.getMinutes()).padStart(2,'0'); }
  tickClock(); setInterval(tickClock,20000);
  function filtered(){
    if(!query) return contacts.map((c,i)=>({c,i}));
    // C++-faithful: linear substring scan, count comparisons
    let cmp=0; const out=[];
    for(let i=0;i<contacts.length;i++){ cmp++; if(contacts[i].name.toLowerCase().includes(query.toLowerCase())) out.push({c:contacts[i],i}); }
    lastCmp=cmp;
    return out;
  }
  function render(hlIdx){
    listCtn.innerHTML='';
    const rows=filtered();
    rows.forEach(({c,i})=>{
      const r=document.createElement('div');
      r.className='cRow'+(i===selected?' selected':'');
      if(hlIdx===i) r.classList.add('selected');
      const initial=(c.name.trim()[0]||'?').toUpperCase();
      r.innerHTML='<span class="idxBadge">['+i+']</span><div class="avatar">'+esc(initial)+'</div><div class="cInfo"><b>'+esc(c.name)+'</b><span>'+esc(c.phone)+'</span></div><button class="callBtn" title="call">✆</button><button class="delBtn" title="delete">✕</button>';
      r.onclick=(e)=>{
        if(e.target.classList.contains('callBtn')){ startCall(i); return; }
        if(e.target.classList.contains('delBtn')){ removeAt(i); return; }
        selected=i; updateSel(); render();
      };
      listCtn.appendChild(r);
    });
    if(!rows.length) listCtn.innerHTML='<div style="padding:20px;text-align:center;color:#999">No matches for “'+esc(query)+'”</div>';
    $('countEl').textContent=contacts.length+' / '+CAPACITY+' • array of struct';
    $('stNEl').textContent=contacts.length+'/'+CAPACITY;
    $('stCmpEl').textContent=lastCmp===null?'–':lastCmp+' cmp';
    $('stSortEl').textContent=sortedFlag?'yes':'no';
    updateSel();
  }
  function updateSel(){
    $('selInfoEl').textContent = (selected<0||selected>=contacts.length) ? 'nothing selected' : ('['+selected+'] '+contacts[selected].name+' • '+contacts[selected].phone);
  }
  function addContact(name,phone,sorted){
    if(contacts.length>=CAPACITY){ return {ok:false,msg:'overflow'}; }
    if(sorted){
      let pos=contacts.length;
      for(let i=0;i<contacts.length;i++) if(name.localeCompare(contacts[i].name)<0){pos=i;break;}
      for(let i=contacts.length;i>pos;--i) contacts[i]=contacts[i-1];
      contacts[pos]={name,phone}; sortedFlag=true;
      return {ok:true,pos};
    }
    contacts.push({name,phone}); sortedFlag=false;
    return {ok:true,pos:contacts.length-1};
  }
  function removeAt(i){
    showCpp('bool removeAt(Contact c[], int &n, int idx) {\n  for(int i=idx;i+1<n;++i) c[i]=c[i+1]; // shift left\n  --n;\n} // removeAt('+i+')');
    if(i<0||i>=contacts.length){log('removeAt('+i+')','invalid index',true);return;}
    const gone=contacts[i].name;
    for(let k=i;k+1<contacts.length;++k) contacts[k]=contacts[k+1];
    contacts.pop(); selected=-1; sortedFlag=false;
    log('removeAt('+i+')','deleted '+gone+', shifted left'); render();
  }
  // sheet
  let editing=-1;
  function openSheet(mode,idx){
    editing = mode==='edit'?idx:-1;
    $('sheetTitleEl').textContent = mode==='edit' ? ('Edit ['+idx+']') : 'New contact';
    $('nameInput').value = mode==='edit' ? contacts[idx].name : '';
    $('phoneInput').value = mode==='edit' ? contacts[idx].phone : '';
    $('sheetMsgEl').textContent='';
    $('addSheetCtn').hidden=false;
    setTimeout(()=>$('nameInput').focus(),50);
  }
  $('tabAddBtn').onclick=()=>openSheet('add');
  $('editBtn').onclick=()=>{ if(selected<0) {log('edit','select a row first',true);return;} openSheet('edit',selected); };
  $('cancelSheetBtn').onclick=()=>{ $('addSheetCtn').hidden=true; };
  $('saveContactBtn').onclick=()=>{
    const nm=$('nameInput').value.trim(), ph=$('phoneInput').value.trim();
    if(!nm||!ph){$('sheetMsgEl').textContent='name + phone required';return;}
    if(editing>=0){
      showCpp('strcpy(contacts['+editing+'].name, "'+nm+'"); // O(1) update');
      contacts[editing]={name:nm.slice(0,29),phone:ph.slice(0,15)};
      log('contacts['+editing+'] update',nm); $('addSheetCtn').hidden=true; selected=editing; render(); return;
    }
    showCpp('bool addContact(...) {\n  if(n>=CAPACITY) return false;\n  strcpy(c[n].name, name); strcpy(c[n].phone, phone); ++n;\n}');
    const r=addContact(nm.slice(0,29),ph.slice(0,15),false);
    if(!r.ok){$('sheetMsgEl').textContent='Memory full (8/8) — delete one first'; log('addContact','overflow: 8/8',true); return;}
    log('addContact("'+nm+'")','contacts['+r.pos+'] n='+contacts.length);
    $('addSheetCtn').hidden=true; render(r.pos);
  };
  $('delBtn').onclick=()=>{ if(selected<0){log('delete','select a row first',true);return;} removeAt(selected); };
  $('callBtn').onclick=()=>{ if(selected<0){log('call','select a row first',true);return;} startCall(selected); };
  // search mirrors linearSearch with comparison count
  let searchTimer=null;
  $('searchInput').addEventListener('input',e=>{
    clearTimeout(searchTimer);
    searchTimer=setTimeout(()=>{
      query=e.target.value.trim();
      if(!query){lastCmp=null;showCpp('Contact contacts[8]; int n = '+contacts.length+';');render();return;}
      let cmp=0,first=-1,hits=0;
      for(let i=0;i<contacts.length;i++){cmp++; if(contacts[i].name.toLowerCase().includes(query.toLowerCase())){if(first<0)first=i;hits++;}}
      lastCmp=cmp;
      showCpp('int linearSearch(...) {\n  for(int i=0;i<n;++i){ comparisons++; // '+cmp+' total\n    if(strstr(c[i].name,"'+query+'")) return i; }\n  return -1;\n}');
      log('linearSearch("'+query+'")',hits?('first ['+first+'], '+hits+' hit(s), '+cmp+' cmp'):('not found, '+cmp+' cmp'));
      render(first);
    },180);
  });
  $('clearSearchBtn').onclick=()=>{$('searchInput').value='';query='';lastCmp=null;render();};
  function doSort(){
    showCpp('sort(c, c+n, [](auto &a, auto &b){return strcmp(a.name,b.name)<0;}); // O(n log n)');
    contacts.sort((a,b)=>a.name.localeCompare(b.name));
    sortedFlag=true; log('sortByName()','A–Z, [0]='+ (contacts[0]?contacts[0].name:'—')); render();
  }
  $('tabSortBtn').onclick=doSort; $('sortBtn2').onclick=doSort;
  $('tabShuffleBtn').onclick=()=>{
    showCpp('for(int i=n-1;i>0;--i) swap(c[i], c[rand()%(i+1)]);');
    for(let i=contacts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1)); const t=contacts[i];contacts[i]=contacts[j];contacts[j]=t;}
    sortedFlag=false; log('shuffle','order randomized'); render();
  };
  $('tabFillBtn').onclick=()=>{
    const pool=[["Ama J.","055-000-0001"],["Yaw J.","055-000-0002"],["Kofi J.","055-000-0003"],["Efya J.","055-000-0004"]];
    for(const [nm,ph] of pool){ if(contacts.length>=CAPACITY) break; contacts.push({name:nm,phone:ph}); }
    showCpp('while(n<CAPACITY) addContact(...); // fill to capacity');
    log('fill','n='+contacts.length+'/'+CAPACITY); render();
  };
  // fake call
  let callInt=null,callTimeout=null,secs=0;
  function startCall(i){
    selected=i; render();
    $('callingAvatarEl').textContent=(contacts[i].name[0]||'?').toUpperCase();
    $('callingNameEl').textContent=contacts[i].name;
    $('callingNumEl').textContent=contacts[i].phone;
    $('callingCtn').hidden=false; secs=0; $('callingTimerEl').textContent='calling…';
    clearInterval(callInt); clearTimeout(callTimeout);
    log('call contacts['+i+']','dialing '+contacts[i].phone);
    callTimeout=setTimeout(()=>{ if(!$('callingCtn').hidden){ $('callingTimerEl').textContent='00:00'; callInt=setInterval(()=>{secs++; $('callingTimerEl').textContent='00:'+String(secs).padStart(2,'0');},1000);} },1200);
  }
  $('endCallBtn').onclick=()=>{ $('callingCtn').hidden=true; clearInterval(callInt); clearTimeout(callTimeout); log('call ended',secs+'s'); };
  $('jumpLabBtn').onclick=()=>{document.getElementById('labSection').scrollIntoView({behavior:'smooth'});};
  const EMBEDDED_CPP = "// Phone Contact App — arrays in C++\n// Compile: g++ -std=c++17 -O2 -o contacts contacts.cpp && ./contacts\n#include <algorithm>\n#include <cstring>\n#include <functional>\n#include <iomanip>\n#include <iostream>\n#include <string>\n\nconst int CAPACITY = 8;\n\nstruct Contact {\n    char name[30];\n    char phone[16];\n};\n\nvoid printContacts(const Contact c[], int n) {\n    std::cout << \"contacts[\" << n << \"/\" << CAPACITY << \"]:\\n\";\n    for (int i = 0; i < n; ++i)\n        std::cout << \"  [\" << i << \"] \" << c[i].name << \"  \" << c[i].phone << \"\\n\";\n}\n\nint linearSearch(const Contact c[], int n, const char* query, int& comparisons) {\n    comparisons = 0;\n    for (int i = 0; i < n; ++i) {\n        ++comparisons;\n        if (strstr(c[i].name, query) != nullptr) return i; // substring match\n    }\n    return -1;\n}\n\nbool addContact(Contact c[], int& n, const char* name, const char* phone) {\n    if (n >= CAPACITY) { std::cout << \"memory full: delete a contact first\\n\"; return false; }\n    strncpy(c[n].name, name, sizeof(c[n].name) - 1); c[n].name[sizeof(c[n].name)-1] = '\\0';\n    strncpy(c[n].phone, phone, sizeof(c[n].phone) - 1); c[n].phone[sizeof(c[n].phone)-1] = '\\0';\n    ++n; // O(1) append\n    return true;\n}\n\nbool insertSorted(Contact c[], int& n, const char* name, const char* phone) {\n    if (n >= CAPACITY) return false;\n    int pos = n;\n    for (int i = 0; i < n; ++i)\n        if (strcmp(name, c[i].name) < 0) { pos = i; break; }\n    for (int i = n; i > pos; --i) c[i] = c[i-1]; // shift right O(n)\n    strncpy(c[pos].name, name, 29); c[pos].name[29] = '\\0';\n    strncpy(c[pos].phone, phone, 15); c[pos].phone[15] = '\\0';\n    ++n;\n    return true;\n}\n\nbool removeAt(Contact c[], int& n, int idx) {\n    if (idx < 0 || idx >= n) return false;\n    for (int i = idx; i + 1 < n; ++i) c[i] = c[i+1]; // shift left O(n)\n    --n;\n    return true;\n}\n\nvoid sortByName(Contact c[], int n) {\n    std::sort(c, c + n, [](const Contact& a, const Contact& b){\n        return strcmp(a.name, b.name) < 0;\n    });\n}\n\nint main() {\n    Contact contacts[CAPACITY];\n    int n = 0;\n    addContact(contacts, n, \"Ama Serwaa\", \"055-123-4567\");\n    addContact(contacts, n, \"Kwame Mensah\", \"024-987-6543\");\n    addContact(contacts, n, \"Auntie Efya\", \"020-555-0192\");\n    addContact(contacts, n, \"Yaw Darko\", \"027-342-8890\");\n    addContact(contacts, n, \"Mama Akos\", \"054-718-2301\");\n    addContact(contacts, n, \"Kofi Boateng\", \"023-456-7890\");\n\n    printContacts(contacts, n);\n    sortByName(contacts, n);\n    std::cout << \"-- after sort --\\n\";\n    printContacts(contacts, n);\n\n    int cmp = 0;\n    int idx = linearSearch(contacts, n, \"Yaw\", cmp);\n    std::cout << \"search \\\"Yaw\\\" -> index \" << idx << \" (\" << cmp << \" comparisons)\\n\";\n\n    removeAt(contacts, n, 1);\n    std::cout << \"-- after removeAt(1) --\\n\";\n    printContacts(contacts, n);\n    return 0;\n}\n";
  async function getCpp(){
    if (typeof EMBEDDED_CPP === 'string' && EMBEDDED_CPP.includes('int main')) return EMBEDDED_CPP;
    for (const u of ['src/contacts.cpp','contacts.cpp','./contacts.cpp']) {
      try { const r = await fetch(u); if (r.ok) { const t = await r.text(); if (t.includes('int main')) return t; } } catch(e) {}
    }
    return (typeof EMBEDDED_CPP === 'string') ? EMBEDDED_CPP : '// contacts.cpp not found';
  }
  $('copyCppBtn').onclick=async()=>{ const t=await getCpp(); try{await navigator.clipboard.writeText(t); $('cppMsgEl').textContent='✓ copied ('+t.length+' chars)';}catch(e){$('cppMsgEl').textContent='Copy blocked — open src/contacts.cpp';} };
  async function dl(){ const t=await getCpp(); const b=new Blob([t],{type:'text/x-c++src'}); const a=document.createElement('a'); a.href=URL.createObjectURL(b); a.download='contacts.cpp'; a.click(); setTimeout(()=>URL.revokeObjectURL(a.href),2000); }
  $('dlCppBtn').onclick=dl; $('topDlBtn').onclick=dl;
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
    showCpp('Contact contacts[8]; int n = 6;'); log('reset','n=6'); render();
  };
  render();
})();