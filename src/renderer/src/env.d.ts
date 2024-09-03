/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>
  export default component
}

import type { Table, UserOptions } from 'jspdf-autotable'

declare module 'jspdf' {
  interface jsPDF {
    lastAutoTable: Table
    autoTable: (options: UserOptions) => void
  }
}