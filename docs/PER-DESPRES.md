# Per després

Safata a `/per-despres/`, enllaçada des de `/raco.html`. Les dades resideixen a Supabase i l’accés a les files continua protegit per Auth i RLS.

## Accés i sessió

Accés amb el correu i la contrasenya existents, enviats únicament a Supabase Auth per HTTPS. El client oficial `@supabase/supabase-js` 2.118.0 es carrega des de jsDelivr amb versió fixada.

La sessió es conserva a l’emmagatzematge local del navegador sota una clau específica d’aquesta aplicació. El client oficial gestiona la recuperació, la renovació de tokens i els esdeveniments entre pestanyes. No es desa la contrasenya ni el contingut de les entrades en aquest emmagatzematge.

Després d’aquesta actualització cal iniciar sessió una vegada. Recarregar, tancar i tornar a obrir el navegador conserva l’accés mentre la sessió continuï vàlida i el navegador conservi les dades. Supabase pot revocar la sessió o exigir una nova autenticació; esborrar les dades del navegador també elimina l’accés recordat.

«Tancar sessió» utilitza l’abast local de Supabase: revoca la sessió actual i elimina la sessió desada, sense tancar les sessions independents d’altres dispositius. La interfície buida les entrades i tanca els diàlegs en rebre la sortida. Un error de xarxa no provoca una sortida automàtica.

## Safata i converses

Llegir o tancar una entrada no en canvia l’estat. «Marcar com a revisada» i «Tornar a pendents» actualitzen `status` i `completed_at`, amb confirmació del servidor. La política d’actualització ha de permetre els estats `pending` i `done` conservant les comprovacions de propietari i accés.

«Actualitzar» consulta les dades de nou sense recarregar tota la pàgina. Les pestanyes Pendents i Revisades filtren les entrades carregades. Les llistes buides no mostren textos i els canvis d’estat no deixen missatges de confirmació persistents.

Cada targeta mostra «Obrir conversa» quan `conversation_url` conté un enllaç privat vàlid de `https://chatgpt.com/c/…` o `https://chatgpt.com/g/…/c/…`. L’enllaç també apareix al lector. S’obre amb `noopener noreferrer`, sense enviar el referent. No es creen enllaços públics compartits.

Si falta una URL real o és invàlida, la targeta indica «Sense enllaç de conversa». La web no pot reconstruir la conversa a partir del text ni inventa adreces.

## Enviament des de ChatGPT

El connector privat de l’aplicació insereix el contingut seleccionat a Supabase mitjançant un pont amb permisos limitats d’inserció. El recorregut fins a la safata ha estat confirmat per l’usuari. Només s’ha de confirmar una desada després de rebre una resposta real d’inserció.

El text enviat pot ser un resum o un fragment si així ho demana l’usuari. No s’importa tota la conversa automàticament. `conversation_url` només s’envia quan es coneix l’adreça privada real; no totes les converses exposen aquesta informació a l’assistent.

## Captura manual alternativa

«Afegir contingut» accepta text pla o JSON amb `title`, `description`, `content` i `conversation_url` opcional. L’usuari prepara, revisa i desa el contingut. La inserció utilitza la seva sessió i les polítiques existents; fixa el propietari i l’estat inicial pendent. La clau d’idempotència estable evita duplicats.

## Verificació

Des de l’arrel del repositori:

```sh
node tests/per-despres-auth.cjs
```

Les proves d’integració utilitzen un doble del client Auth, sense credencials reals. Cobreixen recuperació després de recarregar, renovació, errors de xarxa, sortida local i entre pestanyes, enllaços privats i absents, i els dos canvis d’estat. No substitueixen la comprovació amb una sessió real al navegador.
