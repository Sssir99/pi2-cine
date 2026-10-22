// Middleware reutilizable: valida que req.params.id tenga formato de ObjectId de MongoDB.
// Si no lo tiene, responde 400 (evita que Mongoose lance CastError y termine en 500).
// Usarlo en TODAS las rutas que reciben :id (GET/:id, PUT/:id, DELETE/:id).
const mongoose = require('mongoose');

const validarId = (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.isValidObjectId(id)) {
    return res.status(400).json({ error: `El id '${id}' no tiene formato válido de ObjectId` });
  }

  next();
};

module.exports = validarId;
