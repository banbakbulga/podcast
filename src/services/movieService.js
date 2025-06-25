import axios from 'axios';

const OMDB_API_KEY = process.env.REACT_APP_OMDB_API_KEY;
const OMDB_API_URL = 'http://www.omdbapi.com';

export const searchMovie = async (title) => {
    try {
        const response = await axios.get(OMDB_API_URL, {
            params: {
                apikey: OMDB_API_KEY,
                t: title,  // search by title
                plot: 'short'
            }
        });

        if (response.data.Response === 'True') {
            return {
                title: response.data.Title,
                year: response.data.Year,
                poster: response.data.Poster,
                plot: response.data.Plot,
                rating: response.data.imdbRating,
                director: response.data.Director,
                actors: response.data.Actors
            };
        }
        return null;
    } catch (error) {
        console.error('Error fetching movie data:', error);
        return null;
    }
};

export const searchMoviesByKeyword = async (keyword) => {
    try {
        const response = await axios.get(OMDB_API_URL, {
            params: {
                apikey: OMDB_API_KEY,
                s: keyword,  // search by keyword
                type: 'movie'
            }
        });

        if (response.data.Response === 'True') {
            return response.data.Search.map(movie => ({
                title: movie.Title,
                year: movie.Year,
                poster: movie.Poster,
                imdbID: movie.imdbID
            }));
        }
        return [];
    } catch (error) {
        console.error('Error fetching movies:', error);
        return [];
    }
}; 