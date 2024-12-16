require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
const setupDatabase = require('./src/utils/setupDatabase');
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = 3001;

const initializeServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('✓ Conexión a la base de datos establecida.');

        // Solo sincronizar sin modificar las tablas existentes
        await sequelize.sync({ force: false, alter: false });
        console.log('✓ Base de datos sincronizada (sin modificaciones)');

        app.listen(PORT, () => {
            console.log(`✓ Servidor corriendo en http://localhost:${PORT}`);
        });

    } catch (error) {
        console.error('Error al inicializar:', error);
        // No cerrar el proceso, solo registrar el error
        console.error(error);
    }
};

// Manejar errores no capturados
process.on('unhandledRejection', (error) => {
    console.error('Error no manejado:', error);
    process.exit(1);
});

const killProcessOnPort = async (port) => {
    const { exec } = require('child_process');
    return new Promise((resolve, reject) => {
        const command = process.platform === 'win32' 
            ? `netstat -ano | findstr :${port}`
            : `lsof -i :${port} | grep LISTEN | awk '{print $2}'`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error finding process: ${error}`);
                reject(error);
                return;
            }

            if (process.platform === 'win32') {
                const pid = stdout.split('\r\n')[0].split(/\s+/)[5];
                exec(`taskkill /F /PID ${pid}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error killing process: ${error}`);
                        reject(error);
                        return;
                    }
                    resolve();
                });
            } else {
                const pid = stdout.trim();
                exec(`kill -9 ${pid}`, (error, stdout, stderr) => {
                    if (error) {
                        console.error(`Error killing process: ${error}`);
                        reject(error);
                        return;
                    }
                    resolve();
                });
            }
        });
    });
};

initializeServer();

module.exports = app; 