const pool = require('./src/config/db');
const bcrypt = require('bcryptjs');

async function createAdmin() {
    try {
        require('dotenv').config();
        const username = 'admin';
        const password = process.env.ADMIN_PASSWORD || 'admin123';
        const hashedPassword = await bcrypt.hash(password, 10);
        
        await pool.query('INSERT INTO Usuarios (username, password, rol) VALUES (?, ?, ?)', [username, hashedPassword, 'superadmin']);
        console.log('Admin user created successfully');
    } catch (e) {
        console.error('Error creating admin user:', e);
    }
    process.exit(0);
}

createAdmin();
