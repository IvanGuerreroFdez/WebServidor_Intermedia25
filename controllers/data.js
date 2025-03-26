const User = require('../models/users');
const { validationResult } = require('express-validator');

exports.DataPersona = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const { name, surname, nif } = req.body;
        const { id } = req.user; 

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.name = name || user.name;
        user.surname = surname || user.surname;
        user.nif = nif || user.nif;
        await user.save();

        res.status(200).json({
            message: 'Datos personales actualizados con exito',
            user: {
                name: user.name,
                surname: user.surname,
                nif: user.nif
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar los datos personales' });
    }
};

exports.DataCompany = async (req, res) => {
    const { companyName, cif, address } = req.body;
    const { _id } = req.user;
    console.log("ID del usuario desde req.user:", _id); 

    try {
        const user = await User.findById(_id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (user.isAutonomous) {
            user.companyName = user.name;
            user.cif = user.nif;
            user.address = user.surname;
        } else {
            user.companyName = companyName;
            user.cif = cif;
            user.address = address;
        }

        await user.save();
        res.status(200).json({
            message: 'Datos de la compañía actualizados con éxito',
            user: {
                companyName: user.companyName,
                cif: user.cif,
                address: user.address
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al actualizar los datos de la compañía', error: err.message });
    }
};
