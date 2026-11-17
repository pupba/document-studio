import {VERSION,TEMPLATES,today,newId,safeString,formatWon,formatDate,calculateLine,calculateTotals,defaultProfile,makeDocument,normalizeDocument,normalizeProfile,canIssue,isTableDoc,nextDocumentNo} from './model.js';
import {loadWorkspace,saveWorkspace} from './storage.js';

const $=s=>document.querySelector(s);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const iconPaths={
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 file:'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h8"/>',
 plus:'<path d="M12 5v14M5 12h14"/>',
 search:'<circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/>',
 settings:'<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.85l-1.8 1.8a1.7 1.7 0 0 0-1.85-.34l-1.1.46-.7 2.23h-2.6L11 18.77l-1.1-.46a1.7 1.7 0 0 0-1.85.34l-1.8-1.8A1.7 1.7 0 0 0 6.6 15l-.46-1.1L3.9 13.2v-2.5l2.24-.7.46-1.1a1.7 1.7 0 0 0-.34-1.85l1.8-1.8a1.7 1.7 0 0 0 1.85.34l1.1-.46.7-2.23h2.6l.7 2.23 1.1.46a1.7 1.7 0 0 0 1.85-.34l1.8 1.8a1.7 1.7 0 0 0-.34 1.85l.46 1.1 2.24.7v2.5l-2.24.7z"/>',
 printer:'<path d="M6 9V3h12v6M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6zM18 12h.01"/>',
 download:'<path d="M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4"/>',
 upload:'<path d="M12 16V4m-5 5 5-5 5 5M4 17v4h16v-4"/>',
 copy:'<rect x="8" y="8" width="13" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/>',
 trash:'<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 10v7M14 10v7"/>',
 lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
 unlock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8-0 4 4 0 0 1 4 4"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 chevron:'<path d="m9 18 6-6-6-6"/>',
 arrow:'<path d="m15 18-6-6 6-6"/>',
 close:'<path d="M18 6 6 18M6 6l12 12"/>',
 clock:'<circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
 calculator:'<rect x="5" y="2" width="14" height="20" rx="2"/><path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2"/>',
 package:'<path d="m12 3 9 5-9 5-9-5zM3 8v9l9 5 9-5V8M12 13v9M7 5l9 5"/>',
 list:'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
 'file-check':'<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6m-12 8 2 2 5-5"/>',
 wallet:'<rect x="3" y="5" width="18" height="15" rx="2"/><path d="M3 9h18M16 14h2"/>',
 users:'<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M16 3a4 4 0 0 1 0 8M22 21v-2a4 4 0 0 0-3-3.87"/><circle cx="9" cy="7" r="4"/>',
 chart:'<path d="M3 3v18h18M7 16l4-4 3 2 6-8"/>',
 handshake:'<path d="m2 10 5-5 5 2 3-2 7 7-6 7-4-2-3 2-7-7zM7 5l5 5 4-1M9 14l5 4M12 11l6 5"/>',
 dots:'<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 info:'<circle cx="12" cy="12" r="10"/><path d="M12 11v5M12 7h.01"/>',
 edit:'<path d="M12 20h9M16 4a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4z"/>',
 refresh:'<path d="M20 12a8 8 0 1 1-3-6M20 4v5h-5"/>',
};
const ico=(name,size=18)=>`<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${iconPaths[name]||iconPaths.file}</svg>`;
const categories=['전체 문서','대외 문서','거래 문서','내부 결재','업무 문서','기본 양식'];
const categoriesMap={'대외 문서':'mail','거래 문서':'calculator','내부 결재':'file-check','업무 문서':'users','기본 양식':'file'};
const templateOf=doc=>TEMPLATES.find(t=>t.id===doc.type)||TEMPLATES[0];
let workspace={schemaVersion:VERSION,profile:defaultProfile(),documents:[]};
let selectedId=null,filter='전체 문서',search='',modal=null,mobileTab='editor',mobileLibrary=false,saving=false,storeError='',toastTimer;
let saveTimer=null,saveQueue=Promise.resolve();
const activeDoc=()=>workspace.documents.find(d=>d.id===selectedId)||null;
const activeLogo=doc=>doc.logoOverride==='default'?workspace.profile.logo:doc.logoOverride;
const logoSrc=name=>`./assets/oliave_logo_${name}.png`;
const stampSafe=()=>workspace.profile.stamp;
const roundDate=iso=>{try{return new Date(iso).toLocaleDateString('ko-KR');}catch{return '';}};

