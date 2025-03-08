const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'ENTER_YOR_OWN_VALID_API_KEY_HERE';

async function getTmdbId(imdbId) {
    try {
        const url = `https://api.themoviedb.org/3/find/${imdbId}`;
        const params = {
            api_key: TMDB_API_KEY,
            external_source: 'imdb_id'
        };
        const response = await axios.get(url, { params });
        const { movie_results } = response.data;
        if (movie_results && movie_results.length > 0) {
            return movie_results[0].id;
        }
        return null;
    } catch (err) {
        console.error(`Error fetching TMDB ID for IMDb ID ${imdbId}:`, err.response.status);
        return null;
    }
}

module.exports = { getTmdbId };