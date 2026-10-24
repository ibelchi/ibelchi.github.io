"use strict";
(() => {
const $=id=>document.getElementById(id), c=window.PER_DESPRES_CONFIG;
let session=null, rows=[], status="pending", active=null, generation=0, refreshTimer;
const say=text=>{$("message").textContent=text;const notice=$("reader-message");if(notice)notice.textContent=text;};
const clear=()=>{generation++;clearTimeout(refreshTimer);session=null;rows=[];active=null;resetCapture();$("capture").close();$("entries").replaceChildren();$("read-content").textContent="";$("read-title").textContent="";$("read-description").textContent="";$("conversation").removeAttribute("href");$("reader").close();$("inbox").hidden=true;$("logout").hidden=true;$("login").hidden=false;};
if(!c||!c.url||!c.publicKey||!c.table||!c.fields){say("La safata encara no està connectada. Falta recuperar la configuració pública existent.");return;}
const origin=new URL(c.url);
if(origin.protocol!=="https:"||!origin.hostname.endsWith(".supabase.co")||/^sb_secret_/.test(c.publicKey)){say("Configuració pública no vàlida.");return;}
if(c.publicKey.startsWith("eyJ")){try{const payload=JSON.parse(atob(c.publicKey.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));if(payload.role!=="anon")throw Error();}catch{say("Cal una clau pública anon o publishable.");return;}}
const f=c.fields;
async function api(path,options={},auth=true){
const response=await fetch(origin.origin+path,{...options,cache:"no-store",referrerPolicy:"no-referrer",headers:{"apikey":c.publicKey,"Content-Type":"application/json",...(auth?{"Authorization":"Bearer "+session.access_token}:{}),...options.headers}});
if(!response.ok){if(auth&&response.status===401){clear();throw Error("La sessió ha caducat. Torna a entrar.");}if(response.status===409)throw Error("Aquest contingut ja s’ha desat. Actualitza la safata per veure’l.");throw Error(auth?"No s’ha pogut completar l’operació. Torna-ho a provar.":"No s’ha pogut iniciar sessió. Comprova el correu i la contrasenya.");}
return response.status===204?null:response.json();
}
function setSession(value){session=value;clearTimeout(refreshTimer);const g=generation;refreshTimer=setTimeout(async()=>{try{const next=await api("/auth/v1/token?grant_type=refresh_token",{method:"POST",body:JSON.stringify({refresh_token:session.refresh_token})},false);if(g===generation)setSession(next);}catch{if(g===generation){clear();say("La sessió ha caducat. Torna a entrar.");}}},Math.max(1000,(value.expires_in-60)*1000));}
function render(){
$("entries").replaceChildren();
const filtered=rows.filter(row=>row[f.status]===status);
if(!filtered.length){const p=document.createElement("p");p.textContent=status==="pending"?"Tot al dia. No tens lectures pendents.":"Encara no hi ha lectures revisades.";$("entries").append(p);}
for(const row of filtered){const article=document.createElement("article");article.className="entry";const title=document.createElement("h2");title.textContent=row[f.title]||"Sense títol";const p=document.createElement("p");p.textContent=row[f.description]||"";const button=document.createElement("button");button.textContent="Llegir ↗";button.onclick=()=>open(row);article.append(title,p,button);$("entries").append(article);}
$("pending").setAttribute("aria-pressed",String(status==="pending"));$("done").setAttribute("aria-pressed",String(status==="done"));
}
function open(row){active=row;$("read-title").textContent=row[f.title]||"Sense títol";$("read-description").textContent=row[f.description]||"";$("read-content").textContent=row[f.content]||"";const link=$("conversation");link.hidden=true;link.removeAttribute("href");try{const u=new URL(row[f.conversation]);if(u.origin==="https://chatgpt.com"&&u.pathname.startsWith("/c/")){link.href=u.href;link.hidden=false;}}catch{}$("toggle").textContent=status==="pending"?"Fet":"Tornar a pendents";$("reader").showModal();}
async function load(){say("Carregant…");const g=generation;const data=await api("/rest/v1/"+encodeURIComponent(c.table)+"?select="+encodeURIComponent([...new Set(Object.values(f))].join(","))+"&"+encodeURIComponent(f.owner)+"=eq."+encodeURIComponent(session.user.id)+"&order="+encodeURIComponent(f.created)+".desc");if(g!==generation)return;rows=data;render();say("");}
$("login").hidden=false;
$("login").onsubmit=async event=>{event.preventDefault();const button=event.submitter;button.disabled=true;say("");try{generation++;setSession(await api("/auth/v1/token?grant_type=password",{method:"POST",body:JSON.stringify({email:$("email").value.trim(),password:$("password").value})},false));$("password").value="";$("login").hidden=true;$("inbox").hidden=false;$("logout").hidden=false;await load();}catch(error){say(error.message);}finally{button.disabled=false;}};
$("logout").onclick=async()=>{const token=session?.access_token;clear();say("");if(token)fetch(origin.origin+"/auth/v1/logout",{method:"POST",headers:{apikey:c.publicKey,Authorization:"Bearer "+token}}).catch(()=>{});};
$("pending").onclick=()=>{status="pending";render();};$("done").onclick=()=>{status="done";render();};
$("reload").onclick=async()=>{try{await load();}catch(error){say(error.message);}};
$("close").onclick=()=>$("reader").close();
$("toggle").onclick=async()=>{if(!active)return;const button=$("toggle");button.disabled=true;const row=active,g=generation;try{const next=row[f.status]==="pending"?"done":"pending";const changed=await api("/rest/v1/"+encodeURIComponent(c.table)+"?"+encodeURIComponent(f.id)+"=eq."+encodeURIComponent(row[f.id]),{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify({[f.status]:next,[f.completed]:next==="done"?new Date().toISOString():null})});if(g!==generation)return;if(!Array.isArray(changed)||changed.length!==1)throw Error("No s’ha pogut confirmar el canvi.");row[f.status]=next;row[f.completed]=changed[0][f.completed];$("reader").close();render();say("");}catch(error){say(error.message);}finally{button.disabled=false;}};

let captureContent=null;
function resetCapture(){
captureContent=null;
for(const id of ["capture-input","capture-title","capture-description","capture-url"])$(id).value="";
$("capture-content").textContent="";$("capture-message").textContent="";$("capture-review").hidden=true;
}
function privateUrl(raw){
if(!raw)return null;
try{const u=new URL(raw);if(u.origin==="https://chatgpt.com"&&u.pathname.startsWith("/c/")&&u.pathname.length>3&&!u.username&&!u.password)return u.origin+u.pathname;}catch{}
throw Error("L’enllaç ha de ser una conversa privada de https://chatgpt.com/c/.");
}
function parseCapture(raw){
let text=raw.trim();if(!text)throw Error("Enganxa primer el contingut.");
if(text.startsWith("```"))text=text.replace(/^```(?:json)?\s*\n?/i,"").replace(/\n?\s*```$/,"");
let data;
try{data=JSON.parse(text);}catch{data={content:raw};}
if(!data||typeof data!=="object"||Array.isArray(data)||typeof data.content!=="string")throw Error("El bloc ha de contenir un camp content amb el text complet.");
if(!data.content.trim()||data.content.length>100000)throw Error("El contingut ha de tenir entre 1 i 100.000 caràcters.");
return {title:typeof data.title==="string"?data.title.slice(0,500):data.content.trim().split("\n")[0].replace(/^#+\s*/,"").slice(0,100),description:typeof data.description==="string"?data.description.slice(0,2000):"",content:data.content,conversation_url:privateUrl(data.conversation_url||"")};
}
$("add").onclick=()=>{resetCapture();$("capture").showModal();};
$("capture-close").onclick=()=>{$("capture").close();resetCapture();};
$("capture-input").oninput=()=>{captureContent=null;$("capture-review").hidden=true;};
$("capture-preview").onclick=()=>{try{const value=parseCapture($("capture-input").value);captureContent=value.content;$("capture-title").value=value.title;$("capture-description").value=value.description;$("capture-url").value=value.conversation_url||"";$("capture-content").textContent=value.content;$("capture-review").hidden=false;$("capture-message").textContent="Revisa el títol i el text abans de desar.";}catch(error){$("capture-message").textContent=error.message;$("capture-review").hidden=true;}};
$("capture-form").onsubmit=async event=>{
event.preventDefault();if(!session||captureContent===null)return;
const button=$("capture-save"),g=generation;button.disabled=true;$("capture-message").textContent="Desant…";
try{
const title=$("capture-title").value.trim();if(!title)throw Error("Escriu un títol.");
const conversation_url=privateUrl($("capture-url").value.trim());
const digest=await crypto.subtle.digest("SHA-256",new TextEncoder().encode(JSON.stringify([title,captureContent,conversation_url])));
if(g!==generation)return;
const key="manual-"+Array.from(new Uint8Array(digest),x=>x.toString(16).padStart(2,"0")).join("");
const existing=await api("/rest/v1/"+encodeURIComponent(c.table)+"?select=id&owner_id=eq."+encodeURIComponent(session.user.id)+"&idempotency_key=eq."+key+"&limit=1");
if(g!==generation)return;if(existing.length)throw Error("Aquest contingut ja és a la safata.");
const inserted=await api("/rest/v1/"+encodeURIComponent(c.table),{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({owner_id:session.user.id,title,description:$("capture-description").value.trim(),content:captureContent,conversation_url,status:"pending",completed_at:null,idempotency_key:key})});
if(g!==generation)return;
if(!Array.isArray(inserted)||inserted.length!==1)throw Error("No s’ha pogut confirmar que el contingut s’hagi desat.");
$("capture").close();resetCapture();status="pending";rows.unshift(inserted[0]);render();say("Contingut desat a la safata.");
}catch(error){$("capture-message").textContent=error.message;}finally{button.disabled=false;}
};

})();
