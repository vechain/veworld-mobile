import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useState } from "react"
import { StyleSheet, TextInput } from "react-native"
import { useAmountInput, useTheme } from "~Hooks"
import { FormattingUtils } from "~Utils"
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
import {
    RootStackParamListDiscover,
    RootStackParamListHome,
    Routes,
} from "~Navigation"
import { useI18nContext } from "~i18n"
import { COLORS, CURRENCY_SYMBOLS, typography } from "~Constants"
import {
    selectCurrency,
    selectCurrencyExchangeRate,
    useAppSelector,
} from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { useNavigation } from "@react-navigation/native"
import { useTotalTokenBalance, useTotalFiatBalance, useUI } from "./Hooks"
import { isEmpty } from "lodash"
import Animated from "react-native-reanimated"
import HapticsService from "~Services/HapticsService"

const { defaults: defaultTypography } = typography

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.SELECT_AMOUNT_SEND
>

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

export const SelectAmountSendScreen = ({ route }: Props) => {
    const { initialRoute, token } = route.params

    const theme = useTheme()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const { input, setInput } = useAmountInput()
    const exchangeRate = useAppSelector(state =>
        selectCurrencyExchangeRate(state, token),
    )
    const currency = useAppSelector(selectCurrency)
    const [isInputInFiat, setIsInputInFiat] = useState(false)
    const [isError, setIsError] = useState(false)
    const isExchangeRateAvailable = !!exchangeRate?.rate

    const { tokenTotalBalance, tokenTotalToHuman } = useTotalTokenBalance(token)

    const { fiatTotalBalance } = useTotalFiatBalance(
        tokenTotalBalance,
        exchangeRate,
    )

    /**
     * FIAT selected balance calculated fron TOKEN input in human readable format (correct value is when TOKEN is active)
     * Example "53.54"
     */
    const fiatHumanAmount = FormattingUtils.formatToHumanNumber(
        FormattingUtils.convertToFiatBalance(
            !isEmpty(input) ? input : "0",
            exchangeRate?.rate ?? 1,
            0,
        ),
        2,
    )

    /**
     * TOKEN selected balance in raw-ish format (with decimals) (correct value is when FIAT is active)
     * Example "2472.770518899835788"
     */
    const [tokenAmountFromFiat, setTokenAmountFromFiat] = useState("")

    /**
     * TOKEN selected balance in human readable format (correct value is when FIAT is active)
     * Example "2,472.771"
     */
    const tokenHumanAmountFromFiat = FormattingUtils.scaleNumberDown(
        tokenAmountFromFiat || "0",
        0,
        undefined,
        BigNumber.ROUND_DOWN,
    )

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
                ? FormattingUtils.convertToFiatBalance(
                      newValue || "0",
                      1 / (exchangeRate?.rate ?? 1),
                      0,
                      0,
                  )
                : newValue

            let roundDownValue =
                Math.floor(parseFloat(controlValue) * 10000) / 10000

            if (new BigNumber(roundDownValue).gt(tokenTotalBalance)) {
                setIsError(true)
                HapticsService.triggerNotification({ level: "Error" })
            } else {
                setIsError(false)
            }

            setInput(newValue)
            setTokenAmountFromFiat(roundDownValue.toString())
        },
        [exchangeRate?.rate, isInputInFiat, setInput, tokenTotalBalance],
    )

    /**
     * Sets the input value to the max available balance (in TOKEN or FIAT)
     */
    const handleOnMaxPress = useCallback(() => {
        setInput(
            isInputInFiat
                ? FormattingUtils.formatToHumanNumber(fiatTotalBalance, 2)
                : tokenTotalBalance,
        )

        let roundUpforPrecission =
            Math.round(
                parseFloat(
                    FormattingUtils.convertToFiatBalance(
                        fiatTotalBalance,
                        1 / (exchangeRate?.rate ?? 1),
                        0,
                        0,
                    ),
                ) * Math.pow(10, 4),
            ) / Math.pow(10, 4)

        setTokenAmountFromFiat(roundUpforPrecission.toString())
        setIsError(false)
    }, [
        exchangeRate?.rate,
        fiatTotalBalance,
        isInputInFiat,
        setInput,
        tokenTotalBalance,
    ])

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
                        <BaseText typographyFont="button">
                            {LL.SEND_CURRENT_BALANCE()}
                        </BaseText>
                        <BaseSpacer height={8} />

                        {/* [START] - HEADER */}
                        <BaseView
                            flexDirection="row"
                            alignItems="baseline"
                            style={styles.budget}>
                            <BaseView flexDirection="row" mr={8}>
                                <BaseText typographyFont="subTitleBold">
                                    {"≈ "}
                                    {tokenTotalToHuman}
                                </BaseText>
                                <BaseSpacer width={5} />
                                <BaseText typographyFont="buttonSecondary">
                                    {token.symbol}
                                </BaseText>
                            </BaseView>

                            {isError && (
                                <BaseView>
                                    <BaseView flexDirection="row">
                                        <BaseIcon
                                            name={"alert-circle-outline"}
                                            size={20}
                                            color={theme.colors.danger}
                                        />
                                        <BaseSpacer width={8} />
                                        <BaseText
                                            typographyFont="body"
                                            fontSize={12}
                                            color={theme.colors.danger}>
                                            {LL.SEND_INSUFFICIENT_BALANCE()}
                                        </BaseText>
                                    </BaseView>
                                </BaseView>
                            )}
                        </BaseView>
                        {/* [END] - HEADER */}

                        <BaseSpacer height={16} />

                        {/* [START] - INPUT */}

                        <BaseCardGroup
                            containerStyle={styles.inputContainer}
                            views={[
                                {
                                    children: (
                                        <BaseView
                                            flex={1}
                                            style={styles.amountContainer}>
                                            <BaseView
                                                flexDirection="row"
                                                style={styles.inputHeader}
                                                p={6}>
                                                <BaseText typographyFont="captionBold">
                                                    {isInputInFiat
                                                        ? currency
                                                        : shortenedTokenName}
                                                </BaseText>

                                                {isInputInFiat ? (
                                                    <BaseText
                                                        typographyFont="subTitleBold"
                                                        mx={4}>
                                                        {
                                                            CURRENCY_SYMBOLS[
                                                                currency
                                                            ]
                                                        }
                                                    </BaseText>
                                                ) : (
                                                    <BaseImage
                                                        uri={token.icon}
                                                        style={styles.logoIcon}
                                                    />
                                                )}
                                            </BaseView>

                                            <BaseSpacer width={16} />

                                            <AnimatedTextInput
                                                contextMenuHidden
                                                cursorColor={
                                                    theme.colors.secondary
                                                }
                                                autoFocus
                                                placeholder="0"
                                                style={[
                                                    // @ts-ignore
                                                    styles.input,
                                                    animatedFontStyle,
                                                    animatedStyleInputColor,
                                                ]}
                                                placeholderTextColor={
                                                    placeholderColor
                                                }
                                                keyboardType="numeric"
                                                value={input}
                                                onChangeText={onChangeTextInput}
                                                testID="SendScreen_amountInput"
                                            />

                                            {isExchangeRateAvailable && (
                                                <>
                                                    <BaseIcon
                                                        name={"autorenew"}
                                                        size={20}
                                                        color={
                                                            COLORS.DARK_PURPLE
                                                        }
                                                        bg={COLORS.LIME_GREEN}
                                                        style={styles.icon}
                                                        haptics="Light"
                                                        action={
                                                            handleToggleInputMode
                                                        }
                                                    />

                                                    <BaseTouchable
                                                        haptics="Light"
                                                        action={
                                                            handleOnMaxPress
                                                        }
                                                        style={styles.iconMax}>
                                                        <BaseText
                                                            color={
                                                                COLORS.COINBASE_BACKGROUND_DARK
                                                            }
                                                            fontSize={10}>
                                                            MAX
                                                        </BaseText>
                                                    </BaseTouchable>
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
                                                  <BaseText
                                                      typographyFont="captionBold"
                                                      color={
                                                          inputColorNotAnimated
                                                      }>
                                                      {
                                                          computeconvertedAmountInFooter
                                                      }
                                                  </BaseText>
                                              ),
                                              style: styles.counterValueView,
                                          },
                                      ]
                                    : []),
                            ]}
                        />

                        <BaseSpacer height={16} />

                        {token.symbol.toLowerCase() === "vtho" ? (
                            <BaseText
                                typographyFont="caption"
                                px={4}
                                color={theme.colors.textDisabled}>
                                {LL.SEND_VTHO_WARNING_MAX()}
                            </BaseText>
                        ) : (
                            <BaseText
                                typographyFont="caption"
                                px={4}
                                color={theme.colors.textDisabled}>
                                {LL.SEND_VTHO_WARNING_TOKEN()}
                            </BaseText>
                        )}

                        {/* [END] - INPUT */}
                    </BaseView>
                </DismissKeyboardView>
            }
            footer={
                <FadeoutButton
                    title={LL.COMMON_BTN_NEXT()}
                    disabled={
                        isError || input === "" || new BigNumber(input).isZero()
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

const styles = StyleSheet.create({
    inputContainer: {
        height: 160,
    },
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
        height: 100,
    },
    inputHeader: {
        height: 32,
    },
    icon: {
        position: "absolute",
        right: 16,
        bottom: -32,
        padding: 8,
    },
    iconMax: {
        position: "absolute",
        right: 66,
        bottom: -32,
        padding: 6,
        width: 36,
        height: 36,
        borderRadius: 20,
        backgroundColor: COLORS.LIME_GREEN,
        justifyContent: "center",
        alignItems: "center",
    },
    amountView: {
        zIndex: 2,
    },
    counterValueView: {
        zIndex: 1,
    },
})
