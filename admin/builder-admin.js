(function(){
  const SITE='https://benvordigital.com';

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
  function openLive(){window.open(SITE+livePath(),'_blank','noopener')}
  async function copyLive(){
    const url=SITE+livePath();
    try{await navigator.clipboard.writeText(url);toast('Live URL copied')}catch(e){prompt('Copy live URL:',url)}
  }
  function toast(text){
    let t=q('#benvor-builder-toast');
    if(!t){t=document.createElement('div');t.id='benvor-builder-toast';document.body.appendChild(t)}
    t.textContent=text;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1600);
  }
  function findPreviewIframe(){
    return qa('iframe').filter(x=>{
      const r=x.getBoundingClientRect();return r.width>200&&r.height>200;
    }).sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
  }
  function setViewport(mode){
    const iframe=findPreviewIframe();
    if(!iframe){toast('Open the editor preview first');return}
    const widths={desktop:'100%',tablet:'820px',mobile:'390px'};
    iframe.style.width=widths[mode]||'100%';
    iframe.style.maxWidth=widths[mode]||'100%';
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
    setTimeout(()=>visible.classList.remove('benvor-group-highlight'),1100);
  }
  function go(hash){location.hash=hash}
  function makeButton(text,handler,attrs={}){
    const b=document.createElement('button');b.type='button';b.textContent=text;
    Object.entries(attrs).forEach(([k,v])=>b.dataset[k]=v);
    b.addEventListener('click',handler);return b;
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
    ['CONTENT','LAYOUT','DESIGN','RESPONSIVE','ADVANCED'].forEach(x=>{
      tabs.appendChild(makeButton(x,()=>jumpGroup(x)));
    });
    bar.appendChild(tabs);

    const viewport=document.createElement('div');viewport.className='builder-viewports';
    viewport.append(
      makeButton('Desktop',()=>setViewport('desktop'),{builderViewport:'desktop'}),
      makeButton('Tablet',()=>setViewport('tablet'),{builderViewport:'tablet'}),
      makeButton('Mobile',()=>setViewport('mobile'),{builderViewport:'mobile'})
    );
    bar.appendChild(viewport);

    document.body.appendChild(bar);
  }
  function addEditorTip(){
    if(q('.benvor-builder-tip'))return;
    const pane=q('[class*="ControlPaneContainer"]');
    if(!pane)return;
    const tip=document.createElement('div');tip.className='benvor-builder-tip';
    tip.innerHTML='<strong>Page Builder:</strong> drag blocks to reorder. Open any block and use <b>CONTENT</b>, <b>LAYOUT</b>, <b>DESIGN</b>, <b>RESPONSIVE</b>, or <b>ADVANCED</b>. Use the bottom toolbar for live-page links and desktop/tablet/mobile preview.';
    pane.prepend(tip);
  }
  function updateRouteBadge(){
    const r=route(), brand=q('#benvor-builder-toolbar .builder-brand span');
    if(!brand)return;
    const label=r.collection?`${r.collection.replaceAll('_',' ')}${r.slug?' / '+r.slug:''}`:'Advanced Decap Page Builder';
    brand.textContent=label;
  }

  window.addEventListener('load',()=>{
    buildToolbar();
    addEditorTip();
    updateRouteBadge();
    const obs=new MutationObserver(()=>{buildToolbar();addEditorTip();updateRouteBadge()});
    obs.observe(document.body,{subtree:true,childList:true});
    window.addEventListener('hashchange',updateRouteBadge);

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
  });
})();