const fs = require('fs');

async function main() {
    let emailCode = fs.readFileSync('backend/src/services/emailService.js', 'utf8');

    const newSendProgramacionEmail = `const sendProgramacionEmail = async (params) => {
    const { to, torneoName, fechaDate, horaTorneo, partidos } = params;
    
    // Format partidos
    let partidosHTML = '';
    partidos.forEach(p => {
        partidosHTML += \`
        <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:24px;margin-bottom:16px;">
            <p style="margin:0 0 12px 0;font-size:16px;color:#15803d;font-weight:bold;text-align:center;">⌚ \${p.hora || 'Por definir'}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="text-align:center;">
                <tr>
                    <td width="42%" style="padding:16px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
                        <span style="display:block;font-size:12px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">\${p.grupo_local_nombre || 'Local'}</span>
                        <span style="display:block;font-size:20px;font-weight:bold;color:#111827;">\${p.equipo_local_nombre}</span>
                    </td>
                    <td width="16%" style="font-size:20px;font-weight:900;color:#9ca3af;">VS</td>
                    <td width="42%" style="padding:16px;background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
                        <span style="display:block;font-size:12px;color:#6b7280;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px;">\${p.grupo_vis_nombre || 'Visitante'}</span>
                        <span style="display:block;font-size:20px;font-weight:bold;color:#111827;">\${p.equipo_vis_nombre}</span>
                    </td>
                </tr>
            </table>
        </div>\`;
    });

    const htmlContent = \`
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"></head>
    <body style="margin:0;padding:0;background-color:#f0fdf4;font-family:'Segoe UI',sans-serif;">
        <div style="max-width:600px;margin:0 auto;padding:20px;">
            <div style="background:linear-gradient(135deg,#16a34a,#059669);border-radius:16px 16px 0 0;padding:32px 24px;text-align:center;">
                <p style="color:#a7f3d0;font-size:14px;text-transform:uppercase;letter-spacing:2px;margin:0 0 8px 0;font-weight:bold;">Torneo</p>
                <h1 style="color:#ffffff;margin:0;font-size:28px;">\${torneoName}</h1>
            </div>
            
            <div style="background:#ffffff;padding:32px 24px;border:1px solid #e5e7eb;">
                <div style="text-align:center;margin-bottom:32px;padding-bottom:24px;border-bottom:2px dashed #e5e7eb;">
                    <h2 style="color:#111827;margin:0 0 16px 0;font-size:24px;">\${fechaDate}</h2>
                    <div style="display:inline-block;background:#f0fdf4;color:#15803d;padding:8px 16px;border-radius:999px;font-weight:bold;font-size:14px;">
                        ? JORNADA INICIA A LAS: \${horaTorneo || 'Por definir'}
                    </div>
                </div>

                \${partidosHTML}
                
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
    </html>\`;
    
    // Si to es un string se envia normal, si es un arreglo iteramos o mandamos multiple
    return transporter.sendMail({
        from: \`"La Viña Torneos" <\${process.env.EMAIL_USER || 'lavinacanchas@gmail.com'}>\`,
        to, subject: 'Programación de Fecha - Torneo La Viña', html: htmlContent
    });
};\`;`;

    // Replace the old sendProgramacionEmail completely
    emailCode = emailCode.replace(
        /const sendProgramacionEmail = async \(params\) => \{\s*return sendTorneoEmail\(\{ \.\.\.params, subject: 'Programación de Fecha - Torneo La Viña', title: 'Programación de la Fecha', isResultados: false \}\);\s*\};/,
        newSendProgramacionEmail
    );
    // There were encoding issues last time so let's use the explicit string form in latin1 if needed, or UTF8 since it's just a file write.
    // Wait, the regex had an issue matching the exact exact string. I'll replace it directly using string methods:
    
    let regex = /const sendProgramacionEmail = async \(params\) => \{([\s\S]*?)\};/m;
    emailCode = emailCode.replace(regex, newSendProgramacionEmail);
    fs.writeFileSync('backend/src/services/emailService.js', emailCode);
    console.log('Updated emailService.js');
}
main();
