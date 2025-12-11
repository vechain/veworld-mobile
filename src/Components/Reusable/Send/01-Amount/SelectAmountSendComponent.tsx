import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { ethers } from "ethers"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseSpacer, BaseView } from "~Components"
import { B3TR, ColorThemeType, CURRENCY_FORMATS, VET, VOT3, VTHO } from "~Constants"
import { getNumberFormatter } from "~Constants/Constants/NumberFormatter"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectCurrency, selectCurrencyFormat, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { getDecimalSeparator } from "~Utils/BigNumberUtils/BigNumberUtils"
import { formatFullPrecision } from "~Utils/StandardizedFormatting"
import { useTokenSendContext } from "../Provider"
import { SendContent } from "../Shared"
import { SelectAmountConversionToggle } from "./Components/SelectAmountConversionToggle"
import { SelectAmountInput } from "./Components/SelectAmountInput"
import { SelectAmountTokenSelector } from "./Components/SelectAmountTokenSelector"
import { SendNumPad } from "./Components/SendNumPad"
import { TokenSelectionBottomSheet } from "./Components/TokenSelectionBottomSheet"
import { useDefaultToken } from "./Hooks"
import { useSendAmountInput } from "./Hooks/useSendAmountInput"

const MAX_FIAT_DECIMALS = 2
const MAX_TOKEN_DECIMALS = 5

