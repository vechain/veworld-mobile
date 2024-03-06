import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useState } from "react"
import { StyleSheet, TextInput, ViewProps } from "react-native"
import { useAmountInput, useTheme, useThemedStyles } from "~Hooks"
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
} from "~Components"
import { RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { COLORS, CURRENCY_SYMBOLS, typography } from "~Constants"
import { selectCurrency, useAppSelector } from "~Storage/Redux"
import { useNavigation } from "@react-navigation/native"
import { useTotalTokenBalance, useUI, useCalculateGas } from "./Hooks"
import Animated, { AnimatedProps, FadeInRight, FadeOut } from "react-native-reanimated"
import HapticsService from "~Services/HapticsService"
import { BigNutils } from "~Utils"
import { getCoinGeckoIdBySymbol, useExchangeRate } from "~Api/Coingecko"

const { defaults: defaultTypography } = typography

type Props = NativeStackScreenProps<RootStackParamListHome, Routes.SELECT_AMOUNT_SEND>

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

export const SelectAmountSendScreen = ({ route }: Props) => {
    const { initialRoute, token } = route.params

    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { input, setInput } = useAmountInput()

    const currency = useAppSelector(selectCurrency)

    const { data: exchangeRate } = useExchangeRate({
        id: getCoinGeckoIdBySymbol[token.symbol],
        vs_currency: currency,
    })

    const [isInputInFiat, setIsInputInFiat] = useState(false)
    const [isError, setIsError] = useState(false)
    const isExchangeRateAvailable = !!exchangeRate

    const { styles, theme } = useThemedStyles(baseStyles(isExchangeRateAvailable))

    const { gas } = useCalculateGas({ token })

    const { tokenTotalBalance, tokenTotalToHuman } = useTotalTokenBalance(token, gas)

    /**
     * TOKEN total balance in FIAT in raw-ish format (with decimals)
     * Example "147031782362332055578.377092605442914032"
     */
    const fiatTotalBalance = BigNutils().toCurrencyConversion(tokenTotalToHuman, exchangeRate).toString

    /**
     * FIAT selected balance calculated fron TOKEN input in human readable format (correct value is when TOKEN is active)
     * Example "53.54"
     */
    const fiatHumanAmount = BigNutils().toCurrencyConversion(input, exchangeRate).toCurrencyFormat_string(2)

    /**
     * TOKEN selected balance in raw-ish format (with decimals) (correct value is when FIAT is active)
     * Example "2472.770518899835788"
     */
    const [tokenAmountFromFiat, setTokenAmountFromFiat] = useState("")

    /**
     * TOKEN selected balance in human readable format (correct value is when FIAT is active)
     * Example "2,472.771"
     */
    const tokenHumanAmountFromFiat = BigNutils(tokenAmountFromFiat).toTokenFormat_string(4)

    /**
     * Toggle between FIAT and TOKEN input (and update the input value)
     */
    const handleToggleInputMode = () => {
        setInput("")
        setIsError(false)
        setTokenAmountFromFiat("")
        setIsInputInFiat(s => !s)
    }

    /**
     * Checks input or slider value against the total balance and sets the error state
     * @param newValue
     */
    const onChangeTextInput = useCallback(
        (newValue: string) => {
            // Get the correct token amount from the FIAT input
            const controlValue = isInputInFiat
                ? BigNutils().toTokenConversion(newValue, exchangeRate)
                : BigNutils(newValue).addTrailingZeros(token.decimals)

            let roundDownValue = controlValue.decimals(6)

            if (controlValue.isBiggerThan(tokenTotalBalance)) {
                setIsError(true)
                HapticsService.triggerNotification({ level: "Error" })
            } else {
                setIsError(false)
            }

            setInput(newValue)
            setTokenAmountFromFiat(roundDownValue.toString)
        },
        [exchangeRate, isInputInFiat, setInput, token.decimals, tokenTotalBalance],
    )

    /**
     * Sets the input value to the max available balance (in TOKEN or FIAT)
     */
    const handleOnMaxPress = useCallback(() => {
        // setInput(isInputInFiat ? BigNutils(fiatTotalBalance).toCurrencyFormatString(2).toString : tokenBalanceMinusProjectedFees)
        setInput(
            isInputInFiat
                ? BigNutils(fiatTotalBalance).toCurrencyFormat_string(2)
                : BigNutils(tokenTotalBalance).toHuman(token.decimals).decimals(4).toString,
        )
        let conv = BigNutils().toTokenConversion(fiatTotalBalance, exchangeRate).toString
        let scaleDownforPrecission = BigNutils(conv).decimals(4).toString
        setTokenAmountFromFiat(scaleDownforPrecission)
        setIsError(false)
    }, [exchangeRate, fiatTotalBalance, isInputInFiat, setInput, token.decimals, tokenTotalBalance])

    /**
     * Navigate to the next screen
     * Nav params: If user has FIAT active send the TOKEN amount calculated from FIAT,
     * otherwise send the input value (human readable token value)
     */
    const goToInsertAddress = async () => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            token,
            amount: isInputInFiat ? tokenAmountFromFiat : input,
            initialRoute: initialRoute ?? "",
        })
    }

    const {
        inputColorNotAnimated,
        placeholderColor,
        shortenedTokenName,
        animatedFontStyle,
        animatedStyleInputColor,
        computeconvertedAmountInFooter,
    } = useUI({
        isError,
        input,
        token,
        theme,
        isInputInFiat,
        tokenHumanAmountFromFiat,
        fiatHumanAmount,
        currency,
    })

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
                                                <>
                                                    <BaseIcon
                                                        name={"autorenew"}
                                                        size={20}
                                                        color={COLORS.DARK_PURPLE}
                                                        bg={COLORS.LIME_GREEN}
                                                        style={styles.icon}
                                                        haptics="Light"
                                                        action={handleToggleInputMode}
                                                    />
                                                </>
                                            )}
                                        </BaseView>
                                    ),
                                    style: styles.amountView,
                                },

                                ...(isExchangeRateAvailable
                                    ? [
                                          {
                                              children: (
                                                  <BaseText typographyFont="captionBold" color={inputColorNotAnimated}>
                                                      {computeconvertedAmountInFooter}
                                                  </BaseText>
                                              ),
                                              style: styles.counterValueView,
                                          },
                                      ]
                                    : []),

                                ...(token.symbol.toLowerCase() === "vtho"
                                    ? [
                                          {
                                              children: (
                                                  <>
                                                      <BaseText
                                                          typographyFont="caption"
                                                          px={4}
                                                          style={styles.infoTextStyle}
                                                          color={theme.colors.textDisabled}>
                                                          {LL.SEND_VTHO_WARNING_MAX()}
                                                      </BaseText>
                                                  </>
                                              ),
                                          },
                                      ]
                                    : [
                                          {
                                              children: (
                                                  <>
                                                      <BaseText
                                                          typographyFont="caption"
                                                          px={4}
                                                          style={styles.infoTextStyle}
                                                          color={theme.colors.textDisabled}>
                                                          {LL.SEND_VTHO_WARNING_TOKEN()}
                                                      </BaseText>
                                                  </>
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
                        isError || input === "" || BigNutils(input).isZero
                        // isError || input === "" || BigNutils(input).isZero || BigNutils(tokenBalanceMinusProjectedFees).isZero
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

interface IBalanceWarningView extends AnimatedProps<ViewProps> {}

function BalanceWarningView(props: IBalanceWarningView) {
    const { ...animatedViewProps } = props
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <Animated.View {...animatedViewProps}>
            <BaseView flexDirection="row">
                <BaseIcon name={"alert-circle-outline"} size={20} color={theme.colors.danger} />
                <BaseSpacer width={8} />
                <BaseText typographyFont="body" fontSize={12} color={theme.colors.danger}>
                    {LL.SEND_INSUFFICIENT_BALANCE()}
                </BaseText>
            </BaseView>
        </Animated.View>
    )
}
