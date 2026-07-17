export default function MovieCard({id, movie, genres, handleMovieClick, watchlist, toggleWatchlist}) {
    return(
        <div key={movie.id} className="movie-card" onClick={() => handleMovieClick(movie)}>
                        <img src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`} alt={movie.title} className="movie-poster" />
                        <div className="movie-genres">
                          {movie.genre_ids && movie.genre_ids.slice(0, 2).map(id => (
                            genres[id] && <span key={id} className="genre-tag">{genres[id]}</span>
                          ))}
                        </div>
                        <h3>{movie.title}</h3>
                        <p className="movie-rating">Rating: ⭐ {movie.vote_average.toFixed(1)}</p>
                        
                        {/* Watchlist Button in Grid */}
                        <button 
                          className={`watchlist-btn ${watchlist.find(m => m.id === movie.id) ? 'active' : ''}`}
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(movie); }}
                        >
                          {watchlist.find(m => m.id === movie.id) ? '❤️' : '🤍'}
                        </button>
                      </div>

    )
}