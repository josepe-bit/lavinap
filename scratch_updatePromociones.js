const fs = require('fs');

async function main() {
    let code = fs.readFileSync('backend/src/controllers/adminController.js', 'utf8');

    // Update getPromociones
    code = code.replace(
        "exports.getPromociones = async (req, res) => {\\n    try {",
        "exports.getPromociones = async (req, res) => {\\n    try {\\n        const [paramRows] = await pool.query('SELECT meta_juegos_promocion FROM Parametros LIMIT 1');\\n        const metaValue = paramRows.length > 0 ? (paramRows[0].meta_juegos_promocion || 10) : 10;"
    );

    code = code.replace(
        /juegos_acumulados: Math\.min\(row\.juegos_acumulados, 10\)/g,
        "juegos_acumulados: Math.min(row.juegos_acumulados, metaValue)"
    );

    code = code.replace(
        /canClaim: row\.juegos_acumulados >= 10/g,
        "canClaim: row.juegos_acumulados >= metaValue"
    );

    // Update canjearPromocion
    code = code.replace(
        "exports.canjearPromocion = async (req, res) => {\\n    const { id_cliente, tipo_cancha } = req.body;",
        "exports.canjearPromocion = async (req, res) => {\\n    const { id_cliente, tipo_cancha } = req.body;\\n    const [paramRows] = await pool.query('SELECT meta_juegos_promocion FROM Parametros LIMIT 1');\\n    const metaValue = paramRows.length > 0 ? (paramRows[0].meta_juegos_promocion || 10) : 10;"
    );

    code = code.replace("if (count[0].total < 10) {", "if (count[0].total < metaValue) {");
    code = code.replace("return res.status(400).json({ message: 'El cliente aún no ha acumulado 10 juegos' });", "return res.status(400).json({ message: `El cliente aún no ha acumulado ${metaValue} juegos` });");

    // Update updateParametros - first part (destructure from req.body)
    code = code.replace(
        "celular_establecimiento, numero_nequi } = req.body;",
        "celular_establecimiento, numero_nequi, meta_juegos_promocion } = req.body;"
    );

    // Update updateParametros - second part (SQL query)
    code = code.replace(
        "                numero_nequi = ?\\n            WHERE id = 1",
        "                numero_nequi = ?,\\n                meta_juegos_promocion = ?\\n            WHERE id = 1"
    );

    // Update updateParametros - third part (values array)
    code = code.replace(
        "            numero_nequi || ''\\n        ]);",
        "            numero_nequi || '',\\n            meta_juegos_promocion || 10\\n        ]);"
    );

    fs.writeFileSync('backend/src/controllers/adminController.js', code);
    console.log("Updated adminController.js");
}
main();
