const fs = require('fs');

const file = 'backend/src/controllers/adminController.js';
let code = fs.readFileSync(file, 'utf8');

code = code.replace(
    "[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, hora || null, id_servicio || null, id]",
    "[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local || 0, goles_local || 0, equipo_id_vis, puntos_vis || 0, goles_vis || 0, grupo_id_vis, hora || null, id_servicio || null, id]"
);

fs.writeFileSync(file, code);
console.log('Fixed backend update param list.');
