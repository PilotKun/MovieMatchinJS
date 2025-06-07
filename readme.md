# MovieMatchinJS

MovieMatchinJS is a Node.js project that fetches TMDb IDs, scrapes Letterboxd ratings, and processes movie data by updating CSV files and generating Excel outputs. The Database is not available here I am making a new site where the results will be listed. 

## Features

- Fetches TMDb IDs using IMDb IDs and the TMDb API.
- Scrapes Letterboxd ratings for movies.
- Reads movie data from TSV files.
- Processes and updates CSV files with movie details.
- (Optional) Converts CSV output to Excel format.

## Prerequisites

- Node.js v14+ installed on your system.
- A valid [TMDb API Key](https://www.themoviedb.org/documentation/api).

## Installation

1. Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2. Navigate to the project directory:
    ```bash
    cd MovieMatchinJS
    ```
3. Install the dependencies:
    ```bash
    npm install
    ```

## Configuration

1. Create a .env file in the project root and add your TMDb API key:
    ```env
    TMDB_API_KEY=your_tmdb_api_key_here
    ```
2. Make sure that your data files (e.g., filtered_movies.tsv) and output directories are correctly configured in the source files.

## Usage

Start the application by running:
```bash
npm start
