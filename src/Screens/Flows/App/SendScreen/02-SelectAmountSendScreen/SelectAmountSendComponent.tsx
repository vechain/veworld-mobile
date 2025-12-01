import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, useWindowDimensions } from "react-native"
import { useAnimatedStyle, useDerivedValue, withTiming } from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseSpacer, BaseView, NumPad } from "~Components"
import { B3TR, CURRENCY_FORMATS, VET, VOT3, VTHO } from "~Constants"
import { getNumberFormatter } from "~Constants/Constants/NumberFormatter"
import { useAmountInput, useFormatFiat, useThemedStyles } from "~Hooks"
import { useSendableTokensWithBalance } from "~Hooks/useSendableTokensWithBalance"
import HapticsService from "~Services/HapticsService"
import { selectCurrency, selectCurrencyFormat, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { formatFullPrecision } from "~Utils/StandardizedFormatting"
import { FungibleTokenWithBalance } from "~Model"
import { TokenSelectionBottomSheet } from "./components/TokenSelectionBottomSheet"
import { SelectAmountSendDetails } from "./components/SelectAmountSendDetails"
import { useAmountConversion } from "./Hooks"

const MAX_FIAT_DECIMALS = 2
const MAX_TOKEN_DECIMALS = 5

type SelectAmountSendComponentProps = {
    token?: FungibleTokenWithBalance
    onNext: (amount: string, token: FungibleTokenWithBalance, fiatAmount?: string) => void
    onValidationChange?: (isValid: boolean, isError: boolean) => void
    onBindNextHandler?: (handler: () => void) => void
}

export const SelectAmountSendComponent = ({
    token,
    onNext,
    onValidationChange,
    onBindNextHandler,
}: SelectAmountSendComponentProps) => {
    const { formatLocale } = useFormatFiat()
    const { width: screenWidth } = useWindowDimensions()

    const timer = useRef<NodeJS.Timeout | null>(null)
    const bottomSheetRef = useRef<BottomSheetModalMethods>(null)

    const currency = useAppSelector(selectCurrency)
    const currencyFormat = useAppSelector(selectCurrencyFormat)
    const availableTokens = useSendableTokensWithBalance()

    const defaultToken = useMemo(() => {
        if (token) return token
        const vetToken = availableTokens.find(t => t.symbol === VET.symbol)
        return vetToken || availableTokens[0]
    }, [token, availableTokens])

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
        }
    }, [exchangeRate, isInputInFiat])

    useEffect(() => {
        return () => {
            if (timer.current) {
                clearTimeout(timer.current)
                timer.current = null
            }
        }
    }, [])

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

    useEffect(() => {
        onValidationChange?.(isValidAmount, isError)
    }, [isValidAmount, isError, onValidationChange])

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
                if (timer.current) {
                    clearTimeout(timer.current)
                    timer.current = null
                }

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

        onNext(amount, selectedToken, fiatAmount)
    }, [exchangeRate, fiatAmountFromInput, input, isInputInFiat, onNext, selectedToken, tokenAmountFromInput])

    useEffect(() => {
        onBindNextHandler?.(handleNext)
    }, [handleNext, onBindNextHandler])

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
        switch (currencyFormat) {
            case CURRENCY_FORMATS.COMMA:
                locale = "de-DE"
                break
            case CURRENCY_FORMATS.DOT:
                locale = "en-US"
                break
            case CURRENCY_FORMATS.SYSTEM:
            default:
                locale = formatLocale
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
            let decimalSeparator: string
            switch (currencyFormat) {
                case CURRENCY_FORMATS.COMMA:
                    decimalSeparator = ","
                    break
                case CURRENCY_FORMATS.DOT:
                    decimalSeparator = "."
                    break
                case CURRENCY_FORMATS.SYSTEM:
                default: {
                    const formatted = getNumberFormatter({ locale, style: "decimal" }).format(1.1)
                    decimalSeparator = formatted.charAt(1)
                    break
                }
            }

            return `${formattedInteger}${decimalSeparator}${decimalPart}`
        }

        return formattedInteger
    }, [input, currencyFormat, formatLocale])

    const availableWidth = screenWidth - (24 * 2 + 50 + 20)

    const totalDisplayLength = useMemo(() => {
        const displayLength = (formattedInputDisplay || "0").length
        if (!isInputInFiat && selectedToken?.symbol) {
            return displayLength + 1 + selectedToken.symbol.length
        }
        return displayLength
    }, [formattedInputDisplay, isInputInFiat, selectedToken?.symbol])

    const inputLength = useDerivedValue(() => {
        return totalDisplayLength
    }, [totalDisplayLength])

    const animatedInputStyle = useAnimatedStyle(() => {
        const length = inputLength.value
        const baseFontSize = 48
        const minFontSize = 24

        const charWidthAtBaseSize = baseFontSize * 0.6

        const threshold = Math.floor(availableWidth / charWidthAtBaseSize)

        let fontSize = baseFontSize
        if (length > threshold) {
            const targetCharWidth = availableWidth / length
            const calculatedFontSize = targetCharWidth / 0.6
            fontSize = Math.max(minFontSize, calculatedFontSize)
        }

        return {
            fontSize: withTiming(fontSize, { duration: 200 }),
            lineHeight: withTiming(fontSize, { duration: 200 }),
        }
    }, [inputLength, availableWidth])

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
                            animatedInputStyle={animatedInputStyle}
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
