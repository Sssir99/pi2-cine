// Manejador central de errores de Express (se registra SIEMPRE al final en app.js).
// Convierte errores conocidos de Mongoose en códigos HTTP correctos, para que ningún
// módulo tenga que manejar estos casos a mano:
//
// - E11000 (clave duplicada)        -> 409 Conflicto
// - ValidationError (validación)    -> 400 Bad Request
// - CastError (ObjectId malformado) -> 400 Bad Request (respaldo; normalmente lo frena validarId)
// - cualquier otro                  -> 500 Error interno

const errorHandler = (err, req, res, next) => {
  // Clave única duplicada (nombre, serial, url...)
  if (err.code === 11000) {
    const campo = Object.keys(err.keyValue || {})[0] || 'campo';
    return res.status(409).json({ error: `Ya existe un registro con ese valor en '${campo}'` });
  }

  // Validación de Mongoose (required, enum, min/max, match...)
  if (err.name === 'ValidationError') {
    const mensajes = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: mensajes.join('. ') });
  }

  // ObjectId malformado (respaldo por si una ruta olvida validarId)
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Valor '${err.value}' no tiene formato válido de ObjectId` });
  }

  // Error no controlado
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
};

module.exports = errorHandler;
