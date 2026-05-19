const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

c = c.replace(/const fetchPromociones = async \(\) => \{[\s\S]*?\}\n    \};/, `const fetchPromociones = async () => {
        try {
            const res = await axios.get(\`\${API_URL}/admin/promociones\`, { headers: getAuthHeaders() });
            setPromociones(res.data.data);
            if (res.data.meta) setMetaPromos(res.data.meta);
        } catch (error) {
            console.error('Error fetching promociones:', error);
        }
    };`);

const regex2 = /const canjearPromocion = async \(id_cliente, tipo_cancha\) => \{[\s\S]*?    \};/;
const replacement2 = `const tomarPromocion = async (id, fecha_tomapromo, hora_tomapromo) => {
        if (!fecha_tomapromo || !hora_tomapromo) {
            alert('Debe digitar la fecha y la hora para tomar la promoción.');
            return;
        }
        if (!window.confirm('¿Confirmar tomar la promoción? Se creará la reserva automáticamente.')) return;
        try {
            const res = await axios.post(\`\${API_URL}/admin/promociones/\${id}/tomar\`, { fecha_tomapromo, hora_tomapromo }, { headers: getAuthHeaders() });
            alert(res.data.message);
            fetchPromociones();
            fetchReservations(); // Actualizar calendario
        } catch (error) {
            alert(error.response?.data?.message || 'Error al tomar la promoción');
        }
    };

    const handlePromocionChange = (e) => {
        const { name, value } = e.target;
        setPromocionForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePromocionSubmit = async (e) => {
        e.preventDefault();
        try {
            if (promocionForm.id) {
                await axios.put(\`\${API_URL}/admin/promociones/\${promocionForm.id}\`, promocionForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(\`\${API_URL}/admin/promociones\`, promocionForm, { headers: getAuthHeaders() });
            }
            setPromocionForm({ id: null, clienteid: '', servicioid: '', cantidad_servicios: '', fecha_ultimoserv: '', fecha_tomapromo: '', hora_tomapromo: '' });
            fetchPromociones();
            alert('Promoción guardada exitosamente');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar la promoción');
        }
    };

    const editPromocion = (p) => {
        setPromocionForm({ 
            id: p.id, 
            clienteid: p.clienteid, 
            servicioid: p.servicioid, 
            cantidad_servicios: p.cantidad_servicios,
            fecha_ultimoserv: p.fecha_ultimoserv ? p.fecha_ultimoserv.substring(0, 10) : '',
            fecha_tomapromo: p.fecha_tomapromo ? p.fecha_tomapromo.substring(0, 10) : '',
            hora_tomapromo: p.hora_tomapromo || ''
        });
    };

    const deletePromocion = async (id) => {
        if (!window.confirm('¿Eliminar registro de promoción?')) return;
        try {
            await axios.delete(\`\${API_URL}/admin/promociones/\${id}\`, { headers: getAuthHeaders() });
            fetchPromociones();
        } catch (error) {
            alert('Error al eliminar promoción');
        }
    };`;

if (!c.includes('tomarPromocion')) {
    c = c.replace(regex2, replacement2);
}

fs.writeFileSync('src/pages/AdminDashboard.jsx', c);
console.log('Replaced successfully');
