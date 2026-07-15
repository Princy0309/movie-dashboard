import { useState, useEffect } from 'react';
import './App.css';
import { genres } from './constants.js';

const API_KEY = import.meta.env.VITE_TMDB_API_KEY;

function App() {

  const [movies, setMovies] = useState([]);

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {

    let url = `https://api.themoviedb.org/3/movie/popular?api_key=${API_KEY}`;

    if (searchTerm) {
      url = `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(searchTerm)}`;
    }


    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.results) {
          setMovies(data.results);
        }

      })
      .catch(err => console.error('Error fetching movies:', err));
  }, [searchTerm]);

  return (
    <div classname="app-container">
      <h1>Movie dashboard</h1>
      <div>
        <input
          type='text'
          placeholder='search for a movie...'
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        ></input>
      </div>

      {movies.length > 0 ? (<div className="movie-grid">
        {movies.map(movie => (
          <div key={movie.id} className="movie-card">
            <img
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              className="movie-poster"
            />
           
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
        <div className = "no-result-found">
          <p>🍿No movies found matching "{searchTerm}".Try another title!</p> 
        </div>
      )}
    </div>
  )
}

export default App;