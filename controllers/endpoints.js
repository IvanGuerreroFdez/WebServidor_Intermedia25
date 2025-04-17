const User = require('../models/users');
const { sendEmail } = require('../utils/handleEmail');
const { generateToken } = require('../utils/handleJwt');

exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({
            email: user.email,
            name: user.persona.name,
            surname: user.persona.surname,
            nif: user.persona.nif,
            status: user.status,
            role: user.role
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los datos del usuario' });
    }
};

exports.deleteUser = async (req, res) => {
    const { soft } = req.query; 

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (soft === 'false') {
            await user.deleteOne();
            return res.status(200).json({ message: 'Usuario eliminado permanentemente' });
        } else {
            user.status = 'inactive';
            await user.save();
            return res.status(200).json({ message: 'Usuario desactivado' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar el usuario' });
    }
};

exports.forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const resetToken = generateToken(user);

        const emailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Recuperar contraseña',
            text: `Haga clic en el siguiente enlace para recuperar su contraseña: http://localhost:3000/forgotpassword/${resetToken}`
        };

        await sendEmail(emailOptions);

        res.status(200).json({ message: 'Enlace de recuperación de contraseña enviado al correo' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al enviar el enlace de recuperación' });
    }
};

exports.inviteUser = async (req, res) => {
    const { email } = req.body;
    //const { _id } = req.user;
    const invitadoId = req.user._id;

    try {
        /* const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'El usuario ya existe' });
        } */

        const invitedUser = await User.create({
            email,
            role: 'guest', 
            password: 'user1234',
        });

        const inviter = await User.findById(invitadoId);
        if (inviter && inviter.company) {
            invitedUser.company = inviter.company;  
            await invitedUser.save();
        }

        const emailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Invitacion',
            text: `Ha sido invitad a unirse a la práctica parcial de WebServidor!`
        };

        await sendEmail(emailOptions);

        res.status(201).json({
            message: 'Usuario invitado correctamente',
            user: invitedUser,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al invitar al usuario', error: error.message });
    }
};
