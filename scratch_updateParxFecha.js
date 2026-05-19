const fs = require('fs');

async function main() {
    let code = fs.readFileSync('backend/src/controllers/adminController.js', 'utf8');

    // Update getParxFecha
    code = code.replace(
        "ft.fecha AS fecha_torneo, ft.hora_inicio AS hora_torneo\\n            FROM ParxFecha pf",
        "ft.fecha AS fecha_torneo, ft.hora_inicio AS hora_torneo, s.nombre AS servicio_nombre\\n            FROM ParxFecha pf\\n            LEFT JOIN Servicios s ON pf.id_servicio = s.id"
    );

    // Update createParxFecha
    code = code.replace(
        "const { fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis } = req.body;",
        "const { fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, hora, id_servicio } = req.body;"
    );
    code = code.replace(
        "'INSERT INTO ParxFecha (fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',\\n            [fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local || 0, goles_local || 0, equipo_id_vis, puntos_vis || 0, goles_vis || 0, grupo_id_vis]",
        "'INSERT INTO ParxFecha (fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, hora, id_servicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',\\n            [fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local || 0, goles_local || 0, equipo_id_vis, puntos_vis || 0, goles_vis || 0, grupo_id_vis, hora || null, id_servicio || null]"
    );

    // Update updateParxFecha
    code = code.replace(
        "const { fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis } = req.body;",
        "const { fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, hora, id_servicio } = req.body;"
    );
    code = code.replace(
        "'UPDATE ParxFecha SET fec_torneo_id = ?, equipo_id_local = ?, grupo_id_local = ?, puntos_local = ?, goles_local = ?, equipo_id_vis = ?, puntos_vis = ?, goles_vis = ?, grupo_id_vis = ? WHERE id = ?',\\n            [fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, id]",
        "'UPDATE ParxFecha SET fec_torneo_id = ?, equipo_id_local = ?, grupo_id_local = ?, puntos_local = ?, goles_local = ?, equipo_id_vis = ?, puntos_vis = ?, goles_vis = ?, grupo_id_vis = ?, hora = ?, id_servicio = ? WHERE id = ?',\\n            [fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, hora || null, id_servicio || null, id]"
    );

    fs.writeFileSync('backend/src/controllers/adminController.js', code);
    console.log("Updated adminController.js");
}
main();
