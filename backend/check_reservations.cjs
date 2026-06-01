const pool = require('./src/config/db');

async function main() {
    try {
        const [rows] = await pool.query('SELECT * FROM Reservas ORDER BY id DESC LIMIT 5');
        console.log("Reservas in DB:", rows);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        pool.end();
    }
}
main();
