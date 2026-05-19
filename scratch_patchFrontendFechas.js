const fs = require('fs');

async function main() {
    let code = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');

    // 1. Initial State
    code = code.replace(
        "const [partidoForm, setPartidoForm] = useState({\\n        id: null, fec_torneo_id: '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: ''\\n    });",
        "const [partidoForm, setPartidoForm] = useState({\\n        id: null, fec_torneo_id: '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: '', hora: '', id_servicio: ''\\n    });"
    );

    // Reset calls
    code = code.replace(
        /setPartidoForm\(\{ id: null, fec_torneo_id: (.*?), equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: '' \}\)/g,
        "setPartidoForm({ id: null, fec_torneo_id: $1, equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: '', hora: '', id_servicio: '' })"
    );

    // Edit Set form (handleEditParxFecha substitution)
    code = code.replace(
        /puntos_vis: pf\.puntos_vis \|\| 0,\s*goles_vis: pf\.goles_vis \|\| 0,\s*grupo_id_vis: pf\.grupo_id_vis\s*\}\);/,
        "puntos_vis: pf.puntos_vis || 0,\\n            goles_vis: pf.goles_vis || 0,\\n            grupo_id_vis: pf.grupo_id_vis,\\n            hora: pf.hora || '',\\n            id_servicio: pf.id_servicio || ''\\n        });"
    );

    // Render JSX UI
    const jsxToAdd = `                                        {/* Parametros del Partido */}
                                        <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Programación</h4>
                                            <div className="flex gap-2">
                                                <input type="time" name="hora" value={partidoForm.hora || ''} onChange={handlePartidoChange} required className="w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" title="Hora del partido" />
                                                <select name="id_servicio" value={partidoForm.id_servicio || ''} onChange={handlePartidoChange} required className="w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border">
                                                    <option value="">Cancha...</option>
                                                    {servicios.filter(s => s.nombre !== 'Salón de eventos').map(s => (
                                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Local */}`;
    
    code = code.replace(
        "                                        {/* Local */}",
        jsxToAdd
    );

    // Render display
    const displayToAdd = `                                                            <div className="flex flex-col text-xs space-y-1 w-full">
                                                                {(pf.hora || pf.servicio_nombre) && (
                                                                    <div className="text-[10px] text-teal-700 bg-teal-50 rounded px-1.5 py-0.5 text-center font-semibold mb-1">
                                                                        {pf.hora ? pf.hora.substring(0,5) : ''} {pf.hora && pf.servicio_nombre ? '•' : ''} {pf.servicio_nombre || 'Sin Cancha'}
                                                                    </div>
                                                                )}`;
    
    code = code.replace(
        "                                                            <div className=\"flex flex-col text-xs space-y-1 w-full\">",
        displayToAdd
    );

    fs.writeFileSync('frontend/src/pages/AdminDashboard.jsx', code);
    console.log("Updated AdminDashboard.jsx");
}
main();
