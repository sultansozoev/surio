# Fix per 404 su GitHub Pages

## Il Problema
Quando aggiorni la pagina su una route diversa da `/` (es: `/request`, `/series`), ottieni un errore 404.

## La Causa
GitHub Pages non è un vero server - serve solo file statici. Quando visiti `surio.me/request`, GitHub cerca un file `request/index.html` che non esiste.

## La Soluzione Implementata

### 1. File Creati/Aggiornati

- **`public/404.html`**: Reindirizza tutte le 404 a `/?/path`
- **`public/index.html`**: Script che converte `/?/path` in `/path`
- **`public/CNAME`**: Dice a GitHub che usi dominio custom
- **`public/.nojekyll`**: Disabilita Jekyll (importante!)

### 2. Come Funziona

```
Utente visita: surio.me/request
        ↓
GitHub non trova il file → 404
        ↓
Serve 404.html con script
        ↓
Script reindirizza a: surio.me/?/request
        ↓
Carica index.html
        ↓
Script in index.html converte /?/request → /request
        ↓
React Router carica il componente corretto
```

## Come Deployare Correttamente

### Passo 1: Build
```bash
npm run build
```

### Passo 2: Verifica che i file siano stati copiati
```bash
ls -la build/
# Dovresti vedere:
# - 404.html
# - CNAME
# - .nojekyll
```

### Passo 3: Deploy
```bash
npm run deploy
```

**IMPORTANTE**: Il flag `--dotfiles` nel comando deploy è cruciale per copiare `.nojekyll`!

### Passo 4: Attendi GitHub Pages
- Vai su GitHub → Settings → Pages
- Verifica che il source sia `gh-pages` branch
- Attendi il deployment (badge verde)
- Può richiedere 1-2 minuti

## Verifica Post-Deploy

### 1. Controlla i file sul branch gh-pages
```bash
git checkout gh-pages
ls -la
# Verifica che esistano:
# - 404.html
# - CNAME (con contenuto "surio.me")
# - .nojekyll (file vuoto)
git checkout main
```

### 2. Test manuale
1. Vai su `https://surio.me`
2. Naviga a `/request`
3. Premi F5 per refresh
4. Dovrebbe caricare senza errori

## Troubleshooting

### Problema: Ancora 404 dopo deploy

**Verifica 1**: File nel branch gh-pages
```bash
git checkout gh-pages
ls -la | grep -E "(404|CNAME|nojekyll)"
```

**Verifica 2**: CNAME corretto
```bash
cat CNAME
# Output: surio.me
```

**Verifica 3**: GitHub Pages settings
- Settings → Pages
- Custom domain: `surio.me`
- Enforce HTTPS:

**Soluzione**: Re-deploy con flag dotfiles
```bash
npm run deploy
```

### Problema: 404.html non viene servito

**Causa**: GitHub Pages potrebbe aver cachato il vecchio 404

**Soluzione**:
1. Vai su Settings → Pages
2. Cambia Source in `None`
3. Save
4. Attendi 1 minuto
5. Cambia Source in `gh-pages`
6. Save
7. Attendi il nuovo deployment

### Problema: Redirect loop

**Causa**: Script in index.html o 404.html è sbagliato

**Verifica**: Apri Developer Console (F12)
- Guarda la tab Network
- Vedi redirect infiniti?

**Soluzione**: 
```bash
# Scarica i file attuali dal branch gh-pages
git checkout gh-pages
cat 404.html
cat index.html
# Verifica che gli script siano corretti
git checkout main
```

### Problema: DNS non risolve

**Verifica DNS**:
```bash
nslookup surio.me
# Dovrebbe mostrare gli IP di GitHub:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153
```

**Soluzione**: Configura DNS correttamente presso il tuo provider:
```
Type: A
Name: @
Value: 185.199.108.153
       185.199.109.153
       185.199.110.153
       185.199.111.153
TTL: 3600
```

## Alternativa: HashRouter (se nulla funziona)

Se il problema persiste, puoi usare HashRouter come fallback:

1. In `src/App.jsx`:
```javascript
import { HashRouter as Router } from 'react-router-dom';
```

2. Le URL diventeranno: `surio.me/#/request`
3. Non serve più 404.html o script redirect
4. Funziona sempre al 100%

**Svantaggio**: URL meno pulite (con `#`)

## Test Locale del Build

Prima di deployare, testa sempre in locale:

```bash
# Build
npm run build

# Serve in locale (installa se necessario)
npx serve -s build

# Apri http://localhost:3000
# Testa:
# 1. Naviga a /request
# 2. Refresh (F5)
# 3. Verifica che funzioni
```

## Checklist Pre-Deploy

- [ ] `public/404.html` esiste
- [ ] `public/CNAME` contiene `surio.me`
- [ ] `public/.nojekyll` esiste (anche se vuoto)
- [ ] Script in `public/index.html` è presente
- [ ] `package.json` ha `--dotfiles` nel comando deploy
- [ ] Build locale funziona: `npm run build && npx serve -s build`
- [ ] DNS configurato correttamente

## Contatti GitHub Pages Support

Se nulla funziona, puoi contattare GitHub Support:
https://support.github.com

**Template messaggio**:
```
Subject: 404 errors on custom domain with React SPA

Hi, I'm experiencing 404 errors when refreshing pages on my GitHub Pages site with a custom domain (surio.me). 

I have:
- 404.html with SPA redirect
- .nojekyll file
- CNAME file
- Correct DNS configuration

Repository: [your-repo-url]
Custom domain: surio.me

Can you help verify the configuration?
```
