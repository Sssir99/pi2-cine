// Encabezado de página: título, línea de contexto (contador) y acción primaria.
export default function EncabezadoPagina({ titulo, subtitulo, accion }) {
  return (
    <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
      <div>
        <h1>{titulo}</h1>
        {subtitulo ? <div className="sub">{subtitulo}</div> : null}
      </div>
      {accion}
    </div>
  )
}
