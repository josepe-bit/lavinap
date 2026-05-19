const pool = require('./src/config/db');

async function alterDb() {
    try {
        await pool.query('ALTER TABLE Reservas ADD COLUMN grupo_id VARCHAR(50) NULL;');
        console.log('Columna grupo_id añadida exitosamente.');
    } catch (e) {
        if (e.code === 'ER_DUP_FIELDNAME') {
            console.log('La columna grupo_id ya existe.');
        } else {
            console.error('Error alterando la base de datos:', e);
        }
    }
    process.exit(0);
}

alterDb();
