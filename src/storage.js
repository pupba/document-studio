const DB='prestique-document-studio-v1',STORE='records',KEY='workspace';
let connection;
function openDb(){
 if(connection)return connection;
 connection=new Promise((resolve,reject)=>{
  if(!('indexedDB' in globalThis)){reject(new Error('IndexedDB가 지원되지 않습니다.'));return;}
  const req=indexedDB.open(DB,1);
  req.onupgradeneeded=()=>{if(!req.result.objectStoreNames.contains(STORE))req.result.createObjectStore(STORE);};
  req.onsuccess=()=>{const db=req.result;db.onversionchange=()=>db.close();resolve(db);};
  req.onerror=()=>reject(req.error||new Error('DB를 열 수 없습니다.'));
 });return connection;
}
async function transact(mode,operation){const db=await openDb();return new Promise((resolve,reject)=>{
 const tx=db.transaction(STORE,mode);let req;try{req=operation(tx.objectStore(STORE));}catch(e){reject(e);return;}
 tx.oncomplete=()=>resolve(req?.result);tx.onerror=()=>reject(tx.error||new Error('저장 실패'));tx.onabort=()=>reject(tx.error||new Error('저장 취소'));
 });}
export async function loadWorkspace(){return (await transact('readonly',store=>store.get(KEY)))||null;}
export async function saveWorkspace(value){await transact('readwrite',store=>store.put(value,KEY));}
