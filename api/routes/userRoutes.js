const express = require('express');
const router = express.Router();
const userController = require('../controllers/User');

router.get('/', userController.getUsers);
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);

module.exports = router;
// router.put('/:id', userController.updateUser);
// router.post('/', userController.createUser);
