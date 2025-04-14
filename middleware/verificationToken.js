const jwt = require('jsonwebtoken');

const authenticate = (req, res, next) => {
  const token = req.headers['authorization'];

  if (!token) {
    return res.status(401).json({ message: 'Token no proporcionado' });
  }

  const bearerToken = token.split(' ')[1];

  jwt.verify(bearerToken, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Token no válido' });
    }

    //trazas
    //req.user = { _id: decoded.id, email: decoded.email };
    req.user = {
      id: decoded.id,
      email: decoded.email,
      companyId: decoded.companyId || null //por si no se necesita darle null
    };
    console.log("Decoded token:", decoded);
    console.log("User ID from token:", req.user._id); 
    next();
  });
};

module.exports = authenticate;
