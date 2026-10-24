"use strict";
(() => {
const $=id=>document.getElementById(id), c=window.PER_DESPRES_CONFIG;
let session=null, rows=[], status="pending", active=null, generation=0, refreshTimer;
const say=text=>{$("message").textContent=text;const notice=$("reader-message");if(notice)notice.textContent=text;};
const clear=()=>{generation++;clearTimeout(refreshTimer);session=null;rows=[];active=null;$("entries").replaceChildren();$("read-content").textContent="";$("read-title").textContent="";$("read-description").textContent="";$("conversation").removeAttribute("href");$("reader").close();$("inbox").hidden=true;$("logout").hidden=true;$("login").hidden=false;};
if(!c||!c.url||!c.publicKey||!c.table||!c.fields){say("La safata encara no està connectada. Falta recuperar la configuració pública existent.");return;}
const origin=new URL(c.url);
if(origin.protocol!=="https:"||!origin.hostname.endsWith(".supabase.co")||/^sb_secret_/.test(c.publicKey)){say("Configuració pública no vàlida.");return;}
if(c.publicKey.startsWith("eyJ")){try{const payload=JSON.parse(atob(c.publicKey.split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));if(payload.role!=="anon")throw Error();}catch{say("Cal una clau pública anon o publishable.");return;}}
const f=c.fields;
async function api(path,options={},auth=true){
const response=await fetch(origin.origin+path,{...options,cache:"no-store",referrerPolicy:"no-referrer",headers:{"apikey":c.publicKey,"Content-Type":"application/json",...(auth?{"Authorization":"Bearer "+session.access_token}:{}),...options.headers}});
if(!response.ok){if(auth&&response.status===401){clear();throw Error("La sessió ha caducat. Torna a entrar.");}throw Error(auth?"No s’ha pogut completar l’operació. Torna-ho a provar.":"No s’ha pogut iniciar sessió. Comprova el correu i la contrasenya.");}
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
})();
