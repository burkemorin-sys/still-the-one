/* Still the One — shared client-side behaviour (demo / test mode only). */
(function(){
'use strict';
var KEY='stillTheOne.profile.v1';
var $=function(s,r){return (r||document).querySelector(s)};
var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};

function loadProfile(){try{return JSON.parse(localStorage.getItem(KEY))||null}catch(e){return null}}
function saveProfile(p){localStorage.setItem(KEY,JSON.stringify(p))}

/* ---------- toast & modal ---------- */
function toast(msg){
  var t=$('#toast'); if(!t){t=document.createElement('div');t.id='toast';t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.innerHTML='<svg width="16" height="16"><use href="#check"/></svg><span></span>'; t.querySelector('span').textContent=msg;
  t.classList.add('show'); clearTimeout(t._h); t._h=setTimeout(function(){t.classList.remove('show')},2600);
}
window.STO={toast:toast};
$$('[data-close-modal]').forEach(function(b){b.addEventListener('click',function(){b.closest('.modal').classList.remove('open')})});
$$('.modal').forEach(function(m){m.addEventListener('click',function(e){if(e.target===m)m.classList.remove('open')})});
document.addEventListener('keydown',function(e){if(e.key==='Escape')$$('.modal.open').forEach(function(m){m.classList.remove('open')})});

/* ---------- placeholder links ---------- */
$$('a[href="#"]').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();
  var r=a.getAttribute('data-retailer'); toast(r?('Test mode · example link to '+r+' (placeholder)'):'Test mode · placeholder link');})});

/* ---------- favourites ---------- */
$$('.fav').forEach(function(f){f.addEventListener('click',function(e){e.preventDefault();e.stopPropagation();f.classList.toggle('on')})});

/* ---------- generic filters ---------- */
$$('[data-filter-scope]').forEach(function(scope){
  var state={};
  var list=$('[data-filter-list]',scope)||document.querySelector('[data-filter-list]');
  var empty=$('[data-filter-empty]',scope);
  function apply(){
    var shown=0;
    $$('[data-item]',list).forEach(function(it){
      var ok=Object.keys(state).every(function(k){var v=state[k]; if(!v||v==='all')return true;
        return (' '+(it.getAttribute('data-'+k)||'')+' ').indexOf(' '+v+' ')>-1});
      it.hidden=!ok; if(ok)shown++;
    });
    if(empty)empty.hidden=shown>0;
    var c=$('[data-filter-count]',scope); if(c){var nn=c.getAttribute('data-noun')||'bouquet';c.textContent=shown+' '+nn+(shown===1?'':'s')}
  }
  $$('[data-filter]',scope).forEach(function(group){
    var name=group.getAttribute('data-filter');
    var on=$('.on',group); state[name]=on?on.getAttribute('data-value'):'all';
    $$('[data-value]',group).forEach(function(btn){btn.addEventListener('click',function(e){e.preventDefault();
      $$('[data-value]',group).forEach(function(b){b.classList.remove('on');b.setAttribute('aria-pressed','false')});
      btn.classList.add('on');btn.setAttribute('aria-pressed','true');state[name]=btn.getAttribute('data-value');apply();})});
  });
  $$('[data-filter-reset]',scope).forEach(function(reset){reset.addEventListener('click',function(e){e.preventDefault();$$('[data-filter]',scope).forEach(function(g){var f=$('[data-value]',g);f&&f.click()})})});
  apply();
});

