require('dotenv').config();
require('./config/dns');

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
})();
