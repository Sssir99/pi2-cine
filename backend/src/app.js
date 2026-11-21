const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const generoRoutes = require('./routes/generoRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const directorRoutes = require('./routes/directorRoutes');
const productoraRoutes = require('./routes/productoraRoutes');
const tipoRoutes = require('./routes/tipoRoutes');
const errorHandler = require('./middleware/errorHandler');


const app = express();

// En Render (y en cualquier PaaS) la app va detrás de un proxy: sin esto, req.ip y los
// protocolos que ve Express son los del proxy, no los del visitante.
app.set('trust proxy', 1);

// Cabeceras de seguridad. La política de contenido deja pasar el JS y el CSS del propio
// servidor, las portadas por https (el demo usa picsum) y los estilos en línea que
// SweetAlert pone al abrir un aviso. Nada más.
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      baseUri: ["'self'"],
      frameAncestors: ["'none'"],
      upgradeInsecureRequests: null
    }
  }
}));

// Límite explícito del cuerpo: por defecto son 100 kB y no hay razón para subirlo; dejarlo
// escrito evita sorpresas si alguien cambia la configuración de Express.
app.use(express.json({ limit: '100kb' }));

// El contrato dice que fechaCreacion y fechaActualizacion las pone el sistema y NO se aceptan
// en el body, y el _id sale siempre de la URL. Se limpian aquí una sola vez, para que ningún
// módulo tenga que repetirlo. Sin esto: un POST guardaba la fecha que mandara el cliente y un
// PUT con _id en el cuerpo terminaba en un 500 de Mongo ("immutable field").
app.use((req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    delete req.body._id;
    delete req.body.fechaCreacion;
    delete req.body.fechaActualizacion;
  }
  next();
});

// CORS: la app de React corre en otro puerto en desarrollo (Vite 5173), así que el navegador
// necesita permiso explícito. Si ORIGENES_PERMITIDOS trae una lista (separada por comas), solo
// esos orígenes pasan; si está vacía, se permite cualquiera (desarrollo y mismo origen).
const ORIGENES = (process.env.ORIGENES_PERMITIDOS || '')
  .split(',')
  .map((origen) => origen.trim())
  .filter(Boolean);
app.use(cors(ORIGENES.length > 0 ? { origin: ORIGENES } : {}));

// Ruta de comprobación
app.get('/api', (req, res) => {
  res.json({ mensaje: 'API de películas y series (PI2) en línea' });
});

// Salud del servicio: lo consulta Render para saber si el servicio está vivo y si la base
// responde. 503 si Mongo no está conectada, para que el despliegue no se marque en verde en falso.
app.get('/api/salud', (req, res) => {
  const conectada = mongoose.connection.readyState === 1;
  res.status(conectada ? 200 : 503).json({
    ok: conectada,
    base: conectada ? 'conectada' : 'sin conexion',
    hora: new Date().toISOString()
  });
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

// Panel compilado: si existe frontend/dist (lo crea `npm run build`), Express sirve el
// frontend desde el mismo origen que la API. Así hay una sola URL, sin CORS y sin variable
// de entorno en el cliente. En desarrollo no existe y todo sigue yendo contra Vite.
const RUTA_DIST = path.join(__dirname, '..', '..', 'frontend', 'dist');
if (fs.existsSync(RUTA_DIST)) {
  // Los assets llevan hash en el nombre: se pueden cachear fuerte. El index.html, no.
  app.use('/assets', express.static(path.join(RUTA_DIST, 'assets'), { maxAge: '1y', immutable: true }));
  app.use(express.static(RUTA_DIST, { index: false }));

  // Fallback de la SPA: cualquier GET que no sea de la API devuelve index.html y React Router
  // decide qué pantalla toca. Sin esto, entrar directo a /generos daría 404.
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(RUTA_DIST, 'index.html'));
  });
}

// Manejador central de errores (SIEMPRE al final)
app.use(errorHandler);

module.exports = app;