/* ---------- personalisation from saved profile ---------- */
var p=loadProfile()||{};
function first(n){return (n||'').trim().split(/\s+/)[0]||''}
var you=first(p.yourName)||'Emma', partner=first(p.partnerName)||'James';
$$('[data-you]').forEach(function(e){e.textContent=you});
$$('[data-partner]').forEach(function(e){e.textContent=partner});
$$('[data-you-initial]').forEach(function(e){e.textContent=you.charAt(0).toUpperCase()});
$$('[data-partner-initial]').forEach(function(e){e.textContent=partner.charAt(0).toUpperCase()});
(function(){
  var h=new Date().getHours(), g=h<12?'Good morning,':h<18?'Good afternoon,':'Good evening,';
  var days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var part=h<12?'morning':h<18?'afternoon':'evening';
  $$('[data-greeting]').forEach(function(e){e.textContent=g});
  $$('[data-daypart]').forEach(function(e){e.textContent=days[new Date().getDay()]+' '+part});
  var a=p.anniversary||'2014-06-14', d=new Date(a+'T00:00:00'); if(isNaN(d))return;
  var now=new Date(); now.setHours(0,0,0,0);
  var married=Math.max(0,Math.round((now-d)/864e5));
  var next=new Date(now.getFullYear(),d.getMonth(),d.getDate()); if(next<now)next.setFullYear(now.getFullYear()+1);
  var until=Math.round((next-now)/864e5), nth=next.getFullYear()-d.getFullYear();
  var years=Math.floor((now-d)/(365.2425*864e5));
  var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  function ord(n){var s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0])}
  $$('[data-married-days]').forEach(function(e){e.textContent=married.toLocaleString('en-US')});
  $$('[data-married-years]').forEach(function(e){e.textContent=years});
  $$('[data-wed-date]').forEach(function(e){e.textContent=months[d.getMonth()]+' '+d.getDate()+', '+d.getFullYear()});
  $$('[data-anniv-until]').forEach(function(e){e.textContent=until});
  $$('[data-anniv-nth]').forEach(function(e){e.textContent=ord(nth)});
  $$('[data-anniv-day]').forEach(function(e){e.textContent=months[next.getMonth()]+' '+next.getDate()});
})();

/* ---------- membership plans ---------- */
var PLANS={sweetheart:{name:'Sweetheart',price:'9.99'},devoted:{name:'Devoted',price:'19.99'},forever:{name:'Forever',price:'39.99'}};
var planWrap=$('[data-plans]');
if(planWrap){
  var cta=$('[data-plan-cta]'), billing='monthly', chosen='devoted';
  function upd(){ if(cta){cta.href='checkout.html?plan='+chosen+'&billing='+billing; var l=$('[data-plan-cta-label]'); if(l)l.textContent='Continue with '+PLANS[chosen].name;}
    $$('[data-billing-note]').forEach(function(n){n.textContent=billing==='yearly'?'/mo, billed yearly':'/mo'}); }
  $$('[data-plan]',planWrap).forEach(function(c){c.addEventListener('click',function(e){ if(e.target.closest('a'))return;
    $$('[data-plan]',planWrap).forEach(function(x){x.classList.remove('on');x.setAttribute('aria-checked','false')});
    c.classList.add('on');c.setAttribute('aria-checked','true');chosen=c.getAttribute('data-plan');upd();});
    c.addEventListener('keydown',function(e){if(e.key===' '||e.key==='Enter'){e.preventDefault();c.click()}});});
  $$('[data-billing]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();
    $$('[data-billing]').forEach(function(x){x.classList.remove('on')});b.classList.add('on');billing=b.getAttribute('data-billing');upd();})});
  upd();
}

