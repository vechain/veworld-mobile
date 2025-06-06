import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { Image, ImageStyle as RNImageStyle, StyleSheet, TextInput, ViewProps } from "react-native"
import { ImageStyle } from "react-native-fast-image"
import Animated, { AnimatedProps, FadeInRight, FadeOut } from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
import { VeChainTokenBadge } from "~Assets/Icons"
import {
    BaseCardGroup,
    BaseIcon,
    BaseImage,
    BaseSpacer,
    BaseText,
    BaseTouchable,
    BaseView,
    DismissKeyboardView,
    FadeoutButton,
    FiatBalance,
    Layout,
    showErrorToast,
} from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { B3TR, COLORS, CURRENCY_SYMBOLS, VET, VOT3, VTHO } from "~Constants"
import { typography } from "~Constants/Theme"
import { useAmountInput, useTheme, useThemedStyles, useTotalTokenBalance } from "~Hooks"
import { RootStackParamListHome, Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils, TransactionUtils } from "~Utils"
import { isVechainToken } from "~Utils/TokenUtils/TokenUtils"
import { useI18nContext } from "~i18n"
import { useUI } from "./Hooks"

const { defaults: defaultTypography } = typography

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.SELECT_AMOUNT_SEND>

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

export const SelectAmountSendScreen = ({ route }: Props) => {
    const { address, token } = route.params

    const { LL } = useI18nContext()
    const nav = useNavigation()

    const timer = useRef<NodeJS.Timeout | null>(null)
    const isVTHO = useRef(token.symbol.toLowerCase() === VTHO.symbol.toLowerCase())

    const currency = useAppSelector(selectCurrency)

    const [isInputInFiat, setIsInputInFiat] = useState(false)
    const [isError, setIsError] = useState(false)
    const [isFeeAmountError, setIsFeeAmountError] = useState(false)
    const [isFeeCalculationError, setIsFeeCalculationError] = useState(false)
    const [areFeesLoading, setAreFeesLoading] = useState(false)

    /**
     * TOKEN selected balance in raw-ish format (with decimals) (correct value is when FIAT is active)
     * Example "2472.770518899835788"
     */
    const [tokenAmountFromFiat, setTokenAmountFromFiat] = useState("")

    const { input, setInput, removeInvalidCharacters } = useAmountInput()

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
    })

    const computedIcon = useMemo(() => {
        if (token.symbol === VET.symbol) return VET.icon
        if (token.symbol === VTHO.symbol) return VTHO.icon
        if (token.symbol === B3TR.symbol) return B3TR.icon
        if (token.symbol === VOT3.symbol) return VOT3.icon
        return token.icon
    }, [token.icon, token.symbol])

    const isExchangeRateAvailable = !!exchangeRate

    const { styles, theme } = useThemedStyles(baseStyles(isExchangeRateAvailable))

    const { getGasFees, tokenTotalBalance, tokenTotalToHuman, tokenTotalToHumanFormatted } = useTotalTokenBalance(
        token,
        isInputInFiat ? tokenAmountFromFiat : "1",
        address,
        token.decimals,
    )

    const { inputColorNotAnimated, placeholderColor, animatedFontStyle, animatedStyleInputColor } = useUI({
        isError,
        input,
        token,
        theme,
    })

    /**
     * TOKEN total balance in FIAT in raw-ish format (with decimals)
     * Example "147031782362332055578.377092605442914032"
     */
    const fiatTotalBalance = useMemo(
        () => BigNutils().toCurrencyConversion(tokenTotalToHuman.toString, exchangeRate),
        [exchangeRate, tokenTotalToHuman],
    )

    /**
     * FIAT selected balance calculated fron TOKEN input in human readable format (correct value is when TOKEN is active)
     * Example "53.54"
     */
    const fiatHumanAmount = useMemo(() => BigNutils().toCurrencyConversion(input, exchangeRate), [exchangeRate, input])

    const computeconvertedAmountInFooter = useMemo(() => {
        if (isInputInFiat) {
            return BigNutils().toTokenConversion(input, exchangeRate).decimals(8).toString
        } else {
            return ""
        }
    }, [exchangeRate, input, isInputInFiat])

    const resetInput = useCallback(() => {
        setInput("")
        setTokenAmountFromFiat("")
        setIsError(false)
        setIsFeeAmountError(false)
        setIsFeeCalculationError(false)
        setAreFeesLoading(false)
    }, [setInput])

    /**
     * Toggle between FIAT and TOKEN input (and update the input value)
     */
    const handleToggleInputMode = useCallback(() => {
        setIsInputInFiat(s => !s)
        resetInput()
    }, [resetInput])

    const onFeesCalculationError = useCallback(() => {
        showErrorToast({ text1: LL.ERROR_FEES_CALCULATION() })
        resetInput()
    }, [LL, resetInput])

    /**
     * Checks input or slider value against the total balance and sets the error state
     * @param newValue
     */
    const onChangeTextInput = useCallback(
        (newValue: string) => {
            const _newValue = removeInvalidCharacters(newValue)
            setInput(_newValue)

            if (_newValue === "" || BigNutils(_newValue).isZero) {
                if (timer.current) {
                    clearTimeout(timer.current)
                    timer.current = null
                }

                setIsError(false)
                setIsFeeAmountError(false)
                setIsFeeCalculationError(false)
                setTokenAmountFromFiat("")
                setAreFeesLoading(false)
                return
            }

            if (!isVTHO.current) {
                const controlValue = isInputInFiat
                    ? BigNutils().toTokenConversion(_newValue, exchangeRate)
                    : BigNutils(_newValue).addTrailingZeros(token.decimals).toHuman(token.decimals)

                const balanceToHuman = BigNutils(tokenTotalBalance).toHuman(token.decimals)

                if (controlValue.isBiggerThan(balanceToHuman.toString)) {
                    setIsError(true)
                    setIsFeeAmountError(false)
                    setIsFeeCalculationError(false)
                    HapticsService.triggerNotification({ level: "Error" })
                } else {
                    setIsError(false)
                    setIsFeeAmountError(false)
                    setIsFeeCalculationError(false)
                }

                setTokenAmountFromFiat(controlValue.toString)
            } else {
                setAreFeesLoading(true)

                if (timer.current) {
                    clearTimeout(timer.current)
                    timer.current = null
                }

                timer.current = setTimeout(async () => {
                    const controlValue = isInputInFiat
                        ? BigNutils().toTokenConversion(_newValue, exchangeRate).decimals(token.decimals)
                        : BigNutils(_newValue).addTrailingZeros(token.decimals).toHuman(token.decimals)

                    const balanceToHuman = BigNutils(tokenTotalBalance).toHuman(token.decimals)

                    if (controlValue.isBiggerThan(balanceToHuman.toString)) {
                        setIsError(true)
                        setIsFeeAmountError(false)
                        setIsFeeCalculationError(false)
                        setAreFeesLoading(false)
                        HapticsService.triggerNotification({ level: "Error" })
                        return
                    }

                    const clauses = TransactionUtils.prepareFungibleClause(controlValue.toString, token, address)
                    const { gasFee, isError: feesError } = await getGasFees(clauses)

                    if (feesError) {
                        onFeesCalculationError()
                        return
                    }

                    const gasFeeToHuman = gasFee.toHuman(VTHO.decimals)
                    const fiatToToken = controlValue.toString
                    const amountPlusFees = controlValue.plus(gasFeeToHuman.toString)

                    if (amountPlusFees.isBiggerThan(balanceToHuman.toString)) {
                        setIsFeeAmountError(true)
                        setIsError(false)
                        setIsFeeCalculationError(false)
                        HapticsService.triggerNotification({ level: "Error" })
                    } else {
                        setIsError(false)
                        setIsFeeAmountError(false)
                        setIsFeeCalculationError(false)
                    }

                    setTokenAmountFromFiat(fiatToToken)
                    setAreFeesLoading(false)
                }, 500)
            }
        },
        [
            address,
            exchangeRate,
            getGasFees,
            isInputInFiat,
            onFeesCalculationError,
            removeInvalidCharacters,
            setInput,
            token,
            tokenTotalBalance,
        ],
    )

    /**
     * Sets the input value to the max available balance (in TOKEN or FIAT)
     */
    const handleOnMaxPress = useCallback(async () => {
        const newValue = removeInvalidCharacters(isInputInFiat ? fiatTotalBalance.value : tokenTotalToHuman.toString)

        setInput(newValue)
        setTokenAmountFromFiat(tokenTotalToHuman.toString)

        if (isVTHO.current) {
            setIsFeeAmountError(true)
            setIsError(false)
            setIsFeeCalculationError(false)
        }
    }, [fiatTotalBalance.value, isInputInFiat, removeInvalidCharacters, setInput, tokenTotalToHuman])

    /**
     * Navigate to the next screen
     * Nav params: If user has FIAT active send the TOKEN amount calculated from FIAT,
     * otherwise send the input value (human readable token value)
     */
    const goToInsertAddress = useCallback(async () => {
        nav.navigate(Routes.TRANSACTION_SUMMARY_SEND, {
            token,
            amount: isInputInFiat ? tokenAmountFromFiat : input,
            address,
        })
    }, [address, input, isInputInFiat, nav, token, tokenAmountFromFiat])

    return (
        <Layout
            safeAreaTestID="Select_Amount_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            noStaticBottomPadding
            body={
                <DismissKeyboardView>
                    <BaseView>
                        <BaseText typographyFont="button">{LL.SEND_CURRENT_BALANCE()}</BaseText>
                        <BaseSpacer height={8} />
                        {/* [START] - HEADER */}
                        <BaseView flexDirection="row" alignItems="baseline" style={styles.budget}>
                            <BaseView flexDirection="row" mr={8}>
                                <BaseText typographyFont="subTitleBold">{tokenTotalToHumanFormatted}</BaseText>
                                <BaseSpacer width={5} />
                                <BaseText testID="SendScreen_tokenSymbol" typographyFont="buttonSecondary">
                                    {token.symbol}
                                </BaseText>
                            </BaseView>

                            {isError && (
                                <BalanceWarningView
                                    text={
                                        isFeeAmountError ? LL.SEND_INSUFFICIENT_GAS() : LL.SEND_INSUFFICIENT_BALANCE()
                                    }
                                    entering={FadeInRight.springify(300).mass(1)}
                                    exiting={FadeOut.springify(300).mass(1)}
                                />
                            )}
                        </BaseView>
                        {/* [END] - HEADER */}

                        <BaseSpacer height={18} />

                        {/* [START] - INPUT */}

                        <BaseCardGroup
                            views={[
                                {
                                    children: (
                                        <BaseView flex={1} style={styles.amountContainer}>
                                            <BaseView flexDirection="row" style={styles.inputHeader}>
                                                {isInputInFiat ? (
                                                    <>
                                                        <BaseText typographyFont="bodySemiBold">{currency}</BaseText>
                                                        <BaseText
                                                            testID="SendScreen_currencySymbol"
                                                            typographyFont="bodySemiBold"
                                                            mx={4}>
                                                            {CURRENCY_SYMBOLS[currency]}
                                                        </BaseText>
                                                    </>
                                                ) : (
                                                    <>
                                                        {/*@ts-ignore*/}
                                                        <TokenImage
                                                            testID="SendScreen_tokenImage"
                                                            icon={computedIcon}
                                                            symbol={token.symbol}
                                                            isVechainToken={isVechainToken(token.symbol)}
                                                            isCrossChainToken={!!token.crossChainProvider}
                                                            iconSize={24}
                                                        />
                                                        <BaseSpacer width={12} />
                                                        <BaseText typographyFont="bodySemiBold">
                                                            {token.symbol}
                                                        </BaseText>
                                                    </>
                                                )}
                                            </BaseView>
                                            <BaseSpacer height={8} />
                                            <AnimatedTextInput
                                                contextMenuHidden
                                                cursorColor={theme.colors.secondary}
                                                autoFocus
                                                placeholder="0"
                                                style={[
                                                    // @ts-ignore
                                                    styles.input,
                                                    animatedFontStyle,
                                                    animatedStyleInputColor,
                                                ]}
                                                placeholderTextColor={placeholderColor}
                                                keyboardType="numeric"
                                                value={input}
                                                onChangeText={onChangeTextInput}
                                                testID="SendScreen_amountInput"
                                            />

                                            <BaseTouchable
                                                testID="SendScreen_maxButton"
                                                haptics="Light"
                                                action={handleOnMaxPress}
                                                style={styles.iconMax}>
                                                <BaseText color={COLORS.COINBASE_BACKGROUND_DARK} fontSize={10}>
                                                    {LL.SEND_RANGE_MAX()}
                                                </BaseText>
                                            </BaseTouchable>

                                            {isExchangeRateAvailable && (
                                                <BaseIcon
                                                    testID="SendScreen_switchInputMode"
                                                    name={"icon-refresh-cw"}
                                                    size={20}
                                                    disabled={areFeesLoading}
                                                    color={COLORS.DARK_PURPLE}
                                                    bg={COLORS.LIME_GREEN}
                                                    style={styles.icon}
                                                    haptics="Light"
                                                    action={handleToggleInputMode}
                                                />
                                            )}
                                        </BaseView>
                                    ),
                                    style: styles.amountView,
                                },

                                ...(isExchangeRateAvailable
                                    ? [
                                          {
                                              children: (
                                                  <>
                                                      {isInputInFiat ? (
                                                          <BaseView flexDirection="row" alignItems="center">
                                                              <BaseView>
                                                                  <BaseImage
                                                                      uri={computedIcon}
                                                                      style={styles.logoIcon as ImageStyle}
                                                                  />
                                                                  {token.crossChainProvider && (
                                                                      <Image
                                                                          source={VeChainTokenBadge}
                                                                          style={styles.iconBadge as RNImageStyle}
                                                                      />
                                                                  )}
                                                              </BaseView>

                                                              <BaseSpacer width={8} />
                                                              <BaseText
                                                                  typographyFont="captionBold"
                                                                  color={inputColorNotAnimated}>
                                                                  {computeconvertedAmountInFooter}
                                                              </BaseText>
                                                          </BaseView>
                                                      ) : (
                                                          <FiatBalance
                                                              typographyFont="captionBold"
                                                              color={inputColorNotAnimated}
                                                              balances={[fiatHumanAmount.value]}
                                                              prefix="≈ "
                                                          />
                                                      )}
                                                  </>
                                              ),
                                              style: styles.counterValueView,
                                          },
                                      ]
                                    : []),

                                ...(token.symbol === VTHO.symbol
                                    ? [
                                          {
                                              children: (
                                                  <BaseText
                                                      typographyFont="caption"
                                                      px={4}
                                                      style={styles.infoTextStyle}
                                                      color={theme.colors.textDisabled}>
                                                      {LL.SEND_VTHO_WARNING_MAX()}
                                                  </BaseText>
                                              ),
                                          },
                                      ]
                                    : [
                                          {
                                              children: (
                                                  <BaseText
                                                      typographyFont="caption"
                                                      px={4}
                                                      style={styles.infoTextStyle}
                                                      color={theme.colors.textDisabled}>
                                                      {LL.SEND_VTHO_WARNING_TOKEN()}
                                                  </BaseText>
                                              ),
                                          },
                                      ]),
                            ]}
                        />

                        {/* [END] - INPUT */}
                    </BaseView>
                </DismissKeyboardView>
            }
            footer={
                <FadeoutButton
                    testID="next-button"
                    title={LL.COMMON_BTN_NEXT()}
                    disabled={
                        isError || isFeeCalculationError || input === "" || BigNutils(input).isZero || areFeesLoading
                    }
                    action={goToInsertAddress}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}

const baseStyles = (isExchangeRateAvailable: boolean) => () =>
    StyleSheet.create({
        input: {
            ...defaultTypography.largeTitle,
            flex: 1,
        },
        budget: {
            justifyContent: "flex-start",
        },
        logoIcon: {
            height: 20,
            width: 20,
        },
        amountContainer: {
            overflow: "visible",
        },
        inputHeader: {
            height: 32,
        },
        icon: {
            position: "absolute",
            right: 72,
            bottom: -32,
            padding: 8,
        },
        iconBadge: {
            width: 12,
            height: 12,
            position: "absolute",
            right: -5,
            bottom: -5,
        },
        iconMax: {
            position: "absolute",
            right: 16,
            bottom: -32,
            width: 36,
            height: 36,
            borderRadius: 20,
            backgroundColor: COLORS.LIME_GREEN,
            justifyContent: "center",
            alignItems: "center",
        },
        infoTextStyle: {
            paddingTop: !isExchangeRateAvailable ? 16 : undefined,
        },
        amountView: {
            zIndex: 2,
        },
        counterValueView: {
            zIndex: 1,
        },
    })

interface IBalanceWarningView extends AnimatedProps<ViewProps> {
    text: string
}

function BalanceWarningView(props: Readonly<IBalanceWarningView>) {
    const { text, ...animatedViewProps } = props
    const theme = useTheme()

    return (
        <Animated.View {...animatedViewProps}>
            <BaseView flexDirection="row">
                <BaseIcon name={"icon-alert-circle"} size={20} color={theme.colors.danger} />
                <BaseSpacer width={8} />
                <BaseText typographyFont="body" fontSize={12} color={theme.colors.danger}>
                    {text}
                </BaseText>
            </BaseView>
        </Animated.View>
    )
}
