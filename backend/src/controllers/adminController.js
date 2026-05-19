const pool = require('../config/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendConfirmationEmail, sendProgramacionEmail, sendResultadosEmail } = require('../services/emailService');
const xlsx = require('xlsx');

// Simple email validation function
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

exports.getAllReservations = async (req, res) => {
    try {
        const query = `
      SELECT r.id, r.fecha, r.hora_inicio, r.hora_fin, r.estado, r.abono, r.utilizada, r.id_servicio,
             s.nombre as servicio_nombre, c.nombre as cliente_nombre, c.documento, c.celular 
      FROM Reservas r
      JOIN Servicios s ON r.id_servicio = s.id
      JOIN Clientes c ON r.id_cliente = c.id
      ORDER BY r.fecha DESC, r.hora_inicio DESC
    `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error('Error fetching admin reservations:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.updateReservationStatus = async (req, res) => {
    const { id } = req.params;
    const { estado } = req.body; // 'confirmado' o 'cancelado'

    if (!['confirmado', 'cancelado', 'pendiente'].includes(estado)) {
        return res.status(400).json({ message: 'Estado inválido' });
    }

    try {
        const [result] = await pool.query('UPDATE Reservas SET estado = ? WHERE id = ?', [estado, id]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        // Si se confirma la reserva, enviar email al cliente
        let emailSent = false;
        if (estado === 'confirmado') {
            try {
                const [paramRows] = await pool.query('SELECT email_establecimiento FROM Parametros WHERE id = 1');
                const fromEmail = paramRows.length > 0 ? paramRows[0].email_establecimiento : null;

                const [rows] = await pool.query(`
                    SELECT r.fecha, r.hora_inicio, r.hora_fin,
                           c.nombre AS cliente_nombre, c.correo AS cliente_correo,
                           s.nombre AS servicio_nombre
                    FROM Reservas r
                    JOIN Clientes c ON r.id_cliente = c.id
                    JOIN Servicios s ON r.id_servicio = s.id
                    WHERE r.id = ?
                `, [id]);

                if (rows.length > 0 && rows[0].cliente_correo) {
                    const reserva = rows[0];
                    const fechaStr = typeof reserva.fecha === 'string'
                        ? reserva.fecha.split('T')[0]
                        : new Date(reserva.fecha).toISOString().split('T')[0];

                    const emailResult = await sendConfirmationEmail({
                        to: reserva.cliente_correo,
                        fromEmail,
                        clientName: reserva.cliente_nombre,
                        serviceName: reserva.servicio_nombre,
                        date: fechaStr,
                        startTime: reserva.hora_inicio.substring(0, 5),
                        endTime: reserva.hora_fin.substring(0, 5)
                    });
                    emailSent = emailResult.success;
                }
            } catch (emailError) {
                console.error('Error al enviar email de confirmación:', emailError);
                // No se bloquea la confirmación si falla el email
            }
        }

        res.json({
            message: `Reserva actualizada a ${estado}`,
            emailSent
        });
    } catch (error) {
        console.error('Error updating reservation:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

// Obtener todas las tarifas
exports.getTarifas = async (req, res) => {
    try {
        const query = `
      SELECT t.id, t.id_servicio, t.valor_hora, t.fecha_actualizacion, s.nombre as servicio_nombre 
      FROM Tarifas t
      JOIN Servicios s ON t.id_servicio = s.id
    `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.createTarifa = async (req, res) => {
    const { id_servicio, valor_hora } = req.body;
    try {
        // Find if exists
        const [existing] = await pool.query('SELECT id FROM Tarifas WHERE id_servicio = ?', [id_servicio]);
        if (existing.length > 0) {
            await pool.query('UPDATE Tarifas SET valor_hora = ? WHERE id_servicio = ?', [valor_hora, id_servicio]);
        } else {
            await pool.query('INSERT INTO Tarifas (id_servicio, valor_hora) VALUES (?, ?)', [id_servicio, valor_hora]);
        }
        res.json({ message: 'Tarifa guardada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.deleteTarifa = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Tarifas WHERE id = ?', [id]);
        res.json({ message: 'Tarifa eliminada' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno al eliminar tarifa' });
    }
};

exports.getServicios = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Servicios');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error interno al obtener servicios' });
    }
};

exports.createServicio = async (req, res) => {
    const { nombre, descripcion } = req.body;
    try {
        await pool.query('INSERT INTO Servicios (nombre, descripcion) VALUES (?, ?)', [nombre, descripcion]);
        res.json({ message: 'Servicio creado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno al crear servicio' });
    }
};

exports.updateServicio = async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion } = req.body;
    try {
        await pool.query('UPDATE Servicios SET nombre = ?, descripcion = ? WHERE id = ?', [nombre, descripcion, id]);
        res.json({ message: 'Servicio actualizado' });
    } catch (error) {
        res.status(500).json({ message: 'Error interno al actualizar servicio' });
    }
};

exports.deleteServicio = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Servicios WHERE id = ?', [id]);
        res.json({ message: 'Servicio eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'No se puede eliminar un servicio que tiene reservas o tarifas asociadas' });
    }
};

exports.getClientes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Clientes ORDER BY nombre ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener clientes' });
    }
};

exports.createCliente = async (req, res) => {
    const { nombre, documento, correo, celular } = req.body;
    try {
        const [result] = await pool.query('INSERT INTO Clientes (nombre, documento, correo, celular) VALUES (?, ?, ?, ?)', [nombre, documento, correo, celular]);
        res.json({ message: 'Cliente registrado exitosamente', id: result.insertId });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ message: 'El documento o correo ya está registrado' });
        }
        res.status(500).json({ message: 'Error al registrar cliente' });
    }
};

exports.importClientes = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No se subió ningún archivo' });
        }

        // Leer el archivo desde el buffer de memoria
        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        
        // Convertir la hoja a JSON
        const data = xlsx.utils.sheet_to_json(sheet);
        
        if (!data || data.length === 0) {
            return res.status(400).json({ message: 'El archivo Excel está vacío o no se pudo leer.' });
        }

        let insertedCount = 0;
        let rejectedCount = 0;

        for (const row of data) {
            // Asegurar que existan los campos (haciendo trim e ignorando mayúsculas)
            const nombre = row['Nombre'] || row['nombre'];
            const documento = row['Documento'] || row['documento'];
            const correo = row['Correo'] || row['correo'];
            const celular = row['Celular'] || row['celular'];

            if (!nombre || !documento || !correo || !celular) {
                rejectedCount++;
                continue;
            }

            try {
                await pool.query(
                    'INSERT INTO Clientes (nombre, documento, correo, celular) VALUES (?, ?, ?, ?)', 
                    [String(nombre), String(documento), String(correo), String(celular)]
                );
                insertedCount++;
            } catch (err) {
                // If duplicates err (ER_DUP_ENTRY), just skip
                rejectedCount++;
            }
        }

        res.json({ message: 'Importación finalizada', insertedCount, rejectedCount });
    } catch (error) {
        console.error('Error importando clientes:', error);
        res.status(500).json({ message: 'Error procesando el archivo Excel' });
    }
};