/* ---------- checkout (TEST MODE: nothing is ever charged or sent) ---------- */
var co=$('[data-checkout]');
if(co){
  var q=new URLSearchParams(location.search), key=PLANS[q.get('plan')]?q.get('plan'):'devoted', plan=PLANS[key];
  var yearly=q.get('billing')==='yearly';
  $$('[data-co-plan]').forEach(function(e){e.textContent=plan.name});
  $$('[data-co-price]').forEach(function(e){e.textContent='$'+plan.price});
  $$('[data-co-billing]').forEach(function(e){e.textContent=yearly?'Billed yearly · 2 months free (example)':'Billed monthly · cancel anytime'});
  var method='card';
  function setMethod(m){method=m;$$('[data-method]',co).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-method')===m)});
    $$('[data-method-panel]',co).forEach(function(pn){pn.hidden=pn.getAttribute('data-method-panel')!==m});}
  $$('[data-method]',co).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();setMethod(b.getAttribute('data-method'))})});
  var cn=$('#co-card',co); if(cn)cn.addEventListener('input',function(){cn.value=cn.value.replace(/\D/g,'').slice(0,19).replace(/(\d{4})(?=\d)/g,'$1 ')});
  var ex=$('#co-exp',co); if(ex)ex.addEventListener('input',function(){var v=ex.value.replace(/\D/g,'').slice(0,4);ex.value=v.length>2?v.slice(0,2)+' / '+v.slice(2):v});
  function confirm(via){
    var label={card:'Card',bank:'Bank account (ACH)',applepay:'Apple Pay',paypal:'PayPal'}[via];
    if(via==='card'&&cn){var d=cn.value.replace(/\D/g,''); if(d.length>=4)label='Card ···· '+d.slice(-4)}
    // Wipe sensitive inputs — nothing is stored or transmitted in test mode.
    $$('input[data-sensitive]',co).forEach(function(i){i.value=''});
    $$('[data-w-plan]').forEach(function(e){e.textContent=plan.name+' membership'});
    $$('[data-w-price]').forEach(function(e){e.textContent='$'+plan.price+' / month · example price'});
    $$('[data-w-method]').forEach(function(e){e.textContent=label});
    $('#welcome').classList.add('open');
    // Test mode: completing a membership checkout creates a demo sign-in (client-side only).
    if(!auth()){setAuth({email:(loadProfile()||{}).yourEmail||'member@example.com',via:'checkout'});}
  }
  $$('[data-pay]',co).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();
    var via=b.getAttribute('data-pay'); confirm(via==='form'?method:via)})});
  setMethod('card');
}

