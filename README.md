# Movie Dashboard

A feature-rich movie discovery application built with React, featuring real-time search, watchlist management, theme toggling, and infinite scrolling.

## Features
- **Search**: Find movies in real-time.
- **Watchlist**: Save your favorite movies locally.
- **Infinite Scroll**: Browse popular movies seamlessly without manual pagination.
- **Theme Toggle**: Switch between dark and light modes for an optimal viewing experience.
- **Statistics**: View insights about your watchlist, including average ratings and genre distribution (visible within the Watchlist view).

## How to Run

1. **Clone the repository**:
   ```bash
   git clone [https://github.com/Princy0309/movie-dashboard](https://github.com/Princy0309/movie-dashboard)
   cd vite-project

2. **install dependencies**:
   ```bash
   npm install

3. **Setup environment variables**:
   - Rename the `.env.example` file in the `vite-project` folder to `.env`.
   - Go to [The Movie Database (TMDB)](https://www.themoviedb.org/) to generate your own personal API key.
   - Open your new `.env` file and replace `your_api_key_here` with your actual TMDB API key.

4. **Start the application**:
   ```bash
   npm run dev