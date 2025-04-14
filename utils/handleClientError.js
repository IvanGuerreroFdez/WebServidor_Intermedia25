const { validationResult } = require("express-validator");

const handleClientError = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const extractedErrors = errors.array().map(err => ({
      field: err.param,
      message: err.msg
    }));
    return res.status(422).json({
      message: "Error de validación",
      errors: extractedErrors
    });
  }
};

module.exports = handleClientError;
