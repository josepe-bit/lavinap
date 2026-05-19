const fs = require('fs');

async function main() {
    let code = fs.readFileSync('backend/src/controllers/adminController.js', 'utf8');

    // 1. Modificar la consulta para incluir 'hora_inicio' de la fecha (y 'hora' de los partidos está listo)
    code = code.replace(
        "const [fechas] = await pool.query('SELECT f.fecha, t.nombre AS torneo_nombre FROM FecxTorneo f JOIN Torneos t ON f.torneo_id = t.id WHERE f.id = ?', [id]);",
        "const [fechas] = await pool.query('SELECT f.fecha, f.hora_inicio as hora_torneo, t.nombre AS torneo_nombre FROM FecxTorneo f JOIN Torneos t ON f.torneo_id = t.id WHERE f.id = ?', [id]);"
    );
    
    // 2. Modificar la abstraccion sendFechasEmailWrapper para soportar parametros extra
    code = code.replace(
        "const sendFechasEmailWrapper = async (req, res, sendFunc, typeStr) => {",
        "const sendFechasEmailWrapper = async (req, res, sendFunc, typeStr, isProgramacion = false) => {"
    );

    code = code.replace(
        "const { fecha, torneo_nombre } = fechas[0];",
        "const { fecha, torneo_nombre, hora_torneo } = fechas[0];"
    );

    // 3. Añadir JOIN a grupos para la programación
    code = code.replace(
        "                   cl.email AS email_local, cv.email AS email_vis",
        "                   cl.email AS email_local, cv.email AS email_vis,\\n                   gl.nombre AS grupo_local_nombre, gv.nombre AS grupo_vis_nombre"
    );

    code = code.replace(
        "            JOIN Clientes cv ON ev.cliente_id = cv.id\\n            WHERE pf.fec_torneo_id = ?",
        "            JOIN Clientes cv ON ev.cliente_id = cv.id\\n            LEFT JOIN Grupos gl ON pf.grupo_id_local = gl.id\\n            LEFT JOIN Grupos gv ON pf.grupo_id_vis = gv.id\\n            WHERE pf.fec_torneo_id = ?"
    );

    // 4. Agregar fetch a parametros si es programacion y generar body para whatsapp
    code = code.replace(
        "        const emailArr = Array.from(emails);",
        `        // Fetch param
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
                waText += \`⌚ \${p.hora || 'Por definir'}\\n\`;
                waText += \`⚽ \${p.equipo_local_nombre} (\${p.grupo_local_nombre || 'Local'}) VS \${p.equipo_vis_nombre} (\${p.grupo_vis_nombre || 'Visitante'})\\n\\n\`;
            });
            waText += \`⚠️ *Recomendación:* Llegar temprano para jugar a la hora programada.\`;
        }

        const emailArr = Array.from(emails);`
    );

    code = code.replace(
        "            fechaDate: new Date(fecha).toLocaleDateString('es-CO'),",
        "            fechaDate: new Date(fecha).toLocaleDateString('es-CO'),\\n            horaTorneo: hora_torneo,"
    );

    code = code.replace(
        "        res.json({ message: typeStr + ' enviada con éxito a ' + emails.size + ' correo(s)' });",
        "        res.json({ message: typeStr + ' enviada con éxito a ' + emails.size + ' correo(s) y contactos', whatsappText: waText, whatsappNumbers: numerosWhatsapp });"
    );

    code = code.replace(
        "    return sendFechasEmailWrapper(req, res, sendProgramacionEmail, 'Programación');",
        "    return sendFechasEmailWrapper(req, res, sendProgramacionEmail, 'Programación', true);"
    );

    fs.writeFileSync('backend/src/controllers/adminController.js', code);
    console.log('Updated adminController.js');
}
main();
