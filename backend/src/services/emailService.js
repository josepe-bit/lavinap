const { Resend } = require('resend');
require('dotenv').config();

if (!process.env.RESEND_API_KEY) {
    console.warn('⚠️ ADVERTENCIA: RESEND_API_KEY no está configurado en el archivo .env. El envío de correos no funcionará.');
} else {
    console.log('Resend service is configured and ready');
}
const resend = new Resend(process.env.RESEND_API_KEY);

const formatEmailDate = (date) => {
    if (!date) return '';
    const dateStr = typeof date === 'string' ? date : new Date(date).toISOString().split('T')[0];
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day).toLocaleDateString('es-CO', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
};

/**
 * Envía correo de confirmación de reserva al cliente.
 */
const sendConfirmationEmail = async ({ to, fromEmail, clientName, serviceName, date, startTime, endTime }) => {
    const formattedDate = formatEmailDate(date);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#16a34a,#059669);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                    ⚽ La Viña
                </h1>
                <p style="color:#bbf7d0;margin:8px 0 0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">
                    Canchas Sintéticas
                </p>
            </div>

            <!-- Body -->
            <div style="background:#ffffff;padding:32px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                <!-- Success Badge -->
                <div style="text-align:center;margin-bottom:24px;">
                    <div style="display:inline-block;background:#f0fdf4;border:2px solid #bbf7d0;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">
                        ✅
                    </div>
                    <h2 style="color:#15803d;margin:16px 0 4px;font-size:22px;font-weight:800;">
                        ¡Reserva Confirmada!
                    </h2>
                    <p style="color:#6b7280;margin:0;font-size:14px;">
                        Tu reserva ha sido verificada y confirmada exitosamente.
                    </p>
                </div>

                <!-- Greeting -->
                <p style="color:#374151;font-size:16px;line-height:1.6;margin-bottom:24px;">
                    Hola <strong style="color:#111827;">${clientName}</strong>,
                </p>
                <p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:24px;">
                    Nos complace informarte que tu reserva en <strong>Canchas Sintéticas La Viña</strong> ha sido confirmada. A continuación los detalles:
                </p>

                <!-- Reservation Details Card -->
                <div style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🏟️ Cancha / Servicio</span>
                            </td>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${serviceName}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📅 Fecha</span>
                            </td>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${formattedDate}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🕐 Horario</span>
                            </td>
                            <td style="padding:10px 0;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${startTime} - ${endTime}</span>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Important Notice -->
                <div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                    <p style="color:#92400e;font-size:14px;font-weight:700;margin:0 0 6px;">
                        ⏰ Recordatorio Importante
                    </p>
                    <p style="color:#78350f;font-size:14px;line-height:1.5;margin:0;">
                        Te recomendamos llegar <strong>15 minutos antes</strong> de la hora reservada para realizar el proceso de ingreso y prepararte adecuadamente.
                    </p>
                </div>

                <!-- Contact Info -->
                <div style="text-align:center;margin-bottom:24px;">
                    <p style="color:#6b7280;font-size:14px;margin:0;">
                        ¿Tienes alguna pregunta? Contáctanos al <strong style="color:#111827;">+57 300 123 4567</strong>
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
                <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">
                    © 2024 La Viña Canchas Sintéticas. Todos los derechos reservados.
                </p>
                <p style="color:#9ca3af;font-size:12px;margin:0;">
                    Este es un correo automático, por favor no respondas directamente.
                </p>
            </div>
        </div>
    </body>
    </html>`;

    try {
        const senderEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
        const { data, error } = await resend.emails.send({
            from: `La Viña Canchas Sintéticas <${senderEmail}>`,
            to,
            subject: '✅ Reserva Confirmada - La Viña',
            html: htmlContent
        });
        if (error) {
            console.error('Error enviando email de confirmación (Resend):', error);
            return { success: false, error: error.message || error };
        }
        console.log('Email de confirmación enviado:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Error enviando email de confirmación:', error);
        return { success: false, error: error.message };
    }
};

const sendProgramacionEmail = async (params) => {
    const { to, torneoName, fechaDate, horaTorneo, partidos } = params;

    // Format partidos
    let partidosHTML = '';
    partidos.forEach(p => {
        partidosHTML += `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:16px;">
            <p style="margin:0 0 12px 0;font-size:16px;color:#15803d;font-weight:bold;text-align:center;">⌚ ${p.hora || 'Por definir'}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="text-align:center;">
                <tr>
                    <td width="42%" style="padding:16px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
                        <span style="display:block;font-size:12px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${p.grupo_local_nombre || 'Local'}</span>
                        <span style="display:block;font-size:20px;font-weight:bold;color:#111827;">${p.equipo_local_nombre}</span>
                    </td>
                    <td width="16%" style="font-size:20px;font-weight:900;color:#9ca3af;">VS</td>
                    <td width="42%" style="padding:16px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
                        <span style="display:block;font-size:12px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${p.grupo_vis_nombre || 'Visitante'}</span>
                        <span style="display:block;font-size:20px;font-weight:bold;color:#111827;">${p.equipo_vis_nombre}</span>
                    </td>
                </tr>
            </table>
        </div>`;
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#16a34a,#059669);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
                <p style="color:#a7f3d0;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px 0;font-weight:bold;">Torneo</p>
                <h1 style="color:#ffffff;margin:0;font-size:28px;">${torneoName}</h1>
            </div>

            <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;">
                <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px dashed #e5e7eb;">
                    <h2 style="color:#111827;margin:0 0 16px 0;font-size:24px;">${fechaDate}</h2>
                    <div style="display:inline-block;background:#f0fdf4;color:#15803d;padding:8px 16px;border-radius:999px;font-weight:bold;font-size:14px;">
                        ? JORNADA INICIA A LAS: ${horaTorneo || 'Por definir'}
                    </div>
                </div>

                ${partidosHTML}

                <div style="margin-top:32px;padding:20px;background:#fef3c7;border-left:4px solid #f59e0b;border-radius:4px;">
                    <p style="margin:0;color:#92400e;font-size:15px;line-height:1.6;font-weight:500;">
                        ⚠️ <strong>Recomendación importante:</strong> Les pedimos amablemente a todos los equipos llegar temprano a las instalaciones para asegurar que cada partido comience exactamente a la hora programada y evitar retrasos en la jornada.
                    </p>
                </div>
            </div>
            <div style="text-align:center;padding:24px;color:#6b7280;font-size:13px;">
                © La Viña Canchas Sintéticas - Torneos
            </div>
        </div>
    </body>
    </html>`;

    // Send to each recipient individually
    const senderEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const recipients = to.split(',').map(email => email.trim()).filter(email => email);
    let successCount = 0;
    let lastError = null;

    for (const recipient of recipients) {
        try {
            console.log('Sending programacion email to:', recipient);
            const { data, error } = await resend.emails.send({
                from: `La Viña Torneos <${senderEmail}>`,
                to: recipient,
                subject: 'Programación de Fecha - Torneo La Viña',
                html: htmlContent
            });
            if (error) {
                console.error('Error enviando Programación a', recipient, '(Resend):', error);
                lastError = error.message || error;
            } else {
                successCount++;
            }
        } catch (error) {
            console.error('Error enviando Programación a', recipient, ':', error);
            lastError = error.message;
        }
    }

    if (successCount > 0) {
        return { success: true, messageId: `Enviado a ${successCount} de ${recipients.length} destinatarios` };
    } else {
        return { success: false, error: lastError || 'No se pudo enviar a ningún destinatario' };
    }
};

