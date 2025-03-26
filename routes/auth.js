const express = require('express');
const { registerUser, validateEmail } = require('../controllers/auth');
const { validateRegister } = require('../validators/auth');

const verificationToken = require('../middleware/verificationToken');
const verificationCode = require('../validators/verificationCode');

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.put('/validatemail', verificationToken, verificationCode, validateEmail);

module.exports = router;
