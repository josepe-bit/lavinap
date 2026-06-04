const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/mensajes/activos', publicController.getActiveMessages);
router.get('/tarifas', publicController.getTarifas);
router.get('/torneos', publicController.getPublicTorneos);
router.get('/parametros', publicController.getParametros);
router.post('/torneos/inscribir', publicController.inscribirTorneo);

module.exports = router;
