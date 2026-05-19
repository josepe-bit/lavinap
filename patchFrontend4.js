const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend/src/pages/AdminDashboard.jsx');
let code = fs.readFileSync(frontendPath, 'utf8');

const funcs = `
    const enviarProgramacion = async (fec_torneo_id) => {
        if (!window.confirm('¿Enviar programación de la fecha por correo y preparar mensaje de WhatsApp?')) return;
        try {
            const res = await axios.post(\`\${API_URL}/admin/fecxtorneo/\${fec_torneo_id}/programacion\`, {}, { headers: getAuthHeaders() });
            alert(res.data.message);
            if (res.data.whatsappText && res.data.whatsappNumbers) {
                res.data.whatsappNumbers.forEach(num => {
                    window.open(\`https://api.whatsapp.com/send?phone=\${num}&text=\${encodeURIComponent(res.data.whatsappText)}\`, '_blank');
                });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error al enviar programación');
        }
    };

    const enviarResultados = async (fec_torneo_id) => {
        if (!window.confirm('¿Enviar resultados de la fecha por correo y preparar mensaje de WhatsApp?')) return;
        try {
            const res = await axios.post(\`\${API_URL}/admin/fecxtorneo/\${fec_torneo_id}/resultados\`, {}, { headers: getAuthHeaders() });
            alert(res.data.message);
            if (res.data.whatsappText && res.data.whatsappNumbers) {
                res.data.whatsappNumbers.forEach(num => {
                    window.open(\`https://api.whatsapp.com/send?phone=\${num}&text=\${encodeURIComponent(res.data.whatsappText)}\`, '_blank');
                });
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Error al enviar resultados');
        }
    };

    const reservarCanchas = async (fec_torneo_id) => {
        if (!window.confirm('¿Confirmar la reserva de las canchas para todos los partidos de esta fecha? Las canchas quedarán ocupadas en el horario de cada partido.')) return;
        try {
            const res = await axios.post(\`\${API_URL}/admin/fecxtorneo/\${fec_torneo_id}/reservar\`, {}, { headers: getAuthHeaders() });
            alert(res.data.message);
            fetchReservations(); // actualiza tabla si hace falta
        } catch (error) {
            alert(error.response?.data?.message || 'Error al reservar canchas');
        }
    };
`;
if (!code.includes('const reservarCanchas =')) {
    const targetIdx = code.indexOf('const updateStatus =');
    if (targetIdx !== -1) {
        code = code.slice(0, targetIdx) + funcs + '\n    ' + code.slice(targetIdx);
    }
}

// Ahora buscamos exactamente donde inyectar los botones.
// Sabemos que está antes de Columna Derecha: Directorio de Fechas
const anchor = '{/* Columna Derecha: Directorio de Fechas */}';
const targetSplit = code.split(anchor);
if (targetSplit.length === 2 && !code.includes('Reservar canchas')) {
    // en targetSplit[0] vamos a buscar el último "</div>" para reemplazarlo por los botones
    const firstPart = targetSplit[0];
    const chunkToFind = '</div>\r\n                                </div>\r\n                            )}\r\n                        </div>\r\n\r\n                        ';
    const chunkToFindLF = '</div>\n                                </div>\n                            )}\n                        </div>\n\n                        ';
    
    const chunkReplacement = `</div>

                                    {/* Action Buttons */}
                                    <div className="mt-4 flex flex-col gap-2 border-t border-teal-100 pt-4">
                                        <div className="flex gap-2">
                                            <button type="button" onClick={() => enviarProgramacion(selectedFechaForPartidos.id)} className="flex-1 bg-blue-500 text-white rounded-md font-bold text-xs hover:bg-blue-600 py-2 transition-colors">
                                                Enviar Programación
                                            </button>
                                            <button type="button" onClick={() => enviarResultados(selectedFechaForPartidos.id)} className="flex-1 bg-purple-500 text-white rounded-md font-bold text-xs hover:bg-purple-600 py-2 transition-colors">
                                                Enviar Resultados
                                            </button>
                                        </div>
                                        <button type="button" onClick={() => reservarCanchas(selectedFechaForPartidos.id)} className="w-full bg-amber-500 text-white rounded-md font-bold text-sm hover:bg-amber-600 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                            <CalendarDays size={16} /> Reservar canchas
                                        </button>
                                    </div>

                                </div>
                            )}
                        </div>

                        `;
                        
    if (firstPart.endsWith(chunkToFind)) {
        code = firstPart.slice(0, -chunkToFind.length) + chunkReplacement.replace(/\n/g, '\r\n') + anchor + targetSplit[1];
        fs.writeFileSync(frontendPath, code);
        console.log('Botones inyectados con CRLF');
    } else if (firstPart.endsWith(chunkToFindLF)) {
        code = firstPart.slice(0, -chunkToFindLF.length) + chunkReplacement + anchor + targetSplit[1];
        fs.writeFileSync(frontendPath, code);
        console.log('Botones inyectados con LF');
    } else {
        console.log('No se pudo encontrar el patron final. Haciendo replace usando indexOf...');
        const replaceStr = '<div className="mt-4 flex flex-col gap-2 border-t border-teal-100 pt-4">\n                                        <div className="flex gap-2">\n                                            <button type="button" onClick={() => enviarProgramacion(selectedFechaForPartidos.id)} className="flex-1 bg-blue-500 text-white rounded-md font-bold text-xs hover:bg-blue-600 py-2 transition-colors">\n                                                Enviar Programación\n                                            </button>\n                                            <button type="button" onClick={() => enviarResultados(selectedFechaForPartidos.id)} className="flex-1 bg-purple-500 text-white rounded-md font-bold text-xs hover:bg-purple-600 py-2 transition-colors">\n                                                Enviar Resultados\n                                            </button>\n                                        </div>\n                                        <button type="button" onClick={() => reservarCanchas(selectedFechaForPartidos.id)} className="w-full bg-amber-500 text-white rounded-md font-bold text-sm hover:bg-amber-600 py-2.5 flex justify-center items-center gap-2 transition-colors">\n                                            <CalendarDays size={16} /> Reservar canchas\n                                        </button>\n                                    </div>\n                                </div>\n                            )}\n                        </div>\n\n                        ';
        const strToFind = '</div>\n                                </div>\n                            )}\n                        </div>\n\n                        ';
        const p1 = firstPart.lastIndexOf(strToFind);
        const strToFindCRLF = '</div>\r\n                                </div>\r\n                            )}\r\n                        </div>\r\n\r\n                        ';
        const p2 = firstPart.lastIndexOf(strToFindCRLF);
        if (p1 !== -1) {
             code = firstPart.substring(0, p1) + replaceStr + anchor + targetSplit[1];
             fs.writeFileSync(frontendPath, code);
             console.log('Inyectado vía lastIndexOf (LF)');
        } else if (p2 !== -1) {
             code = firstPart.substring(0, p2) + replaceStr.replace(/\\n/g, '\\r\\n') + anchor + targetSplit[1];
             fs.writeFileSync(frontendPath, code);
             console.log('Inyectado vía lastIndexOf (CRLF)');
        } else {
             console.log('Falló todo.');
        }
    }
}
