const axios = require('axios');

async function getTmdbId(imdbId, options = {}) {
    const { proxyAgent } = options;
    const apiKey = 'b9e715a786a5ea09e5998b8fabbb49c5';
    const url = `https://api.themoviedb.org/3/find/${imdbId}?api_key=${apiKey}&external_source=imdb_id`;
    
    try {
        const response = await axios.get(url, {
            httpAgent: proxyAgent,
            httpsAgent: proxyAgent
        });
        const data = response.data;
        // Assumes TMDB id is in the 'movie_results' array
        if (data && data.movie_results && data.movie_results.length > 0) {
            return data.movie_results[0].id;
        }
    } catch (error) {
        console.error(`Error fetching TMDB ID for IMDb ID ${imdbId}:`, error.message);
    }
    return null;
}

module.exports = { getTmdbId };