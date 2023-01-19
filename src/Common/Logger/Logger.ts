// import { ENV } from "../Enums"

// const envStr = (process.env.REACT_APP_ENV && process.env.REACT_APP_ENV in ENV
//     ? process.env.REACT_APP_ENV
//     : ENV.PROD.valueOf()) as unknown as ENV

// const environment = ENV[envStr]

// export const trace = (() => {
//     if (environment === ENV.PROD) {
//         return () => ({})
//     }
//     return (...args: unknown[]) => {
//         console.trace(...args)
//     }
// })()

// export const debug = (() => {
//     if (environment === ENV.PROD) {
//         return () => ({})
//     }
//     return (...args: unknown[]) => {
//         console.debug(...args)
//     }
// })()

// export const log = (() => {
//     if (environment === ENV.PROD) {
//         return () => ({})
//     }
//     return (...args: unknown[]) => {
//         console.log(...args)
//     }
// })()

// export const info = (() => {
//     if (environment === ENV.PROD) {
//         return () => ({})
//     }
//     return (...args: unknown[]) => {
//         console.info(...args)
//     }
// })()

// export const warn = (...args: unknown[]) => console.warn(...args)

// export const error = (...args: unknown[]) => console.error(...args)
