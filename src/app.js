const fs = require('fs');
const path = require('path');
const { readMovies } = require('./movies');              // Updated module now skips comment lines
const { getTmdbId } = require('./tmdb');                   // Module to fetch TMDB id from IMDb id
const { getLetterboxdRatings } = require('./letterboxd');   // Module to scrape Letterboxd movie details
const pLimit = require('p-limit').default;

const INPUT_CSV = path.join(__dirname, 'imdb3172.csv');
const OUTPUT_CSV = path.join(__dirname, 'movie_details.csv');
const MAX_CONCURRENT = 10;
const limit = pLimit(MAX_CONCURRENT);

// Helper function to write a movie result to CSV
function writeResultToCsv(result, headerWritten) {
    const header = Object.keys(result).join(',') + '\n';
    const line = Object.values(result).join(',') + '\n';
    if (!headerWritten) {
        fs.appendFileSync(OUTPUT_CSV, header + line, 'utf8');
        return true;
    } else {
        fs.appendFileSync(OUTPUT_CSV, line, 'utf8');
        return headerWritten;
    }
}

// Process one movie: look up the TMDB id from the IMDb id,
// then get Letterboxd details and return the combined result.
async function processMovie(movie, index, total) {
    // Use movie.tconst as IMDb ID (or movie.imdbId if available)
    const imdbId = movie.tconst || movie.imdbId;
    if (!imdbId) {
        console.error(`Movie at index ${index} is missing IMDb ID`);
        return null;
    }
    const tmdbId = await getTmdbId(imdbId);
    if (tmdbId) {
        const { ratingValue, ratingCount, letterboxdUrl } = await getLetterboxdRatings(tmdbId);
        console.log(`${index + 1}/${total} | IMDb ID: ${imdbId} | Letterboxd Avg Rating: ${ratingValue} | Ratings: ${ratingCount}`);
        return {
            "IMDb ID": imdbId,
            "Primary Title": movie.primaryTitle || '',
            "Original Title": movie.originalTitle || '',
            "Year": movie.startYear || '',
            "IMDb Rating": movie.averageRating || '',
            "IMDb Votes": movie.numVotes || '',
            "Letterboxd Avg Rating": ratingValue,
            "Letterboxd Rating Count": ratingCount,
            "Letterboxd URL": letterboxdUrl
        };
    }
    return null;
}

// Main function: read movies, process each, and write results incrementally to CSV.
async function main() {
    try {
        // Remove the output file if it exists to start fresh
        if (fs.existsSync(OUTPUT_CSV)) {
            fs.unlinkSync(OUTPUT_CSV);
        }
        
        const movies = readMovies(INPUT_CSV);
        const total = movies.length;
        let headerWritten = false;
        
        const promises = movies.map((movie, index) =>
            limit(async () => {
                const result = await processMovie(movie, index, total);
                // Small delay to help prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
                if (result) {
                    headerWritten = writeResultToCsv(result, headerWritten);
                }
            })
        );
        await Promise.all(promises);
        console.log(`\nProcessing complete. CSV output saved to ${OUTPUT_CSV}`);
    } catch (err) {
        console.error("Error processing movies:", err);
    }
}

main();