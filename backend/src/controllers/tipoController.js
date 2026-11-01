const Tipo = require('../models/Tipo');

const listar = async (req, res, next) => {
  try {
    res.json(await Tipo.find());
  } catch (error) { next(error); }
};

const obtener = async (req, res, next) => {
  try {
    const tipo = await Tipo.findById(req.params.id);
    if (!tipo) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json(tipo);
  } catch (error) { next(error); }
};

const crear = async (req, res, next) => {
  try {
    const tipo = new Tipo(req.body);
    await tipo.save();
    res.status(201).json(tipo);
  } catch (error) { next(error); }
};

const actualizar = async (req, res, next) => {
  try {
    const tipo = await Tipo.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!tipo) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json(tipo);
  } catch (error) { next(error); }
};

const eliminar = async (req, res, next) => {
  try {
    const tipo = await Tipo.findByIdAndDelete(req.params.id);
    if (!tipo) return res.status(404).json({ error: 'Tipo no encontrado' });
    res.json({ mensaje: 'Tipo eliminado correctamente' });
  } catch (error) { next(error); }
};

module.exports = { listar, obtener, crear, actualizar, eliminar };