exports.updateCliente = async (req, res) => {
    const { id } = req.params;
    const { nombre, documento, correo, celular } = req.body;
    try {
        await pool.query('UPDATE Clientes SET nombre = ?, documento = ?, correo = ?, celular = ? WHERE id = ?', [nombre, documento, correo, celular, id]);
        res.json({ message: 'Cliente actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar cliente' });
    }
};

exports.deleteCliente = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Clientes WHERE id = ?', [id]);
        res.json({ message: 'Cliente eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'No se puede eliminar un cliente con reservas' });
    }
};

exports.getMensajes = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Mensajes ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener mensajes' });
    }
};

exports.createMensaje = async (req, res) => {
    const { titulo, detalle, activo } = req.body;
    try {
        await pool.query('INSERT INTO Mensajes (titulo, detalle, activo) VALUES (?, ?, ?)', [titulo, detalle, activo !== undefined ? activo : true]);
        res.json({ message: 'Mensaje creado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear mensaje' });
    }
};

exports.updateMensaje = async (req, res) => {
    const { id } = req.params;
    const { titulo, detalle, activo } = req.body;
    try {
        await pool.query('UPDATE Mensajes SET titulo = ?, detalle = ?, activo = ? WHERE id = ?', [titulo, detalle, activo, id]);
        res.json({ message: 'Mensaje actualizado exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar mensaje' });
    }
};

exports.deleteMensaje = async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM Mensajes WHERE id = ?', [id]);
        res.json({ message: 'Mensaje eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar mensaje' });
    }
};

exports.getUsuarios = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, username, rol FROM Usuarios ORDER BY id ASC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener usuarios' });
    }
};

exports.createUsuario = async (req, res) => {
    const { username, password, rol } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        await pool.query('INSERT INTO Usuarios (username, password, rol) VALUES (?, ?, ?)', [username, hashedPassword, rol || 'admin']);
        res.json({ message: 'Usuario creado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'El nombre de usuario ya existe' });
        res.status(500).json({ message: 'Error al crear usuario' });
    }
};

exports.updateUsuario = async (req, res) => {
    const { id } = req.params;
    const { username, password, rol } = req.body;
    try {
        if (password && password.trim() !== '') {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
            await pool.query('UPDATE Usuarios SET username = ?, password = ?, rol = ? WHERE id = ?', [username, hashedPassword, rol || 'admin', id]);
        } else {
            await pool.query('UPDATE Usuarios SET username = ?, rol = ? WHERE id = ?', [username, rol || 'admin', id]);
        }
        res.json({ message: 'Usuario actualizado exitosamente' });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'El nombre de usuario ya existe' });
        res.status(500).json({ message: 'Error al actualizar usuario' });
    }
};

