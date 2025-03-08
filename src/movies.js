const fs = require('fs');
const { parse } = require('csv-parse/sync');

function readMovies(filePath) {
    // Read the entire file
    const content = fs.readFileSync(filePath, 'utf8');
    // Remove any comment lines (lines starting with "//") and empty lines
    const filteredLines = content
        .split('\n')
        .filter(line => !line.trim().startsWith('//') && line.trim() !== '')
        .join('\n');

    // Parse the CSV with header
    const records = parse(filteredLines, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
    });

    return records;
}

module.exports = { readMovies };