function notify(message,type='success'){
 const element=$('#toast');if(!element)return;element.innerHTML=`${ico(type==='error'?'info':'check',17)}<span>${esc(message)}</span>`;element.className=`toast show ${type}`;
 clearTimeout(toastTimer);toastTimer=setTimeout(()=>element.classList.remove('show'),3500);
}
function persist(){
 clearTimeout(saveTimer);saving=true;const badge=$('#save-status');if(badge)badge.textContent='저장 중…';
 saveTimer=setTimeout(()=>{
  const snapshot=structuredClone(workspace);
  saveQueue=saveQueue.catch(()=>{}).then(()=>saveWorkspace(snapshot));
  saveQueue.then(()=>{saving=false;storeError='';const el=$('#save-status');if(el)el.textContent='이 기기에 저장됨';}).catch(e=>{
   saving=false;storeError=e.message;const el=$('#save-status');if(el)el.textContent='저장 실패';notify(`로컬 저장 실패: ${e.message}`,'error');
  });
 },350);
}
function downloadFile(name,data,mime){const blob=new Blob([data],{type:mime});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
function copyDocument(d){const copy=normalizeDocument(d,workspace.documents.map(x=>x.id));copy.id=newId();copy.number=nextDocumentNo(d.type,workspace.documents);copy.title=`${d.title} (사본)`;copy.issueStatus='draft';copy.issuedAt=null;copy.revision=1;copy.revisionOf=null;copy.createdAt=new Date().toISOString();copy.updatedAt=copy.createdAt;workspace.documents.unshift(copy);selectedId=copy.id;persist();render();notify('수정 가능한 사본을 만들었습니다.');}
function reviseDocument(d){const copy=normalizeDocument(d,workspace.documents.map(x=>x.id));copy.id=newId();copy.number=nextDocumentNo(d.type,workspace.documents);copy.title=d.title;copy.issueStatus='draft';copy.issuedAt=null;copy.revision=d.revision+1;copy.revisionOf=d.id;copy.createdAt=new Date().toISOString();copy.updatedAt=copy.createdAt;workspace.documents.unshift(copy);selectedId=copy.id;persist();render();notify(`개정 제${copy.revision}판을 만들었습니다.`);}
function addDocument(type){const doc=makeDocument(type,workspace.documents);workspace.documents.unshift(doc);selectedId=doc.id;modal=null;mobileTab='editor';persist();render();notify('새 초안이 생성되었습니다.');}
function filteredDocuments(){return workspace.documents.filter(doc=>{
  const matches=filter==='전체 문서'||templateOf(doc).category===filter;
  const q=search.trim().toLowerCase();return matches&&(!q||[doc.title,doc.number,doc.recipient,doc.subject,templateOf(doc).name].join(' ').toLowerCase().includes(q));
}).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)));}
function renderSidebar(){const doc=activeDoc();return `<aside class="sidebar">
 <div class="sidebar-brand"><div class="monogram">P<span>.</span></div><div><strong>PRESTIQUE</strong><small>DOCUMENT STUDIO</small></div></div>
 <div class="workspace-label">WORKSPACE <span class="work-dot"></span></div>
 <button class="sidebar-create" data-action="open-templates">${ico('plus',17)} 새 문서 만들기 <span>＋</span></button>
 <div class="nav-head">문서함 <span>LIBRARY</span></div>
 <nav class="side-nav">${categories.map((category,i)=>`<button class="side-link ${filter===category?'active':''}" data-action="filter" data-category="${esc(category)}">${ico(i===0?'grid':categoriesMap[category],17)}<span>${esc(category)}</span><b>${category==='전체 문서'?workspace.documents.length:workspace.documents.filter(d=>templateOf(d).category===category).length}</b></button>`).join('')}</nav>
 <div class="sidebar-spacer"></div>
 <div class="side-footer"><div class="sidebar-line"></div><button data-action="settings">${ico('settings')} 회사 기본정보</button><button data-action="backup">${ico('download')} 데이터 백업 / 복원</button></div>
 <div class="sidebar-sign"><span>LOCAL FIRST WORKSPACE</span><span class="security-dot"></span></div>
 </aside>`;}
