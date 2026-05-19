const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function updateAdmin() {
    try {
        require('dotenv').config();
        const password = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query('UPDATE Usuarios SET password = ? WHERE username = ?', [hashedPassword, 'admin']);
        console.log('Admin password updated successfully');
    } catch (e) {
        console.error('Error updating admin password:', e);
    }
    process.exit(0);
}

updateAdmin();
