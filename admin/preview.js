
CMS.registerPreviewStyle("/admin/preview.css");
(function(){
  if(!window.createClass || !window.h) return;
  const h=window.h, createClass=window.createClass;
  const section=(s,i)=>{
    const t=s.get('type'), soft=['services_grid','selected_work','team','process'].includes(t);
    const cls='p-section'+(soft?' soft':'');
    const heading=s.get('heading')||'';
    if(t==='hero_dashboard') return h('div',{className:cls,key:i},h('div',{style:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'30px',alignItems:'center'}},
      h('div',{},h('div',{style:{color:'#2563EB',fontSize:'11px',fontWeight:'700'}},s.get('eyebrow')||''),h('h1',{},s.get('heading')||'', ' ',h('span',{className:'blue'},s.get('highlight')||'')),h('p',{},s.get('text')||'')),
      h('div',{className:'p-dashboard'})
    ));
    if(t==='trust_stats') return h('div',{className:cls,key:i},h('b',{},s.get('label')||'Trusted brands'));
    if(t==='services_grid') return h('div',{className:cls,key:i},h('h2',{},heading||'Our Services'),h('div',{className:'p-grid'},...[1,2,3,4,5,6].map(x=>h('div',{className:'p-card'},h('b',{},'Service card'),h('p',{},'Editable service content')))));
    if(t==='why_benvor') return h('div',{className:cls,key:i},h('h2',{},heading),h('div',{className:'p-grid'},...[1,2,3].map(x=>h('div',{className:'p-card'},h('b',{},'Benefit'),h('p',{},'Editable text')))));
    if(t==='selected_work'||t==='portfolio_grid') return h('div',{className:cls,key:i},h('h2',{},heading||'Selected Work'),h('div',{className:'p-grid'},...[1,2,3].map(x=>h('div',{className:'p-card'},h('b',{},'Case study'),h('p',{},'Image + metrics')))));
    if(t==='testimonials') return h('div',{className:cls,key:i},h('h2',{},heading),h('div',{className:'p-grid'},...[1,2,3].map(x=>h('div',{className:'p-card'},h('b',{},'“ Testimonial”')))));
    if(t==='about_preview'||t==='image_text') return h('div',{className:cls,key:i},h('h2',{},heading),h('p',{},s.get('text')||'Editable image + copy section'));
    if(t==='page_hero') return h('div',{className:cls,key:i},h('h1',{},heading),h('p',{},s.get('text')||''));
    if(t==='cta') return h('div',{className:cls,key:i,style:{textAlign:'center'}},h('h2',{},heading),h('p',{},s.get('text')||''));
    if(t==='process'||t==='team'||t==='faq'||t==='contact_split'||t==='flex_cards'||t==='stats') return h('div',{className:cls,key:i},h('h2',{},heading||t.replace('_',' ')),h('p',{},'Editable '+t.replace('_',' ')+' section'));
    return h('div',{className:cls,key:i},h('h2',{},heading||t||'Section'));
  };
  const Preview=createClass({render:function(){
    const data=this.props.entry.get('data');
    const sections=data.get('sections')||[];
    return h('div',{className:'preview'},h('div',{className:'p-header'},h('div',{className:'p-logo'},'BENVOR ',h('span',{},'DIGITAL')),h('div',{className:'p-nav'},h('span',{},'Home'),h('span',{},'About'),h('span',{},'Services'),h('span',{},'Portfolio'),h('span',{},'Contact')),h('span',{className:'p-btn'},'Get a Free Consultation')),...sections.map(section));
  }});
  CMS.registerPreviewTemplate('pages',Preview);
})();
