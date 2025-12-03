import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseSpacer, BaseView, NumPad } from "~Components"
import { B3TR, CURRENCY_FORMATS, VET, VOT3, VTHO } from "~Constants"
import { getNumberFormatter } from "~Constants/Constants/NumberFormatter"
import { useAmountInput, useFormatFiat, useThemedStyles } from "~Hooks"
import { useSendableTokensWithBalance } from "~Hooks/useSendableTokensWithBalance"
import { useTokenWithCompleteInfo } from "~Hooks/useTokenWithCompleteInfo"
import { useNonVechainTokensBalance } from "~Hooks/useNonVechainTokensBalance"
import { useNonVechainTokenFiat } from "~Hooks/useNonVechainTokenFiat"
import HapticsService from "~Services/HapticsService"
import { selectCurrency, selectCurrencyFormat, useAppSelector } from "~Storage/Redux"
import { BigNutils, BalanceUtils } from "~Utils"
import { getDecimalSeparator } from "~Utils/BigNumberUtils/BigNumberUtils"
import { formatFullPrecision } from "~Utils/StandardizedFormatting"
import { FungibleTokenWithBalance } from "~Model"
import { TokenSelectionBottomSheet } from "./components/TokenSelectionBottomSheet"
import { SelectAmountSendDetails } from "./components/SelectAmountSendDetails"
import { useAmountConversion } from "./Hooks"

const MAX_FIAT_DECIMALS = 2
const MAX_TOKEN_DECIMALS = 5

type SelectAmountSendComponentProps = {
    token?: FungibleTokenWithBalance
    onNext: (amount: string, token: FungibleTokenWithBalance, fiatAmount?: string, amountInFiat?: boolean) => void
    onBindNextHandler?: (config: { handler: () => void; isValid: boolean; isError: boolean }) => void
}

