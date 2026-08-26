(function(){
  'use strict';
  const SITE='https://benvordigital.com';
  let initialized=false;
  let tipTimer=null;
  let tipAttempts=0;

  function q(sel,root=document){return root.querySelector(sel)}
  function qa(sel,root=document){return Array.from(root.querySelectorAll(sel))}
  function route(){
    const h=location.hash||'';
    const m=h.match(/#\/collections\/([^/]+)(?:\/entries\/([^/?]+)|\/new)?/);
    return {collection:m?m[1]:'',slug:m&&m[2]?decodeURIComponent(m[2]):''};
  }
  function livePath(){
    const r=route(),slug=r.slug;
    if(r.collection==='pages'){
      if(slug==='home') return '/';
      if(['about','services','portfolio','contact'].includes(slug)) return `/${slug}/`;
      return slug?`/page/?slug=${encodeURIComponent(slug)}`:'/';
    }
    if(r.collection==='landing_pages') return slug?`/landing/?slug=${encodeURIComponent(slug)}`:'/landing/';
    if(r.collection==='services') return slug?`/service/?slug=${encodeURIComponent(slug)}`:'/services/';
    if(r.collection==='projects') return slug?`/project/?slug=${encodeURIComponent(slug)}`:'/portfolio/';
    if(r.collection==='insights') return slug?`/insight/?slug=${encodeURIComponent(slug)}`:'/blog/';
    return '/';
  }
  function toast(text){
    let t=q('#benvor-builder-toast');
    if(!t){t=document.createElement('div');t.id='benvor-builder-toast';document.body.appendChild(t)}
    if(t.textContent!==text)t.textContent=text;
    t.classList.add('show');
    clearTimeout(t._hideTimer);
    t._hideTimer=setTimeout(()=>t.classList.remove('show'),1600);
  }
  function openLive(){window.open(SITE+livePath(),'_blank','noopener')}
  async function copyLive(){
    const url=SITE+livePath();
    try{await navigator.clipboard.writeText(url);toast('Live URL copied')}
    catch(e){window.prompt('Copy live URL:',url)}
  }
  function findPreviewIframe(){
    return qa('iframe').filter(x=>{
      const r=x.getBoundingClientRect();return r.width>200&&r.height>200;
    }).sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
  }
  function setViewport(mode){
    const iframe=findPreviewIframe();
    if(!iframe){toast('Open an entry with preview first');return}
    const widths={desktop:'100%',tablet:'820px',mobile:'390px'};
    const width=widths[mode]||'100%';
    iframe.style.width=width;
    iframe.style.maxWidth=width;
    iframe.style.margin='0 auto';
    iframe.style.display='block';
    qa('[data-builder-viewport]').forEach(b=>b.classList.toggle('active',b.dataset.builderViewport===mode));
    toast(`${mode[0].toUpperCase()+mode.slice(1)} preview`);
  }
  function jumpGroup(label){
    const candidates=qa('div,span,label,button,h2,h3,h4').filter(el=>el.textContent.trim()===label);
    const visible=candidates.find(el=>el.offsetParent!==null);
    if(!visible){toast(`Open a section to edit ${label.toLowerCase()}`);return}
    visible.scrollIntoView({behavior:'smooth',block:'center'});
    visible.classList.add('benvor-group-highlight');
    setTimeout(()=>visible.classList.remove('benvor-group-highlight'),1000);
  }
  function go(hash){location.hash=hash}
  function makeButton(text,handler,attrs={}){
    const b=document.createElement('button');
    b.type='button';b.textContent=text;
    Object.entries(attrs).forEach(([k,v])=>b.dataset[k]=v);
    b.addEventListener('click',handler);
    return b;
  }
  function updateRouteBadge(){
    const brand=q('#benvor-builder-toolbar .builder-brand span');
    if(!brand)return;
    const r=route();
    const next=r.collection?`${r.collection.replaceAll('_',' ')}${r.slug?' / '+r.slug:''}`:'Advanced Decap Page Builder';
    if(brand.textContent!==next) brand.textContent=next;
  }
  function buildToolbar(){
    if(q('#benvor-builder-toolbar'))return;
    const bar=document.createElement('div');bar.id='benvor-builder-toolbar';

    const brand=document.createElement('div');brand.className='builder-brand';
    brand.innerHTML='<strong>BENVOR BUILDER</strong><span>Advanced Decap Page Builder</span>';
    bar.appendChild(brand);

    const quick=document.createElement('div');quick.className='builder-actions';
    quick.append(
      makeButton('+ Page',()=>go('#/collections/pages/new')),
      makeButton('+ Landing',()=>go('#/collections/landing_pages/new')),
      makeButton('Live Page',openLive),
      makeButton('Copy URL',copyLive)
    );
    bar.appendChild(quick);

    const tabs=document.createElement('div');tabs.className='builder-tabs';
    ['CONTENT','LAYOUT','DESIGN','RESPONSIVE','ADVANCED'].forEach(x=>tabs.appendChild(makeButton(x,()=>jumpGroup(x))));
    bar.appendChild(tabs);

    const viewport=document.createElement('div');viewport.className='builder-viewports';
    viewport.append(
      makeButton('Desktop',()=>setViewport('desktop'),{builderViewport:'desktop'}),
      makeButton('Tablet',()=>setViewport('tablet'),{builderViewport:'tablet'}),
      makeButton('Mobile',()=>setViewport('mobile'),{builderViewport:'mobile'})
    );
    bar.appendChild(viewport);
    document.body.appendChild(bar);
    updateRouteBadge();
  }
  function tryAddEditorTip(){
    if(q('.benvor-builder-tip')){if(tipTimer)clearInterval(tipTimer);return}
    tipAttempts++;
    const pane=q('[class*="ControlPaneContainer"]');
    if(pane){
      const tip=document.createElement('div');tip.className='benvor-builder-tip';
      tip.innerHTML='<strong>Page Builder:</strong> drag blocks to reorder. Open a block and use <b>CONTENT</b>, <b>LAYOUT</b>, <b>DESIGN</b>, <b>RESPONSIVE</b>, or <b>ADVANCED</b>. Use the toolbar for live-page links and responsive preview.';
      pane.prepend(tip);
      if(tipTimer)clearInterval(tipTimer);
    } else if(tipAttempts>=20 && tipTimer){
      clearInterval(tipTimer);
    }
  }
  function init(){
    if(initialized)return;
    initialized=true;
    // Let Decap own startup; the builder UI is deliberately delayed.
    setTimeout(buildToolbar,1200);
    setTimeout(()=>{
      tryAddEditorTip();
      tipTimer=setInterval(tryAddEditorTip,750);
    },1800);

    window.addEventListener('hashchange',()=>{
      updateRouteBadge();
      tipAttempts=0;
      if(tipTimer)clearInterval(tipTimer);
      tipTimer=setInterval(tryAddEditorTip,750);
    });

    document.addEventListener('keydown',e=>{
      if(!e.altKey)return;
      const key=e.key.toLowerCase();
      const groups={'1':'CONTENT','2':'LAYOUT','3':'DESIGN','4':'RESPONSIVE','5':'ADVANCED'};
      if(groups[key]){e.preventDefault();jumpGroup(groups[key])}
      if(key==='d'){e.preventDefault();setViewport('desktop')}
      if(key==='t'){e.preventDefault();setViewport('tablet')}
      if(key==='m'){e.preventDefault();setViewport('mobile')}
      if(key==='l'){e.preventDefault();openLive()}
    });
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
