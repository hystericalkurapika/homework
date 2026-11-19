(function(){'use strict';
var $=function(s,r){return(r||document).querySelector(s)},$$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
var bar=$('.progress i'),totop=$('.totop'),links=$$('[data-nav]').map(function(a){return{a:a,el:document.getElementById(a.dataset.nav)}});
var tick=false;
function upd(){var h=document.documentElement,max=h.scrollHeight-h.clientHeight;bar.style.setProperty('--p',(max>0?h.scrollTop/max:0).toFixed(4));totop.classList.toggle('show',h.scrollTop>600);
 var probe=window.scrollY+160,cur=null;links.forEach(function(t){if(t.el&&t.el.getBoundingClientRect().top+window.scrollY<=probe)cur=t});
 links.forEach(function(t){t.a.classList.toggle('active',t===cur)});tick=false}
function on(){if(!tick){tick=true;requestAnimationFrame(upd)}}
addEventListener('scroll',on,{passive:true});addEventListener('resize',on);upd();
totop.addEventListener('click',function(){scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})});

var tg=$('.nav-toggle'),menu=$('#menu');
function setMenu(o){menu.classList.toggle('open',o);tg.setAttribute('aria-expanded',o);tg.setAttribute('aria-label',o?'Tutup menu':'Buka menu')}
tg.addEventListener('click',function(){setMenu(!menu.classList.contains('open'))});
$$('a',menu).forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});
addEventListener('keydown',function(e){if(e.key==='Escape')setMenu(false)});
document.addEventListener('click',function(e){if(menu.classList.contains('open')&&!e.target.closest('.nav'))setMenu(false)});

var rv=$$('.reveal');
if('IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}})},{threshold:.08});rv.forEach(function(el){io.observe(el)})}else rv.forEach(function(el){el.classList.add('in')});

/* pita film */
var reel=$('.reel');
function step(d){var w=$('.cell',reel).offsetWidth;reel.scrollBy({left:d*w,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})}
$('.rbtn.prev').addEventListener('click',function(){step(-1)});$('.rbtn.next').addEventListener('click',function(){step(1)});
var drag=false,sx=0,sl=0;
reel.addEventListener('pointerdown',function(e){if(e.pointerType!=='mouse')return;drag=true;sx=e.clientX;sl=reel.scrollLeft;reel.style.scrollSnapType='none'});
addEventListener('pointermove',function(e){if(drag)reel.scrollLeft=sl-(e.clientX-sx)});
addEventListener('pointerup',function(){if(drag){drag=false;reel.style.scrollSnapType=''}});
reel.addEventListener('keydown',function(e){if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)});

/* kamar interaktif */
var D={
lampu:{t:'Context-Aware',h:'Lampu pintar',p:'Lampu menyala saat ruangan terpakai dan menyesuaikan diri dengan situasi sekitarnya lewat sensor. Kita tidak menekan apa-apa, ruangannya yang menyesuaikan.',s:['Arm','https://www.arm.com/glossary/ubiquitous-computing']},
speaker:{t:'Natural Interface',h:'Asisten suara',p:'Kita cukup berbicara untuk menyalakan musik atau menanyakan sesuatu, tanpa keyboard dan mouse. Pengenalan suara adalah contoh <em>natural interface</em>.',s:['Arm','https://www.arm.com/glossary/ubiquitous-computing']},
tablet:{t:'Contoh klasik · 1992',h:'InfoPad',p:'Proyek UC Berkeley ini berupa perangkat portabel nirkabel dengan layar LCD dan stylus, lalu dikembangkan dengan pengenalan suara. Pemrosesan dan penyimpanan dilakukan di server, sedangkan perangkatnya hanya menerima input dan menampilkan output.',s:['BINUS','https://socs.binus.ac.id/2018/12/20/apa-itu-ubiquitous-computing/']},
jam:{t:'Context-Aware + Micro',h:'Jam tangan pintar',p:'<em>Wearable</em> membawa sensor yang terus membaca konteks penggunanya, seperti gerak, lalu mengirim notifikasi atau menyesuaikan layanan tanpa kita membuka aplikasi apa pun.',s:['Arm','https://www.arm.com/glossary/ubiquitous-computing']},
kartu:{t:'Micro-Nano',h:'Kartu RFID (e-toll, akses gedung)',p:'Chip RFID yang sangat kecil di dalam kartu pintar bisa dibaca hanya dengan menempelkannya, misalnya untuk membayar tol atau membuka akses gedung. Pengguna hampir tidak merasa sedang “mengoperasikan komputer”.',s:['Materi kuliah &amp; Scribd','https://www.scribd.com/document/349234928/53069882-UBIQUITOUS-COMPUTING-docx']},
ac:{t:'Smart environment',h:'Peralatan rumah pintar',p:'Lampu, kamera, dan peralatan rumah yang saling terhubung dapat mengatur rutinitas otomatis di rumah, kantor, bahkan kota. Inilah gambaran <em>smart environment</em>.',s:['Arm','https://www.arm.com/glossary/ubiquitous-computing']}};
var info=$('#info');
function pick(k){var d=D[k];if(!d)return;
 info.innerHTML='<span class="tag">'+d.t+'</span><h3>'+d.h+'</h3><p>'+d.p+'</p>';
 $$('.hot,.chips button').forEach(function(b){b.classList.toggle('on',b.dataset.k===k)})}
$$('.hot,.chips button').forEach(function(b){b.addEventListener('click',function(){pick(b.dataset.k)})});
pick('lampu');
})();
