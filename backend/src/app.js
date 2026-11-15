const express = require('express');
const cors = require('cors');

const generoRoutes = require('./routes/generoRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const directorRoutes = require('./routes/directorRoutes');
const productoraRoutes = require('./routes/productoraRoutes');
const tipoRoutes = require('./routes/tipoRoutes');
const errorHandler = require('./middleware/errorHandler');


const app = express();

app.use(express.json());

// CORS: la app de React corre en otro puerto (Vite 5173 / CRA 3000), así que el navegador
// necesita permiso explícito. En desarrollo se permite cualquier origen; si algún día se
// publica, se restringe con cors({ origin: ['https://midominio.com'] }).
app.use(cors());

// Ruta de comprobación
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API de películas y series (PI2) en línea' });
});

// Rutas de la API (un módulo por archivo; agregar los demás aquí)
app.use('/api/generos', generoRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/directores', directorRoutes);
app.use('/api/productoras', productoraRoutes);

app.use('/api/tipos', tipoRoutes);

// Ruta /api que no existe: responder JSON (no el HTML por defecto de Express), para que
// el cliente y Postman reciban siempre el mismo formato: { error }.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `La ruta ${req.method} ${req.originalUrl} no existe` });
});

// Manejador central de errores (SIEMPRE al final)
app.use(errorHandler);

module.exports = app;
