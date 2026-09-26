
const $$=(s)=>[...document.querySelectorAll(s)];
const $=(s)=>document.querySelector(s);

const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.12});
$$('.reveal').forEach(el=>observer.observe(el));

const page=location.pathname.split('/').pop()||'index.html';
$$('[data-nav]').forEach(a=>{if(a.getAttribute('href')===page)a.classList.add('active')});

$$('[data-local-save]').forEach(form=>form.addEventListener('submit',e=>{
 e.preventDefault();
 const key=form.dataset.localSave;
 const data=Object.fromEntries(new FormData(form).entries());
 localStorage.setItem(key,JSON.stringify(data));
 const ok=form.querySelector('.success')||form.parentElement.querySelector('.success'); if(ok)ok.classList.add('show');
 form.reset();
}));

const homeSearch=$('#homeSearch');
if(homeSearch){homeSearch.addEventListener('submit',e=>{e.preventDefault();const data=Object.fromEntries(new FormData(homeSearch).entries());localStorage.setItem('matchpaws_search',JSON.stringify(data));location.href='matching.html';});}

const stepLinks=$$('.step-link'), panes=$$('.step-pane'), fill=$('.progress>div');
const state={pet:'',temperament:'',service:'',priority:'routine'};
function openStep(n){stepLinks.forEach(x=>x.classList.toggle('active',x.dataset.step==n));panes.forEach(x=>x.classList.toggle('active',x.dataset.step==n));if(fill)fill.style.width=`${n*25}%`;}
stepLinks.forEach(x=>x.addEventListener('click',()=>openStep(+x.dataset.step)));
$$('[data-next]').forEach(x=>x.addEventListener('click',()=>openStep(+x.dataset.next)));
$$('[data-prev]').forEach(x=>x.addEventListener('click',()=>openStep(+x.dataset.prev)));
$$('[data-answer]').forEach(x=>x.addEventListener('click',()=>{const g=x.dataset.group;state[g]=x.dataset.answer;x.parentElement.querySelectorAll('.option').forEach(y=>y.classList.remove('selected'));x.classList.add('selected');}));
const calc=$('#calcMatch');
if(calc){calc.addEventListener('click',()=>{
 const out=$('#matchResult'); if(!state.pet||!state.temperament||!state.service){out.innerHTML='<div class="inline-note">Complète les trois premières étapes pour obtenir une recommandation.</div>';return;}
 const profiles=[
  {name:'Léa',emoji:'👩🏻‍🦰',score:96,good:'animaux sensibles, routines et visites rassurantes',tags:['Routine','Photos','Approche douce']},
  {name:'Yanis',emoji:'👨🏽',score:94,good:'chiens actifs, promenades et dépense physique',tags:['Balades','Actif','Week-end']},
  {name:'Camille',emoji:'👩🏼',score:95,good:'chats, visites à domicile et consignes précises',tags:['Chats','Domicile','Organisation']}
 ];
 let p=profiles[0];if(state.temperament==='énergique'||state.temperament==='joueur'||state.service==='promenade')p=profiles[1];if(state.pet==='chat'||state.service==='visite')p=profiles[2];
 out.innerHTML=`<div class="result"><span class="eyebrow">Compatibilité indicative ${p.score}%</span><h3 style="margin-top:14px">${p.emoji} Profil recommandé : ${p.name}</h3><p class="muted">Particulièrement adapté aux ${p.good}.</p><div class="tag-row">${p.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div><ul><li>Le matching est une démonstration front-end.</li><li>En production, disponibilité, distance, vérifications, avis et préférences enrichiront le score.</li></ul></div>`;
 localStorage.setItem('matchpaws_quiz_v3',JSON.stringify(state));openStep(4);
 });}

const estimator=$('#estimator');
if(estimator){estimator.addEventListener('input',()=>{
 const service=$('#estService').value, qty=Number($('#estQty').value||1), output=$('#estimateValue');
 const prices={walk:19,visit:25,home:49,zen:129}; const labels={walk:'promenade',visit:'visite',home:'garde à domicile',zen:'abonnement'};
 output.textContent=service==='zen'?`${prices[service]} € / mois`:`≈ ${prices[service]*qty} € pour ${qty} ${labels[service]}${qty>1?'s':''}`;
 });}

const year=$('#year');if(year)year.textContent=new Date().getFullYear();
