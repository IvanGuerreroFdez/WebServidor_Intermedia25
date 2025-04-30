const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const albaranValidator = [
  check("clientId").notEmpty().withMessage("El ID del cliente es obligatorio"),
  check("projectId").notEmpty().withMessage("El ID del proyecto es obligatorio"),
  check("format")
    .notEmpty().withMessage("El formato es obligatorio")
    .isIn(["material", "hours"]).withMessage("Formato inválido --> {'material' o 'hours'}"),
  check("description").optional().isString(),
  check("workdate").optional().isString(),

  check("material")
    .custom((value, { req }) => {
      if (req.body.format === "material" && (!Array.isArray(value) || value.length === 0)) {
        throw new Error("Debe proporcionar al menos un material");
      }
      return true;
    }),

  check("workers")
    .custom((value, { req }) => {
      if (req.body.format === "hours" && (!Array.isArray(value) || value.length === 0)) {
        throw new Error("Debe proporcionar al menos un trabajador con horas");
      }
      return true;
    }),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = { albaranValidator };
