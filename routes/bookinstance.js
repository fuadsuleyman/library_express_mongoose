const express = require('express');

const router = express.Router();

const bookinstanceController = require('../controllers/bookinstance');

// create
router.get('/bookinstance/create', bookinstanceController.getBookinstanceCreate);
router.post('/bookinstance/create', bookinstanceController.postBookinstanceCreate);

// update
router.get('/bookinstance/:bookinstanceId/update', bookinstanceController.getBookinstanceUpdate);
router.post('/bookinstance/:bookinstanceId/update', bookinstanceController.postBookinstanceUpdate);

// delete
router.get('/bookinstance/:bookinstanceId/delete', bookinstanceController.getBookinstanceDelete);
router.post('/bookinstance/:bookinstanceId/delete', bookinstanceController.postBookinstanceDelete);

// bookinstances and single bookinstance
router.get('/bookinstances', bookinstanceController.getAllBookinstances);

router.get('/bookinstance/:bookinstanceId', bookinstanceController.getBookinstance);

module.exports = router;