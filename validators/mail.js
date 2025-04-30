const { check } = require("express-validator");
const validateResults = require("../utils/handleValidator");

const validatorMail = [
  check("subject").exists().notEmpty().withMessage("El asunto es obligatorio"),
  check("text").exists().notEmpty().withMessage("El texto es obligatorio"),
  check("to").exists().notEmpty().withMessage("El destinatario es obligatorio"),
  check("from").exists().notEmpty().withMessage("El remitente es obligatorio"),
  (req, res, next) => validateResults(req, res, next)
];

module.exports = { validatorMail };