exports.deleteUsuario = async (req, res) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query('SELECT username FROM Usuarios WHERE id = ?', [id]);
        if (rows.length === 0) return res.status(404).json({ message: 'Usuario no encontrado' });
        if (rows[0].username === 'admin') {
            return res.status(400).json({ message: 'No se puede eliminar al usuario admin principal' });
        }
        if (id == req.user.id) {
            return res.status(400).json({ message: 'No puedes eliminar tu propia cuenta' });
        }

        await pool.query('DELETE FROM Usuarios WHERE id = ?', [id]);
        res.json({ message: 'Usuario eliminado' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

exports.createReservasRecurrentes = async (req, res) => {
    const { id_cliente, id_servicio, fecha_desde, fecha_hasta, dia_semana, hora_inicio } = req.body;
    
    // Calcular hora de fin agregando 1 hora a la hora de inicio
    const [hourStr, minStr] = hora_inicio.split(':');
    const endHour = (parseInt(hourStr, 10) + 1).toString().padStart(2, '0');
    const hora_fin = `${endHour}:${minStr}`;
    
    const start = new Date(fecha_desde + 'T00:00:00');
    const end = new Date(fecha_hasta + 'T23:59:59');
    
    const targetDay = parseInt(dia_semana);
    const jsDay = targetDay === 7 ? 0 : targetDay;
    
    const grupo_id = crypto.randomUUID();
    const reservasToInsert = [];
    
    let current = new Date(start);
    while (current <= end) {
        if (current.getDay() === jsDay) {
            reservasToInsert.push(current.toISOString().split('T')[0]);
        }
        current.setDate(current.getDate() + 1);
    }
    
    if (reservasToInsert.length === 0) {
        return res.status(400).json({ message: 'No hay fechas coincidentes en el periodo seleccionado.' });
    }
    
    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();
        
        try {
            for (const fecha of reservasToInsert) {
                await connection.query(
                    "INSERT INTO Reservas (id_cliente, id_servicio, fecha, hora_inicio, hora_fin, estado, grupo_id) VALUES (?, ?, ?, ?, ?, 'confirmado', ?)",
                    [id_cliente, id_servicio, fecha, hora_inicio, hora_fin, grupo_id]
                );
            }
            await connection.commit();
            res.json({ message: `Se generaron ${reservasToInsert.length} reservas (abonadas) exitosamente.` });
        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    } catch (error) {
        console.error('Error in recurring:', error);
        res.status(500).json({ message: 'Error creando el grupo de reservas recurrentes.' });
    }
};

exports.getReservasRecurrentes = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT r.grupo_id, c.nombre AS cliente, s.nombre AS servicio, 
                   MIN(r.fecha) as fecha_desde, MAX(r.fecha) as fecha_hasta, 
                   r.hora_inicio, r.hora_fin, COUNT(*) as total_reservas
            FROM Reservas r
            JOIN Clientes c ON r.id_cliente = c.id
            JOIN Servicios s ON r.id_servicio = s.id
            WHERE r.grupo_id IS NOT NULL
            GROUP BY r.grupo_id, c.nombre, s.nombre, r.hora_inicio, r.hora_fin
            ORDER BY fecha_desde DESC
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: 'Error obteniendo los grupos de reservas.' });
    }
};

exports.deleteReservasRecurrentes = async (req, res) => {
    const { grupo_id } = req.params;
    try {
        await pool.query('DELETE FROM Reservas WHERE grupo_id = ?', [grupo_id]);
        res.json({ message: 'Abonado/Reservas eliminadas.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar las reservas.' });
    }
};

