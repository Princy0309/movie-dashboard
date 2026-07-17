import { useState, useEffect } from 'react';
import './App.css';
import { genres } from './constants.js';
import MovieCard from './MovieCard.jsx';
import MovieModal from './MovieModal.jsx'; 

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showWatchListOnly, setShowWatchListOnly] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('app-theme') || 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

 const toggleTheme = () => {
   setTheme((prevTheme) => (prevTheme === 'dark' ? 'light' : 'dark'));
 }

  const [watchlist, setWatchlist] = useState(() => {
    const saved = localStorage.getItem('myWatchlist');
    return saved ? JSON.parse(saved) : [];
  });

  const toggleWatchlist = (movie) => {
    setWatchlist((prev) => {
      let newList;
      if (prev.find((m) => m.id === movie.id)) {
        newList = prev.filter((m) => m.id !== movie.id);
      } else {
        newList = [...prev, movie];
      }
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

  const handleMovieClick = async (movie) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${API_KEY}&language=en-US`
      );
      const detailedData = await response.json();
      setSelectedMovie(detailedData);
    } catch (err) {
      console.error('Error fetching movie details:', err);
      setSelectedMovie(movie);
    }
  };

  useEffect(() => {
    let url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;
    if (searchTerm) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}`;
    }
    fetch(url)
      .then(res => res.json())
      .then(data => { if (data.results) setMovies(data.results); })
      .catch(err => console.error('Error fetching movies:', err));
  }, [searchTerm]);

  return (
    <div className="app-container">
      <h1>Movie dashboard</h1>
      <input
        type="text"
        placeholder="search for a movie..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />

      <select className="sort-dropdown" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
        <option value="default">Sort movies by...</option>
        <option value="title-asc">Title (A-Z)</option>
        <option value="title-desc">Title (Z-A)</option>
        <option value="rating-asc">Rating (Low to High)</option>
        <option value="rating-desc">Rating (High to Low)</option>
      </select>

      <button className="view-toggle" onClick={toggleTheme}>
        Switch to {theme === 'dark' ? 'light': 'dark'} Mode
      </button>

      <button
        className="view-toggle"
        onClick={() => setShowWatchListOnly(!showWatchListOnly)}
      >
        {showWatchListOnly ? 'Show All Movies' : 'View Watchlist'}
      </button>

      {(() => {
        const moviesToDisplay = showWatchListOnly
          ? sortedMovies.filter(movie => watchlist.find(m => m.id === movie.id))
          : sortedMovies;

        return moviesToDisplay.length > 0 ? (
          <div className="movie-grid">
            {moviesToDisplay.map(movie => (
              <MovieCard
                key={movie.id}
                movie={movie}
                genres={genres}
                handleMovieClick={handleMovieClick}
                watchlist={watchlist}
                toggleWatchlist={toggleWatchlist}
              />
            ))}
          </div>
        ) : (
          <div className="no-result-found">
            <p>🍿 {showWatchListOnly ? 'Your watchlist is empty!' : `No movies found matching "${searchTerm}". Try another title!`}</p>
          </div>
        );
      })()}

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