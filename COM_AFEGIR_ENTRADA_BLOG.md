# Com afegir una entrada al blog

## Eines necessàries
- **Zola** (generador del lloc): ja instal·lat
- **Git** + accés a GitHub: ja configurat
- Un editor de text (VS Code, Notepad++, etc.)

---

## ✏️ Editar una entrada existent

Si només vols modificar el contingut d'un post ja publicat:

1. Obre el fitxer `.md` corresponent a `content\blog\`
2. Edita el text (pots canviar el títol, la data i/o el contingut)
3. Fes el **build** i el **push** (Passos 3, 4 i 5 d'aquest document)

> No cal crear cap fitxer nou. Els passos 1 i 2 queden substituïts per l'edició directa.

---

## Pas 1 — Crea el fitxer Markdown

Crea un fitxer nou a la carpeta:
```
content\blog\
```

**Nom del fitxer:** tot en minúscules, sense accents, espais substituïts per guions baixos `_`.
Exemple: `la_meva_entrada.md`

---

## Pas 2 — Escriu la capçalera i el contingut

El fitxer ha de començar **sempre** amb aquesta capçalera (front matter):

```
+++
title = "El títol de l'entrada"
date = 2026-04-27
template = "blog-page.html"
+++

Aquí comença el contingut de l'entrada en text normal.

Pots fer servir Markdown: **negreta**, *cursiva*, etc.
```

> ⚠️ La data ha d'estar en format AAAA-MM-DD (any-mes-dia).

---

## 🖼️ Imatges i Enllaços

Pots afegir enllaços i imatges utilitzant la sintaxi de Markdown o HTML si necessites un disseny específic.

### 🔗 Enllaços
La sintaxi és `[text de l'enllaç](URL)`:
```markdown
[Visita Google](https://www.google.com)
```

### 📷 Imatges
La sintaxi és `![text alternatiu](ruta_de_la_imatge)`:
```markdown
![Descripció](assets/imatge.jpg)
```

### ↔️ Dues imatges de costat i centrades
Com que Markdown no ho permet directament, utilitza aquest codi HTML:
```html
<div style="display: flex; justify-content: center; gap: 10px;">
  <img src="assets/imatge1.jpg" alt="Descripció 1" style="width: 45%;">
  <img src="assets/imatge2.jpg" alt="Descripció 2" style="width: 45%;">
</div>
```

### 📉 Comprimir imatges (Recomanat)
Perquè el web carregui ràpid:
* **Dimensions**: Redueix l'amplada a un màxim de **1000px - 1200px**.
* **Format**: Fes servir **WebP** (ideal) o **JPG** (qualitat 70-80%).
* **Pes**: Intenta que cada imatge pesi **menys de 200 KB**.
* **Eines**: Pots fer servir [Squoosh.app](https://squoosh.app/) o [TinyPNG.com](https://tinypng.com/).

---

## Pas 3 — Genera el lloc (build)

Obre un terminal a la carpeta del projecte:
```
c:\Users\Belchi\.antigravity\web personal
```

Executa:
```powershell
zola build --output-dir public2; Copy-Item -Recurse -Force ".\public2\*" ".\public\"; Remove-Item -Recurse -Force ".\public2"
```

Si el build va bé, veuràs al terminal:
```
Done in XXms.
Contingut copiat correctament
```

> ℹ️ Per què dues carpetes? Zola intenta esborrar `public\` abans de reconstruir,
> però Windows de vegades el té bloquejat. Amb aquest mètode ho evitem.

---

## Pas 4 — Puja els canvis a GitHub

Executa aquestes tres comandes al terminal (una darrere l'altra):

```powershell
git add -A
```
```powershell
git commit -m "Blog: afegir entrada 'El títol de l'entrada'"
```
```powershell
git push origin main
```
O bé aquesta comanda:

```powershell
git add -A; git commit -m "Descripció dels canvis"; git push origin main
```


---

## Pas 5 — Espera el desplegament

GitHub Pages tarda **1-3 minuts** a desplegar els canvis.

Passat aquest temps, comprova el resultat a:
👉 https://ibelchi.github.io/blog

---

## Resum ràpid (còpia i enganxa)

```powershell
# 1. Fes el build
zola build --output-dir public2; Copy-Item -Recurse -Force ".\public2\*" ".\public\"; Remove-Item -Recurse -Force ".\public2"

# 2. Puja a GitHub
git add -A
git commit -m "Blog: nova entrada"
git push origin main
```

---

## Errors comuns

| Error | Solució |
|-------|---------|
| `Couldn't delete output directory` | Utilitza el mètode `--output-dir public2` del Pas 3 |
| El post no apareix al blog | Comprova que la capçalera `+++` és correcta i que tens `template = "blog-page.html"` |
| `git push` falla | Comprova la connexió a internet i que tens accés al repositori |
