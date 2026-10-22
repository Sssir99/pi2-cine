// Controlador de Género — PLANTILLA DE REFERENCIA para los demás módulos.
// Cada módulo copia este archivo, cambia el modelo y los nombres de campo.
// Manejo de errores: los casos conocidos (400/404/409) se resuelven aquí o en el
// middleware central (errorHandler); todo lo demás se pasa con next(error).
const Genero = require('../models/Genero');

// GET /api/generos  -> lista todos los géneros
const listar = async (req, res, next) => {
  try {
    const generos = await Genero.find();
    res.json(generos);
  } catch (error) {
    next(error);
  }
};

// GET /api/generos/:id  -> un género por id
const obtener = async (req, res, next) => {
  try {
    const genero = await Genero.findById(req.params.id);
    if (!genero) {
      return res.status(404).json({ error: 'Género no encontrado' });
    }
    res.json(genero);
  } catch (error) {
    next(error);
  }
};

// POST /api/generos  -> crea un género (201)
// Si el nombre ya existe, el índice único lanza E11000 y errorHandler responde 409.
const crear = async (req, res, next) => {
  try {
    const genero = new Genero(req.body);
    await genero.save();
    res.status(201).json(genero);
  } catch (error) {
    next(error);
  }
};

// PUT /api/generos/:id  -> actualiza un género completo
// runValidators: true fuerza las validaciones del esquema en el update.
const actualizar = async (req, res, next) => {
  try {
    const genero = await Genero.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!genero) {
      return res.status(404).json({ error: 'Género no encontrado' });
    }
    res.json(genero);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/generos/:id  -> elimina un género
const eliminar = async (req, res, next) => {
  try {
    const genero = await Genero.findByIdAndDelete(req.params.id);
    if (!genero) {
      return res.status(404).json({ error: 'Género no encontrado' });
    }
    res.json({ mensaje: 'Género eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
