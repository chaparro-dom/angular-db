const Role = require('../models/Role');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

const setupDatabase = async () => {
    try {
        console.log('Iniciando configuración de la base de datos...');

        // Crear roles básicos si no existen
        const [adminRole, createdAdmin] = await Role.findOrCreate({
            where: { name: 'ADMIN' },
            defaults: { permissions: ['all'] }
        });
        console.log('✓ Rol ADMIN:', createdAdmin ? 'creado' : 'ya existe');

        const [managerRole, createdManager] = await Role.findOrCreate({
            where: { name: 'MANAGER' },
            defaults: { permissions: ['manage'] }
        });
        console.log('✓ Rol MANAGER:', createdManager ? 'creado' : 'ya existe');

        const [userRole, createdUser] = await Role.findOrCreate({
            where: { name: 'USER' },
            defaults: { permissions: ['read'] }
        });
        console.log('✓ Rol USER:', createdUser ? 'creado' : 'ya existe');

        // Comentar o eliminar la creación automática de usuarios
        /*
        const hashedPassword = await bcrypt.hash('123456', 10);

        const [adminUser, createdAdminUser] = await User.findOrCreate({
            where: { username: 'admin' },
            defaults: {
                email: 'admin@example.com',
                password: hashedPassword,
                roleId: adminRole.id
            }
        });
        console.log('✓ Usuario Admin:', createdAdminUser ? 'creado' : 'ya existe');

        const [managerUser, createdManagerUser] = await User.findOrCreate({
            where: { username: 'manager' },
            defaults: {
                email: 'manager@example.com',
                password: hashedPassword,
                roleId: managerRole.id
            }
        });
        console.log('✓ Usuario Manager:', createdManagerUser ? 'creado' : 'ya existe');

        const [normalUser, createdNormalUser] = await User.findOrCreate({
            where: { username: 'usuario1' },
            defaults: {
                email: 'usuario1@example.com',
                password: hashedPassword,
                roleId: userRole.id
            }
        });
        console.log('✓ Usuario Normal:', createdNormalUser ? 'creado' : 'ya existe');
        */

        console.log('✓ Configuración de la base de datos completada');

    } catch (error) {
        console.error('Error al configurar la base de datos:', error);
    }
};

module.exports = setupDatabase; 