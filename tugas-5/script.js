(function(){
 document.documentElement.classList.add('js');
 var t=document.querySelector('.nav-toggle'),m=document.getElementById('menu');
 function set(o){m.classList.toggle('open',o);t.setAttribute('aria-expanded',o)}
 t.addEventListener('click',function(e){e.stopPropagation();set(!m.classList.contains('open'))});
 document.addEventListener('click',function(e){if(!m.contains(e.target))set(false)});
 document.addEventListener('keydown',function(e){if(e.key==='Escape')set(false)});
 m.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){set(false)})});
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.12});
 document.querySelectorAll('.reveal').forEach(function(el){io.observe(el)});
 var pb=document.querySelector('.progress'),tp=document.querySelector('.totop');
 var links=[].slice.call(document.querySelectorAll('[data-nav]')),secs=links.map(function(a){return document.querySelector(a.getAttribute('href'))});
 function onS(){
  var h=document.documentElement,y=h.scrollTop||document.body.scrollTop,max=h.scrollHeight-h.clientHeight;
  pb.style.width=(max>0?y/max*100:0)+'%';tp.classList.toggle('show',y>600);
  var cur=-1;secs.forEach(function(s,i){if(s&&s.getBoundingClientRect().top<160)cur=i});
  links.forEach(function(a,i){a.classList.toggle('on',i===cur)});
 }
 window.addEventListener('scroll',onS,{passive:true});onS();
 tp.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'})});

 /* peta rute */
 var pins=[].slice.call(document.querySelectorAll('.pin')),panes=[].slice.call(document.querySelectorAll('.pane')),panel=document.getElementById('panel'),hint=document.getElementById('hint'),prev=document.getElementById('prev'),next=document.getElementById('next'),cur=-1;
 function pick(i){
  cur=i;hint.hidden=true;panel.classList.add('has');
  panes.forEach(function(p,k){p.hidden=k!==i});
  pins.forEach(function(p,k){p.classList.toggle('on',k===i);p.setAttribute('aria-pressed',k===i)});
  prev.disabled=i===0;next.disabled=i===panes.length-1;
 }
 pins.forEach(function(p,i){p.addEventListener('click',function(){pick(i)})});
 prev.addEventListener('click',function(){if(cur>0)pick(cur-1)});
 next.addEventListener('click',function(){if(cur<panes.length-1)pick(cur+1)});
})();
/* putar 360 */
(function(){
 var box=document.querySelector('.spinbox');if(!box)return;
 var img=box.querySelector('.spin'),N=36,cur=0,acc=0,drag=false,x0=0,hov=false,last=0;
 var pre=[];for(var i=0;i<N;i++){var im=new Image();im.src='assets/spin/r'+(i<10?'0':'')+i+'.webp';pre.push(im)}
 function show(i){cur=((i%N)+N)%N;img.src=pre[cur].src}
 box.addEventListener('pointerdown',function(e){drag=true;x0=e.clientX;acc=cur;box.classList.add('drag');try{box.setPointerCapture(e.pointerId)}catch(_){}});
 box.addEventListener('pointermove',function(e){if(!drag)return;show(Math.round(acc-(e.clientX-x0)/8))});
 function up(){drag=false;box.classList.remove('drag')}
 box.addEventListener('pointerup',up);box.addEventListener('pointercancel',up);
 box.addEventListener('mouseenter',function(){hov=true});box.addEventListener('mouseleave',function(){hov=false});
 if(!matchMedia('(prefers-reduced-motion:reduce)').matches){
  (function tick(t){if(!drag&&!hov&&t-last>110){last=t;show(cur+1)}requestAnimationFrame(tick)})(0);
 }
})();
