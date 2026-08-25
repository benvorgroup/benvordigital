
(function(){
  function initReveal(){
    const targets=[...document.querySelectorAll(
      '#page-home > section, .page-hero, .service-card, .p-card, .value-card, .testi-card, .selected-work-card'
    )];
    targets.forEach((el,i)=>{
      if(el.closest('header,footer')) return;
      el.classList.add('premium-reveal');
      el.style.transitionDelay = `${Math.min((i%4)*55,165)}ms`;
    });
    if(!('IntersectionObserver' in window)){
      targets.forEach(x=>x.classList.add('is-visible')); return;
    }
    const io=new IntersectionObserver(entries=>{
      entries.forEach(e=>{
        if(e.isIntersecting){e.target.classList.add('is-visible');io.unobserve(e.target);}
      });
    },{threshold:.08,rootMargin:'0px 0px -30px 0px'});
    targets.forEach(x=>io.observe(x));
  }
  function heroParallax(){
    const card=document.querySelector('#page-home .chart-card');
    if(!card || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    card.addEventListener('mousemove',e=>{
      const r=card.getBoundingClientRect();
      const x=(e.clientX-r.left)/r.width-.5;
      const y=(e.clientY-r.top)/r.height-.5;
      card.style.transform=`translateY(-4px) perspective(900px) rotateY(${x*2.5}deg) rotateX(${-y*2.5}deg)`;
    });
    card.addEventListener('mouseleave',()=>card.style.transform='');
  }
  function testimonialWheel(){
    const row=document.getElementById('home-testimonials-grid');
    if(!row) return;
    row.addEventListener('wheel',e=>{
      if(Math.abs(e.deltaY)>Math.abs(e.deltaX) && window.innerWidth>700){
        e.preventDefault();
        row.scrollBy({left:e.deltaY,behavior:'smooth'});
      }
    },{passive:false});
  }
  function run(){
    initReveal();
    heroParallax();
    testimonialWheel();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>setTimeout(run,80));
  else setTimeout(run,80);
})();
