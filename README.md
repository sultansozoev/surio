## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm run build

# Deploy to GitHub Pages
npm run deploy
```

## Deployment

The project is configured for GitHub Pages with custom domain support.

### Deploy Steps

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to GitHub Pages**:
   ```bash
   npm run deploy
   ```

3. **Configure GitHub Pages**:
   - Go to: Repository → Settings → Pages
   - Source: `gh-pages` branch
   - Custom domain: `surio.me`
   - Save and wait for deployment (1-2 minutes)

### Important Files for Deployment

- `public/404.html` - Handles SPA routing on GitHub Pages
- `public/CNAME` - Custom domain configuration
- `public/.nojekyll` - Disables Jekyll processing
- Script in `public/index.html` - Restores proper routes

## Troubleshooting

### 404 Errors on Page Refresh

If you get 404 errors when refreshing on routes like `/request` or `/series`:

1. Verify files exist in `gh-pages` branch:
   ```bash
   git checkout gh-pages
   ls -la | grep -E "(404|CNAME|nojekyll)"
   git checkout main
   ```

2. Re-deploy with dotfiles:
   ```bash
   npm run deploy
   ```

3. See [TROUBLESHOOTING-404.md](./TROUBLESHOOTING-404.md) for detailed solutions

## Environment Variables

Create a `.env` file in the root:

```env
REACT_APP_API_URL=https://surio.ddns.net:4000
```

## Documentation

- [Deployment Guide](./DEPLOY.md)
- [404 Troubleshooting](./TROUBLESHOOTING-404.md)

## Tech Stack

- React 19
- React Router v7
- Tailwind CSS
- Lucide Icons
- Plyr (Video Player)

surio/
├── public/
│   ├── index.html
│   ├── favicon.ico
│   ├── manifest.json
│   └── robots.txt
│
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Input.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Spinner.jsx
│   │   │
│   │   ├── layout/
│   │   │   ├── Navbar.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── home/
│   │   │   ├── Hero.jsx
│   │   │   ├── ContentRow.jsx
│   │   │   └── ContinueWatching.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── content/
│   │   │   └── ContentCard.jsx
│   │   │
│   │   └── search/
│   │       ├── SearchBar.jsx
│   │       ├── SearchResults.jsx
│   │       ├── SearchFilters.jsx
│   │       └── SearchSuggestions.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Movies.jsx
│   │   ├── Series.jsx
│   │   ├── MyList.jsx
│   │   ├── Search.jsx
│   │   ├── Watch.jsx
│   │   └── NotFound.jsx
│   │
│   ├── context/
│   │   └── AuthContext.jsx
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useContent.js
│   │   ├── useLocalStorage.js
│   │   └── useDebounce.js
│   │
│   ├── services/
│   │   ├── api.js
│   │   ├── auth.service.js
│   │   └── content.service.js
│   │
│   ├── styles/
│   │   ├── index.css
│   │   └── animations.css
│   │
│   ├── App.jsx
│   └── index.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md
