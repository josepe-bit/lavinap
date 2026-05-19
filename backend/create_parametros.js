require('dotenv').config();
const mysql = require('mysql2/promise');

async function createTable() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lavina_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS Parametros (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre_establecimiento VARCHAR(100) DEFAULT '',
                documento_representante VARCHAR(50) DEFAULT '',
                nombre_representante VARCHAR(100) DEFAULT '',
                email_representante VARCHAR(100) DEFAULT '',
                telefono_representante VARCHAR(50) DEFAULT '',
                whatsapp_establecimiento VARCHAR(50) DEFAULT '',
                email_establecimiento VARCHAR(100) DEFAULT '',
                celular_establecimiento VARCHAR(50) DEFAULT ''
            )
        `);
        console.log('Tabla Parametros creada correctamente.');

        // Insert default row if none exists
        const [rows] = await connection.query('SELECT * FROM Parametros WHERE id = 1');
        if (rows.length === 0) {
            await connection.query('INSERT INTO Parametros (id) VALUES (1)');
            console.log('Registro por defecto insertado.');
        }

    } catch (err) {
        console.error('Error creando la tabla:', err);
    } finally {
        await connection.end();
    }
}

createTable();