function renderDocList(){return `<section class="doc-list-pane"><div class="doc-list-top"><div class="eyebrow">DOCUMENT LIBRARY</div><div class="list-title">${esc(filter)} <span>${filteredDocuments().length}</span></div><div class="search-wrap">${ico('search',16)}<input id="doc-search" type="search" placeholder="문서명, 수신처 검색" value="${esc(search)}" aria-label="문서 검색"/></div></div><div class="doc-items" id="doc-items">${renderDocItems()}</div><div class="doc-list-bottom">${ico('lock',13)} 서버 전송 없이 브라우저에 저장됩니다</div></section>`;}
function renderDocItems(){const docs=filteredDocuments();if(!docs.length)return `<div class="empty-docs">${ico('file',35)}<strong>문서가 없습니다</strong><p>새 문서를 만들거나<br/>검색 조건을 변경해 주세요.</p><button data-action="open-templates">+ 문서 만들기</button></div>`;
return docs.map(d=>`<button class="doc-row ${selectedId===d.id?'selected':''}" data-action="select" data-id="${esc(d.id)}"><span class="doc-row-icon">${ico(templateOf(d).icon,17)}</span><span class="doc-row-body"><span class="doc-row-title">${esc(d.title||templateOf(d).name)}</span><span class="doc-row-meta">${esc(d.number||'문서번호 없음')}</span><span class="doc-row-date">${esc(formatDate(d.date))}<span class="mini-status ${d.issueStatus==='issued'?'issued':''}">${d.issueStatus==='issued'?'발행':'초안'}</span></span></span></button>`).join('');}
const input=(label,key,value,type='text',extra='')=>`<label class="field"><span class="field-label">${esc(label)}</span><input data-field="${esc(key)}" type="${type}" value="${esc(value)}" ${extra}/></label>`;
const area=(label,key,value,rows=3)=>`<label class="field"><span class="field-label">${esc(label)}</span><textarea data-field="${esc(key)}" rows="${rows}">${esc(value)}</textarea></label>`;
const select=(label,key,value,options)=>`<label class="field"><span class="field-label">${esc(label)}</span><select data-field="${esc(key)}">${options.map(([v,text])=>`<option value="${esc(v)}" ${value===v?'selected':''}>${esc(text)}</option>`).join('')}</select></label>`;
function renderEditor(){const d=activeDoc();if(!d)return `<section class="editor-pane editor-empty"><div class="big-empty">${ico('file',45)}<h2>문서를 선택해 주세요</h2><p>서식 라이브러리에서 새 문서를 만들거나<br>기존 문서를 선택하세요.</p><button class="btn primary" data-action="open-templates">${ico('plus',17)} 새 문서 만들기</button></div></section>`;
 const locked=d.issueStatus==='issued';return `<section class="editor-pane ${locked?'is-locked':''}">
  <div class="editor-top"><div class="eyebrow">EDITOR / ${esc(templateOf(d).en.toUpperCase())}</div><h2>문서 편집 <span class="status-badge ${locked?'issued':''}">${ico(locked?'lock':'edit',13)} ${locked?'발행 완료':'초안'}</span></h2><p>${locked?'발행한 원본입니다. 개정본을 생성해야 내용을 수정할 수 있습니다.':'입력하는 내용이 오른쪽 문서에 실시간 반영됩니다.'}</p></div>
  <fieldset class="editor-fields" ${locked?'disabled':''}><div class="editor-card"><div class="editor-section-title"><span>01</span> 기본 정보</div>
   ${input('문서 제목','title',d.title)}<div class="input-grid">${input('문서번호','number',d.number)}${input('작성 / 시행일','date',d.date,'date')}</div>
   ${input('수신처 / 거래처','recipient',d.recipient,'text','placeholder="수신 기관 또는 회사명"')}
   ${input('제목 / 건명','subject',d.subject,'text','placeholder="예: 공동연구 관련 업무 협조 요청"')}
   ${d.type==='official'||d.type==='cooperation'?input('참조','reference',d.reference,'text','placeholder="참조 담당자 또는 부서"'):''}
   <div class="input-grid">${input('작성부서','department',d.department)}${input('작성자','author',d.author)}</div>
   ${d.type==='meeting'?input('참석자','participants',d.participants):''}
   ${d.type==='meeting'||d.type==='report'?input('기간 / 일시 / 장소','period',d.period):''}
   ${d.type==='expense'?`<div class="input-grid">${input('지급 대상','paymentTo',d.paymentTo)}${input('지출액 (원)','amount',d.amount,'number','min="0" step="1"')}</div>`:''}
  </div>
  ${isTableDoc(d.type)?renderItemsEditor(d):renderSectionsEditor(d)}
  <div class="editor-card"><div class="editor-section-title"><span>03</span> 추가 정보</div>
   ${area('첨부 서류 목록 (한 줄에 하나씩)','attachments',d.attachments,2)}
   ${area('비고 / 특이사항','notes',d.notes,2)}
   ${select('문서에 표시할 로고','logoOverride',d.logoOverride,[['default','회사 기본 설정 따름'],['deep_green','올리아베 · 딥그린'],['gold','올리아베 · 골드'],['white','올리아베 · 화이트'],['none','표시하지 않음']])}
  </div></fieldset>
  <div class="editor-bottom"><button class="btn outline danger" data-action="delete">${ico('trash',16)} 삭제</button><span class="muted">${locked?`발행일 ${esc(roundDate(d.issuedAt))}`:'수정 내용 자동 저장'}</span></div>
 </section>`;}
function renderSectionsEditor(d){return `<div class="editor-card"><div class="editor-section-title"><span>02</span> 문서 본문 <small>서식 항목을 추가·삭제할 수 있습니다</small></div>
 ${d.sections.map((s,i)=>`<div class="section-editor"><div class="section-heading"><strong>항목 ${String(i+1).padStart(2,'0')}</strong><button class="mini-btn" title="항목 삭제" data-action="remove-section" data-index="${i}">${ico('trash',14)}</button></div><label class="field"><span class="field-label">항목 제목</span><input data-section="${i}" data-part="heading" value="${esc(s.heading)}" placeholder="항목 제목을 입력하세요" /></label><label class="field"><span class="field-label">내용</span><textarea rows="${Math.min(7,Math.max(3,(s.body.match(/\n/g)||[]).length+2))}" data-section="${i}" data-part="body" placeholder="문서 내용을 입력하세요">${esc(s.body)}</textarea></label></div>`).join('')}
 <button class="add-row" data-action="add-section">${ico('plus',16)} 내용 항목 추가</button>
 </div>`;}
