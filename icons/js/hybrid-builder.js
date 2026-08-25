
'use strict';
(function(){
  const cache=new Map();
  const SAFE_CLASSES=new Set(['narrow','wide','centered','rounded','shadow','no-shadow','muted','dark-section','compact','spacious']);
  const SAFE_ANIM=new Set(['none','fade','fade-up','slide-left','slide-right','scale']);
  const SAFE_RATIOS=new Set(['1','2','3','4','25-75','33-67','40-60','50-50','60-40','67-33','75-25']);
  const SAFE_EMBED_HOSTS=new Set(['www.youtube.com','youtube.com','youtu.be','player.vimeo.com','vimeo.com','www.google.com','maps.google.com']);

  const esc=(v='')=>String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const safeUrl=(v='')=>{
    v=String(v||'').trim();
    if(/^#[A-Za-z0-9_-]+$/.test(v)) return v;
    if(/^\/[A-Za-z0-9_./%-]*$/.test(v)) return v;
    if(/^https?:\/\/[^\s]+$/i.test(v)) return v;
    if(/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(v)) return v;
    if(/^tel:[+0-9().\-\s]+$/i.test(v)) return v;
    return '';
  };
  const media=(local,external)=>safeUrl(external)||safeUrl(local);
  const hex=v=>/^#[0-9a-f]{6}$/i.test(String(v||'').trim())?String(v).trim():'';
  const get=path=>{
    if(cache.has(path))return cache.get(path);
    const p=fetch(path,{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`${path}: ${r.status}`);return r.json()});
    cache.set(path,p);return p;
  };

  function sanitizeRestrictedHTML(input=''){
    const tpl=document.createElement('template');
    tpl.innerHTML=String(input);
    const allowed=new Set(['H1','H2','H3','H4','P','STRONG','EM','A','UL','OL','LI','BLOCKQUOTE','IMG','BR']);
    const walk=node=>{
      [...node.children].forEach(el=>{
        if(!allowed.has(el.tagName)){el.replaceWith(...el.childNodes);return}
        [...el.attributes].forEach(a=>{
          const n=a.name.toLowerCase();
          if(n.startsWith('on')||n==='style'||n==='srcdoc')el.removeAttribute(a.name);
          if(el.tagName==='A'&&n==='href'){const u=safeUrl(a.value);u?el.setAttribute('href',u):el.removeAttribute('href')}
          if(el.tagName==='IMG'&&n==='src'){const u=media(a.value,'');u?el.setAttribute('src',u):el.removeAttribute('src')}
          if(!['href','src','alt','title','target','rel'].includes(n))el.removeAttribute(a.name);
        });
        if(el.tagName==='A'&&el.getAttribute('target')==='_blank')el.setAttribute('rel','noopener');
        walk(el);
      });
    };
    walk(tpl.content);
    return tpl.innerHTML;
  }

  function applyTheme(theme){
    if(!theme)return;
    const r=document.documentElement.style,c=theme.colors||{},t=theme.typography||{},b=theme.buttons||{},cards=theme.cards||{},l=theme.layout||{};
    const map={'--indigo':c.primary,'--indigo-deep':c.primary_dark,'--coral':c.secondary,'--coral-deep':c.secondary_dark,'--paper':c.background,'--band':c.surface,'--ink':c.heading,'--muted':c.muted,'--line':c.border,'--night':c.dark,'--ok':c.success};
    Object.entries(map).forEach(([k,v])=>{if(hex(v))r.setProperty(k,v)});
    if(cards.radius!=null)r.setProperty('--radius',`${Math.max(0,Math.min(60,Number(cards.radius)||14))}px`);
    if(l.container_width)r.setProperty('--maxw',`${Math.max(760,Math.min(1700,Number(l.container_width)||1180))}px`);
    if(l.container_width)r.setProperty('--builder-container',`${Math.max(760,Math.min(1700,Number(l.container_width)||1180))}px`);
    if(l.section_spacing)r.setProperty('--builder-section-space',`${Math.max(30,Math.min(200,Number(l.section_spacing)||96))}px`);
    if(l.grid_gap)r.setProperty('--builder-grid-gap',`${Math.max(8,Math.min(80,Number(l.grid_gap)||24))}px`);
    const fonts={'Space Grotesk':"'Space Grotesk',sans-serif",'Manrope':"'Manrope',sans-serif",'Inter':"'Inter',sans-serif",'IBM Plex Mono':"'IBM Plex Mono',monospace",'Roboto':"'Roboto',sans-serif",'Montserrat':"'Montserrat',sans-serif",'Poppins':"'Poppins',sans-serif",'Lato':"'Lato',sans-serif",'Playfair Display':"'Playfair Display',serif",'Merriweather':"'Merriweather',serif"};
    if(fonts[t.heading_font])r.setProperty('--display',fonts[t.heading_font]);
    if(fonts[t.body_font])r.setProperty('--body',fonts[t.body_font]);
    if(fonts[t.accent_font])r.setProperty('--mono',fonts[t.accent_font]);
    if(t.base_size)document.body.style.fontSize=`${Math.max(12,Math.min(24,Number(t.base_size)||16))}px`;
    document.querySelectorAll('.btn').forEach(x=>{if(b.radius!=null)x.style.borderRadius=`${Math.max(0,Math.min(100,Number(b.radius)||100))}px`});
  }

  function animationClass(v){return SAFE_ANIM.has(v)&&v!=='none'?` builder-anim anim-${v}`:''}
  function utilityClasses(arr){return (Array.isArray(arr)?arr:[]).filter(x=>SAFE_CLASSES.has(x)).map(x=>` ${x}`).join('')}
  function styleControls(o={}){
    const s=[];
    if(hex(o.background_color))s.push(`background:${o.background_color}`);
    if(hex(o.text_color))s.push(`color:${o.text_color}`);
    if(o.margin_top!=null)s.push(`margin-top:${Math.max(0,Math.min(200,Number(o.margin_top)||0))}px`);
    if(o.margin_bottom!=null)s.push(`margin-bottom:${Math.max(0,Math.min(200,Number(o.margin_bottom)||0))}px`);
    if(o.max_width!=null)s.push(`max-width:${Math.max(100,Math.min(1800,Number(o.max_width)||1800))}px`);
    return s.join(';');
  }
  function button(b,cls='btn btn-primary'){
    if(!b||!b.label)return'';
    const u=safeUrl(b.url)||'#';
    return `<a class="${cls}" href="${esc(u)}"${b.new_tab?' target="_blank" rel="noopener"':''}>${esc(b.label)}</a>`;
  }
  function img(o={},cls='builder-image'){
    const src=media(o.image,o.image_external);
    if(!src)return'';
    const mobile=media(o.mobile_image,o.mobile_image_external);
    const radius=o.radius!=null?`border-radius:${Math.max(0,Math.min(100,Number(o.radius)||0))}px;`:'';
    const fit=['cover','contain','fill'].includes(o.object_fit)?o.object_fit:'cover';
    const pos=['center','top','bottom','left','right'].includes(o.object_position)?o.object_position:'center';
    const body=`<img class="${cls}" src="${esc(src)}" alt="${esc(o.alt||'')}" style="${radius}object-fit:${fit};object-position:${pos}">`;
    return mobile?`<picture><source media="(max-width:600px)" srcset="${esc(mobile)}">${body}</picture>`:body;
  }

  function renderElement(e={}){
    const cls=`builder-element${animationClass(e.animation)}${utilityClasses(e.classes)}`;
    const st=styleControls(e);
    switch(e.type){
      case'heading':{const tag=['h1','h2','h3','h4'].includes(e.level)?e.level:'h2';return`<div class="${cls}" style="${st}"><${tag}>${esc(e.text||'')}</${tag}></div>`}
      case'text':return`<div class="${cls}" style="${st}"><p>${esc(e.text||'')}</p></div>`;
      case'rich_text':return`<div class="${cls} cms-rich" style="${st}">${sanitizeRestrictedHTML(e.html||'')}</div>`;
      case'image':return`<div class="${cls}" style="${st}">${img(e)}</div>`;
      case'button':return`<div class="${cls}" style="${st}">${button(e,'btn '+(e.style==='secondary'?'btn-ghost':'btn-primary'))}</div>`;
      case'icon':{const src=media(e.icon,e.icon_external);return src?`<div class="${cls}" style="${st}"><img src="${esc(src)}" alt="${esc(e.alt||'')}" style="width:${Math.max(16,Math.min(160,Number(e.size)||48))}px;height:${Math.max(16,Math.min(160,Number(e.size)||48))}px;object-fit:contain"></div>`:''}
      case'spacer':return`<div style="height:${Math.max(0,Math.min(300,Number(e.height)||40))}px"></div>`;
      case'divider':return`<div class="builder-divider ${cls}" style="${st}"></div>`;
      default:return'';
    }
  }
  function renderRows(rows=[]){
    return (rows||[]).map(row=>{
      const ratio=SAFE_RATIOS.has(String(row.layout))?String(row.layout):String((row.columns||[]).length||1);
      const rowClass=/^\d$/.test(ratio)?`cols-${ratio}`:`ratio-${ratio}`;
      const cols=(row.columns||[]).map(c=>`<div class="builder-column">${(c.elements||[]).map(renderElement).join('')}</div>`).join('');
      return`<div class="builder-row ${rowClass}" style="${styleControls(row)}">${cols}</div>`;
    }).join('');
  }
  async function relationItems(folder,slugs){
    const a=Array.isArray(slugs)?slugs:[];
    return (await Promise.all(a.map(s=>get(`/content/${folder}/${encodeURIComponent(s)}.json`).catch(()=>null)))).filter(x=>x&&x.enabled!==false);
  }

  async function renderSection(s,ctx){
    if(!s||s.visible===false)return'';
    const width=['narrow','wide','full'].includes(s.width)?s.width:'wide';
    const align=s.alignment==='center'?' builder-center':s.alignment==='right'?' builder-right':'';
    const spacing=s.spacing==='compact'?' compact':s.spacing==='spacious'?' spacious':'';
    const mobile=s.mobile_visible===false?' builder-hidden-mobile':'';
    const desktop=s.desktop_visible===false?' builder-hidden-desktop':'';
    const shell=(body)=>`<section class="builder-section${spacing}${mobile}${desktop}${animationClass(s.animation)}${utilityClasses(s.classes)}" style="${styleControls(s)}"><div class="builder-inner ${width}${align}">${body}</div></section>`;
    const head=()=>`${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}${s.heading?`<h2>${esc(s.heading)}</h2>`:''}${s.text?`<p class="lead">${esc(s.text)}</p>`:''}`;
    switch(s.type){
      case'rows':return shell(`${head()}${renderRows(s.rows)}`);
      case'hero':return shell(`<div class="hero-grid"><div>${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h1>${esc(s.heading||'')}</h1><p class="lead">${esc(s.text||'')}</p><div class="cta-row">${button(s.primary_button)}${button(s.secondary_button,'btn btn-ghost')}</div></div><div>${img(s,'builder-image')}</div></div>`);
      case'text':return shell(head());
      case'image':return shell(`${head()}${img(s)}`);
      case'image_text':return shell(`<div class="split">${s.image_position==='right'?`<div>${head()}${button(s.button,'btn btn-ghost')}</div><div>${img(s)}</div>`:`<div>${img(s)}</div><div>${head()}${button(s.button,'btn btn-ghost')}</div>`}</div>`);
      case'cta':return shell(`<div class="cta-banner"><div><h2>${esc(s.heading||'')}</h2><p>${esc(s.text||'')}</p></div><div class="cta-row">${button(s.primary_button)}${button(s.secondary_button,'btn btn-ghost on-dark')}</div></div>`);
      case'gallery':return shell(`${head()}<div class="builder-gallery">${(s.images||[]).map(x=>img(x)).join('')}</div>`);
      case'embed':{const u=safeUrl(s.url);let ok=false;try{const h=new URL(u).hostname;ok=SAFE_EMBED_HOSTS.has(h)}catch{}return shell(`${head()}${ok?`<div class="builder-embed"><iframe src="${esc(u)}" title="${esc(s.embed_title||'Embedded content')}" loading="lazy" allowfullscreen></iframe></div>`:''}`)}
      case'restricted_html':return shell(`<div class="cms-rich">${sanitizeRestrictedHTML(s.html||'')}</div>`);
      case'services':{const items=await relationItems('services',s.items);return shell(`${head()}<div class="service-grid">${items.map(x=>`<div class="service-card"><span class="tag">${esc(x.tag||'')}</span><h3>${esc(x.title||'')}</h3><p>${esc(x.short_description||x.full_description||'')}</p></div>`).join('')}</div>`)}
      case'testimonials':{const items=await relationItems('testimonials',s.items);return shell(`${head()}<div class="testi-grid">${items.map(x=>`<div class="testi-card"><div class="stars">${'★'.repeat(Math.min(5,Math.max(0,Number(x.rating)||5)))}</div><p>"${esc(x.quote||'')}"</p><div class="testi-person">${img({image:x.photo,image_external:x.photo_external,alt:x.photo_alt||x.name},'') }<div><strong>${esc(x.name||'')}</strong><span>${esc([x.job_title,x.company].filter(Boolean).join(', '))}</span></div></div></div>`).join('')}</div>`)}
      case'portfolio':{const items=await relationItems('portfolio',s.items);return shell(`${head()}<div class="card-grid">${items.map(x=>`<div class="p-card" data-cat="${esc(x.category||'')}"><div class="thumb">${img({image:x.main_image,image_external:x.main_image_external,alt:x.main_image_alt||x.title},'')}</div><div class="body"><span class="cat">${esc(x.category_label||'')}</span><h3>${esc(x.title||'')}</h3><p>${esc(x.description||'')}</p><div class="card-foot"><span class="result">${esc(x.result_metric||x.results||'')}</span></div></div></div>`).join('')}</div>`)}
      case'faq':{const items=await relationItems('faq',s.items);return shell(`${head()}<div class="faq">${items.map((x,i)=>`<div class="faq-item${i===0?' open':''}"><button class="faq-q" aria-expanded="${i===0?'true':'false'}">${esc(x.question||'')} <span class="plus">+</span></button><div class="faq-a"${i===0?' style="max-height:240px"':''}><p>${esc(x.answer||'')}</p></div></div>`).join('')}</div>`)}
      case'pricing':{const items=await relationItems('pricing',s.items);return shell(`${head()}<div class="builder-pricing">${items.map(x=>`<div class="builder-pricing-card${x.highlighted?' highlighted':''}"><h3>${esc(x.name||'')}</h3><h2>${esc(x.price||'')} <small>${esc(x.billing_period||'')}</small></h2><p>${esc(x.description||'')}</p><ul>${(x.features||[]).map(f=>`<li>${esc(f)}</li>`).join('')}</ul>${button({label:x.cta_text,url:x.cta_link})}</div>`).join('')}</div>`)}
      case'logos':{const items=await relationItems('logos',s.items);return shell(`${head()}<div class="builder-logo-wall">${items.map(x=>{const src=media(x.logo,x.logo_external);return src?`<a href="${esc(safeUrl(x.url)||'#')}" ${x.url?'':'onclick="return false"'}><img src="${esc(src)}" alt="${esc(x.alt||x.name||'')}"></a>`:''}).join('')}</div>`)}
      case'team':{const items=await relationItems('team',s.items);return shell(`${head()}<div class="card-grid">${items.map(x=>`<div class="builder-card">${img({image:x.photo,image_external:x.photo_external,alt:x.alt||x.name})}<h3>${esc(x.name||'')}</h3><p class="muted">${esc(x.role||'')}</p><p>${esc(x.bio||'')}</p></div>`).join('')}</div>`)}
      case'tabs':return shell(`${head()}<div class="builder-tabs"><div class="builder-tabs-nav">${(s.tabs||[]).map((x,i)=>`<button class="filter-btn builder-tab-btn${i===0?' active':''}" data-tab="${i}">${esc(x.label||'Tab')}</button>`).join('')}</div>${(s.tabs||[]).map((x,i)=>`<div class="builder-tab-panel" data-panel="${i}"${i===0?'':' hidden'}><div class="cms-rich">${sanitizeRestrictedHTML(x.html||'')}</div></div>`).join('')}</div>`);
      case'accordion':return shell(`${head()}${(s.items||[]).map((x,i)=>`<div class="builder-accordion-item${i===0?' open':''}"><button class="builder-accordion-q">${esc(x.heading||'')}</button><div class="builder-accordion-a"><p>${esc(x.text||'')}</p></div></div>`).join('')}`);
      case'carousel':return shell(`${head()}<div class="builder-carousel">${(s.items||[]).map(x=>`<div class="builder-card">${img(x)}<h3>${esc(x.heading||'')}</h3><p>${esc(x.text||'')}</p></div>`).join('')}</div>`);
      case'announcement':return `<div class="builder-section compact${animationClass(s.animation)}" style="${styleControls(s)}"><div class="builder-inner ${width}${align}"><strong>${esc(s.text||'')}</strong> ${button(s.button,'btn btn-sm btn-ghost')}</div></div>`;
      case'divider':return shell('<div class="builder-divider"></div>');
      case'spacer':return`<div style="height:${Math.max(0,Math.min(300,Number(s.height)||48))}px"></div>`;
      case'form':return shell(`${head()}<form class="builder-form" data-form-name="${esc(s.form_name||'builder-form')}">${(s.fields||[]).map(f=>renderFormField(f)).join('')}<button class="btn btn-primary" type="submit">${esc(s.submit_text||'Submit')}</button><div class="form-msg">${esc(s.success_message||'Thanks. Your message was received.')}</div></form>`);
      default:return'';
    }
  }
  function renderFormField(f){
    const id='bf-'+Math.random().toString(36).slice(2,8),req=f.required?' required':'';
    const label=`<label for="${id}">${esc(f.label||'')}</label>`;
    if(f.type==='textarea')return`<div class="field">${label}<textarea id="${id}" name="${esc(f.name||'field')}" placeholder="${esc(f.placeholder||'')}"${req}></textarea>${f.help_text?`<small>${esc(f.help_text)}</small>`:''}</div>`;
    if(f.type==='select')return`<div class="field">${label}<select id="${id}" name="${esc(f.name||'field')}"${req}>${(f.options||[]).map(o=>`<option value="${esc(o.value||o.label||'')}">${esc(o.label||o.value||'')}</option>`).join('')}</select></div>`;
    if(f.type==='checkbox'||f.type==='radio')return`<div class="field">${label}${(f.options||[]).map(o=>`<label><input type="${f.type}" name="${esc(f.name||'field')}" value="${esc(o.value||o.label||'')}"${req}> ${esc(o.label||o.value||'')}</label>`).join('')}</div>`;
    const type=['text','email','tel','number','date','url'].includes(f.type)?f.type:'text';
    return`<div class="field">${label}<input type="${type}" id="${id}" name="${esc(f.name||'field')}" placeholder="${esc(f.placeholder||'')}"${req}>${f.help_text?`<small>${esc(f.help_text)}</small>`:''}</div>`;
  }

  async function ensureMount(slug){
    let page=document.getElementById('page-'+slug);
    if(!page){
      page=document.createElement('div');page.className='page';page.id='page-'+slug;
      document.getElementById('main').appendChild(page);
    }
    let m=page.querySelector('.builder-mount');
    if(!m){m=document.createElement('div');m.className='builder-mount';page.appendChild(m)}
    return{page,mount:m};
  }

  async function renderPage(slug,ctx){
    const cfg=await get(`/content/pages/${encodeURIComponent(slug)}.json`).catch(()=>null);
    if(!cfg||cfg.published===false)return false;
    const {page,mount}=await ensureMount(slug);
    page.classList.toggle('builder-mode',cfg.mode==='builder');
    if(cfg.mode==='builder'){
      let theme=ctx.currentTheme||ctx.theme;
      if(cfg.theme&&cfg.theme!=='inherit')theme=await get(`/content/themes/${encodeURIComponent(cfg.theme)}.json`).catch(()=>ctx.currentTheme||ctx.theme);
      applyTheme(theme);
      const parts=[];
      for(const s of (cfg.sections||[]))parts.push(await renderSection(s,ctx));
      mount.innerHTML=parts.join(''); // empty sections => genuinely blank page body
    }else{
      mount.innerHTML='';
      applyTheme(ctx.currentTheme||ctx.theme);
    }
    document.querySelector('header.site').style.display=cfg.header_visible===false?'none':'';
    document.querySelector('footer.site').style.display=cfg.footer_visible===false?'none':'';
    updateSEO(cfg,ctx);
    return true;
  }
  function updateSEO(cfg,ctx){
    const p=cfg.seo||{},fallback=ctx.site?.seo||{};
    document.title=p.title||fallback.title||document.title;
    const set=(name,val)=>{let e=document.querySelector(`meta[name="${name}"]`);if(!e){e=document.createElement('meta');e.name=name;document.head.appendChild(e)}e.content=val||''};
    set('description',p.description||fallback.description||'');set('keywords',p.keywords||fallback.keywords||'');
    set('robots',`${p.robots_index===false?'noindex':'index'},${p.robots_follow===false?'nofollow':'follow'}`);
  }

  function renderHeader(settings){
    const h=settings.header||{},header=document.querySelector('header.site');
    if(!header)return;
    header.style.display=h.enabled===false?'none':'';
    header.style.position=h.sticky===false?'relative':'sticky';
    header.style.background='var(--paper)';
    header.style.color='var(--ink)';
    const currentMode=(window.__HYBRID_CMS__&&window.__HYBRID_CMS__.themeMode)||'light';
    const lightLogo=media(h.logo,h.logo_external);
    const darkLogo=media(h.logo_dark,h.logo_dark_external)||lightLogo;
    const logo=currentMode==='dark'?darkLogo:lightLogo;
    const nav=(settings.navigation||[]).filter(x=>x.enabled!==false).map(x=>`<a href="${esc(safeUrl(x.url)||'#home')}"${x.new_tab?' target="_blank" rel="noopener"':''}>${esc(x.label||'')}</a>`).join('');
    const c=h.cta||{},toggle=settings.visitor_theme_toggle||{};
    const toggleMarkup=toggle.enabled===false?'':`<button class="theme-toggle" id="themeToggle" type="button" aria-label="Switch color theme" title="Switch color theme">
      <svg class="theme-icon-light" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="4" stroke="currentColor" stroke-width="1.8"/><path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>
    </button>`;
    header.innerHTML=`<div class="nav-inner"><a href="#home" class="logo">${logo?`<img id="headerThemeLogo" data-light-src="${esc(lightLogo)}" data-dark-src="${esc(darkLogo)}" src="${esc(logo)}" alt="${esc(h.logo_alt||'')}" style="width:${Math.max(40,Math.min(240,Number(h.logo_width)||166))}px">`:''}${h.show_company_name===false?'':`<span>${esc(h.company_name||'')}</span>`}</a><nav class="primary">${nav}</nav><div class="header-actions">${toggleMarkup}${c.enabled===false?'':button(c,'btn btn-primary btn-sm desktop-only')}<button class="burger" id="burgerBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button></div></div>`;
    const mobile=document.getElementById('mobileMenu');
    if(mobile)mobile.innerHTML=nav+(c.enabled===false?'':button(c,'btn btn-primary'));
  }
  function renderFooter(settings,site){
    const f=settings.footer||{},footer=document.querySelector('footer.site');if(!footer)return;
    footer.style.display=f.enabled===false?'none':'';
    const logo=media(f.logo,f.logo_external);
    const groups=(f.groups||[]).map(g=>`<div class="foot-col"><h5>${esc(g.heading||'')}</h5>${(g.links||[]).map(x=>`<a href="${esc(safeUrl(x.url)||'#')}"${x.new_tab?' target="_blank" rel="noopener"':''}>${esc(x.label||'')}</a>`).join('')}</div>`).join('');
    const socials=Object.entries(settings.social||{}).filter(([,u])=>safeUrl(u)).map(([k,u])=>`<a href="${esc(safeUrl(u))}" target="_blank" rel="noopener">${esc(k.slice(0,2))}</a>`).join('');
    footer.innerHTML=`<div class="wrap"><div class="foot-grid"><div><div class="foot-logo">${logo?`<img src="${esc(logo)}" alt="${esc(f.logo_alt||'')}">`:''}<span>${esc(settings.header?.company_name||site.company_name||'')}</span></div><p>${esc(f.description||'')}</p><div class="foot-social">${socials}</div></div>${groups}<div class="foot-col"><h5>Contact</h5><span>${esc(site.footer_email||'')}</span><span>${esc(site.footer_phone||'')}</span><span>${esc((site.footer_address||'').replace(/\n/g,' · '))}</span></div></div><div class="foot-bottom"><span>${esc(f.copyright||'')}</span><span>${esc(f.secondary_text||'')}</span></div></div>`;
  }


  async function resolveVisitorTheme(settings){
    const cfg=settings.visitor_theme_toggle||{};
    if(cfg.enabled===false){
      const theme=await get(`/content/themes/${encodeURIComponent(settings.active_theme||'benvor-premium-light')}.json`).catch(()=>null);
      return {mode:'light',theme};
    }
    const stored=localStorage.getItem('benvor-theme');
    const systemDark=window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches;
    let mode=stored==='light'||stored==='dark'?stored:(cfg.default==='dark'?'dark':cfg.default==='light'?'light':(systemDark?'dark':'light'));
    const slug=mode==='dark'?(cfg.dark_theme||'benvor-premium-dark'):(cfg.light_theme||'benvor-premium-light');
    const theme=await get(`/content/themes/${encodeURIComponent(slug)}.json`).catch(()=>null);
    return {mode,theme};
  }
  function updateThemeUI(mode){
    document.documentElement.dataset.theme=mode;
    const logo=document.getElementById('headerThemeLogo');
    if(logo){
      const src=mode==='dark'?logo.dataset.darkSrc:logo.dataset.lightSrc;
      if(src)logo.src=src;
    }
    const btn=document.getElementById('themeToggle');
    if(btn)btn.setAttribute('aria-label',mode==='dark'?'Switch to light theme':'Switch to dark theme');
  }
  async function toggleVisitorTheme(){
    const ctx=window.__HYBRID_CMS__; if(!ctx)return;
    const cfg=ctx.settings.visitor_theme_toggle||{};
    const next=ctx.themeMode==='dark'?'light':'dark';
    const slug=next==='dark'?(cfg.dark_theme||'benvor-premium-dark'):(cfg.light_theme||'benvor-premium-light');
    const theme=await get(`/content/themes/${encodeURIComponent(slug)}.json`).catch(()=>null);
    if(!theme)return;
    ctx.themeMode=next;ctx.currentTheme=theme;ctx.theme=theme;
    localStorage.setItem('benvor-theme',next);
    applyTheme(theme);updateThemeUI(next);
  }

  function bindDynamic(){
    const burger=document.getElementById('burgerBtn'),mobile=document.getElementById('mobileMenu'),scrim=document.getElementById('scrim');
    const themeToggle=document.getElementById('themeToggle');
    if(themeToggle)themeToggle.onclick=toggleVisitorTheme;
    if(burger&&mobile){burger.onclick=()=>{const o=mobile.classList.toggle('open');scrim.classList.toggle('open',o);burger.setAttribute('aria-expanded',o?'true':'false')}}
    if(scrim) scrim.onclick=()=>{mobile?.classList.remove('open');scrim.classList.remove('open')};
    document.querySelectorAll('a[href^="#"]').forEach(a=>{a.onclick=e=>{const s=a.getAttribute('href').slice(1);if(!s)return;e.preventDefault();history.pushState(null,'','#'+s);route()}});
    document.querySelectorAll('.faq-item').forEach(item=>{const q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');if(q&&a)q.onclick=()=>{const open=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(i=>{i.classList.remove('open');const aa=i.querySelector('.faq-a');if(aa)aa.style.maxHeight=null});if(!open){item.classList.add('open');a.style.maxHeight=a.scrollHeight+'px'}}});
    document.querySelectorAll('.builder-tab-btn').forEach(btn=>btn.onclick=()=>{const root=btn.closest('.builder-tabs');root.querySelectorAll('.builder-tab-btn').forEach(b=>b.classList.remove('active'));root.querySelectorAll('.builder-tab-panel').forEach(p=>p.hidden=true);btn.classList.add('active');root.querySelector(`[data-panel="${btn.dataset.tab}"]`).hidden=false});
    document.querySelectorAll('.builder-accordion-q').forEach(q=>q.onclick=()=>q.parentElement.classList.toggle('open'));
    document.querySelectorAll('.builder-form').forEach(form=>form.onsubmit=e=>{e.preventDefault();if(!form.checkValidity()){form.reportValidity();return}form.querySelector('.form-msg')?.classList.add('show');form.reset()});
  }

  async function route(){
    const raw=(location.hash||'#home').slice(1),slug=raw||'home',ctx=window.__HYBRID_CMS__;
    if(!ctx)return;
    const ok=await renderPage(slug,ctx);
    if(!ok){await renderPage('home',ctx);window.history.replaceState(null,'','#home')}
    document.querySelectorAll('.page').forEach(p=>p.classList.toggle('active',p.id==='page-'+(ok?slug:'home')));
    window.scrollTo({top:0,behavior:'auto'});bindDynamic();
  }

  async function init(){
    try{
      const [settings,site]=await Promise.all([get('/content/builder-settings.json'),get('/content/site.json')]);
      const resolved=await resolveVisitorTheme(settings);
      const theme=resolved.theme||await get(`/content/themes/${encodeURIComponent(settings.active_theme||'benvor-premium-light')}.json`).catch(()=>null);
      window.__HYBRID_CMS__={settings,site,theme,currentTheme:theme,themeMode:resolved.mode};
      applyTheme(theme);updateThemeUI(resolved.mode);renderHeader(settings);renderFooter(settings,site);updateThemeUI(resolved.mode);
      await route();
      addEventListener('popstate',route);addEventListener('hashchange',route);
    }catch(err){console.warn('Hybrid builder did not initialize; original HTML remains available.',err)}
  }
  document.addEventListener('DOMContentLoaded',init);
})();
