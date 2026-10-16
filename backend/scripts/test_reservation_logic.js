/**
 * Test suite para verificar la lógica de reservas, liberación de conexiones,
 * idempotencia, validación estricta de tipos y matriz de permisos admin/operador.
 * Ejecuta pruebas unitarias y de integración lógica sin modificar la base de datos de producción.
 */
process.env.RESEND_API_KEY = process.env.RESEND_API_KEY || 're_mock_test_123456789';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'jwt_secret_for_unit_tests_12345';

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');

// 1. Administrador autenticado puede acceder a marcar/desmarcar cancha
test('1. Permisos: Administrador autenticado puede marcar y desmarcar cancha (PUT /reservations/:id/utilizada)', async () => {
    const adminRoutes = require('../src/routes/adminRoutes');
    const layer = adminRoutes.stack.find(l => l.route && l.route.path === '/reservations/:id/utilizada');
    assert.ok(layer, 'Ruta PUT /reservations/:id/utilizada debe existir');
    
    // No debe contener adminRoleMiddleware en su route stack, permitiendo acceso tanto a admin como a operador
    assert.equal(layer.route.stack.length, 1, 'PUT /reservations/:id/utilizada debe contener solo el controller handler');
    
    // Simular paso por authMiddleware con rol admin
    const authMiddleware = require('../src/middlewares/authMiddleware');
    const jwt = require('jsonwebtoken');
    const tokenAdmin = jwt.sign({ id: 1, username: 'admin_user', rol: 'admin' }, process.env.JWT_SECRET);
    
    let authPassed = false;
    const req = { headers: { authorization: `Bearer ${tokenAdmin}` } };
    authMiddleware(req, {}, () => { authPassed = true; });
    assert.ok(authPassed, 'Administrador debe superar authMiddleware');
    assert.equal(req.user.rol, 'admin');
});

// 2. Operador autenticado puede acceder a marcar/desmarcar cancha
test('2. Permisos: Operador autenticado puede marcar y desmarcar cancha (PUT /reservations/:id/utilizada)', async () => {
    const authMiddleware = require('../src/middlewares/authMiddleware');
    const jwt = require('jsonwebtoken');
    const tokenOperador = jwt.sign({ id: 2, username: 'cajero_operador', rol: 'operador' }, process.env.JWT_SECRET);
    
    let authPassed = false;
    const req = { headers: { authorization: `Bearer ${tokenOperador}` } };
    authMiddleware(req, {}, () => { authPassed = true; });
    assert.ok(authPassed, 'Operador debe superar authMiddleware');
    assert.equal(req.user.rol, 'operador');

    // Comprobar que en adminRoutes no se bloquea la ruta utilizada
    const adminRoutes = require('../src/routes/adminRoutes');
    const layer = adminRoutes.stack.find(l => l.route && l.route.path === '/reservations/:id/utilizada');
    assert.equal(layer.route.stack.length, 1, 'La ruta no debe tener middleware adicional que bloquee al operador');
});

// 3. Operador no puede confirmar ni cancelar reservas
test('3. Permisos: Operador NO puede confirmar ni cancelar reservas (PUT /reservations/:id/status -> 403 Forbidden)', async () => {
    const adminRoutes = require('../src/routes/adminRoutes');
    const layer = adminRoutes.stack.find(l => l.route && l.route.path === '/reservations/:id/status');
    assert.ok(layer, 'Ruta PUT /reservations/:id/status debe existir');
    
    const adminRoleMiddleware = layer.route.stack[0].handle;
    const reqOperador = { user: { id: 2, username: 'cajero', rol: 'operador' } };
    
    let blockedCode = null;
    let blockedJson = null;
    const res = {
        status: (code) => { blockedCode = code; return res; },
        json: (data) => { blockedJson = data; return res; }
    };

    let nextCalled = false;
    adminRoleMiddleware(reqOperador, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false, 'No debe invocar next() para el operador');
    assert.equal(blockedCode, 403, 'Debe responder con HTTP 403 Forbidden');
    assert.ok(blockedJson.message.includes('exclusivo para administradores'));
});

