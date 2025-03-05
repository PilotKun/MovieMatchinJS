const axios = require('axios');
const cheerio = require('cheerio');

async function getLetterboxdRatings(tmdbId, options = {}) {
    const { proxyAgent } = options;
    const letterboxdUrl = `https://letterboxd.com/tmdb/${tmdbId}/`;
    try {
        const axiosOptions = proxyAgent ? { httpAgent: proxyAgent, httpsAgent: proxyAgent } : {};
        const response = await axios.get(letterboxdUrl, axiosOptions);
        if (response.status === 200) {
            const $ = cheerio.load(response.data);
            let ratingValue = 0;
            let ratingCount = 0;
            let targetScript;
            $('script').each((i, el) => {
                const scriptContent = $(el).html();
                if (scriptContent && scriptContent.includes("aggregateRating")) {
                    targetScript = scriptContent;
                    return false;
                }
            });
            if (targetScript) {
                try {
                    // Extract JSON data from the script tag
                    const jsonText = targetScript.split("/* <![CDATA[ */").pop().split("/* ]]> */")[0];
                    const jsonData = JSON.parse(jsonText);
                    ratingValue = jsonData.aggregateRating?.ratingValue || 0;
                    ratingCount = jsonData.aggregateRating?.ratingCount || 0;
                } catch (e) {
                    console.error(`Error parsing Letterboxd ratings for TMDb ID ${tmdbId}:`, e.message);
                }
            }
            return { ratingValue, ratingCount, letterboxdUrl };
        }
    } catch (err) {
        console.error(`Error fetching Letterboxd data for TMDb ID ${tmdbId}:`, err.message);
    }
    return { ratingValue: 0, ratingCount: 0, letterboxdUrl };
}

module.exports = { getLetterboxdRatings };