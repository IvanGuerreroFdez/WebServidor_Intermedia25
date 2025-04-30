const express = require('express');
const { registerUser, validateEmail, loginUser } = require('../controllers/auth');
const { validateRegister, validateLogin } = require('../validators/auth');
const { DataPersona, DataCompany } = require('../controllers/data');
const { validatePersonaData, validateCompanyData } = require('../validators/data');
const User = require('../models/users');
const { uploadImage } = require('../controllers/logo');
const { uploadMiddleware, uploadMiddlewareMemory } = require('../utils/handleStorage');
const { getUser, deleteUser, forgotPassword, inviteUser } = require('../controllers/endpoints');

const verificationToken = require('../middleware/verificationToken');
//const verificationCode = require('../validators/verificationCode');
const { validatorVerificationCode } = require('../validators/verificationCode');

const router = express.Router();

/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags:
 *       - OnBoarding
 *     summary: User register
 *     description: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/user'
 *     responses:
 *       200:
 *         description: Returns the inserted object
 *       401:
 *         description: Validation error
 *     security:
 *       - bearerAuth: []
 */
//router.post('/register', validateRegister, registerUser);
router.post('/register', ...validateRegister, registerUser);

/**
 * @openapi
 * /api/auth/validatemail:
 *   put:
 *     tags:
 *       - OnBoarding
 *     summary: Validate email with code
 *     description: Validates user email via verification code
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Email verified successfully
 *       400:
 *         description: Invalid verification code
 *       401:
 *         description: Unauthorized
 */
//router.put('/validatemail', verificationToken, verificationCode, validateEmail);
router.put('/validatemail', verificationToken, ...validatorVerificationCode, validateEmail);

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags:
 *       - OnBoarding
 *     summary: User login
 *     description: Login and receive authentication token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/login'
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
//router.post('/login', validateLogin, loginUser);
router.post('/login', ...validateLogin, loginUser);

/**
 * @openapi
 * /api/auth/personadata:
 *   put:
 *     tags:
 *       - OnBoarding
 *     summary: Add personal data
 *     description: Adds personal data to user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal data added
 *       400:
 *         description: Validation error
 */
//router.put('/personadata', verificationToken, validatePersonaData, DataPersona);
router.put('/personadata', verificationToken, ...validatePersonaData, DataPersona);

/**
 * @openapi
 * /api/auth/persona:
 *   get:
 *     tags:
 *       - Data
 *     summary: Get personal data
 *     description: Returns personal data of the logged-in user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Personal data retrieved
 *       404:
 *         description: User not found
 */
//traza para ver errores
/* router.get('/persona', verificationToken, async (req, res) => {
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
}); */

/**
 * @openapi
 * /api/auth/companydata:
 *   patch:
 *     tags:
 *       - Data
 *     summary: Add company data
 *     description: Updates the company information of the user
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Company data updated
 *       400:
 *         description: Validation error
 */
//router.patch('/companydata', verificationToken, validateCompanyData, DataCompany);
router.patch('/companydata', verificationToken, ...validateCompanyData, DataCompany);

/**
 * @openapi
 * /api/auth/logo:
 *   patch:
 *     tags:
 *       - Data
 *     summary: Upload company logo
 *     description: Upload a company logo image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               logo:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Logo uploaded successfully
 *       400:
 *         description: Invalid file
 */
router.patch('/logo', verificationToken, uploadMiddlewareMemory.single('logo'), uploadImage);

/**
 * @openapi
 * /api/auth/getuser:
 *   get:
 *     tags:
 *       - Data
 *     summary: Get authenticated user
 *     description: Get user information using bearer token
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User information returned
 *       401:
 *         description: Unauthorized
 */
router.get('/getuser', verificationToken, getUser);

/**
 * @openapi
 * /api/auth/deleteuser:
 *   delete:
 *     tags:
 *       - OnBoarding
 *     summary: Delete user
 *     description: Delete the authenticated user account
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User deleted
 *       401:
 *         description: Unauthorized
 */
router.delete('/deleteuser', verificationToken, deleteUser);

/**
 * @openapi
 * /api/auth/forgotpassword:
 *   post:
 *     tags:
 *       - OnBoarding
 *     summary: Forgot password
 *     description: Sends a reset password email
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: miemail@google.com
 *     responses:
 *       200:
 *         description: Email sent
 *       404:
 *         description: User not found
 */
router.post('/forgotpassword', forgotPassword);

/**
 * @openapi
 * /api/auth/invite:
 *   post:
 *     tags:
 *       - OnBoarding
 *     summary: Invite guest user
 *     description: Send an invitation to a new guest user
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: invitado@empresa.com
 *     responses:
 *       200:
 *         description: Invitation sent
 *       400:
 *         description: Email already exists or error
 */
router.post('/invite', verificationToken, inviteUser);

module.exports = router;
