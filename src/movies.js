const fs = require('fs');
const path = require('path');

// A simple TSV parser to read the movies file.
async function readMovies(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(filePath), 'utf8', (err, data) => {
            if (err) {
                return reject(err);
            }
            const lines = data.split('\n').filter(line => line.trim() !== '');
            // Assume first line is a header
            const header = lines.shift().split('\t');
            // Map each line to an object using header columns
            const movies = lines.map(line => {
                const values = line.split('\t');
                const obj = {};
                header.forEach((col, idx) => {
                    obj[col] = values[idx];
                });
                return obj;
            });
            resolve(movies);
        });
    });
}

module.exports = { readMovies };