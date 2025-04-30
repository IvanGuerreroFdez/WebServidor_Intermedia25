const { check } = require('express-validator');
const { validateResults } = require('../utils/handleValidator');

const validateRegister = [
    check('email', 'Debe ser un email válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 8 caracteres').isLength({ min: 8 }),
    (req, res, next) => validateResults(req, res, next)
];

const validateLogin = [
    check('email', 'Debe ser un email válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 8 caracteres').isLength({ min: 8 }),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateRegister, validateLogin };
