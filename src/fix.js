const fs = require("fs");
const csvParser = require("csv-parser");
const readline = require("readline");
const { stringify } = require("csv-stringify/sync");

// File paths
const tsvFile = "C:\\Users\\DELL\\Coding\\MovieMatchinJS\\database\\title.ratings.tsv"; // Your TSV database
const csvInputFile = "C:\\Users\\DELL\\Coding\\MovieMatchinJS\\src\\incremental_results.csv"; // Your output file
const csvOutputFile = "fixed_results.csv"; // Final fixed output file

// Step 1: Read TSV and create a lookup map
async function loadVotesFromTSV() {
    return new Promise((resolve, reject) => {
        const votesMap = new Map();
        const rl = readline.createInterface({
            input: fs.createReadStream(tsvFile),
            crlfDelay: Infinity,
        });

        let isHeader = true;
        rl.on("line", (line) => {
            if (isHeader) {
                isHeader = false; // Skip header line
                return;
            }
            const [tconst, , numVotes] = line.split("\t"); // Extract tconst and numVotes
            if (tconst && numVotes) votesMap.set(tconst, numVotes);
        });

        rl.on("close", () => resolve(votesMap));
        rl.on("error", (err) => reject(err));
    });
}

// Step 2: Update CSV file using the votes map
async function updateCSV() {
    const votesMap = await loadVotesFromTSV();
    const results = [];
    const headers = [];

    fs.createReadStream(csvInputFile)
        .pipe(csvParser())
        .on("headers", (headerList) => {
            headers.push(...headerList);
        })
        .on("data", (row) => {
            if (votesMap.has(row["IMDb ID"])) {
                row["IMDb Votes"] = votesMap.get(row["IMDb ID"]); // Update IMDb Votes column
            }
            results.push(row);
        })
        .on("end", () => {
            // Write new CSV
            const csvData = stringify(results, { header: true, columns: headers });
            fs.writeFileSync(csvOutputFile, csvData);
            console.log(`✅ Fixed CSV saved as ${csvOutputFile}`);
        });
}

// Run the update function
updateCSV().catch(console.error);
