## Available Scripts

In the project directory, you can run:

### `npm start`

streamflix/
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
