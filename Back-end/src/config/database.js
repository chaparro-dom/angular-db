const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    database: 'tienda',
    username: 'root',
    password: 'paola.roma',
    host: 'localhost',
    dialect: 'mysql',
    port: 3306,
    logging: true,
    dialectOptions: {
        connectTimeout: 60000,
        supportBigNumbers: true,
        bigNumberStrings: true
    }
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ Conexión exitosa');
        return true;
    } catch (error) {
        console.error('Error de conexión:', {
            message: error.message,
            code: error.parent?.code,
            errno: error.parent?.errno
        });
        return false;
    }
};

testConnection();

module.exports = sequelize;