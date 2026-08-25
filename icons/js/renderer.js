
'use strict';

const CMS = (() => {
  const cache = new Map();

  const allowedSectionTypes = new Set([
    'hero','page_hero','text','rich_text','image','image_text','columns','features',
    'services','testimonials','portfolio','stats','trust','cta','faq','process','team',
    'gallery','embed','contact_details','contact_form','map','spacer','divider','custom_content'
  ]);
  const allowedWidths = new Set(['narrow','wide','full']);
  const allowedAlign = new Set(['left','center','right']);
  const allowedPadding = new Set(['compact','normal','spacious']);
  const allowedColumns = new Set(['1','2','3','4']);
  const allowedInternal = new Set(['home','about','services','portfolio','contact','listings']);

  function esc(value=''){
    return String(value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  }
  function attr(value=''){ return esc(value); }

  function validHex(v){
    return typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v.trim());
  }

  function safeUrl(value){
    if(!value) return '';
    const v = String(value).trim();
    if(/^#[a-zA-Z0-9_-]+$/.test(v)) return v;
    if(/^\/[a-zA-Z0-9_./%-]*$/.test(v)) return v;
    if(/^https?:\/\/[^\s]+$/i.test(v)) return v;
    if(/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(v)) return v;
    if(/^tel:[+0-9().\-\s]+$/i.test(v)) return v;
    return '';
  }

  function mediaPath(localValue, externalValue){
    const external = safeUrl(externalValue);
    if(external && /^https?:\/\//i.test(external)) return external;
    const local = safeUrl(localValue);
    return local;
  }

  function buttonMarkup(btn, cls='btn btn-primary'){
    if(!btn || !btn.label) return '';
    const url = safeUrl(btn.url) || '#';
    const target = btn.new_tab ? ' target="_blank" rel="noopener"' : '';
    return `<a class="${attr(cls)}" href="${attr(url)}"${target}>${esc(btn.label)}</a>`;
  }

  async function getJSON(path){
    if(cache.has(path)) return cache.get(path);
    const promise = fetch(path,{cache:'no-store'}).then(r=>{
      if(!r.ok) throw new Error(`Failed to load ${path}: ${r.status}`);
      return r.json();
    });
    cache.set(path,promise);
    return promise;
  }

  function sectionShell(s, inner, extraClass=''){
    const visible = s.visible !== false;
    const width = allowedWidths.has(String(s.content_width)) ? String(s.content_width) : 'wide';
    const align = allowedAlign.has(String(s.alignment)) ? String(s.alignment) : 'left';
    const padding = allowedPadding.has(String(s.padding)) ? String(s.padding) : 'normal';
    const mobile = s.mobile_visible === false ? ' cms-hide-mobile' : '';
    const desktop = s.desktop_visible === false ? ' cms-hide-desktop' : '';
    const bg = validHex(s.background_color) ? `background:${s.background_color};` : '';
    const color = validHex(s.text_color) ? `color:${s.text_color};` : '';
    const id = /^[a-zA-Z][\w-]*$/.test(s.section_id||'') ? ` id="${attr(s.section_id)}"` : '';
    return `<section${id} class="dynamic-section cms-section-${padding} ${extraClass}${mobile}${desktop}" style="${bg}${color}"${visible?'':' hidden'}>
      <div class="cms-section-inner ${width} cms-${align}">${inner}</div>
    </section>`;
  }

  function headingBlock(s, level='h2'){
    const eyebrow = s.eyebrow ? `<span class="eyebrow">${esc(s.eyebrow)}</span>` : '';
    const heading = s.heading ? `<${level}>${esc(s.heading)}</${level}>` : '';
    const text = s.text ? `<p class="lead" style="margin-top:12px;">${esc(s.text)}</p>` : '';
    return `<div class="section-head">${eyebrow}${heading}${text}</div>`;
  }

  function renderSimpleMarkdown(md=''){
    let safe = esc(md);
    safe = safe.replace(/\*\*(.+?)\*\*/g,'<strong>$1</strong>');
    safe = safe.replace(/\*(.+?)\*/g,'<em>$1</em>');
    safe = safe.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[A-Za-z0-9_-]+|\/[A-Za-z0-9_./%-]*)\)/g,
      (_m,label,url)=>`<a href="${attr(safeUrl(url))}">${label}</a>`);
    const blocks = safe.split(/\n{2,}/).map(p=>`<p>${p.replace(/\n/g,'<br>')}</p>`);
    return blocks.join('');
  }

  async function fetchItems(folder, slugs){
    const list = Array.isArray(slugs) ? slugs.filter(Boolean) : [];
    const items = await Promise.all(list.map(slug=>getJSON(`/content/${folder}/${encodeURIComponent(slug)}.json`).catch(()=>null)));
    return items.filter(x=>x && x.enabled !== false);
  }

  function mediaObjectMarkup(s, prefix='image', className='cms-image'){
    const src = mediaPath(s[prefix], s[`${prefix}_external`]);
    if(!src) return '';
    const alt = s[`${prefix}_alt`] || '';
    const caption = s[`${prefix}_caption`] || '';
    const link = safeUrl(s[`${prefix}_link`]);
    const img = `<img class="${className}" src="${attr(src)}" alt="${attr(alt)}" loading="lazy">`;
    return `<figure>${link?`<a href="${attr(link)}">${img}</a>`:img}${caption?`<figcaption>${esc(caption)}</figcaption>`:''}</figure>`;
  }

  const renderers = {
    hero: async s => {
      const img = mediaPath(s.image,s.image_external);
      const media = img ? `<div class="cms-media"><img class="cms-image" src="${attr(img)}" alt="${attr(s.image_alt||'')}"></div>` :
      `<div class="chart-card" aria-hidden="true"><div class="cc-top"><span>Qualified leads / mo</span><strong>+212%</strong></div><p>90 days after launch, Benvor client average</p><svg viewBox="0 0 320 150" width="100%" height="150"><line x1="0" y1="30" x2="320" y2="30" stroke="#23243a"/><line x1="0" y1="75" x2="320" y2="75" stroke="#23243a"/><line x1="0" y1="120" x2="320" y2="120" stroke="#23243a"/><path d="M0,120 L45,108 L90,116 L135,84 L180,90 L225,52 L270,44 L320,12" fill="none" stroke="#FF5B3D" stroke-width="3"/></svg></div>`;
      const copy = `<div>${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h1>${esc(s.heading||'')}</h1><p class="lead">${esc(s.text||'')}</p><div class="cta-row">${buttonMarkup(s.primary_button)}${buttonMarkup(s.secondary_button,'btn btn-ghost')}</div></div>`;
      const cls = s.image_position === 'left' ? 'cms-image-text' : 'cms-image-text image-right';
      return sectionShell(s,`<div class="${cls}">${copy}${media}</div>`,'hero');
    },
    page_hero: async s => sectionShell(s,`${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h1>${esc(s.heading||'')}</h1>${s.text?`<p class="lead">${esc(s.text)}</p>`:''}`,'page-hero'),
    text: async s => sectionShell(s,`${headingBlock(s)}${s.text?`<div class="cms-rich">${renderSimpleMarkdown(s.text)}</div>`:''}`),
    rich_text: async s => sectionShell(s,`${headingBlock(s)}<div class="cms-rich">${renderSimpleMarkdown(s.body||s.text||'')}</div>`),
    image: async s => sectionShell(s,`${headingBlock(s)}${mediaObjectMarkup(s,'image')}`),
    image_text: async s => {
      const media = mediaObjectMarkup(s,'image');
      const copy = `<div class="cms-copy">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h2>${esc(s.heading||'')}</h2><div class="cms-rich">${renderSimpleMarkdown(s.text||'')}</div>${s.button?.label?`<div style="margin-top:24px">${buttonMarkup(s.button,'btn btn-ghost')}</div>`:''}</div>`;
      const cls = s.image_position === 'right' ? 'cms-image-text image-right' : 'cms-image-text';
      return sectionShell(s,`<div class="${cls}"><div class="cms-media">${media}</div>${copy}</div>`);
    },
    columns: async s => {
      const cols = allowedColumns.has(String(s.columns)) ? String(s.columns) : '2';
      const cards = (s.items||[]).map(item=>{
        const src = mediaPath(item.image,item.image_external) || mediaPath(item.icon,item.icon_external);
        return `<div class="cms-flex-card">${src?`<img src="${attr(src)}" alt="${attr(item.image_alt||item.title||'')}">`:''}${item.eyebrow?`<span class="eyebrow">${esc(item.eyebrow)}</span>`:''}<h3>${esc(item.title||'')}</h3><p>${esc(item.text||'')}</p>${buttonMarkup(item.button,'btn btn-ghost btn-sm')}</div>`;
      }).join('');
      return sectionShell(s,`${headingBlock(s)}<div class="cms-columns cols-${cols}">${cards}</div>`);
    },
    features: async s => renderers.columns({...s,columns:s.columns||'3'}),
    services: async s => {
      const items = await fetchItems('services',s.items);
      const cards = items.map(x=>{
        const icon = mediaPath(x.icon,x.icon_external);
        const desc = s.use_short_description === false ? x.full_description : x.short_description;
        return `<div class="service-card">${icon?`<div class="icon"><img src="${attr(icon)}" alt="" style="width:22px;height:22px;object-fit:contain"></div>`:''}<span class="tag">${esc(x.tag||'')}</span><h3>${esc(x.title||'')}</h3><p>${esc(desc||'')}</p>${x.cta_text?`<a class="view" href="${attr(safeUrl(x.cta_link)||'#')}">${esc(x.cta_text)}</a>`:''}</div>`;
      }).join('');
      return sectionShell(s,`${headingBlock(s)}<div class="service-grid">${cards}</div>`);
    },
    testimonials: async s => {
      const items = await fetchItems('testimonials',s.items);
      const cards = items.map(x=>{
        const photo = mediaPath(x.photo,x.photo_external);
        return `<div class="testi-card"><div class="stars">${'★'.repeat(Math.max(0,Math.min(5,Number(x.rating)||0)))}</div><p>"${esc(x.quote||'')}"</p><div class="testi-person">${photo?`<img src="${attr(photo)}" alt="${attr(x.photo_alt||x.name||'')}">`:''}<div><strong>${esc(x.name||'')}</strong><span>${esc([x.job_title,x.company].filter(Boolean).join(', '))}</span></div></div></div>`;
      }).join('');
      return sectionShell(s,`${headingBlock(s)}<div class="testi-grid">${cards}</div>`);
    },
    portfolio: async s => {
      const items = await fetchItems('portfolio',s.items);
      const filters = Array.isArray(s.filters) && s.filters.length ? s.filters : [{label:'All Work',value:'all'}];
      const buttons = s.show_filters === false ? '' : `<div class="filter-bar">${filters.map((f,i)=>`<button class="filter-btn${i===0?' active':''}" data-filter="${attr(f.value)}">${esc(f.label)}</button>`).join('')}</div>`;
      const cards = items.map(x=>{
        const img=mediaPath(x.main_image,x.main_image_external);
        return `<div class="p-card" data-cat="${attr(x.category||'')}">${img?`<div class="thumb"><img src="${attr(img)}" alt="${attr(x.main_image_alt||x.title||'')}"></div>`:''}<div class="body"><span class="cat">${esc(x.category_label||x.category||'')}</span><h3>${esc(x.title||'')}</h3><p>${esc(x.description||'')}</p><div class="card-foot"><span class="result">${esc(x.result_metric||x.results||'')}</span></div>${x.cta_text?`<a href="${attr(safeUrl(x.cta_link)||'#contact')}" class="view">${esc(x.cta_text)}</a>`:''}</div></div>`;
      }).join('');
      return sectionShell(s,`${headingBlock(s)}${buttons}<div class="card-grid">${cards}</div>`);
    },
    stats: async s => {
      const items=(s.items||[]).map(x=>`<div><strong>${esc(x.value||'')}</strong><span>${esc(x.label||'')}</span></div>`).join('');
      return sectionShell(s,`${headingBlock(s)}<div class="hero-stats">${items}</div>`);
    },
    trust: async s => sectionShell(s,`<div class="trust"><div class="wrap"><span class="label">${esc(s.label||'')}</span><div class="logos">${(s.items||[]).map(x=>`<span>${esc(x)}</span>`).join('')}</div></div></div>`,'tight'),
    cta: async s => sectionShell(s,`<div class="cta-banner"><div><h2>${esc(s.heading||'')}</h2>${s.text?`<p>${esc(s.text)}</p>`:''}</div><div class="cta-row">${buttonMarkup(s.primary_button)}${buttonMarkup(s.secondary_button,'btn btn-ghost on-dark')}</div></div>`),
    faq: async s => {
      const items=await fetchItems('faq',s.items);
      const rows=items.map((x,i)=>`<div class="faq-item${i===0?' open':''}"><button class="faq-q" aria-expanded="${i===0?'true':'false'}">${esc(x.question||'')} <span class="plus">+</span></button><div class="faq-a"${i===0?' style="max-height:240px"':''}><p>${esc(x.answer||'')}</p></div></div>`).join('');
      return sectionShell(s,`${headingBlock(s)}<div class="faq">${rows}</div>`);
    },
    process: async s => sectionShell(s,`${headingBlock(s)}<div class="steps">${(s.items||[]).map(x=>`<div class="step"><span class="step-num">${esc(x.number||'')}</span><h4>${esc(x.title||'')}</h4><p>${esc(x.text||'')}</p></div>`).join('')}</div>`),
    team: async s => {
      const items=await fetchItems('team',s.items);
      const cards=items.map(x=>{const photo=mediaPath(x.photo,x.photo_external);return `<div class="team-card">${photo?`<img src="${attr(photo)}" alt="${attr(x.photo_alt||x.name||'')}">`:''}<div class="body"><h3>${esc(x.name||'')}</h3><p class="muted">${esc(x.position||'')}</p><p>${esc(x.bio||'')}</p></div></div>`}).join('');
      return sectionShell(s,`${headingBlock(s)}<div class="team-grid">${cards}</div>`);
    },
    gallery: async s => sectionShell(s,`${headingBlock(s)}<div class="gallery-grid">${(s.images||[]).map(x=>{const src=mediaPath(x.image,x.external_url);return src?`<figure><img src="${attr(src)}" alt="${attr(x.alt||'')}" loading="lazy">${x.caption?`<figcaption>${esc(x.caption)}</figcaption>`:''}</figure>`:''}).join('')}</div>`),
    embed: async s => {
      const url=safeUrl(s.url);
      const safe = /^https?:\/\//.test(url) ? url : '';
      return sectionShell(s,`${headingBlock(s)}${safe?`<div class="embed-wrap"><iframe src="${attr(safe)}" title="${attr(s.title||s.heading||'Embedded content')}" loading="lazy" allowfullscreen></iframe></div>`:''}`);
    },
    contact_details: async (s,ctx) => {
      const b=ctx.site.business, social=ctx.site.social;
      return sectionShell(s,`${headingBlock(s)}<div class="info-card"><h4>${esc(s.heading||'Contact Details')}</h4><div class="info-row"><span class="ico">✆</span><span>${esc(b.phone||'')}</span></div><div class="info-row"><span class="ico">✉</span><span>${esc(b.email||'')}</span></div><div class="info-row"><span class="ico">⌂</span><span>${esc([b.address_line_1,b.address_line_2].filter(Boolean).join(', '))}</span></div><div class="info-row"><span class="ico">🕐</span><span>${esc(b.hours||'')}</span></div></div>`);
    },
    contact_form: async (s,ctx) => {
      const f=ctx.site.contact_form,b=ctx.site.business,social=ctx.site.social;
      const socialLinks=Object.entries(social||{}).filter(([,u])=>safeUrl(u)).map(([k,u])=>`<a href="${attr(safeUrl(u))}" target="_blank" rel="noopener">${esc(k)}</a>`).join('');
      const map=s.show_map!==false && safeUrl(b.map_url)?`<div class="map-frame"><iframe src="${attr(safeUrl(b.map_url))}" title="Map" loading="lazy"></iframe></div>`:'';
      const details=s.show_contact_details===false?'':`<div class="info-card"><h4>Contact Details</h4><div class="info-row"><span class="ico">✆</span><span>${esc(b.phone||'')}</span></div><div class="info-row"><span class="ico">✉</span><span>${esc(b.email||'')}</span></div><div class="info-row"><span class="ico">⌂</span><span>${esc([b.address_line_1,b.address_line_2].filter(Boolean).join(', '))}</span></div><div class="info-row"><span class="ico">🕐</span><span>${esc(b.hours||'')}</span></div></div>`;
      const socials=s.show_social===false?'':`<div class="info-card" style="margin-top:20px"><h4>Follow Along</h4><div class="social-row">${socialLinks}</div></div>`;
      const form=`<div><div class="form-msg" id="formMsg">${esc(f.success_message||'')}</div><form id="contactForm" novalidate><div class="field"><label for="name">${esc(f.name_label||'Name')}</label><input id="name" name="name" placeholder="${attr(f.name_placeholder||'')}" required></div><div class="field"><label for="email">${esc(f.email_label||'Email')}</label><input type="email" id="email" name="email" placeholder="${attr(f.email_placeholder||'')}" required></div><div class="field"><label for="phone">${esc(f.phone_label||'Phone')}</label><input type="tel" id="phone" name="phone" placeholder="${attr(f.phone_placeholder||'')}"></div><div class="field"><label for="message">${esc(f.message_label||'Message')}</label><textarea id="message" name="message" placeholder="${attr(f.message_placeholder||'')}" required></textarea></div><button class="btn btn-primary" type="submit">${esc(f.submit_text||'Send Message')}</button></form></div>`;
      const side=`<div>${details}${map}${socials}</div>`;
      return sectionShell(s,`${s.heading?`<div class="section-head"><h2>${esc(s.heading)}</h2></div>`:''}<div class="contact-grid">${form}${side}</div>`);
    },
    map: async (s,ctx) => {
      const url=safeUrl(s.map_url||ctx.site.business.map_url);
      return sectionShell(s,url?`<div class="map-frame"><iframe src="${attr(url)}" title="${attr(s.title||'Map')}" loading="lazy"></iframe></div>`:'');
    },
    spacer: async s => `<div class="cms-spacer" style="height:${Math.max(0,Math.min(300,Number(s.height)||48))}px"></div>`,
    divider: async s => sectionShell({...s,padding:'compact'},'<div class="cms-divider"></div>'),
    custom_content: async s => renderers.columns({...s,columns:s.columns||'2'})
  };

  async function renderSection(section,ctx){
    if(!section || !allowedSectionTypes.has(section.type)) return '';
    const fn=renderers[section.type];
    return fn ? await fn(section,ctx) : '';
  }

  function applyBranding(b){
    const root=document.documentElement;
    const c=b.colors||{}, t=b.typography||{}, btn=b.buttons||{}, l=b.layout||{};
    const vars={
      '--indigo':c.primary,'--indigo-deep':c.primary_deep,'--coral':c.secondary,'--coral-deep':c.secondary_deep,
      '--paper':c.background,'--band':c.surface,'--ink':c.heading,'--muted':c.muted,'--line':c.border,'--night':c.night,
      '--ok':c.success,'--error':c.error,
      '--maxw':`${Number(l.container_width)||1180}px`,'--radius':`${Number(l.card_radius)||14}px`,
      '--section-spacing':`${Number(l.section_spacing)||96}px`
    };
    Object.entries(vars).forEach(([k,v])=>{if(v) root.style.setProperty(k,v)});
    const fontMap={
      'Space Grotesk':"'Space Grotesk',sans-serif",'Inter':"'Inter',sans-serif",'IBM Plex Mono':"'IBM Plex Mono',monospace",
      'Roboto':"'Roboto',sans-serif",'Montserrat':"'Montserrat',sans-serif",'Poppins':"'Poppins',sans-serif",'Lato':"'Lato',sans-serif",
      'Playfair Display':"'Playfair Display',serif",'Merriweather':"'Merriweather',serif"
    };
    if(fontMap[t.heading_font]) root.style.setProperty('--display',fontMap[t.heading_font]);
    if(fontMap[t.body_font]) root.style.setProperty('--body',fontMap[t.body_font]);
    if(fontMap[t.accent_font]) root.style.setProperty('--mono',fontMap[t.accent_font]);
    document.body.style.fontSize=`${Math.max(12,Math.min(22,Number(t.base_font_size)||16))}px`;
    document.querySelectorAll('.btn').forEach(el=>{
      el.style.borderRadius=`${Math.max(0,Math.min(100,Number(btn.radius)||100))}px`;
    });
    const favicon=mediaPath(b.favicon,b.favicon_external);
    if(favicon){let link=document.querySelector('link[rel="icon"]');if(!link){link=document.createElement('link');link.rel='icon';document.head.appendChild(link)}link.href=favicon;}
  }

  function updateSEO(page,globalSeo,branding){
    const p=page.seo||{}, d=globalSeo.defaults||{};
    const title=p.title || page.title || branding.company_name || 'Website';
    document.title=title;
    const desc=p.description || d.description || '';
    setMeta('description',desc);
    setMeta('keywords',p.keywords || d.keywords || '');
    setMeta('robots',`${p.robots_index===false?'noindex':'index'},${p.robots_follow===false?'nofollow':'follow'}`);
    setProperty('og:title',p.og_title||title);
    setProperty('og:description',p.og_description||desc);
    const og=mediaPath(p.og_image,p.og_image_external)||mediaPath(d.og_image,d.og_image_external);
    if(og) setProperty('og:image',og);
    let canonical=document.querySelector('link[rel="canonical"]'); if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.appendChild(canonical);}
    canonical.href=safeUrl(p.canonical_url)||`${d.canonical_base||location.origin}${location.pathname}#${page.slug}`;
  }
  function setMeta(name,content){let el=document.querySelector(`meta[name="${name}"]`);if(!el){el=document.createElement('meta');el.name=name;document.head.appendChild(el)}el.content=content||'';}
  function setProperty(prop,content){let el=document.querySelector(`meta[property="${prop}"]`);if(!el){el=document.createElement('meta');el.setAttribute('property',prop);document.head.appendChild(el)}el.content=content||'';}

  function renderHeader(ctx){
    const logo=mediaPath(ctx.branding.logo,ctx.branding.logo_external);
    const items=(ctx.navigation.items||[]).filter(x=>x.enabled!==false);
    const nav=items.map(x=>`<a href="${attr(safeUrl(x.url)||'#home')}"${x.new_tab?' target="_blank" rel="noopener"':''}>${esc(x.label||'')}</a>`).join('');
    const cta=ctx.navigation.header_cta||{};
    document.getElementById('siteHeader').innerHTML=`<div class="nav-inner"><a href="#home" class="logo">${logo?`<img src="${attr(logo)}" alt="">`:''}<span>${esc(ctx.branding.company_name||'')}</span></a><nav class="primary">${nav}</nav><div class="header-actions">${buttonMarkup(cta,'btn btn-primary btn-sm desktop-only')}<button class="burger" id="burgerBtn" aria-label="Open menu" aria-expanded="false"><span></span><span></span><span></span></button></div></div>`;
    document.getElementById('mobileMenu').innerHTML=nav+buttonMarkup(cta,'btn btn-primary');
  }

  function renderFooter(ctx){
    const logo=mediaPath(ctx.branding.alternate_logo,ctx.branding.alternate_logo_external)||mediaPath(ctx.branding.logo,ctx.branding.logo_external);
    const groups=(ctx.navigation.footer_groups||[]).map(g=>`<div class="foot-col"><h5>${esc(g.heading||'')}</h5>${(g.links||[]).map(x=>`<a href="${attr(safeUrl(x.url)||'#')}"${x.new_tab?' target="_blank" rel="noopener"':''}>${esc(x.label||'')}</a>`).join('')}</div>`).join('');
    const b=ctx.site.business,f=ctx.site.footer,s=ctx.site.social;
    const socials=Object.entries(s||{}).filter(([,u])=>safeUrl(u)).map(([k,u])=>`<a href="${attr(safeUrl(u))}" target="_blank" rel="noopener" aria-label="${attr(k)}">${esc(k.slice(0,2))}</a>`).join('');
    document.getElementById('siteFooter').innerHTML=`<div class="wrap"><div class="foot-grid"><div><div class="foot-logo">${logo?`<img src="${attr(logo)}" alt="">`:''}<span>${esc(ctx.branding.company_name||'')}</span></div><p>${esc(f.description||'')}</p><div class="foot-social">${socials}</div></div>${groups}<div class="foot-col"><h5>${esc(f.contact_heading||'Contact')}</h5><span>${esc(b.email||'')}</span><span>${esc(b.phone||'')}</span><span>${esc([b.address_line_1,b.address_line_2].filter(Boolean).join(' · '))}</span></div></div><div class="foot-bottom"><span>${esc(f.copyright||'')}</span><span>${esc(f.secondary_text||'')}</span></div></div>`;
  }

  function bindUI(){
    const burger=document.getElementById('burgerBtn'), menu=document.getElementById('mobileMenu'), scrim=document.getElementById('scrim');
    if(burger){
      burger.onclick=()=>{const open=menu.classList.toggle('open');scrim.classList.toggle('open',open);burger.setAttribute('aria-expanded',open?'true':'false')};
      scrim.onclick=()=>{menu.classList.remove('open');scrim.classList.remove('open');burger.setAttribute('aria-expanded','false')};
    }
    document.querySelectorAll('.faq-item').forEach(item=>{
      const q=item.querySelector('.faq-q'),a=item.querySelector('.faq-a');
      if(!q||!a)return;
      q.onclick=()=>{const was=item.classList.contains('open');document.querySelectorAll('.faq-item').forEach(i=>{i.classList.remove('open');const iq=i.querySelector('.faq-q'),ia=i.querySelector('.faq-a');if(iq)iq.setAttribute('aria-expanded','false');if(ia)ia.style.maxHeight=null});if(!was){item.classList.add('open');q.setAttribute('aria-expanded','true');a.style.maxHeight=a.scrollHeight+'px'}};
    });
    document.querySelectorAll('.filter-btn').forEach(btn=>{
      btn.onclick=()=>{document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));btn.classList.add('active');const f=btn.dataset.filter;document.querySelectorAll('.p-card').forEach(card=>card.classList.toggle('hide',f!=='all'&&card.dataset.cat!==f))};
    });
    const form=document.getElementById('contactForm');
    if(form) form.onsubmit=e=>{e.preventDefault();if(!form.checkValidity()){form.reportValidity();return}const msg=document.getElementById('formMsg');if(msg)msg.classList.add('show');form.reset()};
    document.querySelectorAll('a[href^="#"]').forEach(a=>{
      a.addEventListener('click',e=>{const hash=a.getAttribute('href');if(hash&&hash.length>1){e.preventDefault();history.pushState(null,'',hash);route();}});
    });
  }

  async function route(){
    const raw=(location.hash||'#home').slice(1);
    const slug=raw==='listings'?'portfolio':raw.replace(/[^a-zA-Z0-9_-]/g,'')||'home';
    const ctx=window.__CMS_CONTEXT__;
    try{
      const page=await getJSON(`/content/pages/${encodeURIComponent(slug)}.json`);
      if(page.published===false) throw new Error('Page is unpublished');
      updateSEO(page,ctx.seo,ctx.branding);
      const sections=Array.isArray(page.sections)?page.sections:[];
      const rendered=[];
      for(const section of sections) rendered.push(await renderSection(section,ctx));
      document.getElementById('app-main').innerHTML=rendered.join('') || '<div class="empty-page">This page currently has no sections. Add blocks in Decap CMS to rebuild it.</div>';
      window.scrollTo({top:0,behavior:'auto'});
      bindUI();
    }catch(err){
      document.getElementById('app-main').innerHTML=`<div class="cms-notice"><h2>Page not found</h2><p>${esc(err.message)}</p></div>`;
    }
  }

  async function init(){
    try{
      const [branding,site,navigation,seo]=await Promise.all([
        getJSON('/content/branding.json'),getJSON('/content/site.json'),getJSON('/content/navigation.json'),getJSON('/content/seo.json')
      ]);
      window.__CMS_CONTEXT__={branding,site,navigation,seo};
      applyBranding(branding);
      renderHeader(window.__CMS_CONTEXT__);
      renderFooter(window.__CMS_CONTEXT__);
      bindUI();
      await route();
      addEventListener('popstate',route);
      addEventListener('hashchange',route);
      const header=document.querySelector('header.site');
      addEventListener('scroll',()=>{if(header)header.style.boxShadow=scrollY>8?'0 4px 20px rgba(18,19,28,.06)':'none'});
    }catch(err){
      document.getElementById('app-main').innerHTML=`<div class="cms-notice"><h2>Website content could not load</h2><p>${esc(err.message)}</p></div>`;
    }
  }

  return {init};
})();

document.addEventListener('DOMContentLoaded',CMS.init);