function renderItemsEditor(d){return `<div class="editor-card"><div class="editor-section-title"><span>02</span> 거래 품목 <small>부가세 자동 계산</small></div>
 ${select('금액 입력 기준','vatMode',d.vatMode,[['exclusive','부가세 별도 (10%)'],['inclusive','부가세 포함 (10%)'],['excluded','부가세 미반영']])}
 ${d.items.map((item,i)=>`<div class="item-editor"><div class="section-heading"><strong>품목 ${String(i+1).padStart(2,'0')}</strong><button class="mini-btn" data-action="remove-item" data-index="${i}" title="품목 삭제">${ico('trash',14)}</button></div><div class="input-grid">${itemInput('품목명',i,'name',item.name)}${itemInput('규격',i,'spec',item.spec)}</div><div class="input-grid">${itemInput('수량',i,'quantity',item.quantity,'number')}${itemInput('단가 (원)',i,'unitPrice',item.unitPrice,'number')}</div>${itemInput('비고',i,'note',item.note)}<div class="product-image-picker">${item.image?`<img src="${item.image}" alt="품목 이미지"/>`:`<span class="product-image-empty">${ico('package',17)}</span>`}<label class="btn subtle">${ico('upload',14)} ${item.image?'이미지 변경':'품목 이미지 추가'}<input type="file" data-image-item="${i}" accept="image/png,image/jpeg,image/webp" hidden /></label>${item.image?`<button class="btn subtle" data-action="remove-image" data-index="${i}">삭제</button>`:''}</div></div>`).join('')}
 <button class="add-row" data-action="add-item">${ico('plus',16)} 품목 추가</button>
 <div class="editor-totals">${renderEditorTotals(d)}</div>
 </div>`;}
function itemInput(label,index,key,value,type='text'){return `<label class="field"><span class="field-label">${label}</span><input data-item="${index}" data-part="${key}" type="${type}" ${type==='number'?'min="0" step="1"':''} value="${esc(value)}"/></label>`;}
function renderEditorTotals(d){try{const sum=calculateTotals(d.items.filter(i=>i.name.trim()),d.vatMode);return `<div><span>공급가액</span><b>${formatWon(sum.supply)} 원</b></div><div><span>부가세</span><b>${formatWon(sum.tax)} 원</b></div><div class="total-final"><span>합계 금액</span><strong>${formatWon(sum.total)} 원</strong></div>`;}catch(e){return `<span class="error-message">${esc(e.message)}</span>`;}}
function previewLine(label,value){return `<div class="paper-meta-line"><dt>${esc(label)}</dt><dd>${esc(value||'—')}</dd></div>`;}
function renderTable(doc){let total;try{total=calculateTotals(doc.items.filter(i=>i.name.trim()),doc.vatMode);}catch(e){return `<p class="paper-error">${esc(e.message)}</p>`;}
return `<div class="paper-table-heading">거래 품목 내역 <span>단위 : 원 (KRW)</span></div><table class="paper-table"><thead><tr><th>No.</th>${doc.items.some(i=>i.image)?'<th>사진</th>':''}<th>품목 / 상품명</th><th>규격</th><th>수량</th><th>단가</th><th>합계</th></tr></thead><tbody>${doc.items.filter(i=>i.name.trim()||i.spec.trim()).map((row,i)=>{
 let value=0;try{value=calculateLine({quantity:row.quantity,unitPrice:row.unitPrice,vatMode:doc.vatMode}).total;}catch{}
 return `<tr><td class="center">${i+1}</td>${doc.items.some(i=>i.image)?`<td class="center">${row.image?`<img class="paper-product-image" src="${row.image}" alt="품목 이미지"/>`:''}</td>`:''}<td>${esc(row.name||'—')}${row.note?`<small>${esc(row.note)}</small>`:''}</td><td class="center">${esc(row.spec)}</td><td class="right">${esc(row.quantity)}</td><td class="right">${formatWon(row.unitPrice)}</td><td class="right">${formatWon(value)}</td></tr>`;}).join('')||'<tr><td colspan="${doc.items.some(i=>i.image)?7:6}" class="center muted">품목을 입력해 주세요.</td></tr>'}</tbody></table>
 <div class="paper-total-wrap"><div class="paper-total-lines"><div><span>공급가액</span><b>₩ ${formatWon(total.supply)}</b></div><div><span>부가가치세 ${doc.vatMode==='excluded'?'(미반영)':'(10%)'}</span><b>₩ ${formatWon(total.tax)}</b></div><div class="grand"><span>합계 금액</span><strong>₩ ${formatWon(total.total)}</strong></div></div></div>
 <p class="vat-note">※ ${doc.vatMode==='excluded'?'부가세를 합산하지 않은 견적 표시입니다. 면세·영세율 판정이 아닙니다.':doc.vatMode==='inclusive'?'입력 단가는 부가세 포함 금액이며, 공급가액은 원 미만 절사하여 계산했습니다.':'입력 단가는 공급가액 기준이며, 부가세는 품목별 원 미만 절사합니다.'}</p>`;}
