const express = require('express');
const router = express.Router();
const publicController = require('../controllers/publicController');

router.get('/mensajes/activos', publicController.getActiveMessages);
router.get('/tarifas', publicController.getTarifas);
router.get('/torneos', publicController.getPublicTorneos);
router.get('/parametros', publicController.getParametros);
router.get('/db-debug', publicController.getDbDebug);

module.exports = router;
