/* Benvor Digital — clean visual builder preview */
(function(){
  if(!window.CMS || !window.React) return;
  const h=window.React.createElement;
  const React=window.React;

  function toJS(v){return v&&typeof v.toJS==='function'?v.toJS():v}
  function normalize(raw){const s=raw||{},c=s.content||{};return {...s,...c,layout:s.layout||{},design:s.design||{},responsive:s.responsive||{},advanced:s.advanced||{}}}
  function sectionName(s,i){return s.section_name||s.heading||s.title||String(s.type||`Section ${i+1}`).replaceAll('_',' ')}
  function cls(s,selected){return `pv-section pv-${s.type||'generic'} pv-align-${s.layout?.text_align||'left'}${selected?' pv-selected':''}`}
  function sectionStyle(s){
    const l=s.layout||{},d=s.design||{};
    const widths={narrow:'820px',default:'1180px',wide:'1380px',full:'100%',inherit:'1180px'};
    const spaces={none:0,xs:18,small:36,default:70,large:100,xl:130,inherit:70};
    const bgs={default:'#fff',white:'#fff',light_grey:'#f5f7fa',navy:'#0A1F33',blue:'#2563EB'};
    return {'--pv-width':widths[l.container_width]||'1180px','--pv-pt':`${spaces[l.padding_top]??70}px`,'--pv-pb':`${spaces[l.padding_bottom]??70}px`,background:bgs[d.background]||'#fff',color:['navy','blue'].includes(d.background)?'#fff':'#405266'};
  }
  function cards(items){return h('div',{className:'pv-grid'},...(items||[]).slice(0,6).map((x,i)=>h('article',{className:'pv-card',key:i},h('strong',null,x.title||x.label||x.question||x.name||`Item ${i+1}`),(x.text||x.answer||x.value)?h('p',null,x.text||x.answer||x.value):null)))}
  function block(raw,index,selected,onSelect){
    const s=normalize(raw),children=[];
    if(s.eyebrow)children.push(h('span',{className:'pv-eyebrow',key:'e'},s.eyebrow));
    if(s.heading)children.push(h('h2',{key:'h'},s.heading));else if(s.title)children.push(h('h2',{key:'h'},s.title));
    if(s.text)children.push(h('p',{className:'pv-lead',key:'p'},s.text));
    if(s.type==='hero'||s.type==='hero_dashboard'||s.type==='hero_lead_form'){
      children.push(h('div',{className:'pv-hero-demo',key:'demo'},h('div',{className:'pv-dashboard'},h('strong',null,'Growth Overview'),h('div',{className:'pv-chart'})),s.form_heading?h('div',{className:'pv-form-card'},h('strong',null,s.form_heading),h('div',{className:'pv-field'}),h('div',{className:'pv-field'}),h('button',null,s.submit_label||'Submit')):null));
    } else if(s.type==='comparison') children.push(h('div',{className:'pv-comparison',key:'cmp'},...(s.rows||[]).map((x,i)=>h('div',{key:i},h('span',null,x.left),h('strong',null,x.right)))));
    else if(s.type==='faq') children.push(h('div',{className:'pv-faq',key:'faq'},...(s.items||[]).slice(0,5).map((x,i)=>h('div',{key:i},h('strong',null,x.question),h('span',null,'+')))));
    else if(s.type==='cta'||s.type==='dual_cta') children.push(h('button',{className:'pv-button',key:'btn'},s.button?.label||s.primary?.button_label||'Call to Action'));
    else if(Array.isArray(s.items))children.push(cards(s.items));
    else if(Array.isArray(s.stats))children.push(cards(s.stats));
    else if(Array.isArray(s.brands))children.push(h('div',{className:'pv-brands',key:'brands'},...s.brands.map((x,i)=>h('span',{key:i},x.name||x))));
    else if(Array.isArray(s.services))children.push(cards(s.services.map(x=>({title:String(x).replaceAll('-',' '),text:'Reusable service'}))));
    else if(Array.isArray(s.projects))children.push(cards(s.projects.map(x=>({title:String(x).replaceAll('-',' '),text:'Case study'}))));
    const name=sectionName(s,index);
    return h('section',{className:cls(s,selected),style:sectionStyle(s),'data-name':name,onClick:(e)=>{e.stopPropagation();onSelect(index,name)}},h('span',{className:'pv-badge'},name),h('span',{className:'pv-edit-hint'},'Click to edit'),h('div',{className:'pv-wrap'},...children));
  }
  function Preview({entry}){
    const data=toJS(entry.getIn(['data']))||{};
    const sections=(data.sections||[]).filter(x=>x.enabled!==false);
    const [selected,setSelected]=React.useState(-1);
    const signature=sections.map((s,i)=>sectionName(normalize(s),i)).join('|');
    React.useEffect(()=>{
      window.parent.postMessage({type:'benvor-builder-sections',sections:sections.map((s,i)=>({name:sectionName(normalize(s),i),type:s.type||''}))},'*');
    },[signature]);
    React.useEffect(()=>{
      const fn=e=>{if(e.data&&e.data.type==='benvor-preview-select')setSelected(Number(e.data.index))};
      window.addEventListener('message',fn);return()=>window.removeEventListener('message',fn);
    },[]);
    const choose=(index,name)=>{setSelected(index);window.parent.postMessage({type:'benvor-preview-section-click',index,name},'*')};
    return h('div',{className:'pv-root'},h('header',{className:'pv-header'},h('strong',null,'BENVOR DIGITAL'),h('span',null,'Live page preview')), ...sections.map((s,i)=>h(React.Fragment,{key:i},block(s,i,selected===i,choose))));
  }
  CMS.registerPreviewTemplate('pages',Preview);CMS.registerPreviewTemplate('landing_pages',Preview);CMS.registerPreviewStyle('/admin/preview.css');
})();