function renderPaper(doc){if(!doc)return `<div class="paper empty-paper"><div>${ico('file',48)}<p>생성할 문서를 선택해 주세요</p></div></div>`;
 const prof=workspace.profile, logo=activeLogo(doc),isWhite=logo==='white';const table=isTableDoc(doc.type);
 const sections=doc.sections.map((s,i)=>`<section class="paper-section"><h3>${esc(s.heading||'항목 '+(i+1))}</h3><p>${esc(s.body||'')}</p></section>`).join('');
 const extra=doc.attachments.trim()?`<div class="paper-attachments"><strong>붙임</strong><span>${esc(doc.attachments)}</span></div>`:'';
 const note=doc.notes.trim()?`<div class="paper-notes"><strong>비고</strong> ${esc(doc.notes)}</div>`:'';
 const companyInfo=[prof.address,prof.phone?`T. ${prof.phone}`:'',prof.fax?`F. ${prof.fax}`:'',prof.email,prof.website].filter(Boolean);
 return `<article class="paper ${isWhite?'paper-darkhead':''}" id="document-paper" aria-label="A4 문서 미리보기">
  <div class="paper-body"><div class="paper-header"><div class="paper-brand">${logo==='none'?`<div class="brand-placeholder">PRESTIQUE<br/>INC.</div>`:`<img class="paper-logo" src="${logoSrc(logo)}" alt="OLIAVÉ 공식 로고"/>`}</div><div class="paper-heading-right"><div class="paper-org">PRESTIQUE INC.</div><span>OFFICIAL CORPORATE DOCUMENT</span><span class="paper-head-rule"></span></div></div>
  <div class="paper-kicker">${esc(templateOf(doc).en.toUpperCase())} <span> / ${esc(prof.company)}</span></div>
  <h1 class="paper-title">${esc(doc.title||templateOf(doc).name)}</h1>
  <div class="paper-metadata">${previewLine('문서번호',doc.number)}${previewLine('작성일자',formatDate(doc.date))}${previewLine('수　　신',doc.recipient||'수신처 미입력')}${doc.reference?previewLine('참　　조',doc.reference):''}${doc.department?previewLine('담당부서',doc.department):''}${doc.author?previewLine('작 성 자',doc.author):''}${doc.period?previewLine('일시/기간',doc.period):''}${doc.participants?previewLine('참 석 자',doc.participants):''}${doc.paymentTo?previewLine('지급대상',doc.paymentTo):''}${doc.type==='expense'?previewLine('지 출 액',`${formatWon(doc.amount)} 원`):''}${previewLine('제　　목',doc.subject||doc.title)}</div>
  <div class="paper-content">${table?renderTable(doc):sections||'<p class="paper-placeholder">문서 본문을 작성해 주세요.</p>'}${extra}${note}</div>
  <div class="paper-signature"><div class="paper-ending">${doc.type==='official'||doc.type==='cooperation'?'끝.':''}</div><div class="paper-signer">${esc(prof.company)}<br/><span>대표이사　${esc(prof.representative||'성명 미입력')}</span> <span class="seal-placeholder">(인)</span>${stampSafe()?`<img class="paper-stamp" src="${stampSafe()}" alt="등록된 날인 이미지"/>`:''}</div></div>
  <footer class="paper-footer"><div class="paper-footer-top"><strong>${esc(prof.company)}</strong><span>${esc(prof.brand)} | CORPORATE DOCUMENTS</span></div><div class="paper-company-info">${companyInfo.map(v=>esc(v)).join('　 ·　 ')||'회사 연락처와 주소는 [회사 기본정보]에서 등록하세요.'}</div>${prof.businessNumber?`<div>사업자등록번호　${esc(prof.businessNumber)}</div>`:''}${table&&prof.bank?`<div>입금계좌　${esc(prof.bank)} ${esc(prof.account)}</div>`:''}</footer>
  </div>${doc.issueStatus==='draft'?'<div class="paper-watermark">DRAFT</div>':''}
 </article>`;
}
function renderPreview(){const d=activeDoc();const area=$('#preview-surface');if(area)area.innerHTML=renderPaper(d);const sum=$('#editor-sum');if(sum&&d&&isTableDoc(d.type))sum.innerHTML=renderEditorTotals(d);
 const name=$('#doc-current-title');if(name)name.textContent=d?.title||'새 문서';const status=$('#preview-status');if(status)status.textContent=d?.issueStatus==='issued'?'발행 완료':'미발행 초안';
 const list=$('#doc-items');if(list)list.innerHTML=renderDocItems();
}
function renderWorkspace(){const d=activeDoc();return `<main class="workspace"><header class="app-toolbar"><div class="breadcrumbs"><button class="mobile-menu" data-action="toggle-menu" aria-label="메뉴 열기">${ico('menu',22)}</button><button class="mobile-menu mobile-library-button" data-action="toggle-doc-list" aria-label="문서함 열기">${ico('file',20)}</button><span>PRESTIQUE</span>${ico('chevron',13)}<span>Document Studio</span>${ico('chevron',13)}<b id="doc-current-title">${esc(d?.title||'새 문서')}</b></div><div class="toolbar-tools"><span class="save-status"><span class="save-dot"></span><span id="save-status">이 기기에 저장됨</span></span><button class="icon-button" data-action="backup" title="데이터 백업">${ico('download',18)}</button><button class="toolbar-avatar" data-action="settings" title="회사 설정">P</button></div></header>
 <div class="content-layout">${renderDocList()}${renderEditor()}
 <section class="preview-pane"><div class="preview-toolbar"><div><span class="eyebrow">LIVE PREVIEW</span><div class="preview-title">문서 미리보기 <span class="preview-sub" id="preview-status">${d?.issueStatus==='issued'?'발행 완료':'미발행 초안'}</span></div></div><div class="preview-actions">${d?`<button class="btn subtle" data-action="duplicate" title="문서 복사">${ico('copy',16)} 사본</button>${d.issueStatus==='issued'?`<button class="btn subtle" data-action="revision">${ico('refresh',16)} 개정본</button>`:`<button class="btn subtle" data-action="issue">${ico('check',16)} 발행 확정</button>`}<button class="btn primary" data-action="print">${ico('printer',17)} PDF 저장</button>`:''}</div></div><div class="preview-scroll"><div id="preview-surface">${renderPaper(d)}</div><div class="preview-hint">${ico('info',14)} 실제 인쇄는 A4 · 여백 없음 기준이며, 브라우저에서 PDF로 저장할 수 있습니다.</div></div></section>
 </div><div class="mobile-tabs"><button class="${mobileTab==='editor'?'active':''}" data-action="mobile-tab" data-tab="editor">${ico('edit',17)} 편집</button><button class="${mobileTab==='preview'?'active':''}" data-action="mobile-tab" data-tab="preview">${ico('file',17)} 미리보기</button></div></main>`;}
