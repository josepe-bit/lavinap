const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'pages', 'AdminDashboard.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `                                        )}
                                    </div>
                                </div>
                            )}`;

const newStr = `                                        )}
                                    </div>
                                    <div className="mt-6 border-t border-teal-100 pt-4 flex flex-col gap-2">
                                        <button onClick={() => enviarProgramacion(selectedFechaForPartidos.id)} className="w-full bg-blue-600 text-white rounded-md font-bold text-sm hover:bg-blue-700 py-2 flex justify-center items-center gap-2 transition-colors shadow-sm">
                                            <Upload size={16} /> Enviar Programación
                                        </button>
                                        <button onClick={() => mostrarResultados(selectedFechaForPartidos.id)} className="w-full bg-purple-600 text-white rounded-md font-bold text-sm hover:bg-purple-700 py-2 flex justify-center items-center gap-2 transition-colors shadow-sm">
                                            <Layers size={16} /> Mostrar Resultados
                                        </button>
                                        <button onClick={() => reservarCanchas(selectedFechaForPartidos.id)} className="w-full bg-emerald-600 text-white rounded-md font-bold text-sm hover:bg-emerald-700 py-2 flex justify-center items-center gap-2 transition-colors shadow-sm">
                                            <CalendarDays size={16} /> Reservar Canchas
                                        </button>
                                    </div>
                                </div>
                            )}`;

if (content.includes(targetStr)) {
    content = content.replace(targetStr, newStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Success");
} else {
    // Try with \r\n instead of \n if the targetStr didn't match
    const targetStrCRLF = targetStr.replace(/\n/g, '\r\n');
    if (content.includes(targetStrCRLF)) {
        content = content.replace(targetStrCRLF, newStr.replace(/\n/g, '\r\n'));
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Success with CRLF");
    } else {
        console.log("Not found!");
    }
}
