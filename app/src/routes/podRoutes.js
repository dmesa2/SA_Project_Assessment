const express = require('express');
const router = express.Router();
const podController = require('../controllers/podController');

// Route to handle the form submission and call the controller function
router.post('/create-pod', podController.createPod);

module.exports = router;
