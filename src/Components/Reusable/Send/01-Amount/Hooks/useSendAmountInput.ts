import { useAmountInput } from "~Hooks"
import { useTokenSendContext } from "../../Provider"
import { useCallback, useMemo, useState } from "react"
import { FungibleToken, FungibleTokenWithBalance } from "~Model"
import { BigNutils } from "~Utils"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { ethers } from "ethers"

type Args = {
    token: FungibleTokenWithBalance | undefined
    isInputInFiat: boolean
}

const MAX_FIAT_DECIMALS = 2

/**
 * Symbols where the max precision is 5 digits and not their decimals
 */
const LOW_PRECISION_SYMBOLS = ["BTC", "ETH", "SOL", "USDC", "USDT", "WAN", "XRP"]

const getMaxDecimals = (args: { kind: "fiat" } | { kind: "token"; token: FungibleToken | undefined }) => {
    if (args.kind === "fiat") return MAX_FIAT_DECIMALS
    if (LOW_PRECISION_SYMBOLS.includes(args.token?.symbol ?? "")) return 5
    return args.token?.decimals ?? 18
}

export const truncateToMaxDecimals = (value: string, opts: Parameters<typeof getMaxDecimals>[0]) => {
    const parts = value.split(/([.,])/)
    if (parts.length >= 3) {
        const integerPart = parts[0]
        const separator = parts[1]
        const decimalPart = parts[2]
        const maxDecimals = getMaxDecimals(opts)
        return `${integerPart}${separator}${decimalPart.substring(0, maxDecimals)}`
    }
    return value
}

export const useSendAmountInput = ({ token, isInputInFiat }: Args) => {
    const { flowState } = useTokenSendContext()
    const { removeInvalidCharacters } = useAmountInput(
        (flowState?.amountInFiat ? flowState.fiatAmount : flowState.amount) ?? "",
    )
    const currency = useAppSelector(selectCurrency)
    const { data: exchangeRate } = useExchangeRate({
        id: token ? getCoinGeckoIdBySymbol[token?.symbol] ?? token.symbol : undefined,
        vs_currency: currency,
    })

    const [fiatAmount, setFiatAmount] = useState(() => {
        if (flowState.amountInFiat)
            return ethers.utils.parseUnits(flowState.fiatAmount ?? "0", token?.decimals ?? 18).toString()
        return BigNutils()
            .toCurrencyConversion(
                ethers.utils.parseUnits(flowState.amount ?? "0", token?.decimals ?? 18).toString(),
                exchangeRate ?? 0,
                undefined,
                token?.decimals ?? 18,
            )
            .self.toBigInt.toString()
    })
    const [tokenAmount, setTokenAmount] = useState(() => {
        if (!flowState.amountInFiat)
            return ethers.utils.parseUnits(flowState.amount ?? "0", token?.decimals ?? 18).toString()
        return BigNutils()
            .toTokenConversion(
                ethers.utils.parseUnits(flowState.fiatAmount ?? "0", token?.decimals ?? 18).toString(),
                exchangeRate ?? undefined,
                undefined,
            )
            .toBigInt.toString()
    })
    const [input, setInput] = useState(
        truncateToMaxDecimals(
            (flowState.amountInFiat ? flowState.fiatAmount : flowState.amount) ?? "0",
            flowState.amountInFiat ? { kind: "fiat" } : { kind: "token", token },
        ),
    )

    const tokenTotalBalance = useMemo(() => {
        return BigNutils(token?.balance.balance ?? "0").toString
    }, [token?.balance.balance])

    const hasValidDecimalPlaces = useCallback(
        (value: string): boolean => {
            const parts = value.split(/[.,]/)
            if (parts.length > 1) {
                const decimalPart = parts[1]
                const maxDecimals = getMaxDecimals(isInputInFiat ? { kind: "fiat" } : { kind: "token", token })
                return decimalPart.length <= maxDecimals
            }
            return true
        },
        [isInputInFiat, token],
    )

    const onDigit = useCallback(
        (args: { type: "add"; digit: string } | { type: "delete" }) => {
            if (!token) return

            let newValue = removeInvalidCharacters(args.type === "add" ? input + args.digit : input.slice(0, -1))

            if (!hasValidDecimalPlaces(newValue)) {
                return
            }

            const parsableInput = newValue.endsWith(",") || newValue.endsWith(".") ? `${newValue}0` : newValue

            setInput(newValue)

            if (isInputInFiat) {
                setFiatAmount(ethers.utils.parseUnits(parsableInput || "0", token?.decimals ?? 18).toString())
                setTokenAmount(
                    BigNutils()
                        .toTokenConversion(
                            ethers.utils.parseUnits(parsableInput || "0", token?.decimals ?? 18).toString(),
                            exchangeRate ?? undefined,
                        )
                        .toBigInt.toString(),
                )
            } else {
                setTokenAmount(ethers.utils.parseUnits(parsableInput || "0", token?.decimals ?? 18).toString())
                setFiatAmount(
                    BigNutils()
                        .toCurrencyConversion(
                            ethers.utils.parseUnits(parsableInput || "0", token?.decimals ?? 18).toString(),
                            exchangeRate ?? 0,
                            undefined,
                            token?.decimals ?? 18,
                        )
                        .self.toBigInt.toString(),
                )
            }
        },
        [exchangeRate, hasValidDecimalPlaces, input, isInputInFiat, removeInvalidCharacters, token],
    )

    const onMax = useCallback(() => {
        setTokenAmount(tokenTotalBalance)
        const newFiatValue = BigNutils()
            .toCurrencyConversion(tokenTotalBalance.toString(), exchangeRate ?? 0, undefined, token?.decimals ?? 18)
            .self.toBigInt.toString()
        setFiatAmount(newFiatValue)

        if (isInputInFiat) setInput(ethers.utils.formatUnits(newFiatValue, token?.decimals ?? 18))
        else setInput(ethers.utils.formatUnits(tokenTotalBalance, token?.decimals ?? 18))
    }, [exchangeRate, isInputInFiat, token?.decimals, tokenTotalBalance])

    const onReset = useCallback(() => {
        setFiatAmount("0")
        setTokenAmount("0")
        setInput("0")
    }, [])

    const isBalanceExceeded = useMemo(
        () => BigNutils(tokenAmount).isBiggerThan(tokenTotalBalance),
        [tokenAmount, tokenTotalBalance],
    )

    return useMemo(
        () => ({
            tokenAmount,
            fiatAmount,
            onChange: onDigit,
            onMax,
            isBalanceExceeded,
            onReset,
            input,
        }),
        [fiatAmount, input, isBalanceExceeded, onDigit, onMax, onReset, tokenAmount],
    )
}
