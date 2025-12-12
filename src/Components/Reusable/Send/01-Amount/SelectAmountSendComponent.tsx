import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import { ethers } from "ethers"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet } from "react-native"
import Animated from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { BaseSpacer, BaseView } from "~Components"
import { B3TR, ColorThemeType, VET, VOT3, VTHO } from "~Constants"
import { useFormatFiat, useThemedStyles } from "~Hooks"
import { FungibleTokenWithBalance } from "~Model"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils } from "~Utils"
import { formatFullPrecision } from "~Utils/StandardizedFormatting"
import { useTokenSendContext } from "../Provider"
import { SendContent } from "../Shared"
import { SelectAmountConversionToggle } from "./Components/SelectAmountConversionToggle"
import { SelectAmountInput } from "./Components/SelectAmountInput"
import { SelectAmountTokenSelector } from "./Components/SelectAmountTokenSelector"
import { SendNumPad } from "./Components/SendNumPad"
import { TokenSelectionBottomSheet } from "./Components/TokenSelectionBottomSheet"
import { useDefaultToken, useDisplayInput } from "./Hooks"
import { useSendAmountInput } from "./Hooks/useSendAmountInput"

/**
 * Refine the decimal value to remove trailing zeros.
 * It only supports `.` since this should be used only for ethers values (returned from formatX functions)
 * @param value Value to refine
 */
const refineEthersDecimalValue = (value: string | undefined) => {
    if (!value) return value
    const [integer, decimal] = value.split(".")
    if (BigNutils(decimal).isZero) return integer
    return value
}

const SelectAmountSendComponentContent = ({
    selectedToken,
    setSelectedToken,
}: {
    selectedToken: FungibleTokenWithBalance
    setSelectedToken: (token: FungibleTokenWithBalance) => void
}) => {
    const { setFlowState, goToNext, flowState } = useTokenSendContext()
    const { formatLocale } = useFormatFiat()

    const bottomSheetRef = useRef<BottomSheetModalMethods>(null)

    const currency = useAppSelector(selectCurrency)

    const [isInputInFiat, setIsInputInFiat] = useState(flowState.amountInFiat ?? true)

    const { data: exchangeRate, fetchStatus } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[selectedToken.symbol] ?? selectedToken.symbol,
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
        (tokenToSelect: FungibleTokenWithBalance) => {
            setSelectedToken(tokenToSelect)
            onReset()
            bottomSheetRef.current?.dismiss()
        },
        [onReset, setSelectedToken],
    )

    const tokenBalance = useMemo(() => {
        if (!selectedToken) return ""
        const humanBalance = BigNutils(selectedToken.balance.balance).toHuman(selectedToken.decimals ?? 0)
        return formatFullPrecision(humanBalance.toString, {
            locale: formatLocale,
            tokenSymbol: selectedToken.symbol,
        })
    }, [formatLocale, selectedToken])

    const { formattedInput, formattedConverted } = useDisplayInput({
        input,
        tokenAmount,
        fiatAmount,
        isInputInFiat,
        token: selectedToken,
    })

    const onSubmit = useCallback(() => {
        const amount = refineEthersDecimalValue(ethers.utils.formatUnits(tokenAmount, selectedToken?.decimals))
        const fiat = refineEthersDecimalValue(
            isInputInFiat ? ethers.utils.formatUnits(fiatAmount, selectedToken?.decimals) : undefined,
        )

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
            <TokenSelectionBottomSheet
                ref={bottomSheetRef}
                selectedToken={selectedToken}
                setSelectedToken={setSelectedToken}
                onClose={handleCloseTokenSelector}
            />
        </SendContent>
    )
}

export const SelectAmountSendComponent = () => {
    const defaultToken = useDefaultToken()
    const [selectedToken, setSelectedToken] = useState<FungibleTokenWithBalance | undefined>(defaultToken)

    const token = useMemo(() => selectedToken ?? defaultToken, [defaultToken, selectedToken])

    if (!token) return <BaseView flex={1} />

    return <SelectAmountSendComponentContent selectedToken={token} setSelectedToken={setSelectedToken} />
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
