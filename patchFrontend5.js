const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend/src/pages/AdminDashboard.jsx');
let code = fs.readFileSync(frontendPath, 'utf8');

const editPartidoFunc = `
    const editPartido = (p) => {
        setPartidoForm({
            id: p.id,
            fec_torneo_id: p.fec_torneo_id,
            equipo_id_local: p.equipo_id_local,
            grupo_id_local: p.grupo_id_local,
            puntos_local: p.puntos_local || 0,
            equipo_id_vis: p.equipo_id_vis,
            puntos_vis: p.puntos_vis || 0,
            grupo_id_vis: p.grupo_id_vis,
            hora: p.hora || '',
            id_servicio: p.id_servicio || ''
        });
    };
`;

if (!code.includes('const editPartido =')) {
    code = code.replace('const deletePartido = async (id) => {', editPartidoFunc + '\n    const deletePartido = async (id) => {');
}

// Reemplazar la limpieza del formulario en handlePartidoSubmit
const formResetOld = "setPartidoForm({ id: null, fec_torneo_id: selectedFechaForPartidos?.id || '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, equipo_id_vis: '', puntos_vis: 0, grupo_id_vis: '' });";
const formResetNew = "setPartidoForm({ id: null, fec_torneo_id: selectedFechaForPartidos?.id || '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, equipo_id_vis: '', puntos_vis: 0, grupo_id_vis: '', hora: '', id_servicio: '' });";
code = code.replace(formResetOld, formResetNew);

// Añadir el botón en la lista de partidos
const btnSearchLF = '<div className="ml-2 pl-2 border-l border-gray-100 flex items-center h-full">\n                                                                <button onClick={() => deletePartido(pf.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>\n                                                            </div>';
const btnSearchCRLF = '<div className="ml-2 pl-2 border-l border-gray-100 flex items-center h-full">\r\n                                                                <button onClick={() => deletePartido(pf.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>\r\n                                                            </div>';

const btnReplace = '<div className="ml-2 pl-2 border-l border-gray-100 flex items-center h-full gap-1">\n                                                                <button type="button" onClick={() => editPartido(pf)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16} /></button>\n                                                                <button type="button" onClick={() => deletePartido(pf.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>\n                                                            </div>';

if (code.includes(btnSearchLF)) {
    code = code.replace(btnSearchLF, btnReplace);
    console.log('Button patched with LF');
} else if (code.includes(btnSearchCRLF)) {
    code = code.replace(btnSearchCRLF, btnReplace.replace(/\n/g, '\r\n'));
    console.log('Button patched with CRLF');
} else {
    // try a regex approach
    const regex = /<div className="ml-2 pl-2 border-l border-gray-100 flex items-center h-full">\s*<button onClick=\{\(\) => deletePartido\(pf.id\)\} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size=\{16\} \/><\/button>\s*<\/div>/g;
    code = code.replace(regex, btnReplace);
    console.log('Button patched with Regex');
}

fs.writeFileSync(frontendPath, code);
console.log('patchFrontend5 completed.');
