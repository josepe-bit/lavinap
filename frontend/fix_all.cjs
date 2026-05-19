const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Issue 1: Fix equixgrupo.filter
content = content.replace(
    /e\.grupo_id === parseInt\(partidoForm\.grupo_id_local\)/g,
    'e.grupo_id == partidoForm.grupo_id_local'
);
content = content.replace(
    /e\.grupo_id === parseInt\(partidoForm\.grupo_id_vis\)/g,
    'e.grupo_id == partidoForm.grupo_id_vis'
);

// Issue 2: Edit buttons
const editBtnTarget = `<div className="ml-2 pl-2 border-l border-gray-100 flex items-center h-full">
                                                                <button onClick={() => deletePartido(pf.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                                            </div>`;
const editBtnNew = `<div className="ml-2 pl-2 border-l border-gray-100 flex items-center h-full gap-1">
                                                                <button type="button" onClick={() => editPartido(pf)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                                                <button type="button" onClick={() => deletePartido(pf.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                                            </div>`;
content = content.replace(editBtnTarget, editBtnNew);
content = content.replace(editBtnTarget.replace(/\n/g, '\r\n'), editBtnNew.replace(/\n/g, '\r\n')); // CRLF fallback

// Issue 3: The 3 action buttons
const actionBtnsTarget = `                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>`;
const actionBtnsNew = `                                            </ul>
                                        )}
                                    </div>
                                    <div className="mt-6 border-t border-teal-100 pt-4 flex flex-col gap-2">
                                        <button type="button" onClick={() => enviarProgramacion(selectedFechaForPartidos.id)} className="w-full bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700 py-2 flex justify-center items-center gap-2 transition-colors shadow-sm">
                                            <Upload size={16} /> Enviar Programación
                                        </button>
                                        <button type="button" onClick={() => mostrarResultados(selectedFechaForPartidos.id)} className="w-full bg-purple-600 text-white rounded-md font-bold text-sm hover:bg-purple-700 py-2 flex justify-center items-center gap-2 transition-colors shadow-sm">
                                            <Layers size={16} /> Mostrar Resultados
                                        </button>
                                        <button type="button" onClick={() => reservarCanchas(selectedFechaForPartidos.id)} className="w-full bg-emerald-600 text-white rounded-md font-bold text-sm hover:bg-emerald-700 py-2 flex justify-center items-center gap-2 transition-colors shadow-sm">
                                            <CalendarDays size={16} /> Reservar Canchas
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>`;
content = content.replace(actionBtnsTarget, actionBtnsNew);
content = content.replace(actionBtnsTarget.replace(/\n/g, '\r\n'), actionBtnsNew.replace(/\n/g, '\r\n'));

// Issue 4: Labels for goals and points
const labelsLocalTarget = `<div className="grid grid-cols-2 gap-2">
                                                    <input type="number" name="goles_local" value={partidoForm.goles_local} onChange={handlePartidoChange} placeholder="Goles" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    <input type="number" name="puntos_local" value={partidoForm.puntos_local} onChange={handlePartidoChange} placeholder="Puntos" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                </div>`;
const labelsLocalNew = `<div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Goles a Favor</label>
                                                        <input type="number" name="goles_local" value={partidoForm.goles_local} onChange={handlePartidoChange} placeholder="Goles" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Puntos Obtenidos</label>
                                                        <input type="number" name="puntos_local" value={partidoForm.puntos_local} onChange={handlePartidoChange} placeholder="Puntos" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    </div>
                                                </div>`;
content = content.replace(labelsLocalTarget, labelsLocalNew);
content = content.replace(labelsLocalTarget.replace(/\n/g, '\r\n'), labelsLocalNew.replace(/\n/g, '\r\n'));

const labelsVisTarget = `<div className="grid grid-cols-2 gap-2">
                                                    <input type="number" name="goles_vis" value={partidoForm.goles_vis} onChange={handlePartidoChange} placeholder="Goles" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    <input type="number" name="puntos_vis" value={partidoForm.puntos_vis} onChange={handlePartidoChange} placeholder="Puntos" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                </div>`;
const labelsVisNew = `<div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Goles a Favor</label>
                                                        <input type="number" name="goles_vis" value={partidoForm.goles_vis} onChange={handlePartidoChange} placeholder="Goles" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Puntos Obtenidos</label>
                                                        <input type="number" name="puntos_vis" value={partidoForm.puntos_vis} onChange={handlePartidoChange} placeholder="Puntos" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    </div>
                                                </div>`;
content = content.replace(labelsVisTarget, labelsVisNew);
content = content.replace(labelsVisTarget.replace(/\n/g, '\r\n'), labelsVisNew.replace(/\n/g, '\r\n'));

fs.writeFileSync(filePath, content, 'utf8');
console.log("Fixes applied successfully.");