exports.toggleUtilizada = async (req, res) => {
    const { id } = req.params;
    const { utilizada } = req.body;

    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        const [reservaRows] = await connection.query('SELECT * FROM Reservas WHERE id = ?', [id]);
        if (reservaRows.length === 0) {
            await connection.rollback();
            return res.status(404).json({ message: 'Reserva no encontrada' });
        }

        const reserva = reservaRows[0];
        const fueUtilizadaPreviamente = reserva.utilizada;

        await connection.query('UPDATE Reservas SET utilizada = ? WHERE id = ?', [utilizada, id]);

        if (utilizada && !fueUtilizadaPreviamente) {
            // Only non-championship
            if (reserva.origen === 'Normal') {
                const id_cliente = reserva.id_cliente;
                const raw_servicio = reserva.id_servicio;
                // Futbol 5 is 2 or 3, but in promociones we use 2
                const servicio_promo = (raw_servicio === 2 || raw_servicio === 3) ? 2 : raw_servicio;
                const fecha_reserva = new Date(reserva.fecha);

                const [promos] = await connection.query('SELECT * FROM promociones WHERE clienteid = ? AND servicioid = ?', [id_cliente, servicio_promo]);
                
                if (promos.length > 0) {
                    const promo = promos[0];
                    const fecha_ultimoserv = promo.fecha_ultimoserv ? new Date(promo.fecha_ultimoserv) : null;
                    const fecha_tomapromo = promo.fecha_tomapromo ? new Date(promo.fecha_tomapromo) : null;

                    let canSum = true;
                    if (fecha_ultimoserv && fecha_reserva < fecha_ultimoserv) {
                        canSum = false;
                    }
                    if (fecha_tomapromo && fecha_reserva <= fecha_tomapromo) {
                        canSum = false;
                    }

                    if (canSum) {
                        const new_count = (promo.cantidad_servicios || 0) + 1;
                        await connection.query(
                            'UPDATE promociones SET cantidad_servicios = ?, fecha_ultimoserv = ? WHERE id = ?',
                            [new_count, reserva.fecha, promo.id]
                        );
                    }
                } else {
                    // Create new promo
                    await connection.query(
                        'INSERT INTO promociones (clienteid, servicioid, cantidad_servicios, fecha_ultimoserv) VALUES (?, ?, ?, ?)',
                        [id_cliente, servicio_promo, 1, reserva.fecha]
                    );
                }
            }
        } else if (!utilizada && fueUtilizadaPreviamente) {
            // If they un-check it, we should ideally decrement, but for simplicity we can just decrement if possible
            if (reserva.origen === 'Normal') {
                const id_cliente = reserva.id_cliente;
                const raw_servicio = reserva.id_servicio;
                const servicio_promo = (raw_servicio === 2 || raw_servicio === 3) ? 2 : raw_servicio;

                const [promos] = await connection.query('SELECT * FROM promociones WHERE clienteid = ? AND servicioid = ?', [id_cliente, servicio_promo]);
                if (promos.length > 0) {
                    const promo = promos[0];
                    if (promo.cantidad_servicios > 0) {
                        await connection.query('UPDATE promociones SET cantidad_servicios = cantidad_servicios - 1 WHERE id = ?', [promo.id]);
                    }
                }
            }
        }

        await connection.commit();
        res.json({ message: `Reserva marcada como ${utilizada ? 'utilizada' : 'no utilizada'}` });
    } catch (error) {
        await connection.rollback();
        console.error('Error toggling utilizada:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    } finally {
        connection.release();
    }
};

// =============================================
// CRUD Torneos
// =============================================

exports.getTorneos = async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Torneos ORDER BY fecha_inicio DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener torneos:', error);
        res.status(500).json({ message: 'Error al obtener torneos' });
    }
};

exports.createTorneo = async (req, res) => {
    const { nombre, fecha_inicio, fecha_fin, detalle, estado, min_equipos, puntos_ganador, val_inscripcion, jugadoresxequipo } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Torneos (nombre, fecha_inicio, fecha_fin, detalle, estado, min_equipos, puntos_ganador, val_inscripcion, jugadoresxequipo) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [nombre, fecha_inicio, fecha_fin, detalle || null, estado || 'en_oferta', min_equipos, puntos_ganador, val_inscripcion, jugadoresxequipo || 0]
        );
        res.json({ message: 'Torneo creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al crear torneo:', error);
        res.status(500).json({ message: 'Error al crear torneo' });
    }
};

exports.updateTorneo = async (req, res) => {
    const { id } = req.params;
    const { nombre, fecha_inicio, fecha_fin, detalle, estado, min_equipos, puntos_ganador, val_inscripcion, jugadoresxequipo } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Torneos SET nombre = ?, fecha_inicio = ?, fecha_fin = ?, detalle = ?, estado = ?, min_equipos = ?, puntos_ganador = ?, val_inscripcion = ?, jugadoresxequipo = ? WHERE id = ?',
            [nombre, fecha_inicio, fecha_fin, detalle || null, estado, min_equipos, puntos_ganador, val_inscripcion, jugadoresxequipo || 0, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Torneo no encontrado' });
        res.json({ message: 'Torneo actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar torneo:', error);
        res.status(500).json({ message: 'Error al actualizar torneo' });
    }
};

exports.deleteTorneo = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Torneos WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Torneo no encontrado' });
        res.json({ message: 'Torneo eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar torneo:', error);
        res.status(500).json({ message: 'Error al eliminar torneo' });
    }
};

// =============================================
// CRUD Premios
// =============================================

exports.getPremios = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT p.*, t.nombre AS torneo_nombre
            FROM Premios p
            JOIN Torneos t ON p.torneo_id = t.id
            ORDER BY p.id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener premios:', error);
        res.status(500).json({ message: 'Error al obtener premios' });
    }
};

