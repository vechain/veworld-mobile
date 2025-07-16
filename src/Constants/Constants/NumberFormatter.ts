export const CachedNumberFormatter: Record<string, Intl.NumberFormat> = {}

export const getNumberFormatter = ({
    locale,
    precision,
    style,
    useGrouping,
}: {
    precision?: number
    locale?: Intl.LocalesArgument
    useGrouping?: boolean
    style?: keyof Intl.NumberFormatOptionsStyleRegistry
}) => {
    const _locale = locale ?? "en-US"
    const _precision = precision ?? 0
    const key = `${_locale}-${_precision}-${style}-${useGrouping}`

    if (CachedNumberFormatter[key]) {
        return CachedNumberFormatter[key]
    }

    return (CachedNumberFormatter[key] = new Intl.NumberFormat(_locale, {
        style,
        minimumFractionDigits: _precision,
        maximumFractionDigits: _precision,
        useGrouping,
    }))
}
