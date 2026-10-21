const express = require('express');

const app = express();

app.use(express.json());

// Ruta de comprobación
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API de películas y series (PI2) en línea' });
});

module.exports = app;