exports.createPremio = async (req, res) => {
    const { torneo_id, descripcion, valor } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Premios (torneo_id, descripcion, valor) VALUES (?, ?, ?)',
            [torneo_id, descripcion, valor]
        );
        res.json({ message: 'Premio creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al crear premio:', error);
        res.status(500).json({ message: 'Error al crear premio' });
    }
};

exports.updatePremio = async (req, res) => {
    const { id } = req.params;
    const { torneo_id, descripcion, valor } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Premios SET torneo_id = ?, descripcion = ?, valor = ? WHERE id = ?',
            [torneo_id, descripcion, valor, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Premio no encontrado' });
        res.json({ message: 'Premio actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar premio:', error);
        res.status(500).json({ message: 'Error al actualizar premio' });
    }
};

exports.deletePremio = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Premios WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Premio no encontrado' });
        res.json({ message: 'Premio eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar premio:', error);
        res.status(500).json({ message: 'Error al eliminar premio' });
    }
};

// =============================================
// CRUD Equipos
// =============================================

exports.getEquipos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT e.*, t.nombre AS torneo_nombre, c.nombre AS cliente_nombre
            FROM Equipos e
            JOIN Torneos t ON e.torneo_id = t.id
            JOIN Clientes c ON e.cliente_id = c.id
            ORDER BY e.id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener equipos:', error);
        res.status(500).json({ message: 'Error al obtener equipos' });
    }
};

exports.createEquipo = async (req, res) => {
    const { nombre, torneo_id, cliente_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Equipos (nombre, torneo_id, cliente_id) VALUES (?, ?, ?)',
            [nombre, torneo_id, cliente_id]
        );
        res.json({ message: 'Equipo creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al crear equipo:', error);
        res.status(500).json({ message: 'Error al crear equipo' });
    }
};

exports.updateEquipo = async (req, res) => {
    const { id } = req.params;
    const { nombre, torneo_id, cliente_id } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Equipos SET nombre = ?, torneo_id = ?, cliente_id = ? WHERE id = ?',
            [nombre, torneo_id, cliente_id, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipo no encontrado' });
        res.json({ message: 'Equipo actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar equipo:', error);
        res.status(500).json({ message: 'Error al actualizar equipo' });
    }
};

exports.deleteEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Equipos WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Equipo no encontrado' });
        res.json({ message: 'Equipo eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar equipo:', error);
        res.status(500).json({ message: 'Error al eliminar equipo' });
    }
};

// =============================================
// CRUD JugaxEquipo
// =============================================

exports.getJugaxEquipo = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT je.*, e.nombre AS equipo_nombre, c.nombre AS cliente_nombre
            FROM JugaxEquipo je
            JOIN Equipos e ON je.equipo_id = e.id
            JOIN Clientes c ON je.cliente_id = c.id
            ORDER BY je.id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener jugadores por equipo:', error);
        res.status(500).json({ message: 'Error al obtener jugadores por equipo' });
    }
};

exports.createJugaxEquipo = async (req, res) => {
    const { equipo_id, cliente_id } = req.body;
    try {
        // Verificar límite de jugadores
        const [rows] = await pool.query(`
            SELECT 
                (SELECT COUNT(*) FROM JugaxEquipo WHERE equipo_id = ?) as current_players,
                t.jugadoresxequipo
            FROM Equipos e
            JOIN Torneos t ON e.torneo_id = t.id
            WHERE e.id = ?
        `, [equipo_id, equipo_id]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Equipo no encontrado' });
        }

        const stats = rows[0];
        if (stats.current_players >= stats.jugadoresxequipo) {
            return res.status(400).json({ 
                message: `Límite alcanzado: El torneo solo permite un máximo de ${stats.jugadoresxequipo} jugadores por equipo.` 
            });
        }

        const [result] = await pool.query(
            'INSERT INTO JugaxEquipo (equipo_id, cliente_id) VALUES (?, ?)',
            [equipo_id, cliente_id]
        );
        res.json({ message: 'Jugador asignado al equipo exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al asignar jugador:', error);
        res.status(500).json({ message: 'Error al asignar jugador al equipo' });
    }
};

exports.updateJugaxEquipo = async (req, res) => {
    const { id } = req.params;
    const { equipo_id, cliente_id } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE JugaxEquipo SET equipo_id = ?, cliente_id = ? WHERE id = ?',
            [equipo_id, cliente_id, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json({ message: 'Jugador actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar jugador:', error);
        res.status(500).json({ message: 'Error al actualizar jugador' });
    }
};

exports.deleteJugaxEquipo = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM JugaxEquipo WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json({ message: 'Jugador removido del equipo exitosamente' });
    } catch (error) {
        console.error('Error al eliminar jugador del equipo:', error);
        res.status(500).json({ message: 'Error al eliminar jugador del equipo' });
    }
};

// =============================================
// CRUD Grupos
// =============================================

