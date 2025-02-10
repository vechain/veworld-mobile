import { SharedValue, useDerivedValue } from "react-native-reanimated"
import {
    useLineChart,
    useLineChartDatetime as useRNWagmiChartLineChartDatetime,
    useLineChartPrice as useRNWagmiChartLineChartPrice,
} from "react-native-wagmi-charts"
import { LocaleUtils, ReanimatedUtils } from "~Utils"

import "intl"
import "intl/locale-data/jsonp/en"
import { useFormatFiat } from "~Hooks/useFormatFiat"

export type ValueAndFormatted<U = number, V = string> = {
    value: Readonly<SharedValue<U>>
    formatted: Readonly<SharedValue<V>>
}

/**
 * Wrapper around react-native-wagmi-chart#useLineChartPrice
 * @returns latest price when not scrubbing and active price when scrubbing
 */
export function useLineChartPrice(): ValueAndFormatted {
    const { value: activeCursorPrice } = useRNWagmiChartLineChartPrice({
        // do not round
        precision: 18,
    })
    const { data } = useLineChart()
    const { formatFiat } = useFormatFiat({ maximumFractionDigits: 5, minimumFractionDigits: 5 })

    const price = useDerivedValue(() => {
        if (activeCursorPrice.value) {
            // active price when scrubbing the chart
            return Number(activeCursorPrice.value)
        }

        if (!data?.length) return 0

        return data[data.length - 1]?.value ?? 0
    }, [activeCursorPrice.value, data])

    const priceFormatted = useDerivedValue(() => formatFiat({ amount: price.value }), [formatFiat, price.value])

    return {
        value: price,
        formatted: priceFormatted,
    }
}

export type DateFormatted<V = string> = {
    formatted: Readonly<SharedValue<V>>
}

/**
 * Wrapper around react-native-wagmi-chart#useLineChartDatetime
 * @returns "Today" string when not scrubbing and active date when scrubbing
 */
export function useLineChartDatetime(fallback: string = ""): DateFormatted {
    let langTag = LocaleUtils.getLanguageTag()
    const { value: activeDateTime } = useRNWagmiChartLineChartDatetime()

    const date = useDerivedValue(() => {
        if (activeDateTime.value) {
            const toDate = new Date(parseInt(activeDateTime.value, 10))
            return toDate.toLocaleString(langTag, {
                weekday: "short",
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "numeric",
                minute: "numeric",
                hour12: false,
            })
        }

        return fallback
    })

    return {
        formatted: date,
    }
}

/**
 * @returns % change for the active history duration when not scrubbing and %
 *          change between active index and period start when scrubbing
 */
export function useLineChartRelativeChange({
    spotRelativeChange,
}: {
    spotRelativeChange?: SharedValue<number>
}): ValueAndFormatted {
    const { currentIndex, data, isActive } = useLineChart()

    const { formatLocale } = useFormatFiat()

    const relativeChange = useDerivedValue(() => {
        // when scrubbing, compute relative change from open price
        if (!data?.length) return 0

        const openPrice = data[0]?.value

        // scrubbing: close price is active price
        // not scrubbing: close price is period end price
        const closePrice = isActive.value ? data[currentIndex.value]?.value : data[data.length - 1]?.value

        if (openPrice === undefined || closePrice === undefined || openPrice === 0) {
            return 0
        }

        const change = ((closePrice - openPrice) / openPrice) * 100

        return change
    }, [currentIndex.value, data, isActive.value, spotRelativeChange?.value])

    const relativeChangeFormatted = useDerivedValue(() => {
        return ReanimatedUtils.numberToPercentWorklet(relativeChange.value, {
            precision: 2,
            absolute: true,
            locale: formatLocale,
        })
    }, [relativeChange.value, formatLocale])

    return { value: relativeChange, formatted: relativeChangeFormatted }
}
