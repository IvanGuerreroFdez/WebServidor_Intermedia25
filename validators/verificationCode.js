const { body, validationResult } = require('express-validator');

module.exports = [
    body('code')
        .isNumeric().withMessage('Codigo numerico?')
        .isLength({ min: 6, max: 6 }).withMessage('6 digitos máximo'),
    (req, res, next) => {
        console.log("Cuerpo de la solicitud:", req.body); 
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];