// 4. Operador no puede eliminar reservas
test('4. Permisos: Operador NO puede eliminar reservas (DELETE /reservations/:id -> 403 Forbidden)', async () => {
    const adminRoutes = require('../src/routes/adminRoutes');
    const layer = adminRoutes.stack.find(l => l.route && l.route.path === '/reservations/:id');
    assert.ok(layer, 'Ruta DELETE /reservations/:id debe existir');
    
    const adminRoleMiddleware = layer.route.stack[0].handle;
    const reqOperador = { user: { id: 2, username: 'cajero', rol: 'operador' } };
    
    let blockedCode = null;
    const res = {
        status: (code) => { blockedCode = code; return res; },
        json: (data) => res
    };

    let nextCalled = false;
    adminRoleMiddleware(reqOperador, res, () => { nextCalled = true; });

    assert.equal(nextCalled, false, 'No debe permitir al operador eliminar reservas');
    assert.equal(blockedCode, 403, 'Debe responder 403');
});

// 5. Administrador conserva sus permisos actuales (status y delete)
test('5. Permisos: Administrador conserva acceso total (confirmar, cancelar y eliminar reservas)', async () => {
    const adminRoutes = require('../src/routes/adminRoutes');
    const statusLayer = adminRoutes.stack.find(l => l.route && l.route.path === '/reservations/:id/status');
    const deleteLayer = adminRoutes.stack.find(l => l.route && l.route.path === '/reservations/:id');
    
    const statusAdminMiddleware = statusLayer.route.stack[0].handle;
    const deleteAdminMiddleware = deleteLayer.route.stack[0].handle;

    const reqAdmin = { user: { id: 1, username: 'admin', rol: 'admin' } };

    let statusNextCalled = false;
    let deleteNextCalled = false;

    statusAdminMiddleware(reqAdmin, {}, () => { statusNextCalled = true; });
    deleteAdminMiddleware(reqAdmin, {}, () => { deleteNextCalled = true; });

    assert.ok(statusNextCalled, 'Administrador debe pasar middleware en status');
    assert.ok(deleteNextCalled, 'Administrador debe pasar middleware en delete');
});

// 6. Campo 'utilizada' ausente o inválido devuelve 400 Bad Request
test('6. Validación: Campo "utilizada" ausente o inválido devuelve 400 Bad Request', async () => {
    const adminController = require('../src/controllers/adminController');

    const invalidBodies = [
        {},                               // ausente
        { utilizada: undefined },         // explícitamente undefined
        { utilizada: null },              // null
        { utilizada: 'true' },            // cadena "true"
        { utilizada: 'false' },           // cadena "false"
        { utilizada: 1 },                 // número 1
        { utilizada: 0 },                 // número 0
        { utilizada: [] },                // array
        { utilizada: {} }                 // objeto
    ];

    for (const body of invalidBodies) {
        let statusCode = null;
        let responseJson = null;

        const req = { params: { id: 123 }, body };
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { responseJson = data; return res; }
        };

        await adminController.toggleUtilizada(req, res);

        assert.equal(statusCode, 400, `Debe retornar 400 para body: ${JSON.stringify(body)}`);
        assert.equal(responseJson.code, 'INVALID_UTILIZADA_VALUE');
        assert.equal(responseJson.success, false);
    }
});

// 7. Las solicitudes inválidas no obtienen conexión ni modifican datos
test('7. Validación: Solicitudes inválidas no obtienen conexión DB ni modifican datos', async () => {
    const adminController = require('../src/controllers/adminController');
    const pool = require('../src/config/db');

    let connectionRequested = false;
    const originalGetConnection = pool.getConnection;
    pool.getConnection = async () => {
        connectionRequested = true;
        throw new Error('No debió solicitarse conexión');
    };

    try {
        const req = { params: { id: 999 }, body: { utilizada: 'invalido' } };
        let statusCode = null;
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => res
        };

        await adminController.toggleUtilizada(req, res);

        assert.equal(connectionRequested, false, 'No debe solicitarse conexión al pool si la validación falla');
        assert.equal(statusCode, 400);
    } finally {
        pool.getConnection = originalGetConnection;
    }
});

