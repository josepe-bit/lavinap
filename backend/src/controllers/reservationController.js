const pool = require('../config/db');

exports.getReservations = async (req, res) => {
    const { fecha } = req.query;
    try {
        let query = `
      SELECT r.id, r.id_servicio, r.fecha, r.hora_inicio, r.hora_fin, r.estado, c.nombre as cliente_nombre 
      FROM Reservas r
      JOIN Clientes c ON r.id_cliente = c.id
    `;
        const params = [];
        if (fecha) {
            query += ` WHERE r.fecha = ?`;
            params.push(fecha);
        }

        // Convert to Date without time zone issues or just use as string because of MySQL DATE
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching reservations:', error);
        res.status(500).json({ message: 'Error fetching reservations' });
    }
};

exports.createReservation = async (req, res) => {
    const { nombre, documento, correo, celular, id_servicio, fecha, hora_inicio, hora_fin, abono } = req.body;
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Validations: Check required fields
        if (!nombre || !documento || !correo || !celular || !id_servicio || !fecha || !hora_inicio || !hora_fin) {
            return res.status(400).json({ message: 'Faltan campos obligatorios' });
        }

        if (hora_inicio >= hora_fin) {
            return res.status(400).json({ message: 'La hora de fin debe ser mayor a la inicial' });
        }

        // Checking cross availability
        const [existingRes] = await connection.query(
            `SELECT id_servicio, hora_inicio, hora_fin FROM Reservas 
       WHERE fecha = ? AND estado != 'cancelado' 
       AND (
         (hora_inicio < ? AND hora_fin > ?)
       )`,
            [fecha, hora_fin, hora_inicio]
        );

        const isOverlap = existingRes.some(r => {
            if (r.id_servicio === id_servicio) return true;
            if (id_servicio === 1 && (r.id_servicio === 2 || r.id_servicio === 3)) return true;
            if ((id_servicio === 2 || id_servicio === 3) && r.id_servicio === 1) return true;
            return false;
        });

        if (isOverlap) {
            await connection.rollback();
            return res.status(409).json({ message: 'El horario seleccionado no está disponible debido a un cruce con otra reserva' });
        }

        // Save or get Cliente
        let id_cliente;
        const [clientes] = await connection.query('SELECT id FROM Clientes WHERE documento = ?', [documento]);
        if (clientes.length > 0) {
            id_cliente = clientes[0].id;
            // Option to update client info...
        } else {
            const [insertClient] = await connection.query(
                'INSERT INTO Clientes (nombre, documento, correo, celular) VALUES (?, ?, ?, ?)',
                [nombre, documento, correo, celular]
            );
            id_cliente = insertClient.insertId;
        }

        // Save Reserva
        const [insertRes] = await connection.query(
            'INSERT INTO Reservas (id_cliente, id_servicio, fecha, hora_inicio, hora_fin, abono, estado) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [id_cliente, id_servicio, fecha, hora_inicio, hora_fin, abono || 0, 'pendiente']
        );

        await connection.commit();
        res.status(201).json({ message: 'Reserva creada exitosamente', id: insertRes.insertId });

        // Enviar notificación a administradores de forma asíncrona (sin bloquear respuesta)
        try {
            const [parametros] = await pool.query('SELECT email_establecimiento, email_representante FROM Parametros LIMIT 1');
            const [servicioInfo] = await pool.query('SELECT nombre FROM Servicios WHERE id = ?', [id_servicio]);
            
            if (parametros.length > 0 && servicioInfo.length > 0) {
                const { email_establecimiento, email_representante } = parametros[0];
                const serviceName = servicioInfo[0].nombre;
                
                const emailsToSend = [email_establecimiento, email_representante].filter(e => e && e.trim() !== '');
                if (emailsToSend.length > 0) {
                    const { sendAdminNotificationEmail } = require('../services/emailService');
                    sendAdminNotificationEmail({
                        to: emailsToSend.join(','),
                        clientName: nombre,
                        serviceName: serviceName,
                        date: fecha,
                        startTime: hora_inicio,
                        endTime: hora_fin
                    }).catch(err => console.error('Error en trigger de email:', err));
                }
            }
        } catch (emailErr) {
            console.error('Error procesando emails de notificación administrativa:', emailErr);
        }

    } catch (error) {
        await connection.rollback();
        console.error('Error creating reservation:', error);
        res.status(500).json({ message: 'Error al crear reserva' });
    } finally {
        connection.release();
    }
};
