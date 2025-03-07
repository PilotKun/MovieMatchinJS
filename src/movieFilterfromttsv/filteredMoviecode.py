import pandas as pd

## This code was provided by my friend who made the filtered movie list for me.

## File paths, the file paths here should be changed if someone wants to run this code. 
ratings_file = r"D:\gs.vscode\title.ratings.tsv"
basics_file = r"D:\gs.vscode\title.basics.tsv"
output_file = r"D:\gs.vscode\filtered_movies.tsv"

## Load ratings data
ratings = pd.read_csv(ratings_file, sep='\t', dtype={'tconst': str, 'averageRating': float, 'numVotes': int})

## Load basics data (only tconst and titleType to save memory)
basics = pd.read_csv(basics_file, sep='\t', usecols=['tconst', 'titleType'], dtype={'tconst': str, 'titleType': str})

## Merge on tconst
movies = ratings.merge(basics, on="tconst")

## Filter for movies with at least 1,000 votes
filtered_movies = movies[(movies["titleType"] == "movie") & (movies["numVotes"] >= 1000)]

## Save to a new TSV file
filtered_movies.to_csv(output_file, sep='\t', index=False)

print(f"Filtered movies saved to {output_file}")