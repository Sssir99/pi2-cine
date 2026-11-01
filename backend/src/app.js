const express = require('express');

const generoRoutes = require('./routes/generoRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const directorRoutes = require('./routes/directorRoutes');
const productoraRoutes = require('./routes/productoraRoutes');

const app = express();

app.use(express.json());

// Ruta de comprobación
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API de películas y series (PI2) en línea' });
});

// Rutas de la API (un módulo por archivo; agregar los demás aquí)
app.use('/api/generos', generoRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/directores', directorRoutes);
app.use('/api/productoras', productoraRoutes);

// Manejador central de errores (SIEMPRE al final)
app.use(errorHandler);

module.exports = app;
