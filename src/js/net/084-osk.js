//# net/084-osk.js: the on-screen keyboard for pads
/* ---- on-screen keyboard: letters and numbers for the name boxes and the room code, for a pad or a touch screen with
   no keyboard of its own. The ⌨ button beside a box opens it, and so does pressing A on the box with a pad. ---- */
const osk={el:null,caps:true,from:null};
function oskDraw(){const name=osk.el.dataset.osk==='name',rows=['1234567890','QWERTYUIOP','ASDFGHJKL','ZXCVBNM'],K=$('oskKeys');
  K.innerHTML=rows.map(r=>'<div class="oskrow">'+[...r].map(c=>{const ch=/[A-Z]/.test(c)&&!osk.caps?c.toLowerCase():c;return`<button class="btn" data-k="${ch}">${ch}</button>`}).join('')+'</div>').join('')+
    '<div class="oskrow">'+(name?`<button class="btn" data-k="caps">${osk.caps?'abc':'ABC'}</button><button class="btn wide" data-k=" ">Space</button>`:'')+'<button class="btn" data-k="del">⌫</button><button class="btn go wide" data-k="done" data-back>Done</button></div>';
  K.querySelectorAll('[data-k]').forEach(b=>b.onclick=()=>oskKey(b.dataset.k));$('oskTxt').textContent=osk.el.value}
function oskKey(k){const e=osk.el,max=+e.maxLength>0?+e.maxLength:12;if(k==='done')return oskClose();
  if(k==='caps'){osk.caps=!osk.caps;const f=document.activeElement&&document.activeElement.dataset.k;oskDraw();const b=f&&$('oskKeys').querySelector(`[data-k="${f==='caps'?'caps':f}"]`);if(b&&lastDev==='pad')navFocus(b);return}
  let v=e.value;if(k==='del')v=v.slice(0,-1);else if(v.length<max&&!(k===' '&&(!v||v.endsWith(' '))))v+=e.dataset.osk==='code'?k.toUpperCase():k;
  if(v!==e.value){e.value=v;e.dispatchEvent(new Event('input',{bubbles:true}))}$('oskTxt').textContent=v}
function oskOpen(e){if(!e)return;osk.el=e;osk.caps=e.dataset.osk==='code'||!e.value;const lb=document.querySelector(`label[for="${e.id}"]`);$('oskLbl').textContent=lb?lb.textContent:'Name';oskDraw();$('osk').hidden=false;
  try{e.blur()}catch(_){}if(lastDev==='pad'||lastDev==='key')setTimeout(()=>{const b=$('oskKeys').querySelector('[data-k="done"]');if(b)navFocus(b)},0)}
function oskClose(){const e=osk.el;$('osk').hidden=true;if(!e)return;osk.el=null;e.dispatchEvent(new Event('change',{bubbles:true}));const b=document.querySelector(`[data-osk-for="${e.id}"]`);if(b&&lastDev!=='touch')navFocus(b)}
document.querySelectorAll('[data-osk-for]').forEach(b=>b.onclick=()=>oskOpen($(b.dataset.oskFor)));
