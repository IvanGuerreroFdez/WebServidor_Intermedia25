const express = require('express');
const { registerUser, validateEmail, loginUser } = require('../controllers/auth');
const { validateRegister, validateLogin } = require('../validators/auth');
const { DataPersona, DataCompany } = require('../controllers/data');
const { validatePersonaData, validateCompanyData } = require('../validators/data');
const User = require('../models/users');

const verificationToken = require('../middleware/verificationToken');
const verificationCode = require('../validators/verificationCode');

const router = express.Router();

router.post('/register', validateRegister, registerUser);
router.put('/validatemail', verificationToken, verificationCode, validateEmail);
router.post('/login', validateLogin, loginUser);
router.put('/personadata', verificationToken, validatePersonaData, DataPersona); 

//traza para ver errores
router.get('/persona', verificationToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.id); 

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            email: user.email,
            name: user.name, 
            surname: user.surname,
            nif: user.nif 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los datos del usuario' });
    }
});

router.patch('/companydata', verificationToken, validateCompanyData, DataCompany);

module.exports = router;
