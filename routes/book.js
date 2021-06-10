const express = require('express');

const router = express.Router();

const bookController = require('../controllers/book');

// create
router.get('/book/create', bookController.getBookCreate);
router.post('/book/create', bookController.postBookCreate);

// update
router.get('/book/:bookId/update', bookController.getBookUpdate);
router.post('/book/:bookId/update', bookController.postBookUpdate);

// delete
router.get('/book/:bookId/delete', bookController.getBookDelete);
router.post('/book/:bookId/delete', bookController.postBookDelete);

// books and single book
router.get('/books', bookController.getAllBooks);

router.get('/book/:bookId', bookController.getBook);

module.exports = router;