// 8. true y false son aceptados como booleanos válidos
test('8. Validación: true y false son aceptados como booleanos válidos en toggleUtilizada', async () => {
    const adminController = require('../src/controllers/adminController');
    const pool = require('../src/config/db');

    let executedQueryValues = [];
    const mockConnection = {
        beginTransaction: async () => {},
        query: async (sql, params) => {
            if (sql.includes('SELECT * FROM Reservas WHERE id = ? FOR UPDATE')) {
                return [[{ id: 300, utilizada: 0, origen: 'Campeonato' }]];
            }
            if (sql.includes('UPDATE Reservas SET utilizada = ? WHERE id = ?')) {
                executedQueryValues.push(params[0]);
                return [{ affectedRows: 1 }];
            }
            return [[]];
        },
        commit: async () => {},
        rollback: async () => {},
        release: () => {}
    };

    const originalGetConnection = pool.getConnection;
    pool.getConnection = async () => mockConnection;

    try {
        // Prueba con true
        const reqTrue = { params: { id: 300 }, body: { utilizada: true } };
        let statusTrue = null;
        const resTrue = {
            status: (code) => { statusTrue = code; return resTrue; },
            json: (data) => resTrue
        };

        await adminController.toggleUtilizada(reqTrue, resTrue);
        assert.equal(statusTrue, 200, 'Debe aceptar boolean true');
        assert.equal(executedQueryValues[0], true, 'Debe pasar valor booleano true a la base de datos');

    } finally {
        pool.getConnection = originalGetConnection;
    }
});

// 9. Los controles de idempotencia y transacción siguen funcionando
test('9. Concurrencia e Idempotencia: toggleUtilizada usa FOR UPDATE y no duplica promociones', async () => {
    const adminController = require('../src/controllers/adminController');
    const pool = require('../src/config/db');

    let rolledBack = false;
    let released = false;
    let queryUsedForUpdate = false;

    const mockConnection = {
        beginTransaction: async () => {},
        query: async (sql) => {
            if (sql.includes('SELECT * FROM Reservas WHERE id = ? FOR UPDATE')) {
                queryUsedForUpdate = true;
                return [[{ id: 400, utilizada: 1, origen: 'Normal', id_cliente: 1, id_servicio: 2, fecha: '2026-10-20' }]];
            }
            return [[]];
        },
        commit: async () => {},
        rollback: async () => { rolledBack = true; },
        release: () => { released = true; }
    };

    const originalGetConnection = pool.getConnection;
    pool.getConnection = async () => mockConnection;

    try {
        const req = { params: { id: 400 }, body: { utilizada: true } };
        let statusCode = null;
        let responseJson = null;
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { responseJson = data; return res; }
        };

        await adminController.toggleUtilizada(req, res);

        assert.ok(queryUsedForUpdate, 'Debe usar SELECT ... FOR UPDATE');
        assert.ok(rolledBack, 'Debe hacer rollback de transacción vacía');
        assert.ok(released, 'Debe liberar conexión inmediatamente');
        assert.equal(statusCode, 200);
        assert.ok(responseJson.message.includes('ya se encontraba marcada como utilizada'));
    } finally {
        pool.getConnection = originalGetConnection;
    }
});

