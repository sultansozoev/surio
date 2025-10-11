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
│   │   │   ├── Footer.jsx
│   │   │   └── Layout.jsx
│   │   │
│   │   ├── home/
│   │   │   ├── Hero.jsx
│   │   │   ├── ContentRow.jsx
│   │   │   ├── ContinueWatching.jsx
│   │   │   └── TrailerSection.jsx
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginModal.jsx
│   │   │   ├── RegisterModal.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── content/
│   │   │   ├── ContentCard.jsx
│   │   │   ├── ContentDetail.jsx
│   │   │   ├── VideoPlayer.jsx
│   │   │   └── EpisodeList.jsx
│   │   │
│   │   └── search/
│   │       ├── SearchBar.jsx
│   │       ├── SearchResults.jsx
│   │       └── SearchFilters.jsx
│   │
│   ├── pages/
│   │   ├── Home.jsx
│   │   ├── Movies.jsx
│   │   ├── Series.jsx
│   │   ├── MyList.jsx
│   │   ├── ContentDetail.jsx
│   │   ├── Watch.jsx
│   │   └── NotFound.jsx
│   │
│   ├── context/
│   │   ├── AuthContext.jsx
│   │   ├── ContentContext.jsx
│   │   └── ThemeContext.jsx
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
│   │   ├── content.service.js
│   │   └── user.service.js
│   │
│   ├── utils/
│   │   ├── constants.js
│   │   ├── helpers.js
│   │   ├── validators.js
│   │   └── formatters.js
│   │
│   ├── styles/
│   │   ├── index.css
│   │   ├── tailwind.css
│   │   └── animations.css
│   │
│   ├── routes/
│   │   └── AppRoutes.jsx
│   │
│   ├── App.jsx
│   ├── index.js
│   └── setupTests.js
│
├── .env
├── .env.example
├── .gitignore
├── package.json
├── tailwind.config.js
├── postcss.config.js
└── README.md