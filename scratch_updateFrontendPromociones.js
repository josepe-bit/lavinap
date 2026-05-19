const fs = require('fs');

async function main() {
    let code = fs.readFileSync('frontend/src/pages/AdminDashboard.jsx', 'utf8');

    // Add state for metaPromo
    code = code.replace(
        "const [promociones, setPromociones] = useState([]);",
        "const [promociones, setPromociones] = useState([]);\\n    const [metaPromos, setMetaPromos] = useState(10);"
    );

    // Update fetchPromociones
    code = code.replace(
        "setPromociones(res.data);",
        "setPromociones(res.data.data);\\n            if (res.data.meta) setMetaPromos(res.data.meta);"
    );

    // Replace rendering text
    code = code.replace(
        "<h2 className=\"text-xl font-bold text-gray-900\">Promoción: 10 Juegos = 1 Gratis</h2>",
        "<h2 className=\"text-xl font-bold text-gray-900\">Promoción: {metaPromos} Juegos = 1 Gratis</h2>"
    );
    code = code.replace(
        "Cada 10 juegos utilizados en la misma modalidad",
        "Cada {metaPromos} juegos utilizados en la misma modalidad"
    );
    code = code.replace(
        "10 juegos en cancha de Fútbol 8 → 1 juego gratis",
        "{metaPromos} juegos en cancha de Fútbol 8 → 1 juego gratis"
    );
    code = code.replace(
        "10 juegos en cualquier cancha de Fútbol 5",
        "{metaPromos} juegos en cualquier cancha de Fútbol 5"
    );

    // Progress bar inline style
    code = code.replace(
        "style={{ width: `${(promo.juegos_acumulados / 10) * 100}%` }}",
        "style={{ width: `${(promo.juegos_acumulados / metaPromos) * 100}%` }}"
    );

    // Progress bar inside text
    code = code.replace(
        "{promo.juegos_acumulados >= 3 ? `${promo.juegos_acumulados}/10` : ''}",
        "{promo.juegos_acumulados >= 3 ? `${promo.juegos_acumulados}/${metaPromos}` : ''}"
    );

    // Progress counter text
    code = code.replace(
        `<span className="text-xs text-gray-400 font-medium"> / 10</span>`,
        `<span className="text-xs text-gray-400 font-medium"> / {metaPromos}</span>`
    );

    fs.writeFileSync('frontend/src/pages/AdminDashboard.jsx', code);
    console.log("Updated AdminDashboard.jsx");
}
main();
