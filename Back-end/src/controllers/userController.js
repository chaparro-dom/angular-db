const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');

const userController = {
    // Obtener todos los usuarios
    getAllUsers: async (req, res) => {
        try {
            console.log('Obteniendo todos los usuarios...');
            const users = await User.findAll({
                attributes: ['id', 'username', 'email', 'createdAt'],
                include: [{
                    model: Role,
                    as: 'role',
                    attributes: ['name']
                }]
            });

            console.log(`Se encontraron ${users.length} usuarios`);
            
            return res.status(200).json({
                success: true,
                data: users
            });
        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios',
                error: error.message
            });
        }
    },

    // Obtener usuario por ID
    getUserById: async (req, res) => {
        try {
            const { id } = req.params;
            console.log('Buscando usuario con ID:', id);

            // Validar que el ID sea un número
            if (isNaN(id)) {
                return res.status(400).json({
                    success: false,
                    message: 'ID de usuario inválido'
                });
            }

            const user = await User.findOne({
                where: { id },
                attributes: [
                    'id', 
                    'username', 
                    'email', 
                    'roleId',
                    'createdAt',
                    'updatedAt'
                ],
                include: [{
                    model: Role,
                    as: 'role',
                    attributes: ['name']
                }]
            });

            console.log('Usuario encontrado:', user ? 'Sí' : 'No');

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: `No se encontró el usuario con ID ${id}`
                });
            }

            return res.status(200).json({
                success: true,
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role.name,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });

        } catch (error) {
            console.error('Error al obtener usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener usuario',
                error: error.message
            });
        }
    },

    // Crear usuario
    createUser: async (req, res) => {
        try {
            const { username, email, password, roleId } = req.body;

            if (!username || !email || !password || !roleId) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const user = await User.create({
                username,
                email,
                password: hashedPassword,
                roleId
            });

            return res.status(201).json({
                success: true,
                message: 'Usuario creado exitosamente',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Error al crear usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear usuario',
                error: error.message
            });
        }
    },

    // Actualizar usuario
    updateUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { username, email, password, roleId } = req.body;

            const user = await User.findByPk(id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            const updateData = {};
            if (username) updateData.username = username;
            if (email) updateData.email = email;
            if (password) {
                updateData.password = await bcrypt.hash(password, 10);
            }
            if (roleId) updateData.roleId = roleId;

            await user.update(updateData);

            return res.status(200).json({
                success: true,
                message: 'Usuario actualizado exitosamente',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario',
                error: error.message
            });
        }
    },

    // Eliminar usuario
    deleteUser: async (req, res) => {
        try {
            const { id } = req.params;
            const user = await User.findByPk(id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            await user.destroy();

            return res.status(200).json({
                success: true,
                message: 'Usuario eliminado exitosamente'
            });
        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario',
                error: error.message
            });
        }
    }
};

module.exports = userController;