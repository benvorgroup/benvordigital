/* Benvor Digital — Advanced Visual Builder Preview */
(function(){
  if(!window.CMS || !window.React) return;
  const h=window.React.createElement;

  function toJS(v){return v&&typeof v.toJS==='function'?v.toJS():v}
  function n(raw){const s=raw||{},c=s.content||{};return {...s,...c,layout:s.layout||{},design:s.design||{},responsive:s.responsive||{},advanced:s.advanced||{}}}
  function cls(s){return `pv-section pv-${s.type||'generic'} pv-align-${s.layout?.text_align||'left'}`}
  function sectionStyle(s){
    const l=s.layout||{},d=s.design||{};
    const widths={narrow:'820px',default:'1180px',wide:'1380px',full:'100%'};
    const spaces={none:0,xs:18,small:36,default:70,large:100,xl:130,inherit:70};
    const bgs={default:'#fff',white:'#fff',light_grey:'#f5f7fa',navy:'#0A1F33',blue:'#2563EB'};
    return {
      '--pv-width':widths[l.container_width]||'1180px',
      '--pv-pt':`${spaces[l.padding_top]??70}px`,
      '--pv-pb':`${spaces[l.padding_bottom]??70}px`,
      background:bgs[d.background]||'#fff',
      color:['navy','blue'].includes(d.background)?'#fff':'#405266'
    };
  }
  function cards(items){
    return h('div',{className:'pv-grid'},...(items||[]).slice(0,6).map((x,i)=>
      h('article',{className:'pv-card',key:i},
        h('strong',null,x.title||x.label||x.question||x.name||`Item ${i+1}`),
        (x.text||x.answer||x.value)?h('p',null,x.text||x.answer||x.value):null
      )
    ));
  }
  function block(s){
    s=n(s);const children=[];
    if(s.eyebrow)children.push(h('span',{className:'pv-eyebrow',key:'e'},s.eyebrow));
    if(s.heading)children.push(h('h2',{key:'h'},s.heading));
    else if(s.title)children.push(h('h2',{key:'h'},s.title));
    if(s.text)children.push(h('p',{className:'pv-lead',key:'p'},s.text));

    if(s.type==='hero'||s.type==='hero_lead_form'){
      children.push(h('div',{className:'pv-hero-demo',key:'demo'},
        h('div',{className:'pv-dashboard'},h('strong',null,'Growth Overview'),h('div',{className:'pv-chart'})),
        s.form_heading?h('div',{className:'pv-form-card'},h('strong',null,s.form_heading),h('div',{className:'pv-field'}),h('div',{className:'pv-field'}),h('button',null,s.submit_label||'Submit')):null
      ));
    } else if(s.type==='comparison'){
      children.push(h('div',{className:'pv-comparison',key:'cmp'},...(s.rows||[]).map((x,i)=>h('div',{key:i},h('span',null,x.left),h('strong',null,x.right)))));
    } else if(s.type==='faq'){
      children.push(h('div',{className:'pv-faq',key:'faq'},...(s.items||[]).slice(0,5).map((x,i)=>h('div',{key:i},h('strong',null,x.question),h('span',null,'+')))));
    } else if(s.type==='cta'||s.type==='dual_cta'){
      children.push(h('button',{className:'pv-button',key:'btn'},s.button?.label||s.primary?.button_label||'Call to Action'));
    } else if(Array.isArray(s.items)){
      children.push(cards(s.items));
    } else if(Array.isArray(s.stats)){
      children.push(cards(s.stats));
    } else if(Array.isArray(s.brands)){
      children.push(h('div',{className:'pv-brands',key:'brands'},...s.brands.map((x,i)=>h('span',{key:i},x.name||x))));
    } else if(Array.isArray(s.services)){
      children.push(cards(s.services.map(x=>({title:String(x).replaceAll('-',' '),text:'Reusable service'}))));
    } else if(Array.isArray(s.projects)){
      children.push(cards(s.projects.map(x=>({title:String(x).replaceAll('-',' '),text:'Case study'}))));
    }

    return h('section',{className:cls(s),style:sectionStyle(s),'data-name':s.section_name||s.type},
      h('span',{className:'pv-badge'},s.section_name||String(s.type||'Section').replaceAll('_',' ')),
      h('div',{className:'pv-wrap'},...children)
    );
  }
  function Preview({entry}){
    const data=toJS(entry.getIn(['data']))||{};
    return h('div',{className:'pv-root'},
      h('header',{className:'pv-header'},h('strong',null,'BENVOR DIGITAL'),h('span',null,'Advanced CMS Preview')),
      ...(data.sections||[]).filter(x=>x.enabled!==false).map((s,i)=>h(window.React.Fragment,{key:i},block(s)))
    );
  }
  CMS.registerPreviewTemplate('pages',Preview);
  CMS.registerPreviewTemplate('landing_pages',Preview);
  CMS.registerPreviewStyle('/admin/preview.css');
})();