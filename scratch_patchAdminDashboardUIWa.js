const fs = require('fs');

async function main() {
    let code = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');

    const originalEnviarText = `    const enviarProgramacionFecha = async (id) => {
        if (!window.confirm('¿Enviar la programación de esta fecha por correo a los delegados? Asegúrese de que los equipos tengan delegados asignados con correos correctos.')) return;
        try {
            const res = await axios.post(\`\${API_URL}/admin/fecxtorneo/\${id}/programacion\`, {}, { headers: getAuthHeaders() });
            alert(res.data.message || 'Programación enviada con éxito.');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al enviar programación');
        }
    };`;

    const newEnviarText = `    const enviarProgramacionFecha = async (id) => {
        if (!window.confirm('¿Enviar la programación de esta fecha por correo y preparar los mensajes de WhatsApp?')) return;
        try {
            const res = await axios.post(\`\${API_URL}/admin/fecxtorneo/\${id}/programacion\`, {}, { headers: getAuthHeaders() });
            
            // Check for Whatsapp data
            if (res.data.whatsappText && res.data.whatsappNumbers && res.data.whatsappNumbers.length > 0) {
                const textEncoded = encodeURIComponent(res.data.whatsappText);
                res.data.whatsappNumbers.forEach(num => {
                    const cleanNum = num.replace(/\\D/g, '');
                    if (cleanNum) {
                        window.open(\`https://api.whatsapp.com/send?phone=\${cleanNum}&text=\${textEncoded}\`, '_blank');
                    }
                });
            }

            alert(res.data.message || 'Programación enviada con éxito.');
        } catch (error) {
            alert(error.response?.data?.message || 'Error al enviar programación');
        }
    };`;

    code = code.replace(originalEnviarText, newEnviarText);

    // Some regex fallback in case of exact match fails due to encoding
    if(code.indexOf('window.open(`https://api.whatsapp.com') === -1) {
        let regex = /const enviarProgramacionFecha = async \(id\) => \{([\s\S]*?)\};/m;
        code = code.replace(regex, newEnviarText.replace('const enviarProgramacionFecha = async (id) => {', '').replace(/};$/, ''));
    }

    fs.writeFileSync('frontend/src/pages/AdminDashboard.jsx', code);
    console.log("Updated AdminDashboard.jsx");
}
main();
