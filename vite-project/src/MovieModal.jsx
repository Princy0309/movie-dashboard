export default function MovieModal({selectedMovie, setSelectedMovie, watchlist, toggleWatchlist}) {
    if (!selectedMovie) return null;
    return(
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


    )
}