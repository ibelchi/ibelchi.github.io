const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const html=fs.readFileSync('static/per-despres/index.html','utf8');
const code=fs.readFileSync('static/per-despres/inbox.js','utf8');new vm.Script(code);
const config={url:'https://example.supabase.co',publicKey:'sb_publishable_test',table:'per_despres_entries',fields:{id:'id',owner:'owner_id',title:'title',description:'description',content:'content',conversation:'conversation_url',status:'status',created:'created_at',completed:'completed_at'}};
const shared={session:null},counts={signins:0,refreshes:0,patches:0};
const entries=[{id:'one',owner_id:'owner',title:'One',description:'Summary',content:'Full\ntext',conversation_url:'https://chatgpt.com/c/real-id',status:'pending',completed_at:null},{id:'two',owner_id:'owner',title:'Two',content:'Second',conversation_url:'https://chatgpt.com/g/g-p-project/c/another-id',status:'pending'},{id:'three',owner_id:'owner',title:'No URL',content:'Third',conversation_url:null,status:'pending'},{id:'four',owner_id:'owner',title:'Unsafe URL',content:'Fourth',conversation_url:'https://chatgpt.com/share/public-id',status:'pending'}];
const settle=async()=>{for(let i=0;i<6;i++)await new Promise(setImmediate)};
function app(){
 let callback,offline=false,rejectOnce=false,focus;
 class Element{constructor(){this.children=[];this.textContent='';this.value='';this.disabled=false;this.hidden=false;this.handlers={}} append(...x){this.children.push(...x)} replaceChildren(...x){this.children=x} setAttribute(k,v){this[k]=v} removeAttribute(k){delete this[k]} addEventListener(k,v){this.handlers[k]=v} focus(){focus=this} showModal(){this.open=true} close(){if(this.open){this.open=false;this.handlers.close?.()}}}
 const el=Object.fromEntries([...html.matchAll(/id="([^"]+)"/g)].map(m=>[m[1],new Element()]));
 const auth={
  onAuthStateChange(cb){callback=cb;return{data:{subscription:{unsubscribe(){}}}}},
  async getSession(){if(shared.session?.expires_at< Date.now()/1000)await auth.refreshSession();return{data:{session:shared.session},error:null}},
  async signInWithPassword(data){counts.signins++;assert.equal(data.password,'private-password');shared.session={access_token:'access',refresh_token:'refresh',expires_at:Date.now()/1000+3600,user:{id:'owner'}};callback('SIGNED_IN',shared.session);return{data:{session:shared.session},error:null}},
  async refreshSession(){counts.refreshes++;shared.session={...shared.session,access_token:'fresh-access',expires_at:Date.now()/1000+3600};callback('TOKEN_REFRESHED',shared.session);return{data:{session:shared.session},error:null}},
  async signOut(options){assert.equal(options.scope,'local');shared.session=null;callback('SIGNED_OUT',null);return{error:null}}
 };
 const context={window:{PER_DESPRES_CONFIG:config,supabase:{createClient(url,key,options){assert.equal(options.auth.persistSession,true);assert.equal(options.auth.autoRefreshToken,true);assert.equal(options.auth.detectSessionInUrl,false);return{auth}}}},document:{getElementById:id=>{assert(el[id],id);return el[id]},createElement:tag=>{const e=new Element();e.tag=tag;return e}},setTimeout:fn=>{setImmediate(fn);return 1},clearTimeout(){},URL,Date,TextEncoder,Uint8Array,fetch:async(url,opts)=>{
  if(offline)throw Error('offline');assert(opts.headers.Authorization.startsWith('Bearer '));
  if(rejectOnce){rejectOnce=false;return{ok:false,status:401,json:async()=>({})}}
  if(opts.method==='PATCH'){counts.patches++;let row=entries.find(e=>url.includes('id=eq.'+e.id));Object.assign(row,JSON.parse(opts.body));return{ok:true,status:200,json:async()=>[{...row}]}}
  return{ok:true,status:200,json:async()=>entries.map(e=>({...e}))};
 }};
 vm.runInNewContext(code,context);
 return{el,auth,logoutEvent:()=>{shared.session=null;callback('SIGNED_OUT',null)},offline:()=>{offline=true},reject:()=>{rejectOnce=true},read:i=>el.entries.children[i].children[2].children[0].onclick(),focus:()=>focus,Element};
}
(async()=>{
 let a=app();await settle();assert.equal(a.el.login.hidden,false);
 a.el.email.value='owner@example.test';a.el.password.value='private-password';await a.el.login.onsubmit({preventDefault(){},submitter:new a.Element()});await settle();assert.equal(a.el.password.value,'');assert.equal(a.el.inbox.hidden,false);assert(shared.session);assert(!JSON.stringify(shared.session).includes('private-password'));
 const actions=a.el.entries.children.map(x=>x.children[2]);assert.equal(actions[0].children[1].href,'https://chatgpt.com/c/real-id');assert.equal(actions[0].children[1].rel,'noopener noreferrer');assert.equal(actions[1].children[1].href,'https://chatgpt.com/g/g-p-project/c/another-id');assert.equal(actions[2].children[1].tag,'span');assert.equal(actions[3].children[1].tag,'span');
 a.read(0);assert.equal(a.focus(),a.el.close);assert.equal(counts.patches,0);a.el.close.onclick();assert.equal(counts.patches,0);
 a.read(0);await a.el.toggle.onclick();assert.equal(entries[0].status,'done');a.el.done.onclick();a.read(0);await a.el.toggle.onclick();assert.equal(entries[0].status,'pending');assert.equal(entries[0].completed_at,null);assert.equal(a.el.message.textContent,'');
 a=app();await settle();assert.equal(a.el.login.hidden,true);assert.equal(a.el.entries.children.length,4);assert.equal(counts.signins,1);
 shared.session.expires_at=0;const prev=counts.refreshes;a=app();await settle();assert.equal(a.el.inbox.hidden,false);assert.equal(counts.refreshes,prev+1);assert.equal(counts.signins,1);
 a.reject();await a.el.reload.onclick();assert.equal(a.el.login.hidden,true);assert.equal(counts.refreshes,prev+2);
 a.offline();await a.el.reload.onclick();assert(shared.session);assert.equal(a.el.inbox.hidden,false);assert.equal(a.el.message.textContent,'offline');
 a.logoutEvent();assert.equal(a.el.login.hidden,false);assert.equal(a.el.entries.children.length,0);
 a=app();await settle();a.el.password.value='private-password';await a.el.login.onsubmit({preventDefault(){},submitter:new a.Element()});await a.el.logout.onclick();assert.equal(shared.session,null);assert.equal(a.el.login.hidden,false);assert.equal(a.el.entries.children.length,0);
 a=app();await settle();assert.equal(a.el.login.hidden,false);
 console.log('PASS integration (mock Auth SDK): login, reload restoration, expired-token renewal, 401 refresh, offline session retention, local logout and cross-tab signout; private card links, project URLs, missing/unsafe URL handling, read-only opening and both review transitions.');
})().catch(e=>{console.error(e);process.exitCode=1});