/* ---------- profile ---------- */
var form=$('#profile-form');
if(form){
  var FIELDS=['yourName','yourEmail','yourPhone','addr1','addr2','city','state','zip','country','partnerName','partnerEmail','partnerPhone','alcohol','yourBirthday','partnerBirthday','anniversary','cardName','cardExp','paypalEmail','bankHolder','bankName'];
  var rows=$('#idates'), tpl=$('#idate-tpl');
  function addRow(d){d=d||{};var n=tpl.content.firstElementChild.cloneNode(true);
    $('[name=label]',n).value=d.label||'';$('[name=date]',n).value=d.date||'';$('[name=remind]',n).value=d.remind!=null?d.remind:7;
    $('.rm',n).addEventListener('click',function(){n.remove()});rows.appendChild(n);return n}
  $('#add-idate').addEventListener('click',function(){var r=addRow();$('[name=label]',r).focus()});
  var pm='card';
  function setPM(m){pm=m;$$('[data-pm]',form).forEach(function(b){var on=b.getAttribute('data-pm')===m;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)});
    $$('[data-pm-panel]',form).forEach(function(pn){pn.hidden=pn.getAttribute('data-pm-panel')!==m})}
  $$('[data-pm]',form).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();setPM(b.getAttribute('data-pm'))})});
  var card=$('#cardNumber'), acct=$('#bankAccount'), routing=$('#bankRouting');
  card.addEventListener('input',function(){card.value=card.value.replace(/\D/g,'').slice(0,19).replace(/(\d{4})(?=\d)/g,'$1 ')});
  var exp=form.elements.cardExp; exp.addEventListener('input',function(){var v=exp.value.replace(/\D/g,'').slice(0,4);exp.value=v.length>2?v.slice(0,2)+' / '+v.slice(2):v});
  [acct,routing].forEach(function(i){i.addEventListener('input',function(){i.value=i.value.replace(/\D/g,'').slice(0,17)})});
  function brand(d){return /^4/.test(d)?'Visa':/^(5[1-5]|2[2-7])/.test(d)?'Mastercard':/^3[47]/.test(d)?'Amex':/^6/.test(d)?'Discover':'Card'}
  function showSaved(s){
    var c=$('#card-saved'); if(s.cardLast4){card.value='';card.placeholder='•••• •••• •••• '+s.cardLast4;c.hidden=false;c.querySelector('span').textContent=(s.cardBrand||'Card')+' ending in '+s.cardLast4+' on file (last 4 only)'}else{c.hidden=true;card.placeholder='1234 5678 9012 3456'}
    var b=$('#bank-saved'); if(s.bankLast4){acct.value='';acct.placeholder='•••••••• '+s.bankLast4;b.hidden=false;b.querySelector('span').textContent='Account ending in '+s.bankLast4+' on file (last 4 only)'}else b.hidden=true;
    routing.value='';
  }
  function setAlc(v){form.elements.alcohol.value=v||'';$$('[data-alcohol]',form).forEach(function(b){var on=b.getAttribute('data-alcohol')===v;b.classList.toggle('on',on);b.setAttribute('aria-checked',on)})}
  $$('[data-alcohol]',form).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();setAlc(b.getAttribute('data-alcohol'))})});
  function fill(s){FIELDS.forEach(function(f){if(form.elements[f]&&s[f]!=null)form.elements[f].value=s[f]});
    rows.innerHTML='';(s.importantDates&&s.importantDates.length?s.importantDates:[]).forEach(addRow);
    setPM(s.paymentMethod||'card');setAlc(s.alcohol||'');showSaved(s);}
  var saved=loadProfile();
  if(saved){fill(saved);$('#last-saved').textContent='Loaded from this browser · last saved '+new Date(saved.savedAt).toLocaleString();}
  else{ // example defaults so the page doesn't look empty
    fill({yourName:'Emma Whitfield',yourEmail:'emma@example.com',partnerName:'James Whitfield',anniversary:'2014-06-14',country:'United States',
      importantDates:[{label:'First date',date:'2011-09-03',remind:7},{label:"James's mom's birthday",date:'1958-03-22',remind:14}],paymentMethod:'card'});
  }
  form.addEventListener('submit',function(e){e.preventDefault();
    var prev=loadProfile()||{}, s={};
    FIELDS.forEach(function(f){if(form.elements[f])s[f]=form.elements[f].value.trim()});
    s.importantDates=$$('.idate',rows).map(function(r){return{label:$('[name=label]',r).value.trim(),date:$('[name=date]',r).value,remind:parseInt($('[name=remind]',r).value,10)||0}}).filter(function(d){return d.label||d.date});
    s.paymentMethod=pm;
    // SECURITY: never persist a full card/account number or CVC. Only the last 4 digits are kept.
    var cd=card.value.replace(/\D/g,''); if(cd.length>=4){s.cardLast4=cd.slice(-4);s.cardBrand=brand(cd)}else{s.cardLast4=prev.cardLast4||'';s.cardBrand=prev.cardBrand||''}
    var ad=acct.value.replace(/\D/g,''); s.bankLast4=ad.length>=4?ad.slice(-4):(prev.bankLast4||'');
    $('#cardCvc').value='';
    s.savedAt=Date.now(); saveProfile(s); showSaved(s);
    $('#last-saved').textContent='Saved to this browser · '+new Date(s.savedAt).toLocaleString();
    toast('Profile saved on this device (demo)');
  });
  $$('#clear-profile,[data-clear-profile]').forEach(function(clr){clr.addEventListener('click',function(e){e.preventDefault();localStorage.removeItem(KEY);location.reload()})});
}

/* ======================================================================
   Sign-in, newlyweds, registry, guest browse — TEST MODE / DEMO ONLY.
   The "logged in" state is just a localStorage flag checked client-side.
   This is NOT real security: it only hides pages, it protects nothing.
   ====================================================================== */
