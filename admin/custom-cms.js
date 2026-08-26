'use strict';
(() => {
  const CFG = {
    owner: 'benvorgroup', repo: 'benvordigital', branch: 'main',
    authBase: 'https://benvor-cms-auth.benvorgroup.workers.dev',
    authEndpoint: 'auth',
    siteUrl: 'https://benvordigital.com'
  };
  const $ = (s, c=document) => c.querySelector(s);
  const $$ = (s, c=document) => [...c.querySelectorAll(s)];
  const clone = x => JSON.parse(JSON.stringify(x));
  const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const icon = (name) => {
    const paths = {
      home:'<path d="M3 11.5 12 4l9 7.5M5.5 10v9h13v-9M9 19v-6h6v6"/>',
      page:'<path d="M6 3h9l3 3v15H6zM15 3v4h4M9 11h6M9 15h6"/>',
      globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
      palette:'<path d="M12 3a9 9 0 1 0 0 18h1.2a1.8 1.8 0 0 0 0-3.6H12a2 2 0 0 1 0-4h4a5 5 0 0 0 5-5C21 5.4 17 3 12 3Z"/><circle cx="7.5" cy="10" r="1"/><circle cx="10" cy="6.8" r="1"/><circle cx="15" cy="7" r="1"/>',
      image:'<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m5 18 5-5 3 3 2-2 4 4"/>',
      search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
      form:'<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8h8M8 12h8M8 16h5"/>',
      blocks:'<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/>',
      plug:'<path d="M8 3v5M16 3v5M6 8h12v2a6 6 0 0 1-6 6v5M9 21h6"/>',
      history:'<path d="M4 12a8 8 0 1 0 2.3-5.7L4 8.5V4M12 8v5l3 2"/>',
      users:'<circle cx="9" cy="8" r="3"/><path d="M3 20c0-4 2-6 6-6s6 2 6 6M16 5a3 3 0 0 1 0 6M17 14c2.7.3 4 2.3 4 6"/>',
      laptop:'<rect x="4" y="5" width="16" height="11" rx="1"/><path d="M2 19h20"/>',
      desktop:'<rect x="3" y="4" width="18" height="13" rx="1"/><path d="M9 21h6M12 17v4"/>',
      tablet:'<rect x="6" y="3" width="12" height="18" rx="2"/><path d="M11 18h2"/>',
      mobile:'<rect x="8" y="2" width="8" height="20" rx="2"/><path d="M11 19h2"/>',
      external:'<path d="M14 4h6v6M20 4l-9 9"/><path d="M18 13v6H5V6h6"/>',
      plus:'<path d="M12 5v14M5 12h14"/>',
      settings:'<circle cx="12" cy="12" r="3"/><path d="M19 13.5v-3l-2-.5a6 6 0 0 0-.8-1.8l1.1-1.8-2.1-2.1-1.8 1.1A6 6 0 0 0 11.5 4L11 2H8l-.5 2a6 6 0 0 0-1.8.8L3.9 3.7 1.8 5.8l1.1 1.8A6 6 0 0 0 2.1 9.5L0 10v3l2 .5a6 6 0 0 0 .8 1.8l-1.1 1.8 2.1 2.1 1.8-1.1a6 6 0 0 0 1.8.8L8 21h3l.5-2a6 6 0 0 0 1.8-.8l1.8 1.1 2.1-2.1-1.1-1.8a6 6 0 0 0 .8-1.8z" transform="translate(1) scale(.92)"/>',
      grip:'<circle cx="9" cy="7" r="1" fill="currentColor"/><circle cx="15" cy="7" r="1" fill="currentColor"/><circle cx="9" cy="12" r="1" fill="currentColor"/><circle cx="15" cy="12" r="1" fill="currentColor"/><circle cx="9" cy="17" r="1" fill="currentColor"/><circle cx="15" cy="17" r="1" fill="currentColor"/>'
    };
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.page}</svg>`;
  };

  const state = {
    token: sessionStorage.getItem('benvorCmsToken') || '', user:null, tree:[], pages:[], settings:null,
    currentPath:'content/pages/home.json', page:null, selectedSection:0, selectedPageOnly:false,
    activeTab:'content', device:'desktop', developer:false, dirty:false, saving:false,
    mode:'builder', rightCollapsed:false, sourceSha:null, currentFileOriginal:null, commits:[],
    mediaMeta:{items:[]}, roles:{users:[]}, components:{sections:[]}
  };

  const BLOCKS = [
    {type:'hero_lead_form',name:'Lead Generation Hero',cat:'Hero',data:{type:'hero_lead_form',enabled:true,section_name:'New Lead Generation Hero',visual_preset:'standard',content:{eyebrow:'Digital Growth',heading:'A clear headline for measurable growth.',text:'Explain the value proposition in one concise paragraph.',primary_button:{label:'Get Started',url:'#contact'},secondary_button:{label:'Learn More',url:'/services/'},form_heading:'Start a conversation',form_text:'Tell us what you want to improve.',form_fields:[{type:'text',name:'name',label:'Name',placeholder:'Your name',required:true},{type:'email',name:'email',label:'Business Email',placeholder:'you@company.com',required:true}],submit_label:'Send Request',trust_note:'No obligation.'},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'page_hero',name:'Page Hero',cat:'Hero',data:{type:'page_hero',enabled:true,section_name:'Page Hero',visual_preset:'standard',content:{eyebrow:'Benvor Digital',heading:'Page heading',text:'Add a concise page introduction.'},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'services_grid',name:'Services Grid',cat:'Services',data:{type:'services_grid',enabled:true,section_name:'Services',visual_preset:'standard',content:{eyebrow:'Services',heading:'Growth services built around measurable outcomes.',text:'Choose the services to feature.',services:['ppc','seo','social','web','analytics','email']},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'selected_work',name:'Case Studies',cat:'Case Studies',data:{type:'selected_work',enabled:true,section_name:'Selected Work',visual_preset:'standard',content:{eyebrow:'Proof',heading:'Selected work and results',text:'Feature your strongest case studies.',button:{label:'View All Case Studies',url:'/portfolio/'},projects:['nexora-saas','purely-skincare','levelup-financial']},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'testimonials',name:'Testimonials',cat:'Testimonials',data:{type:'testimonials',enabled:true,section_name:'Testimonials',visual_preset:'standard',content:{eyebrow:'Testimonials',heading:'What clients say',text:'Add social proof.',testimonials:['sarah-thompson','maya-patel','james-carter']},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'stats',name:'Stats',cat:'Stats',data:{type:'stats',enabled:true,section_name:'Stats',visual_preset:'compact',content:{heading:'Results at a glance',items:[{value:'10+',label:'Years Experience'},{value:'B2B + B2C',label:'Cross-Market Experience'},{value:'Global',label:'Client Reach'}]},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'faq',name:'FAQ',cat:'FAQ',data:{type:'faq',enabled:true,section_name:'FAQ',visual_preset:'standard',content:{eyebrow:'FAQ',heading:'Frequently asked questions',items:[{question:'What can you help with?',answer:'Add your answer here.'}]},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'cta',name:'Call to Action',cat:'CTA',data:{type:'cta',enabled:true,section_name:'CTA',visual_preset:'standard',content:{heading:'Ready to grow?',text:'Start a conversation about the next opportunity.',button:{label:'Contact Us',url:'/contact/'}},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'rich_text',name:'Rich Content',cat:'Content',data:{type:'rich_text',enabled:true,section_name:'Content',visual_preset:'standard',content:{eyebrow:'',heading:'Content heading',body:'Add your content here.'},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'image_text',name:'Image + Text',cat:'Content',data:{type:'image_text',enabled:true,section_name:'Image and Text',visual_preset:'standard',content:{eyebrow:'',heading:'Tell the story visually',text:'Add supporting copy.',image:'',image_alt:'',button:{label:'Learn More',url:'#'}},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'flex_cards',name:'Feature Cards',cat:'Features',data:{type:'flex_cards',enabled:true,section_name:'Feature Cards',visual_preset:'standard',content:{eyebrow:'Features',heading:'Key capabilities',text:'Explain the main value areas.',columns:3,items:[{icon:'trend',title:'Feature one',text:'Describe the feature.',button_label:'',button_url:''},{icon:'chart',title:'Feature two',text:'Describe the feature.',button_label:'',button_url:''},{icon:'users',title:'Feature three',text:'Describe the feature.',button_label:'',button_url:''}]},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'gallery',name:'Gallery',cat:'Gallery',data:{type:'gallery',enabled:true,section_name:'Gallery',visual_preset:'standard',content:{heading:'Gallery',images:[{image:'',alt:''}]},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'contact_split',name:'Contact Form',cat:'Forms',data:{type:'contact_split',enabled:true,section_name:'Contact Form',visual_preset:'standard',content:{eyebrow:'Contact',heading:'Start a conversation',text:'Tell us what you are trying to achieve.',form_heading:'Project enquiry'},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'growth_score',name:'Growth Score',cat:'Forms',data:{type:'growth_score',enabled:true,section_name:'Growth Audit',visual_preset:'standard',content:{section_id:'growth-audit',eyebrow:'Free Growth Audit',heading:'Find your highest-leverage growth opportunity.',text:'Answer a few questions to identify the best next step.',questions:[{type:'text',name:'website',label:'Website',placeholder:'https://',required:false}],submit_label:'Get My Growth Score',success_heading:'Thanks',success_text:'We will review your answers.',booking_heading:'Book a strategy call',booking_text:'Choose a convenient time.',booking_button:{label:'Book a Call',url:'#'}},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'divider',name:'Divider',cat:'Utility',data:{type:'divider',enabled:true,section_name:'Divider',visual_preset:'compact',content:{},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}},
    {type:'spacer',name:'Spacer',cat:'Utility',data:{type:'spacer',enabled:true,section_name:'Spacer',visual_preset:'compact',content:{height:40},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}}
  ];
  function defaultLayout(){return {container_width:'default',padding_top:'default',padding_bottom:'default',min_height:'auto',vertical_align:'start',text_align:'left',columns_desktop:'auto',columns_tablet:'auto',columns_mobile:'1',gap:'default',card_padding:'default',image_ratio:'auto'}}
  function defaultDesign(){return {background:'default',background_image:'',background_position:'center',border_style:'none',border_radius:'default',shadow:'none',text_tone:'auto',overlay:'none'}}
  function defaultResponsive(){return {hide_mobile:false,hide_tablet:false,hide_desktop:false,reverse_mobile:false}}
  function defaultAdvanced(){return {sticky:false,custom_class:'',anchor_id:'',tracking_name:'',aria_label:'',z_index:'auto',disable_animation:false}}

  const PAGE_TEMPLATES = {
    blank: {name:'Blank Page', sections:[]},
    service: {name:'Service Page', sections:['page_hero','rich_text','flex_cards','faq','cta']},
    landing: {name:'Lead Generation Page', sections:['hero_lead_form','trust_stats','growth_score','faq','cta']},
    casestudy: {name:'Case Study Page', sections:['page_hero','stats','image_text','rich_text','cta']},
    about: {name:'About Page', sections:['page_hero','image_text','stats','team','cta']},
    contact: {name:'Contact Page', sections:['page_hero','contact_split','faq']}
  };

  function toast(message,type=''){const stack=$('#toast-stack'); const el=document.createElement('div');el.className=`toast ${type}`;el.textContent=message;stack.appendChild(el);setTimeout(()=>el.remove(),3600)}
  function setSaveState(text,status='saved'){
    const el=$('#save-state'); if(!el)return; el.className=`save-state ${status==='saved'?'':status}`; $('.save-text',el).textContent=text;
  }
  function markDirty(){state.dirty=true;setSaveState('Unsaved draft changes','unsaved');debounceDraft()}
  let draftTimer; function debounceDraft(){clearTimeout(draftTimer);draftTimer=setTimeout(saveDraft,850)}
  function draftKey(path=state.currentPath){return `benvorCmsDraft:${path}`}
  function saveDraft(){if(!state.page||!state.currentPath)return;state.saving=true;setSaveState('Saving draft…','unsaved');localStorage.setItem(draftKey(),JSON.stringify({data:state.page,settings:state.settings,ts:Date.now()}));state.saving=false;state.dirty=false;setSaveState('Draft saved locally','saved')}
  function discardDraft(){localStorage.removeItem(draftKey())}

  function encode64(str){const bytes=new TextEncoder().encode(str);let binary='';bytes.forEach(b=>binary+=String.fromCharCode(b));return btoa(binary)}
  function decode64(str){const binary=atob(String(str||'').replace(/\n/g,''));const bytes=Uint8Array.from(binary,c=>c.charCodeAt(0));return new TextDecoder().decode(bytes)}
  async function gh(path,opts={}){
    if(!state.token) throw new Error('Connect GitHub to publish changes.');
    const token=state.token.replace(/^bearer\s+/i,'');
    const res=await fetch(`https://api.github.com${path}`,{...opts,headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:`Bearer ${token}`,...(opts.headers||{})}});
    if(!res.ok){const txt=await res.text();throw new Error(`GitHub ${res.status}: ${txt.slice(0,220)}`)}
    return res.status===204?null:res.json();
  }
  async function ghGetFile(path,ref=CFG.branch){const d=await gh(`/repos/${CFG.owner}/${CFG.repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`);return {data:JSON.parse(decode64(d.content)),sha:d.sha,raw:d}}
  async function ghGetText(path,ref=CFG.branch){const d=await gh(`/repos/${CFG.owner}/${CFG.repo}/contents/${encodePath(path)}?ref=${encodeURIComponent(ref)}`);return {text:decode64(d.content),sha:d.sha,raw:d}}
  async function ghPutText(path,text,message,sha){const body={message,content:encode64(text),branch:CFG.branch};if(sha)body.sha=sha;return gh(`/repos/${CFG.owner}/${CFG.repo}/contents/${encodePath(path)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})}
  async function ghPutJson(path,data,message,sha){return ghPutText(path,JSON.stringify(data,null,2)+'\n',message,sha)}
  function encodePath(path){return path.split('/').map(encodeURIComponent).join('/')}

  async function loadTree(){
    if(!state.token)return;
    const d=await gh(`/repos/${CFG.owner}/${CFG.repo}/git/trees/${encodeURIComponent(CFG.branch)}?recursive=1`);state.tree=d.tree||[];
    const pagePaths=state.tree.filter(x=>x.type==='blob'&&/^content\/pages\/[^/]+\.json$/.test(x.path)).map(x=>x.path);
    state.pages=await Promise.all(pagePaths.map(async path=>{try{const f=await ghGetFile(path);return {path,title:f.data.title||slugFromPath(path),slug:f.data.slug||slugFromPath(path),published:f.data.published!==false}}catch{return {path,title:slugFromPath(path),slug:slugFromPath(path),published:true}}}));
    const order=['home','about','services','portfolio','contact'];state.pages.sort((a,b)=>{const ai=order.indexOf(a.slug),bi=order.indexOf(b.slug);return (ai<0?999:ai)-(bi<0?999:bi)||a.title.localeCompare(b.title)});
  }
  function slugFromPath(p){return p.split('/').pop().replace(/\.json$/,'')}
  async function localJson(path){const r=await fetch('/'+path,{cache:'no-store'});if(!r.ok)throw new Error(`Could not read ${path}`);return r.json()}
  async function loadJson(path){if(state.token){try{return await ghGetFile(path)}catch(e){console.warn(e)}}const data=await localJson(path);return {data,sha:null}}

  async function connectGithub(){
    const url=`${CFG.authBase}/${CFG.authEndpoint}?provider=github&scope=repo&site_id=${encodeURIComponent(location.host)}`;
    const popup=window.open(url,'benvor-github-auth','width=760,height=760,resizable=yes,scrollbars=yes');
    if(!popup){toast('Popup blocked. Allow popups for this site and try again.','error');return}
    toast('Complete GitHub authorization in the popup.');
  }
  function extractOAuthToken(data){
    if(!data)return'';
    if(typeof data==='object') return data.token||data.access_token||data.payload?.token||'';
    if(typeof data!=='string')return'';
    const prefixes=['authorization:github:success:','authorization:success:'];
    for(const p of prefixes){if(data.includes(p)){const raw=data.slice(data.indexOf(p)+p.length);try{return JSON.parse(raw).token||JSON.parse(raw).access_token||''}catch{return raw.replace(/^"|"$/g,'')}}}
    try{const o=JSON.parse(data);return o.token||o.access_token||''}catch{return''}
  }
  async function acceptToken(token){
    token=String(token||'').trim(); if(!token)return;
    state.token=token; sessionStorage.setItem('benvorCmsToken',token); setSaveState('Connecting…','unsaved');
    try{state.user=await gh('/user'); await loadTree(); await loadCoreFiles(); hideLogin(); toast(`Connected as ${state.user.login}`,'success'); renderAll();}
    catch(e){state.token='';sessionStorage.removeItem('benvorCmsToken');toast(e.message,'error');showLogin()}
  }
  function logout(){state.token='';state.user=null;state.tree=[];sessionStorage.removeItem('benvorCmsToken');showLogin();toast('Disconnected from GitHub. Local drafts remain on this browser.')}

  async function loadCoreFiles(){
    const settings=await loadJson('content/settings.json');state.settings=settings.data;
    try{state.mediaMeta=(await loadJson('content/media-library.json')).data}catch{state.mediaMeta={items:[]}}
    try{state.roles=(await loadJson('content/cms-roles.json')).data}catch{state.roles={users:[]}}
    try{state.components=(await loadJson('content/cms-components.json')).data}catch{state.components={sections:[]}}
    if(!state.pages.length){state.pages=['home','about','services','portfolio','contact'].map(slug=>({path:`content/pages/${slug}.json`,title:slug[0].toUpperCase()+slug.slice(1),slug,published:true}))}
    await openPage(state.currentPath,false);
  }

  async function openPage(path,render=true){
    state.currentPath=path;state.mode='builder';state.selectedPageOnly=false;state.selectedSection=0;state.activeTab='content';
    let f=await loadJson(path);state.sourceSha=f.sha;state.currentFileOriginal=clone(f.data);let data=f.data;
    const raw=localStorage.getItem(draftKey(path));if(raw){try{const d=JSON.parse(raw);if(d?.data)data=d.data;if(d?.settings)state.settings=d.settings;setSaveState('Local draft restored','saved')}catch{}}
    state.page=clone(data); if(render)renderAll();
  }

  function pagePreviewUrl(page=state.page){
    const slug=page?.slug||slugFromPath(state.currentPath);
    if(slug==='home')return '/?cmsPreview=1';
    if(['about','services','portfolio','contact'].includes(slug))return `/${slug}/?cmsPreview=1`;
    return `/page/?slug=${encodeURIComponent(slug)}&cmsPreview=1`;
  }
  function liveUrl(page=state.page){const slug=page?.slug||'home';return slug==='home'?'/':(['about','services','portfolio','contact'].includes(slug)?`/${slug}/`:`/page/?slug=${encodeURIComponent(slug)}`)}
  function postPreview(){const frame=$('#preview-frame');if(!frame||!state.page)return;try{frame.contentWindow.postMessage({type:'benvor-cms-preview',page:state.page,settings:state.settings},location.origin)}catch{}}

  function renderAll(){renderHeaderState();renderLeft();renderWorkspace();renderRight();}
  function renderHeaderState(){
    $('#current-page-name').textContent=state.mode==='builder'?(state.page?.title||'Page Builder'):modeTitle(state.mode);
    $('#connection').classList.toggle('connected',!!state.token);$('#connection strong').textContent=state.token?`GitHub · ${state.user?.login||'Connected'}`:'GitHub not connected';
    $('#connection span').textContent=state.token?`${CFG.owner}/${CFG.repo} · ${CFG.branch}`:'Connect to publish';
    $('#publish-btn').disabled=!state.page||state.mode!=='builder';$('#unpublish-btn').disabled=!state.page||state.mode!=='builder';
  }
  function modeTitle(m){return ({globals:'Global Components',brand:'Brand System',media:'Media Library',seo:'SEO & AEO',forms:'Forms & Leads',templates:'Templates & Components',integrations:'Integrations Hub',history:'Version History',roles:'Users & Roles'})[m]||'Benvor CMS'}

  function renderLeft(){
    const wrap=$('#page-nav');wrap.innerHTML='';
    for(const p of state.pages){
      const open=state.currentPath===p.path && state.mode==='builder';
      const group=document.createElement('div');group.className=`page-group ${open?'open':''}`;
      group.innerHTML=`<button class="nav-row ${open?'active':''}" data-page="${esc(p.path)}">${icon(p.slug==='home'?'home':'page')}<span>${esc(p.title)}</span><span class="chev">›</span></button><div class="section-list"></div>`;
      const list=$('.section-list',group);
      if(open&&state.page){(state.page.sections||[]).forEach((s,i)=>{
        const row=document.createElement('div');row.className=`section-row ${!state.selectedPageOnly&&state.selectedSection===i?'active':''}`;row.draggable=true;row.dataset.index=i;
        row.innerHTML=`<span class="grip">${icon('grip')}</span><span>${esc(sectionLabel(s,i))}</span><span class="eye">${s.enabled===false?'○':'●'}</span>`;
        row.onclick=()=>selectSection(i);row.ondragstart=e=>{row.classList.add('dragging');e.dataTransfer.setData('text/plain',String(i))};row.ondragend=()=>row.classList.remove('dragging');
        row.ondragover=e=>e.preventDefault();row.ondrop=e=>{e.preventDefault();const from=Number(e.dataTransfer.getData('text/plain')),to=i;if(from!==to)reorderSection(from,to)};
        list.appendChild(row);
      });
        const add=document.createElement('button');add.className='add-section';add.innerHTML='+ Add Section';add.onclick=openBlockLibrary;list.appendChild(add);
      }
      $('.nav-row',group).onclick=async e=>{e.stopPropagation();if(state.currentPath===p.path&&state.mode==='builder'){state.selectedPageOnly=true;renderLeft();renderRight();return}await openPage(p.path)};
      wrap.appendChild(group);
    }
    $$('.manage-nav').forEach(b=>b.classList.toggle('active',b.dataset.mode===state.mode));
  }
  function sectionLabel(s,i){return s.section_name||s.content?.heading||s.content?.title||s.type?.replaceAll('_',' ')||`Section ${i+1}`}
  function selectSection(i){state.mode='builder';state.selectedSection=i;state.selectedPageOnly=false;if(state.rightCollapsed)toggleRight(false);renderLeft();renderRight();const frame=$('#preview-frame');frame?.contentWindow.postMessage({type:'benvor-cms-scroll-section',index:i},location.origin)}
  function reorderSection(from,to){const list=state.page.sections||[];const [item]=list.splice(from,1);list.splice(to,0,item);state.selectedSection=to;markDirty();renderLeft();postPreview()}

  function renderWorkspace(){
    const ws=$('#workspace');
    if(state.mode==='builder'){
      ws.innerHTML=`<div class="preview-toolbar"><div class="url">Preview <b>${esc(liveUrl())}</b></div><div class="preview-actions"><button class="btn soft" id="refresh-preview">Refresh Preview</button><a class="btn icon" href="${esc(liveUrl())}" target="_blank" title="Open live site">${icon('external')}</a></div></div><div class="preview-wrap"><div class="preview-frame-shell" id="preview-shell" data-device="${esc(state.device)}"><iframe class="preview-frame" id="preview-frame" title="Live page preview" src="${esc(pagePreviewUrl())}"></iframe></div></div>`;
      const frame=$('#preview-frame');frame.onload=()=>setTimeout(postPreview,120);$('#refresh-preview').onclick=()=>{frame.src=pagePreviewUrl()+'&r='+Date.now()};return;
    }
    ws.innerHTML=`<div class="panel-page" id="panel-page"></div>`; const p=$('#panel-page');
    if(state.mode==='globals')renderGlobals(p); if(state.mode==='brand')renderBrand(p); if(state.mode==='media')renderMedia(p); if(state.mode==='seo')renderSeo(p); if(state.mode==='forms')renderForms(p); if(state.mode==='templates')renderTemplates(p); if(state.mode==='integrations')renderIntegrations(p); if(state.mode==='history')renderHistory(p); if(state.mode==='roles')renderRoles(p);
  }

  function ensureAdvancedControls(sec){
    sec.advanced=sec.advanced||{}; sec.design=sec.design||{};
    const a={position_mode:'default',top_px:'',right_px:'',bottom_px:'',left_px:'',max_width_px:'',margin_top_px:'',margin_bottom_px:'',margin_left_px:'',margin_right_px:'',padding_top_px:'',padding_bottom_px:'',heading_size_px:'',heading_weight:'',body_size_px:'',opacity_percent:'',...sec.advanced};
    const d={custom_background_color:'',custom_text_color:'',custom_heading_color:'',custom_primary_color:'',custom_border_color:'',custom_border_width_px:'',custom_radius_px:'',custom_shadow:'',...sec.design};
    sec.advanced=a;sec.design=d;
  }

  function ensurePageSeo(){
    state.page.seo=state.page.seo||{};
    state.page.seo={title:'',description:'',canonical_url:'',og_title:'',og_description:'',og_image:'',noindex:false,schema_type:'WebPage',robots:'index,follow',breadcrumb_title:'',primary_entity:'Benvor Digital',aeo_answer_summary:'',featured_answer:'',key_takeaway:'',internal_linking_notes:'',...state.page.seo};
  }
  function seoScore(){
    ensurePageSeo();const x=state.page.seo;let score=0;const checks=[];
    const add=(ok,label)=>{checks.push({ok,label});if(ok)score+=12.5};
    add(String(x.title||'').length>=25&&String(x.title||'').length<=65,'SEO title length is healthy');
    add(String(x.description||'').length>=100&&String(x.description||'').length<=170,'Meta description is useful');
    add(/^https?:\/\//.test(x.canonical_url||''),'Canonical URL is set');
    add(!!x.og_title&&!!x.og_description,'Social title and description are set');
    add(x.noindex!==true,'Page is indexable');
    add(!!String(x.primary_entity||'').trim(),'Primary entity is defined');
    add(!!String(x.aeo_answer_summary||'').trim(),'AEO answer summary is defined');
    add(!!String(x.key_takeaway||'').trim(),'Key takeaway is defined');
    return {score:Math.round(score),checks};
  }
  function checkpointKey(path=state.currentPath){return `benvorCmsCheckpoints:${path}`}
  function getCheckpoints(){try{return JSON.parse(localStorage.getItem(checkpointKey())||'[]')}catch{return[]}}
  function saveCheckpoint(name,data=state.page){const list=getCheckpoints();list.unshift({id:Date.now(),name:name||'Checkpoint',ts:Date.now(),data:clone(data)});localStorage.setItem(checkpointKey(),JSON.stringify(list.slice(0,20)));return list[0]}
  function createNamedCheckpoint(){const name=prompt('Checkpoint name',`Checkpoint ${new Date().toLocaleString()}`);if(!name)return;saveCheckpoint(name);toast('Checkpoint saved on this browser.','success')}
  function restoreCheckpoint(id){const c=getCheckpoints().find(x=>String(x.id)===String(id));if(!c)return;if(!confirm(`Restore “${c.name}” as the current draft?`))return;state.page=clone(c.data);state.selectedSection=0;state.selectedPageOnly=false;markDirty();state.mode='builder';renderAll();postPreview();toast('Checkpoint restored as a draft.','success')}
  async function duplicateCurrentPage(){const title=prompt('Duplicate page name',`${state.page.title||'Page'} Copy`);if(!title)return;const slug=slugify(prompt('URL slug',slugify(title))||slugify(title));if(!slug)return;const data=clone(state.page);data.title=title;data.slug=slug;data.published=false;data.seo=data.seo||{};data.seo.noindex=true;data.seo.canonical_url=`${CFG.siteUrl}/page/?slug=${slug}`;const path=`content/pages/${slug}.json`;state.pages.push({path,title,slug,published:false});state.currentPath=path;state.page=data;state.sourceSha=null;state.currentFileOriginal=null;state.selectedSection=0;state.selectedPageOnly=false;markDirty();renderAll();toast('Page duplicated as an unpublished local draft.','success')}
  async function publishComponents(){if(!state.token){localStorage.setItem('benvorCmsComponentsDraft',JSON.stringify(state.components));toast('Component saved locally. Connect GitHub to publish the component library.','success');return}try{let sha=null;try{sha=(await ghGetFile('content/cms-components.json')).sha}catch{}await ghPutJson('content/cms-components.json',state.components,'CMS: update reusable component library',sha);toast('Reusable component library published.','success')}catch(e){toast(e.message,'error')}}
  async function saveSelectedComponent(){const sec=state.page?.sections?.[state.selectedSection];if(!sec)return;const name=prompt('Reusable component name',sectionLabel(sec,state.selectedSection));if(!name)return;state.components=state.components||{sections:[]};state.components.sections=state.components.sections||[];state.components.sections.unshift({id:`component-${Date.now()}`,name,category:'Saved',section:clone(sec)});await publishComponents();renderRight()}

  function renderRight(){
    const bar=$('#rightbar');
    if(state.mode!=='builder'){bar.innerHTML=`<div class="right-head"><div><strong>${esc(modeTitle(state.mode))}</strong><small>Dedicated management area</small></div></div><div class="settings-scroll"><div class="panel-card"><h3>Clean workspace</h3><p>Global and management tools are kept outside the page section navigator so page building stays focused.</p></div></div>`;return}
    if(!state.page){bar.innerHTML='';return}
    if(state.selectedPageOnly){renderPageSettings(bar);return}
    const sec=state.page.sections?.[state.selectedSection];if(sec)ensureAdvancedControls(sec);if(!sec){bar.innerHTML=`<div class="right-head"><div><strong>Page Settings</strong><small>Select a section to edit</small></div></div>`;return}
    const tabs=['content','layout','design','responsive'];if(state.developer)tabs.push('advanced');if(!tabs.includes(state.activeTab))state.activeTab='content';
    bar.innerHTML=`<div class="right-head"><div><strong>${esc(sectionLabel(sec,state.selectedSection))}</strong><small>${esc(sec.type||'Section')}</small></div><label class="dev-toggle">Developer <span class="switch ${state.developer?'on':''}" id="dev-switch"></span></label></div><div class="tabs">${tabs.map(t=>`<button class="tab ${state.activeTab===t?'active':''}" data-tab="${t}">${cap(t)}</button>`).join('')}</div><div class="settings-scroll" id="settings-scroll"></div>`;
    $('#dev-switch').onclick=()=>{state.developer=!state.developer;state.activeTab=state.developer?'advanced':'content';renderRight()};$$('.tab',bar).forEach(b=>b.onclick=()=>{state.activeTab=b.dataset.tab;renderRight()});
    const sc=$('#settings-scroll');
    if(state.activeTab==='content'){
      const base=document.createElement('div');base.className='field-group';base.innerHTML='<div class="field-group-title">Section</div><div class="field-body" id="section-base"></div>';sc.appendChild(base);
      renderField($('#section-base'),sec,'enabled',['sections',state.selectedSection,'enabled']);renderField($('#section-base'),sec,'section_name',['sections',state.selectedSection,'section_name']);renderField($('#section-base'),sec,'visual_preset',['sections',state.selectedSection,'visual_preset'],['standard','compact','narrow','wide','full_bleed','feature','full_screen']);
      $('#section-base').insertAdjacentHTML('beforeend','<div style="display:flex;gap:6px;margin-top:10px"><button class="btn soft" id="duplicate-section" type="button">Duplicate Section</button><button class="btn soft" id="save-component" type="button">Save as Component</button></div>');
      $('#duplicate-section').onclick=()=>{const copy=clone(sec);copy.section_name=(copy.section_name||sectionLabel(copy,state.selectedSection))+' Copy';state.page.sections.splice(state.selectedSection+1,0,copy);state.selectedSection++;markDirty();renderAll();postPreview()};
      $('#save-component').onclick=saveSelectedComponent;
      const group=document.createElement('div');group.className='field-group';group.innerHTML='<div class="field-group-title">Content</div><div class="field-body" id="content-fields"></div>';sc.appendChild(group);renderObject($('#content-fields'),sec.content||{},['sections',state.selectedSection,'content']);
    } else {
      const key=state.activeTab;const group=document.createElement('div');group.className='field-group';group.innerHTML=`<div class="field-group-title">${cap(key)} Controls</div><div class="field-body" id="tab-fields"></div>`;sc.appendChild(group);renderObject($('#tab-fields'),sec[key]||{},['sections',state.selectedSection,key]);
      if(key==='advanced'){$('#tab-fields').insertAdjacentHTML('afterbegin','<div class="panel-card" style="padding:10px;margin-bottom:10px"><p style="margin:0">Developer Mode exposes technical controls. Use these only when the standard design controls are not enough.</p></div>')}
    }
  }
  function renderPageSettings(bar){
    ensurePageSeo();
    bar.innerHTML=`<div class="right-head"><div><strong>${esc(state.page.title||'Page')}</strong><small>Page settings</small></div></div><div class="tabs"><button class="tab ${state.activeTab!=='seo'?'active':''}" data-page-tab="page">Page</button><button class="tab ${state.activeTab==='seo'?'active':''}" data-page-tab="seo">SEO & AEO</button></div><div class="settings-scroll"><div class="field-group"><div class="field-group-title">${state.activeTab==='seo'?'Search & Answer Engine Settings':'Page'}</div><div class="field-body" id="page-fields"></div></div><div id="page-extra"></div></div>`;
    $$('[data-page-tab]',bar).forEach(b=>b.onclick=()=>{state.activeTab=b.dataset.pageTab==='seo'?'seo':'content';renderRight()});const c=$('#page-fields');const extra=$('#page-extra');
    if(state.activeTab==='seo'){
      renderObject(c,state.page.seo||{},['seo']);const audit=seoScore();
      extra.innerHTML=`<div class="field-group"><div class="field-group-title">Search Preview</div><div class="field-body"><div style="font-size:10px;color:#64748B">${esc(state.page.seo.canonical_url||liveUrl())}</div><div style="font-size:15px;color:#1D4ED8;margin:4px 0">${esc(state.page.seo.title||state.page.title||'Page title')}</div><div style="font-size:10px;line-height:1.5;color:#475569">${esc(state.page.seo.description||'Add a useful meta description.')}</div></div></div><div class="field-group"><div class="field-group-title">SEO & AEO Checklist · ${audit.score}%</div><div class="field-body">${audit.checks.map(x=>`<div class="check-row"><span>${esc(x.label)}</span><strong style="color:${x.ok?'#16A34A':'#D97706'}">${x.ok?'✓':'•'}</strong></div>`).join('')}</div></div>`;
    }else{
      ['title','slug','published'].forEach(k=>renderField(c,state.page,k,[k]));extra.innerHTML='<div class="field-group"><div class="field-group-title">Page Actions</div><div class="field-body" style="display:flex;flex-wrap:wrap;gap:6px"><button class="btn soft" id="duplicate-page" type="button">Duplicate Page</button><button class="btn soft" id="checkpoint-page" type="button">Create Checkpoint</button></div></div>';$('#duplicate-page').onclick=duplicateCurrentPage;$('#checkpoint-page').onclick=createNamedCheckpoint;
    }
  }

  function renderObject(container,obj,path){
    Object.keys(obj||{}).forEach(k=>renderField(container,obj,k,[...path,k]));
    if(!Object.keys(obj||{}).length)container.innerHTML='<p class="muted" style="font-size:10px">No fields in this group yet.</p>';
  }
  function renderField(container,obj,key,path,forcedOptions=null){
    const value=obj?.[key];const label=pretty(key);
    if(Array.isArray(value)){renderArray(container,value,path,label);return}
    if(value && typeof value==='object'){const d=document.createElement('details');d.className='object-box';d.open=false;d.innerHTML=`<summary class="object-title">${esc(label)}</summary><div class="object-inner"></div>`;container.appendChild(d);renderObject($('.object-inner',d),value,path);return}
    if(typeof value==='boolean'){const row=document.createElement('label');row.className='check-row';row.innerHTML=`<span>${esc(label)}</span><input type="checkbox" ${value?'checked':''}>`;row.querySelector('input').onchange=e=>updatePath(path,e.target.checked);container.appendChild(row);return}
    const field=document.createElement('div');field.className='field';const options=forcedOptions||optionsFor(key);
    const lab=document.createElement('label');lab.textContent=label;field.appendChild(lab);
    if(/color/i.test(key)){
      const row=document.createElement('div');row.className='color-row';const picker=document.createElement('input');picker.type='color';picker.value=/^#[0-9a-f]{6}$/i.test(String(value||''))?String(value):'#2563EB';const text=document.createElement('input');text.type='text';text.value=value??'';row.append(picker,text);field.appendChild(row);picker.oninput=e=>{text.value=e.target.value;updatePath(path,e.target.value)};text.oninput=e=>updatePath(path,e.target.value,false);text.onchange=()=>postPreview();container.appendChild(field);return;
    }
    let input;
    if(options){input=document.createElement('select');input.innerHTML=options.map(o=>`<option value="${esc(o)}" ${String(value)===String(o)?'selected':''}>${esc(pretty(o))}</option>`).join('')}
    else if(isLongField(key,value)){input=document.createElement('textarea');input.value=value??''}
    else{input=document.createElement('input');input.type=fieldType(key,value);input.value=value??'';if(input.type==='number')input.step='any'}
    field.appendChild(input);input.oninput=e=>{let v=e.target.type==='number'?(e.target.value===''?'':Number(e.target.value)):e.target.value;updatePath(path,v,false)};input.onchange=()=>postPreview();container.appendChild(field);
  }
  function renderArray(container,arr,path,label){
    const box=document.createElement('div');box.className='field';box.innerHTML=`<label>${esc(label)} <span>${arr.length} item${arr.length===1?'':'s'}</span></label><div class="array-list"></div><button class="mini-add" type="button">+ Add item</button>`;container.appendChild(box);const list=$('.array-list',box);
    arr.forEach((item,i)=>{const d=document.createElement('details');d.className='array-item';d.open=false;d.innerHTML=`<summary class="array-item-head"><strong>${esc(arraySummary(item,i))}</strong><button type="button" title="Remove">×</button></summary><div class="array-fields"></div>`;d.querySelector('button').onclick=e=>{e.preventDefault();e.stopPropagation();const a=getPath(path);a.splice(i,1);markDirty();renderRight();postPreview()};list.appendChild(d);const target=$('.array-fields',d);if(item&&typeof item==='object')renderObject(target,item,[...path,i]);else{const temp={value:item};renderField(target,temp,'value',[...path,i])}});
    $('.mini-add',box).onclick=()=>{const a=getPath(path);const sample=a[0];a.push(sample&&typeof sample==='object'?emptyLike(sample):'');markDirty();renderRight();postPreview()};
  }
  function emptyLike(obj){const out={};Object.entries(obj).forEach(([k,v])=>{if(typeof v==='boolean')out[k]=false;else if(Array.isArray(v))out[k]=[];else if(v&&typeof v==='object')out[k]=emptyLike(v);else if(typeof v==='number')out[k]=0;else out[k]=''});return out}
  function arraySummary(item,i){if(item&&typeof item==='object')return item.title||item.label||item.name||item.question||`Item ${i+1}`;return String(item||`Item ${i+1}`).slice(0,42)}
  function updatePath(path,value,preview=true){let o=state.page;for(let i=0;i<path.length-1;i++){if(o[path[i]]==null)o[path[i]]=typeof path[i+1]==='number'?[]:{};o=o[path[i]]}o[path.at(-1)]=value;markDirty();renderLeft();if(preview)postPreview()}
  function getPath(path,root=state.page){let o=root;for(const k of path)o=o[k];return o}
  function pretty(s){return String(s).replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase())}
  function cap(s){return s[0].toUpperCase()+s.slice(1)}
  function isLongField(k,v){return ['text','description','body','answer','excerpt','success_message','og_description','trust_note','form_text','booking_text'].includes(k)||String(v||'').length>90}
  function fieldType(k,v){if(/email/i.test(k))return'email';if(/url|image|canonical/i.test(k))return'url';if(typeof v==='number')return'number';return'text'}
  function optionsFor(k){return ({container_width:['narrow','default','wide','full'],padding_top:['none','xs','small','default','large','xl'],padding_bottom:['none','xs','small','default','large','xl'],min_height:['auto','small','medium','large','screen'],vertical_align:['start','center','end'],text_align:['left','center','right'],columns_desktop:['auto','1','2','3','4','5','6'],columns_tablet:['auto','1','2','3','4'],columns_mobile:['1','2'],gap:['none','small','default','large','xl'],card_padding:['small','default','large','xl'],image_ratio:['auto','1:1','4:3','3:2','16:9','21:9'],background:['default','white','light_grey','navy','blue'],background_position:['center','top','bottom','left','right'],border_style:['none','solid','top','bottom'],border_radius:['none','small','default','large','pill'],shadow:['none','small','medium','large'],text_tone:['auto','dark','light'],overlay:['none','light','dark'],z_index:['auto','1','5','10','20','50'],position_mode:['default','relative','sticky','absolute','fixed'],heading_weight:['','400','500','600','700','800','900'],schema_type:['WebPage','AboutPage','ContactPage','CollectionPage','Article','Service','FAQPage']})[k]||null}

  function openBlockLibrary(){
    const modal=openModal('Add Section');const body=$('.modal-body',modal);body.innerHTML='<input class="modal-search" placeholder="Search blocks…"><div class="block-grid"></div>';const grid=$('.block-grid',body);const saved=(state.components?.sections||[]).map(x=>({type:x.section?.type||'saved',name:x.name||'Saved Component',cat:x.category||'Saved',data:x.section}));const all=[...saved,...BLOCKS];const render=q=>{grid.innerHTML='';all.filter(b=>(b.name+' '+b.cat+' '+b.type).toLowerCase().includes(q.toLowerCase())).forEach(b=>{const c=document.createElement('button');c.className='block-card';c.innerHTML=`<div class="block-thumb"><i></i><i></i><i style="width:${30+Math.random()*50}%"></i></div><strong>${esc(b.name)}</strong><span>${esc(b.cat)}</span>`;c.onclick=()=>{state.page.sections=state.page.sections||[];state.page.sections.push(clone(b.data));state.selectedSection=state.page.sections.length-1;state.selectedPageOnly=false;markDirty();closeModal();renderAll();postPreview()};grid.appendChild(c)})};render('');$('.modal-search',body).oninput=e=>render(e.target.value)
  }
  function openNewPage(){
    const modal=openModal('Create New Page');const body=$('.modal-body',modal);body.innerHTML=`<div class="grid-2"><div class="panel-card"><h3>Start Blank</h3><p>Build the page section by section.</p><button class="btn primary" data-template="blank">Create Blank Page</button></div><div class="panel-card"><h3>Start From Template</h3><p>Choose a ready-made structure and customize every section.</p></div></div><div class="block-grid" id="page-templates"></div>`;
    const grid=$('#page-templates',body);Object.entries(PAGE_TEMPLATES).filter(([k])=>k!=='blank').forEach(([k,t])=>{const c=document.createElement('button');c.className='block-card';c.dataset.template=k;c.innerHTML=`<div class="block-thumb"><i></i><i></i><i></i></div><strong>${esc(t.name)}</strong><span>${t.sections.length} starter sections</span>`;grid.appendChild(c)});$$('[data-template]',body).forEach(b=>b.onclick=()=>createPageFromTemplate(b.dataset.template));
  }
  async function createPageFromTemplate(key){
    const title=prompt('Page name');if(!title)return;const slug=slugify(prompt('URL slug',slugify(title))||slugify(title));if(!slug)return;const t=PAGE_TEMPLATES[key]||PAGE_TEMPLATES.blank;
    const sections=t.sections.map(type=>{const b=BLOCKS.find(x=>x.type===type);return b?clone(b.data):{type,enabled:true,section_name:pretty(type),visual_preset:'standard',content:{},layout:defaultLayout(),design:defaultDesign(),responsive:defaultResponsive(),advanced:defaultAdvanced()}});
    const data={title,slug,published:false,show_header:true,show_footer:true,seo:{title:`${title} | Benvor Digital`,description:'',canonical_url:`${CFG.siteUrl}/page/?slug=${slug}`,og_title:title,og_description:'',og_image:'',noindex:true,schema_type:'WebPage'},sections};
    const path=`content/pages/${slug}.json`;state.pages.push({path,title,slug,published:false});state.currentPath=path;state.page=data;state.sourceSha=null;state.currentFileOriginal=null;state.selectedSection=0;state.selectedPageOnly=sections.length===0;state.mode='builder';markDirty();closeModal();renderAll();toast('New page created as a local draft. Publish when ready.','success')
  }
  function slugify(s){return String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}

  async function publishCurrent(){
    if(!state.page)return; if(!state.token){showLogin();toast('Connect GitHub before publishing.','error');return}
    saveDraft();saveCheckpoint(`Pre-publish ${new Date().toLocaleString()}`,state.currentFileOriginal||state.page);setSaveState('Publishing…','unsaved');
    try{
      let sha=state.sourceSha; if(!sha){try{sha=(await ghGetFile(state.currentPath)).sha}catch{}}
      const resp=await ghPutJson(state.currentPath,state.page,`CMS: update ${state.page.title||state.currentPath}`,sha);state.sourceSha=resp.content?.sha||sha;
      state.currentFileOriginal=clone(state.page);discardDraft();state.dirty=false;setSaveState('Published to GitHub','saved');toast('Published. Cloudflare will deploy the GitHub commit.','success');await loadTree();renderLeft();
    }catch(e){setSaveState('Publish failed','error');toast(e.message,'error')}
  }
  async function unpublishCurrent(){if(!confirm('Unpublish this page? The JSON file will remain, but published will be set to false.'))return;state.page.published=false;markDirty();await publishCurrent();postPreview()}

  function openModal(title){const back=$('#modal-backdrop');back.classList.remove('hidden');back.innerHTML=`<div class="modal"><div class="modal-head"><h2>${esc(title)}</h2><button id="modal-close">×</button></div><div class="modal-body"></div></div>`;$('#modal-close').onclick=closeModal;back.onclick=e=>{if(e.target===back)closeModal()};return $('.modal',back)}
  function closeModal(){$('#modal-backdrop').classList.add('hidden');$('#modal-backdrop').innerHTML=''}

  function renderGlobals(p){
    const f=state.settings.footer||{};const nav=state.settings.navigation||[];p.innerHTML=`<div class="panel-card"><h2>Global Components</h2><p>Header, footer and navigation are managed here and stay consistent across the website.</p></div><div class="grid-2"><div class="panel-card"><h3>Header & Navigation</h3><div id="global-nav"></div></div><div class="panel-card"><h3>Header CTA</h3><div id="header-cta"></div></div></div><div class="grid-2"><div class="panel-card"><h3>Footer</h3><div id="footer-main"></div></div><div class="panel-card"><h3>Social Links</h3><p>Instagram and X are removed. LinkedIn is visible but disabled until the final URL is added.</p><div id="social-fields"></div></div></div><button class="btn primary" id="save-globals">Publish Global Components</button>`;
    renderSettingsObject($('#header-cta'),state.settings.header_cta,['header_cta']);renderSettingsObject($('#footer-main'),{description:f.description,email:f.email,address:f.address,connect_heading:f.connect_heading,copyright:f.copyright},['footer']);
    const navBox=$('#global-nav');nav.forEach((n,i)=>{const d=document.createElement('div');d.className='array-item';d.innerHTML=`<strong>${esc(n.label)}</strong><div class="array-fields"></div>`;navBox.appendChild(d);renderSettingsObject($('.array-fields',d),n,['navigation',i])});
    const social=$('#social-fields');const fb=(f.social||[]).find(x=>/facebook/i.test(x.label))||{label:'Facebook',url:'https://www.facebook.com/BenvorDigital',disabled:false};const li=(f.social||[]).find(x=>/linkedin/i.test(x.label))||{label:'LinkedIn',url:'',disabled:true};
    renderSettingsPrimitive(social,'Facebook URL',fb.url,'url',v=>{state.settings.footer.social=[{label:'LinkedIn',url:li.url||'',disabled:!li.url},{label:'Facebook',url:v,disabled:false}];markGlobalDirty()});
    renderSettingsPrimitive(social,'LinkedIn URL',li.url||'','url',v=>{state.settings.footer.social=[{label:'LinkedIn',url:v,disabled:!String(v).trim()},{label:'Facebook',url:fb.url||'https://www.facebook.com/BenvorDigital',disabled:false}];markGlobalDirty()});
    $('#save-globals').onclick=()=>publishSettings('CMS: update global components');
  }
  function renderBrand(p){p.innerHTML=`<div class="panel-card"><h2>Brand System</h2><p>Global design tokens keep the website consistent. Individual sections can still override layout and design in the page builder.</p></div><div class="grid-2"><div class="panel-card"><h3>Theme</h3><div id="theme-fields"></div></div><div class="panel-card"><h3>Design Defaults</h3><div id="design-fields"></div></div></div><button class="btn primary" id="save-brand">Publish Brand System</button>`;renderSettingsObject($('#theme-fields'),state.settings.theme,['theme']);renderSettingsObject($('#design-fields'),state.settings.design,['design']);$('#save-brand').onclick=()=>publishSettings('CMS: update brand system')}
  function renderSeo(p){p.innerHTML=`<div class="panel-card"><h2>SEO & AEO</h2><p>Manage global search defaults and structured data here. Page-specific SEO and AEO fields stay with each page.</p></div><div class="grid-2"><div class="panel-card"><h3>SEO Defaults</h3><div id="seo-defaults"></div></div><div class="panel-card"><h3>Business Schema</h3><div id="schema-fields"></div></div></div><div class="panel-card"><h3>AEO Defaults</h3><div id="aeo-fields"></div></div><button class="btn primary" id="save-seo">Publish SEO & AEO Settings</button>`;state.settings.aeo_defaults=state.settings.aeo_defaults||{primary_entity:'Benvor Digital',answer_summary:'',key_takeaway:'',internal_linking_notes:''};renderSettingsObject($('#seo-defaults'),state.settings.seo_defaults,['seo_defaults']);renderSettingsObject($('#schema-fields'),state.settings.schema,['schema']);renderSettingsObject($('#aeo-fields'),state.settings.aeo_defaults,['aeo_defaults']);$('#save-seo').onclick=()=>publishSettings('CMS: update SEO and AEO settings')}
  function renderForms(p){
    state.settings.lead_generation=state.settings.lead_generation||{};state.settings.lead_generation={sticky_cta_enabled:true,sticky_cta_label:'Get Free Growth Audit',sticky_cta_url:'#growth-audit',booking_enabled:true,booking_provider:'external',booking_url:'',booking_label:'Book a 15-Minute Strategy Call',lead_form_action:'',growth_audit_action:'',success_message:'Thanks. We will be in touch shortly.',spam_protection:'honeypot',honeypot_field:'company_website',capture_utm:true,utm_field_names:'utm_source, utm_medium, utm_campaign, utm_content, utm_term',thank_you_url:'',conversion_event_name:'generate_lead',conditional_logic_enabled:true,lead_export_format:'CSV / JSON ready',crm_webhook:'',...state.settings.lead_generation};
    p.innerHTML=`<div class="panel-card"><h2>Advanced Lead & Form Manager</h2><p>Manage routing, qualification, UTM capture, conversion tracking and booking handoff. Individual page form fields remain editable directly inside their page sections.</p></div><div class="grid-2"><div class="panel-card"><h3>Contact Form</h3><div id="contact-form-fields"></div></div><div class="panel-card"><h3>Lead Generation System</h3><div id="lead-fields"></div></div></div><div class="panel-card"><h3>Form Building</h3><p>To create a page-specific form, open the page, add a Lead Generation Hero, Contact Form or Growth Score block, then edit and reorder its fields in the Content tab. Hidden UTM and integration defaults are managed above.</p></div><button class="btn primary" id="save-forms">Publish Form Settings</button>`;renderSettingsObject($('#contact-form-fields'),state.settings.contact_form,['contact_form']);renderSettingsObject($('#lead-fields'),state.settings.lead_generation,['lead_generation']);$('#save-forms').onclick=()=>publishSettings('CMS: update forms and lead settings')
  }
  function renderIntegrations(p){
    state.settings.integrations=state.settings.integrations||{google_ads_id:'',linkedin_partner_id:'',search_console_verification:'',crm_provider:'',crm_webhook:'',email_platform:'',booking_provider:'',booking_url:'',custom_head_script:'',custom_body_script:''};
    p.innerHTML=`<div class="panel-card"><h2>Advanced Integrations Hub</h2><p>Analytics, advertising, lead generation and technical integrations in one place.</p></div><div class="grid-2"><div class="panel-card"><h3>Analytics & Pixels</h3><div id="tracking-fields"></div></div><div class="panel-card"><h3>Marketing & Lead Systems</h3><div id="integration-fields"></div></div></div><button class="btn primary" id="save-integrations">Publish Integrations</button>`;renderSettingsObject($('#tracking-fields'),state.settings.tracking,['tracking']);renderSettingsObject($('#integration-fields'),state.settings.integrations,['integrations']);$('#save-integrations').onclick=()=>publishSettings('CMS: update integrations')
  }
  function renderTemplates(p){
    p.innerHTML=`<div class="panel-card"><h2>Templates & Component Library</h2><p>Use ready-made page templates and reusable section blocks without cluttering the page navigator.</p><button class="btn primary" id="new-page-from-template">+ New Page</button></div><div class="grid-3" id="template-cards"></div><div class="panel-card"><h3>Reusable Section Library</h3><p>${BLOCKS.length} built-in visual blocks are available from + Add Section. Custom saved components can be added to <code>content/cms-components.json</code>.</p></div>`;const g=$('#template-cards');Object.entries(PAGE_TEMPLATES).forEach(([k,t])=>{g.insertAdjacentHTML('beforeend',`<div class="panel-card"><h3>${esc(t.name)}</h3><p>${t.sections.length?t.sections.map(pretty).join(' · '):'Start with an empty canvas.'}</p><button class="btn soft" data-page-template="${k}">Use Template</button></div>`)});$$('[data-page-template]',g).forEach(b=>b.onclick=()=>createPageFromTemplate(b.dataset.pageTemplate));$('#new-page-from-template').onclick=openNewPage
  }
  async function renderHistory(p){
    p.innerHTML=`<div class="panel-card"><h2>Advanced Version History</h2><p>Browser checkpoints protect drafts before publishing. GitHub commits remain the source of truth for published revisions.</p><div style="display:flex;gap:6px"><button class="btn soft" id="create-checkpoint">Create Named Checkpoint</button><button class="btn soft" id="refresh-history">Refresh GitHub History</button></div></div><div class="grid-2"><div class="panel-card"><h3>Draft Checkpoints</h3><div class="history-list" id="checkpoint-list"></div></div><div class="panel-card"><h3>Published GitHub Versions</h3><div class="history-list" id="history-list"><p class="muted">Loading…</p></div></div></div>`;$('#create-checkpoint').onclick=()=>{createNamedCheckpoint();renderCheckpointList()};$('#refresh-history').onclick=()=>loadHistory();renderCheckpointList();await loadHistory();
  }
  function renderCheckpointList(){const box=$('#checkpoint-list');if(!box)return;const list=getCheckpoints();box.innerHTML='';list.forEach(c=>{const d=document.createElement('div');d.className='history-item';d.innerHTML=`<div class="meta"><strong>${esc(c.name)}</strong><p>${new Date(c.ts).toLocaleString()} · local draft snapshot</p></div><button class="btn soft" data-restore="${c.id}">Restore</button>`;d.querySelector('button').onclick=()=>restoreCheckpoint(c.id);box.appendChild(d)});if(!list.length)box.innerHTML='<p class="muted">No local checkpoints for this page yet.</p>'}
  async function loadHistory(){const box=$('#history-list');if(!box)return;if(!state.token){box.innerHTML='<p class="muted">Connect GitHub to view published history.</p>';return}box.innerHTML='<p class="muted">Loading…</p>';try{const commits=await gh(`/repos/${CFG.owner}/${CFG.repo}/commits?path=${encodeURIComponent(state.currentPath)}&sha=${CFG.branch}&per_page=20`);state.commits=commits;box.innerHTML='';commits.forEach(c=>{const d=document.createElement('div');d.className='history-item';d.innerHTML=`<div class="meta"><strong>${esc(c.commit.message)}</strong><p>${esc(c.commit.author?.name||c.author?.login||'GitHub')} · ${new Date(c.commit.author?.date).toLocaleString()}</p></div><button class="btn soft">Restore</button>`;d.querySelector('button').onclick=()=>restoreCommit(c.sha);box.appendChild(d)});if(!commits.length)box.innerHTML='<p class="muted">No commits found for this file.</p>'}catch(e){box.innerHTML=`<p class="muted">${esc(e.message)}</p>`}}
  async function restoreCommit(sha){if(!confirm('Restore this published version into the current draft? It will not go live until you publish.'))return;try{const f=await ghGetFile(state.currentPath,sha);state.page=f.data;state.selectedSection=0;state.selectedPageOnly=false;markDirty();state.mode='builder';renderAll();toast('Previous version restored as a draft.','success')}catch(e){toast(e.message,'error')}}
  function renderRoles(p){
    state.roles=state.roles||{users:[]};state.roles.users=state.roles.users||[];
    p.innerHTML=`<div class="panel-card"><h2>Users & Roles</h2><p>Assign editorial roles for a cleaner workflow. GitHub repository permissions remain the actual security boundary for publishing.</p></div><div class="grid-3"><div class="kpi"><strong>Admin</strong><span>Full CMS access</span></div><div class="kpi"><strong>Designer</strong><span>Layout and design</span></div><div class="kpi"><strong>Editor</strong><span>Content editing</span></div><div class="kpi"><strong>SEO Manager</strong><span>SEO and AEO</span></div><div class="kpi"><strong>Marketing</strong><span>Forms and campaigns</span></div><div class="kpi"><strong>Reviewer</strong><span>Preview and review</span></div></div><div class="panel-card"><h3>Role Assignments</h3><div id="role-list"></div><button class="btn soft" id="add-role">+ Add User</button> <button class="btn primary" id="save-roles">Publish Roles</button></div><div class="panel-card"><h3>Security Note</h3><p>These roles organize the CMS interface but cannot replace server-side authorization. Use GitHub organization and repository permissions to control who can actually commit or publish.</p></div>`;
    const draw=()=>{const box=$('#role-list');box.innerHTML='';state.roles.users.forEach((u,i)=>{const row=document.createElement('div');row.className='array-item';row.innerHTML=`<div style="display:grid;grid-template-columns:1fr 1fr auto;gap:7px;align-items:end"><div class="field"><label>GitHub Username</label><input type="text" value="${esc(u.github||'')}"></div><div class="field"><label>Role</label><select>${['Admin','Designer','Editor','SEO Manager','Marketing','Reviewer'].map(r=>`<option ${u.role===r?'selected':''}>${r}</option>`).join('')}</select></div><button class="btn danger" type="button">Remove</button></div>`;const inputs=row.querySelectorAll('input,select');inputs[0].oninput=e=>u.github=e.target.value;inputs[1].onchange=e=>u.role=e.target.value;row.querySelector('button').onclick=()=>{state.roles.users.splice(i,1);draw()};box.appendChild(row)});if(!state.roles.users.length)box.innerHTML='<p class="muted">No role assignments yet. Unassigned GitHub collaborators use repository permissions directly.</p>'};draw();$('#add-role').onclick=()=>{state.roles.users.push({github:'',role:'Editor'});draw()};$('#save-roles').onclick=publishRoles;
  }
  async function publishRoles(){if(!state.token){toast('Connect GitHub to publish role assignments.','error');showLogin();return}try{let sha=null;try{sha=(await ghGetFile('content/cms-roles.json')).sha}catch{}await ghPutJson('content/cms-roles.json',state.roles,'CMS: update editorial role assignments',sha);toast('Role assignments published.','success')}catch(e){toast(e.message,'error')}}
  async function renderMedia(p){
    p.innerHTML=`<div class="panel-card"><h2>Advanced Asset Manager</h2><p>Upload, replace and document reusable website assets. Metadata supports accessibility and responsive design decisions.</p><input type="file" id="media-upload" accept="image/*" hidden><button class="btn primary" id="upload-media">Upload Image</button> <button class="btn soft" id="save-media-meta">Publish Media Metadata</button></div><div class="asset-grid" id="asset-grid"></div>`;$('#upload-media').onclick=()=>$('#media-upload').click();$('#media-upload').onchange=e=>uploadMedia(e.target.files?.[0]);$('#save-media-meta').onclick=publishMediaMeta;const grid=$('#asset-grid');let files=[];if(state.tree.length)files=state.tree.filter(x=>x.type==='blob'&&/^assets\/(branding|uploads|favicon)\/.+\.(png|jpe?g|webp|svg)$/i.test(x.path));else files=[{path:'assets/branding/benvor-horizontal-light.png'},{path:'assets/branding/benvor-horizontal-dark.png'},{path:'assets/branding/benvor-stacked-light.png'}];grid.innerHTML='';files.forEach(f=>{const m=mediaMetaFor(f.path);const c=document.createElement('div');c.className='asset-card';c.innerHTML=`<div class="asset-preview"><img src="/${esc(f.path)}" alt="${esc(m.alt_text||'')}"></div><div class="asset-meta"><strong>${esc(f.path.split('/').pop())}</strong><span>${esc(m.category||'Uncategorized')} · ${esc(m.aspect_ratio||'auto')}</span><div style="display:flex;gap:5px;margin-top:7px"><button class="btn soft" type="button">Edit</button><button class="btn" type="button">Replace</button></div></div>`;const [edit,replace]=c.querySelectorAll('button');edit.onclick=()=>editAsset(f.path);replace.onclick=()=>chooseReplacement(f.path);grid.appendChild(c)})
  }
  function mediaMetaFor(path){state.mediaMeta=state.mediaMeta||{items:[]};state.mediaMeta.items=state.mediaMeta.items||[];let m=state.mediaMeta.items.find(x=>x.path===path);if(!m){m={path,alt_text:'',caption:'',category:'',desktop_image:path,mobile_image:'',focal_position:'center',aspect_ratio:'auto',usage_guidance:''};state.mediaMeta.items.push(m)}return m}
  function editAsset(path){const m=mediaMetaFor(path);const modal=openModal('Edit Asset Metadata');const body=$('.modal-body',modal);body.innerHTML=`<div class="grid-2"><div class="field"><label>Alt Text</label><input id="asset-alt" value="${esc(m.alt_text||'')}"></div><div class="field"><label>Category</label><input id="asset-category" value="${esc(m.category||'')}"></div><div class="field"><label>Desktop Image Path</label><input id="asset-desktop" value="${esc(m.desktop_image||path)}"></div><div class="field"><label>Mobile Image Path</label><input id="asset-mobile" value="${esc(m.mobile_image||'')}"></div><div class="field"><label>Focal Position</label><select id="asset-focal">${['center','top','bottom','left','right','top left','top right','bottom left','bottom right'].map(x=>`<option ${m.focal_position===x?'selected':''}>${x}</option>`).join('')}</select></div><div class="field"><label>Aspect Ratio</label><select id="asset-ratio">${['auto','1:1','4:3','3:2','16:9','21:9'].map(x=>`<option ${m.aspect_ratio===x?'selected':''}>${x}</option>`).join('')}</select></div></div><div class="field"><label>Caption</label><textarea id="asset-caption">${esc(m.caption||'')}</textarea></div><div class="field"><label>Usage Guidance</label><textarea id="asset-guidance">${esc(m.usage_guidance||'')}</textarea></div><button class="btn primary" id="asset-save" type="button">Save Metadata Draft</button>`;$('#asset-save').onclick=()=>{m.alt_text=$('#asset-alt').value;m.category=$('#asset-category').value;m.desktop_image=$('#asset-desktop').value;m.mobile_image=$('#asset-mobile').value;m.focal_position=$('#asset-focal').value;m.aspect_ratio=$('#asset-ratio').value;m.caption=$('#asset-caption').value;m.usage_guidance=$('#asset-guidance').value;localStorage.setItem('benvorCmsMediaDraft',JSON.stringify(state.mediaMeta));closeModal();renderWorkspace();toast('Media metadata saved as a draft.','success')}
  }
  function chooseReplacement(path){const input=document.createElement('input');input.type='file';input.accept='image/*';input.onchange=e=>replaceMedia(path,e.target.files?.[0]);input.click()}
  async function replaceMedia(path,file){if(!file)return;if(!state.token){showLogin();toast('Connect GitHub before replacing an asset.','error');return}try{const current=await gh(`/repos/${CFG.owner}/${CFG.repo}/contents/${encodePath(path)}?ref=${CFG.branch}`);const buf=new Uint8Array(await file.arrayBuffer());let binary='';for(const b of buf)binary+=String.fromCharCode(b);await gh(`/repos/${CFG.owner}/${CFG.repo}/contents/${encodePath(path)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:`CMS: replace ${path.split('/').pop()}`,content:btoa(binary),sha:current.sha,branch:CFG.branch})});toast('Asset replaced.','success');renderWorkspace()}catch(e){toast(e.message,'error')}}
  async function publishMediaMeta(){if(!state.token){showLogin();toast('Connect GitHub to publish media metadata.','error');return}try{let sha=null;try{sha=(await ghGetFile('content/media-library.json')).sha}catch{}await ghPutJson('content/media-library.json',state.mediaMeta,'CMS: update media metadata',sha);localStorage.removeItem('benvorCmsMediaDraft');toast('Media metadata published.','success')}catch(e){toast(e.message,'error')}}
  async function uploadMedia(file){if(!file)return;if(!state.token){showLogin();toast('Connect GitHub before uploading.','error');return}try{const buf=new Uint8Array(await file.arrayBuffer());let binary='';for(let i=0;i<buf.length;i++)binary+=String.fromCharCode(buf[i]);const safe=file.name.toLowerCase().replace(/[^a-z0-9._-]+/g,'-');const path=`assets/uploads/${Date.now()}-${safe}`;await gh(`/repos/${CFG.owner}/${CFG.repo}/contents/${encodePath(path)}`,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:`CMS: upload ${safe}`,content:btoa(binary),branch:CFG.branch})});mediaMetaFor(path);toast('Image uploaded to GitHub. Add metadata before publishing the library.','success');await loadTree();renderWorkspace()}catch(e){toast(e.message,'error')}}

  function renderSettingsObject(container,obj,path){Object.keys(obj||{}).forEach(k=>{const v=obj[k];if(Array.isArray(v)||v&&typeof v==='object'){const d=document.createElement('details');d.className='object-box';d.open=false;d.innerHTML=`<summary class="object-title">${esc(pretty(k))}</summary><div class="object-inner"></div>`;container.appendChild(d);if(Array.isArray(v)){v.forEach((it,i)=>{const x=document.createElement('div');x.className='array-item';x.innerHTML=`<strong>${esc(arraySummary(it,i))}</strong><div class="array-fields"></div>`;$('.object-inner',d).appendChild(x);if(it&&typeof it==='object')renderSettingsObject($('.array-fields',x),it,[...path,k,i])})}else renderSettingsObject($('.object-inner',d),v,[...path,k])}else renderSettingsPrimitive(container,pretty(k),v,fieldType(k,v),val=>setSettingsPath([...path,k],val))})}
  function renderSettingsPrimitive(container,label,value,type,onChange){
    const f=document.createElement('div');f.className='field';
    if(typeof value==='boolean'){
      f.innerHTML=`<label class="check-row"><span>${esc(label)}</span><input type="checkbox" ${value?'checked':''}></label>`;f.querySelector('input').onchange=e=>onChange(e.target.checked);container.appendChild(f);return;
    }
    const lab=document.createElement('label');lab.textContent=label;f.appendChild(lab);
    if(/^#[0-9a-f]{6}$/i.test(String(value||''))||/color|background|heading|primary|navy|border/i.test(label)&&String(value||'').startsWith('#')){
      const row=document.createElement('div');row.className='color-row';row.innerHTML=`<input type="color" value="${esc(/^#[0-9a-f]{6}$/i.test(String(value||''))?value:'#2563EB')}"><input type="text" value="${esc(value??'')}">`;const [picker,text]=row.querySelectorAll('input');picker.oninput=e=>{text.value=e.target.value;onChange(e.target.value)};text.oninput=e=>onChange(e.target.value);f.appendChild(row);container.appendChild(f);return;
    }
    if(isLongField(label,value)){const t=document.createElement('textarea');t.value=value??'';t.oninput=e=>onChange(e.target.value);f.appendChild(t)}else{const input=document.createElement('input');input.type=type||'text';input.value=value??'';input.oninput=e=>onChange(input.type==='number'?(e.target.value===''?'':Number(e.target.value)):e.target.value);f.appendChild(input)}container.appendChild(f)
  }

  function setSettingsPath(path,value){let o=state.settings;for(let i=0;i<path.length-1;i++){if(o[path[i]]==null)o[path[i]]=typeof path[i+1]==='number'?[]:{};o=o[path[i]]}o[path.at(-1)]=value;markGlobalDirty()}
  let globalDraftTimer;function markGlobalDirty(){setSaveState('Global settings changed','unsaved');clearTimeout(globalDraftTimer);globalDraftTimer=setTimeout(()=>{localStorage.setItem('benvorCmsDraft:settings',JSON.stringify({data:state.settings,ts:Date.now()}));setSaveState('Global draft saved locally','saved');postPreview()},850)}
  async function publishSettings(message){if(!state.token){showLogin();toast('Connect GitHub before publishing.','error');return}try{const f=await ghGetFile('content/settings.json');await ghPutJson('content/settings.json',state.settings,message,f.sha);localStorage.removeItem('benvorCmsDraft:settings');toast('Global settings published.','success');setSaveState('Published to GitHub','saved')}catch(e){toast(e.message,'error');setSaveState('Publish failed','error')}}

  function setMode(mode){state.mode=mode;renderHeaderState();renderLeft();renderWorkspace();renderRight()}
  function setDevice(device){state.device=device;$$('.device-btn').forEach(b=>b.classList.toggle('active',b.dataset.device===device));const shell=$('#preview-shell');if(shell)shell.dataset.device=device}
  function toggleRight(force){state.rightCollapsed=typeof force==='boolean'?force:!state.rightCollapsed;const shell=$('#cms-shell'),bar=$('#rightbar');shell.classList.toggle('right-collapsed',state.rightCollapsed);bar.classList.toggle('collapsed',state.rightCollapsed);$('#collapse-handle').textContent=state.rightCollapsed?'‹':'›'}

  function showLogin(){$('#login-screen').classList.remove('hidden')}
  function hideLogin(){$('#login-screen').classList.add('hidden')}

  function bindStaticEvents(){
    $('#connect-btn').onclick=connectGithub;$('#token-connect').onclick=()=>acceptToken($('#token-input').value);$('#logout-btn').onclick=logout;
    $('#new-page-btn').onclick=openNewPage;$('#save-draft-btn').onclick=()=>{saveDraft();toast('Draft saved on this browser.','success')};$('#preview-btn').onclick=()=>{postPreview();toast('Preview refreshed with the current draft.','success')};$('#publish-btn').onclick=publishCurrent;$('#unpublish-btn').onclick=unpublishCurrent;$('#history-btn').onclick=()=>setMode('history');$('#live-btn').onclick=()=>window.open(liveUrl(),'_blank');
    $$('.device-btn').forEach(b=>b.onclick=()=>setDevice(b.dataset.device));$$('.manage-nav').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));$('#collapse-handle').onclick=()=>toggleRight();
    window.addEventListener('message',e=>{
      const authOrigin=new URL(CFG.authBase).origin;
      if(e.origin===authOrigin||e.origin===location.origin){const token=extractOAuthToken(e.data);if(token)acceptToken(token)}
      if(e.origin===location.origin&&e.data?.type==='benvor-cms-select-section')selectSection(Number(e.data.index));
      if(e.origin===location.origin&&e.data?.type==='benvor-cms-preview-ready')postPreview();
    });
    window.addEventListener('beforeunload',e=>{if(state.dirty){e.preventDefault();e.returnValue=''}});
  }

  async function init(){
    bindStaticEvents();
    if(state.token){try{state.user=await gh('/user');await loadTree();await loadCoreFiles();hideLogin();renderAll();return}catch(e){console.warn(e);sessionStorage.removeItem('benvorCmsToken');state.token=''}}
    // Keep the login gate, but preload public content so the CMS opens instantly after authentication.
    try{state.settings=(await loadJson('content/settings.json')).data;state.pages=['home','about','services','portfolio','contact'].map(slug=>({path:`content/pages/${slug}.json`,title:slug[0].toUpperCase()+slug.slice(1),slug,published:true}));await openPage(state.currentPath,false);renderAll()}catch(e){console.error(e)}
    showLogin();
  }
  document.addEventListener('DOMContentLoaded',init);
})();
