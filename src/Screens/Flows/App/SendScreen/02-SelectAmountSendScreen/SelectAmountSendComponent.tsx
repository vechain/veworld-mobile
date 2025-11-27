import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types"
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { StyleSheet, Text, TouchableOpacity, useWindowDimensions } from "react-native"
import Animated, {
    FadeIn,
    FadeInLeft,
    FadeOutLeft,
    useAnimatedStyle,
    useDerivedValue,
    withTiming,
} from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import {
    AlertInline,
    BaseBottomSheet,
    BaseIcon,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseTouchableBox,
    BaseView,
    FadeoutButton,
    NumPad,
} from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, CURRENCY_FORMATS, CURRENCY_SYMBOLS, VeDelegate, VET, VOT3, VTHO } from "~Constants"
import { ColorThemeType, typography } from "~Constants/Theme"
import { useAmountInput, useBalances, useCombineFiatBalances, useFormatFiat, useTheme, useThemedStyles } from "~Hooks"
import { useSendableTokensWithBalance } from "~Hooks/useSendableTokensWithBalance"
import { useTokenDisplayName } from "~Hooks/useTokenDisplayName"
import HapticsService from "~Services/HapticsService"
import { selectCurrency, selectCurrencyFormat, useAppSelector } from "~Storage/Redux"
import { AddressUtils, BigNutils } from "~Utils"
import { formatFullPrecision, formatTokenAmount } from "~Utils/StandardizedFormatting"
import { FungibleTokenWithBalance } from "~Model"
import { useI18nContext } from "~i18n"

const { defaults: defaultTypography } = typography

type SelectAmountSendComponentProps = {
    token?: FungibleTokenWithBalance
    onNext: (amount: string, token: FungibleTokenWithBalance) => void
}

const AnimatedText = Animated.createAnimatedComponent(Text)

