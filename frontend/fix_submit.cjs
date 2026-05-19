const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `<button type="submit" className="flex-1 bg-teal-600 text-white rounded-md font-bold text-sm hover:bg-teal-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                                <Swords size={16} /> Registrar Partido
                                            </button>`;
const newStr = `<button type="submit" className="flex-1 bg-teal-600 text-white rounded-md font-bold text-sm hover:bg-teal-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                                <Swords size={16} /> {partidoForm.id ? 'Actualizar Partido' : 'Registrar Partido'}
                                            </button>
                                            {partidoForm.id && (
                                                <button type="button" onClick={() => setPartidoForm({ id: null, fec_torneo_id: selectedFechaForPartidos.id, hora: '', id_servicio: '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: '' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                    Cancelar
                                                </button>
                                            )}`;

content = content.replace(targetStr, newStr);
content = content.replace(targetStr.replace(/\n/g, '\r\n'), newStr.replace(/\n/g, '\r\n'));

fs.writeFileSync(filePath, content, 'utf8');
console.log("Submit button fixed.");
