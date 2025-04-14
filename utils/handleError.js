const handleHttpError = (res, message = "ERROR", code = 500) => {
    res.status(code).json({ error: message });
};
  
module.exports = { handleHttpError };
  