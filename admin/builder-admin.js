(function(){
  'use strict';

  const SITE='https://benvordigital.com';
  const GITHUB='https://github.com/benvorgroup/benvordigital';
  const PAGE_LINKS=[
    ['Home','home'],['About','about'],['Services','services'],['Portfolio','portfolio'],['Contact','contact']
  ];
  const BLOCKS=[
    ['hero_dashboard','Hero + Analytics Dashboard','Hero'],['hero_lead_form','Hero + Lead Form','Hero'],['page_hero','Page Hero','Hero'],
    ['trust_stats','Trusted Brands + Stats','Trust'],['problem_nav','Problem-Based Navigation','Navigation'],['services_grid','Services Grid','Services'],
    ['selected_work','Selected Work','Case Studies'],['portfolio_grid','Portfolio Grid','Case Studies'],['comparison','Agency Comparison','Conversion'],
    ['process','Process','Content'],['growth_score','Interactive Growth Score','Conversion'],['testimonials','Testimonials Carousel','Trust'],
    ['local_credibility','Local Credibility','Trust'],['faq','FAQ','Content'],['dual_cta','Dual Lead CTA','CTA'],['cta','CTA','CTA'],
    ['why_benvor','Why Benvor / Feature Columns','Features'],['about_preview','About Preview','Content'],['image_text','Image + Text','Content'],
    ['stats','Stats','Trust'],['team','Team','Content'],['contact_split','Contact Form + Details','Forms'],['rich_text','Rich Text','Content'],
    ['gallery','Gallery','Media'],['flex_cards','Flexible Cards','Features'],['divider','Divider','Utility'],['spacer','Spacer','Utility']
  ];
  const TEMPLATE_RECIPES=[
    ['service-page','Service Page'],['landing-page','Landing Page'],['case-study','Case Study'],['about-page','About Page'],
    ['contact-page','Contact Page'],['lead-generation-page','Lead Generation Page'],['blank-page','Blank Page']
  ];
  const state={sections:[],selected:-1,settingsCollapsed:false,developer:false,lastRoute:'',autoSaveAt:0,dirty:false};
  let initialized=false;

  const q=(sel,root=document)=>root.querySelector(sel);
  const qa=(sel,root=document)=>Array.from(root.querySelectorAll(sel));
  const visible=el=>!!(el&&el.offsetParent!==null);
  const clean=s=>String(s||'').replace(/\s+/g,' ').trim();

  function route(){
    const h=location.hash||'';
    const m=h.match(/#\/collections\/([^/]+)(?:\/entries\/([^/?]+)|\/new)?/);
    return {collection:m?m[1]:'',slug:m&&m[2]?decodeURIComponent(m[2]):'',hash:h};
  }
  function isPageEditor(){
    const r=route();
    return ['pages','landing_pages'].includes(r.collection) && (/\/entries\//.test(r.hash)||/\/new/.test(r.hash));
  }
  function currentFile(){
    const r=route();
    if(!r.slug)return '';
    const map={pages:'content/pages',landing_pages:'content/landing-pages',services:'content/services',projects:'content/projects',insights:'content/insights',forms:'content/forms',media_assets:'content/media-assets',templates:'content/templates'};
    return map[r.collection]?`${map[r.collection]}/${r.slug}.json`:'';
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
    t._hideTimer=setTimeout(()=>t.classList.remove('show'),1800);
  }
  function setStatus(text,tone='neutral'){
    const el=q('#benvor-save-status');
    if(!el)return;
    el.textContent=text;
    el.dataset.tone=tone;
  }
  function go(hash){location.hash=hash}
  function openLive(){window.open(SITE+livePath(),'_blank','noopener')}
  function openHistory(){
    const file=currentFile();
    window.open(file?`${GITHUB}/commits/main/${file}`:`${GITHUB}/commits/main`,'_blank','noopener');
  }
  async function copyLive(){
    const url=SITE+livePath();
    try{await navigator.clipboard.writeText(url);toast('Live URL copied')}
    catch(e){window.prompt('Copy live URL:',url)}
  }
  function findPreviewIframe(){
    return qa('iframe').filter(x=>{const r=x.getBoundingClientRect();return r.width>240&&r.height>240}).sort((a,b)=>b.getBoundingClientRect().width-a.getBoundingClientRect().width)[0];
  }
  function findControlPane(){
    return qa('[class*="ControlPaneContainer"]').find(visible)||null;
  }
  function setViewport(mode){
    const iframe=findPreviewIframe();
    if(!iframe){toast('Open a page entry to use responsive preview');return}
    const widths={desktop:'100%',laptop:'1180px',tablet:'820px',mobile:'390px'};
    const width=widths[mode]||'100%';
    iframe.style.width=width;iframe.style.maxWidth=width;iframe.style.margin='0 auto';iframe.style.display='block';
    qa('[data-builder-viewport]').forEach(b=>b.classList.toggle('active',b.dataset.builderViewport===mode));
    toast(`${mode[0].toUpperCase()+mode.slice(1)} preview`);
  }
  function settingsCollapsed(on){
    const pane=findControlPane();
    state.settingsCollapsed=typeof on==='boolean'?on:!state.settingsCollapsed;
    document.body.classList.toggle('benvor-settings-collapsed',state.settingsCollapsed);
    const btn=q('#benvor-settings-toggle');
    if(btn){btn.setAttribute('aria-pressed',String(state.settingsCollapsed));btn.textContent=state.settingsCollapsed?'Show Settings':'Hide Settings'}
    if(pane){
      if(state.settingsCollapsed){pane.dataset.benvorDisplay=pane.style.display||'';pane.style.display='none'}
      else pane.style.display=pane.dataset.benvorDisplay||'';
    }
    if(!state.settingsCollapsed)setTimeout(()=>jumpGroup('CONTENT',false),80);
  }
  function ensureSettingsOpen(){if(state.settingsCollapsed)settingsCollapsed(false)}

  function findExactText(label,root=document){
    const target=clean(label).toLowerCase();
    return qa('button,[role="button"],label,span,div,h2,h3,h4',root).filter(visible).find(el=>clean(el.textContent).toLowerCase()===target);
  }
  function jumpGroup(label,notify=true){
    if(label==='ADVANCED'&&!state.developer){toast('Enable Developer Mode to open Advanced controls');return}
    ensureSettingsOpen();
    const pane=findControlPane()||document;
    const el=findExactText(label,pane);
    if(!el){if(notify)toast(`Open a section to edit ${label.toLowerCase()}`);return}
    if((el.tagName==='BUTTON'||el.getAttribute('role')==='button')&&el.getAttribute('aria-expanded')==='false'){
      try{el.click()}catch(e){}
    }
    el.scrollIntoView({behavior:'smooth',block:'start'});
    el.classList.add('benvor-group-highlight');
    setTimeout(()=>el.classList.remove('benvor-group-highlight'),900);
    qa('[data-builder-tab]').forEach(b=>b.classList.toggle('active',b.dataset.builderTab===label));
  }

  function clickCmsButton(patterns){
    const chrome=q('#benvor-builder-chrome');
    const buttons=qa('button').filter(b=>visible(b)&&(!chrome||!chrome.contains(b))&&!b.disabled);
    const hit=buttons.find(b=>patterns.some(p=>p.test(clean(b.textContent))));
    if(!hit)return false;
    hit.click();return true;
  }
  function saveDraft(auto=false){
    const ok=clickCmsButton([/^save$/i,/save draft/i,/save changes/i]);
    if(ok){state.dirty=false;setStatus(auto?'Autosaving draft…':'Saving draft…','working');setTimeout(()=>setStatus(auto?'Draft autosaved':'Draft saved','saved'),1500)}
    else if(!auto)toast('Use the Decap Save button shown in the editor');
    return ok;
  }
  function publish(){
    const ok=clickCmsButton([/^publish$/i,/publish entry/i,/publish changes/i]);
    if(ok)setStatus('Publishing…','working');else toast('Open the Decap workflow menu to publish');
  }
  function unpublish(){
    const ok=clickCmsButton([/unpublish/i]);
    if(!ok)toast('Use the Decap workflow menu to unpublish this entry');
  }
  function previewChanges(){
    ensureSettingsOpen();setViewport('desktop');
    const iframe=findPreviewIframe();if(iframe)iframe.scrollIntoView({behavior:'smooth',block:'center'});
  }

  function toggleDeveloper(){
    state.developer=!state.developer;
    localStorage.setItem('benvorDeveloperMode',state.developer?'1':'0');
    document.body.classList.toggle('benvor-developer-mode',state.developer);
    const btn=q('#benvor-dev-toggle');
    if(btn){btn.classList.toggle('active',state.developer);btn.setAttribute('aria-pressed',String(state.developer));btn.textContent=state.developer?'Developer On':'Developer Mode'}
    const adv=q('[data-builder-tab="ADVANCED"]');if(adv)adv.disabled=!state.developer;
    toast(state.developer?'Advanced design controls enabled':'Advanced design controls hidden');
  }

  function focusSection(index,name){
    ensureSettingsOpen();state.selected=index;renderSectionNav();
    const iframe=findPreviewIframe();
    if(iframe&&iframe.contentWindow)iframe.contentWindow.postMessage({type:'benvor-preview-select',index},'*');
    const pane=findControlPane()||document;
    let el=name?findExactText(name,pane):null;
    if(!el){
      const candidates=qa('button,[role="button"]',pane).filter(visible);
      el=candidates[index]||null;
    }
    if(el){
      if((el.tagName==='BUTTON'||el.getAttribute('role')==='button')&&el.getAttribute('aria-expanded')==='false'){try{el.click()}catch(e){}}
      el.scrollIntoView({behavior:'smooth',block:'center'});
      el.classList.add('benvor-section-focus');setTimeout(()=>el.classList.remove('benvor-section-focus'),1000);
    } else toast('Section selected in preview');
  }

  function findPageSectionsAddButton(){
    const pane=findControlPane();if(!pane)return null;
    const labels=qa('label,span,div,h3,h4',pane).filter(visible).filter(el=>/^page sections$/i.test(clean(el.textContent))||/visual page builder/i.test(clean(el.textContent)));
    for(const label of labels){
      let p=label;
      for(let i=0;i<7&&p;i++,p=p.parentElement){
        const btn=qa('button',p).find(b=>visible(b)&&/^add/i.test(clean(b.textContent)));
        if(btn)return btn;
      }
    }
    return qa('button',pane).filter(visible).find(b=>/^add/i.test(clean(b.textContent))&&/section|item|block/i.test(clean(b.textContent)))||null;
  }
  function nativeAddSection(label){
    ensureSettingsOpen();
    const btn=findPageSectionsAddButton();
    if(!btn){toast('Use “Add” under Page Sections in the settings panel');return}
    btn.click();
    setTimeout(()=>{
      const dialogs=qa('[role="dialog"], [class*="Modal"]');
      const root=dialogs.find(visible)||document;
      const choice=findExactText(label,root);
      if(choice&&visible(choice)){choice.click();toast(`${label} added`)}
      else toast(`Choose “${label}” from the Decap block picker`);
    },120);
  }
  function closeModal(){const m=q('#benvor-builder-modal');if(m)m.remove()}
  function showBlockLibrary(){
    if(!isPageEditor()){toast('Open a page before adding a section');return}
    closeModal();
    const modal=document.createElement('div');modal.id='benvor-builder-modal';modal.innerHTML=`
      <div class="builder-modal-backdrop"></div><div class="builder-modal-card builder-block-modal" role="dialog" aria-modal="true" aria-label="Add section">
        <div class="builder-modal-head"><div><strong>Add Section</strong><span>Choose a reusable page block</span></div><button type="button" data-close>×</button></div>
        <div class="builder-block-tools"><input id="benvor-block-search" type="search" placeholder="Search blocks…"><div id="benvor-block-cats"></div></div>
        <div id="benvor-block-grid" class="builder-block-grid"></div>
      </div>`;
    document.body.appendChild(modal);
    q('.builder-modal-backdrop',modal).addEventListener('click',closeModal);q('[data-close]',modal).addEventListener('click',closeModal);
    const cats=['All',...Array.from(new Set(BLOCKS.map(x=>x[2])))];let active='All';
    const catBox=q('#benvor-block-cats',modal),grid=q('#benvor-block-grid',modal),search=q('#benvor-block-search',modal);
    cats.forEach(cat=>{const b=makeButton(cat,()=>{active=cat;qa('button',catBox).forEach(x=>x.classList.toggle('active',x.textContent===cat));render()});if(cat==='All')b.classList.add('active');catBox.appendChild(b)});
    function render(){
      const term=clean(search.value).toLowerCase();grid.innerHTML='';
      BLOCKS.filter(x=>(active==='All'||x[2]===active)&&(!term||x[1].toLowerCase().includes(term)||x[2].toLowerCase().includes(term))).forEach(([type,label,cat])=>{
        const b=document.createElement('button');b.type='button';b.className='builder-block-card';b.innerHTML=`<span class="block-thumb block-${escapeHtml(cat.toLowerCase().replaceAll(' ','-'))}"><i></i><i></i><i></i></span><strong>${escapeHtml(label)}</strong><small>${escapeHtml(cat)}</small>`;
        b.addEventListener('click',()=>{closeModal();nativeAddSection(label)});grid.appendChild(b);
      });
    }
    search.addEventListener('input',render);render();search.focus();
  }
  function openSectionLibrary(){showBlockLibrary()}

  async function loadTemplateGuide(){
    const box=q('#benvor-template-guide');if(!box)return;
    const slug=sessionStorage.getItem('benvorTemplateRecipe')||'';
    if(!slug||!isPageEditor()||!route().hash.includes('/new')){box.hidden=true;box.innerHTML='';return}
    try{
      const data=await fetch(`/content/templates/${encodeURIComponent(slug)}.json`,{cache:'no-store'}).then(r=>r.ok?r.json():Promise.reject());
      const types=data.section_types||[];box.hidden=false;box.innerHTML=`<div class="template-guide-title"><strong>${escapeHtml(data.title||'Template')}</strong><button type="button" data-clear>×</button></div><p>${escapeHtml(data.description||'')}</p><div class="template-guide-list"></div>`;
      q('[data-clear]',box).addEventListener('click',()=>{sessionStorage.removeItem('benvorTemplateRecipe');loadTemplateGuide()});
      const list=q('.template-guide-list',box);
      types.forEach(type=>{const match=BLOCKS.find(x=>x[0]===type);const label=match?match[1]:String(type).replaceAll('_',' ');const b=makeButton(`+ ${label}`,()=>nativeAddSection(label));list.appendChild(b)});
    }catch(e){box.hidden=true}
  }
  function showNewPageModal(){
    closeModal();
    const modal=document.createElement('div');modal.id='benvor-builder-modal';modal.innerHTML=`
      <div class="builder-modal-backdrop"></div><div class="builder-modal-card builder-new-modal" role="dialog" aria-modal="true" aria-label="Create new page">
        <div class="builder-modal-head"><div><strong>Create New</strong><span>Start blank or use a guided template recipe</span></div><button type="button" data-close>×</button></div>
        <div class="builder-new-columns"><section><h3>Start Blank</h3><button type="button" data-blank="page">Blank Page</button><button type="button" data-blank="landing">Blank Landing Page</button></section><section><h3>Start From Template</h3><div id="benvor-template-options"></div></section></div>
      </div>`;
    document.body.appendChild(modal);q('.builder-modal-backdrop',modal).addEventListener('click',closeModal);q('[data-close]',modal).addEventListener('click',closeModal);
    q('[data-blank="page"]',modal).addEventListener('click',()=>{sessionStorage.removeItem('benvorTemplateRecipe');closeModal();go('#/collections/pages/new')});
    q('[data-blank="landing"]',modal).addEventListener('click',()=>{sessionStorage.removeItem('benvorTemplateRecipe');closeModal();go('#/collections/landing_pages/new')});
    const opts=q('#benvor-template-options',modal);TEMPLATE_RECIPES.forEach(([slug,label])=>{const b=makeButton(label,()=>{sessionStorage.setItem('benvorTemplateRecipe',slug);closeModal();go('#/collections/pages/new');setTimeout(loadTemplateGuide,700)});opts.appendChild(b)});
  }

  function renderSectionNav(){
    const box=q('#benvor-section-list');if(!box)return;
    box.innerHTML='';
    if(!state.sections.length){
      const empty=document.createElement('div');empty.className='builder-empty';empty.textContent=isPageEditor()?'Open preview to load sections':'Open a page to see its sections';box.appendChild(empty);return;
    }
    state.sections.forEach((s,i)=>{
      const b=document.createElement('button');b.type='button';b.className='builder-section-link';
      b.classList.toggle('active',i===state.selected);b.dataset.index=i;
      b.innerHTML=`<span class="drag-dot">⋮⋮</span><span>${escapeHtml(s.name||`Section ${i+1}`)}</span>`;
      b.addEventListener('click',()=>focusSection(i,s.name));box.appendChild(b);
    });
  }
  function escapeHtml(v){return String(v||'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}

  function makeButton(text,handler,cls=''){
    const b=document.createElement('button');b.type='button';b.className=cls;b.textContent=text;b.addEventListener('click',handler);return b;
  }
  function buildChrome(){
    if(q('#benvor-builder-chrome'))return;
    const chrome=document.createElement('div');chrome.id='benvor-builder-chrome';
    chrome.innerHTML=`
      <header id="benvor-builder-topbar">
        <div class="builder-brand"><span class="builder-mark">B</span><span><strong>Benvor Builder</strong><small id="benvor-context">Professional visual editor</small></span></div>
        <div class="builder-tabs" aria-label="Section settings tabs"></div>
        <div class="builder-actions"></div>
      </header>
      <aside id="benvor-builder-nav" aria-label="Website navigator">
        <div class="nav-scroll">
          <div class="builder-nav-title">Website</div>
          <nav id="benvor-page-links" class="builder-page-links"></nav>
          <div class="builder-nav-divider"></div>
          <div class="builder-nav-row"><span>Sections</span><button id="benvor-add-section" type="button">+ Add</button></div>
          <div id="benvor-section-list"></div><div id="benvor-template-guide" class="builder-template-guide" hidden></div>
        </div>
        <div class="builder-nav-footer">
          <button id="benvor-cms-home" type="button">CMS Areas</button>
          <button id="benvor-safe-editor" type="button">Safe Editor</button>
        </div>
      </aside>
      <div id="benvor-builder-toast"></div>`;
    document.body.appendChild(chrome);

    const pageLinks=q('#benvor-page-links');
    PAGE_LINKS.forEach(([label,slug])=>{
      const a=document.createElement('a');a.href=`#/collections/pages/entries/${slug}`;a.dataset.page=slug;a.textContent=label;pageLinks.appendChild(a);
    });
    const landing=document.createElement('a');landing.href='#/collections/landing_pages';landing.textContent='Landing Pages';pageLinks.appendChild(landing);
    const blog=document.createElement('a');blog.href='#/collections/insights';blog.textContent='Blog / Insights';pageLinks.appendChild(blog);

    const tabs=q('.builder-tabs',chrome);
    ['CONTENT','LAYOUT','DESIGN','RESPONSIVE','ADVANCED'].forEach(label=>{
      const b=makeButton(label,()=>jumpGroup(label),'builder-tab');b.dataset.builderTab=label;if(label==='ADVANCED')b.disabled=!state.developer;tabs.appendChild(b);
    });

    const actions=q('.builder-actions',chrome);
    const create=makeButton('+ New',showNewPageModal,'builder-action');
    const save=makeButton('Save Draft',()=>saveDraft(false),'builder-action primary-soft');
    const prev=makeButton('Preview',previewChanges,'builder-action');
    const pub=makeButton('Publish',publish,'builder-action publish');
    const dev=makeButton(state.developer?'Developer On':'Developer Mode',toggleDeveloper,'builder-action');dev.id='benvor-dev-toggle';dev.setAttribute('aria-pressed',String(state.developer));dev.classList.toggle('active',state.developer);
    const collapse=makeButton('Hide Settings',()=>settingsCollapsed(),'builder-action');collapse.id='benvor-settings-toggle';collapse.setAttribute('aria-pressed','false');
    const status=document.createElement('span');status.id='benvor-save-status';status.textContent='Draft workflow';
    const views=document.createElement('div');views.className='builder-viewports';
    ['desktop','laptop','tablet','mobile'].forEach(mode=>{const b=makeButton(mode[0].toUpperCase()+mode.slice(1),()=>setViewport(mode));b.dataset.builderViewport=mode;if(mode==='desktop')b.classList.add('active');views.appendChild(b)});
    const more=document.createElement('details');more.className='builder-more';more.innerHTML='<summary>•••</summary><div class="builder-more-menu"></div>';
    const menu=q('.builder-more-menu',more);
    menu.append(makeButton('View Live Site',openLive),makeButton('Copy Live URL',copyLive),makeButton('Version History',openHistory),makeButton('Unpublish',unpublish),makeButton('Open Safe Editor',()=>window.open('/admin/safe.html','_blank','noopener')));
    actions.append(status,views,dev,collapse,create,save,prev,pub,more);

    q('#benvor-add-section').addEventListener('click',openSectionLibrary);
    q('#benvor-cms-home').addEventListener('click',()=>go('#/collections/pages'));
    q('#benvor-safe-editor').addEventListener('click',()=>window.open('/admin/safe.html','_blank','noopener'));
    renderSectionNav();syncRoute();
  }

  function syncRoute(){
    const r=route();
    document.body.classList.toggle('benvor-editor-mode',isPageEditor());
    document.body.classList.toggle('benvor-cms-mode',!isPageEditor());
    if(r.hash===state.lastRoute)return;
    state.lastRoute=r.hash;state.sections=[];state.selected=-1;renderSectionNav();
    const context=q('#benvor-context');
    if(context)context.textContent=r.collection?(r.slug?`${r.collection.replaceAll('_',' ')} / ${r.slug}`:r.collection.replaceAll('_',' ')):'Professional visual editor';
    qa('#benvor-page-links a').forEach(a=>a.classList.toggle('active',a.dataset.page&&a.dataset.page===r.slug));
    state.dirty=false;setStatus('Draft workflow');
    if(state.settingsCollapsed)settingsCollapsed(false);
    setTimeout(loadTemplateGuide,650);
  }

  function markAdvancedControls(){
    const pane=findControlPane();if(!pane)return;
    const exact=qa('button,[role="button"]',pane).filter(el=>clean(el.textContent).toUpperCase()==='ADVANCED');
    exact.forEach(el=>{
      el.classList.add('benvor-advanced-header');
      if(!state.developer&&el.getAttribute('aria-expanded')==='true'){try{el.click()}catch(e){}}
    });
  }

  function autoSaveTick(){
    if(!isPageEditor()||document.visibilityState!=='visible'||!state.dirty)return;
    const now=Date.now();if(now-state.autoSaveAt<60000)return;
    const chrome=q('#benvor-builder-chrome');
    const save=qa('button').filter(b=>visible(b)&&(!chrome||!chrome.contains(b))&&!b.disabled).find(b=>/^save$/i.test(clean(b.textContent))||/save draft/i.test(clean(b.textContent)));
    if(save){state.autoSaveAt=now;saveDraft(true)}
  }

  function receiveMessage(event){
    const d=event.data||{};
    if(d.type==='benvor-builder-sections'&&Array.isArray(d.sections)){
      state.sections=d.sections.map((s,i)=>({name:clean(s.name)||`Section ${i+1}`,type:s.type||''}));
      renderSectionNav();
    }
    if(d.type==='benvor-preview-section-click')focusSection(Number(d.index)||0,clean(d.name));
  }

  function init(){
    if(initialized)return;initialized=true;
    state.developer=localStorage.getItem('benvorDeveloperMode')==='1';
    document.body.classList.toggle('benvor-developer-mode',state.developer);
    buildChrome();
    window.addEventListener('hashchange',()=>setTimeout(syncRoute,40));
    window.addEventListener('message',receiveMessage);
    setInterval(autoSaveTick,15000);
    setInterval(markAdvancedControls,1800);
    setTimeout(markAdvancedControls,1700);
    document.addEventListener('input',e=>{const chrome=q('#benvor-builder-chrome');if(isPageEditor()&&(!chrome||!chrome.contains(e.target))){state.dirty=true;setStatus('Unsaved changes','working')}},true);
    document.addEventListener('change',e=>{const chrome=q('#benvor-builder-chrome');if(isPageEditor()&&(!chrome||!chrome.contains(e.target))){state.dirty=true;setStatus('Unsaved changes','working')}},true);
    document.addEventListener('keydown',e=>{
      if(!e.altKey)return;
      const k=e.key.toLowerCase();
      const groups={'1':'CONTENT','2':'LAYOUT','3':'DESIGN','4':'RESPONSIVE','5':'ADVANCED'};
      if(groups[k]){e.preventDefault();jumpGroup(groups[k])}
      if(k==='s'){e.preventDefault();saveDraft(false)}
      if(k==='p'){e.preventDefault();previewChanges()}
      if(k==='l'){e.preventDefault();openLive()}
    });
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
