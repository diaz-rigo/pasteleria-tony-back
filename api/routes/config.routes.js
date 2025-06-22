
const express = require('express');
const router = express.Router();
const configController = require('../controllers/config.controller');

router.get('/', configController.getConfig);

router.post('/', configController.createConfig);

router.put('/:id', configController.updateConfig);

module.exports = router;
