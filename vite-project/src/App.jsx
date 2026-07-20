import { useState, useEffect } from 'react';
import './App.css';
import { genres } from './constants.js';
import MovieCard from './MovieCard.jsx';
import MovieModal from './MovieModal.jsx';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showWatchListOnly, setShowWatchListOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');
  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('myWatchlist');
    return saved ? JSON.parse(saved) : [];
  });

  // 1. Debounce Effect
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // 2. Data Fetching Effect
  useEffect(() => {
    setLoading(true);
    const url = debouncedSearchTerm
      ? `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(debouncedSearchTerm)}&page=${page}`
      : `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}&page=${page}`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        const results = data.results || [];
        setMovies((prev) => (page === 1 ? results : [...prev, ...results]));
      })
      .catch((err) => {
        console.error('Error fetching movies:', err);
        if (page === 1) setMovies([]);
      })
      .finally(() => setLoading(false));
  }, [debouncedSearchTerm, page]);

  // 3. Intersection Observer Effect
  useEffect(() => {
    if (debouncedSearchTerm) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1.0 }
    );

    const target = document.querySelector('#scroll-sentinel');
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [loading, debouncedSearchTerm]);

  // Theme Management
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleWatchlist = (movie) => {
    setWatchlist((prev) => {
      const exists = prev.find((m) => m.id === movie.id);
      const newList = exists ? prev.filter((m) => m.id !== movie.id) : [...prev, movie];
      localStorage.setItem('myWatchlist', JSON.stringify(newList));
      return newList;
    });
  };

  const sortedMovies = [...movies].sort((a, b) => {
    if (sortBy === 'title-asc') return a.title.localeCompare(b.title);
    if (sortBy === 'title-desc') return b.title.localeCompare(a.title);
    if (sortBy === 'rating-asc') return a.vote_average - b.vote_average;
    if (sortBy === 'rating-desc') return b.vote_average - a.vote_average;
    return 0;
  });

  const stats = (() => {
    if (watchlist.length === 0) return null;
    const avgRating = (watchlist.reduce((sum, m) => sum + m.vote_average, 0) / watchlist.length).toFixed(1);
    const genreCounts = watchlist.reduce((acc, m) => {
      m.genre_ids?.forEach(id => { const g = genres[id]; if (g) acc[g] = (acc[g] || 0) + 1; });
      return acc;
    }, {});
    return { avgRating, genreCounts };
  })();

  return (
    <div className="app-container">
      <h1>Movie dashboard</h1>
      <input type="text" placeholder="search for a movie..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
      <select className="sort-dropdown" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="default">Sort movies by...</option>
        <option value="title-asc">Title (A-Z)</option>
        <option value="title-desc">Title (Z-A)</option>
        <option value="rating-asc">Rating (Low to High)</option>
        <option value="rating-desc">Rating (High to Low)</option>
      </select>
      <button className="view-toggle" onClick={() => setTheme(prev => prev === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}</button>
      <button className="view-toggle" onClick={() => setShowWatchListOnly(!showWatchListOnly)}>
        {showWatchListOnly ? 'Show All Movies' : 'View Watchlist'}
      </button>

      {/* Only show stats if showWatchListOnly is true AND stats exist */}
      {showWatchListOnly && stats && (
        <div className="stats-container">
          <h3>Watchlist Statistics</h3>
          <p>Average Rating: <strong>{stats.avgRating}</strong></p>
          <div className="genre-stats">
            {Object.entries(stats.genreCounts).map(([genre, count]) => (
              <span key={genre} className="genre-badge">{genre}: {count}</span>
            ))}
          </div>
        </div>
      )}

      <div className="movie-grid">
        {(() => {
          const displayList = showWatchListOnly ? watchlist : sortedMovies;
          if (showWatchListOnly && displayList.length === 0) return <div className="no-result-found"><p>🍿 Your watchlist is empty!</p></div>;
          if (!showWatchListOnly && displayList.length === 0 && !loading) return <div className="no-result-found"><p>🍿 No movies found.</p></div>;
          return displayList.map(m => (
            <MovieCard
              key={m.id}
              movie={m}
              genres={genres}
              handleMovieClick={async (movie) => {
                try {
                  const res = await fetch(`https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}`);
                  setSelectedMovie(await res.json());
                } catch {
                  setSelectedMovie(movie);
                }
              }}
              watchlist={watchlist}
              toggleWatchlist={toggleWatchlist}
            />
          ));
        })()}

        {!showWatchListOnly && <div id="scroll-sentinel" style={{ height: '20px' }}></div>}
      </div>

      {selectedMovie && (
        <MovieModal
          selectedMovie={selectedMovie}
          watchlist={watchlist}
          toggleWatchlist={toggleWatchlist}
          onClose={() => setSelectedMovie(null)}
        />
      )}
    </div>
  );
}

export default App;