export const SelectAmountSendComponent = ({ token, onNext, onBindNextHandler }: SelectAmountSendComponentProps) => {
    const { formatLocale } = useFormatFiat()

    const bottomSheetRef = useRef<BottomSheetModalMethods>(null)

    const currency = useAppSelector(selectCurrency)
    const currencyFormat = useAppSelector(selectCurrencyFormat)
    const availableTokens = useSendableTokensWithBalance()

    const vetInfo = useTokenWithCompleteInfo(VET)
    const vthoInfo = useTokenWithCompleteInfo(VTHO)
    const b3trInfo = useTokenWithCompleteInfo(B3TR)

    const { data: nonVechainTokensWithBalance } = useNonVechainTokensBalance()
    const { data: nonVechainTokensFiat } = useNonVechainTokenFiat()

    const defaultToken = useMemo(() => {
        if (token) return token

        const sendableTokens = availableTokens.filter(
            t => t.symbol !== VOT3.symbol && !BigNutils(t.balance.balance).isZero,
        )

        if (sendableTokens.length === 0) {
            const vetToken = availableTokens.find(t => t.symbol === VET.symbol)
            return vetToken || availableTokens[0]
        }

        const tokensWithFiatValue = sendableTokens.map(t => {
            let fiatValue = 0

            if (t.symbol === VET.symbol && vetInfo.exchangeRate) {
                const fiatStr = BalanceUtils.getFiatBalance(t.balance.balance, vetInfo.exchangeRate, t.decimals)
                fiatValue = Number.parseFloat(fiatStr.replaceAll(/[^0-9.]/g, "")) || 0
            } else if (t.symbol === VTHO.symbol && vthoInfo.exchangeRate) {
                const fiatStr = BalanceUtils.getFiatBalance(t.balance.balance, vthoInfo.exchangeRate, t.decimals)
                fiatValue = Number.parseFloat(fiatStr.replaceAll(/[^0-9.]/g, "")) || 0
            } else if (t.symbol === B3TR.symbol && b3trInfo.exchangeRate) {
                const fiatStr = BalanceUtils.getFiatBalance(t.balance.balance, b3trInfo.exchangeRate, t.decimals)
                fiatValue = Number.parseFloat(fiatStr.replaceAll(/[^0-9.]/g, "")) || 0
            } else if (nonVechainTokensWithBalance && nonVechainTokensFiat) {
                const tokenIndex = nonVechainTokensWithBalance.findIndex(nt => nt.address === t.address)
                if (tokenIndex >= 0 && tokenIndex < nonVechainTokensFiat.length) {
                    const fiatStr = nonVechainTokensFiat[tokenIndex]
                    if (fiatStr) {
                        fiatValue = Number.parseFloat(fiatStr.replaceAll(/[^0-9.]/g, "")) || 0
                    }
                }
            }

            return { token: t, fiatValue }
        })

        tokensWithFiatValue.sort((a, b) => b.fiatValue - a.fiatValue)

        return tokensWithFiatValue[0]?.token || sendableTokens[0]
    }, [
        token,
        availableTokens,
        vetInfo.exchangeRate,
        vthoInfo.exchangeRate,
        b3trInfo.exchangeRate,
        nonVechainTokensWithBalance,
        nonVechainTokensFiat,
    ])

    const [isInputInFiat, setIsInputInFiat] = useState(true)
    const [isError, setIsError] = useState(false)
    const [selectedToken, setSelectedToken] = useState<FungibleTokenWithBalance | undefined>(defaultToken)
    const [internalToken, setInternalToken] = useState<FungibleTokenWithBalance | undefined>(defaultToken)

    const { input, setInput, removeInvalidCharacters } = useAmountInput()

    const { data: exchangeRate } = useExchangeRate({
        id: selectedToken ? getCoinGeckoIdBySymbol[selectedToken.symbol] : undefined,
        vs_currency: currency,
    })

    useEffect(() => {
        if (!exchangeRate && isInputInFiat) {
            setIsInputInFiat(false)
            if (input !== "") {
                setInput("")
                setIsError(false)
            }
        }
    }, [exchangeRate, isInputInFiat, input, setInput])

    const tokenTotalBalance = useMemo(() => {
        const currentToken = selectedToken || defaultToken
        if (!currentToken) return "0"
        return BigNutils(currentToken.balance.balance).toString
    }, [selectedToken, defaultToken])

    const {
        tokenAmount: tokenAmountFromInput,
        fiatAmount: fiatAmountFromInput,
        formattedConvertedAmount,
        isBalanceExceeded,
        isValidAmount,
        fiatTotalBalance,
        tokenTotalToHuman,
    } = useAmountConversion({
        input,
        exchangeRate: exchangeRate ?? undefined,
        isInputInFiat,
        tokenDecimals: selectedToken?.decimals ?? 18,
        tokenTotalBalance,
        formatLocale,
    })

    useEffect(() => {
        if (isBalanceExceeded && !isError) {
            setIsError(true)
            HapticsService.triggerNotification({ level: "Error" })
        } else if (!isBalanceExceeded && isError && input !== "") {
            setIsError(false)
        }
    }, [isBalanceExceeded, isError, input])

    const computedIcon = useMemo(() => {
        if (!selectedToken) return VET.icon
        if (selectedToken.symbol === VET.symbol) return VET.icon
        if (selectedToken.symbol === VTHO.symbol) return VTHO.icon
        if (selectedToken.symbol === B3TR.symbol) return B3TR.icon
        if (selectedToken.symbol === VOT3.symbol) return VOT3.icon
        return selectedToken.icon
    }, [selectedToken])

    const { styles, theme } = useThemedStyles(baseStyles)

    const resetInput = useCallback(() => {
        setInput("")
        setIsError(false)
    }, [setInput])

    const handleToggleInputMode = useCallback(() => {
        setIsInputInFiat(s => !s)
        resetInput()
    }, [resetInput])

    const handleOpenTokenSelector = useCallback(() => {
        bottomSheetRef.current?.present()
    }, [])

    const handleCloseTokenSelector = useCallback(
        (tokenToSelect?: FungibleTokenWithBalance) => {
            const finalToken = tokenToSelect || internalToken
            setSelectedToken(finalToken)
            resetInput()
            bottomSheetRef.current?.dismiss()
        },
        [internalToken, resetInput],
    )

    const hasValidDecimalPlaces = useCallback(
        (value: string): boolean => {
            const parts = value.split(/[.,]/)
            if (parts.length > 1) {
                const decimalPart = parts[1]
                const maxDecimals = isInputInFiat ? MAX_FIAT_DECIMALS : MAX_TOKEN_DECIMALS
                return decimalPart.length <= maxDecimals
            }
            return true
        },
        [isInputInFiat],
    )

    const onChangeTextInput = useCallback(
        (newValue: string) => {
            if (!selectedToken) return

            const _newValue = removeInvalidCharacters(newValue)

            if (!hasValidDecimalPlaces(_newValue)) {
                return
            }

            setInput(_newValue)

            if (_newValue === "" || BigNutils(_newValue).isZero) {
                setIsError(false)
                return
            }
        },
        [hasValidDecimalPlaces, removeInvalidCharacters, selectedToken, setInput],
    )

    const truncateToMaxDecimals = useCallback(
        (value: string): string => {
            const parts = value.split(/([.,])/)
            if (parts.length >= 3) {
                const integerPart = parts[0]
                const separator = parts[1]
                const decimalPart = parts[2]
                const maxDecimals = isInputInFiat ? MAX_FIAT_DECIMALS : MAX_TOKEN_DECIMALS
                return `${integerPart}${separator}${decimalPart.substring(0, maxDecimals)}`
            }
            return value
        },
        [isInputInFiat],
    )

    const handleOnMaxPress = useCallback(async () => {
        const rawValue = removeInvalidCharacters(isInputInFiat ? fiatTotalBalance.value : tokenTotalToHuman.toString)
        const newValue = truncateToMaxDecimals(rawValue)

        setInput(newValue)
    }, [
        fiatTotalBalance.value,
        isInputInFiat,
        removeInvalidCharacters,
        setInput,
        tokenTotalToHuman,
        truncateToMaxDecimals,
    ])

    const handleNext = useCallback(() => {
        if (!selectedToken) return

        const amount = isInputInFiat ? tokenAmountFromInput : input

        const fiatAmount = exchangeRate ? fiatAmountFromInput : undefined

        onNext(amount, selectedToken, fiatAmount, isInputInFiat)
    }, [exchangeRate, fiatAmountFromInput, input, isInputInFiat, onNext, selectedToken, tokenAmountFromInput])

    useEffect(() => {
        onBindNextHandler?.({
            handler: handleNext,
            isValid: isValidAmount,
            isError,
        })
    }, [handleNext, isValidAmount, isError, onBindNextHandler])

    const tokenAmountCard = theme.colors.sendScreen.tokenAmountCard

    const tokenBalance = useMemo(() => {
        if (!selectedToken) return ""
        const humanBalance = BigNutils(selectedToken.balance.balance).toHuman(selectedToken.decimals ?? 0)
        return formatFullPrecision(humanBalance.toString, {
            locale: formatLocale,
            tokenSymbol: selectedToken.symbol,
        })
    }, [formatLocale, selectedToken])

    const formattedInputDisplay = useMemo(() => {
        if (!input || input === "0") return "0"

        let locale: string
        let decimalSeparator: string

        switch (currencyFormat) {
            case CURRENCY_FORMATS.COMMA:
                locale = "de-DE"
                decimalSeparator = CURRENCY_FORMATS.COMMA
                break
            case CURRENCY_FORMATS.DOT:
                locale = "en-US"
                decimalSeparator = CURRENCY_FORMATS.DOT
                break
            case CURRENCY_FORMATS.SYSTEM:
            default:
                locale = formatLocale
                decimalSeparator = getDecimalSeparator(locale) ?? CURRENCY_FORMATS.DOT
                break
        }

        const [integerPart, decimalPart] = input.split(/[.,]/)

        const formatter = getNumberFormatter({
            locale,
            useGrouping: true,
            precision: 0,
            style: "decimal",
        })

        const formattedInteger = formatter.format(Number(integerPart))

        if (decimalPart !== undefined) {
            return `${formattedInteger}${decimalSeparator}${decimalPart}`
        }

        return formattedInteger
    }, [input, currencyFormat, formatLocale])

    if (!selectedToken) {
        return <BaseView flex={1} />
    }

    return (
        <>
            <BaseView style={styles.tokenAmountCard} bg={tokenAmountCard.background}>
                <BaseView alignItems="center" gap={8}>
                    <BaseView style={styles.inputContainer}>
                        <SelectAmountSendDetails.AnimatedAmountInput
                            isInputInFiat={isInputInFiat}
                            isError={isError}
                            formattedInputDisplay={formattedInputDisplay}
                            currency={currency}
                            selectedToken={selectedToken}
                        />
                    </BaseView>

                    <SelectAmountSendDetails.ConversionToggle
                        exchangeRate={exchangeRate}
                        isError={isError}
                        isInputInFiat={isInputInFiat}
                        formattedConvertedAmount={formattedConvertedAmount}
                        currency={currency}
                        selectedToken={selectedToken}
                        onToggle={handleToggleInputMode}
                    />
                </BaseView>

                <BaseSpacer height={32} />

                <SelectAmountSendDetails.TokenSelectorButton
                    computedIcon={computedIcon}
                    tokenBalance={tokenBalance}
                    onOpenSelector={handleOpenTokenSelector}
                    onMaxPress={handleOnMaxPress}
                />

                <BaseSpacer height={24} />

                <NumPad
                    onDigitPress={digit => onChangeTextInput(input + digit)}
                    onDigitDelete={() => onChangeTextInput(input.slice(0, -1))}
                    typographyFont="headerTitleMedium"
                    showDecimal
                />
            </BaseView>
            <BaseSpacer height={16} />
            {internalToken && (
                <TokenSelectionBottomSheet
                    ref={bottomSheetRef}
                    selectedToken={internalToken}
                    setSelectedToken={setInternalToken}
                    onClose={handleCloseTokenSelector}
                />
            )}
        </>
    )
}

const baseStyles = () =>
    StyleSheet.create({
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 64,
            paddingHorizontal: 24,
        },
        tokenAmountCard: {
            padding: 24,
            paddingTop: 38,
            borderRadius: 24,
        },
    })
