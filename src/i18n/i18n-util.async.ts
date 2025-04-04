// This file was auto-generated by 'typesafe-i18n'. Any manual changes will be overwritten.
/* eslint-disable */

import { initFormatters } from './formatters'
import type { Locales, Translations } from './i18n-types'
import { loadedFormatters, loadedLocales, locales } from './i18n-util'

const localeTranslationLoaders = {
	de: () => import('./de'),
	en: () => import('./en'),
	es: () => import('./es'),
	fr: () => import('./fr'),
	hi: () => import('./hi'),
	it: () => import('./it'),
	ja: () => import('./ja'),
	ko: () => import('./ko'),
	nl: () => import('./nl'),
	pl: () => import('./pl'),
	pt: () => import('./pt'),
	ru: () => import('./ru'),
	sv: () => import('./sv'),
	tr: () => import('./tr'),
	tw: () => import('./tw'),
	vi: () => import('./vi'),
	zh: () => import('./zh'),
}

const updateDictionary = (locale: Locales, dictionary: Partial<Translations>): Translations =>
	loadedLocales[locale] = { ...loadedLocales[locale], ...dictionary }

export const importLocaleAsync = async (locale: Locales): Promise<Translations> =>
	(await localeTranslationLoaders[locale]()).default as unknown as Translations

export const loadLocaleAsync = async (locale: Locales): Promise<void> => {
	updateDictionary(locale, await importLocaleAsync(locale))
	loadFormatters(locale)
}

export const loadAllLocalesAsync = (): Promise<void[]> => Promise.all(locales.map(loadLocaleAsync))

export const loadFormatters = (locale: Locales): void =>
	void (loadedFormatters[locale] = initFormatters(locale))
