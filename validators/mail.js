const { check, validationResult } = require('express-validator');

const validateResults = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

const validatorMail = [
    check("subject").exists().notEmpty(),
    check("text").exists().notEmpty(),
    check("to").exists().notEmpty(),
    check("from").exists().notEmpty(),

    (req, res, next) => {
        return validateResults(req, res, next)
    }
]

module.exports = { validatorMail }