export const SelectAmountSendComponent = ({ token, onNext }: SelectAmountSendComponentProps) => {
    const { LL } = useI18nContext()
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

    const [tokenAmountFromFiat, setTokenAmountFromFiat] = useState("")

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

    const computedIcon = useMemo(() => {
        if (!selectedToken) return VET.icon
        if (selectedToken.symbol === VET.symbol) return VET.icon
        if (selectedToken.symbol === VTHO.symbol) return VTHO.icon
        if (selectedToken.symbol === B3TR.symbol) return B3TR.icon
        if (selectedToken.symbol === VOT3.symbol) return VOT3.icon
        return selectedToken.icon
    }, [selectedToken])

    const { styles, theme } = useThemedStyles(baseStyles)

    const tokenTotalBalance = useMemo(() => {
        const currentToken = selectedToken || defaultToken
        if (!currentToken) return "0"
        return BigNutils(currentToken.balance.balance).toString
    }, [selectedToken, defaultToken])

    const tokenTotalToHuman = useMemo(() => {
        const currentToken = selectedToken || defaultToken
        if (!currentToken) return BigNutils("0")
        return BigNutils(tokenTotalBalance).toHuman(currentToken.decimals)
    }, [selectedToken, defaultToken, tokenTotalBalance])

    const fiatTotalBalance = useMemo(
        () => BigNutils().toCurrencyConversion(tokenTotalToHuman.toString, exchangeRate ?? 0),
        [exchangeRate, tokenTotalToHuman],
    )

    const fiatHumanAmount = useMemo(
        () => BigNutils().toCurrencyConversion(input, exchangeRate ?? 0),
        [exchangeRate, input],
    )

    const formattedConvertedAmount = useMemo(() => {
        if (!input || input === "0") return "0"
        if (!selectedToken) return "0"

        if (isInputInFiat) {
            const tokenAmount = BigNutils().toTokenConversion(input, exchangeRate ?? 0).toString
            return formatFullPrecision(tokenAmount, {
                locale: formatLocale,
            })
        } else {
            return formatFullPrecision(fiatHumanAmount.value, {
                locale: formatLocale,
            })
        }
    }, [exchangeRate, fiatHumanAmount.value, formatLocale, input, isInputInFiat, selectedToken])

    const resetInput = useCallback(() => {
        setInput("")
        setTokenAmountFromFiat("")
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
                const maxDecimals = isInputInFiat ? 2 : 5
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

            const normalizedValue = _newValue.match(/^[.,]/) ? `0${_newValue}` : _newValue

            if (_newValue === "" || BigNutils(normalizedValue).isZero) {
                if (timer.current) {
                    clearTimeout(timer.current)
                    timer.current = null
                }

                setIsError(false)
                setTokenAmountFromFiat("")
                return
            }

            const controlValue = isInputInFiat
                ? BigNutils().toTokenConversion(normalizedValue, exchangeRate ?? 0)
                : BigNutils(normalizedValue).addTrailingZeros(selectedToken.decimals).toHuman(selectedToken.decimals)

            const balanceToHuman = BigNutils(tokenTotalBalance).toHuman(selectedToken.decimals)

            if (controlValue.isBiggerThan(balanceToHuman.toString)) {
                setIsError(true)
                HapticsService.triggerNotification({ level: "Error" })
            } else {
                setIsError(false)
            }

            setTokenAmountFromFiat(controlValue.toString)
        },
        [
            exchangeRate,
            hasValidDecimalPlaces,
            isInputInFiat,
            removeInvalidCharacters,
            selectedToken,
            setInput,
            tokenTotalBalance,
        ],
    )

    const truncateToMaxDecimals = useCallback(
        (value: string): string => {
            const parts = value.split(/([.,])/)
            if (parts.length >= 3) {
                const integerPart = parts[0]
                const separator = parts[1]
                const decimalPart = parts[2]
                const maxDecimals = isInputInFiat ? 2 : 5
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
        setTokenAmountFromFiat(tokenTotalToHuman.toString)
    }, [
        fiatTotalBalance.value,
        isInputInFiat,
        removeInvalidCharacters,
        setInput,
        tokenTotalToHuman,
        truncateToMaxDecimals,
    ])

    /**
     * Navigate to the next screen
     * Nav params: If user has FIAT active send the TOKEN amount calculated from FIAT,
     * otherwise send the input value (human readable token value)
     */
    const handleNext = useCallback(() => {
        if (!selectedToken) return
        const amount = isInputInFiat ? tokenAmountFromFiat : input
        onNext(amount, selectedToken)
    }, [input, isInputInFiat, onNext, selectedToken, tokenAmountFromFiat])

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

        const formatter = new Intl.NumberFormat(locale, {
            useGrouping: true,
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
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
                default:
                    const formatted = new Intl.NumberFormat(locale).format(1.1)
                    decimalSeparator = formatted.charAt(1)
                    break
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
            <BaseView flexDirection="row" alignItems="center" justifyContent="space-between" mb={16} px={8}>
                <BaseView flexDirection="row" alignItems="center" gap={8}>
                    <BaseIcon
                        name="icon-coins"
                        size={16}
                        iconPadding={2}
                        borderRadius={100}
                        bg={theme.colors.label.background}
                        color={theme.colors.label.text}
                    />
                    <BaseText typographyFont="bodyMedium" color={theme.colors.subSubtitle}>
                        {LL.SEND_TOKEN_AMOUNT()}
                    </BaseText>
                </BaseView>
                <BaseText typographyFont="captionMedium" color={tokenAmountCard.stepText}>
                    {LL.SEND_STEP_OF_3({ stepNumber: "1" })}
                </BaseText>
            </BaseView>
            <BaseView style={styles.tokenAmountCard} bg={tokenAmountCard.background}>
                <BaseView alignItems="center" gap={8}>
                    <BaseView style={styles.inputContainer}>
                        {isInputInFiat ? (
                            <Animated.View key="fiat" entering={FadeIn.duration(300)} style={styles.amountWrapper}>
                                <Animated.View entering={FadeInLeft.duration(300)} exiting={FadeOutLeft.duration(200)}>
                                    <BaseText
                                        typographyFont="headerTitleMedium"
                                        color={isError ? theme.colors.danger : theme.colors.text}
                                        style={styles.currencySymbol}>
                                        {CURRENCY_SYMBOLS[currency]}
                                    </BaseText>
                                </Animated.View>
                                <AnimatedText
                                    style={[
                                        styles.animatedInput,
                                        {
                                            color: isError ? theme.colors.danger : theme.colors.text,
                                        },
                                        animatedInputStyle,
                                    ]}
                                    allowFontScaling={false}
                                    numberOfLines={1}
                                    testID="SendScreen_amountInput">
                                    {formattedInputDisplay}
                                </AnimatedText>
                            </Animated.View>
                        ) : (
                            <Animated.View key="token" entering={FadeIn.duration(300)} style={styles.amountWrapper}>
                                <AnimatedText
                                    style={[
                                        styles.animatedInput,
                                        {
                                            color: isError ? theme.colors.danger : theme.colors.text,
                                        },
                                        animatedInputStyle,
                                    ]}
                                    allowFontScaling={false}
                                    testID="SendScreen_amountInput">
                                    {formattedInputDisplay}
                                    <Text
                                        style={[
                                            styles.tokenSymbolInline,
                                            { color: isError ? theme.colors.danger : theme.colors.text },
                                        ]}>
                                        {" "}
                                        {selectedToken.symbol}
                                    </Text>
                                </AnimatedText>
                            </Animated.View>
                        )}
                    </BaseView>
                    {exchangeRate ? (
                        <BaseTouchable action={handleToggleInputMode} haptics="Light" disabled={isError}>
                            <BaseView flexDirection="row" alignItems="center" gap={4}>
                                {isError ? (
                                    <BaseText color={theme.colors.danger} typographyFont="captionMedium">
                                        {LL.SEND_AMOUNT_EXCEEDS_BALANCE()}
                                    </BaseText>
                                ) : (
                                    <Animated.View
                                        key={isInputInFiat ? "token-conv" : "fiat-conv"}
                                        entering={FadeIn.duration(300)}>
                                        <BaseText color={theme.colors.textLightish} typographyFont="bodySemiBold">
                                            {!isInputInFiat && CURRENCY_SYMBOLS[currency]}
                                            {formattedConvertedAmount}
                                            {isInputInFiat && (
                                                <Text style={styles.convertedSymbol}> {selectedToken.symbol}</Text>
                                            )}
                                        </BaseText>
                                    </Animated.View>
                                )}
                                {!isError && (
                                    <>
                                        <BaseSpacer width={2} />
                                        <BaseIcon
                                            name="icon-arrow-up-down"
                                            size={12}
                                            color={theme.colors.textLightish}
                                        />
                                    </>
                                )}
                            </BaseView>
                        </BaseTouchable>
                    ) : (
                        isError && (
                            <BaseText color={theme.colors.danger} typographyFont="captionMedium">
                                {LL.SEND_AMOUNT_EXCEEDS_BALANCE()}
                            </BaseText>
                        )
                    )}
                </BaseView>
                <BaseSpacer height={32} />
                <TouchableOpacity onPress={handleOpenTokenSelector}>
                    <BaseView style={styles.tokenSelector} mx={18}>
                        <BaseView flexDirection="row" alignItems="center" gap={8}>
                            <BaseIcon name="icon-chevrons-up-down" size={16} color={tokenAmountCard.tokenSelectIcon} />
                            <BaseView flexDirection="row" alignItems="center" gap={8}>
                                <TokenImage icon={computedIcon} iconSize={24} rounded={true} />
                                <BaseText typographyFont="bodySemiBold" color={tokenAmountCard.tokenSelectorText}>
                                    {tokenBalance}
                                </BaseText>
                            </BaseView>
                        </BaseView>
                        <BaseTouchable action={handleOnMaxPress} style={styles.maxButton}>
                            <BaseText typographyFont="captionSemiBold" color={tokenAmountCard.maxButtonText}>
                                {LL.COMMON_MAX()}
                            </BaseText>
                        </BaseTouchable>
                    </BaseView>
                </TouchableOpacity>
                <BaseSpacer height={24} />
                <NumPad
                    onDigitPress={digit => onChangeTextInput(input + digit)}
                    onDigitDelete={() => onChangeTextInput(input.slice(0, -1))}
                    typographyFont="headerTitleMedium"
                    showDecimal
                />
            </BaseView>
            <BaseSpacer height={42} />

            <FadeoutButton
                testID="next-button"
                title={LL.COMMON_BTN_NEXT()}
                disabled={isError || input === "" || BigNutils(input).isZero}
                action={handleNext}
                bottom={0}
                mx={0}
                width={"auto"}
            />
            {internalToken && (
                <TokenSelectionBottomSheet
                    ref={bottomSheetRef}
                    selectedToken={internalToken}
                    setSelectedToken={setInternalToken}
                    availableTokens={availableTokens}
                    onClose={handleCloseTokenSelector}
                />
            )}
        </>
    )
}

const baseStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        input: {
            ...defaultTypography.largeTitle,
            flex: 1,
        },
        inputContainer: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            height: 64,
            paddingHorizontal: 24,
        },

        animatedInput: {
            fontFamily: defaultTypography.extraLargeTitleSemiBold.fontFamily,
            fontSize: defaultTypography.extraLargeTitleSemiBold.fontSize,
            fontWeight: defaultTypography.extraLargeTitleSemiBold.fontWeight,
            textAlign: "center",
        },
        currencySymbol: {
            marginRight: 8,
        },
        amountWrapper: {
            height: 64,
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "center",
        },
        convertedSymbol: {
            color: theme.colors.textLightish,
        },
        tokenSymbolInline: {
            fontFamily: defaultTypography.subSubTitleMedium.fontFamily,
            fontSize: defaultTypography.subSubTitleMedium.fontSize,
            fontWeight: defaultTypography.subSubTitleMedium.fontWeight,
        },
        tokenSymbolRight: {
            marginLeft: 8,
        },
        tokenAmountCard: {
            padding: 24,
            paddingTop: 38,
            borderRadius: 24,
        },
        tokenSelector: {
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.sendScreen.tokenAmountCard.tokenSelectorBorder,
            backgroundColor: theme.colors.card,
        },
        maxButton: {
            paddingHorizontal: 18,
            paddingVertical: 4,
            borderRadius: 6,
            borderWidth: 1,
            borderColor: theme.colors.sendScreen.tokenAmountCard.maxButtonBorder,
        },
    })