function templatesModal(){return `<div class="modal-bg" data-action="close-modal"><div class="modal wide" role="dialog" aria-modal="true" aria-label="문서 서식 선택"><div class="modal-top"><div><span class="eyebrow">START FROM A TEMPLATE</span><h2>어떤 문서를 만들까요?</h2><p>프레스티크에서 자주 사용하는 서식을 준비했습니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">${ico('close',22)}</button></div><div class="template-grid">${TEMPLATES.map(t=>`<button class="template-card" data-action="create" data-type="${t.id}"><div class="template-icon">${ico(t.icon,23)}</div><span class="template-category">${esc(t.category)}</span><strong>${esc(t.name)}</strong><small>${esc(t.desc)}</small><span class="template-arrow">${ico('chevron',17)}</span></button>`).join('')}</div></div></div>`;}
function settingsModal(){const p=workspace.profile;const sett=(name,key,type='text')=>`<label class="field"><span class="field-label">${esc(name)}</span><input data-profile="${esc(key)}" type="${type}" value="${esc(p[key])}" /></label>`;
 return `<div class="modal-bg" data-action="close-modal"><div class="modal settings-modal" role="dialog" aria-modal="true" aria-label="회사 기본정보"><div class="modal-top"><div><span class="eyebrow">COMPANY IDENTITY</span><h2>회사 기본정보</h2><p>입력한 정보는 모든 서식에 공통으로 적용됩니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">${ico('close',22)}</button></div><div class="modal-scroll"><div class="setting-group"><h3>기업 정보</h3><div class="input-grid">${sett('법인명','company')}${sett('브랜드명','brand')}</div><div class="input-grid">${sett('대표이사','representative')}${sett('사업자등록번호','businessNumber')}</div>${sett('사업장 주소','address')}<div class="input-grid">${sett('업태','businessType')}${sett('종목','businessItem')}</div><div class="input-grid">${sett('전화','phone')}${sett('팩스','fax')}</div><div class="input-grid">${sett('이메일','email','email')}${sett('웹사이트','website')}</div><div class="input-grid">${sett('입금은행','bank')}${sett('입금계좌','account')}</div></div>
 <div class="setting-group"><h3>공식 로고 선택 <span>원본 PNG 3종</span></h3><div class="logo-choices">${[['deep_green','딥그린'],['gold','골드'],['white','화이트'],['none','로고 없음']].map(([id,name])=>`<button class="logo-choice ${p.logo===id?'active':''} ${id==='white'?'dark':''}" data-action="choose-logo" data-logo="${id}">${id==='none'?'<span class="logo-none">P.</span>':`<img src="${logoSrc(id)}" alt="${name} 공식 로고"/>`}<span>${name}</span>${p.logo===id?`<i>${ico('check',14)}</i>`:''}</button>`).join('')}</div><p class="setting-help">공식 BI 원본의 형태, 색상 및 비율을 변경하지 않습니다. 화이트 로고는 어두운 헤더에 적용됩니다.</p></div>
 <div class="setting-group"><h3>직인 / 사용인감 이미지</h3><div class="stamp-setting">${p.stamp?`<img src="${p.stamp}" alt="등록된 직인 이미지"/>`:`<div class="stamp-none">${ico('file',22)}<span>이미지 미등록</span></div>`}<div><p>투명 배경 PNG 권장 · JPG, WebP 가능 · 최대 2MB</p><label class="btn subtle upload-btn">${ico('upload',16)} 이미지 등록<input id="stamp-file" type="file" accept="image/png,image/jpeg,image/webp" hidden/></label>${p.stamp?`<button class="btn subtle" data-action="remove-stamp">삭제</button>`:''}</div></div><div class="safety-note">날인은 등록된 이미지가 있는 경우에만 출력합니다. 전자서명이나 법적 발급 인증 기능은 포함되지 않습니다.</div></div>
 </div><div class="modal-footer"><span>${ico('check',15)} 변경 내용은 이 기기에 자동 저장됩니다.</span><button class="btn primary" data-action="close-modal">설정 완료</button></div></div></div>`;}
