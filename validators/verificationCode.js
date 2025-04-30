const { body } = require('express-validator');
const validateResults = require('../utils/handleValidator');

const validatorVerificationCode = [
  body('code')
    .isNumeric().withMessage('El código debe ser numérico')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener exactamente 6 dígitos'),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validatorVerificationCode };
