(() => {
  'use strict';

  const REPO = 'benvorgroup/benvordigital';
  const BRANCH = 'main';
  const AUTH_BASE = 'https://benvor-cms-auth.benvorgroup.workers.dev';
  const SITE = 'https://benvordigital.com';
  const API = 'https://api.github.com';
  const PAGE_DRAFT_PREFIX = 'benvor-sites-builder:page:';
  const SETTINGS_DRAFT_KEY = 'benvor-sites-builder:settings';

  const PAGE_TREE = [
    { title:'Home', slug:'home', path:'/' },
    { title:'About', slug:'about', path:'/about/', children:[
      { title:'Our Process', slug:'our-process', path:'/our-process/' },
      { title:'Why Benvor Digital', slug:'why-benvor', path:'/why-benvor/' }
    ]},
    { title:'Services', slug:'services', path:'/services/', children:[
      { title:'E-commerce Marketing', slug:'ecommerce-marketing', path:'/ecommerce-marketing/' },
      { title:'B2B & SaaS Marketing', slug:'b2b-saas-marketing', path:'/b2b-saas-marketing/' }
    ]},
    { title:'Industries', slug:'industries', path:'/industries/' },
    { title:'Portfolio', slug:'portfolio', path:'/portfolio/', children:[
      { title:'Case Studies', slug:'case-studies', path:'/case-studies/' }
    ]},
    { title:'Blog', slug:'blog', path:'/blog/', external:true },
    { title:'Contact', slug:'contact', path:'/contact/', children:[
      { title:'Free Growth Audit', slug:'growth-audit', path:'/growth-audit/' },
      { title:'Book a Strategy Call', slug:'book-strategy-call', path:'/book-strategy-call/' }
    ]}
  ];

  const KNOWN_PAGES = [];
  (function flatten(nodes){nodes.forEach(n=>{if(!n.external)KNOWN_PAGES.push({title:n.title,slug:n.slug,path:n.path});if(n.children)flatten(n.children)});})(PAGE_TREE);
  const DIRECT = new Set(KNOWN_PAGES.map(p=>p.slug));

  const SECTION_LABELS = {
    hero_dashboard:'Hero + Analytics',hero_lead_form:'Hero + Lead Form',page_hero:'Page Hero',trust_stats:'Trust + Stats',problem_nav:'Problem Navigation',
    services_grid:'Services Grid',selected_work:'Selected Work',portfolio_grid:'Portfolio Grid',comparison:'Comparison',process:'Process',growth_score:'Growth Score',
    testimonials:'Testimonials',local_credibility:'Local Credibility',faq:'FAQ',dual_cta:'Dual CTA',cta:'Call to Action',why_benvor:'Feature Columns',
    about_preview:'About Preview',image_text:'Image + Text',stats:'Stats',team:'Team',contact_split:'Form',rich_text:'Text',gallery:'Images',
    flex_cards:'Cards',divider:'Divider',spacer:'Spacer'
  };

  const LAYOUT_OPTIONS = {
    container_width:['inherit','narrow','default','wide','full'],padding_top:['inherit','none','xs','small','default','large','xl'],padding_bottom:['inherit','none','xs','small','default','large','xl'],
    min_height:['inherit','auto','small','medium','large','screen'],vertical_align:['inherit','start','center','end'],text_align:['left','center','right'],
    columns_desktop:['auto','1','2','3','4'],columns_tablet:['auto','1','2','3'],columns_mobile:['auto','1','2'],gap:['none','small','default','large','xl'],
    card_padding:['small','default','large','xl'],image_ratio:['auto','1:1','4:3','3:2','16:9','21:9']
  };
  const DESIGN_OPTIONS = {
    background:['default','white','light_grey','navy','blue'],background_position:['center','top','bottom','left','right'],border_style:['none','solid','subtle'],
    border_radius:['none','small','default','large','pill'],shadow:['none','small','medium','large'],text_tone:['auto','dark','light'],overlay:['none','soft','medium','strong']
  };
  const TEMPLATE_RECIPES = {
    'Blank Page':[],
    'Service Page':['page_hero','image_text','services_grid','process','faq','cta'],
    'Landing Page':['hero_lead_form','trust_stats','comparison','selected_work','faq','dual_cta'],
    'Case Study':['page_hero','image_text','stats','cta'],
    'About Page':['page_hero','image_text','stats','why_benvor','team','cta'],
    'Contact Page':['page_hero','contact_split','trust_stats','cta'],
    'Lead Generation Page':['hero_lead_form','problem_nav','services_grid','selected_work','growth_score','faq','dual_cta']
  };

  const ICONS = {
    pages:'<path d="M5 4.5h9l3 3v12H5z"/><path d="M14 4.5v3h3"/><path d="M8 11h6M8 14h6"/>',
    undo:'<path d="M9 7 5 11l4 4"/><path d="M5 11h7a5 5 0 0 1 5 5"/>',
    redo:'<path d="m15 7 4 4-4 4"/><path d="M19 11h-7a5 5 0 0 0-5 5"/>',
    preview:'<path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/>',
    share:'<circle cx="18" cy="5" r="2"/><circle cx="6" cy="12" r="2"/><circle cx="18" cy="19" r="2"/><path d="m8 11 8-5M8 13l8 5"/>',
    settings:'<circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.7a7 7 0 0 0-.7-1.7l.9-1.9-2.1-2.1-1.9.9a7 7 0 0 0-1.7-.7L10.8 2h-3l-.7 2.3a7 7 0 0 0-1.7.7l-1.9-.9-2.1 2.1.9 1.9a7 7 0 0 0-.7 1.7L0 10.5v3l2 .7a7 7 0 0 0 .7 1.7l-.9 1.9 2.1 2.1 1.9-.9a7 7 0 0 0 1.7.7l.7 2.3h3l.7-2.3a7 7 0 0 0 1.7-.7l1.9.9 2.1-2.1-.9-1.9a7 7 0 0 0 .7-1.7z" transform="scale(.83) translate(2.3 2.3)"/>',
    more:'<circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>',
    close:'<path d="m6 6 12 12M18 6 6 18"/>',plus:'<path d="M12 5v14M5 12h14"/>',
    page:'<path d="M6 3.5h8l4 4v13H6z"/><path d="M14 3.5v4h4"/>',home:'<path d="m3 11 9-7 9 7"/><path d="M5.5 10v10h13V10M10 20v-6h4v6"/>',
    chevron:'<path d="m9 6 6 6-6 6"/>',search:'<circle cx="11" cy="11" r="6.5"/><path d="m16 16 4 4"/>',
    text:'<path d="M5 6h14M12 6v13M8.5 19h7"/>',image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="1.5"/><path d="m5 18 5-5 3 3 2-2 4 4"/>',
    button:'<rect x="4" y="7" width="16" height="10" rx="5"/><path d="M8 12h8"/>',divider:'<path d="M3 12h18"/>',
    carousel:'<rect x="5" y="5" width="14" height="14" rx="2"/><path d="M2 8v8M22 8v8M8 16l3-3 2 2 3-3"/>',
    youtube:'<rect x="3" y="6" width="18" height="12" rx="4"/><path d="m10 9 5 3-5 3z"/>',map:'<path d="M12 21s6-5.4 6-11a6 6 0 1 0-12 0c0 5.6 6 11 6 11Z"/><circle cx="12" cy="10" r="2"/>',
    form:'<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h5M8 16h7"/>',chart:'<path d="M4 20V9M10 20V4M16 20v-7M22 20H2"/>',
    drive:'<path d="m9 3 4 7-4 7H2l7-14Z"/><path d="m13 10 4-7 5 9-4 7h-8"/><path d="M9 17h9"/>',spacer:'<path d="M4 7h16M4 17h16M12 9v6M9 12l3-3 3 3M9 12l3 3 3-3"/>',
    desktop:'<rect x="3" y="4" width="18" height="13" rx="1"/><path d="M8 21h8M12 17v4"/>',tablet:'<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/>',mobile:'<rect x="8" y="2" width="8" height="20" rx="2"/><path d="M11 18h2"/>',
    copy:'<rect x="8" y="8" width="11" height="11" rx="1"/><path d="M16 8V5H5v11h3"/>',trash:'<path d="M4 7h16M9 7V4h6v3M7 7l1 13h8l1-13"/>',
    up:'<path d="m6 14 6-6 6 6"/>',down:'<path d="m6 10 6 6 6-6"/>',back:'<path d="m15 18-6-6 6-6"/>',
    link:'<path d="M10 14 14 10"/><path d="M7.5 16.5 5 19a4.2 4.2 0 0 1-6-6l3-3a4.2 4.2 0 0 1 6 0" transform="translate(4 -3)"/><path d="m16.5 7.5 2.5-2.5a4.2 4.2 0 1 1 6 6l-3 3a4.2 4.2 0 0 1-6 0" transform="translate(-5 4)"/>',
    github:'<path d="M12 2.8a9.2 9.2 0 0 0-2.9 17.9c.46.08.63-.2.63-.45v-1.77c-2.56.56-3.1-1.08-3.1-1.08-.42-1.06-1.02-1.35-1.02-1.35-.84-.57.06-.56.06-.56.93.07 1.42.96 1.42.96.83 1.42 2.17 1.01 2.7.77.08-.6.32-1.01.59-1.24-2.04-.23-4.19-1.02-4.19-4.55 0-1 .36-1.83.95-2.47-.1-.23-.41-1.17.09-2.43 0 0 .78-.25 2.53.94A8.8 8.8 0 0 1 12 7.16a8.7 8.7 0 0 1 2.3.31c1.76-1.19 2.53-.94 2.53-.94.5 1.26.19 2.2.09 2.43.59.64.95 1.47.95 2.47 0 3.54-2.15 4.31-4.2 4.54.33.29.62.85.62 1.72v2.56c0 .25.17.54.63.45A9.2 9.2 0 0 0 12 2.8Z"/>',
    code:'<path d="m9 7-5 5 5 5M15 7l5 5-5 5M13 4l-2 16"/>',external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v7H4V6h7"/>'
  };

  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const clone = v => JSON.parse(JSON.stringify(v));
  const esc = v => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const nice = key => String(key||'').replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
  const pathArr = p => String(p||'').split('.').filter(Boolean).map(x=>/^\d+$/.test(x)?Number(x):x);
  const getPath = (o,p)=>pathArr(p).reduce((a,k)=>a==null?undefined:a[k],o);
  const sleep = ms => new Promise(r=>setTimeout(r,ms));
  const svg = name => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[name]||ICONS.page}</svg>`;

  function setPath(o,p,v){const a=pathArr(p);let cur=o;for(let i=0;i<a.length-1;i++){const k=a[i];if(cur[k]==null)cur[k]=typeof a[i+1]==='number'?[]:{};cur=cur[k]}cur[a[a.length-1]]=v}
  function delPath(o,p){const a=pathArr(p);let cur=o;for(let i=0;i<a.length-1;i++){if(cur==null)return;cur=cur[a[i]]}if(Array.isArray(cur))cur.splice(a[a.length-1],1);else if(cur)delete cur[a[a.length-1]]}
  function currentRoute(slug){if(slug==='home')return '/';if(DIRECT.has(slug))return `/${slug}/`;return `/page/?slug=${encodeURIComponent(slug)}`}
  function nowLabel(){return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}
  function slugify(s){return String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}

  const state = {
    slug:'home',page:null,settings:null,pages:KNOWN_PAGES.map(clone),selected:-1,panel:'insert',inspectorTab:'content',settingsTab:'navigation',
    device:'desktop',developer:false,dirty:false,settingsDirty:false,history:[],future:[],token:sessionStorage.getItem('benvor_github_token')||'',user:null,
    renderSeq:0,draftTimer:null,settingsTimer:null,frameTimer:null,authPopup:null,expanded:new Set(['about','services','portfolio','contact']),pagePanelOpen:true
  };

  function injectIcons(root=document){root.querySelectorAll('[data-icon]').forEach(el=>{if(!el.dataset.iconReady){el.innerHTML=svg(el.dataset.icon);el.dataset.iconReady='1'}})}
  function toast(msg){const el=$('#bv-toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),2000)}
  function setStatus(text,tone='saved'){$('#bv-save-status').textContent=text;$('#bv-save-status').dataset.tone=tone;const pub=$('#bv-published-state');pub.textContent=(state.dirty||state.settingsDirty)?'Draft':'Published';pub.classList.toggle('is-published',!(state.dirty||state.settingsDirty))}
  function updateUndo(){$('#bv-undo').disabled=!state.history.length;$('#bv-redo').disabled=!state.future.length}
  function snapshot(){return {page:clone(state.page),settings:clone(state.settings),dirty:state.dirty,settingsDirty:state.settingsDirty,selected:state.selected}}
  function pushHistory(){if(!state.page)return;state.history.push(snapshot());if(state.history.length>60)state.history.shift();state.future=[];updateUndo()}
  function restoreSnapshot(s){state.page=clone(s.page);state.settings=clone(s.settings);state.dirty=s.dirty;state.settingsDirty=s.settingsDirty;state.selected=Math.min(s.selected,(state.page.sections||[]).length-1);updateChrome();renderAll();queueDraft();queueSettingsDraft()}
  function undo(){if(!state.history.length)return;state.future.push(snapshot());restoreSnapshot(state.history.pop());updateUndo();toast('Undone')}
  function redo(){if(!state.future.length)return;state.history.push(snapshot());restoreSnapshot(state.future.pop());updateUndo();toast('Redone')}
  function markDirty(scope='page'){if(scope==='settings')state.settingsDirty=true;else state.dirty=true;setStatus('Unsaved changes','dirty');scope==='settings'?queueSettingsDraft():queueDraft()}
  function queueDraft(){clearTimeout(state.draftTimer);state.draftTimer=setTimeout(savePageDraft,650)}
  function queueSettingsDraft(){clearTimeout(state.settingsTimer);state.settingsTimer=setTimeout(saveSettingsDraft,650)}
  function scheduleFrame(delay=100){clearTimeout(state.frameTimer);state.frameTimer=setTimeout(renderFrame,delay)}
  function pageDraftKey(slug=state.slug){return `${PAGE_DRAFT_PREFIX}${slug}`}
  function savePageDraft(){if(!state.page)return;try{localStorage.setItem(pageDraftKey(),JSON.stringify({savedAt:Date.now(),page:state.page}));setStatus(`Draft saved ${nowLabel()}`,'saved')}catch(e){setStatus('Draft could not be saved','error')}}
  function loadPageDraft(slug){try{const raw=localStorage.getItem(pageDraftKey(slug));if(!raw)return null;const d=JSON.parse(raw);return d&&d.page?d:null}catch(_){return null}}
  function clearPageDraft(slug=state.slug){try{localStorage.removeItem(pageDraftKey(slug))}catch(_){}}
  function saveSettingsDraft(){if(!state.settings)return;try{localStorage.setItem(SETTINGS_DRAFT_KEY,JSON.stringify({savedAt:Date.now(),settings:state.settings}));setStatus(`Draft saved ${nowLabel()}`,'saved')}catch(e){setStatus('Settings draft could not be saved','error')}}
  function loadSettingsDraft(){try{const raw=localStorage.getItem(SETTINGS_DRAFT_KEY);if(!raw)return null;const d=JSON.parse(raw);return d&&d.settings?d:null}catch(_){return null}}
  function clearSettingsDraft(){try{localStorage.removeItem(SETTINGS_DRAFT_KEY)}catch(_){}}

  async function getJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.json()}
  function updateChrome(){
    if(!state.page)return;
    $('#bv-current-page-name').textContent=state.page.title||state.slug;
    $('#bv-preview-page-label').textContent=state.page.title||state.slug;
    $('#bv-site-title').value=state.settings?.brand?.company_name||'Benvor Digital';
    document.title=`${state.page.title||'Page'} | Benvor Sites Builder`;
    setStatus(state.dirty||state.settingsDirty?'Draft saved locally':'Published',state.dirty||state.settingsDirty?'dirty':'saved');
    renderPageTree();
  }

  async function loadPage(slug,{ignoreDraft=false}={}){
    if(slug==='blog'){window.open('/blog/','_blank','noopener');return}
    if(state.page&&state.dirty)savePageDraft();
    setStatus('Loading page…','working');state.selected=-1;state.history=[];state.future=[];updateUndo();
    try{
      const page=await getJSON(`/content/pages/${encodeURIComponent(slug)}.json`);
      state.slug=slug;state.page=page;state.dirty=false;
      if(!ignoreDraft){const d=loadPageDraft(slug);if(d){state.page=d.page;state.dirty=true;toast('Local draft restored')}}
      updateChrome();renderAll();await renderFrame();
    }catch(e){console.error(e);setStatus('Could not load page','error');toast('Could not load page content')}
  }

  function frameSource(){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><link rel="stylesheet" href="/assets/css/site.css"><style>
    html,body{background:#fff!important}body{min-height:100vh;margin:0!important}.site-footer{background:#fff!important;color:#0A1F33!important;border-top:1px solid #E4E8EE!important}.footer-brand p,.footer-col a,.footer-email,.footer-address,.footer-bottom{color:#405266!important}.footer-col h5{color:#0A1F33!important}.footer-bottom{border-color:#E4E8EE!important}.social{color:#0A1F33!important;border-color:#DCE3EA!important;background:#fff!important}.social:hover{color:#2563EB!important;border-color:#9EB9EE!important}.visual-section{position:relative!important;outline:1px solid transparent;outline-offset:-1px;transition:outline-color .1s ease}.visual-section.bv-frame-hover{outline:2px solid #9ab6ef!important;outline-offset:-2px}.visual-section.bv-frame-selected{outline:2px solid #2563eb!important;outline-offset:-2px}.bv-frame-tools{position:absolute!important;z-index:9999!important;right:9px!important;top:9px!important;display:flex!important;align-items:center!important;gap:1px!important;background:#2563eb!important;border-radius:5px!important;padding:2px!important;box-shadow:0 4px 14px rgba(10,31,51,.18)!important}.bv-frame-tools button{width:28px!important;height:27px!important;display:grid!important;place-items:center!important;border:0!important;border-radius:4px!important;background:transparent!important;color:#fff!important;font:700 12px/1 Arial,sans-serif!important;cursor:pointer!important;padding:0!important;margin:0!important}.bv-frame-tools button:hover{background:rgba(255,255,255,.18)!important}.bv-frame-tools .bv-drag{cursor:grab!important}.bv-add-between{position:relative!important;z-index:9998!important;display:block!important;margin:-11px auto -11px!important;width:30px!important;height:22px!important;border-radius:999px!important;border:1px solid #9bb8f1!important;background:#fff!important;color:#2563eb!important;font:800 15px/18px Arial,sans-serif!important;cursor:pointer!important;opacity:.08!important;transition:.12s!important}.bv-add-between:hover,.visual-section:hover+.bv-add-between{opacity:1!important;box-shadow:0 2px 8px rgba(37,99,235,.15)!important}[contenteditable="true"]{outline:none!important;border-radius:3px!important;cursor:text!important}[contenteditable="true"]:hover{box-shadow:0 0 0 1px rgba(37,99,235,.22)!important}[contenteditable="true"]:focus{box-shadow:0 0 0 2px rgba(37,99,235,.42)!important;background:rgba(255,255,255,.94)!important}.reveal{opacity:1!important;transform:none!important}.bv-drop-active{outline:3px solid rgba(37,99,235,.55)!important;outline-offset:-3px!important}a,button{scroll-margin-top:80px}
  </style></head><body data-benvor-builder-preview="true"><div id="mobile-overlay"></div><header id="site-header"></header><main id="main"></main><footer id="site-footer"></footer><script src="/assets/js/app.js"><\/script></body></html>`}

  async function ensureFrameReady(){
    const iframe=$('#bv-preview-frame');
    if(iframe.dataset.ready==='1'&&iframe.contentWindow?.BenvorRenderer)return iframe.contentWindow;
    iframe.dataset.ready='0';
    await new Promise(resolve=>{
      const done=()=>{iframe.removeEventListener('load',done);resolve()};
      iframe.addEventListener('load',done,{once:true});
      iframe.srcdoc=frameSource();
    });
    iframe.dataset.ready='1';
    for(let i=0;i<60;i++){if(iframe.contentWindow?.BenvorRenderer)return iframe.contentWindow;await sleep(50)}
    throw new Error('Preview renderer unavailable');
  }

  async function renderFrame(){
    if(!state.page||!state.settings)return;
    const seq=++state.renderSeq;
    try{
      const w=await ensureFrameReady();if(seq!==state.renderSeq)return;
      await w.BenvorRenderer.renderDraft(clone(state.page),clone(state.settings),state.slug);if(seq!==state.renderSeq)return;
      enhanceFrame();
    }catch(e){console.error(e);toast('Preview could not render')}
  }

  function enhanceFrame(){
    const iframe=$('#bv-preview-frame'),doc=iframe.contentDocument;if(!doc)return;
    const main=doc.querySelector('#main');if(!main)return;
    if(!doc.documentElement.dataset.bvGuardBound){
      doc.documentElement.dataset.bvGuardBound='1';
      doc.addEventListener('click',e=>{const a=e.target.closest('a');if(a)e.preventDefault();const form=e.target.closest('form');if(form)e.preventDefault()},{capture:true});
      main.addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('application/x-benvor-block')){e.preventDefault();main.classList.add('bv-drop-active')}});
      main.addEventListener('dragleave',()=>main.classList.remove('bv-drop-active'));
      main.addEventListener('drop',e=>{main.classList.remove('bv-drop-active');const type=e.dataTransfer?.getData('application/x-benvor-block');if(type){e.preventDefault();addInsertType(type,(state.page.sections||[]).length-1)}});
    }
    const sections=Array.from(main.querySelectorAll(':scope > .visual-section'));
    sections.forEach((el,idx)=>{
      el.dataset.bvIndex=String(idx);el.classList.toggle('bv-frame-selected',idx===state.selected);
      el.addEventListener('mouseenter',()=>el.classList.add('bv-frame-hover'));
      el.addEventListener('mouseleave',()=>el.classList.remove('bv-frame-hover'));
      el.addEventListener('click',e=>{if(e.target.closest('.bv-frame-tools')||e.target.closest('[contenteditable="true"]'))return;selectSection(idx);e.stopPropagation()});
      const tools=doc.createElement('div');tools.className='bv-frame-tools';tools.innerHTML='<button class="bv-drag" title="Drag section" draggable="true">⋮⋮</button><button data-act="dup" title="Duplicate">⧉</button><button data-act="up" title="Move up">↑</button><button data-act="down" title="Move down">↓</button><button data-act="del" title="Delete">×</button>';el.appendChild(tools);
      const handle=tools.querySelector('.bv-drag');handle.addEventListener('dragstart',e=>{e.stopPropagation();e.dataTransfer.setData('application/x-benvor-section',String(idx));e.dataTransfer.effectAllowed='move'});
      tools.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const act=e.target.closest('button')?.dataset.act;if(act==='dup')duplicateSection(idx);if(act==='up')moveSection(idx,idx-1);if(act==='down')moveSection(idx,idx+1);if(act==='del')deleteSection(idx)});
      el.addEventListener('dragover',e=>{if(e.dataTransfer?.types?.includes('application/x-benvor-section')||e.dataTransfer?.types?.includes('application/x-benvor-block')){e.preventDefault();el.classList.add('bv-drop-active')}});
      el.addEventListener('dragleave',()=>el.classList.remove('bv-drop-active'));
      el.addEventListener('drop',e=>{el.classList.remove('bv-drop-active');const sectionFrom=e.dataTransfer?.getData('application/x-benvor-section')||'';const block=e.dataTransfer?.getData('application/x-benvor-block')||'';if(/^\d+$/.test(sectionFrom)){e.preventDefault();moveSection(Number(sectionFrom),idx);return}if(block){e.preventDefault();addInsertType(block,idx-1)}});
      bindInlineEditing(el,idx);
      const add=doc.createElement('button');add.className='bv-add-between';add.type='button';add.textContent='+';add.title='Add section here';add.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();state.selected=idx;state.panel='insert';renderSide();toast('Choose content to insert')});el.insertAdjacentElement('afterend',add);
    });
    if(!sections.length){const empty=doc.createElement('button');empty.className='bv-add-between';empty.style.opacity='1';empty.textContent='+';empty.onclick=()=>{state.panel='insert';renderSide()};main.appendChild(empty)}
  }

  function flattenStrings(obj,prefix='content',out=[]){
    if(obj==null)return out;if(typeof obj==='string'){if(obj.trim())out.push({path:prefix,value:obj});return out}
    if(Array.isArray(obj)){obj.forEach((v,i)=>flattenStrings(v,`${prefix}.${i}`,out));return out}
    if(typeof obj==='object'){Object.entries(obj).forEach(([k,v])=>{if(/(^|_)(url|link|image|icon|name|type|id|class)$/i.test(k))return;flattenStrings(v,`${prefix}.${k}`,out)})}return out
  }

  function bindInlineEditing(wrapper,idx){
    const section=state.page.sections[idx];if(!section?.content)return;
    const fields=flattenStrings(section.content);const byValue=new Map();
    fields.forEach(f=>{const k=f.value.trim();if(!byValue.has(k))byValue.set(k,[]);byValue.get(k).push(f)});
    wrapper.querySelectorAll('h1,h2,h3,h4,p,a,small,strong,span,li,blockquote').forEach(el=>{
      if(el.closest('.bv-frame-tools')||el.children.length>0||el.dataset.bvEditBound)return;
      let txt=el.textContent.trim(),suffix='';if(txt.endsWith(' →')){txt=txt.slice(0,-2).trim();suffix=' →'}
      const hits=byValue.get(txt);if(!hits||hits.length!==1)return;
      const field=hits[0];el.contentEditable='true';el.dataset.bvEditBound='1';el.dataset.bvPath=field.path;el.dataset.bvSuffix=suffix;
      el.addEventListener('focus',()=>{selectSection(idx,{scroll:false});if(!el.dataset.bvHist){pushHistory();el.dataset.bvHist='1'}});
      el.addEventListener('input',()=>{const value=el.textContent.replace(/\s*→\s*$/,'').trim();setPath(section,field.path,value);markDirty('page');renderInspectorOnly()});
      el.addEventListener('blur',()=>{delete el.dataset.bvHist;scheduleFrame(60)});
      el.addEventListener('keydown',e=>{if(e.key==='Enter'&&!['P','BLOCKQUOTE','LI'].includes(el.tagName)){e.preventDefault();el.blur()}})
    })
  }

  function selectSection(idx,{scroll=true}={}){
    if(!state.page?.sections?.[idx])return;state.selected=idx;state.inspectorTab='content';renderSide();
    const doc=$('#bv-preview-frame').contentDocument;if(doc){doc.querySelectorAll('.visual-section').forEach((x,i)=>x.classList.toggle('bv-frame-selected',i===idx));if(scroll){const el=doc.querySelector(`.visual-section[data-bv-index="${idx}"]`);el?.scrollIntoView({block:'center',behavior:'smooth'})}}
  }
  function moveSection(from,to){const arr=state.page.sections||[];if(!Number.isInteger(from)||from<0||from>=arr.length||to<0||to>=arr.length||from===to)return;pushHistory();const [item]=arr.splice(from,1);arr.splice(to,0,item);state.selected=to;markDirty('page');renderAll();renderFrame()}
  function duplicateSection(idx){const arr=state.page.sections||[];if(!arr[idx])return;pushHistory();const cp=clone(arr[idx]);cp.section_name=(cp.section_name||SECTION_LABELS[cp.type]||'Section')+' Copy';arr.splice(idx+1,0,cp);state.selected=idx+1;markDirty('page');renderAll();renderFrame();toast('Section duplicated')}
  function deleteSection(idx){const arr=state.page.sections||[];if(!arr[idx]||!confirm('Delete this section?'))return;pushHistory();arr.splice(idx,1);state.selected=Math.min(idx,arr.length-1);markDirty('page');renderAll();renderFrame();toast('Section deleted')}

  function defaultsBase(type){return {type,enabled:true,section_name:SECTION_LABELS[type]||nice(type),visual_preset:'standard',content:{},layout:{container_width:'default',padding_top:'default',padding_bottom:'default',min_height:'auto',vertical_align:'start',text_align:'left',columns_desktop:'auto',columns_tablet:'auto',columns_mobile:'1',gap:'default',card_padding:'default',image_ratio:'auto'},design:{background:'default',background_image:'',background_position:'center',border_style:'none',border_radius:'default',shadow:'none',text_tone:'auto',overlay:'none'},responsive:{hide_mobile:false,hide_tablet:false,hide_desktop:false,reverse_mobile:false},advanced:{sticky:false,custom_class:'',anchor_id:'',tracking_name:'',aria_label:'',z_index:'auto',disable_animation:false}}}
  function makeSection(type){const s=defaultsBase(type),c=s.content;switch(type){
    case 'page_hero':Object.assign(c,{eyebrow:'Benvor Digital',heading:'A clear headline for this page',text:'Add a concise supporting statement that explains the value of this page.'});break;
    case 'rich_text':Object.assign(c,{eyebrow:'Overview',heading:'Tell the story clearly',body:'Add your content here.\n\nUse short paragraphs to keep the page easy to scan.'});break;
    case 'image_text':Object.assign(c,{eyebrow:'Feature',heading:'Pair a strong message with an image',text:'Explain the benefit, approach, or proof point in a focused block.',image:'/assets/images/site/office.svg',image_alt:'Benvor Digital',image_position:'left',button:{label:'Learn More',url:'/contact/'}});break;
    case 'flex_cards':Object.assign(c,{eyebrow:'Highlights',heading:'Key benefits',text:'Use cards to make important information easy to scan.',columns:3,items:[{title:'Focused strategy',text:'Start with the highest-impact opportunity.',icon:'target'},{title:'Clear execution',text:'Turn the strategy into measurable action.',icon:'trend'},{title:'Useful reporting',text:'Know what changed and why.',icon:'chart'}]});break;
    case 'services_grid':Object.assign(c,{eyebrow:'Services',heading:'How we can help',text:'Choose the growth system that matches your next objective.',services:['ppc','seo','analytics']});break;
    case 'process':Object.assign(c,{eyebrow:'Our Process',heading:'A simple path from strategy to growth',items:[{number:'01',title:'Discover',text:'Understand the goals, audience and constraints.'},{number:'02',title:'Build',text:'Create the campaign, content or system.'},{number:'03',title:'Improve',text:'Measure, learn and optimise.'}]});break;
    case 'faq':Object.assign(c,{eyebrow:'FAQ',heading:'Common questions',items:[{question:'What happens first?',answer:'We start by understanding the goal and identifying the strongest first move.'},{question:'How do you measure success?',answer:'We agree on practical business and marketing metrics before execution.'}]});break;
    case 'gallery':Object.assign(c,{heading:'Gallery',images:[{image:'/assets/images/site/office.svg',alt:'Benvor Digital'}]});break;
    case 'about_preview':Object.assign(c,{eyebrow:'About',heading:'Built around measurable growth',text:'Use this section to introduce the agency, team or approach.',image:'/assets/images/site/office.svg',image_alt:'Benvor Digital',button:{label:'About Benvor',url:'/about/'},stats:[{icon:'trend',value:'10+',label:'Years Experience'}]});break;
    case 'hero_lead_form':Object.assign(c,{eyebrow:'Growth Agency',heading:'Turn more digital activity into measurable growth.',text:'Performance marketing, SEO & AEO, lead generation and analytics designed around business outcomes.',primary_button:{label:'Get a Free Growth Audit',url:'/growth-audit/'},secondary_button:{label:'View Case Studies',url:'/case-studies/'},form_heading:'Get Your Free Growth Audit',form_text:'Tell us what you want to improve.',form_fields:[{type:'text',name:'name',label:'Name',placeholder:'Your name',required:true},{type:'email',name:'email',label:'Business Email',placeholder:'you@company.com',required:true}],submit_label:'Get My Free Audit',trust_note:'No obligation.',stats:[{icon:'trend',value:'10+',label:'Years Experience'}]});break;
    case 'growth_score':Object.assign(c,{section_id:'growth-audit',eyebrow:'Growth Audit',heading:'Find your next growth opportunity',text:'Answer a few questions to identify the strongest first move.',questions:[{type:'select',name:'goal',label:'Primary goal',required:true,options:['More leads','More sales','Better visibility','Better tracking']}],submit_label:'Calculate My Growth Score',success_heading:'Your next step is clear',success_text:'We can turn these answers into a focused action plan.',booking_heading:'Want to discuss it?',booking_text:'Book a strategy call.',booking_button:{label:'Book a Strategy Call',url:'/book-strategy-call/'}});break;
    case 'contact_split':Object.assign(c,{heading:'Let’s talk about your growth goals',text:'Tell us what you are trying to achieve.',fields:[{type:'text',name:'name',label:'Name',placeholder:'Your name',required:true},{type:'email',name:'email',label:'Email',placeholder:'you@company.com',required:true},{type:'textarea',name:'message',label:'Message',placeholder:'How can we help?',required:true}],submit_label:'Send Enquiry',contact_cards:[{label:'Email',value:'info@benvordigital.com',link:'mailto:info@benvordigital.com'}]});break;
    case 'dual_cta':Object.assign(c,{heading:'Choose your next step',text:'Start with the option that fits where you are now.',primary:{eyebrow:'Audit',title:'Get a Free Growth Audit',text:'Find the highest-leverage opportunities.',button_label:'Get My Audit',button_url:'/growth-audit/'},secondary:{eyebrow:'Call',title:'Book a Strategy Call',text:'Talk through your growth priorities.',button_label:'Book a Call',button_url:'/book-strategy-call/'}});break;
    case 'selected_work':Object.assign(c,{heading:'Selected Work',text:'A selection of projects and outcomes.',projects:['nexora-saas','purely-skincare','levelup-financial'],button:{label:'View Case Studies',url:'/case-studies/'}});break;
    case 'portfolio_grid':Object.assign(c,{heading:'Case Studies',text:'Explore selected projects.',filter_all_label:'All',projects:['nexora-saas','purely-skincare','levelup-financial','brightline','flowua','cloudix']});break;
    case 'testimonials':Object.assign(c,{heading:'What clients say',testimonials:['sarah-thompson','david-chen','james-carter']});break;
    case 'trust_stats':Object.assign(c,{label:'Experience across the platforms growth teams rely on',brands:[{name:'Google Ads',image:''},{name:'Meta Ads',image:''},{name:'GA4',image:''}],metrics:[{value:'10+',label:'Years Experience'}]});s.layout.padding_top='small';s.layout.padding_bottom='small';break;
    case 'stats':Object.assign(c,{items:[{value:'10+',label:'Years Experience'},{value:'B2B + B2C',label:'Cross-Market Experience'},{value:'Australia + Global',label:'Client Reach'}]});break;
    case 'why_benvor':Object.assign(c,{heading:'Why Benvor Digital?',items:[{icon:'target',title:'Outcome focused',text:'Strategy and execution tied to measurable goals.'},{icon:'chart',title:'Data informed',text:'Decisions backed by useful measurement.'},{icon:'users',title:'Practical collaboration',text:'Clear communication and accountable delivery.'}]});break;
    case 'problem_nav':Object.assign(c,{eyebrow:'Start With the Outcome',heading:'What do you need help with?',text:'Choose the problem you want to solve first.',items:[{icon:'users',title:'I need more leads',text:'Build a stronger acquisition system.',button_label:'Explore Lead Generation',button_url:'/services/'},{icon:'search',title:'I need more visibility',text:'Improve organic and AI search discoverability.',button_label:'Explore SEO & AEO',button_url:'/services/'}]});break;
    case 'comparison':Object.assign(c,{eyebrow:'A Better Model',heading:'A more accountable growth partnership',left_heading:'Traditional approach',right_heading:'Benvor Digital',rows:[{left:'Disconnected tactics',right:'Integrated growth system'},{left:'Vanity metrics',right:'Business-focused measurement'},{left:'Slow reporting',right:'Clear, useful insight'}]});break;
    case 'local_credibility':Object.assign(c,{eyebrow:'Sydney Based',heading:'Local presence. Global capability.',text:'Work with Benvor Digital from our Bondi Junction office.',address:'Level 1, 9-13 Bronte Road, Bondi Junction, Sydney, NSW, Australia, 2022',email:'info@benvordigital.com',button:{label:'Contact Us',url:'/contact/'}});break;
    case 'team':Object.assign(c,{eyebrow:'Team',heading:'Meet the team',text:'The people behind the work.',team:['alex-morgan','rina-lee','omar-rahman']});break;
    case 'cta':Object.assign(c,{heading:'Ready to build your next growth system?',text:'Tell us what you want to improve and we’ll recommend the strongest first move.',button:{label:'Get a Free Growth Audit',url:'/growth-audit/'}});break;
    case 'divider':break;case 'spacer':Object.assign(c,{height:48});break;
    case 'hero_dashboard':Object.assign(c,{eyebrow:'Digital Growth Agency',heading:'Marketing built for measurable growth.',highlight:'',text:'Connect strategy, execution and measurement.',primary_button:{label:'Get a Free Growth Audit',url:'/growth-audit/'},secondary_button:{label:'View Our Work',url:'/case-studies/'},stats:[{icon:'trend',value:'10+',label:'Years Experience'}],dashboard:{label:'Growth Overview',period:'Last 30 days',metric_label:'Revenue',metric_value:'$124K',metric_change:'+18%',conversions_label:'Conversions',conversions:'842',conversion_change:'+22%',channels_label:'Top Channels',channels:[{label:'Paid Search',value:42},{label:'Organic',value:31},{label:'Social',value:27}],chart_values:[20,32,30,44,51,48,61,69,76,82,91,96]}});break;
    }return s}

  function marker(kind,url){return `[[${kind}:${url||''}]]`}
  function makeEmbedSection(kind,url=''){
    const s=makeSection('rich_text');
    const labels={youtube:'YouTube',map:'Google Maps',drive:'Google Drive content',chart:'Chart'};
    s.section_name=labels[kind]||nice(kind);s.content.eyebrow='';s.content.heading=labels[kind]||nice(kind);s.content.body=marker(kind,url);
    return s
  }
  function parseEmbedMarker(section){const body=section?.content?.body;if(typeof body!=='string')return null;const m=body.trim().match(/^\[\[(youtube|map|drive|chart):([\s\S]*)\]\]$/i);return m?{kind:m[1].toLowerCase(),url:m[2].trim()}:null}

  function insertSectionObject(section,afterIndex=state.selected){
    pushHistory();const arr=state.page.sections||(state.page.sections=[]);const pos=Number.isInteger(afterIndex)&&afterIndex>=0?Math.min(afterIndex+1,arr.length):arr.length;arr.splice(pos,0,section);state.selected=pos;markDirty('page');renderAll();renderFrame();return pos
  }
  function addInsertType(type,afterIndex=state.selected){
    if(['youtube','map','drive','chart'].includes(type)){insertSectionObject(makeEmbedSection(type,''),afterIndex);toast(`${nice(type)} block added. Add the embed URL in Content.`);return}
    if(type==='carousel'){const s=makeSection('gallery');s.section_name='Image Carousel';s.content.heading='Image Carousel';insertSectionObject(s,afterIndex);return}
    const map={text:'rich_text',images:'gallery',button:'cta',form:'contact_split'};const sectionType=map[type]||type;insertSectionObject(makeSection(sectionType),afterIndex);toast(`${SECTION_LABELS[sectionType]||nice(sectionType)} added`)
  }

  function renderAll(){renderSide();renderPageTree();injectIcons()}
  function renderSide(){
    const tabs=$$('#bv-main-tabs button');tabs.forEach(b=>{const active=b.dataset.panel===state.panel&&state.selected<0;b.classList.toggle('active',active);b.setAttribute('aria-selected',active?'true':'false')});
    if(state.selected>=0&&state.page?.sections?.[state.selected])renderInspector();else if(state.panel==='pages')renderPagesTab();else if(state.panel==='themes')renderThemes();else renderInsert()
  }

  function renderInsert(){
    const host=$('#bv-side-content');host.innerHTML=`
      <h2 class="bv-panel-title">Insert</h2><p class="bv-panel-subtitle">Add content to the page. Click an item or drag it onto the canvas.</p>
      <div class="bv-search"><span class="bv-icon" data-icon="search"></span><input id="bv-insert-search" type="search" placeholder="Search content"></div>
      <div id="bv-insert-library"></div>`;injectIcons(host);
    const draw=(term='')=>{
      const q=term.trim().toLowerCase();const library=$('#bv-insert-library');
      const quick=[['text','text','Text box'],['images','image','Images'],['button','button','Button'],['divider','divider','Divider']].filter(x=>x[2].toLowerCase().includes(q));
      const components=[['carousel','carousel','Image carousel'],['youtube','youtube','YouTube'],['map','map','Maps'],['form','form','Form'],['chart','chart','Chart'],['drive','drive','Google Drive content'],['faq','page','FAQ'],['testimonials','page','Testimonials'],['spacer','spacer','Spacer']].filter(x=>x[2].toLowerCase().includes(q));
      const layouts=[['page_hero','stack','Hero'],['image_text','two','Image + text'],['flex_cards','three','Cards'],['services_grid','three','Services']].filter(x=>x[2].toLowerCase().includes(q));
      library.innerHTML=`
        ${quick.length?`<div class="bv-section-label">Basic</div><div class="bv-quick-insert">${quick.map(x=>`<button class="bv-quick-card" type="button" draggable="true" data-insert="${x[0]}"><span class="bv-icon" data-icon="${x[1]}"></span><strong>${x[2]}</strong></button>`).join('')}</div>`:''}
        ${layouts.length?`<div class="bv-section-label">Layouts</div><div class="bv-layout-grid">${layouts.map(x=>`<button class="bv-layout-card" type="button" draggable="true" data-insert="${x[0]}"><span class="bv-layout-thumb ${x[1]}"><i></i><i></i><i></i></span><span>${x[2]}</span></button>`).join('')}</div>`:''}
        ${components.length?`<div class="bv-section-label">Content blocks</div><div class="bv-component-list">${components.map(x=>`<button class="bv-component-row" type="button" draggable="true" data-insert="${x[0]}"><span class="bv-icon" data-icon="${x[1]}"></span><span>${x[2]}</span>${['youtube','map','chart','drive'].includes(x[0])?'<small>Embed</small>':''}</button>`).join('')}</div>`:''}
        ${!quick.length&&!layouts.length&&!components.length?'<div class="bv-empty">No blocks match your search.</div>':''}`;
      injectIcons(library);
      library.querySelectorAll('[data-insert]').forEach(btn=>{
        btn.addEventListener('click',()=>{const t=btn.dataset.insert;if(['youtube','map','drive','chart'].includes(t))openEmbedModal(t);else addInsertType(t)});
        btn.addEventListener('dragstart',e=>{e.dataTransfer.setData('application/x-benvor-block',btn.dataset.insert);e.dataTransfer.effectAllowed='copy'})
      })
    };
    draw();$('#bv-insert-search').addEventListener('input',e=>draw(e.target.value))
  }

  function renderPagesTab(){
    const host=$('#bv-side-content');host.innerHTML=`<h2 class="bv-panel-title">Pages</h2><p class="bv-panel-subtitle">Switch pages and manage the selected page.</p><div class="bv-page-tab-list">${state.pages.map(p=>`<button class="bv-page-tab-row ${p.slug===state.slug?'active':''}" data-page="${esc(p.slug)}"><span class="bv-icon" data-icon="page"></span><div><strong>${esc(p.title)}</strong><small>${esc(p.path||currentRoute(p.slug))}</small></div></button>`).join('')}</div>${pageDetailsHTML()}`;injectIcons(host);
    host.querySelectorAll('[data-page]').forEach(b=>b.onclick=()=>loadPage(b.dataset.page));bindPageDetailFields(host)
  }
  function pageDetailsHTML(){if(!state.page)return '';const s=state.page.seo||{};return `<div class="bv-page-details"><div class="bv-section-label">Selected page</div>${fieldHTML('title',state.page.title,'Page name',false,'page-root')}<div class="bv-field-group"><label>Page URL</label><div class="bv-readonly-route">${esc(currentRoute(state.slug))}</div></div>${fieldHTML('published',state.page.published!==false,'Published',false,'page-root')}${fieldHTML('show_header',state.page.show_header!==false,'Show header',false,'page-root')}${fieldHTML('show_footer',state.page.show_footer!==false,'Show footer',false,'page-root')}<div class="bv-section-label">SEO</div>${fieldHTML('seo.title',s.title||'','SEO title',false,'page-root')}${fieldHTML('seo.description',s.description||'','Meta description',false,'page-root')}<div class="bv-inline-actions"><button type="button" id="bv-open-live">View live</button><button type="button" id="bv-open-safe">Safe CMS</button></div></div>`}
  function bindPageDetailFields(root){bindFields(root);$('#bv-open-live')?.addEventListener('click',()=>window.open(SITE+currentRoute(state.slug),'_blank','noopener'));$('#bv-open-safe')?.addEventListener('click',()=>window.open(`/admin/safe.html#/collections/pages/entries/${encodeURIComponent(state.slug)}`,'_blank','noopener'))}

  function renderThemes(){
    const t=state.settings?.theme||{},d=state.settings?.design||{};const host=$('#bv-side-content');
    host.innerHTML=`<h2 class="bv-panel-title">Themes</h2><p class="bv-panel-subtitle">Global fonts, colors, buttons and site appearance.</p>
      <div class="bv-theme-card"><div class="bv-theme-preview"><i></i></div><strong>Benvor Light</strong><small>Light mode is locked for consistent brand presentation.</small></div>
      <div class="bv-control-section"><div class="bv-control-title"><span>Fonts</span></div>${selectHTML('theme.heading_font',t.heading_font||'Manrope','Heading font',['Manrope','Inter','Arial','Georgia'],'settings')}${selectHTML('theme.body_font',t.body_font||'Inter','Body font',['Inter','Manrope','Arial','Georgia'],'settings')}</div>
      <div class="bv-control-section"><div class="bv-control-title"><span>Colors</span></div><div class="bv-color-grid">${colorHTML('theme.primary',t.primary||'#2563EB','Primary')}${colorHTML('theme.navy',t.navy||'#0A1F33','Navy')}${colorHTML('theme.heading',t.heading||'#0A1F33','Heading')}${colorHTML('theme.body',t.body||'#405266','Body')}${colorHTML('theme.surface',t.surface||'#F5F7FA','Surface')}${colorHTML('theme.border',t.border||'#E4E8EE','Border')}</div></div>
      <div class="bv-control-section"><div class="bv-control-title"><span>Button styles</span></div>${rangeNumberHTML('design.button_radius',d.button_radius??10,'Button radius',0,30,'settings')}</div>
      <div class="bv-control-section"><div class="bv-control-title"><span>Site appearance</span></div>${rangeNumberHTML('design.card_radius',d.card_radius??14,'Card radius',0,36,'settings')}${rangeNumberHTML('design.section_spacing',d.section_spacing??92,'Section spacing',40,160,'settings')}${rangeNumberHTML('theme.container_width',t.container_width??1240,'Content width',900,1600,'settings')}</div>`;
    bindFields(host);bindColorBoxes(host)
  }

  function renderInspector(){
    const s=state.page.sections[state.selected];if(!s){state.selected=-1;return renderSide()}
    const host=$('#bv-side-content'),tabs=['content','layout','design','responsive','advanced'];const embed=parseEmbedMarker(s);
    host.innerHTML=`<div class="bv-inspector-head"><button class="bv-inspector-back" id="bv-inspector-back" type="button"><span class="bv-icon" data-icon="back"></span></button><div class="bv-inspector-title"><strong>${esc(s.section_name||SECTION_LABELS[s.type]||nice(s.type))}</strong><small>${esc(SECTION_LABELS[s.type]||nice(s.type))}</small></div><div class="bv-inspector-actions"><button id="bv-inspector-dup" type="button" title="Duplicate"><span class="bv-icon" data-icon="copy"></span></button><button id="bv-inspector-delete" class="danger" type="button" title="Delete"><span class="bv-icon" data-icon="trash"></span></button></div></div>
      <div class="bv-inspector-tabs">${tabs.map(t=>`<button type="button" data-inspector-tab="${t}" class="${state.inspectorTab===t?'active':''}">${t}</button>`).join('')}</div><div id="bv-inspector-fields"></div>`;injectIcons(host);
    $('#bv-inspector-back').onclick=()=>{state.selected=-1;renderSide();renderFrame()};$('#bv-inspector-dup').onclick=()=>duplicateSection(state.selected);$('#bv-inspector-delete').onclick=()=>deleteSection(state.selected);host.querySelectorAll('[data-inspector-tab]').forEach(b=>b.onclick=()=>{state.inspectorTab=b.dataset.inspectorTab;renderInspector()});
    const fields=$('#bv-inspector-fields');
    if(state.inspectorTab==='advanced'&&!state.developer){fields.innerHTML='<div class="bv-dev-banner"><strong>Developer Mode</strong><p>Advanced controls stay hidden by default. Enable Developer Mode for custom classes, anchors, z-index, sticky positioning and technical settings.</p><button id="bv-enable-dev" type="button">Enable Developer Mode</button></div>';$('#bv-enable-dev').onclick=()=>{state.developer=true;renderInspector()};return}
    if(state.inspectorTab==='content'&&embed){fields.innerHTML=`<div class="bv-embed-editor"><strong>${esc(nice(embed.kind))} embed</strong><small>Paste a public embed/share URL. The renderer converts supported YouTube and Google Drive URLs to safe preview URLs automatically.</small><div class="bv-field-group"><label>Embed URL</label><input id="bv-embed-url" type="url" value="${esc(embed.url)}" placeholder="https://..."></div></div>${objectHTML({...s.content,body:undefined},'content','section')}`;$('#bv-embed-url').addEventListener('focus',()=>pushHistory(),{once:true});$('#bv-embed-url').addEventListener('input',e=>{s.content.body=marker(embed.kind,e.target.value.trim());markDirty('page');scheduleFrame()});bindFields(fields);return}
    if(state.inspectorTab==='advanced'){
      fields.innerHTML=`<div class="bv-control-section"><div class="bv-control-title"><span>Section</span></div>${fieldHTML('section_name',s.section_name||SECTION_LABELS[s.type]||nice(s.type),'Section name',false,'section')}${fieldHTML('enabled',s.enabled!==false,'Enabled',false,'section')}${selectHTML('visual_preset',s.visual_preset||'standard','Visual preset',['standard','compact','narrow','wide','full_bleed','feature','full_screen'],'section')}</div>${objectHTML(s.advanced||{},'advanced','section')}`;
      bindFields(fields);return
    }
    const obj=s[state.inspectorTab]||{};fields.innerHTML=objectHTML(obj,state.inspectorTab,'section');bindFields(fields)
  }
  function renderInspectorOnly(){if(state.selected>=0)renderInspector()}

  function inputKind(key,value){if(typeof value==='boolean')return 'bool';if(typeof value==='number')return 'number';if(typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value))return 'color';if(typeof value==='string'&&/(body|text|description|answer|bio|excerpt|note|message|quote|challenge|solution|result)$/i.test(key))return 'textarea';return 'text'}
  function optionsFor(path){const key=path.split('.').pop();return LAYOUT_OPTIONS[key]||DESIGN_OPTIONS[key]||null}
  function fieldHTML(path,value,label,forceColor=false,scope='section'){
    const key=path.split('.').pop(),opts=optionsFor(path);if(typeof value==='boolean')return `<label class="bv-check"><span>${esc(label||nice(key))}</span><input class="bv-switch" data-scope="${scope}" data-path="${esc(path)}" type="checkbox" ${value?'checked':''}></label>`;
    if(opts)return selectHTML(path,value,label||nice(key),opts,scope);const kind=forceColor?'color':inputKind(key,value);if(kind==='textarea')return `<div class="bv-field-group"><label>${esc(label||nice(key))}</label><textarea data-scope="${scope}" data-path="${esc(path)}">${esc(value)}</textarea></div>`;
    if(kind==='color')return `<div class="bv-field-group"><label>${esc(label||nice(key))}</label><div class="bv-field-inline"><input data-scope="${scope}" data-path="${esc(path)}" type="text" value="${esc(value)}"><input data-color-sync="${esc(path)}" data-scope="${scope}" type="color" value="${/^#[0-9a-f]{6}$/i.test(String(value))?esc(value):'#2563eb'}"></div></div>`;
    const type=typeof value==='number'?'number':/(url|link|image)$/i.test(key)?'url':'text';return `<div class="bv-field-group"><label>${esc(label||nice(key))}</label><input data-scope="${scope}" data-path="${esc(path)}" type="${type}" value="${esc(value??'')}"></div>`
  }
  function selectHTML(path,value,label,options,scope='section'){return `<div class="bv-field-group"><label>${esc(label)}</label><select data-scope="${scope}" data-path="${esc(path)}">${options.map(o=>`<option value="${esc(o)}" ${String(value)===String(o)?'selected':''}>${esc(nice(o))}</option>`).join('')}</select></div>`}
  function colorHTML(path,value,label){return `<label class="bv-color-field"><input type="color" data-scope="settings" data-path="${esc(path)}" value="${esc(value)}"><span>${esc(label)}</span></label>`}
  function rangeNumberHTML(path,value,label,min,max,scope='settings'){return `<div class="bv-field-group"><label>${esc(label)}</label><input type="number" min="${min}" max="${max}" data-scope="${scope}" data-path="${esc(path)}" value="${esc(value)}"></div>`}
  function objectHTML(obj,prefix='',scope='section',depth=0){if(obj==null)return '<div class="bv-empty">No settings for this section.</div>';let html='';Object.entries(obj).forEach(([k,v])=>{if(v===undefined)return;const p=prefix?`${prefix}.${k}`:k;if(Array.isArray(v)){html+=`<details class="bv-object" ${depth<1?'open':''}><summary>${esc(nice(k))}<span>${v.length} item${v.length===1?'':'s'}</span></summary><div class="bv-object-body">${v.map((item,i)=>`<div class="bv-array-card"><div class="bv-array-card-head"><strong>${esc(nice(k))} ${i+1}</strong><button data-array-remove="${esc(`${p}.${i}`)}" data-scope="${scope}" type="button">×</button></div>${typeof item==='object'?objectHTML(item,`${p}.${i}`,scope,depth+1):fieldHTML(`${p}.${i}`,item,`Item ${i+1}`,false,scope)}</div>`).join('')}<button class="bv-add-array" data-array-add="${esc(p)}" data-scope="${scope}" type="button">＋ Add item</button></div></details>`}else if(v&&typeof v==='object'){html+=`<details class="bv-object" ${depth<1?'open':''}><summary>${esc(nice(k))}</summary><div class="bv-object-body">${objectHTML(v,p,scope,depth+1)}</div></details>`}else html+=fieldHTML(p,v,nice(k),false,scope)});return html||'<div class="bv-empty">No editable settings in this group.</div>'}

  function objectForScope(scope){if(scope==='settings')return state.settings;if(scope==='page-root')return state.page;return state.page.sections[state.selected]}
  function bindFields(root){
    root.querySelectorAll('[data-path]').forEach(el=>{
      const begin=()=>{if(el.dataset.hist)return;pushHistory();el.dataset.hist='1'};el.addEventListener('focus',begin);if(el.type==='checkbox')el.addEventListener('pointerdown',begin,{once:true});
      const update=()=>{const scope=el.dataset.scope,obj=objectForScope(scope);let v=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;setPath(obj,el.dataset.path,v);markDirty(scope==='settings'?'settings':'page');if(scope==='settings'){if(el.dataset.path==='brand.company_name')$('#bv-site-title').value=v;scheduleFrame()}else if(scope==='page-root'){if(el.dataset.path==='title'){state.page.title=v;$('#bv-current-page-name').textContent=v;renderPageTree()}scheduleFrame()}else scheduleFrame()};
      el.addEventListener(el.tagName==='SELECT'||el.type==='checkbox'||el.type==='color'?'change':'input',update);el.addEventListener('blur',()=>delete el.dataset.hist)
    });
    root.querySelectorAll('[data-color-sync]').forEach(c=>c.addEventListener('input',()=>{const text=root.querySelector(`[data-path="${CSS.escape(c.dataset.colorSync)}"][data-scope="${c.dataset.scope}"]`);if(text){if(!text.dataset.hist){pushHistory();text.dataset.hist='1'}text.value=c.value;text.dispatchEvent(new Event('input',{bubbles:true}))}}));
    root.querySelectorAll('[data-array-remove]').forEach(b=>b.onclick=()=>{pushHistory();const scope=b.dataset.scope,obj=objectForScope(scope);delPath(obj,b.dataset.arrayRemove);markDirty(scope==='settings'?'settings':'page');renderSide();renderFrame()});
    root.querySelectorAll('[data-array-add]').forEach(b=>b.onclick=()=>{pushHistory();const scope=b.dataset.scope,obj=objectForScope(scope),arr=getPath(obj,b.dataset.arrayAdd);if(!Array.isArray(arr))return;let sample=arr.length?clone(arr[arr.length-1]):'';if(sample&&typeof sample==='object'){Object.keys(sample).forEach(k=>{if(typeof sample[k]==='string')sample[k]='';if(typeof sample[k]==='boolean')sample[k]=false})}arr.push(sample);markDirty(scope==='settings'?'settings':'page');renderSide();renderFrame()})
  }
  function bindColorBoxes(root){root.querySelectorAll('input[type="color"][data-path]').forEach(c=>c.addEventListener('input',()=>{const obj=objectForScope(c.dataset.scope);setPath(obj,c.dataset.path,c.value);markDirty('settings');scheduleFrame()}))}

  function renderPageTree(){
    const host=$('#bv-page-tree');if(!host)return;
    const extra=state.pages.filter(p=>!KNOWN_PAGES.some(k=>k.slug===p.slug));
    const row=(node,depth=0)=>{
      const active=node.slug===state.slug,has=!!node.children?.length,open=state.expanded.has(node.slug);return `<div class="bv-tree-node"> <button class="bv-tree-row ${active?'active':''}" style="--depth:${depth}" data-tree-page="${esc(node.slug)}" data-external="${node.external?'1':'0'}" role="treeitem"><span class="bv-tree-expander ${has?'':'placeholder'}" data-expand="${esc(node.slug)}">${has?svg('chevron'):''}</span><span class="bv-tree-icon"><span class="bv-icon">${svg(node.slug==='home'?'home':'page')}</span></span><span class="bv-tree-title">${esc(node.title)}</span><span class="bv-tree-menu" data-page-menu="${esc(node.slug)}">${svg('more')}</span></button>${has&&open?node.children.map(c=>row(c,depth+1)).join(''):''}</div>`
    };
    host.innerHTML=PAGE_TREE.map(n=>row(n)).join('')+(extra.length?`<div class="bv-tree-group-label">Custom pages</div>${extra.map(n=>row(n)).join('')}`:'');
    host.querySelectorAll('[data-expand]').forEach(b=>b.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const slug=b.dataset.expand;if(state.expanded.has(slug))state.expanded.delete(slug);else state.expanded.add(slug);renderPageTree()}));
    host.querySelectorAll('[data-tree-page]').forEach(b=>b.addEventListener('click',e=>{if(e.target.closest('[data-page-menu]')||e.target.closest('[data-expand]'))return;const slug=b.dataset.treePage;if(b.dataset.external==='1'){window.open('/blog/','_blank','noopener');return}loadPage(slug)}));
    host.querySelectorAll('[data-page-menu]').forEach(b=>b.addEventListener('click',e=>openPageMenu(b.dataset.pageMenu,e)))
  }

  function openNewPage(){
    const names=Object.keys(TEMPLATE_RECIPES);$('#bv-modal-root').innerHTML=`<div class="bv-modal"><div class="bv-modal-card"><div class="bv-modal-head"><strong>Create a new page</strong><button type="button" data-close>×</button></div><div class="bv-modal-body"><div class="bv-template-grid">${names.map((n,i)=>`<button class="bv-template ${i===0?'active':''}" type="button" data-template="${esc(n)}"><span class="bv-template-preview"><i></i><i></i><i></i></span><strong>${esc(n)}</strong><small>${n==='Blank Page'?'Start from an empty canvas':'Start with a recommended Benvor layout'}</small></button>`).join('')}</div><div class="bv-new-fields"><label>Page title<input id="bv-new-title" placeholder="New Page"></label><label>URL slug<input id="bv-new-slug" placeholder="new-page"></label></div></div><div class="bv-modal-foot"><button class="bv-secondary-small" type="button" data-close>Cancel</button><button class="bv-primary-small" type="button" id="bv-create-page">Create page</button></div></div></div>`;
    let template='Blank Page';$$('.bv-template').forEach(b=>b.onclick=()=>{$$('.bv-template').forEach(x=>x.classList.remove('active'));b.classList.add('active');template=b.dataset.template});$$('[data-close]').forEach(b=>b.onclick=closeModal);const title=$('#bv-new-title'),slug=$('#bv-new-slug');title.oninput=()=>{if(!slug.dataset.touched)slug.value=slugify(title.value)};slug.oninput=()=>slug.dataset.touched='1';$('#bv-create-page').onclick=()=>createNewPage(title.value,slug.value,template)
  }
  function createNewPage(title,slug,template){title=title.trim();slug=slugify(slug||title);if(!title||!slug){toast('Add a page title and slug');return}if(state.pages.some(p=>p.slug===slug)){toast('That slug already exists');return}const sections=TEMPLATE_RECIPES[template].map(makeSection);state.slug=slug;state.page={title,slug,published:true,show_header:true,show_footer:true,seo:{title:`${title} | Benvor Digital`,description:'',canonical_url:`${SITE}/page/?slug=${slug}`,og_title:title,og_description:'',og_image:'',noindex:false,schema_type:'WebPage'},sections};state.pages.push({title,slug,path:currentRoute(slug)});state.selected=sections.length?0:-1;state.dirty=true;state.history=[];state.future=[];closeModal();savePageDraft();updateChrome();renderAll();renderFrame();toast('Page created locally. Publish when ready')}
  function closeModal(){$('#bv-modal-root').innerHTML=''}

  function openEmbedModal(kind){
    const labels={youtube:'YouTube',map:'Google Maps',drive:'Google Drive content',chart:'Chart'};const tips={youtube:'Paste a YouTube watch, share, or embed URL.',map:'Paste a Google Maps embed URL.',drive:'Paste a public Google Drive, Docs, Sheets or Slides share URL.',chart:'Paste a published chart/embed URL, for example from Google Sheets.'};
    $('#bv-modal-root').innerHTML=`<div class="bv-modal"><div class="bv-modal-card small"><div class="bv-modal-head"><strong>Add ${esc(labels[kind])}</strong><button type="button" data-close>×</button></div><div class="bv-modal-body"><label class="bv-modal-label">Embed or share URL<input id="bv-embed-modal-url" type="url" placeholder="https://..."></label><p class="bv-modal-help">${esc(tips[kind])}</p></div><div class="bv-modal-foot"><button class="bv-secondary-small" type="button" data-close>Cancel</button><button class="bv-primary-small" type="button" id="bv-add-embed">Insert</button></div></div></div>`;$$('[data-close]').forEach(b=>b.onclick=closeModal);$('#bv-add-embed').onclick=()=>{const url=$('#bv-embed-modal-url').value.trim();insertSectionObject(makeEmbedSection(kind,url));closeModal();toast(`${labels[kind]} added`)};$('#bv-embed-modal-url').focus()
  }

  function openPageMenu(slug,e){
    e.preventDefault();e.stopPropagation();const p=state.pages.find(x=>x.slug===slug)||{title:nice(slug),slug,path:currentRoute(slug)};showMenu(e.currentTarget||e.target,`<div class="bv-menu-head"><strong>${esc(p.title)}</strong><small>${esc(p.path||currentRoute(slug))}</small></div><button class="bv-menu-item" data-live>${svg('external')} View live page</button><button class="bv-menu-item" data-copy>${svg('link')} Copy page URL</button>${slug!=='blog'?`<button class="bv-menu-item" data-safe>${svg('pages')} Edit in Safe CMS</button><button class="bv-menu-item" data-dup>${svg('copy')} Duplicate page</button>`:''}`,(m)=>{
      m.querySelector('[data-live]')?.addEventListener('click',()=>window.open(SITE+(slug==='blog'?'/blog/':currentRoute(slug)),'_blank','noopener'));
      m.querySelector('[data-copy]')?.addEventListener('click',async()=>{await copyText(SITE+(slug==='blog'?'/blog/':currentRoute(slug)));closeMenus();toast('Page URL copied')});
      m.querySelector('[data-safe]')?.addEventListener('click',()=>window.open(`/admin/safe.html#/collections/pages/entries/${encodeURIComponent(slug)}`,'_blank','noopener'));
      m.querySelector('[data-dup]')?.addEventListener('click',()=>{closeMenus();duplicatePageLocal(slug)})
    })
  }
  async function duplicatePageLocal(slug){try{const src=slug===state.slug?clone(state.page):await getJSON(`/content/pages/${encodeURIComponent(slug)}.json`);const title=`${src.title||nice(slug)} Copy`,newSlug=uniqueSlug(`${slug}-copy`);src.title=title;src.slug=newSlug;src.seo=src.seo||{};src.seo.title=`${title} | Benvor Digital`;src.seo.canonical_url=`${SITE}/page/?slug=${newSlug}`;state.pages.push({title,slug:newSlug,path:currentRoute(newSlug)});localStorage.setItem(pageDraftKey(newSlug),JSON.stringify({savedAt:Date.now(),page:src}));await loadPage(newSlug);state.dirty=true;setStatus('New page draft','dirty');toast('Page duplicated locally')}catch(e){console.error(e);toast('Could not duplicate page')}}
  function uniqueSlug(base){let x=base,i=2;while(state.pages.some(p=>p.slug===x)){x=`${base}-${i++}`}return x}

  function openSettings(){state.settingsTab=state.settingsTab||'navigation';$('#bv-settings-backdrop').hidden=false;$('#bv-settings-drawer').classList.add('open');$('#bv-settings-drawer').setAttribute('aria-hidden','false');renderSettings()}
  function closeSettings(){$('#bv-settings-drawer').classList.remove('open');$('#bv-settings-drawer').setAttribute('aria-hidden','true');setTimeout(()=>{$('#bv-settings-backdrop').hidden=true},180)}
  function renderSettings(){
    $$('#bv-settings-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.settingsTab===state.settingsTab));const host=$('#bv-settings-content');
    if(state.settingsTab==='navigation')renderNavigationSettings(host);else if(state.settingsTab==='brand')renderBrandSettings(host);else if(state.settingsTab==='viewer')renderViewerSettings(host);else renderSiteOptions(host);injectIcons(host)
  }
  function renderNavigationSettings(host){const nav=state.settings.navigation||[];host.innerHTML=`<div class="bv-settings-card"><h3>Navigation</h3><p>Control the links shown in the global site navigation.</p>${nav.map((n,i)=>`<div class="bv-settings-row"><input data-nav-label="${i}" value="${esc(n.label)}" aria-label="Navigation label"><input data-nav-url="${i}" value="${esc(n.url)}" aria-label="Navigation URL"><div class="bv-nav-actions"><input class="bv-switch" type="checkbox" data-nav-enabled="${i}" ${n.enabled!==false?'checked':''}><button type="button" data-nav-up="${i}" title="Move up">↑</button><button type="button" data-nav-down="${i}" title="Move down">↓</button></div></div>`).join('')}<button class="bv-add-array" id="bv-add-nav" type="button">＋ Add navigation link</button></div><div class="bv-settings-card"><h3>Header CTA</h3><p>The primary call-to-action shown in the header.</p>${fieldHTML('header_cta.label',state.settings.header_cta?.label||'','Button label',false,'settings')}${fieldHTML('header_cta.url',state.settings.header_cta?.url||'','Button URL',false,'settings')}${fieldHTML('header_cta.enabled',state.settings.header_cta?.enabled!==false,'Enabled',false,'settings')}</div>`;
    bindFields(host);host.querySelectorAll('[data-nav-label]').forEach(el=>el.addEventListener('input',()=>updateNav(el.dataset.navLabel,'label',el.value)));host.querySelectorAll('[data-nav-url]').forEach(el=>el.addEventListener('input',()=>updateNav(el.dataset.navUrl,'url',el.value)));host.querySelectorAll('[data-nav-enabled]').forEach(el=>el.addEventListener('change',()=>updateNav(el.dataset.navEnabled,'enabled',el.checked)));host.querySelectorAll('[data-nav-up]').forEach(b=>b.onclick=()=>moveNav(Number(b.dataset.navUp),-1));host.querySelectorAll('[data-nav-down]').forEach(b=>b.onclick=()=>moveNav(Number(b.dataset.navDown),1));$('#bv-add-nav').onclick=()=>{pushHistory();state.settings.navigation.push({label:'New Link',url:'/',enabled:true});markDirty('settings');renderSettings();scheduleFrame()}
  }
  function updateNav(index,key,value){const i=Number(index);if(!state.settings.navigation?.[i])return;state.settings.navigation[i][key]=value;markDirty('settings');scheduleFrame()}
  function moveNav(i,dir){const arr=state.settings.navigation||[],j=i+dir;if(j<0||j>=arr.length)return;pushHistory();[arr[i],arr[j]]=[arr[j],arr[i]];markDirty('settings');renderSettings();scheduleFrame()}
  function renderBrandSettings(host){const b=state.settings.brand||{};host.innerHTML=`<div class="bv-settings-card"><h3>Brand Images</h3><p>Global logo, favicon and brand identity used across the website.</p><div class="bv-brand-preview"><img id="bv-brand-logo-preview" src="${esc(b.logo_light||'/assets/branding/benvor-horizontal-dark.png')}" alt="Brand logo preview"></div>${fieldHTML('brand.company_name',b.company_name||'Benvor Digital','Site name',false,'settings')}${fieldHTML('brand.logo_light',b.logo_light||'','Header logo',false,'settings')}${fieldHTML('brand.footer_logo_light',b.footer_logo_light||'','Footer logo',false,'settings')}${fieldHTML('brand.logo_alt',b.logo_alt||'Benvor Digital','Logo alt text',false,'settings')}${fieldHTML('brand.favicon',b.favicon||'/favicon.ico','Favicon',false,'settings')}</div>`;bindFields(host);host.querySelector('[data-path="brand.logo_light"]')?.addEventListener('input',e=>{$('#bv-brand-logo-preview').src=e.target.value||'/assets/branding/benvor-horizontal-dark.png'})}
  function renderViewerSettings(host){const l=state.settings.lead_generation||{},d=state.settings.design||{};host.innerHTML=`<div class="bv-settings-card"><h3>Viewer Tools</h3><p>Control useful visitor-facing tools without adding visual clutter.</p>${fieldHTML('lead_generation.sticky_cta_enabled',l.sticky_cta_enabled!==false,'Sticky growth CTA',false,'settings')}${fieldHTML('lead_generation.booking_enabled',l.booking_enabled!==false,'Booking enabled',false,'settings')}${selectHTML('design.motion',d.motion||'subtle','Motion',['none','subtle'],'settings')}</div><div class="bv-settings-card"><h3>Lead experience</h3><p>Global labels used by lead-generation tools.</p>${fieldHTML('lead_generation.sticky_cta_label',l.sticky_cta_label||'','Sticky CTA label',false,'settings')}${fieldHTML('lead_generation.sticky_cta_url',l.sticky_cta_url||'','Sticky CTA URL',false,'settings')}${fieldHTML('lead_generation.booking_label',l.booking_label||'','Booking label',false,'settings')}${fieldHTML('lead_generation.booking_url',l.booking_url||'','Booking URL',false,'settings')}</div>`;bindFields(host)
  }
  function renderSiteOptions(host){const biz=state.settings.business||{},seo=state.settings.seo_defaults||{},footer=state.settings.footer||{};host.innerHTML=`<div class="bv-settings-card"><h3>Site Options</h3><p>Global business and site-level defaults.</p>${fieldHTML('business.email',biz.email||'','Business email',false,'settings')}${fieldHTML('business.office_address',biz.office_address||'','Office address',false,'settings')}${fieldHTML('seo_defaults.title_suffix',seo.title_suffix||'','SEO title suffix',false,'settings')}${fieldHTML('seo_defaults.description',seo.description||'','Default meta description',false,'settings')}</div><div class="bv-settings-card"><h3>Footer</h3><p>Global footer contact details.</p>${fieldHTML('footer.email',footer.email||'','Footer email',false,'settings')}${fieldHTML('footer.address',footer.address||'','Footer address',false,'settings')}${fieldHTML('footer.copyright',footer.copyright||'','Copyright',false,'settings')}</div>`;bindFields(host)
  }

  function showMenu(anchor,html,bind){closeMenus();const m=document.createElement('div');m.className='bv-menu';m.innerHTML=html;$('#bv-menu-root').appendChild(m);const r=anchor.getBoundingClientRect(),mw=250;let left=Math.min(window.innerWidth-mw-10,Math.max(10,r.right-mw)),top=Math.min(window.innerHeight-20,r.bottom+6);m.style.left=`${left}px`;m.style.top=`${top}px`;requestAnimationFrame(()=>{const mr=m.getBoundingClientRect();if(mr.bottom>window.innerHeight-10)m.style.top=`${Math.max(10,r.top-mr.height-6)}px`});bind?.(m);setTimeout(()=>document.addEventListener('pointerdown',menuOutside,{once:true}),0)}
  function menuOutside(e){const m=$('.bv-menu');if(m&&!m.contains(e.target))closeMenus()}
  function closeMenus(){$('#bv-menu-root').innerHTML=''}

  async function copyText(text){try{await navigator.clipboard.writeText(text)}catch(_){const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove()}}
  function shareMenu(){showMenu($('#bv-share'),`<div class="bv-menu-head"><strong>Share</strong><small>Share the live site or current page.</small></div><button class="bv-menu-item" data-current>${svg('link')} Copy current page link</button><button class="bv-menu-item" data-site>${svg('link')} Copy site link</button><div class="bv-menu-sep"></div><button class="bv-menu-item" data-collab>${svg('github')} GitHub collaborators</button>`,m=>{m.querySelector('[data-current]').onclick=async()=>{await copyText(SITE+currentRoute(state.slug));closeMenus();toast('Page link copied')};m.querySelector('[data-site]').onclick=async()=>{await copyText(SITE);closeMenus();toast('Site link copied')};m.querySelector('[data-collab]').onclick=()=>window.open(`https://github.com/${REPO}/settings/access`,'_blank','noopener')})}
  function moreMenu(){showMenu($('#bv-more'),`<div class="bv-menu-head"><strong>More</strong><small>Builder and recovery tools.</small></div><button class="bv-menu-item" data-dev>${svg('code')} ${state.developer?'Disable':'Enable'} Developer Mode</button><button class="bv-menu-item" data-live>${svg('external')} View live site</button><button class="bv-menu-item" data-safe>${svg('pages')} Open Safe CMS</button><button class="bv-menu-item" data-history>${svg('github')} Version history</button><div class="bv-menu-sep"></div><button class="bv-menu-item danger" data-discard>${svg('trash')} Discard local page draft</button>`,m=>{m.querySelector('[data-dev]').onclick=()=>{state.developer=!state.developer;closeMenus();toast(`Developer Mode ${state.developer?'enabled':'disabled'}`);renderSide()};m.querySelector('[data-live]').onclick=()=>window.open(SITE+currentRoute(state.slug),'_blank','noopener');m.querySelector('[data-safe]').onclick=()=>window.open('/admin/safe.html','_blank','noopener');m.querySelector('[data-history]').onclick=()=>window.open(`https://github.com/${REPO}/commits/${BRANCH}/content/pages/${state.slug}.json`,'_blank','noopener');m.querySelector('[data-discard]').onclick=()=>{closeMenus();if(confirm('Discard the locally saved draft for this page and reload the published version?')){clearPageDraft();loadPage(state.slug,{ignoreDraft:true})}}})}
  function accountMenu(){showMenu($('#bv-account'),state.user?`<div class="bv-menu-head"><strong>${esc(state.user.name||state.user.login)}</strong><small>${esc(state.user.login)}</small></div><button class="bv-menu-item" data-history>${svg('github')} GitHub version history</button><button class="bv-menu-item" data-safe>${svg('pages')} Open Safe CMS</button><div class="bv-menu-sep"></div><button class="bv-menu-item danger" data-out>Sign out</button>`:`<div class="bv-menu-head"><strong>GitHub publishing</strong><small>Sign in only when you publish.</small></div><button class="bv-menu-item" data-in>${svg('github')} Sign in with GitHub</button><button class="bv-menu-item" data-safe>${svg('pages')} Open Safe CMS</button>`,m=>{m.querySelector('[data-in]')?.addEventListener('click',async()=>{closeMenus();await loginGithub()});m.querySelector('[data-out]')?.addEventListener('click',()=>{state.token='';state.user=null;sessionStorage.removeItem('benvor_github_token');$('#bv-account').textContent='G';closeMenus();toast('Signed out')});m.querySelector('[data-safe]')?.addEventListener('click',()=>window.open('/admin/safe.html','_blank','noopener'));m.querySelector('[data-history]')?.addEventListener('click',()=>window.open(`https://github.com/${REPO}/commits/${BRANCH}/content/pages/${state.slug}.json`,'_blank','noopener'))})}

  function openPreview(){const overlay=$('#bv-preview-overlay'),shell=$('#bv-preview-shell'),frame=$('#bv-preview-frame');overlay.hidden=false;shell.innerHTML='';shell.className=`bv-preview-shell ${state.device}`;shell.appendChild(frame);setDevice(state.device);toast('Preview mode')}
  function closePreview(){const frame=$('#bv-preview-frame');$('#bv-preview-overlay').hidden=true;$('#bv-canvas-shell').appendChild(frame);setDevice(state.device)}
  function setDevice(device){state.device=device;const shell=$('#bv-preview-overlay').hidden?$('#bv-canvas-shell'):$('#bv-preview-shell');shell.className=`${$('#bv-preview-overlay').hidden?'bv-canvas-shell':'bv-preview-shell'} ${device}`;$$('[data-device]').forEach(b=>b.classList.toggle('active',b.dataset.device===device))}

  async function loginGithub(){
    if(state.token){try{await verifyUser();return true}catch(_){state.token='';sessionStorage.removeItem('benvor_github_token')}}
    return new Promise(resolve=>{
      const siteId=encodeURIComponent(location.origin),url=`${AUTH_BASE}/auth?provider=github&site_id=${siteId}&scope=repo`,popup=window.open(url,'benvor-github-auth','width=720,height=720,menubar=no,toolbar=no');state.authPopup=popup;if(!popup){toast('Allow pop-ups to sign in');resolve(false);return}
      let done=false;const origin=new URL(AUTH_BASE).origin;const timer=setTimeout(()=>finish(false),120000);
      function finish(ok){if(done)return;done=true;clearTimeout(timer);window.removeEventListener('message',listener);resolve(ok)}
      function listener(e){if(e.origin!==origin)return;const token=parseAuthMessage(e.data);if(!token)return;state.token=token;sessionStorage.setItem('benvor_github_token',token);try{popup.close()}catch(_){}verifyUser().then(()=>{toast('Signed in with GitHub');finish(true)}).catch(()=>{state.token='';sessionStorage.removeItem('benvor_github_token');toast('GitHub sign-in could not be verified');finish(false)})}
      window.addEventListener('message',listener)
    })
  }
  function parseAuthMessage(data){try{if(typeof data==='object'&&data){if(data.token)return data.token;if(data.payload?.token)return data.payload.token}if(typeof data!=='string')return '';for(const p of ['authorization:github:success:','authorization:github:success','authorization:success:']){if(data.startsWith(p)){const rest=data.slice(p.length).replace(/^:/,'');if(!rest)return '';try{const o=JSON.parse(rest);return o.token||o.access_token||o.payload?.token||''}catch(_){return rest}}}const m=data.match(/"token"\s*:\s*"([^"]+)"/);return m?m[1]:''}catch(_){return ''}}
  async function github(path,opts={}){if(!state.token)throw new Error('Not signed in');const r=await fetch(`${API}${path}`,{...opts,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:`Bearer ${state.token}`,...(opts.headers||{})}});if(r.status===204)return null;const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.message||`GitHub ${r.status}`);e.status=r.status;throw e}return data}
  async function verifyUser(){const u=await github('/user');state.user=u;$('#bv-account').textContent=(u.login||'G').slice(0,1).toUpperCase();$('#bv-account').title=u.login||'GitHub';refreshRepoPages().catch(()=>{});return u}
  async function refreshRepoPages(){const items=await github(`/repos/${REPO}/contents/content/pages?ref=${encodeURIComponent(BRANCH)}`);if(!Array.isArray(items))return;for(const x of items.filter(x=>x.type==='file'&&x.name.endsWith('.json'))){const slug=x.name.replace(/\.json$/,'');if(state.pages.some(p=>p.slug===slug))continue;state.pages.push({title:nice(slug),slug,path:currentRoute(slug)})}renderPageTree();if(state.panel==='pages'&&state.selected<0)renderPagesTab()}
  function bytesToBase64(str){const bytes=new TextEncoder().encode(str);let binary='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary)}
  async function publishFile(path,obj,message){let sha;try{const cur=await github(`/repos/${REPO}/contents/${path}?ref=${encodeURIComponent(BRANCH)}`);sha=cur.sha}catch(e){if(e.status!==404)throw e}const body={message,content:bytesToBase64(JSON.stringify(obj,null,2)+'\n'),branch:BRANCH};if(sha)body.sha=sha;return github(`/repos/${REPO}/contents/${path}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
  async function publish(){
    if(!state.page)return;$('#bv-publish').disabled=true;setStatus('Preparing publish…','working');
    try{
      if(!state.token){const ok=await loginGithub();if(!ok)throw new Error('GitHub sign-in required')}
      if(state.dirty){setStatus('Publishing page…','working');await publishFile(`content/pages/${state.slug}.json`,state.page,`Update ${state.page.title||state.slug} from Benvor Sites Builder`)}
      if(state.settingsDirty){setStatus('Publishing site settings…','working');await publishFile('content/settings.json',state.settings,'Update website settings from Benvor Sites Builder')}
      state.dirty=false;state.settingsDirty=false;clearPageDraft();clearSettingsDraft();const p=state.pages.find(x=>x.slug===state.slug);if(p)p.title=state.page.title;updateChrome();setStatus('Published — Cloudflare deployment starting','saved');toast('Published successfully')
    }catch(e){console.error(e);setStatus(e.message||'Publish failed','error');toast(e.message||'Publish failed')}finally{$('#bv-publish').disabled=false}
  }

  function bindChrome(){
    injectIcons();
    $('#bv-undo').onclick=undo;$('#bv-redo').onclick=redo;$('#bv-preview').onclick=openPreview;$('#bv-exit-preview').onclick=closePreview;$('#bv-share').onclick=shareMenu;$('#bv-settings').onclick=openSettings;$('#bv-settings-close').onclick=closeSettings;$('#bv-settings-backdrop').onclick=closeSettings;$('#bv-publish').onclick=publish;$('#bv-more').onclick=moreMenu;$('#bv-account').onclick=accountMenu;$('#bv-new-page').onclick=openNewPage;
    $('#bv-add-section-floating').onclick=()=>{state.selected=-1;state.panel='insert';renderSide();toast('Choose content to insert')};
    $$('#bv-main-tabs button').forEach(b=>b.onclick=()=>{state.selected=-1;state.panel=b.dataset.panel;renderSide();renderFrame()});
    $$('#bv-settings-tabs button').forEach(b=>b.onclick=()=>{state.settingsTab=b.dataset.settingsTab;renderSettings()});
    $$('[data-device]').forEach(b=>b.onclick=()=>setDevice(b.dataset.device));
    $('#bv-site-title').addEventListener('focus',()=>pushHistory());$('#bv-site-title').addEventListener('input',e=>{state.settings.brand=state.settings.brand||{};state.settings.brand.company_name=e.target.value;markDirty('settings');scheduleFrame()});
    $('#bv-pages-toggle').onclick=()=>$('#bv-pages-panel').classList.toggle('open');$('#bv-pages-close').onclick=()=>$('#bv-pages-panel').classList.remove('open');
    document.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==='z'&&!e.shiftKey){e.preventDefault();undo()}else if(mod&&(e.key.toLowerCase()==='y'||(e.key.toLowerCase()==='z'&&e.shiftKey))){e.preventDefault();redo()}else if(mod&&e.key.toLowerCase()==='s'){e.preventDefault();savePageDraft();saveSettingsDraft();toast('Draft saved locally')}else if(e.key==='Escape'){if(!$('#bv-preview-overlay').hidden)closePreview();else if($('#bv-settings-drawer').classList.contains('open'))closeSettings();else closeMenus()}})
  }

  async function init(){
    bindChrome();setDevice('desktop');
    try{state.settings=await getJSON('/content/settings.json');const sd=loadSettingsDraft();if(sd){state.settings=sd.settings;state.settingsDirty=true;toast('Site settings draft restored')}}catch(e){console.error(e);state.settings={brand:{company_name:'Benvor Digital'},theme:{},design:{},navigation:[]};toast('Site settings could not be loaded')}
    await loadPage('home');
    if(state.token)verifyUser().catch(()=>{state.token='';sessionStorage.removeItem('benvor_github_token')});
    $('#bv-app').setAttribute('aria-busy','false')
  }

  document.addEventListener('DOMContentLoaded',init);
})();
