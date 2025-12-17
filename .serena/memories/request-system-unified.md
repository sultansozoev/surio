# Surio React - Sistema Richieste Unificato

## Panoramica
Sistema completo per richiedere e gestire film e serie TV non ancora presenti su Surio.

## Architettura Unificata
Il sistema usa **due pagine principali** invece di tre separate:
1. **RequestContent** (`/request`) - Per cercare e richiedere nuovi contenuti
2. **RequestsPage** (`/requests`) - Pagina unificata con tabs per vedere tutte le richieste o solo le proprie

## API Backend

### Aggiunta Richieste
- `POST /addList` - Aggiunge una nuova richiesta
  - Body: { user_id, year, poster, vote_average, req_id, type, title }
  - Risposte: success, "ER_DUP_ENTRY" (già richiesto), "Record exists" (già presente)

### Visualizzazione Richieste
- `POST /getList` - Ottiene richieste del singolo utente
  - Body: { user_id }
  - Response: array di richieste dell'utente
  
- `POST /getAllList` - Ottiene TUTTE le richieste di tutti gli utenti
  - Body: { user_id }
  - Response: array con tutte le richieste (include campo `username`)

### Gestione Richieste
- `POST /elimina` - Elimina una richiesta
  - Body: { list_id, user_id, request_id }

### Verifica Disponibilità
- `POST /checkAvailability` - Controlla se contenuto richiesto è già disponibile
  - Body: { request_id, type }
  - Response: { available: boolean, message: string }
  - Controlla presenza in tabelle `movie` o `serie_tv`

## Pagine

### 1. RequestContent (`/request`)
**Scopo:** Cercare e richiedere nuovi contenuti

**Funzionalità:**
- Ricerca in tempo reale con debounce (500ms)
- Integrazione API TMDB: `GET https://api.themoviedb.org/3/search/multi`
- Card interattive con click diretto per richiedere
- Stati visivi: normale → loading → successo (3 sec) / errore
- Feedback immediato inline (senza modal)

**Design:**
- Grid responsive (2-6 colonne)
- Card con poster TMDB
- Badge tipo: Film (blu) / Serie TV (rosso)
- Badge voto con gradiente: verde (7.5+) / giallo (6-7.5) / rosso (<6)
- Hover: zoom + info + effetto shine
- Click diretto sulla card per richiedere

### 2. RequestsPage (`/requests`) - UNIFICATA
**Scopo:** Visualizzare e gestire tutte le richieste con sistema di tabs

**Tabs:**
- **"Tutte le Richieste"** - Community (usa `/getAllList`)
  - Mostra tutte le richieste di tutti gli utenti
  - Mostra username dell'autore della richiesta
  - Ordinamento include opzione "Utente"
  
- **"Le Mie Richieste"** - Personali (usa `/getList`)
  - Mostra solo le richieste dell'utente loggato
  - Nasconde campo username
  - Ordinamento esclude opzione "Utente"

**Funzionalità Comuni:**
- **Filtro tipo**: Tutti / Film / Serie TV
- **Filtro disponibilità**: Tutti / Disponibili / Non Disponibili
- **Ordinamento**: Data / Titolo / Valutazione / Utente (solo tab "Tutte")
- **Verifica automatica disponibilità**: controllo in tempo reale per ogni richiesta
- **Click per guardare**: card cliccabili se contenuto disponibile → apre player
- **Eliminazione richieste** con permessi:
  - **Admin**: può eliminare TUTTE le richieste (in entrambi i tab)
  - **Utente normale**: può eliminare SOLO le proprie richieste (solo in tab "Le Mie")
- Contatore richieste su badge del tab attivo
- Stato tab salvato in localStorage
- Badge "MIA" su richieste proprie nel tab "Tutte"

**Design:**
- Tabs style (come MyList: Preferiti / Continua a Guardare)
- Grid responsive (2-6 colonne)
- Card compatte stile streaming
- Badge tipo e voto con gradienti
- Badge "MIA" viola per richieste proprie in tab "Tutte"
- **Badge "DISPONIBILE"** verde con animazione pulse al centro top
  - CheckCircle + "DISPONIBILE" + ExternalLink icon
  - Visibile sempre, non solo su hover
  - Indica che il contenuto è già sul sito
