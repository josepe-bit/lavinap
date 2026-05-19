const fs = require('fs');
const path = require('path');

const frontendPath = path.join(__dirname, 'frontend/src/pages/AdminDashboard.jsx');
let code = fs.readFileSync(frontendPath, 'utf8');

const strToFind = '                                        )}\n                                    </div>\n                                </div>\n                            )}';
const strToFindCRLF = '                                        )}\r\n                                    </div>\r\n                                </div>\r\n                            )}';

const replacement = `                                        )}
                                    </div>

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
                            )}`;

if (!code.includes('Reservar canchas')) {
    if (code.includes(strToFind)) {
        code = code.replace(strToFind, replacement);
        fs.writeFileSync(frontendPath, code);
        console.log('AdminDashboard.jsx patched successfully (LF).');
    } else if (code.includes(strToFindCRLF)) {
        code = code.replace(strToFindCRLF, replacement);
        fs.writeFileSync(frontendPath, code);
        console.log('AdminDashboard.jsx patched successfully (CRLF).');
    } else {
        console.log('Strings still not found. Try index based approach.');
        const idx = code.indexOf('Directorio de Fechas Programadas');
        const endOfList = code.lastIndexOf('</div>', idx);
        const endOfBlock = code.lastIndexOf(')}', endOfList);
        const endOfInnerDiv = code.lastIndexOf('</div>', endOfBlock);
        
        // Let's just use string replace on a smaller chunk:
        const chunkToFind = '</div>\n                                </div>\n                            )}';
        const chunkToFindCRLF = '</div>\r\n                                </div>\r\n                            )}';
        const chunkReplacement = '</div>\n\n                                    {/* Action Buttons */}\n                                    <div className="mt-4 flex flex-col gap-2 border-t border-teal-100 pt-4">\n                                        <div className="flex gap-2">\n                                            <button type="button" onClick={() => enviarProgramacion(selectedFechaForPartidos.id)} className="flex-1 bg-blue-500 text-white rounded-md font-bold text-xs hover:bg-blue-600 py-2 transition-colors">\n                                                Enviar Programación\n                                            </button>\n                                            <button type="button" onClick={() => enviarResultados(selectedFechaForPartidos.id)} className="flex-1 bg-purple-500 text-white rounded-md font-bold text-xs hover:bg-purple-600 py-2 transition-colors">\n                                                Enviar Resultados\n                                            </button>\n                                        </div>\n                                        <button type="button" onClick={() => reservarCanchas(selectedFechaForPartidos.id)} className="w-full bg-amber-500 text-white rounded-md font-bold text-sm hover:bg-amber-600 py-2.5 flex justify-center items-center gap-2 transition-colors">\n                                            <CalendarDays size={16} /> Reservar canchas\n                                        </button>\n                                    </div>\n\n                                </div>\n                            )}';
        
        const lastOccur = code.lastIndexOf(chunkToFind, idx);
        const lastOccurCRLF = code.lastIndexOf(chunkToFindCRLF, idx);
        
        if (lastOccur !== -1) {
            code = code.substring(0, lastOccur) + chunkReplacement + code.substring(lastOccur + chunkToFind.length);
            fs.writeFileSync(frontendPath, code);
            console.log('AdminDashboard.jsx patched with lastIndexOf LF');
        } else if (lastOccurCRLF !== -1) {
            code = code.substring(0, lastOccurCRLF) + chunkReplacement.replace(/\n/g, '\r\n') + code.substring(lastOccurCRLF + chunkToFindCRLF.length);
            fs.writeFileSync(frontendPath, code);
            console.log('AdminDashboard.jsx patched with lastIndexOf CRLF');
        } else {
            console.log('Could not patch.');
        }
    }
} else {
    console.log('AdminDashboard.jsx already patched with Reservar canchas.');
}
