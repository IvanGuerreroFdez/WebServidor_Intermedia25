const User = require('../models/users');
const { hashPassword } = require('../utils/handlePassword');
const { generateToken } = require('../utils/handleJwt');
const { validationResult } = require('express-validator');

exports.registerUser = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }

        const { email, password } = req.body;

        // Verificar si el usuario ya existe
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(409).json({ message: 'El email ya está registrado' });
        }

        // Cifrar la contraseña
        const hashedPassword = await hashPassword(password);

        // Generar código de verificación
        const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

        // Crear usuario
        const user = await User.create({
            email,
            password: hashedPassword,
            verificationCode
        });

        // Generar token
        const token = generateToken(user);

        res.status(201).json({
            token,
            user: {
                email: user.email,
                status: user.status,
                role: user.role,
                _id: user._id
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};
