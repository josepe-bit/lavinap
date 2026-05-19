const express = require('express');
const router = express.Router();
const multer = require('multer');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

const upload = multer({ storage: multer.memoryStorage() });

// Apply middleware to all admin routes
router.use(authMiddleware);
// Middleware admin role
const adminRoleMiddleware = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso exclusivo para administradores.' });
    }
    next();
};


router.get('/reservations', adminController.getAllReservations);
router.put('/reservations/:id/status', adminController.updateReservationStatus);
router.put('/reservations/:id/utilizada', adminController.toggleUtilizada);
router.get('/tarifas', adminRoleMiddleware, adminController.getTarifas);
router.post('/tarifas', adminRoleMiddleware, adminController.createTarifa);
router.delete('/tarifas/:id', adminRoleMiddleware, adminController.deleteTarifa);

router.post('/reservas-recurrentes', adminController.createReservasRecurrentes);
router.get('/reservas-recurrentes/grupos', adminController.getReservasRecurrentes);
router.delete('/reservas-recurrentes/grupos/:grupo_id', adminController.deleteReservasRecurrentes);

router.get('/servicios', adminRoleMiddleware, adminController.getServicios);
router.post('/servicios', adminRoleMiddleware, adminController.createServicio);
router.put('/servicios/:id', adminRoleMiddleware, adminController.updateServicio);
router.delete('/servicios/:id', adminRoleMiddleware, adminController.deleteServicio);

router.get('/clientes', adminController.getClientes);
router.post('/clientes/import', upload.single('file'), adminController.importClientes);
router.post('/clientes', adminController.createCliente);
router.put('/clientes/:id', adminController.updateCliente);
router.delete('/clientes/:id', adminController.deleteCliente);

// Torneos
router.get('/torneos', adminRoleMiddleware, adminController.getTorneos);
router.post('/torneos', adminRoleMiddleware, adminController.createTorneo);
router.put('/torneos/:id', adminRoleMiddleware, adminController.updateTorneo);
router.delete('/torneos/:id', adminRoleMiddleware, adminController.deleteTorneo);

// Premios
router.get('/premios', adminRoleMiddleware, adminController.getPremios);
router.post('/premios', adminRoleMiddleware, adminController.createPremio);
router.put('/premios/:id', adminRoleMiddleware, adminController.updatePremio);
router.delete('/premios/:id', adminRoleMiddleware, adminController.deletePremio);

// Equipos
router.get('/equipos', adminRoleMiddleware, adminController.getEquipos);
router.post('/equipos', adminRoleMiddleware, adminController.createEquipo);
router.put('/equipos/:id', adminRoleMiddleware, adminController.updateEquipo);
router.delete('/equipos/:id', adminRoleMiddleware, adminController.deleteEquipo);

// JugaxEquipo
router.get('/jugaxequipo', adminRoleMiddleware, adminController.getJugaxEquipo);
router.post('/jugaxequipo', adminRoleMiddleware, adminController.createJugaxEquipo);
router.put('/jugaxequipo/:id', adminRoleMiddleware, adminController.updateJugaxEquipo);
router.delete('/jugaxequipo/:id', adminRoleMiddleware, adminController.deleteJugaxEquipo);

// Grupos
router.get('/grupos', adminRoleMiddleware, adminController.getGrupos);
router.post('/grupos', adminRoleMiddleware, adminController.createGrupo);
router.put('/grupos/:id', adminRoleMiddleware, adminController.updateGrupo);
router.delete('/grupos/:id', adminRoleMiddleware, adminController.deleteGrupo);

// EquixGrupo
router.get('/equixgrupo', adminRoleMiddleware, adminController.getEquixGrupo);
router.post('/equixgrupo', adminRoleMiddleware, adminController.createEquixGrupo);
router.put('/equixgrupo/:id', adminRoleMiddleware, adminController.updateEquixGrupo);
router.delete('/equixgrupo/:id', adminRoleMiddleware, adminController.deleteEquixGrupo);

// FecxTorneo
router.get('/fecxtorneo', adminRoleMiddleware, adminController.getFecxTorneo);
router.post('/fecxtorneo', adminRoleMiddleware, adminController.createFecxTorneo);
router.put('/fecxtorneo/:id', adminRoleMiddleware, adminController.updateFecxTorneo);
router.delete('/fecxtorneo/:id', adminRoleMiddleware, adminController.deleteFecxTorneo);
router.post('/fecxtorneo/:id/programacion', adminRoleMiddleware, adminController.enviarProgramacionFecha);
router.post('/fecxtorneo/:id/resultados', adminRoleMiddleware, adminController.enviarResultadosFecha);
router.post('/fecxtorneo/:id/reservar', adminRoleMiddleware, adminController.reservarCanchasFecha);

// ParxFecha
router.get('/parxfecha', adminRoleMiddleware, adminController.getParxFecha);
router.post('/parxfecha', adminRoleMiddleware, adminController.createParxFecha);
router.put('/parxfecha/:id', adminRoleMiddleware, adminController.updateParxFecha);
router.delete('/parxfecha/:id', adminRoleMiddleware, adminController.deleteParxFecha);

// Middleware super admin
const superAdminMiddleware = (req, res, next) => {
    if (req.user.username !== 'admin') {
        return res.status(403).json({ message: 'Acceso exclusivo para el usuario principal (admin).' });
    }
    next();
};

router.get('/mensajes', superAdminMiddleware, adminController.getMensajes);
router.post('/mensajes', superAdminMiddleware, adminController.createMensaje);
router.put('/mensajes/:id', superAdminMiddleware, adminController.updateMensaje);
router.delete('/mensajes/:id', superAdminMiddleware, adminController.deleteMensaje);

router.get('/usuarios', adminRoleMiddleware, adminController.getUsuarios);
router.post('/usuarios', adminRoleMiddleware, adminController.createUsuario);
router.put('/usuarios/:id', adminRoleMiddleware, adminController.updateUsuario);
router.delete('/usuarios/:id', adminRoleMiddleware, adminController.deleteUsuario);

const promocionesController = require('../controllers/promocionesController');
router.get('/promociones', adminRoleMiddleware, promocionesController.getPromociones);
router.post('/promociones', adminRoleMiddleware, promocionesController.createPromocion);
router.put('/promociones/:id', adminRoleMiddleware, promocionesController.updatePromocion);
router.delete('/promociones/:id', adminRoleMiddleware, promocionesController.deletePromocion);
router.post('/promociones/:id/tomar', adminRoleMiddleware, promocionesController.tomarPromocion);

// Parametros
router.get('/parametros', adminRoleMiddleware, adminController.getParametros);
router.put('/parametros', adminRoleMiddleware, adminController.updateParametros);

module.exports = router;
