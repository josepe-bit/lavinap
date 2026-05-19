const pool = require('../config/db');

exports.getPromociones = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, c.nombre as cliente_nombre, c.documento as cliente_documento 
            FROM promociones p
            JOIN Clientes c ON p.clienteid = c.id
        `);
        const [metaRes] = await pool.query('SELECT meta_juegos_promocion FROM Parametros LIMIT 1');
        const meta = metaRes[0] ? metaRes[0].meta_juegos_promocion : 10;
        
        res.json({ data: rows, meta });
    } catch (error) {
        console.error('Error fetching promociones:', error);
        res.status(500).json({ message: 'Error fetching promociones' });
    }
};

exports.createPromocion = async (req, res) => {
    const { clienteid, servicioid, cantidad_servicios, fecha_ultimoserv, fecha_tomapromo, hora_tomapromo } = req.body;
    try {
        // Validate required fields
        if (!clienteid || !servicioid) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        const [result] = await pool.query(
            'INSERT INTO promociones (clienteid, servicioid, cantidad_servicios, fecha_ultimoserv, fecha_tomapromo, hora_tomapromo) VALUES (?, ?, ?, ?, ?, ?)',
            [clienteid, servicioid, cantidad_servicios || 0, fecha_ultimoserv || null, fecha_tomapromo || null, hora_tomapromo || null]
        );
        res.json({ message: 'Promoción registrada exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error creating promocion:', error);
        res.status(500).json({ message: 'Error al crear promoción' });
    }
};

exports.updatePromocion = async (req, res) => {
    const { id } = req.params;
    const { clienteid, servicioid, cantidad_servicios, fecha_ultimoserv, fecha_tomapromo, hora_tomapromo } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE promociones SET clienteid = ?, servicioid = ?, cantidad_servicios = ?, fecha_ultimoserv = ?, fecha_tomapromo = ?, hora_tomapromo = ? WHERE id = ?',
            [clienteid, servicioid, cantidad_servicios, fecha_ultimoserv || null, fecha_tomapromo || null, hora_tomapromo || null, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Promoción no encontrada' });
        res.json({ message: 'Promoción actualizada exitosamente' });
    } catch (error) {
        console.error('Error updating promocion:', error);
        res.status(500).json({ message: 'Error al actualizar promoción' });
    }
};

exports.deletePromocion = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM promociones WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Promoción no encontrada' });
        res.json({ message: 'Promoción eliminada exitosamente' });
    } catch (error) {
        console.error('Error deleting promocion:', error);
        res.status(500).json({ message: 'Error al eliminar promoción' });
    }
};

exports.tomarPromocion = async (req, res) => {
    const { id } = req.params;
    const { fecha_tomapromo, hora_tomapromo } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [promo] = await connection.query('SELECT * FROM promociones WHERE id = ?', [id]);
        if (promo.length === 0) {
            throw new Error('Promoción no encontrada');
        }

        const p = promo[0];

        // Validar si tiene los juegos requeridos
        const [metaRes] = await connection.query('SELECT meta_juegos_promocion FROM Parametros LIMIT 1');
        const meta = metaRes[0] ? metaRes[0].meta_juegos_promocion : 10;

        if (p.cantidad_servicios < meta) {
            throw new Error('No tiene suficientes servicios para tomar la promoción');
        }

        // Crear la reserva para la promoción
        // La duración será de 1 hora por defecto (como las demás reservas)
        const [h, m] = hora_tomapromo.split(':');
        const hora_fin_obj = new Date();
        hora_fin_obj.setHours(parseInt(h) + 1, parseInt(m), 0);
        const hora_fin = `${String(hora_fin_obj.getHours()).padStart(2, '0')}:${String(hora_fin_obj.getMinutes()).padStart(2, '0')}:00`;

        // Aquí usamos servicioid como el ID de la cancha a reservar.
        // Si el servicioid en promociones es 2 (Fútbol 5), deberíamos escoger la 2 o 3, pero podemos intentar con la 2 (A) o 3 (B).
        // Si no, podríamos requerir un \`id_cancha_tomar\` en el body si se trata de Fútbol 5.
        const id_servicio_reserva = p.servicioid === 2 ? 2 : p.servicioid;

        // Validar cruce
        const [existingRes] = await connection.query(
            `SELECT id FROM Reservas 
             WHERE fecha = ? AND estado != 'cancelado' AND id_servicio = ?
             AND ( (hora_inicio < ? AND hora_fin > ?) )`,
            [fecha_tomapromo, id_servicio_reserva, hora_fin, hora_tomapromo]
        );

        if (existingRes.length > 0) {
            throw new Error('El horario seleccionado no está disponible debido a un cruce con otra reserva');
        }

        // Crear reserva (costo 0, abonada)
        await connection.query(
            "INSERT INTO Reservas (id_cliente, id_servicio, fecha, hora_inicio, hora_fin, abono, estado, origen) VALUES (?, ?, ?, ?, ?, ?, ?, 'Normal')",
            [p.clienteid, id_servicio_reserva, fecha_tomapromo, hora_tomapromo, hora_fin, 0, 'confirmado']
        );

        // Actualizar el registro de promoción: restar la meta de cantidad de servicios o reiniciar
        // y registrar fecha/hora de toma
        // El usuario dice: "y no tener en cuenta este servicio para la nueva promoción." -> ya lo hacemos porque le restamos la meta.
        const nueva_cantidad = p.cantidad_servicios - meta;

        await connection.query(
            'UPDATE promociones SET cantidad_servicios = ?, fecha_tomapromo = ?, hora_tomapromo = ? WHERE id = ?',
            [nueva_cantidad, fecha_tomapromo, hora_tomapromo, id]
        );

        await connection.commit();
        res.json({ message: 'Promoción tomada y reserva creada exitosamente' });
    } catch (error) {
        await connection.rollback();
        console.error('Error al tomar promoción:', error);
        res.status(400).json({ message: error.message || 'Error al tomar promoción' });
    } finally {
        connection.release();
    }
};
