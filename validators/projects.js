const { check } = require("express-validator");
const { validateResults } = require("../utils/handleValidator");

const projectValidator = [
  check("name").notEmpty().withMessage("El nombre del proyecto es obligatorio."),
  check("projectCode").notEmpty().withMessage("El projectCode es obligatorio."),
  check("code").notEmpty().withMessage("El código interno del proyecto es obligatorio."),
  check("clientId").notEmpty().withMessage("El ID del cliente es obligatorio."),
  check("address.street").notEmpty().withMessage("La calle es obligatoria."),
  check("address.number").isInt({ min: 1 }).withMessage("El número debe ser entero positivo."),
  check("address.postal").isInt().withMessage("El código postal debe ser numérico."),
  check("address.city").notEmpty().withMessage("La ciudad es obligatoria."),
  check("address.province").notEmpty().withMessage("La provincia es obligatoria."),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { projectValidator };
