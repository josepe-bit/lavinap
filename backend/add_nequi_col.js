const mysql = require('mysql2/promise');
require('dotenv').config();

async function run() {
    const pool = mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
    });
    
    try {
        await pool.query('ALTER TABLE Parametros ADD COLUMN numero_nequi VARCHAR(50);');
        console.log('Column added successfully');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('Column already exists');
        } else {
            console.error(e);
        }
    }
    process.exit(0);
}
run();
