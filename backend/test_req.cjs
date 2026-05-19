const axios = require('axios');

async function test() {
    try {
        // Find a valid fec_torneo_id
        const res = await axios.post('http://localhost:3000/admin/fecxtorneo/1/programacion');
        console.log("Success:", res.data);
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}
test();
