// global.d.ts
// Отключаем строгую типизацию роутов для гибкости

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string = string> extends Record<string, any> {}
  }
}
