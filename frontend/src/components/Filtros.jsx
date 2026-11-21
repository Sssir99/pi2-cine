// Barra de filtros de una tabla. Tres piezas con el mismo marcado para que ninguna
// pantalla invente su propio buscador:
//
//   <Filtros>
//     <Buscador id="filtro-texto" valor={texto} onCambio={setTexto} etiqueta="Buscar" />
//     <Selector id="filtro-estado" valor={estado} onCambio={setEstado} etiqueta="Filtrar por estado">
//       <option value="">Todos los estados</option>
//       ...
//     </Selector>
//   </Filtros>
//
// La etiqueta va oculta: el placeholder y la primera opción ya dicen qué hace cada
// control, y así la barra no se llena de texto repetido.

export default function Filtros({ children }) {
  return <div className="filtros">{children}</div>
}

export function Buscador({ id, valor, onCambio, etiqueta, placeholder, corto = false }) {
  return (
    <>
      <label className="visually-hidden" htmlFor={id}>
        {etiqueta}
      </label>
      <input
        id={id}
        className={`campo${corto ? ' campo--corto' : ''}`}
        type="search"
        placeholder={placeholder || etiqueta}
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
      />
    </>
  )
}

export function Selector({ id, valor, onCambio, etiqueta, children }) {
  return (
    <>
      <label className="visually-hidden" htmlFor={id}>
        {etiqueta}
      </label>
      <select
        id={id}
        className="campo campo--corto"
        value={valor}
        onChange={(evento) => onCambio(evento.target.value)}
      >
        {children}
      </select>
    </>
  )
}
