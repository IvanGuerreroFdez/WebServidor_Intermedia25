const { check } = require("express-validator");
const { validateResults } = require("../utils/handleValidator");

const clientValidator = [
  check("name").notEmpty().withMessage("El nombre es obligatorio"),
  check("cif").notEmpty().withMessage("El CIF es obligatorio"),
  check("address.street").notEmpty().withMessage("La calle es obligatoria"),
  check("address.number").isInt({ min: 1 }).withMessage("El número debe ser un entero positivo"),
  check("address.postal").isInt().withMessage("El código postal debe ser numérico"),
  check("address.city").notEmpty().withMessage("La ciudad es obligatoria"),
  check("address.province").notEmpty().withMessage("La provincia es obligatoria"),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { clientValidator };
