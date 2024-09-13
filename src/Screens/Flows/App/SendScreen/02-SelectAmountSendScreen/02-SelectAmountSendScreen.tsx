import { useNavigation } from "@react-navigation/native"
import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useMemo, useRef, useState } from "react"
import { StyleSheet, TextInput, ViewProps } from "react-native"
import Animated, { AnimatedProps, FadeInRight, FadeOut } from "react-native-reanimated"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"
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
    Layout,
    showErrorToast,
} from "~Components"
import { COLORS, CURRENCY_SYMBOLS, typography, VTHO } from "~Constants"
import { useAmountInput, useTheme, useThemedStyles } from "~Hooks"
import { RootStackParamListHome, Routes } from "~Navigation"
import HapticsService from "~Services/HapticsService"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { BigNutils, TransactionUtils } from "~Utils"
import { useI18nContext } from "~i18n"
import FiatBalance from "../../HomeScreen/Components/AccountCard/FiatBalance"
import { useTotalTokenBalance, useUI } from "./Hooks"

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
    const [areFeesLoading, setAreFeesLoading] = useState(false)

    /**
     * TOKEN selected balance in raw-ish format (with decimals) (correct value is when FIAT is active)
     * Example "2472.770518899835788"
     */
    const [tokenAmountFromFiat, setTokenAmountFromFiat] = useState("")

    const { input, setInput } = useAmountInput()

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
    })

    const isExchangeRateAvailable = !!exchangeRate

    const { styles, theme } = useThemedStyles(baseStyles(isExchangeRateAvailable))

    const { getGasFees, tokenTotalBalance, tokenTotalToHuman } = useTotalTokenBalance(
        token,
        isInputInFiat ? tokenAmountFromFiat : "1",
        address,
    )

    const { inputColorNotAnimated, placeholderColor, shortenedTokenName, animatedFontStyle, animatedStyleInputColor } =
        useUI({ isError, input, token, theme })

    /**
     * TOKEN total balance in FIAT in raw-ish format (with decimals)
     * Example "147031782362332055578.377092605442914032"
     */
    const fiatTotalBalance = useMemo(
        () => BigNutils().toCurrencyConversion(tokenTotalToHuman, exchangeRate),
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

    /**
     * Toggle between FIAT and TOKEN input (and update the input value)
     */
    const handleToggleInputMode = useCallback(() => {
        setInput("")
        setIsError(false)
        setTokenAmountFromFiat("")
        setIsInputInFiat(s => !s)
        setAreFeesLoading(false)
    }, [setInput])

    const onFeesCalculationError = useCallback(() => {
        showErrorToast({ text1: LL.ERROR_FEES_CALCULATION() })
        setInput("")
        setIsError(false)
        setTokenAmountFromFiat("")
        setAreFeesLoading(false)
    }, [LL, setInput])

    /**
     * Checks input or slider value against the total balance and sets the error state
     * @param newValue
     */
    const onChangeTextInput = useCallback(
        (newValue: string) => {
            setInput(newValue)

            if (newValue === "" || BigNutils(newValue).isZero) {
                if (timer.current) {
                    clearTimeout(timer.current)
                    timer.current = null
                }

                setIsError(false)
                setTokenAmountFromFiat("")
                setAreFeesLoading(false)
                return
            }

            if (!isVTHO.current) {
                const controlValue = isInputInFiat
                    ? BigNutils().toTokenConversion(newValue, exchangeRate)
                    : BigNutils(newValue).addTrailingZeros(token.decimals).toHuman(token.decimals)

                const balanceToHuman = BigNutils(tokenTotalBalance).toHuman(token.decimals)

                if (controlValue.isBiggerThan(balanceToHuman.toString)) {
                    setIsError(true)
                    HapticsService.triggerNotification({ level: "Error" })
                } else {
                    setIsError(false)
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
                        ? BigNutils().toTokenConversion(newValue, exchangeRate).decimals(token.decimals)
                        : BigNutils(newValue).addTrailingZeros(token.decimals).toHuman(token.decimals)

                    const clauses = TransactionUtils.prepareFungibleClause(controlValue.toString, token, address)
                    const { gasFee, isError: feesError } = await getGasFees(clauses)

                    if (feesError) {
                        onFeesCalculationError()
                        return
                    }

                    const gasFeeToHuman = gasFee.toHuman(VTHO.decimals)
                    const fiatToToken = controlValue.toString
                    const amountPlusFees = controlValue.plus(gasFeeToHuman.toString)
                    const balanceToHuman = BigNutils(tokenTotalBalance).toHuman(token.decimals)

                    if (amountPlusFees.isBiggerThan(balanceToHuman.toString)) {
                        setIsError(true)
                        HapticsService.triggerNotification({ level: "Error" })
                    } else {
                        setIsError(false)
                    }

                    setTokenAmountFromFiat(fiatToToken)
                    setAreFeesLoading(false)
                }, 500)
            }
        },
        [address, exchangeRate, getGasFees, isInputInFiat, onFeesCalculationError, setInput, token, tokenTotalBalance],
    )

    /**
     * Sets the input value to the max available balance (in TOKEN or FIAT)
     */
    const handleOnMaxPress = useCallback(async () => {
        if (!isVTHO.current) {
            setInput(isInputInFiat ? BigNutils(fiatTotalBalance.value).toCurrencyFormat_string(2) : tokenTotalToHuman)
            setTokenAmountFromFiat(tokenTotalToHuman)
        } else {
            setAreFeesLoading(true)
            const clauses = TransactionUtils.prepareFungibleClause(tokenTotalToHuman, token, address)
            const { gasFee, isError: feesError } = await getGasFees(clauses)
            const maxAmountMinusFees = BigNutils(token.balance.balance).minus(gasFee.toString)
            const maxAmountMinusFeesHuman = BigNutils(maxAmountMinusFees.toString)
                .toHuman(token.decimals)
                .decimals(8).toString

            if (feesError) {
                onFeesCalculationError()
                return
            }

            const fiatMaxAmountMinusFees = BigNutils().toCurrencyConversion(
                maxAmountMinusFeesHuman,
                exchangeRate,
                undefined,
                8,
            )

            setInput(isInputInFiat ? fiatMaxAmountMinusFees.preciseValue : maxAmountMinusFeesHuman)
            setTokenAmountFromFiat(maxAmountMinusFeesHuman)
            setAreFeesLoading(false)
        }

        setIsError(false)
    }, [
        address,
        exchangeRate,
        fiatTotalBalance,
        getGasFees,
        isInputInFiat,
        onFeesCalculationError,
        setInput,
        token,
        tokenTotalToHuman,
    ])

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
                                <BaseText typographyFont="subTitleBold">{tokenTotalToHuman}</BaseText>
                                <BaseSpacer width={5} />
                                <BaseText typographyFont="buttonSecondary">{token.symbol}</BaseText>
                            </BaseView>

                            {isError && (
                                <BalanceWarningView
                                    text={!isVTHO.current ? LL.SEND_INSUFFICIENT_BALANCE() : LL.SEND_INSUFFICIENT_GAS()}
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
                                            <BaseView flexDirection="row" style={styles.inputHeader} p={6}>
                                                <BaseText typographyFont="captionBold">
                                                    {isInputInFiat ? currency : shortenedTokenName}
                                                </BaseText>

                                                {isInputInFiat ? (
                                                    <BaseText typographyFont="subTitleBold" mx={4}>
                                                        {CURRENCY_SYMBOLS[currency]}
                                                    </BaseText>
                                                ) : (
                                                    // @ts-ignore
                                                    <BaseImage uri={token.icon} style={styles.logoIcon} />
                                                )}
                                            </BaseView>
                                            <BaseSpacer width={18} />
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
                                                haptics="Light"
                                                action={handleOnMaxPress}
                                                style={styles.iconMax}>
                                                <BaseText color={COLORS.COINBASE_BACKGROUND_DARK} fontSize={10}>
                                                    {LL.SEND_RANGE_MAX()}
                                                </BaseText>
                                            </BaseTouchable>

                                            {isExchangeRateAvailable && (
                                                <BaseIcon
                                                    name={"autorenew"}
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
                                                              <BaseText
                                                                  typographyFont="captionBold"
                                                                  color={inputColorNotAnimated}>
                                                                  {computeconvertedAmountInFooter}
                                                              </BaseText>
                                                              <BaseSpacer width={4} />
                                                              {/* @ts-ignore */}
                                                              <BaseImage uri={token.icon} style={styles.logoIcon} />
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
                    disabled={isError || input === "" || BigNutils(input).isZero || areFeesLoading}
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
                <BaseIcon name={"alert-circle-outline"} size={20} color={theme.colors.danger} />
                <BaseSpacer width={8} />
                <BaseText typographyFont="body" fontSize={12} color={theme.colors.danger}>
                    {text}
                </BaseText>
            </BaseView>
        </Animated.View>
    )
}