- Username visibile solo in tab "Tutte"
- **Card cliccabili** se contenuto disponibile:
  - Click → apre `/watch/{type}/{id}`
  - Cursor pointer su disponibili
  - Messaggio "Clicca per guardare!" su hover
- Pulsante elimina su hover (solo se hai permessi)
  - Admin: vede sempre il pulsante su tutte le richieste
  - User: vede solo su proprie richieste nel tab "Le Mie"
- Empty state con CTA "Richiedi Contenuti" (solo tab "Le Mie")

**Permessi Eliminazione:**
```javascript
canDelete = user.isAdmin || (activeTab === 'mine' && request.user_id === user.user_id)
```
- **Admin**: può eliminare qualsiasi richiesta in entrambi i tab
- **Utente**: può eliminare solo le proprie richieste, e solo nel tab "Le Mie"
- Nel tab "Tutte", utenti normali NON vedono pulsante elimina (nemmeno sulle proprie)
- Badge "MIA" aiuta a identificare le proprie richieste nel tab "Tutte"

## Integrazione UI

### Navbar
Link per utenti autenticati:
- **"Richiedi"** → `/request` (cerca e richiedi)
- **"Richieste"** → `/requests` (visualizza con tabs)

Presenti in:
- Navbar principale desktop
- Menu profilo mobile
- Menu hamburger

### Routing
```javascript
/request → RequestContent (ricerca e richiesta)
/requests → RequestsPage (visualizzazione unificata con tabs)
```

## Vantaggi Architettura Unificata

### User Experience
- ✅ Meno navigazione tra pagine
- ✅ Context switching più chiaro (tabs vs pages)
- ✅ Un solo posto per tutte le richieste
- ✅ Più coerente con pattern MyList

### Codice
- ✅ Meno duplicazione
- ✅ Logica condivisa tra tabs
- ✅ Manutenzione semplificata
- ✅ Single source of truth per filtri/ordinamento

### Pattern
```
MyList: Preferiti | Continua a Guardare
Requests: Tutte | Le Mie
```

## Pattern di Design

### Colori Badge
- **Film**: blu (`bg-blue-600/90`)
- **Serie TV**: rosso (`bg-red-600/90`)
- **Voto**: gradiente verde/giallo/rosso

### Stati Interattivi
- Hover: scale-105, shadow aumentato
- Active tab: border-bottom rosso + badge con contatore
- Empty state: icona + messaggio + CTA

### Responsive
- Mobile: 2 colonne
- Tablet: 3-4 colonne
- Desktop: 5-6 colonne

## Note Tecniche

### State Management
- `activeTab`: salvato in localStorage (`useLocalStorage`)
- `availabilityStatus`: oggetto con stato disponibilità per ogni richiesta
  - Key: `${type}-${request_id}`
  - Value: boolean (true = disponibile)
- Cambiamento tab → refetch automatico + check disponibilità
- Stati separati per loading/error per tab
- Check disponibilità parallelizzato per tutte le richieste alla fetch

### Performance
- Debounce ricerca: 500ms
- Lazy loading immagini
- Memoization filtri/ordinamento

### Sicurezza
- Routes protette (solo autenticati)
- CORS credentials: 'include'
- Auth headers da authService

## File Struttura
```
src/pages/
  ├── RequestContent.jsx    # Ricerca e richiesta
  └── AllRequestsList.jsx   # Visualizzazione unificata (export: RequestsPage)

src/hooks/
  └── useLocalStorage.js    # Per persistere tab attivo
```

## Miglioramenti Futuri
- Paginazione per liste lunghe
- Filtro per username in tab "Tutte"
- Sistema di voti/priorità richieste
- Notifiche quando richiesta soddisfatta
- Badge "Nuova" su richieste recenti
- Statistiche (più richiesti, trending)
