const express = require('express');
const cors = require('cors');
const weatherRoutes = require('./routes/weatherRoutes');

const app = express();
const PORT = 5000;

app.use(cors());

app.get('/', (req, res) => {
    res.send('Welcome to Torcik!');
});

app.use('/api/weather', weatherRoutes);

app.listen(PORT, () => {
    console.log(`Serwer działa na porcie ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});