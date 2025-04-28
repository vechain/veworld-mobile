import type { FormattersInitializer } from 'typesafe-i18n'
import type { Locales, Formatters } from './i18n-types'
import moment from 'moment'

moment.relativeTimeThreshold('ss', 0)

export const initFormatters: FormattersInitializer<Locales, Formatters> = (locale: Locales) => {

	const formatters: Formatters = {
		toSecondsDuration: (value: any) => moment.duration(value, 'seconds').locale(locale).humanize()
	}

	return formatters
}
