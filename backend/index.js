const dotenv = require('dotenv');
dotenv.config({ path: require('path').join(__dirname, '.env') });
//paketler
const express = require('express'); //server kurmak
const axios = require('axios'); //API çağrısı yapmak
const cors = require('cors'); //frontend bağlantı izni
const app = express();
app.use(cors());
const PORT = process.env.PORT || 3001;
 
// World Bank API
async function fetchWorldBank(indicator, startYear = 2003, endYear = 2026) {
    const url = `https://api.worldbank.org/v2/country/TR/indicator/${indicator}?format=json&per_page=100&mrv=30&date=${startYear}:${endYear}`;
    const response = await axios.get(url); //internetten veriyi çeken asıl satır
    return response.data;
}

// Enflasyon endpoint (TÜFE yıllık)
app.get('/api/inflation', async (req, res) => { //frontend buraya istek atıyor
    try {
        const data = await fetchWorldBank('FP.CPI.TOTL.ZG');
 
        if (!data || !data[1]) {
            return res.status(502).json({ success: false, error: 'World Bank veri döndürmedi.' });
        }
 
        const items = data[1]
            .filter(item => item.value !== null)
            .map(item => ({
                date: item.date,
                value: parseFloat(item.value.toFixed(2))
            }))
            .sort((a, b) => a.date - b.date);
 
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('/api/inflation hatası:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});
 
// Döviz kuru endpoint (USD/TL yıllık ortalama)
app.get('/api/exchange', async (req, res) => {
    try {
        const data = await fetchWorldBank('PA.NUS.FCRF');
 
        if (!data || !data[1]) {
            return res.status(502).json({ success: false, error: 'World Bank veri döndürmedi.' });
        }
 
        const items = data[1]
            .filter(item => item.value !== null)
            .map(item => ({
                date: item.date,
                value: parseFloat(item.value.toFixed(4))
            }))
            .sort((a, b) => a.date - b.date);
 
        res.json({ success: true, data: items });
    } catch (error) {
        console.error('/api/exchange hatası:', error.message);
        res.status(500).json({ success: false, error: error.message });
    }
});
 
app.listen(PORT, () => {
    console.log(`Backend çalışıyor: http://localhost:${PORT}`);
});
 