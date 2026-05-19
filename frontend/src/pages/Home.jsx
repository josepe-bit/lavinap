import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Phone, Mail, Clock, ShieldCheck, Video, Menu, X, Save, Megaphone, DollarSign, Zap, Star, Trophy, CalendarDays, Gift } from 'lucide-react';
import axios from 'axios';
import '../index.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Home = () => {
    const navigate = useNavigate();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
    const [reservations, setReservations] = useState([]);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookingFormData, setBookingFormData] = useState({
        nombre: '',
        documento: '',
        correo: '',
        celular: '',
        id_servicio: '1', // Default to F8
        fecha: currentDate,
        hora_inicio: '18:00',
        hora_fin: '19:00',
        abono: '0'
    });

    const [bookingStatus, setBookingStatus] = useState({ loading: false, error: null, success: false });
    const [activeMessages, setActiveMessages] = useState([]);
    const [tarifas, setTarifas] = useState([]);
    const [torneos, setTorneos] = useState([]);
    const [parametros, setParametros] = useState({});

    // Fetch initial data
    useEffect(() => {
        fetchActiveMessages();
        fetchTarifas();
        fetchTorneos();
        fetchParametros();
    }, []);

    // Fetch reservations whenever the date changes
    useEffect(() => {
        fetchReservations();
    }, [currentDate]);

    const fetchActiveMessages = async () => {
        try {
            const res = await axios.get(`${API_URL}/public/mensajes/activos`);
            setActiveMessages(res.data);
        } catch (err) {
            console.error('Error fetching active messages:', err);
        }
    };

    const fetchTarifas = async () => {
        try {
            const res = await axios.get(`${API_URL}/public/tarifas`);
            setTarifas(res.data);
        } catch (err) {
            console.error('Error fetching tarifas:', err);
        }
    };

    const fetchTorneos = async () => {
        try {
            const res = await axios.get(`${API_URL}/public/torneos`);
            setTorneos(res.data);
        } catch (err) {
            console.error('Error fetching torneos:', err);
        }
    };

    const fetchParametros = async () => {
        try {
            const res = await axios.get(`${API_URL}/public/parametros`);
            setParametros(res.data);
        } catch (err) {
            console.error('Error fetching parametros:', err);
        }
    };

    const getServiceIcon = (name) => {
        if (name?.toLowerCase().includes('8')) return '⚽';
        if (name?.toLowerCase().includes('5')) return '🥅';
        if (name?.toLowerCase().includes('sal')) return '🎉';
        return '🏟️';
    };

    const getServiceGradient = (index) => {
        const gradients = [
            'from-emerald-500 via-green-500 to-teal-600',
            'from-cyan-500 via-teal-500 to-emerald-600',
            'from-green-500 via-emerald-500 to-cyan-600',
            'from-teal-500 via-cyan-500 to-green-600',
        ];
        return gradients[index % gradients.length];
    };

    const fetchReservations = async () => {
        try {
            const res = await axios.get(`${API_URL}/reservations?fecha=${currentDate}`);
            setReservations(res.data);
        } catch (err) {
            console.error('Error fetching reservations:', err);
        }
    };

    const handleDateChange = (e) => {
        setCurrentDate(e.target.value);
        setBookingFormData({ ...bookingFormData, fecha: e.target.value });
    };

    const handleBookingChange = (e) => {
        const { name, value } = e.target;
        setBookingFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBookingSubmit = async (e) => {
        e.preventDefault();
        setBookingStatus({ loading: true, error: null, success: false });
        try {
            await axios.post(`${API_URL}/reservations`, bookingFormData);
            setBookingStatus({ loading: false, error: null, success: true });
            fetchReservations(); // Refresh
            setTimeout(() => {
                setIsModalOpen(false);
                setBookingStatus({ loading: false, error: null, success: false });
            }, 2000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || 'Error al procesar la reserva';
            setBookingStatus({ loading: false, error: errorMsg, success: false });
        }
    };

    // Helper to check if a specific cell slot is reserved or blocked
    const checkSlotStatus = (hour, servicioId) => {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00:00`;
        let isReserved = false;
        let isBlocked = false;

        for (let r of reservations) {
            if (timeSlot >= r.hora_inicio && timeSlot < r.hora_fin) {
                if (r.id_servicio === servicioId) {
                    isReserved = true;
                }
                // Cross Rules
                if (servicioId === 1 && (r.id_servicio === 2 || r.id_servicio === 3)) {
                    isBlocked = true; // F8 is blocked if any F5 is reserved
                }
                if ((servicioId === 2 || servicioId === 3) && r.id_servicio === 1) {
                    isBlocked = true; // F5 is blocked if F8 is reserved
                }
            }
        }

        if (isReserved) return { status: 'reserved', class: 'bg-red-100 text-red-700 shadow-inner', label: 'Reservado' };
        if (isBlocked) return { status: 'blocked', class: 'bg-gray-200 text-gray-500 shadow-inner', label: 'Bloqueado' };
        return { status: 'free', class: 'bg-green-100 text-green-700 cursor-pointer hover:bg-green-200', label: 'Libre' };
    };

    const openBookingModal = (hour, servicioId) => {
        setBookingFormData(prev => ({
            ...prev,
            id_servicio: servicioId.toString(),
            hora_inicio: `${hour.toString().padStart(2, '0')}:00`,
            hora_fin: `${(hour + 1).toString().padStart(2, '0')}:00`
        }));
        setIsModalOpen(true);
    };

    const hours = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22]; // Working hours

    return (
        <div className="min-h-screen bg-white">
            {/* Navbar */}
            <nav className="fixed w-full z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-100">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between h-20">
                        <div className="flex-shrink-0 flex items-center gap-3">
                            <img src="/logo-la-vina.jpeg" alt="La Viña Logo" className="h-16 w-auto rounded-md shadow-sm" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">La Viña</h1>
                                <p className="text-sm text-green-600 font-medium">Canchas Sintéticas</p>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center space-x-8">
                            <a href="#reservas" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Reservar</a>
                            
                            {torneos.filter(t => t.estado === 'en_oferta').length > 0 && (
                                <a href="#torneos" className="text-gray-600 hover:text-green-600 font-medium transition-colors relative">
                                    Torneos
                                    <span className="absolute -top-2 -right-3 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                                    </span>
                                </a>
                            )}

                            <a href="#ubicacion" className="text-gray-600 hover:text-green-600 font-medium transition-colors">Ubicación</a>
                            <button onClick={() => navigate('/admin/login')} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-full font-semibold transition-all shadow-md">
                                Panel Admin
                            </button>
                        </div>

                        <div className="flex items-center md:hidden">
                            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
                                {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden bg-white border-b border-gray-100">
                        <div className="px-2 pt-2 pb-5 space-y-1 shadow-lg">
                            <a href="#reservas" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-green-50 rounded-md">Reservar</a>
                            
                            {torneos.filter(t => t.estado === 'en_oferta').length > 0 && (
                                <a href="#torneos" onClick={() => setMobileMenuOpen(false)} className="px-3 py-3 text-base font-medium text-gray-800 hover:bg-green-50 rounded-md flex items-center justify-between">
                                    <span>Torneos</span>
                                    <span className="bg-amber-100 text-amber-800 text-xs font-bold px-2 py-0.5 rounded-full animate-pulse">¡En Oferta!</span>
                                </a>
                            )}

                            <a href="#ubicacion" onClick={() => setMobileMenuOpen(false)} className="block px-3 py-3 text-base font-medium text-gray-800 hover:bg-green-50 rounded-md">Ubicación</a>
                            <div className="pt-2">
                                <button onClick={() => navigate('/admin/login')} className="w-full bg-green-600 text-white px-3 py-3 rounded-md font-semibold">
                                    Panel Admin
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            <div className="pt-28 pb-16 lg:pt-32 lg:pb-24">
                <div className="max-w-7xl mx-auto px-4 text-center">
                    
                    {/* Mensajes / Notificaciones Llamativas */}
                    {activeMessages.length > 0 && (
                        <div className="mb-12 space-y-5 max-w-4xl mx-auto">
                            {activeMessages.map(msg => (
                                <div key={msg.id} className="relative rounded-2xl shadow-xl bg-gradient-to-r from-green-500 via-emerald-500 to-green-600 p-1 transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-500/30">
                                    <div className="bg-white rounded-xl p-6 md:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-4 md:gap-6 text-center sm:text-left relative overflow-hidden group h-full">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-green-400 rounded-bl-full opacity-10 blur-3xl group-hover:bg-emerald-500 transition-colors duration-500"></div>
                                        <div className="bg-green-100 text-green-600 p-4 rounded-full flex-shrink-0 relative z-10 shadow-inner">
                                            <Megaphone size={36} className="animate-pulse" />
                                        </div>
                                        <div className="relative z-10 flex-1 w-full">
                                            <h3 className="text-2xl font-black text-gray-900 leading-tight mb-2 tracking-tight uppercase">{msg.titulo}</h3>
                                            <p className="text-gray-600 text-lg font-medium leading-relaxed">{msg.detalle}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
                        Tu pasión por el fútbol,<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-emerald-700">al siguiente nivel</span>
                    </h2>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500 mb-10">
                        Reserva nuestras canchas de Fútbol 5 y Fútbol 8. Instalaciones de primera en el Barrio La Viña de Calambeo.
                    </p>
                    <div className="flex justify-center">
                        <button onClick={() => setIsModalOpen(true)} className="bg-green-600 hover:bg-green-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-green-200 transition-transform transform hover:-translate-y-1 flex items-center gap-2">
                            <Calendar size={20} /> Reservar Ahora
                        </button>
                    </div>
                </div>
            </div>

            <section id="reservas" className="py-16 bg-gray-50 border-t border-gray-100">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="text-center mb-12">
                        <span className="text-green-600 font-bold uppercase tracking-wider text-sm">Disponibilidad en Tiempo Real</span>
                        <h3 className="text-3xl font-extrabold text-gray-900 mt-2">Horarios y Calendario</h3>
                    </div>

                    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">

                            <div className="p-6 col-span-1 bg-gray-50/50">
                                <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <Clock size={20} className="text-green-600" /> Fecha
                                </h4>
                                <input
                                    type="date"
                                    value={currentDate}
                                    onChange={handleDateChange}
                                    className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500"
                                />

                                <div className="mt-8 flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                                        <span className="text-sm text-gray-600 font-medium">Disponible</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                        <span className="text-sm text-gray-600 font-medium">Reservado</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-4 h-4 rounded-full bg-gray-400"></div>
                                        <span className="text-sm text-gray-600 font-medium">Bloqueado por cruce</span>
                                    </div>
                                    <div className="mt-6 flex flex-col gap-2">
                                        <div className="text-sm text-gray-500 italic p-3 bg-blue-50 text-blue-800 rounded-lg border border-blue-100">
                                            *Nota: Reservar Fútbol 8 bloquea ambas canchas de Fútbol 5 y viceversa.
                                        </div>
                                        <div className="text-sm font-medium p-3 bg-green-50 text-green-800 rounded-lg border border-green-100">
                                            El abono a la reserva lo puede consignar al nequi <strong>{parametros.numero_nequi || '301 606 3151'}</strong> y enviar el comprobante al Whatsapp número <strong>{parametros.whatsapp_establecimiento || '301 606 3151'}</strong>.
                                        </div>
                                    </div>

                                    {/* --- SECCIÓN TARIFAS LLAMATIVA --- */}
                                    {tarifas.length > 0 && (
                                        <div className="mt-8">
                                            <div className="flex items-center gap-2 mb-4">
                                                <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-1.5 rounded-lg">
                                                    <DollarSign size={18} className="text-white" />
                                                </div>
                                                <h5 className="text-base font-extrabold text-gray-900 tracking-tight">Nuestras Tarifas</h5>
                                                <div className="flex-1 h-px bg-gradient-to-r from-green-300 to-transparent ml-2"></div>
                                            </div>
                                            <div className="space-y-3">
                                                {tarifas.map((tarifa, index) => (
                                                    <div
                                                        key={tarifa.id}
                                                        className="group relative rounded-xl p-[2px] bg-gradient-to-r transition-all duration-500 hover:shadow-lg hover:shadow-green-500/20 hover:-translate-y-0.5"
                                                        style={{
                                                            backgroundImage: `linear-gradient(135deg, ${index === 0 ? '#10b981, #059669' : index === 1 ? '#06b6d4, #10b981' : index === 2 ? '#14b8a6, #06b6d4' : '#059669, #14b8a6'})`
                                                        }}
                                                    >
                                                        <div className="bg-white rounded-[10px] p-3.5 flex items-center gap-3 relative overflow-hidden">
                                                            <div className="absolute -top-4 -right-4 w-20 h-20 rounded-full opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-500"
                                                                style={{
                                                                    backgroundImage: `linear-gradient(135deg, ${index === 0 ? '#10b981, #059669' : index === 1 ? '#06b6d4, #10b981' : index === 2 ? '#14b8a6, #06b6d4' : '#059669, #14b8a6'})`
                                                                }}
                                                            ></div>
                                                            <div className="text-2xl flex-shrink-0 transform group-hover:scale-110 transition-transform duration-300">
                                                                {getServiceIcon(tarifa.servicio_nombre)}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-bold text-gray-900 truncate">{tarifa.servicio_nombre}</p>
                                                            </div>
                                                            <div className="flex-shrink-0 text-right">
                                                                <div className="flex items-baseline gap-0.5">
                                                                    <span className="text-xs text-gray-400 font-medium">$</span>
                                                                    <span className="text-lg font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                                                        {Number(tarifa.valor_hora).toLocaleString('es-CO')}
                                                                    </span>
                                                                </div>
                                                                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">/ hora</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 flex items-center gap-1.5 justify-center p-2 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-100">
                                                <Zap size={13} className="text-amber-500" />
                                                <p className="text-[11px] font-bold text-amber-700 tracking-wide">Precios vigentes • Sujetos a cambio</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="p-6 col-span-3 overflow-x-auto">
                                <div className="min-w-[600px]">
                                    <div className="grid grid-cols-5 gap-2 mb-4 text-center border-b pb-4">
                                        <div className="font-semibold text-gray-400 text-sm">Hora</div>
                                        <div className="font-bold text-gray-800">Fútbol 8</div>
                                        <div className="font-bold text-gray-800">Fútbol 5 (A)</div>
                                        <div className="font-bold text-gray-800">Fútbol 5 (B)</div>
                                        <div className="font-bold text-gray-800">Salón Eventos</div>
                                    </div>

                                    {hours.map((hour) => {
                                        const statusF8 = checkSlotStatus(hour, 1);
                                        const statusF5A = checkSlotStatus(hour, 2);
                                        const statusF5B = checkSlotStatus(hour, 3);
                                        const statusSalon = checkSlotStatus(hour, 4);

                                        return (
                                            <div key={hour} className="grid grid-cols-5 gap-2 mb-3 text-center items-center">
                                                <div className="text-gray-500 font-medium">{hour.toString().padStart(2, '0')}:00</div>

                                                {/* F8 */}
                                                <div
                                                    onClick={() => statusF8.status === 'free' && openBookingModal(hour, 1)}
                                                    className={`py-2 rounded-md font-semibold text-sm transition-colors flex justify-center items-center gap-1 ${statusF8.class}`}>
                                                    {statusF8.status === 'reserved' && <ShieldCheck size={14} />} {statusF8.label}
                                                </div>
                                                {/* F5A */}
                                                <div
                                                    onClick={() => statusF5A.status === 'free' && openBookingModal(hour, 2)}
                                                    className={`py-2 rounded-md font-semibold text-sm transition-colors flex justify-center items-center gap-1 ${statusF5A.class}`}>
                                                    {statusF5A.status === 'reserved' && <ShieldCheck size={14} />} {statusF5A.label}
                                                </div>
                                                {/* F5B */}
                                                <div
                                                    onClick={() => statusF5B.status === 'free' && openBookingModal(hour, 3)}
                                                    className={`py-2 rounded-md font-semibold text-sm transition-colors flex justify-center items-center gap-1 ${statusF5B.class}`}>
                                                    {statusF5B.status === 'reserved' && <ShieldCheck size={14} />} {statusF5B.label}
                                                </div>
                                                {/* Salon */}
                                                <div
                                                    onClick={() => statusSalon.status === 'free' && openBookingModal(hour, 4)}
                                                    className={`py-2 rounded-md font-semibold text-sm transition-colors flex justify-center items-center gap-1 ${statusSalon.class}`}>
                                                    {statusSalon.status === 'reserved' && <ShieldCheck size={14} />} {statusSalon.label}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECCION TORNEOS EN OFERTA */}
            {torneos.filter(t => t.estado === 'en_oferta').length > 0 && (
                <section id="torneos" className="relative py-24 bg-gray-900 border-t-8 border-amber-500 overflow-hidden">
                    {/* Fondo decorativo oscuro / dinámico */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-yellow-500/10 blur-3xl"></div>
                    </div>

                    <div className="relative max-w-7xl mx-auto px-4 z-10">
                        <div className="text-center mb-16">
                            <span className="inline-block py-1 px-3 rounded-full bg-amber-500/20 text-amber-400 font-bold uppercase tracking-widest text-sm mb-4 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                                🔥 ¡Gran Oportunidad! 🔥
                            </span>
                            <h3 className="text-4xl md:text-5xl font-extrabold text-white mt-2 tracking-tight drop-shadow-md">Torneos Abiertos de Inscripción</h3>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            {torneos.filter(t => t.estado === 'en_oferta').map(torneo => (
                                <div key={torneo.id} className="bg-white rounded-3xl shadow-2xl shadow-amber-900/40 border-2 border-amber-400 overflow-hidden flex flex-col group transform transition-all duration-300 hover:scale-[1.02]">
                                    
                                    {/* Cabecera del Torneo */}
                                    <div className="bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 p-8 text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
                                        <Trophy size={64} className="mx-auto text-amber-100 mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] transform group-hover:scale-110 transition-transform duration-500" />
                                        <h4 className="text-3xl md:text-4xl font-black text-white drop-shadow-sm uppercase tracking-wide">{torneo.nombre}</h4>
                                        <div className="mt-4 inline-flex items-center gap-2 bg-black/20 text-amber-50 py-1.5 px-4 rounded-full font-semibold backdrop-blur-sm border border-white/10">
                                            <CalendarDays size={18} /> Fecha de Inicio: {new Date(torneo.fecha_inicio).toLocaleDateString('es-CO')}
                                        </div>
                                    </div>
                                    
                                    <div className="p-8 flex-1 flex flex-col bg-gray-50">
                                        {/* Detalle */}
                                        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-6">
                                            <p className="text-gray-700 text-base leading-relaxed text-center font-medium italic">
                                                "{torneo.detalle}"
                                            </p>
                                        </div>

                                        {/* Valor de inscripción y Mínimo de Equipos */}
                                        <div className="flex flex-col md:flex-row gap-4 mb-8">
                                            <div className="flex-1 bg-green-50 rounded-2xl border border-green-200 p-4 text-center">
                                                <span className="text-xs font-black text-green-700 uppercase tracking-wider block mb-1">Inscripción</span>
                                                <div className="text-3xl font-black text-green-600">
                                                    ${Number(torneo.val_inscripcion).toLocaleString('es-CO')}
                                                </div>
                                            </div>
                                            <div className="flex-1 bg-amber-50 rounded-2xl border border-amber-200 p-4 flex items-center justify-center text-center">
                                                <p className="text-amber-900 font-bold text-sm leading-tight">
                                                    El número mínimo de equipos para iniciar el torneo es de <span className="text-amber-600 text-xl block mt-1">{torneo.min_equipos} equipos</span>
                                                </p>
                                            </div>
                                        </div>

                                        {/* PLAN DE PREMIOS SÚPER LLAMATIVO */}
                                        {torneo.premios && torneo.premios.length > 0 && (
                                            <div className="mb-8 relative rounded-3xl p-1 bg-gradient-to-r from-yellow-300 via-amber-500 to-yellow-300 shadow-[0_0_30px_rgba(245,158,11,0.4)] animate-gradient-xy flex-1">
                                                <div className="bg-black rounded-[22px] p-6 h-full relative overflow-hidden">
                                                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 to-amber-600 opacity-20 blur-xl"></div>
                                                    <div className="relative z-10">
                                                        <h5 className="font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 mb-5 flex items-center justify-center gap-3 text-2xl uppercase tracking-widest text-center">
                                                            <Star size={28} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                                                            Gran Plan de Premios
                                                            <Star size={28} className="text-yellow-400 fill-yellow-400 animate-pulse" />
                                                        </h5>
                                                        <ul className="space-y-4">
                                                            {torneo.premios.map((premio, idx) => (
                                                                <li key={premio.id} className="flex flex-col sm:flex-row justify-between items-center sm:items-start text-center sm:text-left bg-white/5 rounded-xl p-3 border border-white/10 hover:bg-white/10 transition-colors">
                                                                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                                                                        <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 text-black font-black text-sm shadow-md">
                                                                            {idx + 1}
                                                                        </span>
                                                                        <span className="text-white font-bold text-lg">{premio.descripcion}</span>
                                                                    </div>
                                                                    {Number(premio.valor) > 0 && (
                                                                        <div className="text-yellow-400 font-black text-2xl ml-0 sm:ml-4 bg-yellow-400/10 px-3 py-1 rounded-lg">
                                                                            ${Number(premio.valor).toLocaleString('es-CO')}
                                                                        </div>
                                                                    )}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        <a 
                                            href={`mailto:${parametros.email_establecimiento || 'lavinacanchas@gmail.com'}?subject=Interesado%20en%20Torneo%20${encodeURIComponent(torneo.nombre)}`}
                                            className="mt-auto w-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white py-4 px-6 rounded-2xl font-black text-lg uppercase tracking-wider flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(245,158,11,0.3)] hover:shadow-[0_15px_30px_rgba(245,158,11,0.4)] hover:-translate-y-1 transition-all"
                                        >
                                            <Mail size={24} /> ¡Inscribe tu Equipo Ahora!
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* FOOTER */}
            <footer id="ubicacion" className="bg-gray-900 py-16 text-white border-t-4 border-green-500">
                <div className="max-w-7xl mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                        <div>
                            <div className="flex items-center gap-3 mb-6">
                                <img src="/logo-la-vina.jpeg" alt="Logo" className="w-12 h-12 object-cover rounded bg-white p-1" />
                                <h3 className="text-2xl font-bold tracking-tight">La Viña</h3>
                            </div>
                            <p className="text-gray-400 leading-relaxed">
                                El mejor espacio deportivo y social de la ciudad. Canchas de césped sintético de última generación.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-green-500 pb-2 inline-block">Contacto</h4>
                            <ul className="space-y-4">
                                <li className="flex items-start gap-3">
                                    <MapPin className="text-green-500 mt-1 flex-shrink-0" size={20} />
                                    <span className="text-gray-300">Carrera 11 #19A LT 5<br />Barrio la Viña de Calambeo</span>
                                </li>
                                <li className="flex items-center gap-3">
                                    <Phone className="text-green-500 flex-shrink-0" size={20} />
                                    <span className="text-gray-300">+57 301 606 3151</span>
                                </li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-lg font-bold mb-6 text-white border-b-2 border-green-500 pb-2 inline-block flex items-center gap-2">
                                <Video size={20} /> ¿Cómo llegar?
                            </h4>
                            <div className="aspect-w-16 aspect-h-9 bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700">
                                <video controls className="w-full h-full object-cover rounded-xl">
                                    <source src="/como-llegar.mp4" type="video/mp4" />
                                    Tu navegador no soporta el elemento de video.
                                </video>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* MODAL RESERVA */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="bg-green-600 px-6 py-4 flex justify-between items-center flex-shrink-0">
                            <h3 className="text-white font-bold text-xl">Nueva Reserva</h3>
                            <button onClick={() => setIsModalOpen(false)} className="text-white/80 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="p-6 overflow-y-auto custom-scrollbar">
                            {bookingStatus.error && (
                                <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4 text-sm font-medium border border-red-100">
                                    {bookingStatus.error}
                                </div>
                            )}
                            {bookingStatus.success && (
                                <div className="bg-green-50 text-green-700 p-4 rounded-lg mb-4 text-sm font-medium border border-green-100">
                                    ¡Reserva apartada con éxito! Revisa tu correo o espera confirmación del administrador.
                                </div>
                            )}

                            {!bookingStatus.success && (
                                <form onSubmit={handleBookingSubmit} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Cancha/Servicio *</label>
                                            <select name="id_servicio" value={bookingFormData.id_servicio} onChange={handleBookingChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border bg-gray-50">
                                                <option value="1">Fútbol 8</option>
                                                <option value="2">Fútbol 5 (A)</option>
                                                <option value="3">Fútbol 5 (B)</option>
                                                <option value="4">Salón de Eventos</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
                                            <input type="date" name="fecha" value={bookingFormData.fecha} onChange={handleBookingChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border bg-gray-50" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Inicio *</label>
                                            <input type="time" name="hora_inicio" value={bookingFormData.hora_inicio} onChange={handleBookingChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border bg-gray-50" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Hora Fin *</label>
                                            <input type="time" name="hora_fin" value={bookingFormData.hora_fin} onChange={handleBookingChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border bg-gray-50" />
                                        </div>
                                    </div>

                                    <hr className="my-4 border-gray-100" />

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo *</label>
                                        <input type="text" name="nombre" value={bookingFormData.nombre} onChange={handleBookingChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border" />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Documento *</label>
                                            <input type="text" name="documento" value={bookingFormData.documento} onChange={handleBookingChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Celular *</label>
                                            <input type="text" name="celular" value={bookingFormData.celular} onChange={handleBookingChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico *</label>
                                        <input type="email" name="correo" value={bookingFormData.correo} onChange={handleBookingChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Abono Inicial (COP) *</label>
                                        <input type="number" name="abono" min="0" value={bookingFormData.abono} onChange={handleBookingChange} required className="w-full border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500 text-sm p-2.5 border" />
                                        <p className="text-xs text-gray-500 mt-1">El abono es necesario para apartar tu reserva.</p>
                                    </div>

                                    <div className="pt-4 flex gap-3">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md font-medium text-sm hover:bg-gray-50">Cancelar</button>
                                        <button type="submit" disabled={bookingStatus.loading} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md font-medium text-sm hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2">
                                            {bookingStatus.loading ? 'Procesando...' : <><Save size={16} /> Confirmar Reserva</>}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Home;
