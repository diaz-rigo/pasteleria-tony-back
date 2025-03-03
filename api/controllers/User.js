// userController.js
const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');
const User = require('../models/user');

// // Crear un nuevo usuario
// exports.createUser = async (req, res) => {
//     try {
//         const { email, password, name, rol } = req.body;
//         const existingUser = await User.findOne({ email });
//         if (existingUser) return res.status(400).json({ message: 'El usuario ya existe' });
//         const hashedPassword = await bcrypt.hash(password, 10);
//         const user = new User({
//             _id: new mongoose.Types.ObjectId(),
//             email,
//             password: hashedPassword,
//             name,
//             rol
//         });
//         await user.save();
//         res.status(201).json({ message: 'Usuario creado exitosamente', user });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// Obtener todos los usuarios
exports.getUsers = async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener un usuario por ID
exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar usuario
// exports.updateUser = async (req, res) => {
//     try {
//         const updates = req.body;
//         if (updates.password) {
//             updates.password = await bcrypt.hash(updates.password, 10);
//         }
//         const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true });
//         if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
//         res.json({ message: 'Usuario actualizado', user });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };

// Eliminar usuario
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};