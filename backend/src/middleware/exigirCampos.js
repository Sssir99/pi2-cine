// Middleware: exige que el cuerpo traiga los campos obligatorios de la ruta.
//
// `findByIdAndUpdate` con runValidators solo valida los campos que vienen en el update: los
// obligatorios que faltan no se revisan nunca, así que un PUT con `{}` respondía 200 y solo
// cambiaba la fecha de actualización. Con esto responde 400, como el contrato y como el POST.

const exigirCampos = (campos) => (req, res, next) => {
  const faltan = campos.filter((campo) => {
    const valor = req.body ? req.body[campo] : undefined;
    return valor === undefined || valor === null || String(valor).trim() === '';
  });

  if (faltan.length > 0) {
    return res.status(400).json({
      error: `Faltan campos obligatorios: ${faltan.join(', ')}`
    });
  }

  next();
};

module.exports = exigirCampos;
