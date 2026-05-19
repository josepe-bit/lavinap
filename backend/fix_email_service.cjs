const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'src', 'services', 'emailService.js');
let content = fs.readFileSync(filePath, 'utf8');

// Fix sendProgramacionEmail
const spTarget = `return transporter.sendMail({
        from: \`"La Viña Torneos" <\${process.env.EMAIL_USER || 'lavinacanchas@gmail.com'}>\`,
        to, subject: 'Programación de Fecha - Torneo La Viña', html: htmlContent
    });`;
const spNew = `try {
        const info = await transporter.sendMail({
            from: \`"La Viña Torneos" <\${process.env.EMAIL_USER || 'lavinacanchas@gmail.com'}>\`,
            to, subject: 'Programación de Fecha - Torneo La Viña', html: htmlContent
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando Programación:', error);
        return { success: false, error: error.message };
    }`;
content = content.replace(spTarget, spNew);
content = content.replace(spTarget.replace(/\n/g, '\r\n'), spNew.replace(/\n/g, '\r\n'));

// Fix sendResultadosEmail
const srTarget = `return transporter.sendMail({
        from: \`"La Viña Torneos" <\${process.env.EMAIL_USER || 'lavinacanchas@gmail.com'}>\`,
        to, subject: 'Resultados de Fecha - Torneo La Viña', html: htmlContent
    });`;
const srNew = `try {
        const info = await transporter.sendMail({
            from: \`"La Viña Torneos" <\${process.env.EMAIL_USER || 'lavinacanchas@gmail.com'}>\`,
            to, subject: 'Resultados de Fecha - Torneo La Viña', html: htmlContent
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error enviando Resultados:', error);
        return { success: false, error: error.message };
    }`;
content = content.replace(srTarget, srNew);
content = content.replace(srTarget.replace(/\n/g, '\r\n'), srNew.replace(/\n/g, '\r\n'));

fs.writeFileSync(filePath, content, 'utf8');
console.log("emailService.js fixed.");
