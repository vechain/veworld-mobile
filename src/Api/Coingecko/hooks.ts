import { useQuery } from "@tanstack/react-query"
import {
    VETHOR_COINGECKO_ID,
    VET_COINGECKO_ID,
    getExchangeRate,
} from "./endpoints"

const getExchangeRateQueryKey = ({
    id,
    vs_currency,
}: {
    id?: string
    vs_currency: string
}) => ["EXCHANGE_RATE", id, vs_currency]
/**
 *  Get the exchange rate of a coin
 * @param id  the id of the coin
 * @param vs_currencies  the currencies to compare
 * @returns  the exchange rate
 */
export const useExchangeRate = ({
    id,
    vs_currency,
}: {
    id?: string
    vs_currency: string
}) => {
    return useQuery({
        queryKey: getExchangeRateQueryKey({ id, vs_currency }),
        queryFn: () => getExchangeRate({ coinGeckoId: id, vs_currency }),
        enabled: !!id,
    })
}

/**
 *  Get the exchange rate of VET
 * @param vs_currencies  the currencies to compare
 * @returns  the exchange rate
 */
export const useVetExchangeRate = (vs_currency: string) => {
    return useQuery({
        queryKey: getExchangeRateQueryKey({
            id: VET_COINGECKO_ID,
            vs_currency,
        }),
        queryFn: () =>
            getExchangeRate({ coinGeckoId: VET_COINGECKO_ID, vs_currency }),
    })
}

/**
 *  Get the exchange rate of VTHO
 * @param vs_currencies  the currencies to compare
 * @returns  the exchange rate
 */
export const useVthoExchangeRate = (vs_currency: string) => {
    return useQuery({
        queryKey: getExchangeRateQueryKey({
            id: VETHOR_COINGECKO_ID,
            vs_currency,
        }),
        queryFn: () =>
            getExchangeRate({ coinGeckoId: VETHOR_COINGECKO_ID, vs_currency }),
    })
}
