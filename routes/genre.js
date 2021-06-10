const express = require('express');

const router = express.Router();

const genreControllers = require('../controllers/genre');

// create
router.get('/genre/create', genreControllers.getGenreCreate);

router.post('/genre/create', genreControllers.postGenreCreate);

// update
router.get('/genre/:genreId/update', genreControllers.getGenreUpdate);

router.post('/genre/:genreId/update', genreControllers.postGenreUpdate);

// delete
router.get('/genre/:genreId/delete', genreControllers.getGenreDelete);

router.post('/genre/:genreId/delete', genreControllers.postGenreDelete);

// genres and single genre
router.get('/genres', genreControllers.getAllGenres);

router.get('/genre/:genreId', genreControllers.getGenre);


module.exports = router;