type TokenSelectionBottomSheetProps = {
    selectedToken: FungibleTokenWithBalance
    setSelectedToken: (token: FungibleTokenWithBalance) => void
    availableTokens: FungibleTokenWithBalance[]
    onClose: (token?: FungibleTokenWithBalance) => void
}

type EnhancedTokenCardProps = {
    item: FungibleTokenWithBalance
    onSelectedToken: (token: FungibleTokenWithBalance) => void
    selected: boolean
    disabled?: boolean
    onDisabledPress?: () => void
}

const EnhancedTokenCard = ({ item, selected, onSelectedToken, disabled, onDisabledPress }: EnhancedTokenCardProps) => {
    const theme = useTheme()
    const { styles } = useThemedStyles(baseTokenCardStyles({ selected }))
    const currency = useAppSelector(selectCurrency)

    const name = useTokenDisplayName(item)
    const isCrossChainToken = useMemo(() => !!item.crossChainProvider, [item.crossChainProvider])

    const exchangeRateId = useMemo(() => {
        const coingeckoId = getCoinGeckoIdBySymbol[item.symbol]
        if (coingeckoId) return coingeckoId
        if (item.symbol === VeDelegate.symbol) return getCoinGeckoIdBySymbol[B3TR.symbol]
        return item.symbol
    }, [item.symbol])

    const { data: exchangeRate } = useExchangeRate({
        vs_currency: currency,
        id: exchangeRateId,
    })

    const { fiatBalance } = useBalances({
        token: item,
        exchangeRate: exchangeRate ?? 0,
    })

    const { combineFiatBalances } = useCombineFiatBalances()

    const { amount, areAlmostZero } = useMemo(
        () => combineFiatBalances([fiatBalance]),
        [combineFiatBalances, fiatBalance],
    )

    const { formatFiat, formatLocale } = useFormatFiat()
    const renderFiatBalance = useMemo(() => {
        const formattedFiat = formatFiat({ amount, cover: false })
        if (areAlmostZero) return `< ${formattedFiat}`
        return formattedFiat
    }, [formatFiat, amount, areAlmostZero])

    const tokenBalance = useMemo(() => {
        return formatTokenAmount(item.balance?.balance ?? "0", item.symbol, item.decimals ?? 0, {
            locale: formatLocale,
            includeSymbol: false,
        })
    }, [formatLocale, item.balance?.balance, item.decimals, item.symbol])

    const showFiatBalance = useMemo(() => {
        return !!exchangeRate
    }, [exchangeRate])

    const onPress = useCallback(() => {
        if (disabled && onDisabledPress) {
            onDisabledPress()
        } else if (!disabled) {
            onSelectedToken(item)
        }
    }, [disabled, item, onDisabledPress, onSelectedToken])

    return (
        <BaseTouchableBox
            action={onPress}
            testID="TOKEN_SELECTOR_BOTTOM_SHEET_TOKEN"
            py={item.symbol ? typography.lineHeight.body : typography.lineHeight.captionSemiBold}
            flexDirection="row"
            bg={disabled ? theme.colors.sendScreen.tokenAmountCard.disabledTokenCardBackground : theme.colors.card}
            containerStyle={styles.container}
            innerContainerStyle={styles.root}>
            <BaseView flexDirection="row" gap={16} style={styles.leftSection}>
                <TokenImage
                    icon={item.icon}
                    isVechainToken={AddressUtils.isVechainToken(item.address)}
                    iconSize={32}
                    isCrossChainToken={isCrossChainToken}
                    rounded={!isCrossChainToken}
                />

                {item.symbol ? (
                    <BaseView flexDirection="column" flexGrow={0} gap={3} flexShrink={1} style={styles.tokenInfo}>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.title}
                            flexDirection="row"
                            testID="TOKEN_CARD_NAME">
                            {name}
                        </BaseText>
                        <BaseText typographyFont="captionSemiBold" color={theme.colors.activityCard.subtitleLight}>
                            {item.symbol}
                        </BaseText>
                    </BaseView>
                ) : (
                    <BaseText
                        flex={1}
                        typographyFont="bodySemiBold"
                        color={theme.colors.activityCard.title}
                        flexDirection="row">
                        {name}
                    </BaseText>
                )}
            </BaseView>

            <BaseView flexDirection="column" alignItems="flex-end" style={styles.balanceSection}>
                {showFiatBalance ? (
                    <>
                        <BaseText
                            typographyFont="bodySemiBold"
                            color={theme.colors.activityCard.title}
                            align="right"
                            flexDirection="row"
                            testID="TOKEN_CARD_FIAT_BALANCE">
                            {renderFiatBalance}
                        </BaseText>
                        <BaseText
                            typographyFont="captionSemiBold"
                            color={theme.colors.activityCard.subtitleLight}
                            align="right"
                            flexDirection="row"
                            testID="TOKEN_CARD_TOKEN_BALANCE">
                            {tokenBalance}
                        </BaseText>
                    </>
                ) : (
                    <BaseText
                        typographyFont="bodySemiBold"
                        color={theme.colors.activityCard.title}
                        align="right"
                        flexDirection="row"
                        testID="TOKEN_CARD_TOKEN_BALANCE">
                        {tokenBalance}
                    </BaseText>
                )}
            </BaseView>
        </BaseTouchableBox>
    )
}

