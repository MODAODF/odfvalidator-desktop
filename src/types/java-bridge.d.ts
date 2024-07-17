declare module 'java-bridge' {
  export function appendClasspath(path: string): void
  export function importClass(className: string): Promise<any>
  export function lock(): Promise<void>
  export function unlock(): Promise<void>
}
