const fs = require('fs');
let c = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');

c = c.replace('<input type="number" name="puntos_local" value={partidoForm.puntos_local} onChange={handlePartidoChange} placeholder="Goles Local (Opcional)" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />',
    '<div className="flex gap-2"><input type="number" name="goles_local" value={partidoForm.goles_local} onChange={handlePartidoChange} placeholder="Goles Local" className="w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" /><input type="number" name="puntos_local" value={partidoForm.puntos_local} onChange={handlePartidoChange} placeholder="Puntos Local" className="w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" /></div>');

c = c.replace('<input type="number" name="puntos_vis" value={partidoForm.puntos_vis} onChange={handlePartidoChange} placeholder="Goles Visitante (Opcional)" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />',
    '<div className="flex gap-2"><input type="number" name="goles_vis" value={partidoForm.goles_vis} onChange={handlePartidoChange} placeholder="Goles Vis" className="w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" /><input type="number" name="puntos_vis" value={partidoForm.puntos_vis} onChange={handlePartidoChange} placeholder="Puntos Vis" className="w-1/2 border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" /></div>');

c = c.replace('<span className="font-black text-gray-700 bg-gray-100 px-2 rounded">{pf.puntos_local}</span>',
    '<div className="flex gap-1"><span className="font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]" title="Goles">G: {pf.goles_local}</span><span className="font-black text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]" title="Puntos">P: {pf.puntos_local}</span></div>');

c = c.replace('<span className="font-black text-gray-700 bg-gray-100 px-2 rounded">{pf.puntos_vis}</span>',
    '<div className="flex gap-1"><span className="font-black text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]" title="Goles">G: {pf.goles_vis}</span><span className="font-black text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[10px]" title="Puntos">P: {pf.puntos_vis}</span></div>');

fs.writeFileSync('frontend/src/pages/AdminDashboard.jsx', c);
console.log('Frontend patched.');
