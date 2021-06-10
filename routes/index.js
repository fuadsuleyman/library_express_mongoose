const express = require('express');

const router = express.Router();

const indexController = require('../controllers/index');

// router.get(['/', '/home', '/catalog'], indexController.getIndexPage);
// router.get(['/', '/home', '/catalog'], indexController.getIndexPage);
router.get('/catalog', indexController.getIndexPage);

router.get('/', indexController.redirectToCatalog);

router.get('/home', indexController.redirectToCatalog);

router.get('/about', indexController.getAboutPage);

module.exports = router;