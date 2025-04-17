const User = require('../models/users');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

exports.DataPersona = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() });
        }
        const { name, surname, nif } = req.body;
        const { id } = req.user; 

        const user = await User.findById(id);
        //const user = await User.findById(mongoose.Types.ObjectId(id));
        console.log("Usuario:", user);

        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        user.persona.name = name || user.persona.name;
        user.persona.surname = surname || user.persona.surname;
        user.persona.nif = nif || user.persona.nif;
        await user.save();

        res.status(200).json({
            message: 'Datos personales actualizados con exito',
            user: {
                name: user.persona.name,
                surname: user.persona.surname,
                nif: user.persona.nif
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al actualizar los datos personales' });
    }
};

exports.DataCompany = async (req, res) => {
    const { companyName, cif, address, number, postal, city, province } = req.body;
    const { id } = req.user;
    console.log("ID del usuario desde req.user:", id); 

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        if (user.isAutonomous) {
            user.company = {
                companyName: user.persona.name,
                cif: user.persona.nif,
                address: address, 
                number: number,
                postal: postal,
                city: city,
                province: province
            };
        } else {
            user.company = {
                companyName: companyName,
                cif: cif,
                address: address,
                number: number,
                postal: postal,
                city: city,
                province: province
            };
        }

        await user.save();
        res.status(200).json({
            message: 'Datos de la compañía actualizados con éxito',
            user: {
                companyName: user.persona.name,
                cif: user.persona.nif,
                address: user.company.address,
                number: user.company.number,
                postal: user.company.postal,
                city: user.company.city,
                province: user.company.province
            }
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error al actualizar los datos de la compañía', error: err.message });
    }
};