function backupModal(){return `<div class="modal-bg" data-action="close-modal"><div class="modal backup-modal" role="dialog" aria-modal="true" aria-label="백업 및 복원"><div class="modal-top"><div><span class="eyebrow">LOCAL DATA MANAGEMENT</span><h2>데이터 백업 및 복원</h2><p>작성된 문서는 현재 브라우저에만 저장됩니다.</p></div><button class="icon-button" data-action="close-modal" aria-label="닫기">${ico('close',22)}</button></div><div class="backup-options"><button class="backup-card" data-action="export"><span class="backup-icon">${ico('download',24)}</span><strong>전체 백업 다운로드</strong><small>회사 설정 및 모든 문서를 JSON 파일로 내려받기</small>${ico('chevron',18)}</button><label class="backup-card"><span class="backup-icon">${ico('upload',24)}</span><strong>백업 파일 복원</strong><small>기존 문서를 대체하여 다른 브라우저에서 복원</small>${ico('chevron',18)}<input type="file" id="import-json" accept=".json,application/json" hidden /></label></div><div class="backup-alert">${ico('info',19)} <span>브라우저 사이트 데이터를 삭제하거나 기기를 변경하면 저장한 문서가 사라질 수 있습니다. 정기적으로 JSON 백업을 다운로드해 안전한 장소에 보관하세요.</span></div></div></div>`;}
function render(){document.body.classList.toggle('mobile-preview',mobileTab==='preview');document.body.classList.toggle('mobile-library-visible',mobileLibrary);$('#app').innerHTML=`<div class="app-shell" id="app-shell">${renderSidebar()}${renderWorkspace()}</div>${modal?modal==='templates'?templatesModal():modal==='settings'?settingsModal():backupModal():''}<div class="toast" id="toast" role="status" aria-live="polite"></div>`;}
function updateField(target){const d=activeDoc();if(!d||d.issueStatus==='issued')return;
 const val=target.value;
 if(target.dataset.field){const key=target.dataset.field;if(!Object.hasOwn(d,key))return;
  d[key]=key==='amount'?Math.max(0,Math.trunc(Number(val)||0)):safeString(val);
 }else if(target.dataset.section!==undefined){const s=d.sections[Number(target.dataset.section)];if(!s||!['heading','body'].includes(target.dataset.part))return;s[target.dataset.part]=safeString(val);
 }else if(target.dataset.item!==undefined){const item=d.items[Number(target.dataset.item)];if(!item||!['name','spec','quantity','unitPrice','note'].includes(target.dataset.part))return;const key=target.dataset.part;item[key]=['quantity','unitPrice'].includes(key)?Number(val):safeString(val,1000);}
 d.updatedAt=new Date().toISOString();persist();renderPreview();}
function validateAndIssue(){const d=activeDoc();if(!d||d.issueStatus==='issued')return;
 const invalid=canIssue(d,workspace.profile);if(invalid.length){notify(`발행 전 확인 필요: ${invalid.slice(0,3).join(', ')}`,'error');return;}
 if(!confirm('문서를 발행 완료 상태로 확정할까요?\n확정 후에는 해당 문서를 직접 수정할 수 없으며, 개정본을 새로 만들어야 합니다.\n\n※ 이 기능은 브라우저 내 편집 잠금이며 법적 인증이 아닙니다.'))return;
 d.issueStatus='issued';d.issuedAt=new Date().toISOString();d.updatedAt=d.issuedAt;persist();render();notify('발행 완료로 표시했습니다.');}
function printDocument(){const d=activeDoc();if(!d)return;
 const errors=canIssue(d,workspace.profile);if(errors.length){if(!confirm(`입력되지 않은 항목: ${errors.join(', ')}\n\n이대로 미완성 초안을 인쇄하시겠습니까?`))return;}
 window.print();}
function importBackup(file){if(!file)return;if(file.size>15*1024*1024){notify('백업 파일은 15MB 이하여야 합니다.','error');return;}
 const reader=new FileReader();reader.onload=()=>{try{
  const data=JSON.parse(reader.result);if(data?.format!=='PRESTIQUE_DOCUMENT_STUDIO'||!Array.isArray(data.documents)||!data.profile)throw Error('올바른 PRESTIQUE 백업 파일이 아닙니다.');
  if(data.documents.length>3000)throw Error('문서 개수가 허용 범위를 초과했습니다.');
  if(!confirm(`백업 문서 ${data.documents.length}건으로 현재 ${workspace.documents.length}건의 문서를 대체합니다.\n현재 데이터는 먼저 백업하는 것을 권장합니다. 계속할까요?`))return;
  const ids=[];const docs=[];for(const raw of data.documents){const d=normalizeDocument(raw,ids);ids.push(d.id);docs.push(d);}
  workspace={schemaVersion:VERSION,documents:docs,profile:normalizeProfile(data.profile)};selectedId=docs[0]?.id||null;modal=null;persist();render();notify(`문서 ${docs.length}건을 복원했습니다.`);
 }catch(e){notify(`복원 실패: ${e.message}`,'error');}};reader.onerror=()=>notify('파일을 읽지 못했습니다.','error');reader.readAsText(file,'utf-8');}
