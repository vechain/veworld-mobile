import { useCallback } from "react"

type CryptoCurrency = "VET" | "VTHO"
type FiatCurrency = "USD" | "EUR"

type GenerateOnRampUrlParams = {
    primaryColor: string
    address: string
    defaultFiatCurrency: FiatCurrency
    defaultCryptoCurrency: CryptoCurrency
    cryptoCurrencies?: string
    fiatCurrencies?: string
    amount?: number
}

type GenerateTradeHistoryUrlParams = Pick<GenerateOnRampUrlParams, "primaryColor">

export const useCoinifyPay = ({ target }: { target: "sell" | "buy" | "trade-history" }) => {
    const coinifyBaseUrl = __DEV__ ? process.env.REACT_APP_COINIFY_DEV_URL : process.env.REACT_APP_COINIFY_PROD_URL

    const generatePaymentTypes = useCallback(() => {
        if (target === "buy") return { transferInMedia: "card,bank", transferOut: "blockchain" }
        else return { transferInMedia: "blockchain", transferOut: "bank" }
    }, [target])

    const objToQueryString = useCallback((params: Record<string, string | number | undefined>) => {
        return Object.keys(params)
            .filter(key => !!key) // Remove undefined keys
            .map(
                key =>
                    `${encodeURIComponent(key)}=${encodeURIComponent(
                        String(params[key as keyof GenerateOnRampUrlParams]),
                    )}`,
            )
            .join("&")
    }, [])

    const generateOnRampURL = useCallback(
        ({ cryptoCurrencies = "VET", fiatCurrencies = "EUR,USD", amount, ...params }: GenerateOnRampUrlParams) => {
            const paymentTypes = generatePaymentTypes()
            const searchParams = objToQueryString({
                fiatCurrencies,
                cryptoCurrencies,
                ...paymentTypes,
                ...params,
                buyAmount: amount,
            })
            return coinifyBaseUrl + `?partnerId=${process.env.REACT_APP_COINIFY_PARTNER_ID}&` + searchParams
        },
        [coinifyBaseUrl, generatePaymentTypes, objToQueryString],
    )

    const generateOffRampURL = useCallback(
        ({ cryptoCurrencies = "VET", fiatCurrencies = "EUR,USD", amount, ...params }: GenerateOnRampUrlParams) => {
            const paymentTypes = generatePaymentTypes()
            const searchParams = objToQueryString({
                fiatCurrencies,
                cryptoCurrencies,
                ...paymentTypes,
                ...params,
                sellAmount: amount,
                targetPage: "sell",
            })
            return coinifyBaseUrl + `?partnerId=${process.env.REACT_APP_COINIFY_PARTNER_ID}&` + searchParams
        },
        [coinifyBaseUrl, generatePaymentTypes, objToQueryString],
    )

    const generateTradeHistoryURL = useCallback(
        ({ primaryColor }: GenerateTradeHistoryUrlParams) => {
            const searchParams = objToQueryString({
                primaryColor,
                targetPage: "trade-history",
            })
            return coinifyBaseUrl + `?partnerId=${process.env.REACT_APP_COINIFY_PARTNER_ID}&` + searchParams
        },
        [coinifyBaseUrl, objToQueryString],
    )

    return {
        generateOnRampURL,
        generateOffRampURL,
        generateTradeHistoryURL,
    }
}
