const express = require('express');
const { registerUser } = require('../controllers/auth');
const { validateRegister } = require('../validators/auth');

const router = express.Router();

router.post('/register', validateRegister, registerUser);

module.exports = router;
