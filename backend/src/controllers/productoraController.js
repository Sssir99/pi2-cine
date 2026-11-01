const Productora = require('../models/Productora');

const listar = async (req, res, next) => {
    try {
        const productoras = await Productora.find();
        res.json(productoras);
    } catch (error) {
        next(error);
    }
};

const obtener = async (req, res, next) => {
    try {
        const productora = await Productora.findById(req.params.id);
        if (!productora) {
            return res.status(404).json({ error: 'Productora no encontrada' });
        }
        res.json(productora);
    } catch (error) {
        next(error);
    }
};

const crear = async (req, res, next) => {
    try {
        const productora = new Productora(req.body);
        await productora.save();
        res.status(201).json(productora);
    } catch (error) {
        next(error);
    }
};

const actualizar = async (req, res, next) => {
    try {
        const productora = await Productora.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!productora) {
            return res.status(404).json({ error: 'Productora no encontrada' });
        }
        res.json(productora);
    } catch (error) {
        next(error);
    }
};

const eliminar = async (req, res, next) => {
    try {
        const productora = await Productora.findByIdAndDelete(req.params.id);
        if (!productora) {
            return res.status(404).json({ error: 'Productora no encontrada' });
        }
        res.json({ "mensaje": "Productora eliminada correctamente" });
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