/** Document-domain model. No browser API dependencies except optional crypto for IDs. */
export const VERSION = 1;
export const VAT_MODES = Object.freeze({exclusive:'exclusive',inclusive:'inclusive',excluded:'excluded'});
export const TEMPLATES = [
  {id:'official',name:'공문',en:'Official Letter',category:'대외 문서',icon:'mail',desc:'수신처·문서번호·시행일·대표이사 날인'},
  {id:'quote',name:'견적서',en:'Quotation',category:'거래 문서',icon:'calculator',desc:'품목·단가·부가세 자동 계산'},
  {id:'purchase',name:'발주서',en:'Purchase Order',category:'거래 문서',icon:'package',desc:'발주 품목과 공급 조건 정리'},
  {id:'statement',name:'거래명세서',en:'Transaction Statement',category:'거래 문서',icon:'list',desc:'거래 내역 및 총액 확인'},
  {id:'approval',name:'품의서',en:'Internal Proposal',category:'내부 결재',icon:'file-check',desc:'기안 배경·내용·예상 비용'},
  {id:'expense',name:'지출결의서',en:'Expense Request',category:'내부 결재',icon:'wallet',desc:'지출 목적·금액·지급 정보'},
  {id:'meeting',name:'회의록',en:'Meeting Minutes',category:'업무 문서',icon:'users',desc:'회의 안건·논의 내용·결정 사항'},
  {id:'report',name:'업무보고서',en:'Business Report',category:'업무 문서',icon:'chart',desc:'진행 현황·성과·향후 계획'},
  {id:'cooperation',name:'업무협조전',en:'Cooperation Request',category:'업무 문서',icon:'handshake',desc:'부서·외부 협조 요청'},
  {id:'blank',name:'자유양식',en:'Blank Document',category:'기본 양식',icon:'file',desc:'제목·본문·항목을 자유롭게 편집'},
];

