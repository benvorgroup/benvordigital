
'use strict';
(() => {
  const cache = new Map();
  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => [...r.querySelectorAll(s)];
  const esc = (v='') => String(v).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#039;');
  const safeUrl = (v='') => {
    v=String(v||'').trim();
    if(/^\/[A-Za-z0-9_./?&=%#-]*$/.test(v)) return v;
    if(/^#[A-Za-z0-9_-]+$/.test(v)) return v;
    if(/^https?:\/\/[^\s]+$/i.test(v)) return v;
    if(/^mailto:[^@\s]+@[^@\s]+\.[^@\s]+$/i.test(v)) return v;
    if(/^tel:[+0-9().\-\s]+$/i.test(v)) return v;
    return '#';
  };
  async function getJSON(path){
    if(cache.has(path)) return cache.get(path);
    const p=fetch(path,{cache:'no-store'}).then(r=>{if(!r.ok) throw new Error(`${path} ${r.status}`); return r.json()});
    cache.set(path,p); return p;
  }

  const icons = {
    search:'<circle cx="11" cy="11" r="6"/><path d="M16 16l5 5"/>',
    cursor:'<path d="M5 3l5 16 3-6 6-3L5 3z"/><path d="M14 14l5 5"/>',
    chat:'<rect x="3" y="4" width="18" height="14" rx="4"/><path d="M8 20l3-2h6"/><circle cx="8" cy="11" r=".8" fill="currentColor"/><circle cx="12" cy="11" r=".8" fill="currentColor"/><circle cx="16" cy="11" r=".8" fill="currentColor"/>',
    mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M4 7l8 6 8-6"/>',
    window:'<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h8"/>',
    chart:'<path d="M5 19V12M10 19V7M15 19v-4M20 19V4"/>',
    target:'<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 12l7-7"/>',
    database:'<ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v7c0 1.7 3.1 3 7 3s7-1.3 7-3V5M5 12v7c0 1.7 3.1 3 7 3s7-1.3 7-3v-7"/>',
    users:'<circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2"/><path d="M3 20c0-4 2-6 6-6s6 2 6 6M15 15c3 0 5 1.5 6 4"/>',
    trend:'<path d="M4 16l5-5 4 3 7-8"/><path d="M15 6h5v5"/>',
    trophy:'<path d="M8 4h8v5c0 3-1.5 5-4 5s-4-2-4-5V4z"/><path d="M8 6H4v2c0 2 1 3 4 3M16 6h4v2c0 2-1 3-4 3M12 14v4M8 20h8"/>',
    shield:'<path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6l7-3z"/><path d="M9 12l2 2 4-4"/>',
    globe:'<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
    spark:'<path d="M12 2l1.6 5.4L19 9l-5.4 1.6L12 16l-1.6-5.4L5 9l5.4-1.6L12 2z"/><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15z"/>'
  };
  function icon(name){
    return `<span class="icon-line"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name]||icons.spark}</svg></span>`;
  }

  function initials(name=''){ return name.split(/\s+/).map(x=>x[0]).join('').slice(0,2).toUpperCase(); }

  function applyTheme(settings, mode){
    const t=settings.theme?.[mode]||settings.theme?.light||{};
    const root=document.documentElement;
    root.dataset.theme=mode;
    const vars={
      '--bg':t.background,'--surface':t.surface,'--card':t.card,'--heading':t.heading,'--body':t.body,
      '--muted':t.muted,'--border':t.border,'--primary':t.primary,'--navy':t.navy,
      '--radius':`${settings.theme?.radius||14}px`,'--container':`${settings.theme?.container_width||1240}px`
    };
    Object.entries(vars).forEach(([k,v])=>v&&root.style.setProperty(k,v));
  }
  function resolveMode(settings){
    const stored=localStorage.getItem('benvor-theme');
    if(stored==='light'||stored==='dark') return stored;
    const def=settings.theme?.default_mode||'system';
    if(def==='light'||def==='dark') return def;
    return matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';
  }

  function renderHeader(settings, mode, page){
    const logo=mode==='dark'?settings.brand.logo_dark:settings.brand.logo_light;
    const nav=(settings.navigation||[]).filter(x=>x.enabled!==false).map(x=>{
      const active=(page==='home'&&x.url==='/')||x.url===`/${page}/`;
      return `<a class="${active?'active':''}" href="${esc(safeUrl(x.url))}">${esc(x.label)}</a>`;
    }).join('');
    const toggle=settings.theme?.allow_visitor_toggle===false?'':`<button id="theme-toggle" class="theme-toggle" aria-label="Switch theme">${mode==='dark'
      ?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>'
      :'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20 15.5A8 8 0 118.5 4 6.5 6.5 0 0020 15.5z"/></svg>'
    }</button>`;
    const c=settings.header_cta||{};
    $('#site-header').className='site-header';
    $('#site-header').innerHTML=`<div class="nav-wrap">
      <a class="brand-logo" href="/"><img src="${esc(logo)}" alt="${esc(settings.brand.logo_alt)}"></a>
      <nav class="desktop-nav">${nav}</nav>
      <div class="nav-actions">${toggle}${c.enabled!==false?`<a class="btn btn-primary desktop-cta" href="${esc(safeUrl(c.url))}">${esc(c.label)}</a>`:''}
      <button id="menu-btn" class="menu-btn" aria-label="Open menu">☰</button></div>
      <nav id="mobile-menu" class="mobile-menu">${nav}${c.enabled!==false?`<a class="btn btn-primary" style="margin-top:14px" href="${esc(safeUrl(c.url))}">${esc(c.label)}</a>`:''}</nav>
    </div>`;
  }

  function renderFooter(settings, mode){
    const f=settings.footer||{}, logo=mode==='dark'?settings.brand.footer_logo_dark:settings.brand.footer_logo_light;
    const groups=(f.groups||[]).map(g=>`<div class="footer-col"><h5>${esc(g.heading)}</h5>${(g.links||[]).map(l=>`<a href="${esc(safeUrl(l.url))}">${esc(l.label)}</a>`).join('')}</div>`).join('');
    const social=(f.social||[]).map(s=>`<a class="social" href="${esc(safeUrl(s.url))}" target="_blank" rel="noopener">${esc(s.label.slice(0,2))}</a>`).join('');
    $('#site-footer').className='site-footer';
    $('#site-footer').innerHTML=`<div class="wrap"><div class="footer-grid">
      <div class="footer-brand"><img src="${esc(logo)}" alt="${esc(settings.brand.logo_alt)}"><p>${esc(f.description||'')}</p></div>
      ${groups}
      <div class="footer-col"><h5>Let's Connect</h5><div class="socials">${social}</div><div class="footer-email">${esc(f.email||'')}</div></div>
    </div><div class="footer-bottom">${esc(f.copyright||'')}</div></div>`;
  }

  function renderHero(s){
    const d=s.dashboard||{}, vals=d.chart_values||[20,35,30,45,52,46,60,72,70,82,87,95];
    const w=560,h=210,pad=12,max=Math.max(...vals),min=Math.min(...vals),range=max-min||1;
    const pts=vals.map((v,i)=>`${pad+i*((w-pad*2)/(vals.length-1))},${h-pad-((v-min)/range)*(h-pad*2)}`).join(' ');
    const bars=[35,66,44,76,54,88,47];
    const channels=d.channels||[];
    return `<section class="hero reveal"><div class="wrap hero-grid">
      <div class="hero-copy"><span class="eyebrow">${esc(s.eyebrow||'')}</span><h1>${esc(s.heading||'')} <span class="highlight">${esc(s.highlight||'')}</span></h1>
        <p class="lead">${esc(s.text||'')}</p><div class="hero-actions">${s.primary_button?`<a class="btn btn-primary" href="${esc(safeUrl(s.primary_button.url))}">${esc(s.primary_button.label)} →</a>`:''}${s.secondary_button?`<a class="btn btn-secondary" href="${esc(safeUrl(s.secondary_button.url))}">${esc(s.secondary_button.label)}</a>`:''}</div>
        <div class="hero-stats">${(s.stats||[]).map(x=>`<div class="hero-stat">${icon(x.icon)}<strong class="countup">${esc(x.value)}</strong><span>${esc(x.label)}</span></div>`).join('')}</div>
      </div>
      <div class="dashboard-stage"><div class="dot-grid"></div>
        <div class="dashboard-card">
          <div class="dash-head"><span>${esc(d.label||'Growth Overview')}</span><span>${esc(d.period||'')}</span></div>
          <small class="muted">${esc(d.metric_label||'Revenue')}</small><div class="dash-kpi"><strong>${esc(d.metric_value||'')}</strong><span class="change">${esc(d.metric_change||'')}</span></div>
          <div class="chart-wrap"><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><g stroke="var(--border)" stroke-width="1">${[45,90,135,180].map(y=>`<line x1="0" y1="${y}" x2="${w}" y2="${y}"/>`).join('')}</g><polyline class="chart-line" points="${pts}"/></svg></div>
        </div>
        <div class="mini-card conversion-card"><small>Conversions</small><strong>${esc(d.conversions||'')}</strong><span class="change">${esc(d.conversion_change||'')}</span><div class="mini-bars">${bars.map(v=>`<i style="height:${v}%"></i>`).join('')}</div></div>
        <div class="mini-card channel-card"><small>Top Channels</small><div class="donut-row"><div style="position:relative"><div class="donut"></div><span class="donut-label">${esc((channels[0]?.value||72)+'%')}</span></div><div class="channel-list">${channels.map(c=>`<span><b>${esc(c.label)}</b><em>${esc(c.value)}%</em></span>`).join('')}</div></div></div>
      </div>
    </div></section>`;
  }
  function renderTrust(s){
    return `<section class="trust-row reveal"><div class="wrap trust-grid"><div class="trust-label">${esc(s.label||'')}</div><div class="brand-strip">${(s.brands||[]).map(b=>b.image?`<img src="${esc(safeUrl(b.image))}" alt="${esc(b.name||'')}" style="max-height:28px">`:`<span class="brand-name">${esc(b.name||'')}</span>`).join('')}</div><div class="trust-metrics">${(s.metrics||[]).map(m=>`<div class="trust-metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('')}</div></div></section>`;
  }
  async function relation(folder, slugs){
    return (await Promise.all((slugs||[]).map(s=>getJSON(`/content/${folder}/${encodeURIComponent(s)}.json`).catch(()=>null)))).filter(Boolean).filter(x=>x.enabled!==false);
  }
  async function renderServices(s){
    const items=await relation('services',s.services);
    return `<section class="section reveal"><div class="wrap"><div class="section-head center">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h2>${esc(s.heading||'Our Services')}</h2><p class="lead">${esc(s.text||'')}</p></div><div class="services-grid">${items.map(x=>`<a class="service-card" href="${esc(safeUrl(x.link||'/services/'))}">${x.custom_icon?`<img class="icon-line" src="${esc(safeUrl(x.custom_icon))}" alt="">`:icon(x.icon)}<h3>${esc(x.title)}</h3><p>${esc(x.description)}</p></a>`).join('')}</div></div></section>`;
  }
  function renderWhy(s){
    return `<section class="section reveal"><div class="wrap"><div class="section-head center"><h2>${esc(s.heading||'Why Benvor Digital?')}</h2></div><div class="why-grid">${(s.items||[]).map(x=>`<div class="why-item">${icon(x.icon)}<div><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div></div>`).join('')}</div></div></section>`;
  }
  async function renderSelectedWork(s, full=false){
    const items=await relation('projects',s.projects);
    if(full){
      const cats=['All',...new Set(items.map(x=>x.category).filter(Boolean))];
      return `<section class="section reveal"><div class="wrap"><div class="section-head"><h2>${esc(s.heading||'Case Studies')}</h2><p class="lead">${esc(s.text||'')}</p></div><div class="filter-row">${cats.map((c,i)=>`<button class="filter ${i===0?'active':''}" data-filter="${esc(c)}">${esc(c)}</button>`).join('')}</div><div class="portfolio-grid">${items.map(projectCardFull).join('')}</div></div></section>`;
    }
    return `<section class="section soft reveal"><div class="wrap"><div class="work-head"><div><h2>${esc(s.heading||'Selected Work')}</h2><p class="muted">${esc(s.text||'')}</p></div>${s.button?`<a class="text-link" href="${esc(safeUrl(s.button.url))}">${esc(s.button.label)} →</a>`:''}</div><div class="work-grid">${items.map(projectCard).join('')}</div></div></section>`;
  }
  function projectCard(p){
    return `<a class="work-card project-card" data-category="${esc(p.category||'')}" href="/project/?slug=${encodeURIComponent(p.slug)}"><div class="work-image"><img src="${esc(safeUrl(p.image))}" alt="${esc(p.image_alt||p.title)}"><span class="work-tag">${esc(p.category||'')}</span></div><div class="work-body"><h3>${esc(p.title)}</h3><div class="work-meta">${esc(p.services||'')}</div><div class="metric-grid">${(p.metrics||[]).slice(0,2).map(m=>`<div class="project-metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('')}</div></div></a>`;
  }
  function projectCardFull(p){
    return `<a class="portfolio-card project-card" data-category="${esc(p.category||'')}" href="/project/?slug=${encodeURIComponent(p.slug)}"><div class="work-image"><img src="${esc(safeUrl(p.image))}" alt="${esc(p.image_alt||p.title)}"><span class="work-tag">${esc(p.category||'')}</span></div><div class="work-body"><h3>${esc(p.title)}</h3><div class="work-meta">${esc(p.services||'')}</div><p style="font-size:.76rem;color:var(--muted);margin-top:8px">${esc(p.description||'')}</p><div class="metric-grid">${(p.metrics||[]).slice(0,2).map(m=>`<div class="project-metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('')}</div></div></a>`;
  }
  async function renderTestimonials(s){
    const items=await relation('testimonials',s.testimonials);
    return `<section class="section reveal"><div class="wrap"><div class="carousel-head"><h2>${esc(s.heading||'What Our Clients Say')}</h2><div class="carousel-controls"><button class="round-btn testimonial-prev" aria-label="Previous">‹</button><button class="round-btn testimonial-next" aria-label="Next">›</button></div></div><div class="testimonial-window"><div class="testimonial-track">${items.map(t=>`<article class="testimonial-card"><div class="quote-mark">“</div><blockquote>${esc(t.quote)}</blockquote><div class="person">${t.image?`<img class="avatar" src="${esc(safeUrl(t.image))}" alt="${esc(t.name)}">`:`<span class="avatar">${esc(initials(t.name))}</span>`}<div><strong>${esc(t.name)}</strong><span>${esc(t.role)}, ${esc(t.company)}</span></div></div></article>`).join('')}</div></div><div class="dots"></div></div></section>`;
  }
  function renderAboutPreview(s){
    return `<section class="section reveal"><div class="wrap"><div class="about-panel"><div class="about-panel-image"><img src="${esc(safeUrl(s.image))}" alt="${esc(s.image_alt||'')}"></div><div class="about-panel-copy">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h2>${esc(s.heading)}</h2><p>${esc(s.text)}</p>${s.button?`<a class="btn btn-primary" style="margin-top:18px" href="${esc(safeUrl(s.button.url))}">${esc(s.button.label)} →</a>`:''}</div><div class="about-stats">${(s.stats||[]).map(x=>`<div class="about-stat">${icon(x.icon)}<strong>${esc(x.value)}</strong><span>${esc(x.label)}</span></div>`).join('')}</div></div></div></section>`;
  }
  function renderCTA(s){
    return `<section class="section reveal"><div class="wrap"><div class="cta-box"><h2>${esc(s.heading)}</h2><p>${esc(s.text||'')}</p>${s.button?`<a class="btn btn-primary" href="${esc(safeUrl(s.button.url))}">${esc(s.button.label)} →</a>`:''}</div></div></section>`;
  }
  function renderPageHero(s){
    return `<section class="page-hero reveal"><div class="wrap">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h1>${esc(s.heading||'')}</h1><p class="lead">${esc(s.text||'')}</p></div></section>`;
  }
  function renderImageText(s){
    const rev=s.image_position==='right'?' reverse':'';
    return `<section class="section reveal"><div class="wrap image-text${rev}"><div class="media"><img src="${esc(safeUrl(s.image))}" alt="${esc(s.image_alt||'')}"></div><div class="copy">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h2>${esc(s.heading||'')}</h2><p>${esc(s.text||'')}</p>${s.button?`<a class="btn btn-primary" style="margin-top:20px" href="${esc(safeUrl(s.button.url))}">${esc(s.button.label)}</a>`:''}</div></div></section>`;
  }
  function renderStats(s){
    return `<section class="section reveal"><div class="wrap"><div class="stats-grid">${(s.items||[]).map(x=>`<div class="stat-block"><strong>${esc(x.value)}</strong><span>${esc(x.label)}</span></div>`).join('')}</div></div></section>`;
  }
  function renderProcess(s){
    return `<section class="section soft reveal"><div class="wrap"><div class="section-head">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h2>${esc(s.heading)}</h2></div><div class="process-grid">${(s.items||[]).map(x=>`<div class="process-item"><span class="process-number">${esc(x.number)}</span><h3>${esc(x.title)}</h3><p>${esc(x.text)}</p></div>`).join('')}</div></div></section>`;
  }
  function renderFAQ(s){
    return `<section class="section reveal"><div class="wrap"><div class="section-head">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h2>${esc(s.heading)}</h2></div><div class="faq-list">${(s.items||[]).map(x=>`<div class="faq-item"><button class="faq-q">${esc(x.question)}<span>+</span></button><div class="faq-a"><p>${esc(x.answer)}</p></div></div>`).join('')}</div></div></section>`;
  }
  async function renderTeam(s){
    const items=await relation('team',s.team);
    return `<section class="section soft reveal"><div class="wrap"><div class="section-head">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}<h2>${esc(s.heading)}</h2><p class="lead">${esc(s.text||'')}</p></div><div class="team-grid">${items.map(t=>`<article class="team-card">${t.image?`<img class="avatar" src="${esc(safeUrl(t.image))}" alt="${esc(t.name)}">`:`<span class="avatar">${esc(initials(t.name))}</span>`}<h3>${esc(t.name)}</h3><small>${esc(t.role)}</small><p>${esc(t.bio)}</p></article>`).join('')}</div></div></section>`;
  }
  function fieldMarkup(f){
    const req=f.required?' required':'', full=f.type==='textarea'||f.type==='select'?' full':'';
    if(f.type==='textarea') return `<div class="field${full}"><label>${esc(f.label)}</label><textarea name="${esc(f.name)}" placeholder="${esc(f.placeholder||'')}"${req}></textarea></div>`;
    if(f.type==='select') return `<div class="field${full}"><label>${esc(f.label)}</label><select name="${esc(f.name)}"${req}><option value="">Select one</option>${(f.options||[]).map(o=>`<option>${esc(o)}</option>`).join('')}</select></div>`;
    const type=['email','tel','number','url'].includes(f.type)?f.type:'text';
    return `<div class="field${full}"><label>${esc(f.label)}</label><input type="${type}" name="${esc(f.name)}" placeholder="${esc(f.placeholder||'')}"${req}></div>`;
  }
  function renderContact(s, settings){
    const action=safeUrl(settings.contact_form?.action||''), method=settings.contact_form?.method||'POST';
    return `<section class="section reveal"><div class="wrap contact-layout"><div class="form-card"><h2>${esc(s.heading)}</h2><p class="muted" style="font-size:.8rem;margin:8px 0 22px">${esc(s.text||'')}</p><form class="contact-form" ${action&&action!=='#'?`action="${esc(action)}" method="${esc(method)}"`:''}><div class="fields">${(s.fields||[]).map(fieldMarkup).join('')}</div><button class="btn btn-primary" type="submit" style="margin-top:18px">${esc(s.submit_label||'Submit')} →</button><div class="form-message">${esc(settings.contact_form?.success_message||'Thanks.')}</div></form></div><aside class="contact-side">${(s.contact_cards||[]).map(c=>`<div class="contact-card"><small>${esc(c.label)}</small>${c.link?`<a href="${esc(safeUrl(c.link))}"><strong>${esc(c.value)}</strong></a>`:`<strong>${esc(c.value)}</strong>`}</div>`).join('')}</aside></div></section>`;
  }
  function renderRichText(s){
    const paragraphs=String(s.body||'').split(/\n{2,}/).map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
    return `<section class="section reveal"><div class="wrap rich-text">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}${s.heading?`<h2>${esc(s.heading)}</h2>`:''}${paragraphs}</div></section>`;
  }
  function renderGallery(s){
    return `<section class="section reveal"><div class="wrap"><div class="section-head">${s.heading?`<h2>${esc(s.heading)}</h2>`:''}</div><div class="gallery">${(s.images||[]).map(x=>`<img src="${esc(safeUrl(x.image||x.url))}" alt="${esc(x.alt||'')}">`).join('')}</div></div></section>`;
  }
  function renderFlex(s){
    const cols=Math.max(1,Math.min(4,Number(s.columns)||3));
    return `<section class="section reveal"><div class="wrap"><div class="section-head">${s.eyebrow?`<span class="eyebrow">${esc(s.eyebrow)}</span>`:''}${s.heading?`<h2>${esc(s.heading)}</h2>`:''}<p class="lead">${esc(s.text||'')}</p></div><div class="flex-cards" style="--cols:${cols}">${(s.items||[]).map(x=>`<article class="flex-card">${x.image?`<img src="${esc(safeUrl(x.image))}" alt="${esc(x.image_alt||'')}">`:''}${x.icon?icon(x.icon):''}<h3>${esc(x.title||'')}</h3><p class="muted" style="font-size:.76rem;margin-top:8px">${esc(x.text||'')}</p>${x.button_label?`<a class="text-link" style="display:inline-block;margin-top:12px" href="${esc(safeUrl(x.button_url||'#'))}">${esc(x.button_label)} →</a>`:''}</article>`).join('')}</div></div></section>`;
  }

  async function renderSection(s, settings){
    if(!s || s.enabled===false) return '';
    switch(s.type){
      case 'hero_dashboard': return renderHero(s);
      case 'trust_stats': return renderTrust(s);
      case 'services_grid': return renderServices(s);
      case 'why_benvor': return renderWhy(s);
      case 'selected_work': return renderSelectedWork(s,false);
      case 'portfolio_grid': return renderSelectedWork(s,true);
      case 'testimonials': return renderTestimonials(s);
      case 'about_preview': return renderAboutPreview(s);
      case 'cta': return renderCTA(s);
      case 'page_hero': return renderPageHero(s);
      case 'image_text': return renderImageText(s);
      case 'stats': return renderStats(s);
      case 'process': return renderProcess(s);
      case 'faq': return renderFAQ(s);
      case 'team': return renderTeam(s);
      case 'contact_split': return renderContact(s,settings);
      case 'rich_text': return renderRichText(s);
      case 'gallery': return renderGallery(s);
      case 'flex_cards': return renderFlex(s);
      case 'spacer': return `<div style="height:${Math.max(0,Math.min(240,Number(s.height)||40))}px"></div>`;
      case 'divider': return `<div class="wrap"><div class="divider"></div></div>`;
      default:return '';
    }
  }

  function bindInteractions(settings){
    const menu=$('#menu-btn'), panel=$('#mobile-menu'), overlay=$('#mobile-overlay');
    if(menu&&panel){menu.onclick=()=>{panel.classList.toggle('open');overlay.classList.toggle('open')}}
    if(overlay){overlay.onclick=()=>{panel?.classList.remove('open');overlay.classList.remove('open')}}
    const toggle=$('#theme-toggle');
    if(toggle) toggle.onclick=()=>{
      const next=document.documentElement.dataset.theme==='dark'?'light':'dark';
      localStorage.setItem('benvor-theme',next); applyTheme(settings,next);
      const page=document.body.dataset.page==='custom'?(new URLSearchParams(location.search).get('slug')||'home'):document.body.dataset.page;
      renderHeader(settings,next,page); renderFooter(settings,next); bindInteractions(settings);
    };
    $$('.faq-q').forEach(q=>q.onclick=()=>{const item=q.closest('.faq-item'),a=$('.faq-a',item);const open=item.classList.toggle('open');a.style.maxHeight=open?a.scrollHeight+'px':'0'});
    $$('.filter').forEach(b=>b.onclick=()=>{$$('.filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');$$('.project-card').forEach(c=>c.style.display=b.dataset.filter==='All'||c.dataset.category===b.dataset.filter?'':'none')});
    $$('.contact-form').forEach(form=>form.onsubmit=e=>{
      if(!form.getAttribute('action')){e.preventDefault();const msg=$('.form-message',form);msg.classList.add('show');form.reset();}
    });
    initCarousel();
    initReveal();
    countUp();
  }
  function initCarousel(){
    const track=$('.testimonial-track'), cards=$$('.testimonial-card'), prev=$('.testimonial-prev'), next=$('.testimonial-next'), dots=$('.dots');
    if(!track||!cards.length)return;
    let idx=0;
    const per=()=>innerWidth<=650?1:innerWidth<=900?2:3;
    const max=()=>Math.max(0,cards.length-per());
    const drawDots=()=>{dots.innerHTML='';for(let i=0;i<=max();i++){const d=document.createElement('button');d.className='dot'+(i===idx?' active':'');d.onclick=()=>{idx=i;move()};dots.appendChild(d)}};
    const move=()=>{idx=Math.max(0,Math.min(max(),idx));const gap=16;const w=cards[0].getBoundingClientRect().width+gap;track.style.transform=`translateX(${-idx*w}px)`;drawDots()};
    prev&&(prev.onclick=()=>{idx--;move()}); next&&(next.onclick=()=>{idx++;move()});
    let start=0;track.addEventListener('touchstart',e=>start=e.touches[0].clientX,{passive:true});track.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-start;if(Math.abs(dx)>40){idx+=dx<0?1:-1;move()}},{passive:true});
    addEventListener('resize',move); move();
  }
  function initReveal(){
    const els=$$('.reveal');
    if(!('IntersectionObserver'in window)){els.forEach(e=>e.classList.add('visible'));return}
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target)}}),{threshold:.08});
    els.forEach(e=>io.observe(e));
  }
  function countUp(){
    $$('.countup').forEach(el=>{
      const raw=el.textContent.trim();const m=raw.match(/^([^0-9]*)([0-9.]+)(.*)$/);if(!m)return;
      const n=parseFloat(m[2]);if(!Number.isFinite(n))return;let start=null;
      const tick=t=>{start??=t;const p=Math.min(1,(t-start)/750);const val=n<10?(n*p).toFixed(n%1?1:0):Math.round(n*p);el.textContent=m[1]+val+m[3];if(p<1)requestAnimationFrame(tick)};
      requestAnimationFrame(tick);
    });
  }
  function updateSEO(page,settings){
    document.title=page.seo?.title || page.title+(settings.seo_defaults?.title_suffix||'');
    let d=$('meta[name=description]');d.content=page.seo?.description||settings.seo_defaults?.description||'';
  }

  async function renderProject(settings, mode){
    const slug=new URLSearchParams(location.search).get('slug');
    const p=await getJSON(`/content/projects/${encodeURIComponent(slug||'')}.json`);
    renderHeader(settings,mode,'portfolio');renderFooter(settings,mode);
    $('#main').innerHTML=`<section class="project-hero reveal"><div class="wrap project-hero-grid"><div><span class="eyebrow">${esc(p.category)}</span><h1>${esc(p.title)}</h1><p class="lead">${esc(p.description)}</p><div class="project-metrics-large">${(p.metrics||[]).map(m=>`<div class="big-metric"><strong>${esc(m.value)}</strong><span>${esc(m.label)}</span></div>`).join('')}</div></div><img src="${esc(safeUrl(p.image))}" alt="${esc(p.image_alt||p.title)}"></div></section>
      <section class="section"><div class="wrap case-grid"><div class="case-block"><h3>Challenge</h3><p>${esc(p.challenge||'')}</p></div><div class="case-block"><h3>Solution</h3><p>${esc(p.solution||'')}</p></div><div class="case-block"><h3>Result</h3><p>${esc(p.result||'')}</p></div></div></section>
      ${renderCTA({heading:'Ready to build the next result?',text:'Let’s talk about the growth opportunity in front of your business.',button:{label:'Start a Project',url:'/contact/'}})}`;
    document.title=`${p.title} | Benvor Digital`; bindInteractions(settings);
  }

  async function init(){
    try{
      const settings=await getJSON('/content/settings.json');
      const mode=resolveMode(settings);applyTheme(settings,mode);
      const bodyPage=document.body.dataset.page||'home';
      if(bodyPage==='project'){await renderProject(settings,mode);return}
      let slug=bodyPage;
      if(slug==='custom') slug=new URLSearchParams(location.search).get('slug')||'home';
      const page=await getJSON(`/content/pages/${encodeURIComponent(slug)}.json`);
      if(page.published===false) throw new Error('Page is unpublished');
      if(page.show_header!==false) renderHeader(settings,mode,slug); else $('#site-header').style.display='none';
      if(page.show_footer!==false) renderFooter(settings,mode); else $('#site-footer').style.display='none';
      updateSEO(page,settings);
      const out=[];for(const s of(page.sections||[])) out.push(await renderSection(s,settings));
      $('#main').innerHTML=out.join('');
      bindInteractions(settings);
    }catch(e){
      console.error(e);
      $('#main').innerHTML='<section class="section"><div class="wrap"><h1>Website content could not load.</h1><p class="lead">Check that the /content files were uploaded with the site.</p></div></section>';
    }
  }
  document.addEventListener('DOMContentLoaded',init);
})();
