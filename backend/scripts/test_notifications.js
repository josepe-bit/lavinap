const mysql = require('mysql2/promise');
require('dotenv').config();
const { sendConfirmationEmail } = require('../src/services/emailService');
const { sendWhatsAppMessage } = require('../src/services/whatsappService');

async function test() {
    console.log('--- Iniciando Prueba de Notificaciones ---');
    console.log('Variables de entorno cargadas:');
    console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'CONFIGURADO' : 'NO CONFIGURADO');
    console.log('RESEND_FROM:', process.env.RESEND_FROM || 'onboarding@resend.dev (default)');
    console.log('GREEN_API_ID:', process.env.GREEN_API_ID ? 'CONFIGURADO' : 'NO CONFIGURADO');
    console.log('GREEN_API_TOKEN:', process.env.GREEN_API_TOKEN ? 'CONFIGURADO' : 'NO CONFIGURADO');

    // Conectar a la base de datos para obtener parámetros y el último cliente para probar
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306
    });

    let testEmail = 'josepabon8@gmail.com';
    let testPhone = '3016063151';
    let testClientName = 'José Omar Mayorga Pabón';

    try {
        const [params] = await connection.query('SELECT email_establecimiento, whatsapp_establecimiento FROM Parametros LIMIT 1');
        if (params.length > 0) {
            console.log('Configuración de la Base de Datos:');
            console.log('- Email establecimiento:', params[0].email_establecimiento);
            console.log('- WhatsApp establecimiento:', params[0].whatsapp_establecimiento);
            // Si estamos usando onboarding@resend.dev, solo podemos enviar a josepabon8@gmail.com
            // if (params[0].email_establecimiento) testEmail = params[0].email_establecimiento;
            if (params[0].whatsapp_establecimiento) testPhone = params[0].whatsapp_establecimiento;
        }
    } catch (dbErr) {
        console.error('Error al consultar Parametros de la BD:', dbErr.message);
    } finally {
        await connection.end();
    }

    console.log(`\nProbando envío de Correo a: ${testEmail}...`);
    try {
        const emailResult = await sendConfirmationEmail({
            to: testEmail,
            clientName: testClientName,
            serviceName: 'Cancha de Fútbol 5 Sintética',
            date: new Date().toISOString().split('T')[0],
            startTime: '19:00',
            endTime: '20:00'
        });
        console.log('Resultado envío Correo:', emailResult);
    } catch (emailErr) {
        console.error('Error al enviar correo en la prueba:', emailErr);
    }

    console.log(`\nProbando envío de WhatsApp a: ${testPhone}...`);
    try {
        const text = `⚽ *Prueba de Notificación - La Viña* 🏟️\n\n` +
                     `Hola *${testClientName}*,\n` +
                     `Esta es una prueba del canal de WhatsApp utilizando Green API y axios.`;
        const waResult = await sendWhatsAppMessage(testPhone, text);
        console.log('Resultado envío WhatsApp:', waResult);
    } catch (waErr) {
        console.error('Error al enviar WhatsApp en la prueba:', waErr);
    }

    console.log('\n--- Fin de la Prueba de Notificaciones ---');
}

test().catch(console.error);
