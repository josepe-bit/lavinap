const axios = require('axios');
require('dotenv').config();

/**
 * Envía un mensaje de texto a través de la API de Green API.
 * @param {string} to Número de teléfono del destinatario.
 * @param {string} text Contenido del mensaje de texto.
 */
const sendWhatsAppMessage = async (to, text) => {
    // Verificar si el envío de WhatsApp está habilitado en las configuraciones (.env)
    if (process.env.SEND_WHATSAPP !== 'true') {
        console.log('Envío de WhatsApp desactivado en la configuración (.env)');
        return { success: false, error: 'WhatsApp disabled in configuration' };
    }

    const instanceId = process.env.GREEN_API_ID;
    const apiToken = process.env.GREEN_API_TOKEN;

    if (!instanceId || !apiToken || instanceId.trim() === '' || apiToken.trim() === '') {
        console.warn('⚠️ ADVERTENCIA: GREEN_API_ID o GREEN_API_TOKEN no están configurados en el archivo .env. El envío de WhatsApp no funcionará.');
        return { success: false, error: 'Missing Green API credentials' };
    }

    try {
        // Limpiar el número eliminando todo lo que no sea dígito
        let phone = to.replace(/\D/g, '');
        if (!phone) {
            return { success: false, error: 'Invalid phone number' };
        }

        // Si tiene 10 dígitos (número típico de celular en Colombia), agregar el prefijo de país 57
        if (phone.length === 10) {
            phone = '57' + phone;
        }

        const chatId = `${phone}@c.us`;
        const url = `https://api.green-api.com/waInstance${instanceId.trim()}/sendMessage/${apiToken.trim()}`;

        console.log(`Intentando enviar mensaje de WhatsApp a: ${chatId}`);
        
        const response = await axios.post(url, {
            chatId: chatId,
            message: text
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000 // 10 segundos de timeout
        });

        console.log('Mensaje de WhatsApp enviado exitosamente. Message ID:', response.data.idMessage);
        return { success: true, messageId: response.data.idMessage };
    } catch (error) {
        console.error('Error enviando mensaje por WhatsApp a través de Green API:', error.response?.data || error.message);
        return { success: false, error: error.response?.data || error.message };
    }
};

module.exports = { sendWhatsAppMessage };
