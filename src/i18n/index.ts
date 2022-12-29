import TypesafeI18n from './i18n-react'
import {loadLocale, loadAllLocales, loadFormatters} from './i18n-util.sync'

export {
    loadLocale as loadLocale_sync,
    loadAllLocales as loadAllLocales_sync,
    loadFormatters as loadFormatters_sync,
}
export {TypesafeI18n}

export * from './i18n-types'
export * from './i18n-util'
export * from './formatters'
export * from './i18n-util.async'
export * from './i18n-react'
