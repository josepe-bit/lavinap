const mysql = require('mysql2/promise');
require('dotenv').config();

async function migrate() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'lavina_db',
        port: process.env.DB_PORT || 3306
    });

    try {
        console.log("Checking meta_juegos_promocion in Parametros...");
        const [columns] = await connection.query("SHOW COLUMNS FROM Parametros LIKE 'meta_juegos_promocion'");
        if (columns.length === 0) {
            await connection.query("ALTER TABLE Parametros ADD COLUMN meta_juegos_promocion INT DEFAULT 10;");
            console.log("Added meta_juegos_promocion to Parametros.");
        }

        console.log("Checking origen in Reservas...");
        const [resCols] = await connection.query("SHOW COLUMNS FROM Reservas LIKE 'origen'");
        if (resCols.length === 0) {
            await connection.query("ALTER TABLE Reservas ADD COLUMN origen ENUM('Normal', 'Campeonato') DEFAULT 'Normal';");
            console.log("Added origen to Reservas.");
        }

        console.log("Creating promociones table...");
        await connection.query(`
            CREATE TABLE IF NOT EXISTS promociones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                clienteid INT NOT NULL,
                servicioid INT NOT NULL, -- 1 for Futbol 8, 2 for Futbol 5
                cantidad_servicios INT DEFAULT 0,
                fecha_ultimoserv DATE,
                fecha_tomapromo DATE,
                hora_tomapromo TIME,
                FOREIGN KEY (clienteid) REFERENCES Clientes(id) ON DELETE CASCADE
            );
        `);
        console.log("Created promociones table.");

        console.log("Migration successful.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await connection.end();
    }
}

migrate();
