const fs = require('fs');

let c = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');
const regex = /const \[tarifaForm, setTarifaForm\][\s\S]*?const \[recurrenteForm, setRecurrenteForm\] = useState\(\{/g;
const replacement = `const [tarifaForm, setTarifaForm] = useState({ id_servicio: '', valor_hora: '' });
const [servicioForm, setServicioForm] = useState({ id: null, nombre: '', descripcion: '' });
const [clienteForm, setClienteForm] = useState({ id: null, nombre: '', documento: '', correo: '', celular: '' });
const [mensajeForm, setMensajeForm] = useState({ id: null, titulo: '', detalle: '', activo: true });
const [usuarioForm, setUsuarioForm] = useState({ id: null, username: '', password: '', rol: 'admin' });
const [promocionForm, setPromocionForm] = useState({ id: null, clienteid: '', servicioid: '', cantidad_servicios: '', fecha_ultimoserv: '', fecha_tomapromo: '', hora_tomapromo: '' });

const [recurrenteForm, setRecurrenteForm] = useState({`;
c = c.replace(regex, replacement);
fs.writeFileSync('src/pages/AdminDashboard.jsx', c);
console.log('Fixed file');
