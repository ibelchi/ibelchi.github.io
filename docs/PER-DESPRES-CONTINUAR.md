# Continuar Per després: enviament directe

## Objectiu obligatori

L’usuari vol dir «desa això» a ChatGPT i trobar el text íntegre directament a https://ibelchi.github.io/per-despres/, sense copiar/enganxar en cada captura. L’entrada manual publicada és només una alternativa i no satisfà l’objectiu. Accepta una vinculació manual inicial si és necessària, però no passos manuals per entrada.

## Estat verificat

- Repositori ibelchi/ibelchi.github.io. main i projecte/per-despres contenen la safata i la captura manual (commit 588feb257595ae8cb76fb758ed9b426c489e02ba).
- GitHub Pages desplegat correctament. L’usuari confirma que pot entrar amb el correu/contrasenya ja configurats a Supabase.
- URL i clau pública són a static/per-despres/config.js. Mai cal demanar ni utilitzar service_role, sb_secret, contrasenya d’usuari o connexió d’administració Supabase.
- Taula existent public.per_despres_entries: id, owner_id, title, description, content, conversation_url, status, created_at, completed_at, idempotency_key. No tornar a crear ni reconfigurar aquesta taula sense comprovar primer el que existeix.
- Estats previstos pending/done; la web actualitza completed_at amb el canvi d’estat. Sessió de la web només en memòria.
- Connector privat existent Per després: Site project_id appgprj_6add17bfb4f48191a2e18978d0375af6; URL https://per-despres-belchi.genialfawn67.chatgpt.site; endpoint /mcp.
- Site restringit al propietari; no ampliar audiència. Té eines save_for_later i list_saved_entries. La darrera consulta de pendents va retornar []. La consulta no prova que no hi hagi entrades revisades.
- El connector encara desa en una safata separada. No afirmar que una crida al connector antic escriu a Supabase.

## Treball pendent

1. Obrir el codi real del Site existent amb el flux oficial de Sites. Preservar manifest, project_id, audiència i recursos existents. No crear un nou Site ni un segon connector sense necessitat.
2. Implementar i revisar un pont amb privilegi restringit d’inserció. El connector no ha de rebre capacitat d’administració, lectura general, actualització ni eliminació a Supabase. No desar una sessió completa de l’usuari com a substitut d’un permís limitat.
3. Opció de disseny encara NO implementada: una funció RPC que accepti una credencial aleatòria revocable, en guardi només el resum criptogràfic, vinculi el propietari al servidor i només permeti inserir una entrada. Credencial guardada al servidor del connector com a secret, mai al navegador ni al repositori. Protegir alta/revocació amb autenticació de l’usuari. Serà necessària una configuració inicial manual a Supabase; preparar codi concret i instruccions una sola vegada, sense claus administratives per a ChatGPT.
4. La funció ha de validar tipus, límits, URL privada real opcional; fixar propietari/estat al servidor; aplicar idempotència per reintents i retornar només confirmació/identificador. No permetre nom de taula o SQL arbitrari en paràmetres.
5. Adaptar save_for_later perquè cridi el pont i confirmi només després de la inserció real. Eliminar o adaptar list_saved_entries sense ampliar els permisos del pont d’inserció.
6. Provar manca d’identitat, credencial incorrecta/revocada, cap lectura/modificació/eliminació, propietari fix, contingut fidel i duplicats. Desplegar el Site existent amb el flux oficial. Fer una captura de prova explícita i comprovar-la a la web nova.

## Bloqueig d’aquest entorn (25/10/2026)

Les eines de lectura/escriptura de GitHub i gestió de Sites funcionen. S’ha obtingut accés temporal al repositori font del Site, però NO s’ha pogut obrir el codi ni publicar canvis al connector.

L’eina oficial sites/scripts/site-workflow.mjs falla en executar-se amb EPERM: operation not permitted, lstat C:\\Users\\Belchi. C:\\workspace també retorna Access denied. Les connexions directes de shell a Supabase estan bloquejades. El navegador integrat també havia fallat per sessió desconnectada. No modificar proteccions de l’equip per resoldre-ho: reprendre en un entorn de desenvolupament amb accés ordinari al codi i a les eines oficials de Sites.

No s’ha modificat Supabase ni desplegat el pont. No tornar a presentar el projecte com a complet. Credencials temporals de Sites s’han mantingut en memòria i cal obtenir-ne de noves quan es reprengui.