export const today=(date=new Date())=> `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
export const newId=()=>globalThis.crypto?.randomUUID?.() || `doc-${Date.now()}-${Math.random().toString(16).slice(2)}`;
export const safeString=(v,max=30000)=>typeof v==='string'?v.slice(0,max):'';
export const formatWon=n=>Number(n||0).toLocaleString('ko-KR');
export const formatDate=v=> /^\d{4}-\d{2}-\d{2}$/.test(v||'')?v.replaceAll('-','. '):v||'';

export function calculateLine({quantity,unitPrice,vatMode='exclusive'}) {
  const qty=Number(quantity), price=Number(unitPrice);
  if(!Number.isSafeInteger(qty)||qty<1||qty>1000000)throw new RangeError('수량은 1~1,000,000 범위의 정수여야 합니다.');
  if(!Number.isSafeInteger(price)||price<0||price>9000000000000)throw new RangeError('단가는 0 이상의 안전한 정수여야 합니다.');
  if(!Object.values(VAT_MODES).includes(vatMode))throw new TypeError('부가세 방식이 잘못되었습니다.');
  const base=BigInt(qty)*BigInt(price); if(base>9000000000000n)throw new RangeError('계산 금액이 허용 범위를 초과했습니다.');
  let supply=base,tax=0n,total=base;
  if(vatMode==='inclusive'){supply=base*100n/110n;tax=base-supply;}
  if(vatMode==='exclusive'){tax=base/10n;total=base+tax;}
  return {supply:Number(supply),tax:Number(tax),total:Number(total)};
}
export function calculateTotals(items,mode){
  return (items||[]).reduce((total,row)=>{ const n=calculateLine({quantity:row.quantity,unitPrice:row.unitPrice,vatMode:mode});for(const key of ['supply','tax','total'])total[key]+=n[key];return total;},{supply:0,tax:0,total:0});
}
export function defaultProfile(){return {
  company:'프레스티크 주식회사',brand:'OLIAVÉ',representative:'',businessNumber:'',address:'',phone:'',fax:'',email:'',website:'',bank:'',account:'',businessType:'',businessItem:'',logo:'deep_green',stamp:''
};}
const paragraph=(heading,body='')=>({id:newId(),heading,body});
const row=()=>({id:newId(),name:'',spec:'',quantity:1,unitPrice:0,note:'',image:''});
const standardSections={
 official:[['공문 내용','1. 귀 기관의 무궁한 발전을 기원합니다.\n\n2. 본 공문의 요청 및 안내 사항을 입력해 주세요.\n\n3. 관련 업무에 적극적인 협조를 부탁드립니다.']],
 approval:[['기안 배경','본 품의의 목적 및 추진 배경을 작성해 주세요.'],['주요 내용','사업 내용, 추진 방법 및 필요 자원을 작성해 주세요.'],['기대 효과','추진에 따른 기대 효과를 작성해 주세요.']],
 expense:[['지출 목적','지출 사유와 관련 사업명을 작성해 주세요.'],['세부 내역','증빙자료, 지급 대상 및 지급 조건을 작성해 주세요.']],
 meeting:[['회의 안건','논의할 안건을 작성해 주세요.'],['주요 논의','발언 및 검토 사항을 작성해 주세요.'],['결정 사항 및 후속 조치','담당자와 실행 일정을 작성해 주세요.']],
 report:[['업무 개요','보고 목적 및 대상 기간을 작성해 주세요.'],['진행 현황','실적과 주요 성과를 작성해 주세요.'],['이슈 및 대응','현안, 리스크 및 대응안을 작성해 주세요.'],['향후 계획','다음 단계와 일정을 작성해 주세요.']],
 cooperation:[['요청 배경','업무 협조가 필요한 배경을 작성해 주세요.'],['요청 사항','필요한 협조 사항을 구체적으로 작성해 주세요.'],['회신 요청일','회신 및 완료 희망일을 작성해 주세요.']],
 blank:[['본문','내용을 작성해 주세요.']],
 quote:[],purchase:[],statement:[]
};
const labels={official:'공문',quote:'견적서',purchase:'발주서',statement:'거래명세서',approval:'품의서',expense:'지출결의서',meeting:'회의록',report:'업무보고서',cooperation:'업무협조전',blank:'자유 문서'};
const prefix={official:'OFF',quote:'QUO',purchase:'PO',statement:'ST',approval:'APP',expense:'EXP',meeting:'MIN',report:'RPT',cooperation:'COO',blank:'DOC'};
export function nextDocumentNo(type,documents,day=today()){
  const yr=day.slice(0,4),code=prefix[type]||'DOC';
  const base=`PTQ-${code}-${yr}-`;
  const used=(documents||[]).flatMap(d=>{
    const m=(d.number||'').match(new RegExp('^'+base+'(\\d{4})$'));
    return m?[Number(m[1])]:[];
  });
  return `${base}${String(Math.max(0,...used)+1).padStart(4,'0')}`;
}
export function makeDocument(type,docs=[],day=today()){
  if(!TEMPLATES.some(t=>t.id===type))throw new TypeError('지원하지 않는 서식입니다.');
  const now=new Date().toISOString();
  return {id:newId(),type,number:nextDocumentNo(type,docs,day),title:labels[type],date:day,recipient:'',reference:'',subject:'',department:'',author:'',participants:'',period:'',paymentTo:'',amount:0,vatMode:'exclusive',items:[row()],sections:(standardSections[type]||[]).map(([heading,body])=>paragraph(heading,body)),attachments:'',notes:'',issueStatus:'draft',issuedAt:null,revisionOf:null,revision:1,logoOverride:'default',createdAt:now,updatedAt:now};
}
export const isTableDoc=type=>['quote','purchase','statement'].includes(type);
export function normalizeDocument(raw,existingIds=[]){
  if(!raw||typeof raw!=='object'||!TEMPLATES.some(t=>t.id===raw.type))throw new TypeError('알 수 없는 문서 형식입니다.');
  const init=makeDocument(raw.type,[],today());
  const stringKeys=['number','title','date','recipient','reference','subject','department','author','participants','period','paymentTo','attachments','notes'];
  for(const key of stringKeys)init[key]=safeString(raw[key],key==='notes'||key==='attachments'?30000:2000);
  if(!/^\d{4}-\d{2}-\d{2}$/.test(init.date))init.date=today();
  init.id=typeof raw.id==='string'&&raw.id.length<160&&!existingIds.includes(raw.id)?raw.id:newId();
  init.issueStatus=raw.issueStatus==='issued'&&typeof raw.issuedAt==='string'?'issued':'draft';
  init.issuedAt=init.issueStatus==='issued'?raw.issuedAt:null;
  init.revision=Number.isInteger(raw.revision)&&raw.revision>=1?raw.revision:1;
  init.revisionOf=safeString(raw.revisionOf,160)||null;
  init.logoOverride=['default','deep_green','gold','white','none'].includes(raw.logoOverride)?raw.logoOverride:'default';
  init.vatMode=Object.values(VAT_MODES).includes(raw.vatMode)?raw.vatMode:'exclusive';
  init.amount=Number.isSafeInteger(raw.amount)&&raw.amount>=0?raw.amount:0;
  init.createdAt=safeString(raw.createdAt,80)||init.createdAt;
  init.updatedAt=safeString(raw.updatedAt,80)||init.updatedAt;
  if(Array.isArray(raw.sections))init.sections=raw.sections.slice(0,50).map(s=>({id:newId(),heading:safeString(s?.heading,400),body:safeString(s?.body,30000)}));
  if(Array.isArray(raw.items))init.items=raw.items.slice(0,80).map(i=>({id:newId(),name:safeString(i?.name,500),spec:safeString(i?.spec,500),quantity:validInt(i?.quantity,1,1000000,1),unitPrice:validInt(i?.unitPrice,0,9000000000000,0),note:safeString(i?.note,1000),image:typeof i?.image==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(i.image)&&i.image.length<11500000?i.image:''}));
  if(init.items.length===0)init.items=[row()];
  return init;
}
function validInt(v,min,max,fallback){const n=Number(v);return Number.isSafeInteger(n)&&n>=min&&n<=max?n:fallback;}
export function normalizeProfile(raw){const profile=defaultProfile();if(!raw||typeof raw!=='object')return profile;for(const k of Object.keys(profile)){
 if(k==='logo')profile[k]=['deep_green','gold','white','none'].includes(raw[k])?raw[k]:'deep_green';
 else if(k==='stamp')profile.stamp=typeof raw.stamp==='string'&&/^data:image\/(png|jpeg|webp);base64,/.test(raw.stamp)&&raw.stamp.length<5000000?raw.stamp:'';
 else profile[k]=safeString(raw[k],1000);
}return profile;}
export function canIssue(doc,profile){
 const errors=[];
 if(!doc.title.trim())errors.push('문서 제목');
 if(!doc.number.trim())errors.push('문서번호');
 if(!doc.date)errors.push('시행/작성일');
 if(!profile.company.trim())errors.push('발신 회사명');
 if(doc.type==='official'&&!doc.recipient.trim())errors.push('수신처');
 if(['quote','purchase','statement'].includes(doc.type)&&!doc.recipient.trim())errors.push('거래처/수신자');
 if(isTableDoc(doc.type)){
  if(!doc.items.some(i=>i.name.trim()))errors.push('품목');
  for(const [idx,row] of doc.items.entries())if(row.name.trim()){
   try{calculateLine({quantity:row.quantity,unitPrice:row.unitPrice,vatMode:doc.vatMode});}catch{errors.push(`${idx+1}번 품목의 수량·단가`);}
  }
 }else if(!doc.sections.some(s=>s.body.trim()&&!/입력해 주세요|작성해 주세요/.test(s.body)))errors.push('실제 작성된 본문');
 return errors;
}
