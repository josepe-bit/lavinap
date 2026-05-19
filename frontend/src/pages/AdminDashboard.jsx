import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { LogOut, Calendar, CheckCircle, XCircle, LayoutDashboard, DollarSign, Save, Trash2, ClipboardList, Edit, Users, MessageSquare, ShieldCheck, Gift, Eye, EyeOff, ChevronDown, Trophy, Wrench, Menu, X, Dribbble, UsersRound, Layers, CalendarDays, UserPlus, Clock, Swords, Upload } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('reservas');
    const [openCategories, setOpenCategories] = useState({ canchas: true, campeonatos: false, utilidades: false });
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [reservations, setReservations] = useState([]);
    const [tarifas, setTarifas] = useState([]);
    const [servicios, setServicios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [mensajes, setMensajes] = useState([]);
    const [usuarios, setUsuarios] = useState([]);
    const [reservasRecurrentes, setReservasRecurrentes] = useState([]);
    const [promociones, setPromociones] = useState([]);
    const [metaPromos, setMetaPromos] = useState(10);
    
    // Torneos & Premios States
    const [torneos, setTorneos] = useState([]);
    const [premios, setPremios] = useState([]);
    const [selectedTorneoForPremios, setSelectedTorneoForPremios] = useState(null);
    const [torneoForm, setTorneoForm] = useState({
        id: null, nombre: '', fecha_inicio: '', fecha_fin: '', detalle: '',
        estado: 'en_oferta', min_equipos: '', puntos_ganador: '', val_inscripcion: '', jugadoresxequipo: ''
    });
    const [premioForm, setPremioForm] = useState({
        id: null, torneo_id: '', descripcion: '', valor: ''
    });

    // Equipos & Jugadores States
    const [equipos, setEquipos] = useState([]);
    const [jugaxequipo, setJugaxequipo] = useState([]);
    const [selectedEquipoForJugadores, setSelectedEquipoForJugadores] = useState(null);
    const [equipoForm, setEquipoForm] = useState({
        id: null, nombre: '', torneo_id: '', cliente_id: ''
    });
    const [jugadorForm, setJugadorForm] = useState({
        id: null, equipo_id: '', cliente_id: ''
    });

    // Grupos States
    const [grupos, setGrupos] = useState([]);
    const [equixgrupo, setEquixgrupo] = useState([]);
    const [selectedGrupoForEquipos, setSelectedGrupoForEquipos] = useState(null);
    const [grupoForm, setGrupoForm] = useState({
        id: null, nombre: '', torneo_id: '', numero_equipos: '', a_eliminar: '', estado: 'activo'
    });
    const [equixGrupoForm, setEquixGrupoForm] = useState({
        id: null, grupo_id: '', equipo_id: ''
    });

    // Fechas & Partidos States
    const [fecxtorneo, setFecxtorneo] = useState([]);
    const [parxfecha, setParxfecha] = useState([]);
    const [selectedFechaForPartidos, setSelectedFechaForPartidos] = useState(null);
    const [fechaForm, setFechaForm] = useState({
        id: null, numero_partidos: '', fecha: '', hora_inicio: '', hora_fin: '', torneo_id: ''
    });
    const [partidoForm, setPartidoForm] = useState({
        id: null, fec_torneo_id: '', hora: '', id_servicio: '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: ''
    });

    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const navigate = useNavigate();




    const [tarifaForm, setTarifaForm] = useState({
        id_servicio: '',
        valor_hora: ''
    });

    const [servicioForm, setServicioForm] = useState({
        id: null,
        nombre: '',
        descripcion: ''
    });

    const [clienteForm, setClienteForm] = useState({
        id: null,
        nombre: '',
        documento: '',
        correo: '',
        celular: ''
    });

    const [mensajeForm, setMensajeForm] = useState({
        id: null,
        titulo: '',
        detalle: '',
        activo: true
    });

    const [usuarioForm, setUsuarioForm] = useState({
        id: null,
        username: '',
        password: '',
        rol: 'admin'
    });

    const [promocionForm, setPromocionForm] = useState({
        id: null,
        clienteid: '',
        servicioid: '',
        cantidad_servicios: '',
        fecha_ultimoserv: '',
        fecha_tomapromo: '',
        hora_tomapromo: ''
    });

    const [recurrenteForm, setRecurrenteForm] = useState({
        id_cliente: '',
        id_servicio: '1',
        fecha_desde: '',
        fecha_hasta: '',
        dia_semana: '1',
        hora_inicio: '18:00'
    });

    useEffect(() => {
        checkAuthAndFetch();
    }, []);

    const getAuthHeaders = () => {
        const token = localStorage.getItem('lavina_token');
        return { Authorization: `Bearer ${token}` };
    };

    const checkAuthAndFetch = async () => {
        const token = localStorage.getItem('lavina_token');
        const userStr = localStorage.getItem('lavina_user');
        if (!token || !userStr) {
            navigate('/admin/login');
            return;
        }

        const userObj = JSON.parse(userStr);
        setCurrentUser(userObj);

        try {
            await Promise.all([
                fetchReservations(),
                fetchTarifas(),
                fetchServicios(),
                fetchClientes(),
                fetchReservasRecurrentes()
            ]);
        } catch (err) {
            if (err.response?.status === 401 || err.response?.status === 403) {
                localStorage.removeItem('lavina_token');
                navigate('/admin/login');
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchReservations = async () => {
        const res = await axios.get(`${API_URL}/admin/reservations`, { headers: getAuthHeaders() });
        setReservations(res.data);
    };

    const fetchTarifas = async () => {
        const res = await axios.get(`${API_URL}/admin/tarifas`, { headers: getAuthHeaders() });
        setTarifas(res.data);
    };

    const fetchServicios = async () => {
        const res = await axios.get(`${API_URL}/admin/servicios`, { headers: getAuthHeaders() });
        setServicios(res.data);
    };

    const fetchClientes = async () => {
        const res = await axios.get(`${API_URL}/admin/clientes`, { headers: getAuthHeaders() });
        setClientes(res.data);
    };

    const fetchMensajes = async () => {
        const res = await axios.get(`${API_URL}/admin/mensajes`, { headers: getAuthHeaders() });
        setMensajes(res.data);
    };

    const fetchUsuarios = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/usuarios`, { headers: getAuthHeaders() });
            setUsuarios(res.data);
        } catch (error) {
            console.error('Error fetching users', error);
        }
    };

    const fetchReservasRecurrentes = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/reservas-recurrentes/grupos`, { headers: getAuthHeaders() });
            setReservasRecurrentes(res.data);
        } catch (error) {
            console.error('Error fetching recurrent reservations', error);
        }
    };

    const fetchTorneos = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/torneos`, { headers: getAuthHeaders() });
            const data = (res.data || []).map(t => ({
                ...t,
                fecha_inicio: t.fecha_inicio ? new Date(t.fecha_inicio).toISOString().split('T')[0] : '',
                fecha_fin: t.fecha_fin ? new Date(t.fecha_fin).toISOString().split('T')[0] : ''
            }));
            setTorneos(data);
        } catch (error) {
            console.error('Error fetching torneos:', error);
        }
    };

    const fetchPremios = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/premios`, { headers: getAuthHeaders() });
            setPremios(res.data || []);
        } catch (error) {
            console.error('Error fetching premios:', error);
        }
    };

    const fetchEquipos = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/equipos`, { headers: getAuthHeaders() });
            setEquipos(res.data || []);
        } catch (error) {
            console.error('Error fetching equipos:', error);
        }
    };

    const fetchJugaxEquipo = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/jugaxequipo`, { headers: getAuthHeaders() });
            setJugaxequipo(res.data || []);
        } catch (error) {
            console.error('Error fetching jugaxequipo:', error);
        }
    };

    const fetchGrupos = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/grupos`, { headers: getAuthHeaders() });
            setGrupos(res.data || []);
        } catch (error) {
            console.error('Error fetching grupos:', error);
        }
    };

    const fetchEquixGrupo = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/equixgrupo`, { headers: getAuthHeaders() });
            setEquixgrupo(res.data || []);
        } catch (error) {
            console.error('Error fetching equixgrupo:', error);
        }
    };

    const fetchFecxTorneo = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/fecxtorneo`, { headers: getAuthHeaders() });
            setFecxtorneo(res.data || []);
        } catch (error) {
            console.error('Error fetching fecxtorneo:', error);
        }
    };

    const fetchParxFecha = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/parxfecha`, { headers: getAuthHeaders() });
            setParxfecha(res.data || []);
        } catch (error) {
            console.error('Error fetching parxfecha:', error);
        }
    };

    const handleTorneoChange = (e) => {
        const { name, value } = e.target;
        setTorneoForm(prev => ({ ...prev, [name]: value }));
    };

    const handleTorneoSubmit = async (e) => {
        e.preventDefault();
        try {
            if (torneoForm.id) {
                await axios.put(`${API_URL}/admin/torneos/${torneoForm.id}`, torneoForm, { headers: getAuthHeaders() });
                alert('Torneo actualizado exitosamente');
            } else {
                await axios.post(`${API_URL}/admin/torneos`, torneoForm, { headers: getAuthHeaders() });
                alert('Torneo creado exitosamente');
            }
            setTorneoForm({
                id: null, nombre: '', fecha_inicio: '', fecha_fin: '', detalle: '',
                estado: 'en_oferta', min_equipos: '', puntos_ganador: '', val_inscripcion: '', jugadoresxequipo: ''
            });
            fetchTorneos();
        } catch (error) {
            alert('Error al guardar el torneo');
        }
    };

    const editTorneo = (t) => {
        setTorneoForm({ id: t.id, nombre: t.nombre, fecha_inicio: t.fecha_inicio, fecha_fin: t.fecha_fin, detalle: t.detalle, estado: t.estado, min_equipos: t.min_equipos, puntos_ganador: t.puntos_ganador, val_inscripcion: t.val_inscripcion, jugadoresxequipo: t.jugadoresxequipo });
        setSelectedTorneoForPremios(t);
        setPremioForm({ id: null, torneo_id: t.id, descripcion: '', valor: '' });
        setActiveTab('torneos');
    };

    const deleteTorneo = async (id) => {
        if (!window.confirm('¿Eliminar torneo? Se eliminarán todas las asociaciones (equipos, grupos, fechas, etc).')) return;
        try {
            await axios.delete(`${API_URL}/admin/torneos/${id}`, { headers: getAuthHeaders() });
            fetchTorneos();
            if (selectedTorneoForPremios?.id === id) setSelectedTorneoForPremios(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar torneo');
        }
    };

    const handlePremioChange = (e) => {
        const { name, value } = e.target;
        setPremioForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePremioSubmit = async (e) => {
        e.preventDefault();
        try {
            if (premioForm.id) {
                await axios.put(`${API_URL}/admin/premios/${premioForm.id}`, premioForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/premios`, premioForm, { headers: getAuthHeaders() });
            }
            setPremioForm({ id: null, torneo_id: selectedTorneoForPremios?.id || '', descripcion: '', valor: '' });
            fetchPremios();
            alert('Premio guardado exitosamente');
        } catch (error) {
            alert('Error al guardar el premio');
        }
    };

    const editPremio = (p) => {
        setPremioForm({ id: p.id, torneo_id: p.torneo_id, descripcion: p.descripcion, valor: p.valor });
    };

    const deletePremio = async (id) => {
        if (!window.confirm('¿Eliminar premio?')) return;
        try {
            await axios.delete(`${API_URL}/admin/premios/${id}`, { headers: getAuthHeaders() });
            fetchPremios();
        } catch (error) {
            alert('Error al eliminar premio');
        }
    };

    const handleEquipoChange = (e) => {
        const { name, value } = e.target;
        setEquipoForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEquipoSubmit = async (e) => {
        e.preventDefault();

        const targetClienteId = String(equipoForm.cliente_id);
        const targetTorneoId = String(equipoForm.torneo_id);

        const delegateAlreadyInTorneo = equipos.some(eq => {
            return String(eq.cliente_id) === targetClienteId && 
                   String(eq.torneo_id) === targetTorneoId && 
                   eq.id !== equipoForm.id;
        });

        if (delegateAlreadyInTorneo) {
            alert('Error: Este delegado ya se encuentra a cargo de otro equipo en este mismo torneo.');
            return;
        }

        try {
            if (equipoForm.id) {
                await axios.put(`${API_URL}/admin/equipos/${equipoForm.id}`, equipoForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/equipos`, equipoForm, { headers: getAuthHeaders() });
            }
            setEquipoForm({ id: null, nombre: '', torneo_id: '', cliente_id: '' });
            fetchEquipos();
            alert('Equipo guardado exitosamente');
        } catch (error) {
            alert('Error al guardar el equipo');
        }
    };

    const editEquipo = (eq) => {
        setEquipoForm({ id: eq.id, nombre: eq.nombre, torneo_id: eq.torneo_id, cliente_id: eq.cliente_id });
        setSelectedEquipoForJugadores(eq);
        setJugadorForm({ id: null, equipo_id: eq.id, cliente_id: '' });
        setActiveTab('equipos');
    };

    const deleteEquipo = async (id) => {
        if (!window.confirm('¿Eliminar equipo? Se eliminarán todos sus jugadores asociados.')) return;
        try {
            await axios.delete(`${API_URL}/admin/equipos/${id}`, { headers: getAuthHeaders() });
            fetchEquipos();
            if (selectedEquipoForJugadores?.id === id) setSelectedEquipoForJugadores(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar equipo');
        }
    };

    const handleJugadorChange = (e) => {
        const { name, value } = e.target;
        setJugadorForm(prev => ({ ...prev, [name]: value }));
    };

    const handleJugadorSubmit = async (e) => {
        e.preventDefault();

        if (!jugadorForm.id && selectedEquipoForJugadores) {
            const torneoId = selectedEquipoForJugadores.torneo_id;
            
            const torneoDelEquipo = torneos.find(t => t.id === torneoId);
            if (torneoDelEquipo && torneoDelEquipo.jugadoresxequipo > 0) {
                const jugadoresActuales = jugaxequipo.filter(jug => jug.equipo_id === selectedEquipoForJugadores.id).length;
                if (jugadoresActuales >= torneoDelEquipo.jugadoresxequipo) {
                    alert(`No se puede inscribir: El equipo ha alcanzado el límite máximo de ${torneoDelEquipo.jugadoresxequipo} jugadores permitido por el torneo.`);
                    return;
                }
            }

            const targetClienteId = String(jugadorForm.cliente_id);

            const isAlreadyInTorneo = jugaxequipo.some(jug => {
                if (String(jug.cliente_id) === targetClienteId) {
                    const equipoDelJug = equipos.find(eq => eq.id === jug.equipo_id);
                    if (equipoDelJug && equipoDelJug.torneo_id === torneoId) {
                        return true;
                    }
                }
                return false;
            });

            if (isAlreadyInTorneo) {
                alert('No se puede inscribir: Este jugador ya forma parte de un equipo en este mismo torneo.');
                return;
            }
        }

        try {
            if (jugadorForm.id) {
                await axios.put(`${API_URL}/admin/jugaxequipo/${jugadorForm.id}`, jugadorForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/jugaxequipo`, jugadorForm, { headers: getAuthHeaders() });
            }
            setJugadorForm({ id: null, equipo_id: selectedEquipoForJugadores?.id || '', cliente_id: '' });
            fetchJugaxEquipo();
            alert('Jugador asignado exitosamente');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al asignar el jugador al equipo');
        }
    };

    const deleteJugador = async (id) => {
        if (!window.confirm('¿Remover jugador del equipo?')) return;
        try {
            await axios.delete(`${API_URL}/admin/jugaxequipo/${id}`, { headers: getAuthHeaders() });
            fetchJugaxEquipo();
        } catch (error) {
            alert('Error al eliminar jugador');
        }
    };

    const handleGrupoChange = (e) => {
        const { name, value } = e.target;
        setGrupoForm(prev => ({ ...prev, [name]: value }));
    };

    const handleGrupoSubmit = async (e) => {
        e.preventDefault();
        try {
            if (grupoForm.id) {
                await axios.put(`${API_URL}/admin/grupos/${grupoForm.id}`, grupoForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/grupos`, grupoForm, { headers: getAuthHeaders() });
            }
            setGrupoForm({ id: null, nombre: '', torneo_id: '', numero_equipos: '', a_eliminar: '', estado: 'activo' });
            fetchGrupos();
            alert('Grupo guardado exitosamente');
        } catch (error) {
            alert('Error al guardar el grupo');
        }
    };

    const editGrupo = (g) => {
        setGrupoForm({ id: g.id, nombre: g.nombre, torneo_id: g.torneo_id, numero_equipos: g.numero_equipos, a_eliminar: g.a_eliminar, estado: g.estado });
        setSelectedGrupoForEquipos(g);
        setEquixGrupoForm({ id: null, grupo_id: g.id, equipo_id: '' });
        setActiveTab('grupos');
    };

    const deleteGrupo = async (id) => {
        if (!window.confirm('¿Eliminar grupo?')) return;
        try {
            await axios.delete(`${API_URL}/admin/grupos/${id}`, { headers: getAuthHeaders() });
            fetchGrupos();
            if (selectedGrupoForEquipos?.id === id) setSelectedGrupoForEquipos(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar grupo');
        }
    };

    const handleEquixGrupoChange = (e) => {
        const { name, value } = e.target;
        setEquixGrupoForm(prev => ({ ...prev, [name]: value }));
    };

    const handleEquixGrupoSubmit = async (e) => {
        e.preventDefault();

        if (!equixGrupoForm.id) {
            const targetEquipoId = Number(equixGrupoForm.equipo_id);
            const isAlreadyInGroup = equixgrupo.some(eg => Number(eg.equipo_id) === targetEquipoId);
            
            if (isAlreadyInGroup) {
                alert('No se puede añadir: Este equipo ya pertenece a un grupo.');
                return;
            }
        }

        try {
            if (equixGrupoForm.id) {
                await axios.put(`${API_URL}/admin/equixgrupo/${equixGrupoForm.id}`, equixGrupoForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/equixgrupo`, equixGrupoForm, { headers: getAuthHeaders() });
            }
            setEquixGrupoForm({ id: null, grupo_id: selectedGrupoForEquipos?.id || '', equipo_id: '' });
            fetchEquixGrupo();
            alert('Equipo asignado al grupo exitosamente');
        } catch (error) {
            alert('Error al asignar el equipo');
        }
    };

    const deleteEquixGrupo = async (id) => {
        if (!window.confirm('¿Remover equipo del grupo?')) return;
        try {
            await axios.delete(`${API_URL}/admin/equixgrupo/${id}`, { headers: getAuthHeaders() });
            fetchEquixGrupo();
        } catch (error) {
            alert('Error al eliminar equipo del grupo');
        }
    };

    const handleFechaChange = (e) => {
        const { name, value } = e.target;
        setFechaForm(prev => ({ ...prev, [name]: value }));
    };

    const handleFechaSubmit = async (e) => {
        e.preventDefault();
        try {
            if (fechaForm.id) {
                await axios.put(`${API_URL}/admin/fecxtorneo/${fechaForm.id}`, fechaForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/fecxtorneo`, fechaForm, { headers: getAuthHeaders() });
            }
            setFechaForm({ id: null, numero_partidos: '', fecha: '', hora_inicio: '', hora_fin: '', torneo_id: '' });
            fetchFecxTorneo();
            alert('Fecha guardada exitosamente');
        } catch (error) {
            alert('Error al guardar la fecha');
        }
    };

    const editFecha = (f) => {
        const hora_inicio = f.hora_inicio ? f.hora_inicio.substring(0, 5) : '';
        const hora_fin = f.hora_fin ? f.hora_fin.substring(0, 5) : '';
        const fechaFormat = f.fecha ? new Date(f.fecha).toISOString().split('T')[0] : '';
        setFechaForm({ id: f.id, numero_partidos: f.numero_partidos, fecha: fechaFormat, hora_inicio, hora_fin, torneo_id: f.torneo_id });
        setSelectedFechaForPartidos(f);
        setPartidoForm({ id: null, fec_torneo_id: f.id, hora: '', id_servicio: '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: '' });
        setActiveTab('fechas');
    };

    const deleteFecha = async (id) => {
        if (!window.confirm('¿Eliminar fecha?')) return;
        try {
            await axios.delete(`${API_URL}/admin/fecxtorneo/${id}`, { headers: getAuthHeaders() });
            fetchFecxTorneo();
            if (selectedFechaForPartidos?.id === id) setSelectedFechaForPartidos(null);
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar fecha');
        }
    };

    const handlePartidoChange = (e) => {
        const { name, value } = e.target;
        setPartidoForm(prev => ({ ...prev, [name]: value }));
    };

    const handlePartidoSubmit = async (e) => {
        e.preventDefault();
        try {
            if (partidoForm.id) {
                await axios.put(`${API_URL}/admin/parxfecha/${partidoForm.id}`, partidoForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/parxfecha`, partidoForm, { headers: getAuthHeaders() });
            }
            setPartidoForm({ id: null, fec_torneo_id: selectedFechaForPartidos?.id || '', hora: '', id_servicio: '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: '' });
            fetchParxFecha();
            alert('Partido guardado exitosamente');
        } catch (error) {
            alert('Error al guardar partido');
        }
    };

    const deletePartido = async (id) => {
        if (!window.confirm('¿Remover partido de esta fecha?')) return;
        try {
            await axios.delete(`${API_URL}/admin/parxfecha/${id}`, { headers: getAuthHeaders() });
            fetchParxFecha();
        } catch (error) {
            alert('Error al eliminar partido');
        }
    };

    const editPartido = (pf) => {
        setPartidoForm({ 
            id: pf.id, 
            fec_torneo_id: pf.fec_torneo_id, 
            hora: pf.hora ? pf.hora.substring(0, 5) : '', 
            id_servicio: pf.id_servicio || '', 
            equipo_id_local: pf.equipo_id_local, 
            grupo_id_local: pf.grupo_id_local, 
            puntos_local: pf.puntos_local || 0, 
            goles_local: pf.goles_local || 0, 
            equipo_id_vis: pf.equipo_id_vis, 
            puntos_vis: pf.puntos_vis || 0, 
            goles_vis: pf.goles_vis || 0, 
            grupo_id_vis: pf.grupo_id_vis 
        });
    };

    const enviarProgramacion = async (id) => {
        if (!window.confirm('¿Enviar programación de esta fecha por correo a todos los delegados?')) return;
        try {
            await axios.post(`${API_URL}/admin/fecxtorneo/${id}/programacion`, {}, { headers: getAuthHeaders() });
            alert('Programación enviada con éxito');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al enviar programación');
        }
    };

    const mostrarResultados = async (id) => {
        if (!window.confirm('¿Mostrar resultados de esta fecha (Enviar por correo a todos los delegados)?')) return;
        try {
            await axios.post(`${API_URL}/admin/fecxtorneo/${id}/resultados`, {}, { headers: getAuthHeaders() });
            alert('Resultados enviados con éxito');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al enviar resultados');
        }
    };

    const reservarCanchas = async (id) => {
        if (!window.confirm('¿Reservar automáticamente las canchas para todos los partidos de esta fecha? (Estas reservas no sumarán a las promociones)')) return;
        try {
            const res = await axios.post(`${API_URL}/admin/fecxtorneo/${id}/reservar`, {}, { headers: getAuthHeaders() });
            alert(res.data.message || 'Canchas reservadas con éxito');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al reservar canchas');
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await axios.put(`${API_URL}/admin/reservations/${id}/status`, { estado: status }, { headers: getAuthHeaders() });
            setReservations(reservations.map(r => r.id === id ? { ...r, estado: status } : r));
        } catch (err) {
            alert('Error actualizando el estado de la reserva');
        }
    };

    const toggleUtilizada = async (id, currentValue) => {
        try {
            const newValue = !currentValue;
            await axios.put(`${API_URL}/admin/reservations/${id}/utilizada`, { utilizada: newValue }, { headers: getAuthHeaders() });
            setReservations(reservations.map(r => r.id === id ? { ...r, utilizada: newValue } : r));
        } catch (err) {
            alert('Error actualizando el estado de uso');
        }
    };

    const fetchPromociones = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/promociones`, { headers: getAuthHeaders() });
            setPromociones(res.data.data || (Array.isArray(res.data) ? res.data : []));
            if (res.data.meta) setMetaPromos(res.data.meta);
        } catch (error) {
            console.error('Error fetching promociones:', error);
        }
    };

    const tomarPromocion = async (id, fecha_tomapromo, hora_tomapromo) => {
        if (!fecha_tomapromo || !hora_tomapromo) {
            alert('Debe digitar la fecha y la hora para tomar la promoción.');
            return;
        }
        if (!window.confirm('¿Confirmar tomar la promoción? Se creará la reserva automáticamente.')) return;
        try {
            const res = await axios.post(`${API_URL}/admin/promociones/${id}/tomar`, { fecha_tomapromo, hora_tomapromo }, { headers: getAuthHeaders() });
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
                await axios.put(`${API_URL}/admin/promociones/${promocionForm.id}`, promocionForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/promociones`, promocionForm, { headers: getAuthHeaders() });
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
        setActiveTab('promociones');
    };

    const deletePromocion = async (id) => {
        if (!window.confirm('¿Eliminar registro de promoción?')) return;
        try {
            await axios.delete(`${API_URL}/admin/promociones/${id}`, { headers: getAuthHeaders() });
            fetchPromociones();
        } catch (error) {
            alert('Error al eliminar promoción');
        }
    };

    const handleTarifaChange = (e) => {
        const { name, value } = e.target;
        setTarifaForm(prev => ({ ...prev, [name]: value }));
    };

    const handleTarifaSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/admin/tarifas`, tarifaForm, { headers: getAuthHeaders() });
            setTarifaForm({ id_servicio: '', valor_hora: '' });
            fetchTarifas();
            alert('Tarifa guardada exitosamente');
        } catch (error) {
            alert('Error al guardar la tarifa');
        }
    };

    const deleteTarifa = async (id) => {
        if (!window.confirm('¿Eliminar tarifa?')) return;
        try {
            await axios.delete(`${API_URL}/admin/tarifas/${id}`, { headers: getAuthHeaders() });
            fetchTarifas();
        } catch (error) {
            alert('Error al eliminar tarifa');
        }
    };

    const handleServicioChange = (e) => {
        const { name, value } = e.target;
        setServicioForm(prev => ({ ...prev, [name]: value }));
    };

    const handleServicioSubmit = async (e) => {
        e.preventDefault();
        try {
            if (servicioForm.id) {
                await axios.put(`${API_URL}/admin/servicios/${servicioForm.id}`, servicioForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/servicios`, servicioForm, { headers: getAuthHeaders() });
            }
            setServicioForm({ id: null, nombre: '', descripcion: '' });
            fetchServicios();
            alert('Servicio guardado exitosamente');
        } catch (error) {
            alert('Error al guardar el servicio');
        }
    };

    const editServicio = (s) => {
        setServicioForm({ id: s.id, nombre: s.nombre, descripcion: s.descripcion || '' });
        setActiveTab('servicios');
    };

    const deleteServicio = async (id) => {
        if (!window.confirm('¿Eliminar servicio? (Debe no tener reservas o tarifas asociadas)')) return;
        try {
            await axios.delete(`${API_URL}/admin/servicios/${id}`, { headers: getAuthHeaders() });
            fetchServicios();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar servicio');
        }
    };

    const handleClienteChange = (e) => {
        const { name, value } = e.target;
        setClienteForm(prev => ({ ...prev, [name]: value }));
    };

    const handleClienteSubmit = async (e) => {
        e.preventDefault();
        try {
            if (clienteForm.id) {
                await axios.put(`${API_URL}/admin/clientes/${clienteForm.id}`, clienteForm, { headers: getAuthHeaders() });
                alert('Cliente actualizado exitosamente');
            } else {
                await axios.post(`${API_URL}/admin/clientes`, clienteForm, { headers: getAuthHeaders() });
                alert('Cliente registrado exitosamente');
            }
            setClienteForm({ id: null, nombre: '', documento: '', correo: '', celular: '' });
            fetchClientes();
        } catch (error) {
            alert('Error al guardar el cliente');
        }
    };

    const handleExcelUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/admin/clientes/import`, formData, {
                headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' }
            });
            alert(`Importación completada: ${res.data.insertedCount} clientes nuevos añadidos. ${res.data.rejectedCount} clientes ignorados (duplicados o incompletos).`);
            fetchClientes();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al procesar el archivo Excel. Asegúrate de tener el formato correcto.');
        } finally {
            setLoading(false);
            e.target.value = null; // reset input
        }
    };

    const editCliente = (c) => {
        setClienteForm({ id: c.id, nombre: c.nombre, documento: c.documento, correo: c.correo, celular: c.celular });
        setActiveTab('clientes');
    };

    const deleteCliente = async (id) => {
        if (!window.confirm('¿Eliminar cliente?')) return;
        try {
            await axios.delete(`${API_URL}/admin/clientes/${id}`, { headers: getAuthHeaders() });
            fetchClientes();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar cliente');
        }
    };

    const handleMensajeChange = (e) => {
        const { name, value, type, checked } = e.target;
        setMensajeForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };

    const handleMensajeSubmit = async (e) => {
        e.preventDefault();
        try {
            if (mensajeForm.id) {
                await axios.put(`${API_URL}/admin/mensajes/${mensajeForm.id}`, mensajeForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/mensajes`, mensajeForm, { headers: getAuthHeaders() });
            }
            setMensajeForm({ id: null, titulo: '', detalle: '', activo: true });
            fetchMensajes();
            alert('Mensaje guardado exitosamente');
        } catch (error) {
            alert('Error al guardar mensaje');
        }
    };

    const editMensaje = (m) => {
        setMensajeForm({ id: m.id, titulo: m.titulo, detalle: m.detalle, activo: m.activo === 1 || m.activo === true });
        setActiveTab('mensajes');
    };

    const deleteMensaje = async (id) => {
        if (!window.confirm('¿Eliminar mensaje?')) return;
        try {
            await axios.delete(`${API_URL}/admin/mensajes/${id}`, { headers: getAuthHeaders() });
            fetchMensajes();
        } catch (error) {
            alert('Error al eliminar mensaje');
        }
    };

    const handleUsuarioChange = (e) => {
        const { name, value } = e.target;
        setUsuarioForm(prev => ({ ...prev, [name]: value }));
    };

    const handleUsuarioSubmit = async (e) => {
        e.preventDefault();
        try {
            if (usuarioForm.id) {
                await axios.put(`${API_URL}/admin/usuarios/${usuarioForm.id}`, usuarioForm, { headers: getAuthHeaders() });
            } else {
                await axios.post(`${API_URL}/admin/usuarios`, usuarioForm, { headers: getAuthHeaders() });
            }
            setUsuarioForm({ id: null, username: '', password: '', rol: 'admin' });
            fetchUsuarios();
            alert('Usuario guardado exitosamente');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al guardar usuario');
        }
    };

    const editUsuario = (u) => {
        setUsuarioForm({ id: u.id, username: u.username, password: '', rol: u.rol });
        setActiveTab('usuarios');
    };

    const deleteUsuario = async (id) => {
        if (!window.confirm('¿Eliminar usuario?')) return;
        try {
            await axios.delete(`${API_URL}/admin/usuarios/${id}`, { headers: getAuthHeaders() });
            fetchUsuarios();
        } catch (error) {
            alert(error.response?.data?.message || 'Error al eliminar usuario');
        }
    };

    const handleRecurrenteChange = (e) => {
        const { name, value } = e.target;
        setRecurrenteForm(prev => ({ ...prev, [name]: value }));
    };

    const handleRecurrenteSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/admin/reservas-recurrentes`, recurrenteForm, { headers: getAuthHeaders() });
            alert(res.data.message);
            // Reset form
            setRecurrenteForm(prev => ({ ...prev, fecha_desde: '', fecha_hasta: '' }));
            fetchReservasRecurrentes();
            fetchReservations(); // Refresh main calendar/reservations too
        } catch (error) {
            alert(error.response?.data?.message || 'Error creando reservas recurrentes');
        }
    };

    const deleteReservasRecurrentes = async (grupo_id) => {
        if (!window.confirm('¿Seguro que deseas eliminar TODAS las reservas de este grupo abonado?')) return;
        try {
            await axios.delete(`${API_URL}/admin/reservas-recurrentes/grupos/${grupo_id}`, { headers: getAuthHeaders() });
            fetchReservasRecurrentes();
            fetchReservations();
        } catch (error) {
            alert('Error al eliminar reservas recurrentes');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('lavina_token');
        localStorage.removeItem('lavina_user');
        navigate('/admin/login');
    };

    const toggleCategory = (cat) => {
        setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const handleNavClick = (tab, fetchFn) => {
        setActiveTab(tab);
        if (fetchFn) fetchFn();
        setSidebarOpen(false);
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-green-600 font-bold">Cargando...</div>;
    }

    const sidebarNavItems = [
        {
            key: 'canchas',
            label: 'Admin Canchas',
            icon: <LayoutDashboard size={20} />,
            color: 'green',
            items: [
                { key: 'reservas', label: 'Reservas Días', icon: <Calendar size={18} />, fetch: null },
                { key: 'recurrentes', label: 'Abonados / Fijas', icon: <ClipboardList size={18} />, fetch: null },
                { key: 'tarifas', label: 'Tarifas', icon: <DollarSign size={18} />, fetch: () => { fetchTarifas(); fetchServicios(); } },
                { key: 'servicios', label: 'Servicios', icon: <ClipboardList size={18} />, fetch: fetchServicios },
                { key: 'clientes', label: 'Clientes', icon: <Users size={18} />, fetch: fetchClientes },
                { key: 'promociones', label: 'Promociones', icon: <Gift size={18} />, fetch: fetchPromociones },
            ],
        },
        {
            key: 'campeonatos',
            label: 'Campeonatos',
            icon: <Trophy size={20} />,
            color: 'amber',
            items: [
                { key: 'torneos', label: 'Torneos', icon: <Trophy size={18} />, fetch: () => { fetchTorneos(); fetchPremios(); } },
                { key: 'equipos', label: 'Equipos', icon: <Dribbble size={18} />, fetch: () => { fetchEquipos(); fetchJugaxEquipo(); fetchTorneos(); fetchClientes(); } },
                { key: 'grupos', label: 'Grupos', icon: <Layers size={18} />, fetch: () => { fetchGrupos(); fetchEquixGrupo(); fetchTorneos(); fetchEquipos(); } },
                { key: 'fechas', label: 'Fechas', icon: <CalendarDays size={18} />, fetch: () => { fetchFecxTorneo(); fetchParxFecha(); fetchTorneos(); fetchGrupos(); fetchEquipos(); fetchEquixGrupo(); } },
            ],
        },
        {
            key: 'utilidades',
            label: 'Utilidades',
            icon: <Wrench size={20} />,
            color: 'blue',
            adminOnly: true,
            items: [
                { key: 'usuarios', label: 'Usuarios', icon: <ShieldCheck size={18} />, fetch: fetchUsuarios },
                { key: 'mensajes', label: 'Mensajes', icon: <MessageSquare size={18} />, fetch: fetchMensajes },
            ],
        },
    ];

    const colorMap = {
        green: { bg: 'bg-green-600', bgLight: 'bg-green-50', text: 'text-green-700', hoverBg: 'hover:bg-green-50', activeBg: 'bg-green-100', activeText: 'text-green-800', border: 'border-green-500' },
        amber: { bg: 'bg-amber-500', bgLight: 'bg-amber-50', text: 'text-amber-700', hoverBg: 'hover:bg-amber-50', activeBg: 'bg-amber-100', activeText: 'text-amber-800', border: 'border-amber-500' },
        blue: { bg: 'bg-blue-600', bgLight: 'bg-blue-50', text: 'text-blue-700', hoverBg: 'hover:bg-blue-50', activeBg: 'bg-blue-100', activeText: 'text-blue-800', border: 'border-blue-500' },
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navbar */}
            <nav className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-16">
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                            >
                                {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
                            </button>
                            <img src="/logo-la-vina.jpeg" alt="Logo" className="h-10 w-auto rounded" />
                            <span className="text-xl font-bold text-gray-900 hidden sm:block">Panel de Control</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-sm font-medium text-gray-500 hidden sm:block">{currentUser?.username}</span>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg transition-colors font-medium text-sm"
                            >
                                <LogOut size={16} /> Salir
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="flex">
                {/* Mobile Overlay */}
                {sidebarOpen && (
                    <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
                )}

                {/* Sidebar */}
                <aside className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 shadow-lg lg:shadow-none overflow-y-auto transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                    <div className="p-4 space-y-1">
                        {sidebarNavItems.map((category) => {
                            if (category.adminOnly && currentUser?.username !== 'admin') return null;
                            const colors = colorMap[category.color];
                            const isOpen = openCategories[category.key];
                            const hasActiveChild = category.items.some(item => item.key === activeTab);

                            return (
                                <div key={category.key} className="mb-1">
                                    {/* Category Header */}
                                    <button
                                        onClick={() => toggleCategory(category.key)}
                                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                                            hasActiveChild
                                                ? `${colors.activeBg} ${colors.activeText}`
                                                : `text-gray-600 hover:bg-gray-50`
                                        }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-1.5 rounded-lg ${hasActiveChild ? colors.bg + ' text-white' : 'bg-gray-100 text-gray-500'}`}>
                                                {category.icon}
                                            </div>
                                            {category.label}
                                        </div>
                                        <ChevronDown
                                            size={18}
                                            className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : 'rotate-0'} ${hasActiveChild ? colors.activeText : 'text-gray-400'}`}
                                        />
                                    </button>

                                    {/* Category Items */}
                                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                                        <div className="ml-4 pl-4 border-l-2 border-gray-100 space-y-0.5">
                                            {category.items.map((item) => (
                                                <button
                                                    key={item.key}
                                                    onClick={() => handleNavClick(item.key, item.fetch)}
                                                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                                                        activeTab === item.key
                                                            ? `${colors.activeBg} ${colors.activeText} font-bold border-l-2 ${colors.border} -ml-[18px] pl-[26px]`
                                                            : `text-gray-500 ${colors.hoverBg} hover:text-gray-700`
                                                    }`}
                                                >
                                                    {item.icon}
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">

                {/* Tab Content: Reservas */}
                {activeTab === 'reservas' && (
                    <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
                            <h2 className="text-xl font-bold text-gray-900">Monitor de Reservas</h2>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cancha/Servicio</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Cliente</th>
                                        <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Estado</th>
                                        <th scope="col" className="px-6 py-4 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">Utilizada</th>
                                        <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {reservations.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-medium">No hay reservas registradas en el sistema.</td>
                                        </tr>
                                    ) : (
                                        reservations.map((reserva) => (
                                            <tr key={reserva.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center text-sm text-gray-900 font-semibold gap-2">
                                                        <Calendar size={16} className="text-gray-400" />
                                                        {new Date(reserva.fecha).toLocaleDateString('es-CO')}
                                                    </div>
                                                    <div className="text-sm text-gray-500 mt-1">
                                                        {reserva.hora_inicio.substring(0, 5)} - {reserva.hora_fin.substring(0, 5)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800">
                                                        {reserva.servicio_nombre}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-bold text-gray-900">{reserva.cliente_nombre}</div>
                                                    <div className="text-xs text-gray-500 mt-1">CC: {reserva.documento}</div>
                                                    <div className="text-xs text-gray-500">Tel: {reserva.celular}</div>
                                                    <div className="text-xs font-semibold text-green-600 mt-1">Abono: ${Number(reserva.abono).toLocaleString('es-CO')}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {reserva.estado === 'pendiente' && <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-yellow-100 text-yellow-800">Pendiente</span>}
                                                    {reserva.estado === 'confirmado' && <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">Confirmado</span>}
                                                    {reserva.estado === 'cancelado' && <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-red-100 text-red-800">Cancelado</span>}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {reserva.estado === 'confirmado' && (
                                                        <button
                                                            onClick={() => toggleUtilizada(reserva.id, reserva.utilizada)}
                                                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                                                                reserva.utilizada
                                                                    ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 ring-1 ring-emerald-300'
                                                                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 ring-1 ring-gray-200'
                                                            }`}
                                                            title={reserva.utilizada ? 'Marcar como no utilizada' : 'Marcar como utilizada'}
                                                        >
                                                            {reserva.utilizada ? <><Eye size={14} /> Utilizada</> : <><EyeOff size={14} /> No utilizada</>}
                                                        </button>
                                                    )}
                                                    {reserva.estado !== 'confirmado' && (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    {reserva.estado === 'pendiente' && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => updateStatus(reserva.id, 'confirmado')}
                                                                className="text-green-600 hover:text-green-900 bg-green-50 p-2 rounded-full transition-colors"
                                                                title="Confirmar"
                                                            >
                                                                <CheckCircle size={20} />
                                                            </button>
                                                            <button
                                                                onClick={() => updateStatus(reserva.id, 'cancelado')}
                                                                className="text-red-600 hover:text-red-900 bg-red-50 p-2 rounded-full transition-colors"
                                                                title="Cancelar"
                                                            >
                                                                <XCircle size={20} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Tab Content: Reservas Fijas / Recurrentes */}
                {activeTab === 'recurrentes' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Formulario Reservas Fijas */}
                        <div className="col-span-1 border-r border-gray-100 pr-0 lg:pr-8">
                            <div className="bg-white rounded-xl shadow-lg border border-purple-100 p-6 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-purple-50 rounded-bl-full opacity-50 z-0 pointer-events-none"></div>
                                <h3 className="text-xl font-bold text-gray-900 mb-6 relative z-10 flex items-center gap-2 border-b pb-3 border-purple-100">
                                    <ClipboardList className="text-purple-600" />
                                    Nuevo Grupo Abonado
                                </h3>
                                
                                <form onSubmit={handleRecurrenteSubmit} className="space-y-4 relative z-10">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cliente *</label>
                                        <select
                                            name="id_cliente"
                                            value={recurrenteForm.id_cliente}
                                            onChange={handleRecurrenteChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm p-2.5 border bg-white"
                                        >
                                            <option value="">-- Seleccionar Cliente --</option>
                                            {clientes.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre} ({c.documento})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cancha / Servicio *</label>
                                        <select
                                            name="id_servicio"
                                            value={recurrenteForm.id_servicio}
                                            onChange={handleRecurrenteChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm p-2.5 border bg-white"
                                        >
                                            {servicios.map(s => (
                                                <option key={s.id} value={s.id}>{s.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde *</label>
                                            <input type="date" name="fecha_desde" required value={recurrenteForm.fecha_desde} onChange={handleRecurrenteChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm p-2.5 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta *</label>
                                            <input type="date" name="fecha_hasta" required value={recurrenteForm.fecha_hasta} onChange={handleRecurrenteChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm p-2.5 border" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Día de la Semana *</label>
                                        <select name="dia_semana" value={recurrenteForm.dia_semana} onChange={handleRecurrenteChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm p-2.5 border bg-white">
                                            <option value="1">Lunes</option>
                                            <option value="2">Martes</option>
                                            <option value="3">Miércoles</option>
                                            <option value="4">Jueves</option>
                                            <option value="5">Viernes</option>
                                            <option value="6">Sábado</option>
                                            <option value="7">Domingo</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Hora del Alquiler *</label>
                                        <input type="time" name="hora_inicio" required value={recurrenteForm.hora_inicio} onChange={handleRecurrenteChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm p-2.5 border" />
                                    </div>

                                    <div className="pt-2">
                                        <button type="submit" className="w-full bg-purple-600 text-white rounded-md font-bold text-sm hover:bg-purple-700 py-3 flex justify-center items-center gap-2 transition-colors shadow-md hover:shadow-lg">
                                            <Save size={18} /> Generar Reservas
                                        </button>
                                    </div>
                                    <p className="text-xs text-purple-600 bg-purple-50 p-3 rounded-lg border border-purple-100 mt-4 leading-relaxed">
                                        Se generará una reserva individual confirmada para cada fecha del rango iterando según el día de la semana estipulado.
                                    </p>
                                </form>
                            </div>
                        </div>

                        {/* Historial o lista de Abonos Fijos */}
                        <div className="col-span-1 lg:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                    <h2 className="text-xl font-bold text-gray-900">Manejo de Abonados (Grupos)</h2>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    {reservasRecurrentes.length === 0 ? (
                                        <div className="text-center py-10 text-gray-500 font-medium">No hay abonados fijos registrados.</div>
                                    ) : (
                                        <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                            <thead className="bg-purple-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase">Cliente</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase">Servicio</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase">Período</th>
                                                    <th className="px-6 py-3 text-left text-xs font-bold text-purple-800 uppercase">Días Creados</th>
                                                    <th className="px-6 py-3 text-right text-xs font-bold text-purple-800 uppercase">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {reservasRecurrentes.map((grupo) => (
                                                    <tr key={grupo.grupo_id} className="hover:bg-purple-50/50 transition-colors">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900">{grupo.cliente}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">{grupo.servicio}</span>
                                                            <div className="text-xs text-gray-500 mt-1">{grupo.hora_inicio} - {grupo.hora_fin}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-800 font-medium">{new Date(grupo.fecha_desde).toLocaleDateString()} a</div>
                                                            <div className="text-sm text-gray-800 font-medium">{new Date(grupo.fecha_hasta).toLocaleDateString()}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-purple-600 text-center bg-purple-100 rounded-full w-8 h-8 flex items-center justify-center mx-auto shadow-sm">
                                                                {grupo.total_reservas}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => deleteReservasRecurrentes(grupo.grupo_id)}
                                                                className="text-red-600 hover:text-white bg-red-50 hover:bg-red-500 p-2 transform hover:scale-105 rounded-lg transition-all shadow-sm"
                                                                title="Eliminar en bloque"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Tarifas */}
                {activeTab === 'tarifas' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Formulario */}
                        <div className="col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">Asignar Tarifa</h3>
                                <form onSubmit={handleTarifaSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Servicio</label>
                                        <select
                                            name="id_servicio"
                                            value={tarifaForm.id_servicio}
                                            onChange={handleTarifaChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border bg-gray-50"
                                        >
                                            <option value="">Seleccione...</option>
                                            {servicios.map(s => (
                                                <option key={s.id} value={s.id}>{s.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Valor por Hora (COP)</label>
                                        <input
                                            type="number"
                                            name="valor_hora"
                                            min="0"
                                            value={tarifaForm.valor_hora}
                                            onChange={handleTarifaChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                        />
                                    </div>
                                    <button type="submit" className="w-full bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                        <Save size={16} /> Guardar Tarifa
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Lista Tarifas */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">Catálogo Actual</h2>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Servicio</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Valor x Hora</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Actualización</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acción</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {tarifas.length === 0 ? (
                                                <tr>
                                                    <td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No hay tarifas configuradas.</td>
                                                </tr>
                                            ) : (
                                                tarifas.map((t) => (
                                                    <tr key={t.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{t.servicio_nombre}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-bold">${Number(t.valor_hora).toLocaleString('es-CO')}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">{new Date(t.fecha_actualizacion).toLocaleDateString('es-CO')}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <button
                                                                onClick={() => deleteTarifa(t.id)}
                                                                className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors"
                                                            >
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Tab Content: Servicios */}
                {activeTab === 'servicios' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Formulario Servicios */}
                        <div className="col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">{servicioForm.id ? 'Editar Servicio' : 'Nuevo Servicio'}</h3>
                                <form onSubmit={handleServicioSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={servicioForm.nombre}
                                            onChange={handleServicioChange}
                                            required
                                            placeholder="Ej. Fútbol 9"
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                                        <textarea
                                            name="descripcion"
                                            value={servicioForm.descripcion}
                                            onChange={handleServicioChange}
                                            rows="3"
                                            placeholder="Descripción del servicio..."
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                            <Save size={16} /> {servicioForm.id ? 'Actualizar' : 'Guardar'}
                                        </button>
                                        {servicioForm.id && (
                                            <button type="button" onClick={() => setServicioForm({ id: null, nombre: '', descripcion: '' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Lista Servicios */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">Catálogo de Servicios</h2>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nombre</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Descripción</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {servicios.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">No hay servicios configurados.</td>
                                                </tr>
                                            ) : (
                                                servicios.map((s) => (
                                                    <tr key={s.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{s.nombre}</td>
                                                        <td className="px-6 py-4 text-sm text-gray-500">{s.descripcion}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => editServicio(s)}
                                                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteServicio(s.id)}
                                                                    className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                    </div>
                )}

                {/* Tab Content: Clientes */}
                {activeTab === 'clientes' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Formulario Clientes */}
                        <div className="col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">{clienteForm.id ? 'Editar Cliente' : 'Nuevo Cliente'}</h3>
                                <form onSubmit={handleClienteSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                                        <input
                                            type="text"
                                            name="nombre"
                                            value={clienteForm.nombre}
                                            onChange={handleClienteChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Documento</label>
                                        <input
                                            type="text"
                                            name="documento"
                                            value={clienteForm.documento}
                                            onChange={handleClienteChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border bg-gray-50"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo</label>
                                        <input
                                            type="email"
                                            name="correo"
                                            value={clienteForm.correo}
                                            onChange={handleClienteChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Celular</label>
                                        <input
                                            type="text"
                                            name="celular"
                                            value={clienteForm.celular}
                                            onChange={handleClienteChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                            <Save size={16} /> {clienteForm.id ? 'Actualizar' : 'Registrar'}
                                        </button>
                                        {clienteForm.id && (
                                            <button type="button" onClick={() => setClienteForm({ id: null, nombre: '', documento: '', correo: '', celular: '' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Lista Clientes */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between md:items-center gap-4">
                                    <h2 className="text-xl font-bold text-gray-900">Directorio de Clientes</h2>
                                    
                                    {/* Import Excel UI */}
                                    <div className="flex items-center gap-2">
                                        <div className="text-[10px] text-gray-500 hidden lg:block leading-tight text-right mr-2">
                                            Columnas requeridas:<br/>
                                            <span className="font-bold">Nombre, Documento, Correo, Celular</span>
                                        </div>
                                        <label className={`cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-bold rounded-lg shadow-sm text-white ${loading ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}>
                                            <Upload size={16} />
                                            {loading ? 'Procesando...' : 'Importar Excel'}
                                            <input 
                                                type="file" 
                                                accept=".xlsx, .xls" 
                                                onChange={handleExcelUpload} 
                                                className="hidden" 
                                                disabled={loading}
                                            />
                                        </label>
                                    </div>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Nombre</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Contacto</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {clientes.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">No hay clientes registrados.</td>
                                                </tr>
                                            ) : (
                                                clientes.map((c) => (
                                                    <tr key={c.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900">{c.nombre}</div>
                                                            <div className="text-xs text-gray-500 mt-1">CC: {c.documento}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-900">{c.celular}</div>
                                                            <div className="text-xs text-gray-500 mt-1">{c.correo}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => editCliente(c)}
                                                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteCliente(c.id)}
                                                                    className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Mensajes */}
                {activeTab === 'mensajes' && currentUser?.username === 'admin' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Formulario Mensajes */}
                        <div className="col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">{mensajeForm.id ? 'Editar Mensaje' : 'Nuevo Mensaje'}</h3>
                                <form onSubmit={handleMensajeSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Título</label>
                                        <input
                                            type="text"
                                            name="titulo"
                                            value={mensajeForm.titulo}
                                            onChange={handleMensajeChange}
                                            required
                                            placeholder="Ej. Promoción Especial"
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Detalle</label>
                                        <textarea
                                            name="detalle"
                                            value={mensajeForm.detalle}
                                            onChange={handleMensajeChange}
                                            required
                                            rows="3"
                                            placeholder="Detalle promocional visible a todos..."
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                        />
                                    </div>
                                    <div className="flex items-center mt-4">
                                        <input
                                            type="checkbox"
                                            name="activo"
                                            id="activo"
                                            checked={!!mensajeForm.activo}
                                            onChange={handleMensajeChange}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                                        />
                                        <label htmlFor="activo" className="ml-2 block text-sm text-gray-900 font-medium whitespace-nowrap">
                                            Activo (Visible en inicio)
                                        </label>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                            <Save size={16} /> {mensajeForm.id ? 'Actualizar' : 'Publicar'}
                                        </button>
                                        {mensajeForm.id && (
                                            <button type="button" onClick={() => setMensajeForm({ id: null, titulo: '', detalle: '', activo: true })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Lista Mensajes */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">Mensajes y Avisos</h2>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Aviso</th>
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-bold text-gray-500 uppercase">Estado</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {mensajes.length === 0 ? (
                                                <tr>
                                                    <td colSpan="3" className="px-6 py-8 text-center text-sm text-gray-500">No hay mensajes configurados.</td>
                                                </tr>
                                            ) : (
                                                mensajes.map((m) => (
                                                    <tr key={m.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-gray-900">{m.titulo}</div>
                                                            <div className="text-sm text-gray-500 mt-1 line-clamp-2">{m.detalle}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                                            {m.activo ? (
                                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-green-100 text-green-800">Activo</span>
                                                            ) : (
                                                                <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-gray-100 text-gray-800">Inactivo</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                            <div className="flex justify-end gap-2">
                                                                <button
                                                                    onClick={() => editMensaje(m)}
                                                                    className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors"
                                                                >
                                                                    <Edit size={18} />
                                                                </button>
                                                                <button
                                                                    onClick={() => deleteMensaje(m.id)}
                                                                    className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Usuarios */}
                {activeTab === 'usuarios' && currentUser?.username === 'admin' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Formulario Usuarios */}
                        <div className="col-span-1">
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 border-b pb-2">{usuarioForm.id ? 'Editar Usuario' : 'Nuevo Usuario'}</h3>
                                <form onSubmit={handleUsuarioSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                                        <input
                                            type="text"
                                            name="username"
                                            value={usuarioForm.username}
                                            onChange={handleUsuarioChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña {usuarioForm.id && '(Opcional para actualizar)'}</label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={usuarioForm.password}
                                            onChange={handleUsuarioChange}
                                            required={!usuarioForm.id}
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border"
                                            placeholder={usuarioForm.id ? 'Dejar en blanco para no cambiar' : '••••••••'}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                                        <select
                                            name="rol"
                                            value={usuarioForm.rol}
                                            onChange={handleUsuarioChange}
                                            required
                                            className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border bg-gray-50"
                                        >
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2">
                                        <button type="submit" className="flex-1 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                            <Save size={16} /> {usuarioForm.id ? 'Actualizar' : 'Guardar'}
                                        </button>
                                        {usuarioForm.id && (
                                            <button type="button" onClick={() => setUsuarioForm({ id: null, username: '', password: '', rol: 'admin' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>
                        </div>

                        {/* Lista Usuarios */}
                        <div className="col-span-1 md:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">Gestión de Accesos</h2>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Usuario</th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Rol</th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {usuarios.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-bold text-gray-900">{u.username}</div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full bg-blue-100 text-blue-800 uppercase">{u.rol}</span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => editUsuario(u)}
                                                                className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors"
                                                            >
                                                                <Edit size={18} />
                                                            </button>
                                                            {u.username !== 'admin' && (
                                                                <button
                                                                    onClick={() => deleteUsuario(u.id)}
                                                                    className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors"
                                                                >
                                                                    <Trash2 size={18} />
                                                                </button>
                                                            )}
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Promociones */}
                {activeTab === 'promociones' && (
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
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${promo.servicioid == 1 ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                                                    {promo.servicioid == 1 ? '⚽ Fútbol 8' : '🥅 Fútbol 5'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`text-lg font-black ${promo.cantidad_servicios >= metaPromos ? 'text-amber-500' : 'text-gray-700'}`}>
                                                    {promo.cantidad_servicios}
                                                </span>
                                                <span className="text-xs text-gray-400 font-medium"> / {metaPromos}</span>
                                            </td>
                                            <td className="px-4 py-3">
                                                {promo.cantidad_servicios >= metaPromos ? (
                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex gap-2">
                                                            <input type="date" className="border border-gray-300 rounded text-xs p-1" id={`fecha_tomapromo_${promo.id}`} defaultValue={promo.fecha_tomapromo ? promo.fecha_tomapromo.substring(0, 10) : ''} />
                                                            <input type="time" className="border border-gray-300 rounded text-xs p-1" id={`hora_tomapromo_${promo.id}`} defaultValue={promo.hora_tomapromo || ''} />
                                                        </div>
                                                        <button
                                                            onClick={() => tomarPromocion(promo.id, document.getElementById(`fecha_tomapromo_${promo.id}`).value, document.getElementById(`hora_tomapromo_${promo.id}`).value)}
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

{/* Tab Content: Torneos */}
                {activeTab === 'torneos' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Columna Izquierda: Formularios */}
                        <div className="xl:col-span-1 space-y-6">
                            
                            {/* Torneo Form */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                    <Trophy size={20} className="text-amber-500" />
                                    {torneoForm.id ? 'Editar Torneo' : 'Nuevo Torneo'}
                                </h3>
                                <form onSubmit={handleTorneoSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Torneo</label>
                                        <input type="text" name="nombre" value={torneoForm.nombre} onChange={handleTorneoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Inicio</label>
                                            <input type="date" name="fecha_inicio" value={torneoForm.fecha_inicio} onChange={handleTorneoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Fin</label>
                                            <input type="date" name="fecha_fin" value={torneoForm.fecha_fin} onChange={handleTorneoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Detalle / Reglas</label>
                                        <textarea name="detalle" value={torneoForm.detalle} onChange={handleTorneoChange} rows="2" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border"></textarea>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Mínimo Equipos</label>
                                            <input type="number" name="min_equipos" value={torneoForm.min_equipos} onChange={handleTorneoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Jugadores x Eq.</label>
                                            <input type="number" name="jugadoresxequipo" value={torneoForm.jugadoresxequipo} onChange={handleTorneoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Puntos Ganador</label>
                                            <input type="number" name="puntos_ganador" value={torneoForm.puntos_ganador} onChange={handleTorneoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Val. Inscripción</label>
                                            <input type="number" name="val_inscripcion" value={torneoForm.val_inscripcion} onChange={handleTorneoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                            <select name="estado" value={torneoForm.estado} onChange={handleTorneoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border">
                                                <option value="en_oferta">En Oferta</option>
                                                <option value="activo">Activo</option>
                                                <option value="terminado">Terminado</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="flex-1 bg-amber-500 text-white rounded-md font-bold text-sm hover:bg-amber-600 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                            <Save size={16} /> {torneoForm.id ? 'Actualizar Torneo' : 'Crear Torneo'}
                                        </button>
                                        {torneoForm.id && (
                                            <button type="button" onClick={() => setTorneoForm({ id: null, nombre: '', fecha_inicio: '', fecha_fin: '', detalle: '', estado: 'en_oferta', min_equipos: '', puntos_ganador: '', val_inscripcion: '', jugadoresxequipo: '' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Premios Form */}
                            {selectedTorneoForPremios && (
                                <div className="bg-white rounded-xl shadow-lg border border-amber-200 p-6 bg-gradient-to-b from-amber-50 to-white">
                                    <div className="flex justify-between items-center mb-4 border-b border-amber-200 pb-2">
                                        <h3 className="text-lg font-bold text-amber-900 flex items-center gap-2">
                                            <Gift size={20} className="text-amber-500" />
                                            Premios: {torneos.find(t => t.id === selectedTorneoForPremios.id)?.nombre}
                                        </h3>
                                        <button type="button" onClick={() => setSelectedTorneoForPremios(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handlePremioSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción del Premio</label>
                                            <input type="text" name="descripcion" value={premioForm.descripcion} onChange={handlePremioChange} required placeholder="Ej: Primer Puesto, Trofeo + Efectivo" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Valor ($)</label>
                                            <input type="number" name="valor" value={premioForm.valor} onChange={handlePremioChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" className="flex-1 bg-green-600 text-white rounded-md font-bold text-sm hover:bg-green-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                                <Save size={16} /> {premioForm.id ? 'Actualizar Premio' : 'Añadir Premio'}
                                            </button>
                                            {premioForm.id && (
                                                <button type="button" onClick={() => setPremioForm({ id: null, torneo_id: selectedTorneoForPremios.id, descripcion: '', valor: '' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </form>

                                    <div className="mt-6 border-t border-amber-100 pt-4">
                                        <h4 className="text-sm font-bold text-gray-700 mb-3">Premios Actuales</h4>
                                        {premios.filter(p => p.torneo_id === selectedTorneoForPremios.id).length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No hay premios registrados para este torneo.</p>
                                        ) : (
                                            <ul className="space-y-2">
                                                {premios.filter(p => p.torneo_id === selectedTorneoForPremios.id).map(p => (
                                                    <li key={p.id} className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                                                        <div>
                                                            <div className="text-sm font-bold text-gray-900">{p.descripcion}</div>
                                                            <div className="text-xs font-medium text-green-600">${Number(p.valor).toLocaleString('es-CO')}</div>
                                                        </div>
                                                        <div className="flex gap-1">
                                                            <button onClick={() => editPremio(p)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                                            <button onClick={() => deletePremio(p.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
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
                            )}

                        </div>

                        {/* Columna Derecha: Lista de Torneos */}
                        <div className="xl:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">Directorio de Torneos</h2>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Torneo / Fechas</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Estado</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Configuración</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {torneos.length === 0 ? (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No hay torneos registrados.</td></tr>
                                            ) : (
                                                torneos.map(t => (
                                                    <tr key={t.id} className={`hover:bg-amber-50/30 transition-colors ${selectedTorneoForPremios?.id === t.id ? 'bg-amber-50' : ''}`}>
                                                        <td className="px-6 py-4">
                                                            <div className="text-sm font-bold text-gray-900">{t.nombre}</div>
                                                            <div className="text-xs text-gray-500 flex items-center gap-1 mt-1"><Calendar size={12}/> {t.fecha_inicio} - {t.fecha_fin}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-full uppercase
                                                                ${t.estado === 'activo' ? 'bg-green-100 text-green-800' : 
                                                                  t.estado === 'en_oferta' ? 'bg-amber-100 text-amber-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                {t.estado.replace('_', ' ')}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <div className="text-xs text-gray-600">Equipos Min: <span className="font-bold">{t.min_equipos}</span> | Jugadores x Eq: <span className="font-bold">{t.jugadoresxequipo}</span></div>
                                                            <div className="text-xs text-gray-600">Pts Ganador: <span className="font-bold">{t.puntos_ganador}</span></div>
                                                            <div className="text-xs text-gray-600">Inscripción: <span className="font-bold text-green-600">${Number(t.val_inscripcion).toLocaleString('es-CO')}</span></div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <div className="flex justify-end gap-2 text-sm">
                                                                <button 
                                                                    title="Gestionar Premios"
                                                                    onClick={() => editTorneo(t)}
                                                                    className={`p-1.5 rounded-md transition-colors ${selectedTorneoForPremios?.id === t.id ? 'bg-amber-500 text-white' : 'bg-amber-50 text-amber-600 hover:bg-amber-100'}`}
                                                                >
                                                                    <Gift size={18} />
                                                                </button>
                                                                <button title="Editar Torneo" onClick={() => editTorneo(t)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors"><Edit size={18} /></button>
                                                                <button title="Eliminar Torneo" onClick={() => deleteTorneo(t.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={18} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Equipos */}
                {activeTab === 'equipos' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Columna Izquierda: Formularios */}
                        <div className="xl:col-span-1 space-y-6">
                            
                            {/* Equipo Form */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                    <Dribbble size={20} className="text-amber-500" />
                                    {equipoForm.id ? 'Editar Equipo' : 'Nuevo Equipo'}
                                </h3>
                                <form onSubmit={handleEquipoSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Equipo</label>
                                        <input type="text" name="nombre" value={equipoForm.nombre} onChange={handleEquipoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Torneo</label>
                                        <select name="torneo_id" value={equipoForm.torneo_id} onChange={handleEquipoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border">
                                            <option value="">Selecciona un torneo...</option>
                                            {torneos.filter(t => t.estado === 'activo' || t.estado === 'en_oferta' || t.id === equipoForm.torneo_id).map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="block text-sm font-medium text-gray-700">Delegado (Cliente)</label>
                                            <button type="button" onClick={() => { setActiveTab('clientes'); setOpenCategories({ ...openCategories, canchas: true }); }} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                                                <UserPlus size={14} /> Nuevo
                                            </button>
                                        </div>
                                        <select name="cliente_id" value={equipoForm.cliente_id} onChange={handleEquipoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500 text-sm p-2.5 border">
                                            <option value="">Selecciona un delegado...</option>
                                            {clientes.map(c => (
                                                <option key={c.id} value={c.id}>{c.nombre} ({c.documento})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="flex-1 bg-amber-500 text-white rounded-md font-bold text-sm hover:bg-amber-600 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                            <Save size={16} /> {equipoForm.id ? 'Actualizar Equipo' : 'Crear Equipo'}
                                        </button>
                                        {equipoForm.id && (
                                            <button type="button" onClick={() => setEquipoForm({ id: null, nombre: '', torneo_id: '', cliente_id: '' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Jugadores Form */}
                            {selectedEquipoForJugadores && (
                                <div className="bg-white rounded-xl shadow-lg border border-blue-200 p-6 bg-gradient-to-b from-blue-50 to-white">
                                    <div className="flex justify-between items-center mb-4 border-b border-blue-200 pb-2">
                                        <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2">
                                            <Users size={20} className="text-blue-500" />
                                            Jugadores: {equipos.find(e => e.id === selectedEquipoForJugadores.id)?.nombre}
                                        </h3>
                                        <button type="button" onClick={() => setSelectedEquipoForJugadores(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleJugadorSubmit} className="space-y-4">
                                        <div>
                                            <div className="flex justify-between items-center mb-1">
                                                <label className="block text-sm font-medium text-gray-700">Añadir Jugador (Cliente)</label>
                                                <button type="button" onClick={() => { setActiveTab('clientes'); setOpenCategories({ ...openCategories, canchas: true }); }} className="text-xs text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1">
                                                    <UserPlus size={14} /> Nuevo
                                                </button>
                                            </div>
                                            <select name="cliente_id" value={jugadorForm.cliente_id} onChange={handleJugadorChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm p-2.5 border">
                                                <option value="">Selecciona un jugador...</option>
                                                {clientes.map(c => (
                                                    <option key={c.id} value={c.id}>{c.nombre} ({c.documento})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" className="flex-1 bg-green-600 text-white rounded-md font-bold text-sm hover:bg-green-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                                <UserPlus size={16} /> Añadir Jugador
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-6 border-t border-blue-100 pt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-bold text-gray-700">Jugadores Inscritos</h4>
                                            <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-1 rounded-full">
                                                {jugaxequipo.filter(j => j.equipo_id === selectedEquipoForJugadores.id).length} inscritos
                                            </span>
                                        </div>
                                        {jugaxequipo.filter(j => j.equipo_id === selectedEquipoForJugadores.id).length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No hay jugadores en este equipo.</p>
                                        ) : (
                                            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {jugaxequipo.filter(j => j.equipo_id === selectedEquipoForJugadores.id).map(j => (
                                                    <li key={j.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                                                        <div className="text-sm font-medium text-gray-900 truncate pr-2">{j.cliente_nombre}</div>
                                                        <button onClick={() => deleteJugador(j.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Columna Derecha: Lista de Equipos */}
                        <div className="xl:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">Directorio de Equipos</h2>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Equipo</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Torneo</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Delegado</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {equipos.length === 0 ? (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No hay equipos registrados.</td></tr>
                                            ) : (
                                                equipos.map(e => (
                                                    <tr key={e.id} className={`hover:bg-blue-50/30 transition-colors ${selectedEquipoForJugadores?.id === e.id ? 'bg-blue-50' : ''}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2"><Dribbble size={14} className="text-amber-500"/> {e.nombre}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{e.torneo_nombre}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600">{e.cliente_nombre}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <div className="flex justify-end gap-2 text-sm">
                                                                <button 
                                                                    title="Gestionar Jugadores"
                                                                    onClick={() => editEquipo(e)}
                                                                    className={`p-1.5 rounded-md transition-colors ${selectedEquipoForJugadores?.id === e.id ? 'bg-blue-500 text-white' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                                                                >
                                                                    <Users size={18} />
                                                                </button>
                                                                <button title="Editar Equipo" onClick={() => editEquipo(e)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors"><Edit size={18} /></button>
                                                                <button title="Eliminar Equipo" onClick={() => deleteEquipo(e.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={18} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Grupos */}
                {activeTab === 'grupos' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Columna Izquierda: Formularios */}
                        <div className="xl:col-span-1 space-y-6">
                            
                            {/* Grupo Form */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                    <Layers size={20} className="text-indigo-500" />
                                    {grupoForm.id ? 'Editar Grupo' : 'Nuevo Grupo'}
                                </h3>
                                <form onSubmit={handleGrupoSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del Grupo</label>
                                        <input type="text" name="nombre" value={grupoForm.nombre} onChange={handleGrupoChange} required placeholder="Ej: Grupo A" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Torneo</label>
                                        <select name="torneo_id" value={grupoForm.torneo_id} onChange={handleGrupoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border">
                                            <option value="">Selecciona un torneo...</option>
                                            {torneos.filter(t => t.estado === 'activo' || t.estado === 'en_oferta' || t.id === grupoForm.torneo_id).map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Nº Equipos</label>
                                            <input type="number" name="numero_equipos" value={grupoForm.numero_equipos} onChange={handleGrupoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">A eliminar</label>
                                            <input type="number" name="a_eliminar" value={grupoForm.a_eliminar} onChange={handleGrupoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                                        <select name="estado" value={grupoForm.estado} onChange={handleGrupoChange} className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm p-2.5 border">
                                            <option value="activo">Activo</option>
                                            <option value="inactivo">Inactivo</option>
                                        </select>
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="flex-1 bg-indigo-600 text-white rounded-md font-bold text-sm hover:bg-indigo-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                            <Save size={16} /> {grupoForm.id ? 'Actualizar Grupo' : 'Crear Grupo'}
                                        </button>
                                        {grupoForm.id && (
                                            <button type="button" onClick={() => setGrupoForm({ id: null, nombre: '', torneo_id: '', numero_equipos: '', a_eliminar: '', estado: 'activo' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Equipos por Grupo Form */}
                            {selectedGrupoForEquipos && (
                                <div className="bg-white rounded-xl shadow-lg border border-purple-200 p-6 bg-gradient-to-b from-purple-50 to-white">
                                    <div className="flex justify-between items-center mb-4 border-b border-purple-200 pb-2">
                                        <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
                                            <Dribbble size={20} className="text-purple-500" />
                                            Equipos en: {grupos.find(g => g.id === selectedGrupoForEquipos.id)?.nombre}
                                        </h3>
                                        <button type="button" onClick={() => setSelectedGrupoForEquipos(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handleEquixGrupoSubmit} className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Añadir Equipo</label>
                                            <select name="equipo_id" value={equixGrupoForm.equipo_id} onChange={handleEquixGrupoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-sm p-2.5 border">
                                                <option value="">Selecciona un equipo...</option>
                                                {/* Filter equipos to only show those belonging to the same Torneo as the Grupo */}
                                                {equipos.filter(e => e.torneo_id === selectedGrupoForEquipos.torneo_id).map(e => (
                                                    <option key={e.id} value={e.id}>{e.nombre} ({e.cliente_nombre})</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" className="flex-1 bg-purple-600 text-white rounded-md font-bold text-sm hover:bg-purple-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                                <UserPlus size={16} /> Añadir al Grupo
                                            </button>
                                        </div>
                                    </form>

                                    <div className="mt-6 border-t border-purple-100 pt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-bold text-gray-700">Equipos Inscritos</h4>
                                            <span className="text-xs font-medium text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                                                {equixgrupo.filter(eg => eg.grupo_id === selectedGrupoForEquipos.id).length} inscritos
                                            </span>
                                        </div>
                                        {equixgrupo.filter(eg => eg.grupo_id === selectedGrupoForEquipos.id).length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No hay equipos en este grupo.</p>
                                        ) : (
                                            <ul className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                                {equixgrupo.filter(eg => eg.grupo_id === selectedGrupoForEquipos.id).map(eg => (
                                                    <li key={eg.id} className="flex justify-between items-center bg-white p-2 rounded border border-gray-100 shadow-sm">
                                                        <div className="text-sm font-medium text-gray-900 truncate pr-2">{eg.equipo_nombre}</div>
                                                        <button onClick={() => deleteEquixGrupo(eg.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={14} /></button>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Columna Derecha: Lista de Grupos */}
                        <div className="xl:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">Directorio de Grupos</h2>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Grupo</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Torneo</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Configuración</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {grupos.length === 0 ? (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No hay grupos registrados.</td></tr>
                                            ) : (
                                                grupos.map(g => (
                                                    <tr key={g.id} className={`hover:bg-indigo-50/30 transition-colors ${selectedGrupoForEquipos?.id === g.id ? 'bg-indigo-50' : ''}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2"><Layers size={14} className="text-indigo-500"/> {g.nombre}</div>
                                                            <span className={`mt-1 px-2 py-0.5 inline-flex text-[10px] leading-4 font-bold rounded-full uppercase ${g.estado === 'activo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                                                                {g.estado}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600 font-medium">{g.torneo_nombre}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-xs text-gray-600">Cupos: <span className="font-bold">{g.numero_equipos}</span></div>
                                                            <div className="text-xs text-gray-600">A eliminar: <span className="font-bold text-red-500">{g.a_eliminar}</span></div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <div className="flex justify-end gap-2 text-sm">
                                                                <button 
                                                                    title="Gestionar Equipos"
                                                                    onClick={() => editGrupo(g)}
                                                                    className={`p-1.5 rounded-md transition-colors ${selectedGrupoForEquipos?.id === g.id ? 'bg-indigo-500 text-white' : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'}`}
                                                                >
                                                                    <Dribbble size={18} />
                                                                </button>
                                                                <button title="Editar Grupo" onClick={() => editGrupo(g)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors"><Edit size={18} /></button>
                                                                <button title="Eliminar Grupo" onClick={() => deleteGrupo(g.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={18} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tab Content: Fechas */}
                {activeTab === 'fechas' && (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                        {/* Columna Izquierda: Formularios */}
                        <div className="xl:col-span-1 space-y-6">
                            
                            {/* Fecha Form */}
                            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                                <h3 className="flex items-center gap-2 text-lg font-bold text-gray-900 mb-4 border-b pb-2">
                                    <CalendarDays size={20} className="text-emerald-500" />
                                    {fechaForm.id ? 'Editar Fecha' : 'Programar Fecha'}
                                </h3>
                                <form onSubmit={handleFechaSubmit} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Torneo</label>
                                        <select name="torneo_id" value={fechaForm.torneo_id} onChange={handleFechaChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm p-2.5 border">
                                            <option value="">Selecciona un torneo...</option>
                                            {torneos.filter(t => t.estado === 'activo' || t.estado === 'en_oferta' || t.id === fechaForm.torneo_id).map(t => (
                                                <option key={t.id} value={t.id}>{t.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Día de la Fecha</label>
                                        <input type="date" name="fecha" value={fechaForm.fecha} onChange={handleFechaChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm p-2.5 border" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio</label>
                                            <input type="time" name="hora_inicio" value={fechaForm.hora_inicio} onChange={handleFechaChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm p-2.5 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin</label>
                                            <input type="time" name="hora_fin" value={fechaForm.hora_fin} onChange={handleFechaChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm p-2.5 border" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nº Partidos Programados</label>
                                        <input type="number" name="numero_partidos" value={fechaForm.numero_partidos} onChange={handleFechaChange} required placeholder="Ej: 5" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-emerald-500 focus:border-emerald-500 text-sm p-2.5 border" />
                                    </div>
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" className="flex-1 bg-emerald-500 text-white rounded-md font-bold text-sm hover:bg-emerald-600 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                            <Save size={16} /> {fechaForm.id ? 'Actualizar Fecha' : 'Crear Fecha'}
                                        </button>
                                        {fechaForm.id && (
                                            <button type="button" onClick={() => setFechaForm({ id: null, numero_partidos: '', fecha: '', hora_inicio: '', hora_fin: '', torneo_id: '' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                Cancelar
                                            </button>
                                        )}
                                    </div>
                                </form>
                            </div>

                            {/* Partidos Form */}
                            {selectedFechaForPartidos && (
                                <div className="bg-white rounded-xl shadow-lg border border-teal-200 p-6 bg-gradient-to-b from-teal-50 to-white">
                                    <div className="flex justify-between items-center mb-4 border-b border-teal-200 pb-2">
                                        <h3 className="text-lg font-bold text-teal-900 flex items-center gap-2">
                                            <Swords size={20} className="text-teal-600" />
                                            Partidos del {new Date(selectedFechaForPartidos.fecha).toLocaleDateString()}
                                        </h3>
                                        <button type="button" onClick={() => setSelectedFechaForPartidos(null)} className="text-gray-400 hover:text-gray-700"><X size={20} /></button>
                                    </div>
                                    <form onSubmit={handlePartidoSubmit} className="space-y-4">
                                        {/* Datos del Partido */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Hora</label>
                                                <input type="time" name="hora" value={partidoForm.hora} onChange={handlePartidoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cancha (Servicio)</label>
                                                <select name="id_servicio" value={partidoForm.id_servicio} onChange={handlePartidoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border">
                                                    <option value="">Seleccione Cancha...</option>
                                                    {servicios.map(s => (
                                                        <option key={s.id} value={s.id}>{s.nombre}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Local */}
                                        <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Equipo Local</h4>
                                            <div className="space-y-2">
                                                <select name="grupo_id_local" value={partidoForm.grupo_id_local} onChange={handlePartidoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border">
                                                    <option value="">Grupo Local...</option>
                                                    {grupos.filter(g => g.torneo_id === selectedFechaForPartidos.torneo_id).map(g => (
                                                        <option key={g.id} value={g.id}>{g.nombre}</option>
                                                    ))}
                                                </select>
                                                <select name="equipo_id_local" value={partidoForm.equipo_id_local} onChange={handlePartidoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border">
                                                    <option value="">Equipo Local...</option>
                                                    {equixgrupo.filter(e => e.grupo_id == partidoForm.grupo_id_local).map(e => (
                                                        <option key={e.equipo_id} value={e.equipo_id}>{e.equipo_nombre}</option>
                                                    ))}
                                                </select>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Goles a Favor</label>
                                                        <input type="number" name="goles_local" value={partidoForm.goles_local} onChange={handlePartidoChange} placeholder="Goles" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Puntos Obtenidos</label>
                                                        <input type="number" name="puntos_local" value={partidoForm.puntos_local} onChange={handlePartidoChange} placeholder="Puntos" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-center font-black text-gray-300 text-xl flex justify-center items-center py-0">VS</div>

                                        {/* Visitante */}
                                        <div className="bg-white p-3 rounded border border-gray-100 shadow-sm">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Equipo Visitante</h4>
                                            <div className="space-y-2">
                                                <select name="grupo_id_vis" value={partidoForm.grupo_id_vis} onChange={handlePartidoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border">
                                                    <option value="">Grupo Visitante...</option>
                                                    {grupos.filter(g => g.torneo_id === selectedFechaForPartidos.torneo_id).map(g => (
                                                        <option key={g.id} value={g.id}>{g.nombre}</option>
                                                    ))}
                                                </select>
                                                <select name="equipo_id_vis" value={partidoForm.equipo_id_vis} onChange={handlePartidoChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border">
                                                    <option value="">Equipo Visitante...</option>
                                                    {equixgrupo.filter(e => e.grupo_id == partidoForm.grupo_id_vis).map(e => (
                                                        <option key={e.equipo_id} value={e.equipo_id}>{e.equipo_nombre}</option>
                                                    ))}
                                                </select>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Goles a Favor</label>
                                                        <input type="number" name="goles_vis" value={partidoForm.goles_vis} onChange={handlePartidoChange} placeholder="Goles" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Puntos Obtenidos</label>
                                                        <input type="number" name="puntos_vis" value={partidoForm.puntos_vis} onChange={handlePartidoChange} placeholder="Puntos" className="w-full border-gray-300 rounded-md shadow-sm focus:ring-teal-500 focus:border-teal-500 text-xs p-2 border" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2 pt-2">
                                            <button type="submit" className="flex-1 bg-teal-600 text-white rounded-md font-bold text-sm hover:bg-teal-700 py-2.5 flex justify-center items-center gap-2 transition-colors">
                                                <Swords size={16} /> {partidoForm.id ? 'Actualizar Partido' : 'Registrar Partido'}
                                            </button>
                                            {partidoForm.id && (
                                                <button type="button" onClick={() => setPartidoForm({ id: null, fec_torneo_id: selectedFechaForPartidos.id, hora: '', id_servicio: '', equipo_id_local: '', grupo_id_local: '', puntos_local: 0, goles_local: 0, equipo_id_vis: '', puntos_vis: 0, goles_vis: 0, grupo_id_vis: '' })} className="bg-gray-200 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-300 px-4 py-2.5 transition-colors">
                                                    Cancelar
                                                </button>
                                            )}
                                        </div>
                                    </form>

                                    {/* Lista de Partidos */}
                                    <div className="mt-6 border-t border-teal-100 pt-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-sm font-bold text-gray-700">Partidos Registrados</h4>
                                            <span className="text-xs font-medium text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                                                {parxfecha.filter(pf => pf.fec_torneo_id === selectedFechaForPartidos.id).length} / {selectedFechaForPartidos.numero_partidos}
                                            </span>
                                        </div>
                                        {parxfecha.filter(pf => pf.fec_torneo_id === selectedFechaForPartidos.id).length === 0 ? (
                                            <p className="text-sm text-gray-500 italic">No hay partidos registrados aún.</p>
                                        ) : (
                                            <ul className="space-y-2 max-h-64 overflow-y-auto pr-1">
                                                {parxfecha.filter(pf => pf.fec_torneo_id === selectedFechaForPartidos.id).map(pf => (
                                                    <li key={pf.id} className="bg-white p-3 rounded border border-gray-100 shadow-sm flex flex-col gap-1">
                                                        <div className="flex justify-between items-center w-full">
                                                            <div className="flex flex-col text-xs space-y-1 w-full">
                                                                <div className="flex justify-between px-1">
                                                                    <span className="font-bold truncate max-w-[100px]">{pf.equipo_local_nombre}</span>
                                                                    <span className="font-black text-gray-700 bg-gray-100 px-2 rounded">{pf.puntos_local}</span>
                                                                </div>
                                                                <div className="flex justify-between px-1">
                                                                    <span className="font-bold truncate max-w-[100px]">{pf.equipo_vis_nombre}</span>
                                                                    <span className="font-black text-gray-700 bg-gray-100 px-2 rounded">{pf.puntos_vis}</span>
                                                                </div>
                                                            </div>
                                                            <div className="ml-2 pl-2 border-l border-gray-100 flex items-center h-full gap-1">
                                                                <button type="button" onClick={() => editPartido(pf)} className="p-1 text-blue-500 hover:bg-blue-50 rounded"><Edit size={16} /></button>
                                                                <button type="button" onClick={() => deletePartido(pf.id)} className="p-1 text-red-500 hover:bg-red-50 rounded"><Trash2 size={16} /></button>
                                                            </div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
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
                        </div>

                        {/* Columna Derecha: Directorio de Fechas */}
                        <div className="xl:col-span-2">
                            <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-gray-100">
                                <div className="p-6 border-b border-gray-100">
                                    <h2 className="text-xl font-bold text-gray-900">Directorio de Fechas Programadas</h2>
                                </div>
                                <div className="overflow-x-auto p-4 pt-0">
                                    <table className="min-w-full divide-y divide-gray-200 mt-4 border border-gray-200 rounded-lg overflow-hidden">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Calendario</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Torneo</th>
                                                <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase">Partidos</th>
                                                <th className="px-6 py-3 text-right text-xs font-bold text-gray-500 uppercase">Acciones</th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {fecxtorneo.length === 0 ? (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-sm text-gray-500">No hay fechas programadas.</td></tr>
                                            ) : (
                                                fecxtorneo.map(f => (
                                                    <tr key={f.id} className={`hover:bg-emerald-50/30 transition-colors ${selectedFechaForPartidos?.id === f.id ? 'bg-emerald-50' : ''}`}>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm font-bold text-gray-900 flex items-center gap-2">
                                                                <CalendarDays size={14} className="text-emerald-500"/>
                                                                {new Date(new Date(f.fecha).getTime() + new Date().getTimezoneOffset() * 60000).toLocaleDateString()}
                                                            </div>
                                                            <div className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                                <Clock size={12}/> {f.hora_inicio?.substring(0,5)} - {f.hora_fin?.substring(0,5)}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-sm text-gray-600 font-medium">{f.torneo_nombre}</div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <div className="text-xs font-bold text-white bg-emerald-500 px-2 py-1 rounded inline-block text-center">
                                                                Nº {f.numero_partidos}
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-right">
                                                            <div className="flex justify-end gap-2 text-sm">
                                                                <button 
                                                                    title="Registrar Partidos"
                                                                    onClick={() => editFecha(f)}
                                                                    className={`p-1.5 rounded-md transition-colors ${selectedFechaForPartidos?.id === f.id ? 'bg-emerald-500 text-white' : 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100'}`}
                                                                >
                                                                    <Swords size={18} />
                                                                </button>
                                                                <button title="Editar Fecha" onClick={() => editFecha(f)} className="text-blue-500 hover:text-blue-700 bg-blue-50 p-1.5 rounded-md transition-colors"><Edit size={18} /></button>
                                                                <button title="Eliminar Fecha" onClick={() => deleteFecha(f.id)} className="text-red-500 hover:text-red-700 bg-red-50 p-1.5 rounded-md transition-colors"><Trash2 size={18} /></button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                </main>
            </div>
        </div>
    );
};

export default AdminDashboard;
