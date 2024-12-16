const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
    login: async (req, res) => {
        try {
            console.log('Intento de login:', req.body);
            const { username, password } = req.body;

            // Validar campos requeridos
            if (!username || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Username y password son requeridos'
                });
            }

            // Buscar usuario
            const user = await User.findOne({
                where: { username },
                include: [{
                    model: Role,
                    as: 'role',
                    attributes: ['name']
                }]
            });

            console.log('Usuario encontrado:', user ? user.username : 'no encontrado');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Verificar contraseña
            const isValidPassword = await bcrypt.compare(password, user.password);
            console.log('Contraseña válida:', isValidPassword);

            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token JWT
            const token = jwt.sign(
                {
                    id: user.id,
                    username: user.username,
                    role: user.role.name
                },
                process.env.JWT_SECRET || 'tu_secret_key',
                { expiresIn: '24h' }
            );

            return res.status(200).json({
                success: true,
                message: 'Login exitoso',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role.name,
                    token
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al iniciar sesión',
                error: error.message
            });
        }
    },

    register: async (req, res) => {
        try {
            console.log('Intento de registro:', req.body);
            const { username, email, password, roleId } = req.body;

            // Validar campos requeridos
            if (!username || !email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Todos los campos son requeridos'
                });
            }

            // Verificar si el usuario ya existe
            const existingUser = await User.findOne({
                where: { username }
            });

            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'El nombre de usuario ya está en uso'
                });
            }

            // Hashear la contraseña
            const hashedPassword = await bcrypt.hash(password, 10);

            // Crear el usuario
            const user = await User.create({
                username,
                email,
                password: hashedPassword,
                roleId: roleId || 3 // Role por defecto: USER
            });

            console.log('Usuario registrado:', user.username);

            return res.status(201).json({
                success: true,
                message: 'Usuario registrado exitosamente',
                data: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            });
        } catch (error) {
            console.error('Error en registro:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al registrar usuario',
                error: error.message
            });
        }
    }
};

module.exports = authController; 