export const SelectAmountSendComponent = () => {
    const { setFlowState, goToNext, flowState } = useTokenSendContext()
    const { formatLocale } = useFormatFiat()

    const bottomSheetRef = useRef<BottomSheetModalMethods>(null)

    const currency = useAppSelector(selectCurrency)
    const currencyFormat = useAppSelector(selectCurrencyFormat)

    const defaultToken = useDefaultToken()
    const [isInputInFiat, setIsInputInFiat] = useState(flowState.amountInFiat ?? true)
    const [selectedToken, setSelectedToken] = useState<FungibleTokenWithBalance | undefined>(defaultToken)
    const [internalToken, setInternalToken] = useState<FungibleTokenWithBalance | undefined>(defaultToken)

    const { data: exchangeRate, fetchStatus } = useExchangeRate({
        id: selectedToken ? getCoinGeckoIdBySymbol[selectedToken.symbol] ?? selectedToken.symbol : undefined,
        vs_currency: currency,
    })

    const { isBalanceExceeded, fiatAmount, tokenAmount, onChange, onMax, onReset, input } = useSendAmountInput({
        token: selectedToken,
        isInputInFiat,
    })

    const noExchangeRate = useMemo(() => {
        return !exchangeRate && fetchStatus === "idle" && selectedToken
    }, [exchangeRate, fetchStatus, selectedToken])

    useEffect(() => {
        if (isInputInFiat && noExchangeRate) {
            setIsInputInFiat(false)
            onReset()
        }
    }, [exchangeRate, fetchStatus, isInputInFiat, noExchangeRate, onReset])

    const computedIcon = useMemo(() => {
        if (!selectedToken) return VET.icon
        if (selectedToken.symbol === VET.symbol) return VET.icon
        if (selectedToken.symbol === VTHO.symbol) return VTHO.icon
        if (selectedToken.symbol === B3TR.symbol) return B3TR.icon
        if (selectedToken.symbol === VOT3.symbol) return VOT3.icon
        return selectedToken.icon
    }, [selectedToken])

    const { styles } = useThemedStyles(baseStyles)

    const handleToggleInputMode = useCallback(() => {
        setIsInputInFiat(s => !s)
        onReset()
    }, [onReset])

    const handleOpenTokenSelector = useCallback(() => {
        bottomSheetRef.current?.present()
    }, [])

    const handleCloseTokenSelector = useCallback(
        (tokenToSelect?: FungibleTokenWithBalance) => {
            const finalToken = tokenToSelect || internalToken
            setSelectedToken(finalToken)
            onReset()
            bottomSheetRef.current?.dismiss()
        },
        [internalToken, onReset],
    )

    const truncateToMaxDecimals = useCallback((value: string, kind: "fiat" | "token"): string => {
        const parts = value.split(/([.,])/)
        if (parts.length >= 3) {
            const integerPart = parts[0]
            const separator = parts[1]
            const decimalPart = parts[2]
            const maxDecimals = kind === "fiat" ? MAX_FIAT_DECIMALS : MAX_TOKEN_DECIMALS
            return `${integerPart}${separator}${decimalPart.substring(0, maxDecimals)}`
        }
        return value
    }, [])

    const tokenBalance = useMemo(() => {
        if (!selectedToken) return ""
        const humanBalance = BigNutils(selectedToken.balance.balance).toHuman(selectedToken.decimals ?? 0)
        return formatFullPrecision(humanBalance.toString, {
            locale: formatLocale,
            tokenSymbol: selectedToken.symbol,
        })
    }, [formatLocale, selectedToken])

    const formattedInput = useMemo(() => {
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

        const [integerPart, decimalPart] = truncateToMaxDecimals(input, isInputInFiat ? "fiat" : "token").split(/[.,]/)

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
    }, [currencyFormat, truncateToMaxDecimals, input, isInputInFiat, formatLocale])

    const formattedConverted = useMemo(() => {
        const valueToFormat = isInputInFiat ? tokenAmount : fiatAmount

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

        const [integerPart, decimalPart] = truncateToMaxDecimals(
            ethers.utils.formatUnits(valueToFormat, selectedToken?.decimals ?? 18),
            isInputInFiat ? "token" : "fiat",
        ).split(/[.,]/)

        const formatter = getNumberFormatter({
            locale,
            useGrouping: true,
            precision: 0,
            style: "decimal",
        })

        const formattedInteger = formatter.format(Number(integerPart))

        if (!BigNutils(decimalPart).isZero) {
            return `${formattedInteger}${decimalSeparator}${decimalPart}`
        }

        return formattedInteger
    }, [
        isInputInFiat,
        fiatAmount,
        tokenAmount,
        currencyFormat,
        truncateToMaxDecimals,
        selectedToken?.decimals,
        formatLocale,
    ])

    const onSubmit = useCallback(() => {
        const amount = ethers.utils.formatUnits(tokenAmount, selectedToken?.decimals)
        const fiat = isInputInFiat ? ethers.utils.formatUnits(fiatAmount, selectedToken?.decimals) : undefined

        setFlowState(prev => ({
            ...prev,
            amount,
            token: selectedToken,
            fiatAmount: fiat,
            amountInFiat: isInputInFiat,
            initialExchangeRate: exchangeRate,
        }))
        goToNext()
    }, [exchangeRate, fiatAmount, goToNext, isInputInFiat, selectedToken, setFlowState, tokenAmount])

    if (!selectedToken) {
        return <BaseView flex={1} />
    }

    return (
        <SendContent>
            <SendContent.Header />
            <SendContent.Container>
                <Animated.View style={styles.tokenAmountCard}>
                    <BaseView alignItems="center" gap={8}>
                        <BaseView style={styles.inputContainer}>
                            <SelectAmountInput
                                isInputInFiat={isInputInFiat}
                                isError={isBalanceExceeded}
                                formattedInputDisplay={formattedInput}
                                currency={currency}
                                selectedToken={selectedToken}
                            />
                        </BaseView>

                        {!noExchangeRate && (
                            <SelectAmountConversionToggle
                                exchangeRate={exchangeRate}
                                isError={isBalanceExceeded}
                                isInputInFiat={isInputInFiat}
                                formattedConvertedAmount={formattedConverted}
                                currency={currency}
                                selectedToken={selectedToken}
                                onToggle={handleToggleInputMode}
                            />
                        )}
                    </BaseView>

                    <BaseSpacer height={32} />

                    <SelectAmountTokenSelector
                        computedIcon={computedIcon}
                        tokenBalance={tokenBalance}
                        onOpenSelector={handleOpenTokenSelector}
                        onMaxPress={onMax}
                    />

                    <BaseSpacer height={32} />

                    <SendNumPad
                        onDigitPress={digit => onChange({ type: "add", digit })}
                        onDigitDelete={() => onChange({ type: "delete" })}
                        typographyFont="headerTitleMedium"
                    />
                </Animated.View>
            </SendContent.Container>
            <SendContent.Footer>
                {/* TODO: Check that it's not zero too */}
                <SendContent.Footer.Next action={onSubmit} disabled={isBalanceExceeded} />
            </SendContent.Footer>
            {internalToken && (
                <TokenSelectionBottomSheet
                    ref={bottomSheetRef}
                    selectedToken={internalToken}
                    setSelectedToken={setInternalToken}
                    onClose={handleCloseTokenSelector}
                />
            )}
        </SendContent>
    )
}

const baseStyles = (theme: ColorThemeType) =>
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
            backgroundColor: theme.colors.sendScreen.tokenAmountCard.background,
        },
    })
