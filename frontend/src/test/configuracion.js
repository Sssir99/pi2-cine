// Configuración común de Vitest: añade los matchers de jest-dom (toBeInTheDocument…)
// y limpia el DOM entre pruebas.
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
