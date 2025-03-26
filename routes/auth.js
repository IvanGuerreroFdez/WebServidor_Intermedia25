const express = require('express');
const { registerUser, validateEmail, loginUser } = require('../controllers/auth');
const { validateRegister, validateLogin } = require('../validators/auth');

const verificationToken = require('../middleware/verificationToken');
const verificationCode = require('../validators/verificationCode');

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.put('/validatemail', verificationToken, verificationCode, validateEmail);
router.post('/login', validateLogin, loginUser);

module.exports = router;
