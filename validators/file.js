const { check } = require("express-validator");
const { validateResults } = require("../utils/handleValidator");

const validateSignatureUpload = [
  check("file")
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error("El archivo de la firma es obligatorio");
      }

      const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
      if (!allowedTypes.includes(req.file.mimetype)) {
        throw new Error("Formato no permitido --> Usa JPG, JPEG o PNG");
      }

      return true;
    }),
    (req, res, next) => validateResults(req, res, next)
];

module.exports = { validateSignatureUpload };
