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
    sellAmount?: number
    buyAmount?: number
}

export const useCoinifyPay = ({ target }: { target: "sell" | "buy" }) => {
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
        ({ cryptoCurrencies = "VET", fiatCurrencies = "EUR,USD", ...params }: GenerateOnRampUrlParams) => {
            const paymentTypes = generatePaymentTypes()
            const searchParams = objToQueryString({ fiatCurrencies, cryptoCurrencies, ...paymentTypes, ...params })
            return coinifyBaseUrl + `?partnerId=${process.env.REACT_APP_COINIFY_PARTNER_ID}&` + searchParams
        },
        [coinifyBaseUrl, generatePaymentTypes, objToQueryString],
    )

    const generateOffRampURL = useCallback(
        ({ cryptoCurrencies = "VET", fiatCurrencies = "EUR,USD", ...params }: GenerateOnRampUrlParams) => {
            const paymentTypes = generatePaymentTypes()
            const searchParams = objToQueryString({
                fiatCurrencies,
                cryptoCurrencies,
                ...paymentTypes,
                ...params,
                targetPage: "sell",
            })
            return coinifyBaseUrl + `?partnerId=${process.env.REACT_APP_COINIFY_PARTNER_ID}&` + searchParams
        },
        [coinifyBaseUrl, generatePaymentTypes, objToQueryString],
    )

    return {
        generateOnRampURL,
        generateOffRampURL,
    }
}
