# 🚀 Deploy Automatico con GitHub Actions

## Come Funziona

Ogni volta che fai `git push` su `main`, GitHub Actions:
1. ✅ Installa le dipendenze
2. ✅ Fa il build del progetto
3. ✅ Deploya automaticamente su GitHub Pages

**NON devi** fare `npm run deploy` manualmente!

## Setup Iniziale (da fare UNA VOLTA)

### 1. Configura GitHub Pages per usare GitHub Actions

1. Vai su: **Repository → Settings → Pages**
2. **Source**: GitHub Actions ← **IMPORTANTE! Non "Deploy from a branch"**
3. Salva

### 2. Pusha il codice

```bash
git add .
git commit -m "Setup GitHub Actions deploy"
git push origin main
```

### 3. Attendi il Deploy

- Vai su: **Actions** tab nel repository
- Vedrai il workflow "Deploy static content to Pages" in esecuzione
- Attendi che diventi verde ✅
- Il sito sarà live su `https://surio.me`

## Workflow Quotidiano

```bash
# 1. Fai modifiche al codice
# 2. Committa
git add .
git commit -m "Le tue modifiche"

# 3. Pusha (deploy automatico!)
git push origin main

# 4. Vai su Actions tab per vedere il progresso
```

## 🎯 Vantaggi GitHub Actions

✅ **Deploy automatico** - Pusha e basta!
✅ **Build cloud** - Non intasa il tuo PC
✅ **History completa** - Vedi tutti i deploy
✅ **Rollback facile** - Torna a commit precedenti
✅ **Professionale** - Come fanno le grandi aziende

## ⚙️ Configurazione Attuale

**File**: `.github/workflows/static.yml`

```yaml
Trigger: Push su main
Build: npm run build
Output: ./build
Deploy: GitHub Pages via Actions
```

## 🔍 Monitoring

### Vedere lo stato del deploy:
1. GitHub → Repository → **Actions**
2. Click sull'ultimo workflow run
3. Vedi i logs in tempo reale

### Se il deploy fallisce:
1. Guarda i logs in Actions
2. Cerca l'errore (solitamente rosso ❌)
3. Fixa l'errore
4. Pusha di nuovo

## 🐛 Troubleshooting

### Errore: "build folder not found"
**Soluzione**: Verificato e fixato! Il workflow ora cerca `./build`

### Errore: "Permission denied"
**Soluzione**: 
1. Settings → Actions → General
2. Workflow permissions → **Read and write permissions**
3. Save

### Errore: 404 su refresh
**Soluzione**: Stai usando HashRouter, quindi non avrai più questo problema!

### Deploy bloccato
**Soluzione**:
1. Actions → Click sul workflow bloccato
2. Cancel workflow
3. Pusha di nuovo

## 📊 Differenze tra Deploy Methods

### GitHub Actions (Attuale) ✅
```
git push → Actions → Build → Deploy
```
- ✅ Automatico
- ✅ Non serve npm run deploy
- ✅ Build su cloud

### Manual Deploy (Vecchio)
```
npm run build → npm run deploy
```
- ❌ Manuale
- ❌ Build locale
- ❌ Più passaggi

## 🎉 Quick Start

```bash
# Setup fatto! Ora semplicemente:
git add .
git commit -m "Update"
git push

# Il sito si aggiorna automaticamente! 🚀
```

## 📝 Note Importanti

- **Branch**: Deploy automatico solo da `main`
- **Build folder**: `./build` (standard React)
- **CNAME**: Configurato per `surio.me`
- **HashRouter**: URL con `#` (affidabile al 100%)
- **404.html**: Presente ma HashRouter lo rende non necessario

## 🔐 Environment Variables

Se hai variabili d'ambiente sensibili:

1. Settings → Secrets and variables → Actions
2. New repository secret
3. Nome: `REACT_APP_API_URL`
4. Valore: `https://surio.ddns.net:4000`
5. Aggiorna workflow per usarle:

```yaml
- name: Build
  run: CI=false npm run build
  env:
    REACT_APP_API_URL: ${{ secrets.REACT_APP_API_URL }}
```
