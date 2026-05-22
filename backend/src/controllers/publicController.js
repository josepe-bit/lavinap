const pool = require('../config/db');

exports.getActiveMessages = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, titulo, detalle FROM Mensajes WHERE activo = true ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error fetching active messages:', error);
        res.status(500).json({ message: 'Error fetching active messages' });
    }
};

exports.getTarifas = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT t.id, t.id_servicio, t.valor_hora, s.nombre as servicio_nombre, s.descripcion
            FROM Tarifas t
            JOIN Servicios s ON t.id_servicio = s.id
            ORDER BY t.id_servicio ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching tarifas:', error);
        res.status(500).json({ message: 'Error fetching tarifas' });
    }
};

exports.getPublicTorneos = async (req, res) => {
    try {
        const queryTorneos = `
            SELECT t.*
            FROM Torneos t
            WHERE t.estado = 'en_oferta'
            ORDER BY t.created_at DESC
        `;
        const [torneorows] = await pool.query(queryTorneos);
        
        if (torneorows.length === 0) {
            return res.json([]);
        }

        const torneoIds = torneorows.map(t => t.id);
        const queryPremios = `
            SELECT * FROM Premios WHERE torneo_id IN (?)
        `;
        const [premiosrows] = await pool.query(queryPremios, [torneoIds]);

        const torneos = torneorows.map(torneo => {
            return {
                ...torneo,
                premios: premiosrows.filter(p => p.torneo_id === torneo.id).map(p => ({
                    id: p.id,
                    descripcion: p.descripcion,
                    valor: p.valor
                }))
            };
        });

        res.json(torneos);
    } catch (error) {
        console.error('Error fetching public torneos:', error);
        res.status(500).json({ message: 'Error fetching public torneos' });
    }
};

exports.getParametros = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT numero_nequi, whatsapp_establecimiento, email_establecimiento FROM Parametros WHERE id = 1');
        res.json(rows[0] || {});
    } catch (error) {
        console.error('Error fetching parametros:', error);
        res.status(500).json({ message: 'Error fetching parametros' });
    }
};

exports.getDbDebug = async (req, res) => {
    try {
        const dbConfig = {
            host: process.env.DB_HOST,
            port: process.env.DB_PORT,
            user: process.env.DB_USER,
            database: process.env.DB_NAME,
            sslEnabled: !!(process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com'))),
            hasPassword: !!process.env.DB_PASSWORD,
        };
        
        let connectionError = null;
        try {
            const [rows] = await pool.query('SELECT 1 + 1 AS solution');
        } catch (err) {
            connectionError = {
                message: err.message,
                code: err.code,
                errno: err.errno,
                sqlState: err.sqlState
            };
        }
        
        res.json({
            config: dbConfig,
            connectionError: connectionError,
            status: connectionError ? 'failed' : 'success'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
