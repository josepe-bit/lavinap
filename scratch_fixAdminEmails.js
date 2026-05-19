const fs = require('fs');

async function main() {
    let code = fs.readFileSync('backend/src/controllers/adminController.js', 'utf8');

    // Remove the broken sendFechasEmailWrapper entirely and replace it
    const startIdx = code.indexOf('const sendFechasEmailWrapper');
    const endIdx = code.indexOf('exports.enviarProgramacionFecha =');
    
    if (startIdx !== -1 && endIdx !== -1) {
        const replacement = `const sendFechasEmailWrapper = async (req, res, sendFunc, typeStr, isProgramacion = false) => {
    try {
        const { id } = req.params;

        const [fechas] = await pool.query('SELECT f.fecha, f.hora_inicio as hora_torneo, t.nombre AS torneo_nombre FROM FecxTorneo f JOIN Torneos t ON f.torneo_id = t.id WHERE f.id = ?', [id]);
        if (fechas.length === 0) return res.status(404).json({ message: 'Fecha no encontrada' });
        const { fecha, torneo_nombre, hora_torneo } = fechas[0];

        const [partidos] = await pool.query(\`
            SELECT pf.*,
                   el.nombre AS equipo_local_nombre, ev.nombre AS equipo_vis_nombre,
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

        // Fetch param
        let numerosWhatsapp = [];
        let waText = '';
        if (isProgramacion) {
            const [paramRows] = await pool.query('SELECT * FROM Parametros WHERE id = 1');
            const pa = paramRows[0] || {};
            if (pa.email_establecimiento) emails.add(pa.email_establecimiento);
            if (pa.email_representante) emails.add(pa.email_representante);
            
            if (pa.whatsapp_establecimiento) numerosWhatsapp.push(pa.whatsapp_establecimiento);
            if (pa.telefono_representante) numerosWhatsapp.push(pa.telefono_representante);
            
            waText = \`*Torneo \${torneo_nombre}*\\n*Fecha:* \${fecha}\\n*Hora de inicio:* \${hora_torneo || 'Por definir'}\\n\\n*PROGRAMACIÓN:*\\n\`;
            partidos.forEach(p => {
                waText += \`⌚ \${p.hora ? p.hora.substring(0,5) : 'Por definir'}\\n\`;
                waText += \`⚽ \${p.equipo_local_nombre} (\${p.grupo_local_nombre || 'Local'}) VS \${p.equipo_vis_nombre} (\${p.grupo_vis_nombre || 'Visitante'})\\n\\n\`;
            });
            waText += \`⚠️ *Recomendación:* Llegar temprano para jugar a la hora programada.\`;
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

`;
        code = code.substring(0, startIdx) + replacement + code.substring(endIdx);
        fs.writeFileSync('backend/src/controllers/adminController.js', code);
        console.log('Fixed adminController');
    } else {
        console.log('Could not find wrapper boundaries');
    }
}
main();