const TokenSelectionBottomSheet = React.forwardRef<BottomSheetModalMethods, TokenSelectionBottomSheetProps>(
    function TokenSelectionBottomSheet(
        { selectedToken: _selectedToken, setSelectedToken, onClose, availableTokens },
        ref,
    ) {
        const { LL } = useI18nContext()
        const { theme, styles } = useThemedStyles(baseBottomSheetStyles)
        const [vot3WarningVisible, setVot3WarningVisible] = useState(false)

        const filteredTokens = useMemo(() => {
            return availableTokens.filter(token => token.symbol !== VeDelegate.symbol)
        }, [availableTokens])

        const handleTokenSelect = useCallback(
            (token: FungibleTokenWithBalance) => {
                setSelectedToken(token)
                onClose(token)
            },
            [onClose, setSelectedToken],
        )

        const handleVot3Press = useCallback(() => {
            setVot3WarningVisible(true)
        }, [])

        return (
            <BaseBottomSheet
                ref={ref}
                dynamicHeight
                contentStyle={styles.rootContent}
                backgroundStyle={styles.rootContentBackground}>
                <BaseView flexDirection="row" gap={12}>
                    <BaseIcon name="icon-coins" size={20} color={theme.colors.editSpeedBs.title} />
                    <BaseText typographyFont="subTitleSemiBold" color={theme.colors.editSpeedBs.title}>
                        {LL.SEND_TOKEN_TITLE()}
                    </BaseText>
                </BaseView>
                <BaseSpacer height={8} />
                <BaseText typographyFont="body" color={theme.colors.editSpeedBs.subtitle}>
                    {LL.SEND_TOKEN_SELECT()}
                </BaseText>
                <BaseSpacer height={24} />
                <BaseView flexDirection="column" gap={8}>
                    {filteredTokens.map(tk => {
                        const isVot3 = tk.symbol === VOT3.symbol
                        return (
                            <React.Fragment key={tk.symbol}>
                                <EnhancedTokenCard
                                    item={tk}
                                    onSelectedToken={handleTokenSelect}
                                    selected={_selectedToken.symbol === tk.symbol}
                                    disabled={isVot3}
                                    onDisabledPress={isVot3 ? handleVot3Press : undefined}
                                />
                                {isVot3 && vot3WarningVisible && (
                                    <BaseView style={styles.alertWrapper}>
                                        <AlertInline message={LL.SEND_VOT3_WARNING()} variant="banner" status="info" />
                                    </BaseView>
                                )}
                            </React.Fragment>
                        )
                    })}
                </BaseView>
                <BaseSpacer height={24} />
            </BaseBottomSheet>
        )
    },
)

const baseBottomSheetStyles = (theme: ColorThemeType) =>
    StyleSheet.create({
        rootContent: {
            paddingBottom: 40,
        },
        rootContentBackground: {
            backgroundColor: theme.isDark ? COLORS.DARK_PURPLE : theme.colors.actionBottomSheet.background,
        },
        alertWrapper: {
            width: "100%",
        },
    })

const baseTokenCardStyles =
    ({ selected }: { selected: boolean }) =>
    (theme: ColorThemeType) =>
        StyleSheet.create({
            root: {
                gap: 16,
                alignItems: "center",
                borderRadius: 12,
                justifyContent: "space-between",
                minHeight: 80,
                borderWidth: selected ? 2 : 0,
                borderColor: selected ? theme.colors.text : "transparent",
            },
            container: {
                borderRadius: 12,
            },
            leftSection: {
                flexGrow: 1,
                flexShrink: 1,
                minWidth: 0,
            },
            tokenInfo: {
                minWidth: 0,
            },
            balanceSection: {
                flexGrow: 0,
                flexShrink: 0,
                minWidth: 88,
            },
        })
