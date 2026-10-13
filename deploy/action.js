
(function(){
  const CAPACITY = 8;
  let contacts = [
    {name:"Mr Nobody", phone:"059-780-8824"},
    {name:"Princess Essiam", phone:"055-123-4567"},
    {name:"Kwame Mensah", phone:"024-987-6543"},
    {name:"Auntie Efya", phone:"020-555-0192"},
    {name:"Yaw Darko", phone:"027-342-8890"},
    {name:"Mama Akos", phone:"054-718-2301"},
    {name:"Kofi Boateng", phone:"023-456-7890"},
  ];
  function sortRaw(){ contacts.sort((a,b)=>a.name.localeCompare(b.name)); }
  sortRaw();
  let query="", selected=-1, lastCmp=null, formMode="add";
  const $=id=>document.getElementById(id);
  function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
  function log(code,res,isErr){
    const d=document.createElement('div');
    d.innerHTML='<span class="'+(isErr?'err':'info')+'">›</span> '+esc(code)+(res!==undefined?' <span class="'+(isErr?'err':'ok')+'">→ '+esc(res)+'</span>':'');
    const lc=$('logCtn'); lc.prepend(d); while(lc.children.length>50) lc.lastChild.remove();
  }
  function showCpp(s){$('cppViewEl').textContent=s;}
  function show(view){
    $('viewListCtn').hidden=view!=='list';
    $('viewDetailCtn').hidden=view!=='detail';
    $('viewFormCtn').hidden=view!=='form';
    $('viewArrayCtn').hidden=view!=='array';
  }
  function letterOf(n){const c=(n.trim()[0]||'#').toUpperCase();return /[A-Z]/.test(c)?c:'#';}
  function renderList(){
    const box=$('sectionsCtn'); box.innerHTML='';
    const q=query.trim().toLowerCase();
    let cmp=0; const hits=[];
    for(let i=0;i<contacts.length;i++){ if(!q){hits.push(i);continue;} cmp++; if(contacts[i].name.toLowerCase().includes(q)) hits.push(i); }
    lastCmp=q?cmp:null;
    const groups={};
    hits.forEach(i=>{const L=letterOf(contacts[i].name); (groups[L]=groups[L]||[]).push(i);});
    const letters=Object.keys(groups).sort();
    if(!hits.length){box.innerHTML='<div class="nores">No Results</div>';}
    letters.forEach(L=>{
      const h=document.createElement('div'); h.className='secHead'; h.id='sec-'+L; h.textContent=L; box.appendChild(h);
      groups[L].forEach(i=>{
        const r=document.createElement('div'); r.className='row'; r.textContent=contacts[i].name;
        r.onclick=()=>openDetail(i); box.appendChild(r);
      });
    });
    const ai=$('alphaIdxCtn'); ai.innerHTML='';
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').forEach(L=>{
      const b=document.createElement('button'); b.textContent=(L==='#'?'#':L);
      if(!groups[L]){b.classList.add('dim');}
      else b.onclick=()=>{const el=document.getElementById('sec-'+L); if(el) el.scrollIntoView();};
      ai.appendChild(b);
    });
    $('stNEl').textContent=contacts.length+'/'+CAPACITY;
    $('stCmpEl').textContent=lastCmp===null?'–':lastCmp+' cmp';
    $('stSortEl').textContent='yes';
  }
  // detail
  let editingDetail=false;
  function openDetail(i){
    selected=i; editingDetail=false; paintDetail(); show('detail');
  }
  function paintDetail(){
    const c=contacts[selected]; if(!c){show('list');return;}
    $('detailAvatarEl').textContent=(c.name.trim()[0]||'?').toUpperCase();
    $('editToggleBtn').textContent=editingDetail?'Done':'Edit';
    if(editingDetail){
      $('detailNameWrap').innerHTML='<input class="editInput" id="editNameInput" value="'+esc(c.name)+'">';
      $('detailPhoneEl').outerHTML='<input class="editInput" id="editPhoneInput" style="font-size:16px;width:60%" value="'+esc(c.phone)+'">';
    } else {
      $('detailNameWrap').innerHTML='<div class="detailName" id="detailNameEl">'+esc(c.name)+'</div>';
      const old=$('editPhoneInput');
      if(old){const a=document.createElement('a');a.className='val';a.id='detailPhoneEl';a.textContent=c.phone;a.onclick=()=>startCall(selected);old.replaceWith(a);}
      else $('detailPhoneEl').textContent=c.phone;
    }
    $('detailIdxEl').textContent='['+selected+'] of '+contacts.length;
  }
  $('backBtn').onclick=()=>{show('list');};
  $('editToggleBtn').onclick=()=>{
    if(!editingDetail){editingDetail=true;paintDetail();return;}
    const nm=($('editNameInput').value||'').trim(), ph=($('editPhoneInput').value||'').trim();
    if(!nm||!ph){log('edit','name + phone required',true);return;}
    showCpp('strcpy(contacts['+selected+'].name, "..."); // O(1) update');
    contacts[selected]={name:nm.slice(0,29),phone:ph.slice(0,15)};
    sortRaw(); selected=contacts.findIndex(c=>c.name===nm.slice(0,29));
    editingDetail=false; log('contacts update',nm); paintDetail(); renderList();
  };
  $('deleteContactBtn').onclick=()=>{$('delMaskCtn').hidden=false;};
  $('cancelDelBtn').onclick=()=>{$('delMaskCtn').hidden=true;};
  $('delMaskCtn').onclick=e=>{if(e.target.id==='delMaskCtn')$('delMaskCtn').hidden=true;};
  $('confirmDelBtn').onclick=()=>{
    $('delMaskCtn').hidden=true;
    showCpp('bool removeAt(Contact c[], int &n, int idx) {\n  for(int i=idx;i+1<n;++i) c[i]=c[i+1]; // shift left\n  --n;\n} // removeAt('+selected+')');
    const gone=contacts[selected].name;
    for(let k=selected;k+1<contacts.length;++k) contacts[k]=contacts[k+1];
    contacts.pop(); selected=-1;
    log('removeAt','deleted '+gone); renderList(); show('list');
  };
  // add form
  $('addNavBtn').onclick=()=>{formMode='add';$('formTitleEl').textContent='New Contact';$('firstInput').value='';$('lastInput').value='';$('phoneInput').value='';$('formMsgEl').textContent='';show('form');setTimeout(()=>$('firstInput').focus(),80);};
  $('formCancelBtn').onclick=()=>{show(selected>=0?'detail':'list'); if(selected>=0)paintDetail();};
  $('formDoneBtn').onclick=()=>{
    const f=$('firstInput').value.trim(), l=$('lastInput').value.trim(), ph=$('phoneInput').value.trim();
    const nm=(f+(l?' '+l:'')).trim();
    if(!nm||!ph){$('formMsgEl').textContent='name + phone required';return;}
    if(contacts.length>=CAPACITY){$('formMsgEl').textContent='Memory full (20/20) — delete one first';showCpp('addContact: if(n>=CAPACITY) return false; // overflow');log('addContact','overflow 20/20',true);return;}
    contacts.push({name:nm.slice(0,29),phone:ph.slice(0,15)}); sortRaw();
    showCpp('strcpy(c[n].name, name); strcpy(c[n].phone, phone); ++n; // O(1)');
    log('addContact("'+nm+'")','n='+contacts.length);
    selected=contacts.findIndex(c=>c.name===nm.slice(0,29));
    renderList(); openDetail(selected);
  };
  // search
  let sT=null;
  $('searchInput').addEventListener('input',e=>{
    clearTimeout(sT);
    sT=setTimeout(()=>{
      query=e.target.value;
      const q=query.trim().toLowerCase();
      if(q){let cmp=0,hits=0,first=-1;for(let i=0;i<contacts.length;i++){cmp++;if(contacts[i].name.toLowerCase().includes(q)){if(first<0)first=i;hits++;}}lastCmp=cmp;showCpp('linearSearch: '+cmp+' comparisons, '+hits+' hit(s)');log('linearSearch("'+query.trim()+'")',hits?(hits+' hits, '+cmp+' cmp'):('not found, '+cmp+' cmp'));}
      else lastCmp=null;
      renderList();
    },180);
  });
  $('clearSearchBtn').onclick=()=>{$('searchInput').value='';query='';lastCmp=null;renderList();show('list');};
  // array view
  $('arrayNavBtn').onclick=()=>show('array');
  $('arrayBackBtn').onclick=()=>show('list');
  $('fillBtn').onclick=()=>{
    const pool=[["Ama J.","055-000-0001"],["Yaw J.","055-000-0002"],["Kofi J.","055-000-0003"],["Efya J.","055-000-0004"]];
    for(const [nm,ph] of pool){if(contacts.length>=CAPACITY)break;contacts.push({name:nm,phone:ph});}
    sortRaw(); showCpp('while(n<CAPACITY) addContact(...); // fill'); log('fill','n='+contacts.length+'/'+CAPACITY); renderList();
  };
  $('shuffleBtn').onclick=()=>{
    for(let i=contacts.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));const t=contacts[i];contacts[i]=contacts[j];contacts[j]=t;}
    showCpp('Fisher-Yates shuffle O(n) — raw order only; list re-sorts'); sortRaw(); log('shuffle','demo: order randomized then sorted'); renderList();
  };
  $('sortBtn2').onclick=()=>{sortRaw();showCpp('sort(c, c+n, name <); // O(n log n)');log('sortByName()','A–Z');renderList();};
  // call
  let callInt=null,callTimeout=null,secs=0;
  function startCall(i){
    $('callingAvatarEl').textContent=(contacts[i].name[0]||'?').toUpperCase();
    $('callingNameEl').textContent=contacts[i].name;
    $('callingNumEl').textContent='mobile  •  '+contacts[i].phone;
    $('callingCtn').hidden=false; secs=0; $('callingTimerEl').textContent='calling…';
    clearInterval(callInt); clearTimeout(callTimeout);
    log('call contacts['+i+']','dialing '+contacts[i].phone);
    callTimeout=setTimeout(()=>{if(!$('callingCtn').hidden){$('callingTimerEl').textContent='00:00';callInt=setInterval(()=>{secs++;$('callingTimerEl').textContent='00:'+String(secs).padStart(2,'0');},1000);}},1200);
  }
  $('detailCallBtn').onclick=()=>startCall(selected);
  $('detailPhoneEl').onclick=()=>startCall(selected);
  $('detailMsgBtn').onclick=()=>log('message','demo: SMS not implemented');
  $('detailMailBtn').onclick=()=>log('mail','demo: mail not implemented');
  document.querySelectorAll('.callGrid .cg button').forEach(b=>{b.onclick=()=>log(b.dataset.f,'demo button');});
  $('endCallBtn').onclick=()=>{$('callingCtn').hidden=true;clearInterval(callInt);clearTimeout(callTimeout);log('call ended',secs+'s');};
  // pdf + cpp
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
  $('pdfBtn').onclick=openPdf;
  $('copyCppBtn').onclick=async()=>{const t=await getCpp();if(!t){$('cppMsgEl').textContent='C++ not loaded';return;}try{await navigator.clipboard.writeText(t);$('cppMsgEl').textContent='✓ copied ('+t.length+' chars)';}catch(e){$('cppMsgEl').textContent='Copy blocked';}};
  $('dlCppBtn').onclick=async()=>{const t=await getCpp();if(!t){$('cppMsgEl').textContent='C++ not loaded';return;}const b=new Blob([t],{type:'text/x-c++src'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='contacts.cpp';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);};
  $('resetBtn').onclick=()=>{
    contacts=[
      {name:"Mr Nobody", phone:"059-780-8824"},
      {name:"Princess Essiam", phone:"055-123-4567"},
      {name:"Auntie Efya", phone:"020-555-0192"},
      {name:"Yaw Darko", phone:"027-342-8890"},
      {name:"Mama Akos", phone:"054-718-2301"},
      {name:"Kofi Boateng", phone:"023-456-7890"},
    ];
    sortRaw(); query='';$('searchInput').value='';lastCmp=null; selected=-1;
    showCpp('Contact contacts[8]; int n = 6;'); log('reset','n=6'); renderList(); show('list');
  };
  renderList(); show('list');
})();