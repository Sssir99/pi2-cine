// Modelo Tipo: clasificación de la producción (película o serie). No lleva estado.
// fechaCreacion y fechaActualizacion se generan automáticamente (timestamps de Mongoose).
const mongoose = require('mongoose');

const tipoSchema = new mongoose.Schema(
  {
    nombre: {
      type: String,
      required: [true, 'El nombre del tipo es obligatorio'],
      unique: true,
      trim: true
    },
    descripcion: {
      type: String
    }
  },
  {
    timestamps: { createdAt: 'fechaCreacion', updatedAt: 'fechaActualizacion' }
  }
);

module.exports = mongoose.model('Tipo', tipoSchema);
