(() => {
  'use strict';

  const REPO = 'benvorgroup/benvordigital';
  const BRANCH = 'main';
  const AUTH_BASE = 'https://benvor-cms-auth.benvorgroup.workers.dev';
  const SITE = 'https://benvordigital.com';
  const API = 'https://api.github.com';
  const KNOWN_PAGES = [
    ['Home','home','/'],['About','about','/about/'],['Services','services','/services/'],['Industries','industries','/industries/'],
    ['E-commerce Marketing','ecommerce-marketing','/ecommerce-marketing/'],['B2B & SaaS Marketing','b2b-saas-marketing','/b2b-saas-marketing/'],
    ['Case Studies','case-studies','/case-studies/'],['Our Process','our-process','/our-process/'],['Why Benvor Digital','why-benvor','/why-benvor/'],
    ['Free Growth Audit','growth-audit','/growth-audit/'],['Book a Strategy Call','book-strategy-call','/book-strategy-call/'],
    ['Portfolio','portfolio','/portfolio/'],['Contact','contact','/contact/']
  ];
  const DIRECT = new Set(KNOWN_PAGES.map(x=>x[1]));
  const SECTION_LABELS = {
    hero_dashboard:'Hero + Analytics',hero_lead_form:'Hero + Lead Form',page_hero:'Page Hero',trust_stats:'Trust + Stats',problem_nav:'Problem Navigation',
    services_grid:'Services Grid',selected_work:'Selected Work',portfolio_grid:'Portfolio Grid',comparison:'Comparison',process:'Process',growth_score:'Growth Score',
    testimonials:'Testimonials',local_credibility:'Local Credibility',faq:'FAQ',dual_cta:'Dual CTA',cta:'Call to Action',why_benvor:'Feature Columns',
    about_preview:'About Preview',image_text:'Image + Text',stats:'Stats',team:'Team',contact_split:'Contact Form',rich_text:'Rich Text',gallery:'Gallery',
    flex_cards:'Cards',divider:'Divider',spacer:'Spacer'
  };
  const BLOCK_GROUPS = [
    ['Text',['page_hero','rich_text','image_text']],['Content blocks',['flex_cards','services_grid','process','faq']],['Images',['gallery','about_preview']],
    ['Lead generation',['hero_lead_form','growth_score','contact_split','dual_cta']],['Proof',['selected_work','portfolio_grid','testimonials','trust_stats','stats']],
    ['Features',['why_benvor','problem_nav','comparison','local_credibility','team']],['Utility',['cta','divider','spacer','hero_dashboard']]
  ];
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

  const $ = (s,r=document)=>r.querySelector(s);
  const $$ = (s,r=document)=>Array.from(r.querySelectorAll(s));
  const clone = v => JSON.parse(JSON.stringify(v));
  const esc = v => String(v ?? '').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#039;','"':'&quot;'}[c]));
  const nice = key => String(key||'').replace(/_/g,' ').replace(/\b\w/g,m=>m.toUpperCase());
  const pathArr = p => String(p||'').split('.').filter(Boolean).map(x=>/^\d+$/.test(x)?Number(x):x);
  const getPath = (o,p)=>pathArr(p).reduce((a,k)=>a==null?undefined:a[k],o);
  function setPath(o,p,v){const a=pathArr(p);let cur=o;for(let i=0;i<a.length-1;i++){const k=a[i];if(cur[k]==null)cur[k]=typeof a[i+1]==='number'?[]:{};cur=cur[k]}cur[a[a.length-1]]=v}
  function delPath(o,p){const a=pathArr(p);let cur=o;for(let i=0;i<a.length-1;i++){if(cur==null)return;cur=cur[a[i]]}if(Array.isArray(cur))cur.splice(a[a.length-1],1);else if(cur)delete cur[a[a.length-1]]}
  function currentRoute(slug){if(slug==='home')return '/';if(DIRECT.has(slug))return `/${slug}/`;return `/page/?slug=${encodeURIComponent(slug)}`}
  function nowLabel(){return new Date().toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}

  const state = {
    slug:'home', page:null, settings:null, pages:KNOWN_PAGES.map(x=>({title:x[0],slug:x[1],path:x[2]})), selected:-1,
    panel:'insert', inspectorTab:'content', device:'desktop', developer:false, preview:false, dirty:false, settingsDirty:false,
    history:[], future:[], token:sessionStorage.getItem('benvor_github_token')||'', user:null, renderSeq:0, draftTimer:null, frameTimer:null, authPopup:null
  };

  function toast(msg){const el=$('#bv-toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1800)}
  function setStatus(text,tone='neutral'){const line=$('.bv-save-line');$('#bv-save-status').textContent=text;line.dataset.tone=tone}
  function updateUndo(){ $('#bv-undo').disabled=!state.history.length; $('#bv-redo').disabled=!state.future.length }
  function snapshot(){return {page:clone(state.page),settings:clone(state.settings),dirty:state.dirty,settingsDirty:state.settingsDirty,selected:state.selected}}
  function pushHistory(){if(!state.page)return;state.history.push(snapshot());if(state.history.length>60)state.history.shift();state.future=[];updateUndo()}
  function restoreSnapshot(s){state.page=clone(s.page);state.settings=clone(s.settings);state.dirty=s.dirty;state.settingsDirty=s.settingsDirty;state.selected=Math.min(s.selected,(state.page.sections||[]).length-1);updateTitle();renderSide();renderFrame();queueDraft()}
  function undo(){if(!state.history.length)return;state.future.push(snapshot());restoreSnapshot(state.history.pop());updateUndo();toast('Undone')}
  function redo(){if(!state.future.length)return;state.history.push(snapshot());restoreSnapshot(state.future.pop());updateUndo();toast('Redone')}
  function markDirty(settings=false){if(settings)state.settingsDirty=true;else state.dirty=true;setStatus('Unsaved changes','dirty');queueDraft()}
  function queueDraft(){clearTimeout(state.draftTimer);state.draftTimer=setTimeout(saveLocalDraft,700)}
  function scheduleFrame(delay=120){clearTimeout(state.frameTimer);state.frameTimer=setTimeout(()=>renderFrame(),delay)}
  function draftKey(){return `benvor-sites-builder:draft:${state.slug}`}
  function saveLocalDraft(){if(!state.page)return;try{localStorage.setItem(draftKey(),JSON.stringify({savedAt:Date.now(),page:state.page,settings:state.settings,settingsDirty:state.settingsDirty}));setStatus(`Draft saved ${nowLabel()}`,'saved')}catch(e){setStatus('Draft could not be saved','error')}}
  function clearLocalDraft(){try{localStorage.removeItem(draftKey())}catch(e){}}
  function loadLocalDraft(slug){try{const raw=localStorage.getItem(`benvor-sites-builder:draft:${slug}`);if(!raw)return null;const d=JSON.parse(raw);return d&&d.page?d:null}catch(e){return null}}

  function updateTitle(){if(!state.page)return;$('#bv-page-title').value=state.page.title||state.slug;document.title=`${state.page.title||'Page'} | Benvor Sites Builder`}

  async function getJSON(url){const r=await fetch(url,{cache:'no-store'});if(!r.ok)throw new Error(`${r.status} ${url}`);return r.json()}
  async function loadPage(slug,{ignoreDraft=false}={}){
    setStatus('Loading page…','working'); state.selected=-1; state.history=[]; state.future=[]; updateUndo();
    try{
      const [page, settings] = await Promise.all([getJSON(`/content/pages/${encodeURIComponent(slug)}.json`), state.settings?Promise.resolve(state.settings):getJSON('/content/settings.json')]);
      state.slug=slug; state.page=page; state.settings=settings; state.dirty=false; state.settingsDirty=false;
      if(!ignoreDraft){const d=loadLocalDraft(slug);if(d){state.page=d.page; if(d.settings)state.settings=d.settings; state.settingsDirty=!!d.settingsDirty; state.dirty=true; toast('Local draft restored')}}
      updateTitle();renderSide();await renderFrame();setStatus(state.dirty?'Draft restored':'All changes saved locally',state.dirty?'dirty':'saved');
    }catch(e){console.error(e);setStatus('Could not load page','error');toast('Could not load page content')}
  }

  function frameSource(){return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><link rel="stylesheet" href="/assets/css/site.css"><style>
  html{background:#fff!important}body{min-height:100vh;margin:0!important;background:#fff!important}.site-footer{background:#fff!important;color:#0A1F33!important;border-top:1px solid #E4E8EE!important}.footer-brand p,.footer-col a,.footer-email,.footer-address,.footer-bottom{color:#405266!important}.footer-col h5{color:#0A1F33!important}.footer-bottom{border-color:#E4E8EE!important}.social{color:#0A1F33!important;border-color:#DCE3EA!important;background:#fff!important}.social:hover{color:#2563EB!important;border-color:#9EB9EE!important}.visual-section{position:relative!important;outline:1px solid transparent;outline-offset:-1px;transition:outline-color .12s ease,box-shadow .12s ease}.visual-section.bv-frame-hover{outline:2px solid #9ab6ef!important;outline-offset:-2px}.visual-section.bv-frame-selected{outline:2px solid #2563eb!important;outline-offset:-2px;box-shadow:inset 0 0 0 1px rgba(255,255,255,.75)}.bv-frame-tools{position:absolute!important;z-index:9999!important;right:10px!important;top:10px!important;display:flex!important;gap:2px!important;background:#2563eb!important;border-radius:6px!important;padding:3px!important;box-shadow:0 4px 14px rgba(10,31,51,.18)!important}.bv-frame-tools button{width:27px!important;height:25px!important;display:grid!important;place-items:center!important;border:0!important;border-radius:4px!important;background:transparent!important;color:#fff!important;font:700 12px/1 Arial,sans-serif!important;cursor:pointer!important;padding:0!important;margin:0!important}.bv-frame-tools button:hover{background:rgba(255,255,255,.18)!important}.bv-frame-tools .bv-drag{cursor:grab!important}.bv-add-between{position:relative!important;z-index:9998!important;display:block!important;margin:-11px auto -11px!important;width:30px!important;height:22px!important;border-radius:999px!important;border:1px solid #9bb8f1!important;background:#fff!important;color:#2563eb!important;font:800 15px/18px Arial,sans-serif!important;cursor:pointer!important;opacity:0!important;transition:.12s!important}.bv-add-between:hover{opacity:1!important;box-shadow:0 2px 8px rgba(37,99,235,.15)!important}#main:hover>.bv-add-between{opacity:.86!important}[contenteditable="true"]{outline:none!important;border-radius:3px!important;cursor:text!important}[contenteditable="true"]:focus{box-shadow:0 0 0 2px rgba(37,99,235,.35)!important;background:rgba(255,255,255,.9)!important}.reveal{opacity:1!important;transform:none!important}a,button{scroll-margin-top:80px}
  </style></head><body data-benvor-builder-preview="true"><div id="mobile-overlay"></div><header id="site-header"></header><main id="main"></main><footer id="site-footer"></footer><script src="/assets/js/app.js"><\/script></body></html>`}

  async function renderFrame(){
    if(!state.page||!state.settings)return; const seq=++state.renderSeq; const iframe=$('#bv-preview-frame');
    if(!iframe.dataset.ready){
      iframe.srcdoc=frameSource(); iframe.dataset.ready='1';
      await new Promise(resolve=>{iframe.onload=()=>resolve()});
    }
    const w=iframe.contentWindow; if(!w)return;
    for(let i=0;i<40&&!w.BenvorRenderer;i++)await new Promise(r=>setTimeout(r,50));
    if(seq!==state.renderSeq)return;
    if(!w.BenvorRenderer){toast('Preview renderer unavailable');return}
    try{await w.BenvorRenderer.renderDraft(clone(state.page),clone(state.settings),state.slug);if(seq!==state.renderSeq)return;enhanceFrame()}catch(e){console.error(e);toast('Preview could not render')}
  }

  function enhanceFrame(){
    const iframe=$('#bv-preview-frame'),doc=iframe.contentDocument;if(!doc)return;
    const main=doc.querySelector('#main'); if(!main)return;
    doc.addEventListener('click',e=>{const a=e.target.closest('a');if(a)e.preventDefault();const form=e.target.closest('form');if(form)e.preventDefault()},{capture:true});
    const sections=Array.from(main.querySelectorAll(':scope > .visual-section'));
    sections.forEach((el,idx)=>{
      el.dataset.bvIndex=idx; el.classList.toggle('bv-frame-selected',idx===state.selected);
      el.addEventListener('mouseenter',()=>el.classList.add('bv-frame-hover'));el.addEventListener('mouseleave',()=>el.classList.remove('bv-frame-hover'));
      el.addEventListener('click',e=>{if(e.target.closest('.bv-frame-tools'))return;selectSection(idx);e.stopPropagation()});
      const tools=doc.createElement('div');tools.className='bv-frame-tools';tools.innerHTML='<button class="bv-drag" title="Drag section">⋮⋮</button><button data-act="dup" title="Duplicate">⧉</button><button data-act="up" title="Move up">↑</button><button data-act="down" title="Move down">↓</button><button data-act="del" title="Delete">×</button>';el.appendChild(tools);
      tools.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();const a=e.target.closest('button')?.dataset.act;if(a==='dup')duplicateSection(idx);if(a==='up')moveSection(idx,idx-1);if(a==='down')moveSection(idx,idx+1);if(a==='del')deleteSection(idx)});
      el.draggable=true;el.addEventListener('dragstart',e=>{if(!e.target.closest('.visual-section'))return;e.dataTransfer.setData('text/plain',String(idx));e.dataTransfer.effectAllowed='move'});el.addEventListener('dragover',e=>{e.preventDefault();e.dataTransfer.dropEffect='move'});el.addEventListener('drop',e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain'));if(Number.isInteger(from))moveSection(from,idx)});
      if(idx===state.selected)enableInlineEditing(el,idx);
      const add=doc.createElement('button');add.className='bv-add-between';add.type='button';add.textContent='+';add.title='Add section here';add.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();state.selected=idx;state.panel='insert';renderSide();toast('Choose a section to insert')});el.insertAdjacentElement('afterend',add);
    });
    if(!sections.length){const empty=doc.createElement('button');empty.className='bv-add-between';empty.style.opacity='1';empty.textContent='+';empty.onclick=()=>{state.panel='insert';renderSide()};main.appendChild(empty)}
  }

  function flattenStrings(obj,prefix='content',out=[]){
    if(obj==null)return out;if(typeof obj==='string'){if(obj.trim())out.push({path:prefix,value:obj});return out}
    if(Array.isArray(obj)){obj.forEach((v,i)=>flattenStrings(v,`${prefix}.${i}`,out));return out}
    if(typeof obj==='object'){Object.entries(obj).forEach(([k,v])=>{if(/(^|_)(url|link|image|icon|name|type|id|class)$/i.test(k))return;flattenStrings(v,`${prefix}.${k}`,out)})}return out
  }
  function enableInlineEditing(wrapper,idx){
    const section=state.page.sections[idx];if(!section||!section.content)return;const fields=flattenStrings(section.content);const byValue=new Map();
    fields.forEach(f=>{const k=f.value.trim();if(!byValue.has(k))byValue.set(k,[]);byValue.get(k).push(f)});
    wrapper.querySelectorAll('h1,h2,h3,h4,p,a,small,strong,span,li,blockquote').forEach(el=>{
      if(el.closest('.bv-frame-tools')||el.children.length>0)return;let txt=el.textContent.trim();let suffix='';if(txt.endsWith(' →')){txt=txt.slice(0,-2).trim();suffix=' →'}
      const hits=byValue.get(txt);if(!hits||hits.length!==1)return;const field=hits[0];el.contentEditable='true';el.dataset.bvPath=field.path;el.dataset.bvSuffix=suffix;
      el.addEventListener('focus',()=>{if(!el.dataset.bvHist){pushHistory();el.dataset.bvHist='1'}});
      el.addEventListener('input',()=>{const value=el.textContent.replace(/\s*→\s*$/,'').trim();setPath(section,field.path,value);markDirty(false);renderInspectorOnly()});
      el.addEventListener('blur',()=>{delete el.dataset.bvHist;renderFrame()});el.addEventListener('keydown',e=>{if(e.key==='Enter'&&el.tagName!=='P'&&el.tagName!=='BLOCKQUOTE'){e.preventDefault();el.blur()}})
    })
  }

  function selectSection(idx){state.selected=idx;state.inspectorTab='content';renderSide();const doc=$('#bv-preview-frame').contentDocument;if(doc){doc.querySelectorAll('.visual-section').forEach((x,i)=>x.classList.toggle('bv-frame-selected',i===idx));const el=doc.querySelector(`.visual-section[data-bv-index="${idx}"]`);if(el)enableInlineEditing(el,idx)}}
  function moveSection(from,to){const arr=state.page.sections||[];if(from<0||from>=arr.length||to<0||to>=arr.length||from===to)return;pushHistory();const [item]=arr.splice(from,1);arr.splice(to,0,item);state.selected=to;markDirty();renderSide();renderFrame()}
  function duplicateSection(idx){const arr=state.page.sections||[];if(!arr[idx])return;pushHistory();const cp=clone(arr[idx]);cp.section_name=(cp.section_name||SECTION_LABELS[cp.type]||'Section')+' Copy';arr.splice(idx+1,0,cp);state.selected=idx+1;markDirty();renderSide();renderFrame();toast('Section duplicated')}
  function deleteSection(idx){const arr=state.page.sections||[];if(!arr[idx])return;if(!confirm('Delete this section?'))return;pushHistory();arr.splice(idx,1);state.selected=Math.min(idx,arr.length-1);markDirty();renderSide();renderFrame();toast('Section deleted')}

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

  function addSection(type){pushHistory();const arr=state.page.sections||(state.page.sections=[]);const pos=state.selected>=0?state.selected+1:arr.length;arr.splice(pos,0,makeSection(type));state.selected=pos;markDirty();renderSide();renderFrame();toast(`${SECTION_LABELS[type]||nice(type)} added`)}

  function renderSide(){if(state.selected>=0&&state.page?.sections?.[state.selected])return renderInspector();const tabs=$$('#bv-main-tabs button');tabs.forEach(b=>b.classList.toggle('active',b.dataset.panel===state.panel));if(state.panel==='pages')renderPages();else if(state.panel==='themes')renderThemes();else renderInsert()}
  function renderInspectorOnly(){if(state.selected>=0)renderInspector()}
  function renderInsert(){
    $('#bv-side-content').innerHTML=`<h2 class="bv-panel-title">Insert</h2><p class="bv-panel-subtitle">Add content to the page, then edit it directly on the canvas or in the section settings.</p><div class="bv-search"><input id="bv-block-search" placeholder="Search blocks"></div><div id="bv-block-library"></div>`;
    const draw=(term='')=>{const host=$('#bv-block-library');host.innerHTML='';BLOCK_GROUPS.forEach(([group,types])=>{const visible=types.filter(t=>(SECTION_LABELS[t]||t).toLowerCase().includes(term.toLowerCase()));if(!visible.length)return;const h=document.createElement('div');h.className='bv-insert-section';h.textContent=group;host.appendChild(h);const grid=document.createElement('div');grid.className='bv-insert-grid';visible.forEach(t=>{const b=document.createElement('button');b.className='bv-block-card';b.dataset.type=t;b.innerHTML=`<span class="bv-block-thumb ${['flex_cards','services_grid','stats','why_benvor'].includes(t)?'cols':''}"><i></i><i></i><i></i></span><strong>${esc(SECTION_LABELS[t]||nice(t))}</strong><small>Click to insert</small>`;grid.appendChild(b)});host.appendChild(grid)});host.querySelectorAll('[data-type]').forEach(b=>b.onclick=()=>addSection(b.dataset.type))};draw();$('#bv-block-search').oninput=e=>draw(e.target.value)
  }
  function renderPages(){
    $('#bv-side-content').innerHTML=`<h2 class="bv-panel-title">Pages</h2><p class="bv-panel-subtitle">Switch pages, add new pages, or open the live version.</p><div class="bv-page-actions"><button class="bv-primary-small" id="bv-new-page">＋ New page</button><button class="bv-secondary-small" id="bv-live-page">View live</button></div><div class="bv-pages-list">${state.pages.map(p=>`<button class="bv-page-row ${p.slug===state.slug?'active':''}" data-slug="${esc(p.slug)}"><span class="bv-page-icon">▧</span><span class="bv-page-meta"><strong>${esc(p.title)}</strong><small>${esc(p.path||currentRoute(p.slug))}</small></span><span class="bv-page-menu">⋮</span></button>`).join('')}</div>`;
    $$('.bv-page-row').forEach(b=>b.onclick=e=>{if(e.target.classList.contains('bv-page-menu')){openPageMenu(b.dataset.slug,e);return}if(state.dirty&&!confirm('Switch pages? Your current draft is saved locally.'))return;loadPage(b.dataset.slug)});$('#bv-new-page').onclick=openNewPage;$('#bv-live-page').onclick=()=>window.open(SITE+currentRoute(state.slug),'_blank','noopener')
  }
  function renderThemes(){const t=state.settings.theme||{},d=state.settings.design||{};$('#bv-side-content').innerHTML=`<h2 class="bv-panel-title">Themes</h2><p class="bv-panel-subtitle">Global brand styling. These changes affect every page after you publish the website settings.</p><div class="bv-theme-card active"><div class="bv-theme-preview"><b></b><span></span><i></i></div><strong>Benvor Light</strong></div><div class="bv-theme-controls">${fieldHTML('theme.primary',t.primary,'Primary Color',true,'settings')}${fieldHTML('theme.navy',t.navy,'Navy',true,'settings')}${fieldHTML('theme.heading',t.heading,'Heading Color',true,'settings')}${fieldHTML('theme.body',t.body,'Body Color',true,'settings')}${fieldHTML('theme.surface',t.surface,'Light Surface',true,'settings')}${fieldHTML('theme.radius',t.radius,'Global Radius',false,'settings')}${fieldHTML('theme.container_width',t.container_width,'Container Width',false,'settings')}${fieldHTML('design.button_radius',d.button_radius,'Button Radius',false,'settings')}${fieldHTML('design.section_spacing',d.section_spacing,'Section Spacing',false,'settings')}</div>`;bindFields($('#bv-side-content'))}

  function renderInspector(){
    const s=state.page.sections[state.selected];if(!s){state.selected=-1;return renderSide()}
    $('#bv-main-tabs').querySelectorAll('button').forEach(b=>b.classList.remove('active'));
    const tabs=['content','layout','design','responsive','advanced'];
    $('#bv-side-content').innerHTML=`<div class="bv-inspector-head"><button class="bv-back-btn" id="bv-inspector-back">←</button><div class="bv-inspector-title"><strong>${esc(s.section_name||SECTION_LABELS[s.type]||nice(s.type))}</strong><small>${esc(SECTION_LABELS[s.type]||nice(s.type))}</small></div><div class="bv-inspector-actions"><button id="bv-inspector-dup" title="Duplicate">⧉</button><button id="bv-inspector-delete" title="Delete">×</button></div></div><div class="bv-inspector-tabs">${tabs.map(t=>`<button data-tab="${t}" class="${state.inspectorTab===t?'active':''}">${t.toUpperCase()}</button>`).join('')}</div><div id="bv-inspector-fields"></div>`;
    $('#bv-inspector-back').onclick=()=>{state.selected=-1;renderSide();renderFrame()};$('#bv-inspector-dup').onclick=()=>duplicateSection(state.selected);$('#bv-inspector-delete').onclick=()=>deleteSection(state.selected);$$('.bv-inspector-tabs button').forEach(b=>b.onclick=()=>{state.inspectorTab=b.dataset.tab;renderInspector()});
    const host=$('#bv-inspector-fields');
    if(state.inspectorTab==='advanced'&&!state.developer){host.innerHTML='<div class="bv-dev-banner"><strong>Developer Mode</strong><p>Keep the builder clean by default. Enable Developer Mode only when you need custom classes, anchors, z-index, sticky positioning and technical controls.</p><button id="bv-enable-dev">Enable Developer Mode</button></div>';$('#bv-enable-dev').onclick=()=>{state.developer=true;renderInspector()};return}
    const obj=s[state.inspectorTab]||{};host.innerHTML=objectHTML(obj,state.inspectorTab,'section');bindFields(host)
  }

  function inputKind(key,value){if(typeof value==='boolean')return 'bool';if(typeof value==='number')return 'number';if(typeof value==='string'&&/^#[0-9a-f]{6}$/i.test(value))return 'color';if(typeof value==='string'&&/(body|text|description|answer|bio|excerpt|note|message|quote|challenge|solution|result)$/i.test(key))return 'textarea';return 'text'}
  function optionsFor(path){const key=path.split('.').pop();return LAYOUT_OPTIONS[key]||DESIGN_OPTIONS[key]||null}
  function fieldHTML(path,value,label,forceColor=false,scope='section'){
    const key=path.split('.').pop(),opts=optionsFor(path);if(typeof value==='boolean')return `<label class="bv-check"><span>${esc(label||nice(key))}</span><input class="bv-switch" data-scope="${scope}" data-path="${esc(path)}" type="checkbox" ${value?'checked':''}></label>`;
    if(opts)return `<div class="bv-field-group"><label>${esc(label||nice(key))}</label><select data-scope="${scope}" data-path="${esc(path)}">${opts.map(o=>`<option value="${esc(o)}" ${String(value)===String(o)?'selected':''}>${esc(nice(o))}</option>`).join('')}</select></div>`;
    const kind=forceColor?'color':inputKind(key,value);if(kind==='textarea')return `<div class="bv-field-group"><label>${esc(label||nice(key))}</label><textarea data-scope="${scope}" data-path="${esc(path)}">${esc(value)}</textarea></div>`;
    if(kind==='color')return `<div class="bv-field-group"><label>${esc(label||nice(key))}</label><div class="bv-field-inline"><input data-scope="${scope}" data-path="${esc(path)}" type="text" value="${esc(value)}"><input data-color-sync="${esc(path)}" data-scope="${scope}" type="color" value="${/^#[0-9a-f]{6}$/i.test(String(value))?esc(value):'#2563eb'}"></div></div>`;
    const type=typeof value==='number'?'number':/(url|link|image)$/i.test(key)?'url':'text';return `<div class="bv-field-group"><label>${esc(label||nice(key))}</label><input data-scope="${scope}" data-path="${esc(path)}" type="${type}" value="${esc(value??'')}"></div>`
  }
  function objectHTML(obj,prefix='',scope='section',depth=0){if(obj==null)return '<div class="bv-empty">No settings for this section.</div>';let html='';Object.entries(obj).forEach(([k,v])=>{const p=prefix?`${prefix}.${k}`:k;if(Array.isArray(v)){html+=`<details class="bv-object" ${depth<1?'open':''}><summary>${esc(nice(k))}<span>${v.length} item${v.length===1?'':'s'}</span></summary><div class="bv-object-body">${v.map((item,i)=>`<div class="bv-array-card"><div class="bv-array-card-head"><strong>${esc(nice(k))} ${i+1}</strong><button data-array-remove="${esc(`${p}.${i}`)}" data-scope="${scope}" title="Remove">×</button></div>${typeof item==='object'?objectHTML(item,`${p}.${i}`,scope,depth+1):fieldHTML(`${p}.${i}`,item,`Item ${i+1}`,false,scope)}</div>`).join('')}<button class="bv-add-array" data-array-add="${esc(p)}" data-scope="${scope}">＋ Add item</button></div></details>`}
      else if(v&&typeof v==='object'){html+=`<details class="bv-object" ${depth<1?'open':''}><summary>${esc(nice(k))}</summary><div class="bv-object-body">${objectHTML(v,p,scope,depth+1)}</div></details>`}
      else html+=fieldHTML(p,v,nice(k),false,scope)});return html||'<div class="bv-empty">No editable settings in this group.</div>'}

  function bindFields(root){
    root.querySelectorAll('[data-path]').forEach(el=>{
      const begin=()=>{if(el.dataset.hist)return;pushHistory();el.dataset.hist='1'};el.addEventListener('focus',begin);el.addEventListener('pointerdown',()=>{if(el.type==='checkbox')begin()},{once:true});
      const update=()=>{const scope=el.dataset.scope,obj=scope==='settings'?state.settings:state.page.sections[state.selected];let v=el.type==='checkbox'?el.checked:el.type==='number'?Number(el.value):el.value;setPath(obj,el.dataset.path,v);markDirty(scope==='settings');if(scope==='settings')scheduleFrame();else{if(state.inspectorTab!=='advanced')scheduleFrame()}};el.addEventListener(el.tagName==='SELECT'||el.type==='checkbox'?'change':'input',update);el.addEventListener('blur',()=>delete el.dataset.hist)
    });
    root.querySelectorAll('[data-color-sync]').forEach(c=>c.addEventListener('input',()=>{const text=root.querySelector(`[data-path="${CSS.escape(c.dataset.colorSync)}"][data-scope="${c.dataset.scope}"]`);if(text){if(!text.dataset.hist){pushHistory();text.dataset.hist='1'}text.value=c.value;text.dispatchEvent(new Event('input',{bubbles:true}))}}));
    root.querySelectorAll('[data-array-remove]').forEach(b=>b.onclick=()=>{pushHistory();const obj=b.dataset.scope==='settings'?state.settings:state.page.sections[state.selected];delPath(obj,b.dataset.arrayRemove);markDirty(b.dataset.scope==='settings');renderSide();renderFrame()});
    root.querySelectorAll('[data-array-add]').forEach(b=>b.onclick=()=>{pushHistory();const obj=b.dataset.scope==='settings'?state.settings:state.page.sections[state.selected];const arr=getPath(obj,b.dataset.arrayAdd);if(!Array.isArray(arr))return;let sample=arr.length?clone(arr[arr.length-1]):'';if(sample&&typeof sample==='object'){Object.keys(sample).forEach(k=>{if(typeof sample[k]==='string')sample[k]='';if(typeof sample[k]==='boolean')sample[k]=false})}arr.push(sample);markDirty(b.dataset.scope==='settings');renderSide();renderFrame()})
  }

  function openNewPage(){
    const names=Object.keys(TEMPLATE_RECIPES);$('#bv-modal-root').innerHTML=`<div class="bv-modal"><div class="bv-modal-card"><div class="bv-modal-head"><strong>Create a new page</strong><button data-close>×</button></div><div class="bv-modal-body"><div class="bv-template-grid">${names.map((n,i)=>`<button class="bv-template ${i===0?'active':''}" data-template="${esc(n)}"><span class="bv-template-preview"><i></i><i></i><i></i></span><strong>${esc(n)}</strong><small>${n==='Blank Page'?'Start from an empty canvas':'Start with a recommended Benvor layout'}</small></button>`).join('')}</div><div class="bv-new-fields"><label>Page title<input id="bv-new-title" placeholder="New Page"></label><label>URL slug<input id="bv-new-slug" placeholder="new-page"></label></div></div><div class="bv-modal-foot"><button class="bv-secondary-small" data-close>Cancel</button><button class="bv-primary-small" id="bv-create-page">Create Page</button></div></div></div>`;
    let template='Blank Page';$$('.bv-template').forEach(b=>b.onclick=()=>{$$('.bv-template').forEach(x=>x.classList.remove('active'));b.classList.add('active');template=b.dataset.template});$$('[data-close]').forEach(b=>b.onclick=closeModal);const title=$('#bv-new-title'),slug=$('#bv-new-slug');title.oninput=()=>{if(!slug.dataset.touched)slug.value=slugify(title.value)};slug.oninput=()=>slug.dataset.touched='1';$('#bv-create-page').onclick=()=>createNewPage(title.value,slug.value,template)
  }
  function slugify(s){return String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'')}
  function closeModal(){$('#bv-modal-root').innerHTML=''}
  function createNewPage(title,slug,template){title=title.trim();slug=slugify(slug||title);if(!title||!slug){toast('Add a page title and slug');return}if(state.pages.some(p=>p.slug===slug)){toast('That slug already exists');return}pushHistory();const sections=TEMPLATE_RECIPES[template].map(makeSection);state.slug=slug;state.page={title,slug,published:true,show_header:true,show_footer:true,seo:{title:`${title} | Benvor Digital`,description:'',canonical_url:`${SITE}/page/?slug=${slug}`,og_title:title,og_description:'',og_image:'',noindex:false,schema_type:'WebPage'},sections};state.pages.push({title,slug,path:currentRoute(slug)});state.selected=sections.length?0:-1;state.dirty=true;state.history=[];state.future=[];closeModal();updateTitle();renderSide();renderFrame();saveLocalDraft();setStatus('New page draft','dirty');toast('Page created locally. Publish when ready')}

  function openPageMenu(slug,e){e.stopPropagation();const p=state.pages.find(x=>x.slug===slug);const old=$('.bv-more-menu');if(old)old.remove();const m=document.createElement('div');m.className='bv-more-menu';m.innerHTML=`<div class="bv-menu-head"><strong>${esc(p?.title||slug)}</strong><small>${esc(currentRoute(slug))}</small></div><button class="bv-menu-item" data-live>View live page</button><button class="bv-menu-item" data-copy>Copy page URL</button><button class="bv-menu-item" data-safe>Edit in Safe CMS</button>`;document.body.appendChild(m);m.querySelector('[data-live]').onclick=()=>window.open(SITE+currentRoute(slug),'_blank','noopener');m.querySelector('[data-copy]').onclick=async()=>{await navigator.clipboard.writeText(SITE+currentRoute(slug));m.remove();toast('Page URL copied')};m.querySelector('[data-safe]').onclick=()=>window.open(`/admin/safe.html#/collections/pages/entries/${encodeURIComponent(slug)}`,'_blank','noopener');setTimeout(()=>document.addEventListener('click',()=>m.remove(),{once:true}),0)}

  function togglePreview(on){state.preview=typeof on==='boolean'?on:!state.preview;document.body.classList.toggle('bv-preview-mode',state.preview);$('#bv-exit-preview').hidden=!state.preview;if(state.preview)toast('Draft preview mode')}
  function setDevice(d){state.device=d;const shell=$('#bv-canvas-shell');shell.className=`bv-canvas-shell ${d}`;$$('[data-device]').forEach(b=>b.classList.toggle('active',b.dataset.device===d))}

  async function loginGithub(){
    if(state.token){await verifyUser();return true}
    return new Promise(resolve=>{
      const siteId=encodeURIComponent(location.origin);const url=`${AUTH_BASE}/auth?provider=github&site_id=${siteId}&scope=repo`;
      const popup=window.open(url,'benvor-github-auth','width=720,height=720,menubar=no,toolbar=no');state.authPopup=popup;
      if(!popup){toast('Allow pop-ups to sign in');resolve(false);return}
      let done=false;const timer=setTimeout(()=>{if(!done){window.removeEventListener('message',listener);resolve(false)}},120000);
      function listener(e){if(e.origin!==new URL(AUTH_BASE).origin)return;const token=parseAuthMessage(e.data);if(!token)return;done=true;clearTimeout(timer);window.removeEventListener('message',listener);state.token=token;sessionStorage.setItem('benvor_github_token',token);try{popup.close()}catch(_){}verifyUser().then(()=>{toast('Signed in with GitHub');resolve(true)}).catch(()=>{state.token='';sessionStorage.removeItem('benvor_github_token');toast('GitHub sign-in could not be verified');resolve(false)})}
      window.addEventListener('message',listener)
    })
  }
  function parseAuthMessage(data){
    try{if(typeof data==='object'&&data){if(data.token)return data.token;if(data.payload?.token)return data.payload.token}if(typeof data!=='string')return '';const prefixes=['authorization:github:success:','authorization:github:success','authorization:success:'];for(const p of prefixes){if(data.startsWith(p)){const rest=data.slice(p.length).replace(/^:/,'');if(!rest)return '';try{const o=JSON.parse(rest);return o.token||o.access_token||o.payload?.token||''}catch(_){return rest}}}const m=data.match(/"token"\s*:\s*"([^"]+)"/);return m?m[1]:''}catch(_){return ''}
  }
  async function github(path,opts={}){if(!state.token)throw new Error('Not signed in');const r=await fetch(`${API}${path}`,{...opts,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:`Bearer ${state.token}`,...(opts.headers||{})}});if(r.status===204)return null;const data=await r.json().catch(()=>({}));if(!r.ok){const e=new Error(data.message||`GitHub ${r.status}`);e.status=r.status;throw e}return data}
  async function verifyUser(){const u=await github('/user');state.user=u;$('#bv-account').textContent=(u.login||'G').slice(0,1).toUpperCase();$('#bv-account').title=u.login||'GitHub';refreshRepoPages().catch(()=>{});return u}
  async function refreshRepoPages(){const items=await github(`/repos/${REPO}/contents/content/pages?ref=${encodeURIComponent(BRANCH)}`);if(!Array.isArray(items))return;const extra=[];for(const x of items.filter(x=>x.type==='file'&&x.name.endsWith('.json'))){const slug=x.name.replace(/\.json$/,'');if(state.pages.some(p=>p.slug===slug))continue;extra.push({title:nice(slug),slug,path:currentRoute(slug)})}state.pages=[...state.pages,...extra];if(state.panel==='pages'&&state.selected<0)renderPages()}
  function bytesToBase64(str){const bytes=new TextEncoder().encode(str);let binary='';const chunk=0x8000;for(let i=0;i<bytes.length;i+=chunk)binary+=String.fromCharCode(...bytes.subarray(i,i+chunk));return btoa(binary)}
  async function publishFile(path,obj,message){let sha;try{const cur=await github(`/repos/${REPO}/contents/${path}?ref=${encodeURIComponent(BRANCH)}`);sha=cur.sha}catch(e){if(e.status!==404)throw e}const body={message,content:bytesToBase64(JSON.stringify(obj,null,2)+'\n'),branch:BRANCH};if(sha)body.sha=sha;return github(`/repos/${REPO}/contents/${path}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
  async function publish(){
    if(!state.page)return;$('#bv-publish').disabled=true;setStatus('Preparing publish…','working');try{if(!state.token){const ok=await loginGithub();if(!ok)throw new Error('GitHub sign-in required')}
      if(state.dirty||!DIRECT.has(state.slug)&&!state.pages.find(p=>p.slug===state.slug)?.published){setStatus('Publishing page…','working');await publishFile(`content/pages/${state.slug}.json`,state.page,`Update ${state.page.title||state.slug} from Benvor Sites Builder`)}
      if(state.settingsDirty){setStatus('Publishing theme settings…','working');await publishFile('content/settings.json',state.settings,'Update website settings from Benvor Sites Builder')}
      state.dirty=false;state.settingsDirty=false;clearLocalDraft();setStatus('Published to GitHub — Cloudflare deploy starting','saved');toast('Published successfully');state.pages=state.pages.map(p=>p.slug===state.slug?{...p,title:state.page.title,published:true}:p)
    }catch(e){console.error(e);setStatus(e.message||'Publish failed','error');toast(e.message||'Publish failed')}finally{$('#bv-publish').disabled=false}
  }

  function accountMenu(){const old=$('.bv-account-menu');if(old){old.remove();return}const m=document.createElement('div');m.className='bv-account-menu';m.innerHTML=state.user?`<div class="bv-menu-head"><strong>${esc(state.user.name||state.user.login)}</strong><small>${esc(state.user.login)}</small></div><button class="bv-menu-item" data-history>GitHub version history</button><button class="bv-menu-item" data-safe>Open Safe CMS</button><button class="bv-menu-item danger" data-out>Sign out</button>`:`<div class="bv-menu-head"><strong>GitHub publishing</strong><small>Sign in only when you need to publish.</small></div><button class="bv-menu-item" data-in>Sign in with GitHub</button><button class="bv-menu-item" data-safe>Open Safe CMS</button>`;document.body.appendChild(m);m.querySelector('[data-in]')?.addEventListener('click',async()=>{m.remove();await loginGithub()});m.querySelector('[data-out]')?.addEventListener('click',()=>{state.token='';state.user=null;sessionStorage.removeItem('benvor_github_token');$('#bv-account').textContent='G';m.remove();toast('Signed out')});m.querySelector('[data-safe]')?.addEventListener('click',()=>window.open('/admin/safe.html','_blank','noopener'));m.querySelector('[data-history]')?.addEventListener('click',()=>window.open(`https://github.com/${REPO}/commits/${BRANCH}/content/pages/${state.slug}.json`,'_blank','noopener'));setTimeout(()=>document.addEventListener('click',e=>{if(!m.contains(e.target)&&e.target!==$('#bv-account'))m.remove()},{once:true}),0)}
  function moreMenu(){const old=$('.bv-more-menu');if(old){old.remove();return}const m=document.createElement('div');m.className='bv-more-menu';m.innerHTML=`<div class="bv-menu-head"><strong>Builder options</strong><small>Stability-first visual editor</small></div><button class="bv-menu-item" data-dev>${state.developer?'Disable':'Enable'} Developer Mode</button><button class="bv-menu-item" data-live>View live site</button><button class="bv-menu-item" data-safe>Open Safe CMS</button><button class="bv-menu-item" data-history>Version history</button><button class="bv-menu-item danger" data-discard>Discard local draft</button>`;document.body.appendChild(m);m.querySelector('[data-dev]').onclick=()=>{state.developer=!state.developer;m.remove();toast(`Developer Mode ${state.developer?'enabled':'disabled'}`);renderSide()};m.querySelector('[data-live]').onclick=()=>window.open(SITE+currentRoute(state.slug),'_blank','noopener');m.querySelector('[data-safe]').onclick=()=>window.open('/admin/safe.html','_blank','noopener');m.querySelector('[data-history]').onclick=()=>window.open(`https://github.com/${REPO}/commits/${BRANCH}/content/pages/${state.slug}.json`,'_blank','noopener');m.querySelector('[data-discard]').onclick=()=>{m.remove();if(confirm('Discard the locally saved draft and reload the published page?')){clearLocalDraft();loadPage(state.slug,{ignoreDraft:true})}};setTimeout(()=>document.addEventListener('click',e=>{if(!m.contains(e.target)&&e.target!==$('#bv-more'))m.remove()},{once:true}),0)}

  function bindChrome(){
    $('#bv-undo').onclick=undo;$('#bv-redo').onclick=redo;$('#bv-preview').onclick=()=>togglePreview(true);$('#bv-exit-preview').onclick=()=>togglePreview(false);$('#bv-publish').onclick=publish;$('#bv-account').onclick=accountMenu;$('#bv-more').onclick=moreMenu;$('#bv-add-section-floating').onclick=()=>{state.selected=-1;state.panel='insert';renderSide();toast('Choose a section to add')};
    $$('#bv-main-tabs button').forEach(b=>b.onclick=()=>{state.selected=-1;state.panel=b.dataset.panel;renderSide();renderFrame()});$$('[data-device]').forEach(b=>b.onclick=()=>setDevice(b.dataset.device));$('#bv-page-title').addEventListener('focus',()=>pushHistory());$('#bv-page-title').addEventListener('input',e=>{state.page.title=e.target.value;markDirty()});$('#bv-page-title').addEventListener('blur',()=>renderSide());
    document.addEventListener('keydown',e=>{const mod=e.ctrlKey||e.metaKey;if(mod&&e.key.toLowerCase()==='z'&&!e.shiftKey){e.preventDefault();undo()}else if(mod&&(e.key.toLowerCase()==='y'||(e.key.toLowerCase()==='z'&&e.shiftKey))){e.preventDefault();redo()}else if(mod&&e.key.toLowerCase()==='s'){e.preventDefault();saveLocalDraft();toast('Draft saved locally')}else if(e.key==='Escape'&&state.preview)togglePreview(false)})
  }

  async function init(){bindChrome();setDevice('desktop');try{state.settings=await getJSON('/content/settings.json')}catch(e){console.error(e)}await loadPage('home');if(state.token)verifyUser().catch(()=>{state.token='';sessionStorage.removeItem('benvor_github_token')});$('#bv-app').setAttribute('aria-busy','false')}
  document.addEventListener('DOMContentLoaded',init);
})();
