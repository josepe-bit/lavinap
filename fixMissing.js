const fs = require('fs');

const path = 'frontend/src/pages/AdminDashboard.jsx';
let code = fs.readFileSync(path, 'utf8');

const missingCode = `    const [fecxtorneo, setFecxtorneo] = useState([]);
    const [parxfecha, setParxfecha] = useState([]);
    const [selectedFechaForPartidos, setSelectedFechaForPartidos] = useState(null);
    const [fechaForm, setFechaForm] = useState({
        id: null, numero_partidos: '', fecha: '', hora_inicio: '', hora_fin: '', torneo_id: ''
    });
    const [partidoForm, setPartidoForm] = useState({
        id: null, fec_torneo_id: '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: '', hora: '', id_servicio: ''
    });

    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();`;

if (!code.includes('const [fecxtorneo, setFecxtorneo] = useState([]);')) {
    code = code.replace('// Fechas & Partidos States', '// Fechas & Partidos States\n' + missingCode);
    fs.writeFileSync(path, code);
    console.log('Fixed missing code');
} else {
    console.log('Code was not missing');
}
