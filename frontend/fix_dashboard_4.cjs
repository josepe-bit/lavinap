const fs = require('fs');
let c = fs.readFileSync('src/pages/AdminDashboard.jsx', 'utf8');

c = c.replace(/const \[promociones, setPromociones\] = useState\(\[\]\);/, `const [promociones, setPromociones] = useState([]);
    const [metaPromos, setMetaPromos] = useState(10);`);

fs.writeFileSync('src/pages/AdminDashboard.jsx', c);
console.log('Replaced successfully');
