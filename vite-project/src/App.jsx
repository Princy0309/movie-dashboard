import { useState, useEffect } from 'react';
import './App.css';
import { genres } from './constants.js';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function App() {
  const [movies, setMovies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [selectedMovie, setSelectedMovie] = useState(null);

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
        <div>
          <input
            type="text"
            placeholder="search for a movie..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

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
              <div key={movie.id} className="movie-card" onClick={() => handleMovieClick(movie)}>
                <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="movie-poster" />
                <div className="movie-genres">
                  {movie.genre_ids && movie.genre_ids.slice(0, 2).map(id => (
                    genres[id] && <span key={id} className="genre-tag">{genres[id]}</span>
                  ))}
                </div>
                <h3>{movie.title}</h3>
                <p className="movie-rating">Rating: ⭐ {movie.vote_average.toFixed(1)}</p>
                <p className="movie-release-date">Release Date: {movie.release_date}</p>
                <p className="movie-overview">{movie.overview ? movie.overview.slice(0, 100) + '...' : 'No description available.'}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-result-found">
            <p>🍿No movies found matching "{searchTerm}". Try another title!</p>
          </div>
        )}
      </div>

      {/* Modal is now a sibling to the app-container */}
      {selectedMovie && (
        <div className="black-bg-touched" onClick={() => setSelectedMovie(null)}>
          <div className="modal-content-touched" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedMovie(null)}>x</button>
            <div className="modal-body-structure">
              <img src={`https://image.tmdb.org/t/p/w500${selectedMovie.poster_path}`} alt={selectedMovie.title} className="modal-movie-poster" />
              <div className="modal-info">
                <h2>{selectedMovie.title}</h2>
                <div className="modal-stats">
                  <p><strong>Rating:</strong> ⭐ {selectedMovie.vote_average?.toFixed(1)} / 10 ({selectedMovie.vote_count} votes)</p>
                  <p><strong>Release Date:</strong> {selectedMovie.release_date}</p>
                  <p><strong>Runtime:</strong> {selectedMovie.runtime ? `${selectedMovie.runtime} mins` : 'N/A'}</p>
                  <p><strong>Popularity Score:</strong> {selectedMovie.popularity?.toFixed(0)}</p>
                  <p><strong>Language:</strong> {selectedMovie.original_language?.toUpperCase()}</p>
                </div>
                <h3>Overview</h3>
                <p className="modal-overview-text">{selectedMovie.overview || "No overview available."}</p>
                <div className="modal-genres">
                  {selectedMovie.genres ? (
                    selectedMovie.genres.map(g => <span key={g.id} className="genre-tag">{g.name}</span>)
                  ) : (
                    selectedMovie.genre_ids?.map(id => genres[id] && <span key={id} className="genre-tag">{genres[id]}</span>)
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default App;