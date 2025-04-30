const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatePersonaData = [
  check("name").exists().notEmpty().withMessage("El nombre es obligatorio"),
  check("surname").exists().notEmpty().withMessage("El apellido es obligatorio"),
  check("nif")
    .exists().notEmpty().withMessage("El NIF es obligatorio")
    .isLength({ min: 9, max: 9 }).withMessage("El NIF debe tener 9 caracteres"),
  (req, res, next) => validateResults(req, res, next)
];

const validateCompanyData = [
  check("companyName").exists().notEmpty().withMessage("El nombre de la compañía es obligatorio"),
  check("cif").exists().notEmpty().withMessage("El CIF es obligatorio"),
  check("address").exists().notEmpty().withMessage("La dirección es obligatoria"),
  check("number").optional().isNumeric().withMessage("El número debe ser numérico"),
  check("postal").optional().isPostalCode('ES').withMessage("El código postal no es válido"),
  check("city").optional().isString().withMessage("La ciudad debe ser texto"),
  check("province").optional().isString().withMessage("La provincia debe ser texto"),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validatePersonaData, validateCompanyData };
