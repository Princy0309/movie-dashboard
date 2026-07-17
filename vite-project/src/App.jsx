import { useState, useEffect } from 'react';
import './App.css';
import { genres } from './constants.js';
import MovieCard from './MovieCard.jsx';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedMovie, setSelectedMovie] = useState(null);
  
  // Initialize from 'myWatchlist' to match your toggleWatchlist logic
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
    <>
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

        {sortedMovies.length > 0 ? (
          <div className="movie-grid">
            {sortedMovies.map(movie => (
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
            <p>🍿No movies found matching "{searchTerm}". Try another title!</p>
          </div>
        )}
      </div>

      {selectedMovie && (
        <div className="black-bg-touched" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content-touched" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedMovie(null)}>x</button>
            <div className="modal-body-structure">
              <img src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`} alt={selectedMovie.title} className="modal-movie-poster" />
              <div className="modal-info">
                <h2>{selectedMovie.title}</h2>
                <div className="modal-stats">
                  <p><strong>Rating:</strong> ⭐ {selectedMovie.vote_average?.toFixed(1)}</p>
                  {/* Watchlist Button in Modal */}
                  <button 
                    className={`watchlist-btn ${watchlist.find(m => m.id === selectedMovie.id) ? 'active' : ''}`}
                    onClick={() => toggleWatchlist(selectedMovie)}
                  >
                    {watchlist.find(m => m.id === selectedMovie.id) ? '❤️ Remove from Watchlist' : '🤍 Add to Watchlist'}
                  </button>
                </div>
                <h3>Overview</h3>
                <p>{selectedMovie.overview}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;