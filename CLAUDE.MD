# Surio React - Claude AI Development Guide

## Project Overview

**Surio** is a modern Netflix-like streaming platform built with React that enables users to browse, search, and watch movies and TV series. The standout feature is **Surio Party** - a synchronized watch-party system where multiple users can watch content together in real-time with integrated chat functionality.

- **Homepage:** https://surio.me
- **Version:** 1.0.0
- **Tech Stack:** React 19.2.0, Socket.IO, Tailwind CSS
- **Primary Language:** Italian (UI text, comments)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (port 3000)
npm start

# Build for production
npm run build
```

## Architecture Overview

### Technology Stack

- **Frontend Framework:** React 19.2.0 with React DOM
- **Routing:** React Router DOM 7.9.4 (HashRouter)
- **State Management:** React Context API (AuthContext, PartyContext)
- **Real-time Communication:** Socket.IO 4.8.1
- **Styling:** Tailwind CSS 3.4.1 + custom CSS animations
- **UI Components:** Lucide React (icons), Framer Motion (animations)
- **HTTP Client:** Axios 1.13.2
- **Video Player:** Plyr 3.8.3 + custom player
- **Carousel:** Swiper 12.0.2
- **Build Tool:** React Scripts 5.0.1 (Create React App)

### Directory Structure

```
src/
├── components/          # Reusable UI components
│   ├── auth/           # LoginModal, ProtectedRoute
│   ├── common/         # Button, Modal, Spinner, Input
│   ├── content/        # Content display components
│   ├── home/           # Hero, ContentRow, ContinueWatching
│   ├── layout/         # Layout, Navbar, ContentPageLayout
│   ├── party/          # SyncedPlayer, PartyChat, PartyControls
│   └── search/         # Search components
├── pages/              # Page-level components
│   ├── Home.jsx        # Landing page with content rows
│   ├── Movies.jsx      # Movies listing page
│   ├── Series.jsx      # TV series listing page
│   ├── Watch.jsx       # Video player with party creation
│   ├── Party.jsx       # Synchronized watch-party page
│   ├── Search.jsx      # Search results page
│   └── MyList.jsx      # User favorites
├── context/            # Global state management
│   ├── AuthContext.jsx # Authentication & JWT management
│   └── PartyContext.jsx # Party state & Socket.IO
├── hooks/              # Custom React hooks
│   ├── useAuth.js      # Auth context consumer
│   ├── useFetch.js     # Data fetching with caching
│   ├── useContentPage.js # Content listing logic
│   ├── useLocalStorage.js # Persistent state
│   ├── useDebounce.js  # Search debouncing
│   └── useParty.js     # Party context consumer
├── services/           # API communication
│   ├── api.js          # Base API service class
│   ├── auth.services.js # Auth API calls
│   ├── content.service.js # Content fetching
│   └── party.service.js # Socket.IO client
├── config/            # Configuration
├── utils/             # Utility functions
└── App.jsx            # Main router setup
```

### Routing Structure

```
HashRouter
├── Public Routes
│   ├── / (Home)
│   ├── /movies (Movies listing)
│   ├── /series (Series listing)
│   ├── /search (Search results)
│   └── /login (Login page)
├── Protected Routes (authentication required)
│   ├── /watch/:type/:id (Video player)
│   ├── /party/:code? (Party sync watch)
│   ├── /my-list (Favorites)
│   ├── /request (Request content)
│   └── /requests (View all requests)
└── Error Routes
    └── * (404 Not Found)
```

## Core Features

### 1. Authentication System
- **Location:** `src/context/AuthContext.jsx`
- Cookie-based JWT authentication
- Token expiration checking
- User role detection (Admin status)
- Automatic logout on token expiration
- Session persistence (30-day cookie expiry)

### 2. Content Discovery
- Trending content
- Most voted content
- Recently added content
- Content by genre
- Full-text search with debouncing
- Pagination and sorting (popularity, votes, release date, title)

### 3. Video Player
- **Location:** `src/pages/Watch.jsx`
- Play/pause/seek controls
- Variable playback speed (0.5x - 2x)
- Volume control
- Subtitle support
- Full-screen mode
- Progress tracking and auto-resume
- Keyboard shortcuts
- Gesture controls (swipe for seek/volume)

### 4. Surio Party (Watch-Party Feature)
- **Location:** `src/pages/Party.jsx`, `src/components/party/`
- Host creates party with unique code
- Real-time video synchronization via Socket.IO
- Integrated chat with message history
- Emoji reactions at specific timestamps
- Participant list with status indicators
- Host controls (play/pause/seek/speed for all participants)

**Socket.IO Events:**
- `party-joined` - User joins party
- `user-joined` / `user-left` - Participant tracking
- `player-play` / `player-pause` / `player-seek` - Sync controls
- `player-speed-changed` - Speed synchronization
- `user-buffering` - Buffering indicators
- `new-message` - Chat messages
- `new-reaction` - Emoji reactions
- `party-ended` - Party termination

### 5. Continue Watching
- Tracks user progress in videos
- Stores playback timestamp
- Auto-resumes from last position
- Displays unwatched progress

### 6. Favorites/My List
- Add/remove from favorites
- Persistent storage via backend
- Quick access to preferred content

## Development Patterns

### Custom Hooks
- **useFetch:** Generic data fetching with caching (5-minute TTL)
- **useAuth:** Auth context consumer
- **useContentPage:** Encapsulates pagination, filtering, sorting
- **useLocalStorage:** Persistent state wrapper
- **useDebounce:** Debounced search input

### API Service Pattern
- Base `ApiService` class with REST methods: `get()`, `post()`, `put()`, `delete()`
- Centralized error handling
- Authorization header injection
- JSON response validation

### State Management
- **AuthContext** for global user authentication state
- **PartyContext** for party session management
- Context API with Provider/Consumer pattern
- Custom hooks for context consumption

### Component Organization
- Feature-based structure (components grouped by feature)
- Separation of concerns (logic in hooks, UI in components)
- Reusable components: Button, Modal, Card, Input, Spinner
- Composition over props drilling

### Styling Approach
- Tailwind CSS for utility-first styling
- Custom CSS animations (`src/styles/animations.css`)
- Responsive design (mobile-first)
- Dark theme (Netflix-inspired)

## API Integration

**Base URL:** `https://surio.ddns.net:4000` (configurable via `REACT_APP_API_URL`)