exports.getGrupos = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT g.*, t.nombre AS torneo_nombre
            FROM Grupos g
            JOIN Torneos t ON g.torneo_id = t.id
            ORDER BY g.id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener grupos:', error);
        res.status(500).json({ message: 'Error al obtener grupos' });
    }
};

exports.createGrupo = async (req, res) => {
    const { nombre, torneo_id, numero_equipos, a_eliminar, estado } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO Grupos (nombre, torneo_id, numero_equipos, a_eliminar, estado) VALUES (?, ?, ?, ?, ?)',
            [nombre, torneo_id, numero_equipos, a_eliminar, estado || 'activo']
        );
        res.json({ message: 'Grupo creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al crear grupo:', error);
        res.status(500).json({ message: 'Error al crear grupo' });
    }
};

exports.updateGrupo = async (req, res) => {
    const { id } = req.params;
    const { nombre, torneo_id, numero_equipos, a_eliminar, estado } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE Grupos SET nombre = ?, torneo_id = ?, numero_equipos = ?, a_eliminar = ?, estado = ? WHERE id = ?',
            [nombre, torneo_id, numero_equipos, a_eliminar, estado, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Grupo no encontrado' });
        res.json({ message: 'Grupo actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar grupo:', error);
        res.status(500).json({ message: 'Error al actualizar grupo' });
    }
};

exports.deleteGrupo = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM Grupos WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Grupo no encontrado' });
        res.json({ message: 'Grupo eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar grupo:', error);
        res.status(500).json({ message: 'Error al eliminar grupo' });
    }
};

// =============================================
// CRUD EquixGrupo
// =============================================

exports.getEquixGrupo = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT eg.*, g.nombre AS grupo_nombre, e.nombre AS equipo_nombre
            FROM EquixGrupo eg
            JOIN Grupos g ON eg.grupo_id = g.id
            JOIN Equipos e ON eg.equipo_id = e.id
            ORDER BY eg.id DESC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener equipos por grupo:', error);
        res.status(500).json({ message: 'Error al obtener equipos por grupo' });
    }
};

exports.createEquixGrupo = async (req, res) => {
    const { grupo_id, equipo_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO EquixGrupo (grupo_id, equipo_id) VALUES (?, ?)',
            [grupo_id, equipo_id]
        );
        res.json({ message: 'Equipo asignado al grupo exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al asignar equipo al grupo:', error);
        res.status(500).json({ message: 'Error al asignar equipo al grupo' });
    }
};

exports.updateEquixGrupo = async (req, res) => {
    const { id } = req.params;
    const { grupo_id, equipo_id } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE EquixGrupo SET grupo_id = ?, equipo_id = ? WHERE id = ?',
            [grupo_id, equipo_id, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json({ message: 'Registro actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar equipo en grupo:', error);
        res.status(500).json({ message: 'Error al actualizar equipo en grupo' });
    }
};

exports.deleteEquixGrupo = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM EquixGrupo WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Registro no encontrado' });
        res.json({ message: 'Equipo removido del grupo exitosamente' });
    } catch (error) {
        console.error('Error al eliminar equipo del grupo:', error);
        res.status(500).json({ message: 'Error al eliminar equipo del grupo' });
    }
};

// =============================================
// CRUD FecxTorneo
// =============================================

exports.getFecxTorneo = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT ft.*, t.nombre AS torneo_nombre
            FROM FecxTorneo ft
            JOIN Torneos t ON ft.torneo_id = t.id
            ORDER BY ft.fecha ASC, ft.hora_inicio ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener fechas de torneo:', error);
        res.status(500).json({ message: 'Error al obtener fechas de torneo' });
    }
};

exports.createFecxTorneo = async (req, res) => {
    const { numero_partidos, fecha, hora_inicio, hora_fin, torneo_id } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO FecxTorneo (numero_partidos, fecha, hora_inicio, hora_fin, torneo_id) VALUES (?, ?, ?, ?, ?)',
            [numero_partidos, fecha, hora_inicio, hora_fin, torneo_id]
        );
        res.json({ message: 'Fecha de torneo creada exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al crear fecha de torneo:', error);
        res.status(500).json({ message: 'Error al crear fecha de torneo' });
    }
};

exports.updateFecxTorneo = async (req, res) => {
    const { id } = req.params;
    const { numero_partidos, fecha, hora_inicio, hora_fin, torneo_id } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE FecxTorneo SET numero_partidos = ?, fecha = ?, hora_inicio = ?, hora_fin = ?, torneo_id = ? WHERE id = ?',
            [numero_partidos, fecha, hora_inicio, hora_fin, torneo_id, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Fecha de torneo no encontrada' });
        res.json({ message: 'Fecha de torneo actualizada exitosamente' });
    } catch (error) {
        console.error('Error al actualizar fecha de torneo:', error);
        res.status(500).json({ message: 'Error al actualizar fecha de torneo' });
    }
};

