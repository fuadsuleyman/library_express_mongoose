const express = require('express');

const router = express.Router();

const authorController = require('../controllers/author');

// create
router.get('/author/create', authorController.getAuthorCreate);
router.post('/author/create', authorController.postAuthorCreate);

// update
router.get('/author/:authorId/update', authorController.getAuthorUpdate);
router.post('/author/:authorId/update', authorController.postAuthorUpdate);

// delete
router.get('/author/:authorId/delete', authorController.getAuthorDelete);
router.post('/author/:authorId/delete', authorController.postAuthorDelete);

// authors and single author
router.get('/authors', authorController.getAllAuthors);

router.get('/author/:authorId', authorController.getAuthor);

module.exports = router;