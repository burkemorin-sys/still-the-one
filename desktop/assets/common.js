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
})();
