import { SharedValue, useDerivedValue } from "react-native-reanimated"
import {
    useLineChart,
    useLineChartPrice as useRNWagmiChartLineChartPrice,
    useLineChartDatetime as useRNWagmiChartLineChartDatetime,
} from "react-native-wagmi-charts"
import { LocaleUtils } from "~Common"
import {
    numberToLocaleStringWorklet,
    numberToPercentWorklet,
} from "~Common/Utils/Reanimated"
import { selectCurrency, useAppSelector } from "~Storage/Redux"

import "intl"
import "intl/locale-data/jsonp/en"

export type ValueAndFormatted<U = number, V = string> = {
    value: Readonly<SharedValue<U>>
    formatted: Readonly<SharedValue<V>>
}

/**
 * Wrapper around react-native-wagmi-chart#useLineChartPrice
 * @returns latest price when not scrubbing and active price when scrubbing
 */
export function useLineChartPrice(): ValueAndFormatted {
    const currency = useAppSelector(selectCurrency)
    let langTag = LocaleUtils.getLanguageTag()
    const { value: activeCursorPrice } = useRNWagmiChartLineChartPrice({
        // do not round
        precision: 18,
    })
    const { data } = useLineChart()

    const price = useDerivedValue(() => {
        if (activeCursorPrice.value) {
            // active price when scrubbing the chart
            return Number(activeCursorPrice.value)
        }

        return data[data.length - 1]?.value ?? 0
    })

    const priceFormatted = useDerivedValue(() => {
        return numberToLocaleStringWorklet(price.value, langTag, {
            style: "currency",
            currency,
        })
    })

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
export function useLineChartDatetime(): DateFormatted {
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

        return "Overall"
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

    const relativeChange = useDerivedValue(() => {
        if (!isActive.value && Boolean(spotRelativeChange)) {
            // break early when chart is not active (scrubbing) and spot relative
            // change is available
            // this should only happen for the daily HistoryDuration where calculating
            // relative change from historical data leads to data inconsistencies in
            // the ui
            return spotRelativeChange?.value ?? 0
        }

        // when scrubbing, compute relative change from open price
        const openPrice = data[0]?.value

        // scrubbing: close price is active price
        // not scrubbing: close price is period end price
        const closePrice = isActive.value
            ? data[currentIndex.value]?.value
            : data[data.length - 1]?.value

        if (
            openPrice === undefined ||
            closePrice === undefined ||
            openPrice === 0
        ) {
            return 0
        }

        const change = ((closePrice - openPrice) / openPrice) * 100

        return change
    })

    const relativeChangeFormatted = useDerivedValue(() => {
        return numberToPercentWorklet(relativeChange.value, {
            precision: 2,
            absolute: true,
        })
    })

    return { value: relativeChange, formatted: relativeChangeFormatted }
}
