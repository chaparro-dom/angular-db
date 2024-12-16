const sequelize = require('../config/database');

// Importar modelos
const User = require('./User');
const Role = require('./Role');
const Product = require('./Product');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

// Definir relaciones
const setupAssociations = () => {
    // Relaciones User-Role
    User.belongsTo(Role, { foreignKey: 'roleId', as: 'role' });
    Role.hasMany(User, { foreignKey: 'roleId' });

    // Relaciones Order-User
    Order.belongsTo(User, { foreignKey: 'userId' });
    User.hasMany(Order, { foreignKey: 'userId' });

    // Relaciones Order-OrderItem-Product
    Order.hasMany(OrderItem, { foreignKey: 'orderId' });
    OrderItem.belongsTo(Order, { foreignKey: 'orderId' });

    OrderItem.belongsTo(Product, { foreignKey: 'productId' });
    Product.hasMany(OrderItem, { foreignKey: 'productId' });
};

// Configurar las asociaciones
setupAssociations();

// Exportar todo lo necesario
module.exports = {
    User,
    Role,
    Product,
    Order,
    OrderItem
}; 