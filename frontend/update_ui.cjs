const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

// Replace the Promociones table and add form
const oldPromocionesTab = /{activeTab === 'promociones' && \([\s\S]*?\/\* Tab Content: Torneos \*\//;

const newPromocionesTab = `{activeTab === 'promociones' && (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                    <Gift size={20} className="text-amber-500" />
                    {promocionForm.id ? 'Editar Promoción' : 'Nueva Promoción'}
                </h3>
                <form onSubmit={handlePromocionSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                        <select name="clienteid" value={promocionForm.clienteid} onChange={handlePromocionChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border">
                            <option value="">Seleccione un cliente</option>
                            {clientes.map(cli => (
                                <option key={cli.id} value={cli.id}>{cli.nombre} - {cli.documento}</option>
                            ))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                            <select name="servicioid" value={promocionForm.servicioid} onChange={handlePromocionChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border">
                                <option value="">Seleccione</option>
                                <option value="1">Fútbol 8</option>
                                <option value="2">Fútbol 5</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Cant. Juegos</label>
                            <input type="number" name="cantidad_servicios" value={promocionForm.cantidad_servicios} onChange={handlePromocionChange} required min="0" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                        </div>
                    </div>
                    <div className="flex gap-2 pt-2">
                        <button type="submit" className="flex-1 bg-amber-500 text-white rounded-md font-bold text-sm hover:bg-amber-600 py-2.5 flex justify-center items-center gap-2 transition-colors">
                            <Save size={16} /> {promocionForm.id ? 'Actualizar' : 'Crear'}
                        </button>
                        {promocionForm.id && (
                            <button type="button" onClick={() => setPromocionForm({ id: null, clienteid: '', servicioid: '', cantidad_servicios: '', fecha_ultimoserv: '', fecha_tomapromo: '', hora_tomapromo: '' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                Cancelar
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>

        <div className="xl:col-span-2">
            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-yellow-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-amber-500 p-2 rounded-lg">
                                <Gift size={24} className="text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-gray-900">Promociones: {metaPromos} Juegos = 1 Gratis</h2>
                                <p className="text-sm text-gray-500 mt-1">Registros de promociones de los clientes.</p>
                            </div>
                        </div>
                        <button onClick={fetchPromociones} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors">
                            Actualizar
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    {promociones.length === 0 ? (
                        <div className="text-center py-16">
                            <Gift size={48} className="mx-auto text-gray-300 mb-4" />
                            <p className="text-gray-500 font-medium">No hay registros de promociones.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                                <thead className="bg-amber-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-amber-800 uppercase">Cliente</th>
                                        <th className="px-4 py-3 text-left text-xs font-bold text-amber-800 uppercase">Cancha</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-amber-800 uppercase">Progreso</th>
                                        <th className="px-4 py-3 text-center text-xs font-bold text-amber-800 uppercase">Tomar Promoción</th>
                                        <th className="px-4 py-3 text-right text-xs font-bold text-amber-800 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {promociones.map((promo) => (
                                        <tr key={promo.id} className="hover:bg-amber-50/50 transition-colors">
                                            <td className="px-4 py-3">
                                                <div className="text-sm font-bold text-gray-900">{promo.cliente_nombre}</div>
                                                <div className="text-xs text-gray-500">CC: {promo.cliente_documento}</div>
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap">
                                                <span className={\`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full \${promo.servicioid == 1 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}\`}>
                                                    {promo.servicioid == 1 ? '⚽ Fútbol 8' : '🥅 Fútbol 5'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={\`text-lg font-black \${promo.cantidad_servicios >= metaPromos ? 'text-amber-500' : 'text-gray-700'}\`}>
                                                    {promo.cantidad_servicios}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium"> / {metaPromos}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {promo.cantidad_servicios >= metaPromos ? (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex gap-2">
                                                            <input type="date" className="border border-gray-300 rounded text-xs p-1" id={\`fecha_tomapromo_\${promo.id}\`} defaultValue={promo.fecha_tomapromo ? promo.fecha_tomapromo.substring(0, 10) : ''} />
                                                            <input type="time" className="border border-gray-300 rounded text-xs p-1" id={\`hora_tomapromo_\${promo.id}\`} defaultValue={promo.hora_tomapromo || ''} />
                                                        </div>
                                                        <button
                                                            onClick={() => tomarPromocion(promo.id, document.getElementById(\`fecha_tomapromo_\${promo.id}\`).value, document.getElementById(\`hora_tomapromo_\${promo.id}\`).value)}
                                                            className="bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-white px-2 py-1 rounded text-xs font-bold transition-all shadow-md"
                                                        >
                                                            Tomar Promoción
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">Faltan {metaPromos - promo.cantidad_servicios} juegos</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right">
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => editPromocion(promo)} className="text-blue-600 hover:text-blue-900 bg-blue-50 p-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => deletePromocion(promo.id)} className="text-red-600 hover:text-red-900 bg-red-50 p-1.5 rounded-lg hover:bg-red-100 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
)}

{/* Tab Content: Torneos */`;

c = c.replace(oldPromocionesTab, newPromocionesTab);
fs.writeFileSync('src/pages/AdminDashboard.jsx', c);
console.log('Replaced Promociones UI');
