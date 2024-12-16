const { Role } = require('../models/index');

const setupRoles = async () => {
  try {
    // Rol Admin
    await Role.create({
      name: 'ADMIN',
      permissions: [
        'create_product',
        'edit_product',
        'delete_product',
        'manage_roles',
        'manage_users'
      ]
    });

    // Rol Manager
    await Role.create({
      name: 'MANAGER',
      permissions: [
        'create_product',
        'edit_product'
      ]
    });

    // Rol Usuario
    await Role.create({
      name: 'USER',
      permissions: [
        'view_products',
        'create_order'
      ]
    });

    console.log('Roles creados exitosamente');
  } catch (error) {
    console.error('Error al crear roles:', error);
    throw error; // Propagar el error para manejarlo en el servidor
  }
};

module.exports = setupRoles; 