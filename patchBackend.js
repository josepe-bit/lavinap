const fs = require('fs');
const path = require('path');

const routesPath = path.join(__dirname, 'backend/src/routes/adminRoutes.js');
let routesCode = fs.readFileSync(routesPath, 'utf8');

if (!routesCode.includes('/fecxtorneo/:id/reservar')) {
    routesCode = routesCode.replace(
        "router.post('/fecxtorneo/:id/resultados', adminRoleMiddleware, adminController.enviarResultadosFecha);",
        "router.post('/fecxtorneo/:id/resultados', adminRoleMiddleware, adminController.enviarResultadosFecha);\nrouter.post('/fecxtorneo/:id/reservar', adminRoleMiddleware, adminController.reservarCanchasFecha);"
    );
    fs.writeFileSync(routesPath, routesCode);
    console.log('adminRoutes.js patched.');
} else {
    console.log('adminRoutes.js already patched.');
}

const controllerPath = path.join(__dirname, 'backend/src/controllers/adminController.js');
let controllerCode = fs.readFileSync(controllerPath, 'utf8');

if (!controllerCode.includes('exports.reservarCanchasFecha')) {
    const reservarMethod = `
exports.reservarCanchasFecha = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [fechas] = await connection.query('SELECT f.fecha, t.nombre AS torneo_nombre FROM FecxTorneo f JOIN Torneos t ON f.torneo_id = t.id WHERE f.id = ?', [id]);
        if (fechas.length === 0) throw new Error('Fecha no encontrada');
        const { fecha, torneo_nombre } = fechas[0];

        const [partidos] = await connection.query('SELECT * FROM ParxFecha WHERE fec_torneo_id = ?', [id]);
        
        if (partidos.length === 0) {
            throw new Error('No hay partidos en esta fecha para reservar');
        }

        let id_cliente;
        const [clientes] = await connection.query('SELECT id FROM Clientes WHERE documento = ?', ['TORNEO_ADMIN']);
        if (clientes.length > 0) {
            id_cliente = clientes[0].id;
        } else {
            const [insertClient] = await connection.query(
                'INSERT INTO Clientes (nombre, documento, correo, celular) VALUES (?, ?, ?, ?)',
                ['Torneo La Viña', 'TORNEO_ADMIN', 'lavinacanchas@gmail.com', '0000000000']
            );
            id_cliente = insertClient.insertId;
        }

        let reservasCreadas = 0;
        for (const p of partidos) {
            const servicio = p.id_servicio || 1; 
            
            if (p.hora) {
                const hora_inicio = p.hora;
                const [h, m] = hora_inicio.split(':');
                const hora_fin_obj = new Date();
                hora_fin_obj.setHours(parseInt(h) + 1, parseInt(m), 0);
                const hora_fin = \`\${String(hora_fin_obj.getHours()).padStart(2, '0')}:\${String(hora_fin_obj.getMinutes()).padStart(2, '0')}:00\`;

                const [existingRes] = await connection.query(
                    \`SELECT id FROM Reservas 
                     WHERE fecha = ? AND estado != 'cancelado' AND id_servicio = ?
                     AND ( (hora_inicio < ? AND hora_fin > ?) )\`,
                    [fecha, servicio, hora_fin, hora_inicio]
                );

                if (existingRes.length === 0) {
                    await connection.query(
                        'INSERT INTO Reservas (id_cliente, id_servicio, fecha, hora_inicio, hora_fin, abono, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
                        [id_cliente, servicio, fecha, hora_inicio, hora_fin, 0, 'confirmado']
                    );
                    reservasCreadas++;
                }
            }
        }

        await connection.commit();
        res.json({ message: \`Se han reservado exitosamente \${reservasCreadas} canchas para los partidos de la fecha.\` });
    } catch (error) {
        await connection.rollback();
        console.error('Error al reservar canchas:', error);
        res.status(500).json({ message: error.message || 'Error al reservar canchas' });
    } finally {
        connection.release();
    }
};
`;
    // Find where exports.enviarResultadosFecha is, and append it right after
    const targetIdx = controllerCode.indexOf('exports.enviarResultadosFecha');
    if (targetIdx !== -1) {
        const nextExportsIdx = controllerCode.indexOf('exports.', targetIdx + 10);
        if (nextExportsIdx !== -1) {
            controllerCode = controllerCode.slice(0, nextExportsIdx) + reservarMethod + '\n' + controllerCode.slice(nextExportsIdx);
        } else {
            controllerCode += '\n' + reservarMethod;
        }
        fs.writeFileSync(controllerPath, controllerCode);
        console.log('adminController.js patched.');
    } else {
        console.log('Could not find exports.enviarResultadosFecha in adminController.js');
    }
} else {
    console.log('adminController.js already patched.');
}
