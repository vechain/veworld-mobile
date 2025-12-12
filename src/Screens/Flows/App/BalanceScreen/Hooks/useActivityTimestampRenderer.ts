import moment from "moment"
import { useCallback, useMemo } from "react"
import { useI18nContext } from "~i18n"
import { DateUtils, StringUtils } from "~Utils"

export const useActivityTimestampRenderer = () => {
    const { LL, locale: _locale } = useI18nContext()
    const locale = useMemo(() => DateUtils.getMomentLocale(_locale), [_locale])
    return useCallback(
        (timestamp: number) => {
            const ts = moment(timestamp)
            if (ts.isSame(moment(), "day")) return ts.locale(locale).format(`HH:mm - [${LL.TODAY()}]`)
            if (ts.isSame(moment().subtract(1, "day"), "day"))
                return ts.locale(locale).format(`HH:mm - [${LL.YESTERDAY()}]`)
            if (moment().diff(ts, "year") >= 1)
                return StringUtils.toTitleCase(
                    ts.locale(locale).format(`HH:mm - [${DateUtils.formatDate(ts, locale, { includeYear: true })}]`),
                )
            return StringUtils.toTitleCase(ts.locale(locale).format(`HH:mm - [${DateUtils.formatDate(ts, locale)}]`))
        },
        [LL, locale],
    )
}