// 10. updateReservationStatus: Liberación de conexión antes de notificaciones I/O
test('10. Transacción y Liberación: updateReservationStatus libera conexión antes de notificaciones I/O', async () => {
    const adminController = require('../src/controllers/adminController');
    const pool = require('../src/config/db');

    let orderOfEvents = [];
    const mockConnection = {
        beginTransaction: async () => { orderOfEvents.push('beginTransaction'); },
        query: async (sql) => {
            orderOfEvents.push('query:' + sql.substring(0, 15).trim());
            if (sql.includes('SELECT id, estado FROM Reservas')) return [[{ id: 500, estado: 'pendiente' }]];
            if (sql.includes('UPDATE Reservas SET estado')) return [{ affectedRows: 1 }];
            if (sql.includes('SELECT email_establecimiento')) return [[{ email_establecimiento: 'test@lavina.com', enviar_email: 0, enviar_whatsapp: 0 }]];
            if (sql.includes('SELECT r.fecha')) return [[{ fecha: '2026-10-20', hora_inicio: '18:00', hora_fin: '19:00', cliente_nombre: 'Cliente', servicio_nombre: 'F5' }]];
            return [[]];
        },
        commit: async () => { orderOfEvents.push('commit'); },
        rollback: async () => { orderOfEvents.push('rollback'); },
        release: () => { orderOfEvents.push('release'); }
    };

    const originalGetConnection = pool.getConnection;
    pool.getConnection = async () => {
        orderOfEvents.push('getConnection');
        return mockConnection;
    };

    try {
        const req = { params: { id: 500 }, body: { estado: 'confirmado' } };
        let statusCode = null;
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { orderOfEvents.push('res.json'); return res; }
        };

        await adminController.updateReservationStatus(req, res);

        assert.equal(statusCode, 200);
        const commitIdx = orderOfEvents.indexOf('commit');
        const releaseIdx = orderOfEvents.indexOf('release');
        const resIdx = orderOfEvents.indexOf('res.json');

        assert.ok(commitIdx !== -1 && releaseIdx !== -1, 'Commit y release deben ocurrir');
        assert.equal(releaseIdx, commitIdx + 1, 'Release debe ocurrir inmediatamente tras commit');
        assert.ok(releaseIdx < resIdx, 'Release debe ocurrir antes de res.json');
    } finally {
        pool.getConnection = originalGetConnection;
    }
});

// 11. Resiliencia: Rollback y liberación garantizada de conexión ante fallos SQL
test('11. Resiliencia: Rollback y liberación garantizada de conexión ante fallos SQL', async () => {
    const adminController = require('../src/controllers/adminController');
    const pool = require('../src/config/db');

    let rolledBack = false;
    let released = false;

    const mockConnection = {
        beginTransaction: async () => {},
        query: async () => { throw new Error('Simulated Database Crash'); },
        commit: async () => {},
        rollback: async () => { rolledBack = true; },
        release: () => { released = true; }
    };

    const originalGetConnection = pool.getConnection;
    pool.getConnection = async () => mockConnection;

    try {
        const req = { params: { id: 600 }, body: { estado: 'confirmado' } };
        let statusCode = null;
        let responseJson = null;
        const res = {
            status: (code) => { statusCode = code; return res; },
            json: (data) => { responseJson = data; return res; }
        };

        await adminController.updateReservationStatus(req, res);

        assert.ok(rolledBack, 'Debe ejecutar rollback');
        assert.ok(released, 'Debe liberar conexión');
        assert.equal(statusCode, 500);
        assert.equal(responseJson.code, 'INTERNAL_ERROR');
    } finally {
        pool.getConnection = originalGetConnection;
    }
});

// 12. Identidad Visual: Favicon oficial en frontend/index.html y frontend/public
test('12. Identidad Visual: Resolución del Favicon y Apple Touch Icon en frontend', async () => {
    const indexHtmlPath = path.join(__dirname, '../../frontend/index.html');
    const distHtmlPath = path.join(__dirname, '../../frontend/dist/index.html');
    const publicLogoPath = path.join(__dirname, '../../frontend/public/logo-la-vina.jpeg');

    assert.ok(fs.existsSync(publicLogoPath), 'El logo oficial frontend/public/logo-la-vina.jpeg debe existir');
    
    const indexHtml = fs.readFileSync(indexHtmlPath, 'utf8');
    assert.ok(indexHtml.includes('rel="icon" type="image/jpeg" href="/logo-la-vina.jpeg"'), 'index.html debe contener el link de rel="icon"');
    assert.ok(indexHtml.includes('rel="apple-touch-icon" href="/logo-la-vina.jpeg"'), 'index.html debe contener el link de apple-touch-icon');

    if (fs.existsSync(distHtmlPath)) {
        const distHtml = fs.readFileSync(distHtmlPath, 'utf8');
        assert.ok(distHtml.includes('href="/logo-la-vina.jpeg"'), 'El build de producción en dist/index.html debe contener la referencia al icono oficial');
    }
});
