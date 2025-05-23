import type { FormattersInitializer } from 'typesafe-i18n'
import type { Locales, Formatters } from './i18n-types'
import moment from 'moment'
import 'moment/locale/de'
import 'moment/locale/es'
import 'moment/locale/fr'
import 'moment/locale/hi'
import 'moment/locale/it'
import 'moment/locale/ja'
import 'moment/locale/ko'
import 'moment/locale/nl'
import 'moment/locale/pl'
import 'moment/locale/pt'
import 'moment/locale/ru'
import 'moment/locale/sv'
import 'moment/locale/tr'
import 'moment/locale/vi'
import 'moment/locale/zh-cn'
import 'moment/locale/zh-tw'

moment.relativeTimeThreshold('ss', -1)

const mapLocale = (locale: Locales) => {
		switch (locale) {
			case 'tw': return 'zh-tw'
			case 'zh': return 'zh-cn'
			case 'de': return 'de'
			case 'en': return 'en'
			case 'es': return 'es'
			case 'fr': return 'fr'
			case 'hi': return 'hi'
			case 'it': return 'it'
			case 'ja': return 'ja'
			case 'ko': return 'ko'
			case 'nl': return 'nl'
			case 'pl': return 'pl'
			case 'pt': return 'pt'
			case 'ru': return 'ru'
			case 'sv': return 'sv'
			case 'tr': return 'tr'
			case 'vi': return 'vi'
			default: return 'en'
		}
	}

export const initFormatters: FormattersInitializer<Locales, Formatters> = (locale: Locales) => {

	

	const mappedLocale = mapLocale(locale)

	const formatters: Formatters = {
		toSecondsDuration: (value: any) => moment.duration(value, 'seconds').locale(mappedLocale).humanize()
	}

	return formatters
}