var AUTH='stillTheOne.auth.v1', ACCT='stillTheOne.account.v1', REG='stillTheOne.registry.v1', REM='stillTheOne.rememberEmail';
function jget(k){try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}}
function jset(k,v){localStorage.setItem(k,JSON.stringify(v))}
function auth(){return jget(AUTH)}
function setAuth(a){a.at=Date.now();jset(AUTH,a);var d=document.documentElement;d.classList.remove('is-out');d.classList.add('is-in')}
var CAT=(window.STO_CATALOG||[]), CATI={}; CAT.forEach(function(it){CATI[it.id]=it});
function safeNext(n){return n&&/^[a-z0-9-]+\.html([?#][\w=&%.#-]*)?$/i.test(n)?n:'home.html'}
function safeUrl(u){u=(u||'').trim();if(!u)return '';if(!/^https?:\/\//i.test(u))u='https://'+u;try{var x=new URL(u);return /^https?:$/.test(x.protocol)?x.href:''}catch(e){return ''}}
function el(tag,cls,txt){var n=document.createElement(tag);if(cls)n.className=cls;if(txt!=null)n.textContent=txt;return n}
function money(n){return '$'+n}

/* logout */
$$('[data-logout]').forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();localStorage.removeItem(AUTH);location.href='index.html'})});
var A=auth(); $$('[data-auth-email]').forEach(function(e){e.textContent=(A&&A.email)||'demo member'});

/* login */
var lf=$('[data-login-form]');
if(lf){
  var remembered=localStorage.getItem(REM); if(remembered)lf.elements.email.value=remembered;
  var fg=$('[data-forgot]'); if(fg)fg.addEventListener('click',function(e){e.preventDefault();$('[data-forgot-note]').hidden=false;toast('Test mode · no reset email is sent')});
  lf.addEventListener('submit',function(e){e.preventDefault();
    var em=lf.elements.email.value.trim(), pw=lf.elements.password.value, err=$('[data-login-err]');
    if(!em||!pw){err.textContent='Please enter an email and a password (any values work in test mode).';err.hidden=false;(em?lf.elements.password:lf.elements.email).focus();return}
    err.hidden=true;
    if(lf.elements.remember.checked)localStorage.setItem(REM,em);else localStorage.removeItem(REM);
    lf.elements.password.value=''; // never kept
    setAuth({email:em,remember:lf.elements.remember.checked,via:'login'});
    location.href=safeNext(new URLSearchParams(location.search).get('next'));
  });
}

/* newlyweds sign-up + registry builder */
var nw=$('#nw-form');
if(nw){
  var draft=jget(REG)||{}; var items=Array.isArray(draft.items)?draft.items:[]; var slugTouched=!!draft.slugTouched;
  var F=nw.elements, list=$('[data-reg-list]'), cnt=$('[data-reg-count]'), emp=$('[data-reg-empty]');
  function slugify(s){return (s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/&/g,' and ').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'').slice(0,48)}
  function base(){return location.href.replace(/[^\/]*([?#].*)?$/,'')}
  function autoSlug(){var a=first(F.yourName.value),b=first(F.partnerName.value),y=(F.weddingDate.value||'').slice(0,4);return slugify([a,b?'and':'',b,y].filter(Boolean).join(' '))||'our-registry'}
  function slug(){return slugify(F.regSlug.value)||autoSlug()}
  function link(){return base()+'registry.html?r='+slug()}
  function save(){jset(REG,{name:F.regName.value.trim(),slug:slug(),slugTouched:slugTouched,items:items,
    couple:[first(F.yourName.value),first(F.partnerName.value)].filter(Boolean).join(' & '),weddingDate:F.weddingDate.value,location:F.weddingLocation.value.trim(),updatedAt:Date.now()})}
  function preview(){if(!slugTouched)F.regSlug.value=autoSlug();
    var a=first(F.yourName.value),b=first(F.partnerName.value); F.regName.placeholder=(a&&b)?(a+' & '+b+'’s Registry'):'Emma & James’s Registry';
    $('[data-reg-link]').textContent=link().replace(/^https?:\/\//,'');}
  function render(){list.innerHTML='';
    items.forEach(function(it,i){var c=CATI[it.ref]||{};var r=el('div','reg-row');
      var th=el('div','thumb '+(c.art||'gg1'),c.em||'🎁');r.appendChild(th);
      var t=el('div','rr-t');t.appendChild(el('h5',null,it.name));t.appendChild(el('small',null,c.kind?({date:'Date plan',gift:'Gift',flower:'Flowers'}[c.kind]+' · '+money(c.guest)+' example'):(it.link?it.link.replace(/^https?:\/\//,''):'Custom item')));r.appendChild(t);
      r.appendChild(el('span','rr-q','× '+it.qty));
      var rm=el('button','rm');rm.type='button';rm.setAttribute('aria-label','Remove '+it.name);rm.innerHTML='<svg width="16" height="16"><use href="#trash"/></svg>';
      rm.addEventListener('click',function(){items.splice(i,1);save();render()});r.appendChild(rm);list.appendChild(r)});
    cnt.textContent=items.length+' item'+(items.length===1?'':'s');emp.hidden=items.length>0;}
  function qty(inp){var q=parseInt(inp.value,10);return Math.min(20,Math.max(1,isNaN(q)?1:q))}
  ['yourName','partnerName','weddingDate','weddingLocation','regName'].forEach(function(n){F[n].addEventListener('input',function(){preview();save()})});
  F.regSlug.addEventListener('input',function(){slugTouched=!!F.regSlug.value;var p=F.regSlug.selectionStart;F.regSlug.value=F.regSlug.value.toLowerCase().replace(/[^a-z0-9-]/g,'-');preview();save()});
  $('[data-reg-add]').addEventListener('click',function(){var id=$('[data-reg-pick]').value,c=CATI[id];if(!c)return;var q=qty($('[data-reg-qty]'));
    var ex=items.filter(function(x){return x.ref===id})[0]; if(ex)ex.qty=Math.min(20,ex.qty+q);else items.push({ref:id,name:c.name,qty:q});
    $('[data-reg-qty]').value=1;save();render();toast('Added '+c.name+' to your registry')});
  $('[data-cu-add]').addEventListener('click',function(){var n=$('[data-cu-name]').value.trim();if(!n){$('[data-cu-name]').focus();toast('Give your custom item a name');return}
    items.push({ref:'',name:n.slice(0,80),link:safeUrl($('[data-cu-link]').value),qty:qty($('[data-cu-qty]'))});
    $('[data-cu-name]').value='';$('[data-cu-link]').value='';$('[data-cu-qty]').value=1;save();render();toast('Added '+n+' to your registry')});
  $('[data-copy-link]').addEventListener('click',function(){var l=link();(navigator.clipboard?navigator.clipboard.writeText(l):Promise.reject()).then(function(){toast('Registry link copied')},function(){toast(l)})});
  // plan perk line
  var PL={sweetheart:['Sweetheart','9.99'],devoted:['Devoted','19.99'],forever:['Forever','39.99']};
  function perk(){var on=$('[data-plan].on',nw),k=on?on.getAttribute('data-plan'):'devoted';$('[data-nw-perk]').textContent=PL[k][0]+' · $0 today, then $'+PL[k][1]+'/mo (example)';return k}
  $$('[data-plan]',nw).forEach(function(c){c.addEventListener('click',perk)});
  // restore draft
  if(draft.name)F.regName.value=draft.name; if(slugTouched&&draft.slug)F.regSlug.value=draft.slug;
  preview();render();perk();
  nw.addEventListener('submit',function(e){e.preventDefault();var err=$('[data-nw-err]');
    var req=[['yourName','your name'],['partnerName','your spouse’s name'],['yourEmail','your email'],['weddingDate','your wedding date'],['password','a password']];
    var miss=req.filter(function(r){return !F[r[0]].value.trim()});
    if(miss.length){err.textContent='Almost there — please add '+miss.map(function(m){return m[1]}).join(', ')+'.';err.hidden=false;F[miss[0][0]].focus();return}
    err.hidden=true; var plan=perk();
    var g=function(n){return F[n].value.trim()};
    // Account record — the password is deliberately NOT stored anywhere.
    jset(ACCT,{yourName:g('yourName'),partnerName:g('partnerName'),yourEmail:g('yourEmail'),partnerEmail:g('partnerEmail'),phone:g('yourPhone'),weddingDate:g('weddingDate'),weddingLocation:g('weddingLocation'),plan:plan,perk:'newlywed-first-month-free (example)',createdAt:Date.now()});
    F.password.value='';
    var prof=loadProfile()||{};
    [['yourName','yourName'],['partnerName','partnerName'],['yourEmail','yourEmail'],['partnerEmail','partnerEmail'],['yourPhone','yourPhone'],['addr1','addr1'],['addr2','addr2'],['city','city'],['state','state'],['zip','zip']].forEach(function(m){prof[m[1]]=g(m[0])});
    prof.anniversary=g('weddingDate'); prof.country=prof.country||'United States'; prof.importantDates=prof.importantDates||[]; prof.savedAt=Date.now(); saveProfile(prof);
    if(!g('regName'))F.regName.value=F.regName.placeholder; save();
    setAuth({email:g('yourEmail'),via:'newlyweds'});
    toast('Welcome, newlyweds! Account created (test mode)');
    setTimeout(function(){location.href='home.html'},500);
  });
}

/* public registry page */
var rp=$('[data-registry]');
if(rp){
  var R=jget(REG), example=!(R&&R.items&&R.items.length);
  if(example)R={name:'Olivia & Noah’s Registry',couple:'Olivia & Noah',weddingDate:'2026-09-19',location:'Zion National Park, Utah',
    items:[{ref:'d-italian',name:'Candlelit Italian Night',qty:2},{ref:'f-2',name:'Blush Garden Roses',qty:1},{ref:'g-5',name:'Wedding-night star map',qty:1},{ref:'d-pottery',name:'Pottery for Two',qty:1},{ref:'',name:'Honeymoon sunset kayak tour',link:'',qty:1}]};
  var gifted=jget('stillTheOne.gifted.v1')||{};
  var months=['January','February','March','April','May','June','July','August','September','October','November','December'];
  $('[data-reg-title]').textContent=R.couple||R.name||'Our registry';
  $('[data-reg-eyebrow]').textContent=(R.name||'Wedding gift registry')+(example?' · example':'');
  var wd=R.weddingDate?new Date(R.weddingDate+'T00:00:00'):null;
  $('[data-reg-meta]').textContent=[wd&&!isNaN(wd)?('Married '+months[wd.getMonth()]+' '+wd.getDate()+', '+wd.getFullYear()):'',R.location||''].filter(Boolean).join(' · ')||'Wedding gift registry';
  $('[data-reg-example]').hidden=!example;
  var wrap=$('[data-reg-items]'), slugKey=(R.slug||'example')+':';
  function draw(){wrap.innerHTML='';
    R.items.forEach(function(it,i){var c=CATI[it.ref]||{}, key=slugKey+i, got=gifted[key]||0, left=Math.max(0,it.qty-got);
      var card=el('article','card reg-item'+(left?'':' done')); card.setAttribute('data-reg-item','');
      var art=el('div','ri-art '+(c.art||'gg1'));art.appendChild(el('span','ri-em',c.em||'🎁'));art.appendChild(el('span','tag',c.kind?({date:'Date night',gift:'Gift',flower:'Flowers'}[c.kind]):'Custom'));card.appendChild(art);
      var b=el('div','ri-body');b.appendChild(el('h4',null,it.name));
      b.appendChild(el('p','ri-sub',c.sub||(it.link?'Added by the couple':'Something special the couple asked for')));
      var m=el('div','ri-meta');m.appendChild(el('span','ri-q',left?('Wanted '+it.qty+' · '+got+' gifted'):'Fully gifted 💗'));
      if(c.guest){var p=el('span','ri-p',money(c.guest));p.appendChild(el('small',null,' example'));m.appendChild(p)}
      b.appendChild(m);
      var act=el('div','ri-act');
      if(it.link){var a=el('a','btn btn-ghost','View ↗');a.href=it.link;a.target='_blank';a.rel='noopener noreferrer';act.appendChild(a)}
      var gb=el('button','btn btn-primary',left?'Gift this':'Gifted');gb.type='button';gb.disabled=!left;gb.setAttribute('data-gift',i);
      gb.addEventListener('click',function(){gifted[key]=(gifted[key]||0)+1;jset('stillTheOne.gifted.v1',gifted);
        $('[data-gm-em]').textContent=c.em||'🎁';$('[data-gm-thumb]').textContent=c.em||'🎁';$('[data-gm-name]').textContent=it.name;
        $('[data-gm-price]').textContent=c.guest?(money(c.guest)+' · example price'):'Custom item · price set by the couple';
        $('[data-gm-left]').textContent=Math.max(0,it.qty-gifted[key])+' of '+it.qty;
        $('[data-gm-to]').textContent=(R.couple||'The couple')+' would be notified of your gift in a real launch.';
        $('#gift-modal').classList.add('open');draw()});
      act.appendChild(gb);b.appendChild(act);card.appendChild(b);wrap.appendChild(card)});}
  draw();
}

/* guest browse: jump seg */
$$('.br-jump a').forEach(function(a){a.addEventListener('click',function(){$$('.br-jump a').forEach(function(x){x.classList.toggle('on',x===a)})})});

/* guest checkout (TEST MODE: nothing is charged) */
var gc=$('[data-guest-checkout]');
if(gc){
  var it=CATI[new URLSearchParams(location.search).get('item')]||CAT[0];
  $$('[data-gc-name]').forEach(function(e){e.textContent=it.name});
  $$('[data-gc-sub]').forEach(function(e){e.textContent=({date:'Date plan',gift:'Gift',flower:'Flowers'}[it.kind])+' · '+it.sub});
  $$('[data-gc-thumb]').forEach(function(e){e.textContent=it.em;e.className='sum-ico gc-thumb '+it.art});
  $$('[data-gc-guest]').forEach(function(e){e.textContent=money(it.guest)});
  $$('[data-gc-member]').forEach(function(e){e.textContent=money(it.member)});
  $$('[data-gc-save]').forEach(function(e){e.textContent=it.save});
  var gm='card';
  function setG(m){gm=m;$$('[data-method]',gc).forEach(function(b){b.classList.toggle('on',b.getAttribute('data-method')===m)});$$('[data-method-panel]',gc).forEach(function(p){p.hidden=p.getAttribute('data-method-panel')!==m})}
  $$('[data-method]',gc).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();setG(b.getAttribute('data-method'))})});
  var gcn=$('#co-card',gc); if(gcn)gcn.addEventListener('input',function(){gcn.value=gcn.value.replace(/\D/g,'').slice(0,19).replace(/(\d{4})(?=\d)/g,'$1 ')});
  var gex=$('#co-exp',gc); if(gex)gex.addEventListener('input',function(){var v=gex.value.replace(/\D/g,'').slice(0,4);gex.value=v.length>2?v.slice(0,2)+' / '+v.slice(2):v});
  $$('[data-pay]',gc).forEach(function(b){b.addEventListener('click',function(e){e.preventDefault();var via=b.getAttribute('data-pay');if(via==='form')via=gm;
    var label={card:'Card',bank:'Bank account (ACH)',applepay:'Apple Pay',paypal:'PayPal'}[via];
    if(via==='card'&&gcn){var d=gcn.value.replace(/\D/g,'');if(d.length>=4)label='Card ···· '+d.slice(-4)}
    $$('input[data-sensitive]',gc).forEach(function(i){i.value=''});
    $('[data-om-em]').textContent=it.em;$('[data-om-thumb]').textContent=it.em;$('[data-om-name]').textContent=it.name;
    $('[data-om-price]').textContent=money(it.guest)+' guest price · example (members '+money(it.member)+')';
    $('[data-om-method]').textContent=label;$('[data-om-save]').textContent=it.save;
    $('#order-modal').classList.add('open')})});
  setG('card');
}
})();
