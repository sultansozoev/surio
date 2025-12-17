# Guida Deploy GitHub Pages

## Setup Completo

Il progetto è già configurato per GitHub Pages con:
- `404.html` per gestire il routing
- Script redirect in `index.html`
- `homepage` in `package.json`
- BrowserRouter (URL pulite senza #)

## Come Deployare

### 1. Build del progetto
```bash
npm run build
```

### 2. Deploy su GitHub Pages

**Opzione A: Con gh-pages package (Raccomandato)**

Installa il package:
```bash
npm install --save-dev gh-pages
```

Aggiungi script in `package.json`:
```json
"scripts": {
  "predeploy": "npm run build",
  "deploy": "gh-pages -d build"
}
```

Deploy:
```bash
npm run deploy
```

**Opzione B: Manualmente**

1. Vai su GitHub → Settings → Pages
2. Source: Deploy from a branch
3. Branch: scegli `gh-pages` (verrà creato da gh-pages package)
4. Save

### 3. Verifica CNAME (per dominio custom)

Se usi `surio.me`, assicurati che:
- File `CNAME` esista in `/public` con contenuto: `surio.me`
- DNS configurato correttamente:
  ```
  Type: A
  Host: @
  Value: 185.199.108.153
         185.199.109.153
         185.199.110.153
         185.199.111.153
  ```

### 4. Attendi propagazione DNS
- Può richiedere fino a 24-48 ore
- Verifica su https://surio.me

## Troubleshooting

### Problema: 404 su refresh
**Soluzione**: I file `404.html` e lo script redirect in `index.html` risolvono questo problema automaticamente.

### Problema: CORS errors
**Soluzione**: Configura il backend per accettare richieste da `https://surio.me`

### Problema: Dominio non funziona
**Soluzione**: 
1. Verifica DNS: `nslookup surio.me`
2. Verifica CNAME nel repository
3. Attendi propagazione DNS

## Note Importanti

- **Build folder**: Non committare `build/` su git (è in `.gitignore`)
- **Environment variables**: Le variabili `.env` non vengono incluse nel build pubblico
- **API URLs**: Usa `process.env.REACT_APP_API_URL` per URL backend

## Workflow Automatico (Opzionale)

Puoi creare un GitHub Action per deploy automatico:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node
      uses: actions/setup-node@v2
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        REACT_APP_API_URL: ${{ secrets.API_URL }}
    
    - name: Deploy
      uses: peaceiris/actions-gh-pages@v3
      with:
        github_token: ${{ secrets.GITHUB_TOKEN }}
        publish_dir: ./build
```

## Configurazione Attuale

```
Homepage: https://surio.me
Router: BrowserRouter (URL pulite)
404 Redirect: Configurato
CNAME: Presente
```

## Test Locale del Build

Prima di deployare, testa il build localmente:

```bash
npm run build
npx serve -s build
```

Apri http://localhost:3000 e verifica che tutto funzioni.
