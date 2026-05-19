const fs = require('fs');
let code = fs.readFileSync('backend/src/controllers/adminController.js', 'utf8');

// Replace the GET query
const getOld = `            SELECT pf.*,
                   el.nombre AS equipo_local_nombre, ev.nombre AS equipo_vis_nombre,
                   gl.nombre AS grupo_local_nombre, gv.nombre AS grupo_vis_nombre,
                   ft.fecha AS fecha_torneo, ft.hora_inicio AS hora_torneo
            FROM ParxFecha pf
            JOIN Equipos el ON pf.equipo_id_local = el.id
            JOIN Equipos ev ON pf.equipo_id_vis = ev.id
            JOIN Grupos gl ON pf.grupo_id_local = gl.id
            JOIN Grupos gv ON pf.grupo_id_vis = gv.id
            JOIN FecxTorneo ft ON pf.fec_torneo_id = ft.id
            ORDER BY ft.fecha ASC, pf.id ASC`;

const getNew = `            SELECT pf.*,
                   el.nombre AS equipo_local_nombre, ev.nombre AS equipo_vis_nombre,
                   gl.nombre AS grupo_local_nombre, gv.nombre AS grupo_vis_nombre,
                   ft.fecha AS fecha_torneo, ft.hora_inicio AS hora_torneo,
                   s.nombre AS servicio_nombre
            FROM ParxFecha pf
            JOIN Equipos el ON pf.equipo_id_local = el.id
            JOIN Equipos ev ON pf.equipo_id_vis = ev.id
            JOIN Grupos gl ON pf.grupo_id_local = gl.id
            JOIN Grupos gv ON pf.grupo_id_vis = gv.id
            JOIN FecxTorneo ft ON pf.fec_torneo_id = ft.id
            LEFT JOIN Servicios s ON pf.id_servicio = s.id
            ORDER BY ft.fecha ASC, pf.id ASC`;

// Replace CREATE query
const createOld1 = `'INSERT INTO ParxFecha (fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, equipo_id_vis, puntos_vis, grupo_id_vis) VALUES (?, ?, ?, ?, ?, ?, ?)',`;
const createNew1 = `'INSERT INTO ParxFecha (fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, hora, id_servicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',`;

const createOld2 = `[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local || 0, equipo_id_vis, puntos_vis || 0, grupo_id_vis]`;
const createNew2 = `[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local || 0, goles_local || 0, equipo_id_vis, puntos_vis || 0, goles_vis || 0, grupo_id_vis, hora || null, id_servicio || null]`;

// Replace UPDATE query
const updateOld1 = `'UPDATE ParxFecha SET fec_torneo_id = ?, equipo_id_local = ?, grupo_id_local = ?, puntos_local = ?, equipo_id_vis = ?, puntos_vis = ?, grupo_id_vis = ? WHERE id = ?',`;
const updateNew1 = `'UPDATE ParxFecha SET fec_torneo_id = ?, equipo_id_local = ?, grupo_id_local = ?, puntos_local = ?, goles_local = ?, equipo_id_vis = ?, puntos_vis = ?, goles_vis = ?, grupo_id_vis = ?, hora = ?, id_servicio = ? WHERE id = ?',`;

const updateOld2 = `[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, equipo_id_vis, puntos_vis, grupo_id_vis, id]`;
const updateNew2 = `[fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local || 0, goles_local || 0, equipo_id_vis, puntos_vis || 0, goles_vis || 0, grupo_id_vis, hora || null, id_servicio || null, id]`;

// We use replace with strings and we ignore newlines by matching them properly.
// Let's replace the EXACT strings or use a simple replace.
code = code.replace(getOld, getNew);
code = code.replace(getOld.replace(/\\n/g, '\\r\\n'), getNew.replace(/\\n/g, '\\r\\n'));

code = code.replace(createOld1, createNew1);
code = code.replace(createOld2, createNew2);

code = code.replace(updateOld1, updateNew1);
code = code.replace(updateOld2, updateNew2);

fs.writeFileSync('backend/src/controllers/adminController.js', code);
console.log('Replaced query strings.');
