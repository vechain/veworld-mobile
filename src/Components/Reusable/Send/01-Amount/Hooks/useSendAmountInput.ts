import { useAmountInput } from "~Hooks"
import { useTokenSendContext } from "../../Provider"
import { useCallback, useMemo, useState } from "react"
import { FungibleTokenWithBalance } from "~Model"
import { BigNutils } from "~Utils"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { ethers } from "ethers"
import { useFiatAmount } from "./useFiatAmount"
import { useTokenAmount } from "./useTokenAmount"
import HapticsService from "~Services/HapticsService"

type Args = {
    token: FungibleTokenWithBalance
    isInputInFiat: boolean
}

const MAX_FIAT_DECIMALS = 2

const getMaxDecimals = (args: { kind: "fiat" } | { kind: "token"; decimals: number }) => {
    if (args.kind === "fiat") return MAX_FIAT_DECIMALS
    return args.decimals
}

const fillWithZeros = (value: string, maxDecimals: number) => {
    return value.padEnd(maxDecimals, "0")
}

export const truncateToMaxDecimals = (
    value: string,
    opts: Parameters<typeof getMaxDecimals>[0] & { fillWithZeros?: boolean; removeTrailingZeros?: boolean },
) => {
    const parts = value.split(/([.,])/)
    if (parts.length >= 3) {
        const integerPart = parts[0]
        const separator = parts[1]
        const decimalPart = parts[2]
        const maxDecimals = getMaxDecimals(opts)

        const decimalValue = decimalPart.substring(0, maxDecimals)

        if (opts.removeTrailingZeros && BigNutils(decimalValue).isZero) {
            return integerPart
        }

        return `${integerPart}${separator}${
            decimalValue.length < maxDecimals && opts.fillWithZeros
                ? fillWithZeros(decimalValue, maxDecimals)
                : decimalValue
        }`
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
        id: getCoinGeckoIdBySymbol[token.symbol] ?? token.symbol,
        vs_currency: currency,
    })

    const tokenTotalBalance = useMemo(() => {
        return BigNutils(token.balance.balance).toString
    }, [token?.balance.balance])

    const [fiatAmount, setFiatAmount] = useFiatAmount({ token, exchangeRate })
    const [tokenAmount, setTokenAmount] = useTokenAmount({ token, exchangeRate })
    const [input, setInput] = useState(
        truncateToMaxDecimals(
            (flowState.amountInFiat ? flowState.fiatAmount : flowState.amount) ?? "0",
            flowState.amountInFiat
                ? { kind: "fiat", removeTrailingZeros: true }
                : { kind: "token", decimals: token.decimals, removeTrailingZeros: true },
        ),
    )

    const hasValidDecimalPlaces = useCallback(
        (value: string): boolean => {
            const parts = value.split(/[.,]/)
            if (parts.length > 1) {
                const decimalPart = parts[1]
                const maxDecimals = getMaxDecimals(
                    isInputInFiat ? { kind: "fiat" } : { kind: "token", decimals: token.decimals },
                )
                return decimalPart.length <= maxDecimals
            }
            return true
        },
        [isInputInFiat, token.decimals],
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
                setFiatAmount(ethers.utils.parseUnits(parsableInput || "0", token.decimals).toString())
                setTokenAmount(
                    BigNutils()
                        .toTokenConversion(
                            ethers.utils.parseUnits(parsableInput || "0", token.decimals).toString(),
                            exchangeRate ?? undefined,
                        )
                        .toBigInt.toString(),
                )
            } else {
                setTokenAmount(ethers.utils.parseUnits(parsableInput || "0", token.decimals).toString())
                setFiatAmount(
                    BigNutils()
                        .toCurrencyConversion(
                            ethers.utils.parseUnits(parsableInput || "0", token.decimals).toString(),
                            exchangeRate ?? 0,
                            undefined,
                            token.decimals,
                        )
                        .self.toBigInt.toString(),
                )
            }
        },
        [
            exchangeRate,
            hasValidDecimalPlaces,
            input,
            isInputInFiat,
            removeInvalidCharacters,
            setFiatAmount,
            setTokenAmount,
            token,
        ],
    )

    const onFlip = useCallback(() => {
        //User flipped to token
        if (isInputInFiat)
            setInput(
                truncateToMaxDecimals(ethers.utils.formatUnits(tokenAmount, token.decimals), {
                    kind: "fiat",
                    removeTrailingZeros: true,
                }),
            )
        //User flipped to fiat
        else
            setInput(
                truncateToMaxDecimals(ethers.utils.formatUnits(fiatAmount, token.decimals), {
                    kind: "fiat",
                    removeTrailingZeros: true,
                }),
            )
    }, [fiatAmount, isInputInFiat, token.decimals, tokenAmount])

    const onMax = useCallback(() => {
        setTokenAmount(tokenTotalBalance)
        const newFiatValue = BigNutils()
            .toCurrencyConversion(tokenTotalBalance.toString(), exchangeRate ?? 0, undefined, token.decimals)
            .self.toBigInt.toString()
        setFiatAmount(newFiatValue)

        if (isInputInFiat) setInput(ethers.utils.formatUnits(newFiatValue, token.decimals))
        else setInput(ethers.utils.formatUnits(tokenTotalBalance, token.decimals))
    }, [exchangeRate, isInputInFiat, setFiatAmount, setTokenAmount, token.decimals, tokenTotalBalance])

    const onReset = useCallback(() => {
        setFiatAmount("0")
        setTokenAmount("0")
        setInput("0")
    }, [setFiatAmount, setTokenAmount])

    const onDeleteAll = useCallback(() => {
        HapticsService.triggerHaptics({ haptics: "Medium" })
        onReset()
    }, [onReset])

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
            onDeleteAll,
            input,
            onFlip,
        }),
        [tokenAmount, fiatAmount, onDigit, onMax, isBalanceExceeded, onReset, onDeleteAll, input, onFlip],
    )
}
