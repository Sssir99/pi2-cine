// Controlador de Media.
// Manejo de errores: los casos conocidos (400/404/409) se resuelven aquí o en el
// middleware central (errorHandler); todo lo demás se pasa con next(error).
const Media = require('../models/Media');
const Genero = require('../models/Genero');
const Director = require('../models/Director');
const Productora = require('../models/Productora');
const Tipo = require('../models/Tipo');

// Regla del caso: no se guarda una película con referencias inexistentes o inactivas.
// Devuelve el mensaje de error, o null si todo está bien.
const validarReferencias = async (datos) => {
  // Un campo que no viene se responde como faltante, no como inexistente: el mensaje de
  // "no existe o está inactivo" mandaba a revisar la relación cuando el problema era otro.
  if (!datos.genero) return 'El género es obligatorio';
  if (!datos.director) return 'El director es obligatorio';
  if (!datos.productora) return 'La productora es obligatoria';
  if (!datos.tipo) return 'El tipo es obligatorio';

  const genero = await Genero.findById(datos.genero);
  if (!genero || genero.estado !== 'activo') {
    return 'El género no existe o está inactivo';
  }

  const director = await Director.findById(datos.director);
  if (!director || director.estado !== 'activo') {
    return 'El director no existe o está inactivo';
  }


  const productora = await Productora.findById(datos.productora);
  if (!productora || productora.estado !== 'activo') {
    return 'La productora no existe o está inactiva';
  }

  const tipo = await Tipo.findById(datos.tipo);
  if (!tipo) {
    return 'El tipo no existe';
  }

  return null;
};

// GET /api/media  -> lista todas las películas y series, de la más reciente a la más antigua
const listar = async (req, res, next) => {
  try {
    // _id como segundo criterio: dos títulos creados en el mismo segundo salían en orden
    // distinto en cada petición sin él.
    const media = await Media.find().sort({ fechaCreacion: -1, _id: -1 });
    res.json(media);
  } catch (error) {
    next(error);
  }
};

// GET /api/media/:id  -> una película o serie por id
const obtener = async (req, res, next) => {
  try {
    const media = await Media.findById(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }
    res.json(media);
  } catch (error) {
    next(error);
  }
};

// POST /api/media  -> crea una película o serie (201)
// Si el serial o la url ya existen, el índice único lanza E11000 y errorHandler responde 409.
const crear = async (req, res, next) => {
  try {
    const errorReferencias = await validarReferencias(req.body);
    if (errorReferencias) {
      return res.status(400).json({ error: errorReferencias });
    }
    const media = new Media(req.body);
    await media.save();
    res.status(201).json(media);
  } catch (error) {
    next(error);
  }
};

// PUT /api/media/:id  -> actualiza una película o serie completa
// runValidators: true fuerza las validaciones del esquema en el update.
const actualizar = async (req, res, next) => {
  try {
    // Primero se comprueba que el título exista: si no existe es 404, aunque el cuerpo
    // venga incompleto. Al revés, un PUT a un id inexistente respondía 400 "el género no
    // existe", que manda a revisar el campo equivocado.
    const existe = await Media.exists({ _id: req.params.id });
    if (!existe) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }

    const errorReferencias = await validarReferencias(req.body);
    if (errorReferencias) {
      return res.status(400).json({ error: errorReferencias });
    }
    const media = await Media.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!media) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }
    res.json(media);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/media/:id  -> elimina una película o serie
const eliminar = async (req, res, next) => {
  try {
    const media = await Media.findByIdAndDelete(req.params.id);
    if (!media) {
      return res.status(404).json({ error: 'Media no encontrado' });
    }
    res.json({ mensaje: 'Media eliminado correctamente' });
  } catch (error) {
    next(error);
  }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };
