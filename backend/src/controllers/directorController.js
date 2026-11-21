const Director= require('../models/Director');
const Media = require('../models/Media');

const listar = async (req, res, next) => {
  try {
    const directores = await Director.find();
    res.json(directores);
  } catch (error) {
    next(error);
  }
};

const obtener = async (req, res, next) => {
  try {
    const director = await Director.findById(req.params.id);
    if (!director) {
      return res.status(404).json({ error: 'Director no encontrado' });
    }
    res.json(director);
  } catch (error) {
    next(error);
  }
}
;
const crear = async (req, res, next) => {
  try {
    const director = new Director(req.body);
    await director.save();
    res.status(201).json(director);
  } catch (error) {
    next(error);
  }
};

const actualizar = async (req, res, next) => {
  try {
    const director = await Director.findByIdAndUpdate(req.params.id, req.body
, {
      new: true,
        runValidators: true
    });
    if (!director) {
      return res.status(404).json({ error: 'Director no encontrado' });
    }
    res.json(director);
  } catch (error) {
    next(error);
  }
};

const eliminar = async (req, res, next) => {
  try {
    // Integridad referencial: no se borra un director que ya dirige algún título.
    const enUso = await Media.countDocuments({ director: req.params.id });
    if (enUso > 0) {
      return res.status(409).json({
        error: `No se puede eliminar el director: lo usan ${enUso} título${enUso === 1 ? '' : 's'} del catálogo`
      });
    }

    const director = await Director.findByIdAndDelete(req.params.id);
    if (!director) {
      return res.status(404).json({ error: 'Director no encontrado' });
    }
    res.json({ "mensaje": "Director eliminado correctamente" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  listar,
  obtener,
  crear,
  actualizar,
  eliminar
};