function handleClick(event){const target=event.target.closest('[data-action]');if(!target)return;
 const action=target.dataset.action;if(action==='close-modal'&&event.target.closest('.modal')&&target.classList.contains('modal-bg'))return;
 const d=activeDoc();
 switch(action){
 case 'open-templates':modal='templates';render();break;
 case 'settings':modal='settings';render();break;
 case 'backup':modal='backup';render();break;
 case 'close-modal':modal=null;render();break;
 case 'choose-logo':workspace.profile.logo=target.dataset.logo;persist();render();break;
 case 'filter':filter=target.dataset.category;mobileLibrary=true;render();break;
 case 'select':selectedId=target.dataset.id;mobileTab='editor';mobileLibrary=false;render();break;
 case 'create':addDocument(target.dataset.type);break;
 case 'add-section':if(d?.issueStatus==='draft'){d.sections.push({id:newId(),heading:'새 항목',body:''});d.updatedAt=new Date().toISOString();persist();render();}break;
 case 'remove-section':if(d?.issueStatus==='draft'&&confirm('이 본문 항목을 삭제할까요?')){d.sections.splice(Number(target.dataset.index),1);d.updatedAt=new Date().toISOString();persist();render();}break;
 case 'add-item':if(d?.issueStatus==='draft'){d.items.push({id:newId(),name:'',spec:'',quantity:1,unitPrice:0,note:'',image:''});d.updatedAt=new Date().toISOString();persist();render();}break;
 case 'remove-item':if(d?.issueStatus==='draft'&&d.items.length>1){d.items.splice(Number(target.dataset.index),1);d.updatedAt=new Date().toISOString();persist();render();}break;
 case 'remove-image':if(d?.issueStatus==='draft'&&d.items[Number(target.dataset.index)]){d.items[Number(target.dataset.index)].image='';d.updatedAt=new Date().toISOString();persist();render();}break;
 case 'duplicate':if(d)copyDocument(d);break;
 case 'revision':if(d?.issueStatus==='issued')reviseDocument(d);break;
 case 'delete':if(d&&confirm(`'${d.title}' 문서를 삭제할까요?\n복구하려면 백업 파일이 필요합니다.`)){workspace.documents=workspace.documents.filter(x=>x.id!==d.id);selectedId=workspace.documents[0]?.id||null;persist();render();notify('문서를 삭제했습니다.');}break;
 case 'issue':validateAndIssue();break;
 case 'print':printDocument();break;
 case 'export':downloadFile(`PRESTIQUE_Documents_${today()}.json`,JSON.stringify({format:'PRESTIQUE_DOCUMENT_STUDIO',schemaVersion:VERSION,exportedAt:new Date().toISOString(),profile:workspace.profile,documents:workspace.documents},null,2),'application/json;charset=utf-8');notify('전체 백업 파일을 내려받았습니다.');break;
 case 'remove-stamp':workspace.profile.stamp='';persist();render();break;
 case 'mobile-tab':mobileTab=target.dataset.tab;document.body.classList.toggle('mobile-preview',mobileTab==='preview');document.querySelectorAll('.mobile-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.tab===mobileTab));break;
 case 'toggle-menu':$('#app-shell')?.classList.toggle('menu-open');break;
 case 'toggle-doc-list':mobileLibrary=!mobileLibrary;document.body.classList.toggle('mobile-library-visible',mobileLibrary);break;
 }
}
function handleInput(event){const t=event.target;
 if(t.id==='doc-search'){search=t.value;const list=$('#doc-items');if(list)list.innerHTML=renderDocItems();return;}
 if(t.dataset.profile){workspace.profile[t.dataset.profile]=safeString(t.value,1000);persist();renderPreview();return;}
 if(t.dataset.field||t.dataset.section!==undefined||t.dataset.item!==undefined)updateField(t);
}
function handleChange(event){const t=event.target;
 if(t.id==='import-json'){importBackup(t.files?.[0]);return;}
 if(t.dataset.imageItem!==undefined){
  const d=activeDoc(),file=t.files?.[0],row=d?.items[Number(t.dataset.imageItem)];if(!file||!row||d.issueStatus!=='draft')return;
  if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>8*1024*1024){notify('품목 이미지는 PNG/JPG/WebP 8MB 이하로 등록하세요.','error');return;}
  const reader=new FileReader();reader.onload=()=>{row.image=reader.result;d.updatedAt=new Date().toISOString();persist();render();notify('품목 이미지가 추가되었습니다.');};reader.onerror=()=>notify('이미지를 읽지 못했습니다.','error');reader.readAsDataURL(file);return;
 }
 if(t.id==='stamp-file'){
  const file=t.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp'].includes(file.type)||file.size>2*1024*1024){notify('PNG/JPG/WebP 2MB 이하 이미지를 선택해 주세요.','error');return;}
  const r=new FileReader();r.onload=()=>{workspace.profile.stamp=r.result;persist();render();notify('날인 이미지를 등록했습니다.');};r.onerror=()=>notify('이미지를 읽지 못했습니다.','error');r.readAsDataURL(file);return;
 }
 if(t.dataset.profile){renderPreview();return;}
 if(t.dataset.field){if(t.dataset.field==='logoOverride'||t.dataset.field==='vatMode')render();else renderPreview();}
}
document.addEventListener('click',handleClick);
document.addEventListener('input',handleInput);
document.addEventListener('change',handleChange);
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal){modal=null;render();}if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();persist();notify('저장 예약 완료');}if((e.ctrlKey||e.metaKey)&&e.key==='p'){e.preventDefault();printDocument();}});
(async function init(){
 try{const saved=await loadWorkspace();if(saved?.documents&&Array.isArray(saved.documents)){
  const ids=[];const docs=[];for(const raw of saved.documents.slice(0,3000)){try{const d=normalizeDocument(raw,ids);ids.push(d.id);docs.push(d);}catch{}}
  workspace={schemaVersion:VERSION,profile:normalizeProfile(saved.profile),documents:docs};
 }else{workspace.documents=[makeDocument('official')];persist();}
 }catch(e){storeError=e.message;workspace.documents=[makeDocument('official')];}
 selectedId=workspace.documents[0]?.id||null;render();if(storeError)notify(`저장소를 열지 못했습니다. 백업을 활용해 주세요. ${storeError}`,'error');
})();