exports.deleteFecxTorneo = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM FecxTorneo WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Fecha de torneo no encontrada' });
        res.json({ message: 'Fecha de torneo eliminada exitosamente' });
    } catch (error) {
        console.error('Error al eliminar fecha de torneo:', error);
        res.status(500).json({ message: 'Error al eliminar fecha de torneo' });
    }
};

// =============================================
// CRUD ParxFecha
// =============================================

exports.getParxFecha = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT pf.*,
                   el.nombre AS equipo_local_nombre, ev.nombre AS equipo_vis_nombre,
                   gl.nombre AS grupo_local_nombre, gv.nombre AS grupo_vis_nombre,
                   ft.fecha AS fecha_torneo, ft.hora_inicio AS hora_torneo
            FROM ParxFecha pf
            JOIN Equipos el ON pf.equipo_id_local = el.id
            JOIN Equipos ev ON pf.equipo_id_vis = ev.id
            JOIN Grupos gl ON pf.grupo_id_local = gl.id
            JOIN Grupos gv ON pf.grupo_id_vis = gv.id
            JOIN FecxTorneo ft ON pf.fec_torneo_id = ft.id
            ORDER BY ft.fecha ASC, pf.id ASC
        `);
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener partidos por fecha:', error);
        res.status(500).json({ message: 'Error al obtener partidos por fecha' });
    }
};

exports.createParxFecha = async (req, res) => {
    const { fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, equipo_id_vis, puntos_vis, grupo_id_vis, goles_local, goles_vis, hora, id_servicio } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO ParxFecha (fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, goles_local, equipo_id_vis, puntos_vis, goles_vis, grupo_id_vis, hora, id_servicio) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local || 0, goles_local || 0, equipo_id_vis, puntos_vis || 0, goles_vis || 0, grupo_id_vis, hora || null, id_servicio || null]
        );
        res.json({ message: 'Partido creado exitosamente', id: result.insertId });
    } catch (error) {
        console.error('Error al crear partido:', error);
        res.status(500).json({ message: 'Error al crear partido' });
    }
};

exports.updateParxFecha = async (req, res) => {
    const { id } = req.params;
    const { fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local, equipo_id_vis, puntos_vis, grupo_id_vis, goles_local, goles_vis, hora, id_servicio } = req.body;
    try {
        const [result] = await pool.query(
            'UPDATE ParxFecha SET fec_torneo_id = ?, equipo_id_local = ?, grupo_id_local = ?, puntos_local = ?, goles_local = ?, equipo_id_vis = ?, puntos_vis = ?, goles_vis = ?, grupo_id_vis = ?, hora = ?, id_servicio = ? WHERE id = ?',
            [fec_torneo_id, equipo_id_local, grupo_id_local, puntos_local || 0, goles_local || 0, equipo_id_vis, puntos_vis || 0, goles_vis || 0, grupo_id_vis, hora || null, id_servicio || null, id]
        );
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Partido no encontrado' });
        res.json({ message: 'Partido actualizado exitosamente' });
    } catch (error) {
        console.error('Error al actualizar partido:', error);
        res.status(500).json({ message: 'Error al actualizar partido' });
    }
};

exports.deleteParxFecha = async (req, res) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query('DELETE FROM ParxFecha WHERE id = ?', [id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Partido no encontrado' });
        res.json({ message: 'Partido eliminado exitosamente' });
    } catch (error) {
        console.error('Error al eliminar partido:', error);
        res.status(500).json({ message: 'Error al eliminar partido' });
    }
};

const sendFechasEmailWrapper = async (req, res, sendFunc, typeStr, isProgramacion = false) => {
    const { id } = req.params;
    try {
        const [fechas] = await pool.query('SELECT f.fecha, f.hora_inicio as hora_torneo, t.nombre AS torneo_nombre FROM FecxTorneo f JOIN Torneos t ON f.torneo_id = t.id WHERE f.id = ?', [id]);
        if (fechas.length === 0) {
            return res.status(404).json({ message: 'Fecha no encontrada' });
        }
        const { fecha, torneo_nombre, hora_torneo } = fechas[0];

        const [partidos] = await pool.query(`
            SELECT pf.*, el.nombre AS equipo_local_nombre, ev.nombre AS equipo_vis_nombre,
                   cl.correo AS email_local, cv.correo AS email_vis,
                   gl.nombre AS grupo_local_nombre, gv.nombre AS grupo_vis_nombre
            FROM ParxFecha pf
            JOIN Equipos el ON pf.equipo_id_local = el.id
            JOIN Clientes cl ON el.cliente_id = cl.id
            JOIN Equipos ev ON pf.equipo_id_vis = ev.id
            JOIN Clientes cv ON ev.cliente_id = cv.id
            LEFT JOIN Grupos gl ON pf.grupo_id_local = gl.id
            LEFT JOIN Grupos gv ON pf.grupo_id_vis = gv.id
            WHERE pf.fec_torneo_id = ?
        `, [id]);

        if (partidos.length === 0) {
            return res.status(400).json({ message: 'No hay partidos programados en esta fecha para enviar.' });
        }

        const emails = new Set();
        partidos.forEach(p => {
            if (p.email_local && p.email_local.trim() && isValidEmail(p.email_local.trim())) emails.add(p.email_local.trim());
            if (p.email_vis && p.email_vis.trim() && isValidEmail(p.email_vis.trim())) emails.add(p.email_vis.trim());
        });

        if (emails.size === 0) {
            return res.status(400).json({ message: 'Ninguno de los equipos seleccionados tiene un correo válido asociado.' });
        }

        const [paramRows] = await pool.query('SELECT * FROM Parametros WHERE id = 1');
        const pa = paramRows[0] || {};
        if (pa.email_establecimiento && isValidEmail(pa.email_establecimiento)) emails.add(pa.email_establecimiento);
        if (pa.email_representante && isValidEmail(pa.email_representante)) emails.add(pa.email_representante);

        const emailArr = Array.from(emails);
        console.log('Emails to send to:', emailArr);
        const params = {
            to: emailArr.join(', '),
            torneoName: torneo_nombre,
            fechaDate: new Date(fecha).toLocaleDateString('es-CO'),
            horaTorneo: hora_torneo,
            partidos
        };
        const result = await sendFunc(params);
        if(!result || !result.success) {
            return res.status(500).json({ message: 'Error al enviar ' + typeStr + (result?.error ? ': ' + result.error : '') });
        }

        res.json({ message: typeStr + ' enviada con éxito a ' + emails.size + ' correo(s)' });
    } catch (error) {
        console.error('Error al enviar email de fecha:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

exports.enviarProgramacionFecha = async (req, res) => {
    return sendFechasEmailWrapper(req, res, sendProgramacionEmail, 'Programación', true);
};

exports.enviarResultadosFecha = async (req, res) => {
    return sendFechasEmailWrapper(req, res, sendResultadosEmail, 'Resultados');
};

exports.reservarCanchasFecha = async (req, res) => {
    const { id } = req.params;
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const [fechas] = await connection.query('SELECT f.fecha, t.nombre AS torneo_nombre FROM FecxTorneo f JOIN Torneos t ON f.torneo_id = t.id WHERE f.id = ?', [id]);
        if (fechas.length === 0) throw new Error('Fecha no encontrada');
        const { fecha, torneo_nombre } = fechas[0];

        const [partidos] = await connection.query('SELECT * FROM ParxFecha WHERE fec_torneo_id = ?', [id]);
        
        if (partidos.length === 0) {
            throw new Error('No hay partidos en esta fecha para reservar');
        }

        let id_cliente;
        const [clientes] = await connection.query('SELECT id FROM Clientes WHERE documento = ?', ['TORNEO_ADMIN']);
        if (clientes.length > 0) {
            id_cliente = clientes[0].id;
        } else {
            const [insertClient] = await connection.query(
                'INSERT INTO Clientes (nombre, documento, correo, celular) VALUES (?, ?, ?, ?)',
                ['Torneo La Viña', 'TORNEO_ADMIN', 'lavinacanchas@gmail.com', '0000000000']
            );
            id_cliente = insertClient.insertId;
        }

        let reservasCreadas = 0;
        for (const p of partidos) {
            const servicio = p.id_servicio || 1; 
            
            if (p.hora) {
                const hora_inicio = p.hora;
                const [h, m] = hora_inicio.split(':');
                const hora_fin_obj = new Date();
                hora_fin_obj.setHours(parseInt(h) + 1, parseInt(m), 0);
                const hora_fin = `${String(hora_fin_obj.getHours()).padStart(2, '0')}:${String(hora_fin_obj.getMinutes()).padStart(2, '0')}:00`;

                const [existingRes] = await connection.query(
                    `SELECT id FROM Reservas 
                     WHERE fecha = ? AND estado != 'cancelado' AND id_servicio = ?
                     AND ( (hora_inicio < ? AND hora_fin > ?) )`,
                    [fecha, servicio, hora_fin, hora_inicio]
                );

                if (existingRes.length === 0) {
                    await connection.query(
                        'INSERT INTO Reservas (id_cliente, id_servicio, fecha, hora_inicio, hora_fin, abono, estado, origen) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
                        [id_cliente, servicio, fecha, hora_inicio, hora_fin, 0, 'confirmado', 'Campeonato']
                    );
                    reservasCreadas++;
                }
            }
        }

        await connection.commit();
        res.json({ message: `Se han reservado exitosamente ${reservasCreadas} canchas para los partidos de la fecha.` });
    } catch (error) {
        await connection.rollback();
        console.error('Error al reservar canchas:', error);
        res.status(500).json({ message: error.message || 'Error al reservar canchas' });
    } finally {
        connection.release();
    }
};

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

