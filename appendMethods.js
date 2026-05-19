const fs = require('fs');
let c = fs.readFileSync('backend/src/controllers/adminController.js', 'utf8');

c += `
exports.getParametros = async (req, res) => { 
    try { 
        const [rows] = await pool.query('SELECT * FROM Parametros WHERE id = 1'); 
        res.json(rows[0] || {}); 
    } catch(e) { 
        res.status(500).json({message: 'Error'}); 
    } 
};

exports.updateParametros = async (req, res) => { 
    try { 
        const data = req.body; 
        delete data.id; 
        await pool.query('UPDATE Parametros SET ? WHERE id = 1', [data]); 
        res.json({message: 'OK'}); 
    } catch(e) { 
        res.status(500).json({message: 'Error'}); 
    } 
};

exports.getPromociones = async (req, res) => { 
    try { 
        const [meta] = await pool.query('SELECT meta_juegos_promocion FROM Parametros LIMIT 1'); 
        const m = meta.length > 0 ? (meta[0].meta_juegos_promocion || 10) : 10; 
        const [rows] = await pool.query("SELECT c.id AS cliente_id, c.nombre, c.documento, COUNT(r.id) AS juegos_acumulados FROM Clientes c LEFT JOIN Reservas r ON c.id = r.id_cliente AND r.estado = 'completada' AND r.utilizada = false GROUP BY c.id HAVING juegos_acumulados > 0"); 
        res.json(rows.map(r => ({...r, juegos_acumulados: Math.min(r.juegos_acumulados, m), canClaim: r.juegos_acumulados >= m, meta: m}))); 
    } catch(e) { 
        res.status(500).json({message: 'Error'}); 
    } 
};

exports.canjearPromocion = async (req, res) => { 
    try { 
        const { cliente_id } = req.body; 
        const [meta] = await pool.query('SELECT meta_juegos_promocion FROM Parametros LIMIT 1'); 
        const m = meta.length > 0 ? (meta[0].meta_juegos_promocion || 10) : 10; 
        const [rows] = await pool.query("SELECT id FROM Reservas WHERE id_cliente = ? AND estado = 'completada' AND utilizada = false ORDER BY fecha ASC LIMIT ?", [cliente_id, m]); 
        if(rows.length < m) return res.status(400).json({message:'No suficientes'}); 
        for(let r of rows) await pool.query('UPDATE Reservas SET utilizada = true WHERE id = ?', [r.id]); 
        res.json({message: 'Canjeado'}); 
    } catch(e) { 
        res.status(500).json({message:'Error'}); 
    } 
};
`;

fs.writeFileSync('backend/src/controllers/adminController.js', c);
console.log('Done!');
