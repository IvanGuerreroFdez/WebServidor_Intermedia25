const { check } = require('express-validator');

const validateRegister = [
    check('email', 'Debe ser un email válido').isEmail(),
    check('password', 'La contraseña debe tener al menos 8 caracteres').isLength({ min: 8 })
];

module.exports = { validateRegister };
