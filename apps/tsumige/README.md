# 積みゲー (tsumigē)

Aplicació de col·lecció de videojocs, bitàcora anual, propòsits i estadístiques. Es publica a https://ibelchi.github.io/tsumige/.

Les dades són a Supabase i requereixen autenticació. El propietari edita i els comptes de convidats assignats tenen només consulta, protegida per les polítiques de la base de dades.

## Desenvolupament

Amb Node.js 22: executar npm ci, copiar .env.example a .env.local i configurar només la URL i la clau pública de Supabase, i executar npm run dev. Mai posar una clau secret, service_role o credencial de Twitch/RAWG a la web.

## Publicació

El workflow del blog compila aquesta aplicació abans de construir el lloc amb Zola. La compilació es genera a static/tsumige/; Zola la copia a la web final. El router utilitza el fragment de l’URL perquè les seccions es puguin obrir i recarregar a GitHub Pages. Els recursos utilitzen la base /tsumige/.

La clau publishable de Supabase és pública per disseny; la protecció de les dades es fa amb autenticació i RLS. La configuració del workflow conté exclusivament la URL i aquesta clau pública.

La versió pública exclou els lots personals d’importació Steam/Epic, Excel, còpies JSON/CSV, captures, logs, credencials i documentació privada de treball. Les importacions antigues continuen disponibles només al projecte local. Les dades de la col·lecció es consulten de Supabase, no s’incorporen al codi ni a la compilació.

Els textos i notes propis de l’usuari tenen CC BY-NC-SA 4.0. Aquesta indicació no inclou les portades de tercers, els logotips ni el codi.
