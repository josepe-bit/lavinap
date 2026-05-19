const fs = require('fs');

const controllerPath = 'backend/src/controllers/adminController.js';
let code = fs.readFileSync(controllerPath, 'utf8');

// 1. Fix Imports
code = code.replace(
    "const { sendConfirmationEmail } = require('../services/emailService');",
    "const { sendConfirmationEmail, sendProgramacionEmail, sendResultadosEmail } = require('../services/emailService');"
);

// 2. Fix ParxFecha methods
code = code.replace(
    "INSERT INTO ParxFecha (fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    "INSERT INTO ParxFecha (fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, hora, id_servicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
);
code = code.replace(
    "[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local || 0, goles_local || 0, equipo_id_vis, puntos_vis || 0, goles_vis || 0, grupo_id_vis]",
    "[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local === '' ? 0 : puntos_local, goles_local === '' ? 0 : goles_local, equipo_id_vis, puntos_vis === '' ? 0 : puntos_vis, goles_vis === '' ? 0 : goles_vis, grupo_id_vis, hora || null, id_servicio || null]"
);
code = code.replace(
    "UPDATE ParxFecha SET fec_torneo_id = ?, equipo_id_local = ?, grupo_id_local = ?, puntos_local = ?, goles_local = ?, equipo_id_vis = ?, puntos_vis = ?, goles_vis = ?, grupo_id_vis = ? WHERE id = ?",
    "UPDATE ParxFecha SET fec_torneo_id = ?, equipo_id_local = ?, grupo_id_local = ?, puntos_local = ?, goles_local = ?, equipo_id_vis = ?, puntos_vis = ?, goles_vis = ?, grupo_id_vis = ?, hora = ?, id_servicio = ? WHERE id = ?"
);
code = code.replace(
    "[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, id]",
    "[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local === '' ? 0 : puntos_local, goles_local === '' ? 0 : goles_local, equipo_id_vis, puntos_vis === '' ? 0 : puntos_vis, goles_vis === '' ? 0 : goles_vis, grupo_id_vis, hora || null, id_servicio || null, id]"
);

// 3. Delete existing sendFechasEmailWrapper if it exists
const startIdx = code.indexOf('const sendFechasEmailWrapper');
if (startIdx !== -1) {
    code = code.substring(0, startIdx);
}

// 4. Append everything cleanly
code += `
const sendFechasEmailWrapper = async (req, res, sendFunc, typeStr, isProgramacion = false) => {
    const { id } = req.params;
    try {
        const [fechas] = await pool.query('SELECT f.fecha, f.hora_inicio as hora_torneo, t.nombre AS torneo_nombre FROM FecxTorneo f JOIN Torneos t ON f.torneo_id = t.id WHERE f.id = ?', [id]);
        if (fechas.length === 0) {
            return res.status(404).json({ message: 'Fecha no encontrada' });
        }
        const { fecha, torneo_nombre, hora_torneo } = fechas[0];

        const [partidos] = await pool.query(\`
            SELECT pf.*, el.nombre AS equipo_local_nombre, ev.nombre AS equipo_vis_nombre,
                   cl.email AS email_local, cv.email AS email_vis,
                   gl.nombre AS grupo_local_nombre, gv.nombre AS grupo_vis_nombre
            FROM ParxFecha pf
            JOIN Equipos el ON pf.equipo_id_local = el.id
            JOIN Clientes cl ON el.cliente_id = cl.id
            JOIN Equipos ev ON pf.equipo_id_vis = ev.id
            JOIN Clientes cv ON ev.cliente_id = cv.id
            LEFT JOIN Grupos gl ON pf.grupo_id_local = gl.id
            LEFT JOIN Grupos gv ON pf.grupo_id_vis = gv.id
            WHERE pf.fec_torneo_id = ?
        \`, [id]);

        if (partidos.length === 0) {
            return res.status(400).json({ message: 'No hay partidos programados en esta fecha para enviar.' });
        }

        const emails = new Set();
        partidos.forEach(p => {
            if (p.email_local && p.email_local.trim()) emails.add(p.email_local);
            if (p.email_vis && p.email_vis.trim()) emails.add(p.email_vis);
        });

        if (emails.size === 0) {
            return res.status(400).json({ message: 'Ninguno de los equipos seleccionados tiene un correo asociado.' });
        }

        let numerosWhatsapp = [];
        let waText = '';
        const [paramRows] = await pool.query('SELECT * FROM Parametros WHERE id = 1');
        const pa = paramRows[0] || {};
        if (pa.email_establecimiento) emails.add(pa.email_establecimiento);
        if (pa.email_representante) emails.add(pa.email_representante);
        
        if (pa.whatsapp_establecimiento) numerosWhatsapp.push(pa.whatsapp_establecimiento);
        if (pa.telefono_representante) numerosWhatsapp.push(pa.telefono_representante);

        if (isProgramacion) {
            waText = \`*Torneo \${torneo_nombre}*\\n*Fecha:* \${fecha}\\n*Hora de inicio:* \${hora_torneo || 'Por definir'}\\n\\n*PROGRAMACIÓN:*\\n\`;
            partidos.forEach(p => {
                waText += \`⌚ \${p.hora ? p.hora.substring(0,5) : 'Por definir'}\\n\`;
                waText += \`⚽ \${p.equipo_local_nombre} (\${p.grupo_local_nombre || 'Local'}) VS \${p.equipo_vis_nombre} (\${p.grupo_vis_nombre || 'Visitante'})\\n\\n\`;
            });
            waText += \`⚠️ *Recomendación:* Llegar temprano para jugar a la hora programada.\`;
        } else {
            waText = \`*Torneo \${torneo_nombre}*\\n*Fecha jugada:* \${fecha}\\n*Hora de inicio:* \${hora_torneo || 'Por definir'}\\n\\n*RESULTADOS:*\\n\`;
            partidos.forEach(p => {
                waText += \`⌚ \${p.hora ? p.hora.substring(0,5) : 'Por definir'}\\n\`;
                waText += \`⚽ \${p.equipo_local_nombre} (\${p.grupo_local_nombre || 'Local'}) \${p.goles_local || 0} - \${p.goles_vis || 0} \${p.equipo_vis_nombre} (\${p.grupo_vis_nombre || 'Visitante'})\\n\`;
                waText += \`Puntos: \${p.equipo_local_nombre} (\${p.puntos_local || 0}) - \${p.equipo_vis_nombre} (\${p.puntos_vis || 0})\\n\\n\`;
            });
            waText += \`🙏 *Gracias por la participación en la jornada.*\`;
        }

        const emailArr = Array.from(emails);
        const params = {
            to: emailArr.join(', '),
            torneoName: torneo_nombre,
            fechaDate: new Date(fecha).toLocaleDateString('es-CO'),
            horaTorneo: hora_torneo,
            partidos
        };
        const result = await sendFunc(params);
        if(!result || !result.success) {
            return res.status(500).json({ message: 'Error al enviar ' + typeStr });
        }

        res.json({ message: typeStr + ' enviada con éxito a ' + emails.size + ' correo(s) y contactos', whatsappText: waText, whatsappNumbers: numerosWhatsapp });
    } catch (error) {
        console.error('Error al enviar email de fecha:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.enviarProgramacionFecha = async (req, res) => {
    return sendFechasEmailWrapper(req, res, sendProgramacionEmail, 'Programación', true);
};

exports.enviarResultadosFecha = async (req, res) => {
    return sendFechasEmailWrapper(req, res, sendResultadosEmail, 'Resultados');
};

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

fs.writeFileSync(controllerPath, code);
console.log('Backend built super cleanly.');
