# Per després

Safata a `/per-despres/`, enllaçada des de `/raco.html`. Connexió pública a Supabase, taula `public.per_despres_entries`, segons els noms facilitats pel propietari.

Accés amb correu/contrasenya existent. Credencials enviades únicament a Supabase Auth per HTTPS. Sessió només en memòria, renovació automàtica; recarregar la pàgina requereix tornar a entrar. No es desa contingut en localStorage ni al repositori. Tancar sessió neteja la interfície i revoca la sessió remota.

Lectura de pendents i revisades, actualització d’estat `pending`/`done` i de `completed_at`. Consulta filtrada per `owner_id`; RLS ha de continuar protegint les files al servidor. El contingut Markdown original es mostra com a text segur. Les converses només s’enllacen a https://chatgpt.com/c/.

No s’ha canviat la configuració de Supabase ni utilitzat claus administratives. La comprovació real d’autenticació i de polítiques queda pendent de la sessió del propietari; l’entorn d’execució bloqueja les connexions directes a Supabase. ChatGPT encara conserva el connector de la versió anterior: no s’ha migrat la captura de continguts a aquesta taula, i cal resoldre aquest pont abans de considerar el projecte complet.
