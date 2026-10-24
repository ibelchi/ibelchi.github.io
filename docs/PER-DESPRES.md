# Per després

Safata a `/per-despres/`, enllaçada des de `/raco.html`. Connexió pública a Supabase, taula `public.per_despres_entries`, segons els noms facilitats pel propietari.

Accés amb correu/contrasenya existent. Credencials enviades únicament a Supabase Auth per HTTPS. Sessió només en memòria, renovació automàtica; recarregar la pàgina requereix tornar a entrar. No es desa contingut en localStorage ni al repositori. Tancar sessió neteja la interfície i revoca la sessió remota.

Lectura de pendents i revisades, actualització d’estat `pending`/`done` i de `completed_at`. Consulta filtrada per `owner_id`; RLS ha de continuar protegint les files al servidor. El contingut Markdown original es mostra com a text segur. Les converses només s’enllacen a https://chatgpt.com/c/.

L’usuari ha comprovat que pot iniciar sessió. No s’ha canviat la configuració de Supabase ni utilitzat claus administratives.

## Captura manual des de ChatGPT

Aquesta és la via activa per a la nova safata: demanar a ChatGPT un bloc JSON amb title, description, content (text complet fidel) i conversation_url opcional (només si es coneix l’URL privada real). Copiar el bloc, obrir Afegir contingut, enganxar-lo, prémer Preparar, revisar i Desar a la safata. També accepta text pla. Les dades no viatgen en URL ni queden al repositori.

La inserció utilitza la sessió de l’usuari i les polítiques RLS existents. Es fixa owner_id a l’usuari autenticat i status a pending; no s’accepten aquests camps del bloc importat. idempotency_key és un SHA-256 estable de títol, contingut i conversa, per detectar reintents. La restricció única existent ha de resoldre les insercions simultànies; no s’ha alterat l’esquema. La importació real queda pendent de prova per l’usuari.

El connector anterior continua separat i buit segons la consulta efectuada; no s’ha de presentar una desada amb aquell connector com si fos una desada a Supabase. La via implementada requereix copiar i enganxar i no és un enviament automàtic.
