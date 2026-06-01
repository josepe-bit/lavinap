const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
    });
    
    try {
        await pool.query('ALTER TABLE Parametros ADD COLUMN enviar_email TINYINT(1) DEFAULT 1;');
        console.log('enviar_email column added successfully');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('enviar_email column already exists');
        } else {
            console.error('Error adding enviar_email column:', e);
        }
    }

    try {
        await pool.query('ALTER TABLE Parametros ADD COLUMN enviar_whatsapp TINYINT(1) DEFAULT 0;');
        console.log('enviar_whatsapp column added successfully');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('enviar_whatsapp column already exists');
        } else {
            console.error('Error adding enviar_whatsapp column:', e);
        }
    }
    
    // Check current values
    try {
        const [rows] = await pool.query('SELECT enviar_email, enviar_whatsapp FROM Parametros WHERE id = 1');
        console.log('Current parameters row 1:', rows[0]);
    } catch (e) {
        console.error('Error querying Parametros:', e);
    }
    
    process.exit(0);
}
run();
