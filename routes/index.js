const express = require('express');
const router = express.Router();

const authRoutes = require('./auth');

const { validatorMail } = require("../validators/mail")
const { send } = require("../controllers/mail")
router.post('/mail', validatorMail, send)

router.use('/user', authRoutes);

module.exports = router;
