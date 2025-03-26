const { check } = require('express-validator');

const validatePersonaData = [
    check('name', 'Nombre persona necesario').notEmpty(),
    check('surname', 'Apellido persona necesario').notEmpty(),
    check('nif', 'NIF persona necesario').notEmpty().isLength({ min: 9 }).withMessage('El NIF debe tener 9 caracteres')
];

const validateCompanyData = [
    check('companyName', 'Nombre compañia necesario').notEmpty(),
    check('cif', 'CIF compañia necesario').notEmpty(),
    check('address', 'Dirección compañia necesaria').notEmpty()
];

module.exports = { validatePersonaData, validateCompanyData };
