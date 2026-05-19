const fs = require('fs');
let code = fs.readFileSync('backend/src/routes/adminRoutes.js', 'utf8');

const adminRoleMiddlewareCode = `
// Middleware admin role
const adminRoleMiddleware = (req, res, next) => {
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso exclusivo para administradores.' });
    }
    next();
};
`;

code = code.replace('router.use(authMiddleware);', 'router.use(authMiddleware);\\n' + adminRoleMiddlewareCode);

const replaceEndpoint = (verb, endpoint) => {
    const from = `router.${verb}('${endpoint}', `;
    const to = `router.${verb}('${endpoint}', adminRoleMiddleware, `;
    code = code.replace(from, to);
};

// Tarifas
replaceEndpoint('get', '/tarifas');
replaceEndpoint('post', '/tarifas');
replaceEndpoint('delete', '/tarifas/:id');

// Servicios
replaceEndpoint('get', '/servicios');
replaceEndpoint('post', '/servicios');
replaceEndpoint('put', '/servicios/:id');
replaceEndpoint('delete', '/servicios/:id');

// Torneos, Equipos, Grupos, Fechas, etc (Campeonatos)
const entities = ['torneos', 'premios', 'equipos', 'jugaxequipo', 'grupos', 'equixgrupo', 'fecxtorneo', 'parxfecha'];

for (let ent of entities) {
    replaceEndpoint('get', `/${ent}`);
    replaceEndpoint('post', `/${ent}`);
    replaceEndpoint('put', `/${ent}/:id`);
    replaceEndpoint('delete', `/${ent}/:id`);
}

replaceEndpoint('post', '/fecxtorneo/:id/programacion');
replaceEndpoint('post', '/fecxtorneo/:id/resultados');

// Parametros
replaceEndpoint('get', '/parametros');
replaceEndpoint('put', '/parametros');

// Usuarios
code = code.replace("router.get('/usuarios', superAdminMiddleware", "router.get('/usuarios', adminRoleMiddleware");
code = code.replace("router.post('/usuarios', superAdminMiddleware", "router.post('/usuarios', adminRoleMiddleware");
code = code.replace("router.put('/usuarios/:id', superAdminMiddleware", "router.put('/usuarios/:id', adminRoleMiddleware");
code = code.replace("router.delete('/usuarios/:id', superAdminMiddleware", "router.delete('/usuarios/:id', adminRoleMiddleware");

fs.writeFileSync('backend/src/routes/adminRoutes.js', code);
console.log('Update complete.');