const sendResultadosEmail = async (params) => {
    const { to, torneoName, fechaDate, horaTorneo, partidos } = params;

    // Format partidos for Resultados
    let partidosHTML = '';
    partidos.forEach(p => {
        partidosHTML += `
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:16px;">
            <p style="margin:0 0 12px 0;font-size:16px;color:#15803d;font-weight:bold;text-align:center;">⌚ ${p.hora || 'Por definir'}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="text-align:center;">
                <tr>
                    <td width="42%" style="padding:16px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
                        <span style="display:block;font-size:12px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${p.grupo_local_nombre || 'Local'}</span>
                        <span style="display:block;font-size:20px;font-weight:bold;color:#111827;">${p.equipo_local_nombre}</span>
                        <span style="display:block;font-size:16px;font-weight:bold;color:#15803d;margin-top:8px;">Goles: ${p.goles_local || 0}</span>
                        <span style="display:block;font-size:14px;color:#6b7280;margin-top:4px;">Puntos: ${p.puntos_local || 0}</span>
                    </td>
                    <td width="16%" style="font-size:20px;font-weight:900;color:#9ca3af;">VS</td>
                    <td width="42%" style="padding:16px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
                        <span style="display:block;font-size:12px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">${p.grupo_vis_nombre || 'Visitante'}</span>
                        <span style="display:block;font-size:20px;font-weight:bold;color:#111827;">${p.equipo_vis_nombre}</span>
                        <span style="display:block;font-size:16px;font-weight:bold;color:#15803d;margin-top:8px;">Goles: ${p.goles_vis || 0}</span>
                        <span style="display:block;font-size:14px;color:#6b7280;margin-top:4px;">Puntos: ${p.puntos_vis || 0}</span>
                    </td>
                </tr>
            </table>
        </div>`;
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#16a34a,#059669);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
                <p style="color:#a7f3d0;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px 0;font-weight:bold;">Torneo</p>
                <h1 style="color:#ffffff;margin:0;font-size:28px;">${torneoName}</h1>
            </div>

            <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;">
                <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px dashed #e5e7eb;">
                    <p style="color:#6b7280;font-size:14px;text-transform:uppercase;letter-spacing:1px;margin:0 0 4px 0;font-weight:bold;">Fecha jugada:</p>
                    <h2 style="color:#111827;margin:0 0 16px 0;font-size:24px;">${fechaDate}</h2>
                    <div style="display:inline-block;background:#f0fdf4;color:#15803d;padding:8px 16px;border-radius:999px;font-weight:bold;font-size:14px;">
                        ? JORNADA INICIÓ A LAS: ${horaTorneo || 'Por definir'}
                    </div>
                </div>

                ${partidosHTML}

                <div style="margin-top:32px;padding:20px;background:#f0fdf4;border-left:4px solid #16a34a;border-radius:4px;text-align:center;">
                    <p style="margin:0;color:#15803d;font-size:15px;line-height:1.6;font-weight:bold;">
                        🙏 ¡Gracias por la participación en la jornada!
                    </p>
                </div>
            </div>
            <div style="text-align:center;padding:24px;color:#6b7280;font-size:13px;">
                © La Viña Canchas Sintéticas - Torneos
            </div>
        </div>
    </body>
    </html>`;

    // Send to each recipient individually
    const senderEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
    const recipients = to.split(',').map(email => email.trim()).filter(email => email);
    let successCount = 0;
    let lastError = null;

    for (const recipient of recipients) {
        try {
            console.log('Sending resultados email to:', recipient);
            const { data, error } = await resend.emails.send({
                from: `La Viña Torneos <${senderEmail}>`,
                to: recipient,
                subject: 'Resultados de Fecha - Torneo La Viña',
                html: htmlContent
            });
            if (error) {
                console.error('Error enviando Resultados a', recipient, '(Resend):', error);
                lastError = error.message || error;
            } else {
                successCount++;
            }
        } catch (error) {
            console.error('Error enviando Resultados a', recipient, ':', error);
            lastError = error.message;
        }
    }

    if (successCount > 0) {
        return { success: true, messageId: `Enviado a ${successCount} de ${recipients.length} destinatarios` };
    } else {
        return { success: false, error: lastError || 'No se pudo enviar a ningún destinatario' };
    }
};

const sendAdminNotificationEmail = async ({ to, clientName, clientEmail, clientPhone, serviceName, date, startTime, endTime }) => {
    const formattedDate = formatEmailDate(date);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#16a34a,#059669);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                    ⚽ La Viña
                </h1>
                <p style="color:#bbf7d0;margin:8px 0 0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">
                    Nueva Reserva
                </p>
            </div>

            <!-- Body -->
            <div style="background:#ffffff;padding:32px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                <p style="color:#374151;font-size:16px;line-height:1.6;margin-bottom:24px;">
                    Hola Administrador,
                </p>
                <p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:24px;">
                    Se ha creado una nueva reserva en el sistema que requiere tu atención. Por favor revisa y confirma la reserva en el panel administrativo.
                </p>

                <!-- Reservation Details Card -->
                <div style="background:linear-gradient(135deg,#f0fdf4,#ecfdf5);border:1px solid #bbf7d0;border-radius:12px;padding:24px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">👤 Cliente</span>
                            </td>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${clientName}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📧 Correo</span>
                            </td>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${clientEmail || '-'}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📱 Celular</span>
                            </td>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${clientPhone || '-'}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🏟️ Cancha / Servicio</span>
                            </td>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${serviceName}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📅 Fecha</span>
                            </td>
                            <td style="padding:10px 0;border-bottom:1px solid #d1fae5;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${formattedDate}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🕐 Horario</span>
                            </td>
                            <td style="padding:10px 0;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${startTime} - ${endTime}</span>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Action Required -->
                <div style="background:#fffbeb;border:1px solid #fde68a;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                    <p style="color:#92400e;font-size:14px;font-weight:700;margin:0 0 6px;">
                        ⚡ Acción Requerida
                    </p>
                    <p style="color:#78350f;font-size:14px;line-height:1.5;margin:0;">
                        Esta reserva está pendiente de confirmación. Ingresa al sistema para aprobarla o rechazarla.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
                <p style="color:#6b7280;font-size:13px;margin:0;">
                    Sistema de Gestión de Reservas - La Viña Canchas Sintéticas
                </p>
            </div>
        </div>
    </body>
    </html>`;

    try {
        const senderEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
        const recipients = to.split(',').map(email => email.trim()).filter(email => email);
        const { data, error } = await resend.emails.send({
            from: `${clientName} (vía La Viña) <${senderEmail}>`,
            reply_to: clientEmail,
            to: recipients,
            subject: '🔔 Nueva Reserva Pendiente por Confirmar',
            html: htmlContent
        });
        if (error) {
            console.error('Error enviando email a administradores (Resend):', error);
            return { success: false, error: error.message || error };
        }
        console.log('Email a administradores enviado:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Error enviando email a administradores:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Envía correo de cancelación de reserva al cliente.
 */
const sendCancellationEmail = async ({ to, fromEmail, clientName, serviceName, date, startTime, endTime }) => {
    const formattedDate = formatEmailDate(date);

    const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#fff5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
            <!-- Header -->
            <div style="background:linear-gradient(135deg,#e53e3e,#c53030);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
                <h1 style="color:#ffffff;margin:0;font-size:28px;font-weight:800;letter-spacing:-0.5px;">
                    ⚽ La Viña
                </h1>
                <p style="color:#fed7d7;margin:8px 0 0;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:2px;">
                    Canchas Sintéticas
                </p>
            </div>

            <!-- Body -->
            <div style="background:#ffffff;padding:32px 24px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb;">
                <!-- Rejection Badge -->
                <div style="text-align:center;margin-bottom:24px;">
                    <div style="display:inline-block;background:#fff5f5;border:2px solid #fed7d7;border-radius:50%;width:64px;height:64px;line-height:64px;font-size:32px;">
                        ❌
                    </div>
                    <h2 style="color:#9b2c2c;margin:16px 0 4px;font-size:22px;font-weight:800;">
                        Reserva Cancelada o Rechazada
                    </h2>
                    <p style="color:#6b7280;margin:0;font-size:14px;">
                        Lo sentimos, tu reserva ha sido cancelada o denegada por la administración.
                    </p>
                </div>

                <!-- Greeting -->
                <p style="color:#374151;font-size:16px;line-height:1.6;margin-bottom:24px;">
                    Hola <strong style="color:#111827;">${clientName}</strong>,
                </p>
                <p style="color:#374151;font-size:15px;line-height:1.6;margin-bottom:24px;">
                    Te informamos que tu solicitud de reserva en <strong>Canchas Sintéticas La Viña</strong> ha sido cancelada o no pudo ser confirmada. A continuación los detalles de la reserva:
                </p>

                <!-- Reservation Details Card -->
                <div style="background:linear-gradient(135deg,#fff5f5,#fff5f5);border:1px solid #fed7d7;border-radius:12px;padding:24px;margin-bottom:24px;">
                    <table style="width:100%;border-collapse:collapse;">
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #fee2e2;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🏟️ Cancha / Servicio</span>
                            </td>
                            <td style="padding:10px 0;border-bottom:1px solid #fee2e2;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${serviceName}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;border-bottom:1px solid #fee2e2;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">📅 Fecha</span>
                            </td>
                            <td style="padding:10px 0;border-bottom:1px solid #fee2e2;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${formattedDate}</span>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:10px 0;">
                                <span style="color:#6b7280;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">🕐 Horario</span>
                            </td>
                            <td style="padding:10px 0;text-align:right;">
                                <span style="color:#111827;font-size:15px;font-weight:700;">${startTime} - ${endTime}</span>
                            </td>
                        </tr>
                    </table>
                </div>

                <!-- Contact Info -->
                <div style="text-align:center;margin-bottom:24px;background:#fffaf0;border:1px solid #feebc8;border-left:4px solid #dd6b20;border-radius:8px;padding:16px 20px;">
                    <p style="color:#7b341e;font-size:14px;line-height:1.5;margin:0;">
                        Si crees que esto es un error o deseas reprogramar, por favor contáctanos al WhatsApp o llámanos directamente para validar la disponibilidad de otros horarios.
                    </p>
                </div>
            </div>

            <!-- Footer -->
            <div style="background:#f9fafb;border:1px solid #e5e7eb;border-top:0;border-radius:0 0 16px 16px;padding:24px;text-align:center;">
                <p style="color:#6b7280;font-size:13px;margin:0 0 8px;">
                    © 2024 La Viña Canchas Sintéticas. Todos los derechos reservados.
                </p>
            </div>
        </div>
    </body>
    </html>`;

    try {
        const senderEmail = process.env.RESEND_FROM || 'onboarding@resend.dev';
        const { data, error } = await resend.emails.send({
            from: `La Viña Canchas Sintéticas <${senderEmail}>`,
            to,
            subject: '❌ Reserva Cancelada - La Viña',
            html: htmlContent
        });
        if (error) {
            console.error('Error enviando email de cancelación (Resend):', error);
            return { success: false, error: error.message || error };
        }
        console.log('Email de cancelación enviado:', data.id);
        return { success: true, messageId: data.id };
    } catch (error) {
        console.error('Error enviando email de cancelación:', error);
        return { success: false, error: error.message };
    }
};

module.exports = { sendConfirmationEmail, sendProgramacionEmail, sendResultadosEmail, sendAdminNotificationEmail, sendCancellationEmail };