### Key Endpoints
- **Authentication:** `/login`, `/isAdmin`
- **Content:** `/getTrending`, `/getVoted`, `/getLastAdded`, `/getGenres`, `/getMoviesByGenre`, `/getTVByGenre`, `/search`
- **Progress:** `/setPlayerTime`, `/getPlayerTime`
- **Party:** `/party/create`, `/party/:code`, `/party/:id/end`, `/party/:id/messages`, `/party/active`, `/party/user/active`
- **WebSocket:** Socket.IO namespace for real-time party events

## Key Files Reference

| File | Purpose |
|------|---------|
| `App.jsx` | Main router setup, route definitions, ProtectedRoute wrapper |
| `AuthContext.jsx` | Authentication state, login/logout, JWT management |
| `PartyContext.jsx` | Party state, Socket.IO event orchestration |
| `api.js` | Base API client with CRUD methods |
| `party.service.js` | Socket.IO client for party synchronization |
| `content.service.js` | Content fetching and normalization |
| `Watch.jsx` | Advanced video player with party creation |
| `Party.jsx` | Party UI with player sync and chat |
| `useFetch.js` | Generic data fetching hook with caching |
| `useContentPage.js` | Content listing logic (filtering, sorting, pagination) |
| `Layout.jsx` | Main layout wrapper with navbar/footer |

## Performance Optimizations

- **Caching:** Data caching with configurable TTL in useFetch
- **Lazy Loading:** Code splitting with React Router
- **Request Cancellation:** Abort controllers prevent stale updates
- **Debouncing:** Search input debouncing (300ms)
- **Socket.IO:** Efficient real-time communication for party sync

## Security Considerations

- JWT token validation
- Token expiration checking
- Protected routes with authentication guards
- Authorization header injection
- HTTPOnly cookie support (30-day expiry)
- CORS credentials included in requests

## Common Development Tasks

### Adding a New Page
1. Create component in `src/pages/`
2. Add route in `App.jsx` (wrap with `ProtectedRoute` if authentication required)
3. Add navigation link in `Navbar.jsx` if needed

### Adding a New API Endpoint
1. Add method to appropriate service file in `src/services/`
2. Use existing `ApiService` base class methods
3. Handle errors and transform data as needed

### Modifying Player Behavior
- Core player logic: `src/pages/Watch.jsx`
- Synced player for parties: `src/components/party/SyncedPlayer.jsx`
- Player controls: Look for event handlers in respective files

### Adding Socket.IO Events
1. Define event handler in `PartyContext.jsx`
2. Register listener in `useEffect` with socket connection
3. Emit events from appropriate components using `partyService.emit()`

## Recent Development History

- Enhanced party player experience
- Removed navigation bar from party view for immersive watching
- UI polish and bug fixes
- Party feature refinements

## Code Style Notes

- **Language:** Italian comments and UI text throughout codebase
- **Component Structure:** Functional components with hooks
- **State Updates:** Prefer functional updates for state setters
- **Error Handling:** Try-catch blocks with console logging
- **Naming:** camelCase for variables/functions, PascalCase for components

## Testing

```bash
npm test  # Run tests (React Scripts test runner)
```

## Deployment

```bash
npm run build      # Create production build
npm run postbuild  # Run post-build checks
```

Build outputs to `build/` directory. Application uses HashRouter for client-side routing compatibility.

## Environment Variables

- `REACT_APP_API_URL` - Backend API base URL (default: https://surio.ddns.net:4000)

## Troubleshooting

### Common Issues

1. **Socket.IO Connection Failures**
   - Check backend server status
   - Verify CORS configuration
   - Check network/firewall settings

2. **Authentication Issues**
   - Check cookie settings (30-day expiry)
   - Verify JWT token format
   - Check token expiration

3. **Video Player Issues**
   - Verify video source URL format
   - Check Plyr configuration
   - Review player event handlers

4. **Party Sync Issues**
   - Verify Socket.IO connection status
   - Check event emission/listening
   - Review server-side party state management

## Additional Resources

- React Documentation: https://react.dev
- Socket.IO Documentation: https://socket.io/docs/
- Tailwind CSS: https://tailwindcss.com/docs
- Plyr Player: https://plyr.io

---

**Last Updated:** 2026-01-24
