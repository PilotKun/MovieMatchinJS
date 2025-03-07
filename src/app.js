const { readMovies } = require('./movies');
const { getTmdbId } = require('./tmdb');
const { getLetterboxdRatings } = require('./letterboxd');
const XLSX = require('xlsx'); // You can later convert CSV to XLSX if needed
const fs = require('fs');
const path = require('path');
const pLimit = require('p-limit').default;
// const { HttpsProxyAgent } = require('https-proxy-agent');

// Configure your proxy URL here (replace with your actual proxy address and port)
// const proxyUrl = 'http://222.252.194.204:8080';
// const proxyAgent = new HttpsProxyAgent(proxyUrl, { rejectUnauthorized: false });

const FILTERED_MOVIES_FILE = "C:\\Users\\DELL\\Coding\\MovieMatchinJS\\src\\databaseResults\\filtered_movies.tsv";
// We'll write incremental results to a CSV file
const OUTPUT_CSV = path.join(__dirname, 'databaseResults', 'incremental_results.csv');

const MAX_CONCURRENT = 10;
const limit = pLimit(MAX_CONCURRENT);

// Function to write a result to CSV (writing header if needed)
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

async function processMovie(movie, index, total) {
    const imdbId = movie.tconst;
    const tmdbId = await getTmdbId(imdbId);
    if (tmdbId) {
        const { ratingValue, ratingCount, letterboxdUrl } = await getLetterboxdRatings(tmdbId);
        console.log(`${index + 1}/${total} | IMDb ID: ${imdbId} | Letterboxd Avg Rating: ${ratingValue} | Ratings: ${ratingCount}`);
        return {
            "IMDb ID": imdbId,
            "Primary Title": movie.primaryTitle,
            "Original Title": movie.originalTitle,
            "Year": movie.startYear,
            "IMDb Rating": movie.averageRating,
            "IMDb Votes": movie.numVotes,
            "Letterboxd Avg Rating": ratingValue,
            "Letterboxd Rating Count": ratingCount,
            "Letterboxd URL": letterboxdUrl
        };
    }
    return null;
}

async function main() {
    try {
        // Remove the file if it exists to start fresh
        if (fs.existsSync(OUTPUT_CSV)) {
            fs.unlinkSync(OUTPUT_CSV);
        }
        const movies = await readMovies(FILTERED_MOVIES_FILE);
        const total = movies.length;
        let headerWritten = false;
        const promises = movies.map((movie, index) =>
            limit(async () => {
                const result = await processMovie(movie, index, total);
                // 500ms delay to help prevent rate limiting
                await new Promise(resolve => setTimeout(resolve, 500));
                if (result) {
                    headerWritten = writeResultToCsv(result, headerWritten);
                }
            })
        );
        await Promise.all(promises);

        console.log(`\nProcessing Complete. Incremental CSV results saved to ${OUTPUT_CSV}`);
    } catch (err) {
        console.error("Error processing movies:", err);
    }
}

main();