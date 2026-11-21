// Tema guardado, aplicado antes de pintar el HTML: si espera a React, quien eligió el tema
// claro ve un parpadeo oscuro al cargar. Va como archivo suelto (y no dentro de index.html)
// para que la política de seguridad del servidor no necesite permitir scripts en línea.
try {
  const tema = localStorage.getItem('tema') === 'claro' ? 'claro' : 'oscuro'
  document.documentElement.dataset.tema = tema
  document.documentElement.setAttribute('data-bs-theme', tema === 'claro' ? 'light' : 'dark')
} catch {
  // Sin localStorage (modo privado raro): se queda el tema por defecto.
}
