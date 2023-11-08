import { NativeStackScreenProps } from "@react-navigation/native-stack"
import React, { useCallback, useState } from "react"
import { KeyboardAvoidingView, StyleSheet, TextInput } from "react-native"
import { useAmountInput, useTheme } from "~Hooks"
import { FormattingUtils } from "~Utils"
import {
    BaseCard,
    BaseCardGroup,
    BaseIcon,
    BaseRange,
    BaseSpacer,
    BaseText,
    BaseView,
    DismissKeyboardView,
    FadeoutButton,
    Layout,
} from "~Components"
import { TokenImage } from "~Components/Reusable/TokenImage"
import { RootStackParamListDiscover, RootStackParamListHome, Routes } from "~Navigation"
import { useI18nContext } from "~i18n"
import { COLORS, CURRENCY, CURRENCY_SYMBOLS, ColorThemeType, typography } from "~Constants"
import { selectCurrency, selectCurrencyExchangeRate, useAppSelector } from "~Storage/Redux"
import { BigNumber } from "bignumber.js"
import { useNavigation } from "@react-navigation/native"
import { DebouncedFunc, throttle } from "lodash"
import { CurrencyExchangeRate, FungibleTokenWithBalance } from "~Model"

const { defaults: defaultTypography } = typography

type Props = NativeStackScreenProps<
    RootStackParamListHome & RootStackParamListDiscover,
    Routes.SELECT_AMOUNT_SEND
>

export const SelectAmountSendScreen = ({ route }: Props) => {
    const { initialRoute, token } = route.params

    const theme = useTheme()
    const { LL } = useI18nContext()
    const nav = useNavigation()
    const exchangeRate = useAppSelector(state => selectCurrencyExchangeRate(state, token))
    const isExchangeRateAvailable = !!exchangeRate?.rate
    const currency = useAppSelector(selectCurrency)

    const { input, setInput } = useAmountInput()
    const [isInputInFiat, setIsInputInFiat] = useState(false)
    const [isError, setIsError] = useState(false)

    const { totalBalance } = convertBalanceToBigNumber(token)
    const { humanFiatInput, totalBalanceInFiat } = getFiatBalances(input, totalBalance, exchangeRate)
    const { humanTokenInputBasedOnSlectectAmount, humanBalance } = getTokeBalances({
        input,
        exchangeRate,
        totalBalance,
    })

    const { percentage } = getPercentage(totalBalance, isInputInFiat, input, totalBalanceInFiat)

    const handleChangeInput = useCallback(
        (newValue: string) => {
            if (new BigNumber(newValue).gt(totalBalance)) {
                setIsError(true)
            } else {
                setIsError(false)
            }
            setInput(newValue)
        },
        [totalBalance, setInput],
    )

    const { throttleOnChangePercentage } = useCalculatePercentage({
        totalBalance,
        handleChangeInput,
        isInputInFiat,
        exchangeRate,
    })

    const handleToggleInputInFiat = useCallback(() => {
        handleChangeInput(isInputInFiat ? humanTokenInputBasedOnSlectectAmount : humanFiatInput)

        setIsInputInFiat(s => !s)
    }, [humanFiatInput, humanTokenInputBasedOnSlectectAmount, handleChangeInput, isInputInFiat])

    const { inputColor, placeholderColor, shortenedTokenName } = getUI({
        theme,
        isError,
        token,
        input,
    })

    const navigateToNextStep = useCallback(() => {
        nav.navigate(Routes.INSERT_ADDRESS_SEND, {
            token,
            amount: isInputInFiat ? humanTokenInputBasedOnSlectectAmount : input,
            initialRoute: initialRoute ?? "",
        })
    }, [initialRoute, input, isInputInFiat, nav, humanTokenInputBasedOnSlectectAmount, token])

    return (
        <Layout
            safeAreaTestID="Select_Amount_Send_Screen"
            title={LL.SEND_TOKEN_TITLE()}
            noStaticBottomPadding
            body={
                <DismissKeyboardView>
                    <KeyboardAvoidingView behavior="padding">
                        <BaseView>
                            {/* BALANCE HEADER  - START -  */}
                            <AmountHeaderCard humanBalance={humanBalance} token={token} isError={isError} />

                            <BaseSpacer height={16} />

                            {/* SELECTED BALANCE CARD  - START -  */}
                            <AmountInputCard
                                isInputInFiat={isInputInFiat}
                                currency={currency}
                                shortenedTokenName={shortenedTokenName}
                                token={token}
                                inputColor={inputColor}
                                placeholderColor={placeholderColor}
                                input={input}
                                handleChangeInput={handleChangeInput}
                                isExchangeRateAvailable={isExchangeRateAvailable}
                                handleToggleInputInFiat={handleToggleInputInFiat}
                                humanTokenInputBasedOnSlectectAmount={humanTokenInputBasedOnSlectectAmount}
                                humanFiatInput={humanFiatInput}
                            />
                            {/* SELECTED BALANCE CARD  - END -  */}

                            <BaseSpacer height={16} />

                            {/* SLIDER BALANCE PERCENTAGE - START - */}
                            <AmountSliderCard
                                percentage={percentage}
                                throttleOnChangePercentage={throttleOnChangePercentage}
                            />
                            {/* SLIDER BALANCE PERCENTAGE - END - */}
                        </BaseView>
                    </KeyboardAvoidingView>
                </DismissKeyboardView>
            }
            footer={
                <FadeoutButton
                    title={LL.COMMON_BTN_NEXT()}
                    disabled={isError || input === "" || new BigNumber(input).isZero()}
                    action={navigateToNextStep}
                    bottom={0}
                    mx={0}
                    width={"auto"}
                />
            }
        />
    )
}

const styles = StyleSheet.create({
    input: {
        ...defaultTypography.largeTitle,
        flex: 1,
    },
    budget: {
        justifyContent: "flex-start",
    },
    amountContainer: {
        overflow: "visible",
    },
    icon: {
        position: "absolute",
        right: 16,
        bottom: -32,
        padding: 8,
    },
    amountView: {
        zIndex: 2,
    },
    counterValueView: {
        zIndex: 1,
    },
})

// ~ HELPERS
//
const getUI = ({
    theme,
    isError,
    token,
}: {
    theme: ColorThemeType
    isError: boolean
    token: FungibleTokenWithBalance
    input: string
}) => {
    const inputColor = isError ? theme.colors.danger : theme.colors.text

    const placeholderColor = theme.isDark ? COLORS.WHITE_DISABLED : COLORS.DARK_PURPLE_DISABLED

    const shortenedTokenName = token.name.length > 30 ? `${token.name.slice(0, 29)}...` : token.name

    return { inputColor, placeholderColor, shortenedTokenName }
}

const getFiatBalances = (
    input: string,
    totalBalance: BigNumber,
    exchangeRate: CurrencyExchangeRate | undefined,
) => {
    const humanFiatInput = FormattingUtils.humanNumber(
        FormattingUtils.convertToFiatBalance(input || "0", exchangeRate?.rate ?? 1, 0),
        input || "0",
    )

    const totalBalanceInFiat = FormattingUtils.convertToFiatBalance(
        totalBalance || "0",
        exchangeRate?.rate || 1,
        0,
    )

    return { humanFiatInput, totalBalanceInFiat }
}

const getPercentage = (
    totalBalance: BigNumber,
    isInputInFiat: boolean,
    input: string,
    rawTokenBalanceinFiat: string,
) => {
    if (totalBalance.isZero()) return { percentage: 0 }

    if (isInputInFiat) {
        return {
            percentage: new BigNumber(input).div(rawTokenBalanceinFiat).multipliedBy(100).toNumber() || 0,
        }
    }

    return {
        percentage: new BigNumber(input).div(totalBalance).multipliedBy(100).toNumber() || 0,
    }
}

const convertBalanceToBigNumber = (token: FungibleTokenWithBalance) => {
    return {
        totalBalance: new BigNumber(
            FormattingUtils.scaleNumberDown(token.balance.balance, token.decimals, token.decimals),
        ),
    }
}

const getTokeBalances = ({
    input,
    exchangeRate,
    totalBalance,
}: {
    input: string
    exchangeRate: CurrencyExchangeRate | undefined
    totalBalance: BigNumber
}) => {
    /*
        This one displays the human readable amount of tokens selected by the user both from the slider and the/or the input
        NOTE - They don't display the fiat amount (correctly)
        It is used for the small print under the input (to give the user the info on what he is sending relative to the selected token/fiat)
    */
    const inputBasedOnSlectectAmount = FormattingUtils.convertToFiatBalance(
        input || "0",
        1 / (exchangeRate?.rate ?? 1),
        0,
    )

    const humanTokenInputBasedOnSlectectAmount = FormattingUtils.humanNumber(
        inputBasedOnSlectectAmount,
        input,
    )

    const humanBalance = FormattingUtils.humanNumber(totalBalance, totalBalance)

    return { humanTokenInputBasedOnSlectectAmount, humanBalance }
}

// ~ HOOKS
//
const useCalculatePercentage = ({
    totalBalance,
    handleChangeInput,
    isInputInFiat,
    exchangeRate,
}: {
    totalBalance: BigNumber
    handleChangeInput: (newValue: string) => void
    isInputInFiat: boolean
    exchangeRate: CurrencyExchangeRate | undefined
}) => {
    const onChangePercentage = (value: number) => {
        const newTokenInput = totalBalance.div(100).multipliedBy(value).toString()

        handleChangeInput(
            isInputInFiat
                ? Number(
                      FormattingUtils.convertToFiatBalance(newTokenInput || "0", exchangeRate?.rate ?? 1, 0),
                  ).toFixed(2)
                : new BigNumber(newTokenInput).decimalPlaces(4, BigNumber.ROUND_DOWN).toString(),
        )
    }

    const throttleOnChangePercentage = throttle(onChangePercentage, 100)

    return { throttleOnChangePercentage }
}

// ~ COMPONENTS
//
type SliderProps = {
    percentage: number
    throttleOnChangePercentage: DebouncedFunc<(value: number) => void>
}
const AmountSliderCard = ({ percentage, throttleOnChangePercentage }: SliderProps) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <BaseCard>
            <BaseView flex={1}>
                <BaseText typographyFont="button">
                    {LL.SEND_BALANCE_PERCENTAGE({
                        percentage: `${percentage <= 100 ? percentage.toFixed(0) : "100"}%`,
                    })}
                </BaseText>
                <BaseView flexDirection="row">
                    <BaseText typographyFont="captionBold" color={theme.colors.primary}>
                        {LL.SEND_RANGE_ZERO()}
                    </BaseText>
                    <BaseSpacer width={8} />
                    <BaseRange value={percentage} onChange={throttleOnChangePercentage} />
                    <BaseSpacer width={8} />
                    <BaseText typographyFont="captionBold" color={theme.colors.primary}>
                        {LL.SEND_RANGE_MAX()}
                    </BaseText>
                </BaseView>
            </BaseView>
        </BaseCard>
    )
}

const AmountInputCard = ({
    isInputInFiat,
    currency,
    shortenedTokenName,
    token,
    inputColor,
    placeholderColor,
    input,
    handleChangeInput,
    isExchangeRateAvailable,
    handleToggleInputInFiat,
    humanTokenInputBasedOnSlectectAmount,
    humanFiatInput,
}: {
    isInputInFiat: boolean
    currency: CURRENCY
    shortenedTokenName: string
    token: FungibleTokenWithBalance
    inputColor: string
    placeholderColor: string
    input: string
    handleChangeInput: (newValue: string) => void
    isExchangeRateAvailable: boolean
    handleToggleInputInFiat: () => void
    humanTokenInputBasedOnSlectectAmount: string
    humanFiatInput: string
}) => {
    return (
        <BaseCardGroup
            views={[
                {
                    children: (
                        <BaseView flex={1} style={styles.amountContainer}>
                            <BaseText typographyFont="captionBold">
                                {isInputInFiat ? currency : shortenedTokenName}
                            </BaseText>
                            <BaseSpacer height={6} />
                            <BaseView flexDirection="row" p={6}>
                                {isInputInFiat ? (
                                    <BaseText typographyFont="largeTitle">
                                        {CURRENCY_SYMBOLS[currency]}
                                    </BaseText>
                                ) : (
                                    <TokenImage
                                        icon={token.icon}
                                        tokenAddress={token.address}
                                        symbol={token.symbol}
                                        height={20}
                                        width={20}
                                    />
                                )}
                                <BaseSpacer width={16} />
                                <TextInput
                                    placeholder="0"
                                    style={[
                                        // @ts-ignore
                                        styles.input,
                                        // eslint-disable-next-line react-native/no-inline-styles
                                        {
                                            color: inputColor,
                                            fontSize: 26,
                                        },
                                    ]}
                                    placeholderTextColor={placeholderColor}
                                    keyboardType="numeric"
                                    value={input}
                                    onChangeText={handleChangeInput}
                                    testID="SendScreen_amountInput"
                                />
                            </BaseView>
                            {isExchangeRateAvailable && (
                                <BaseIcon
                                    name={"autorenew"}
                                    size={20}
                                    color={COLORS.DARK_PURPLE}
                                    bg={COLORS.LIME_GREEN}
                                    style={styles.icon}
                                    action={handleToggleInputInFiat}
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
                                  <BaseText typographyFont="captionBold" color={inputColor}>
                                      {"≈ "}
                                      {isInputInFiat
                                          ? humanTokenInputBasedOnSlectectAmount
                                          : humanFiatInput}{" "}
                                      {isInputInFiat ? token.symbol : currency}
                                  </BaseText>
                              ),
                              style: styles.counterValueView,
                          },
                      ]
                    : []),
            ]}
        />
    )
}

const AmountHeaderCard = ({
    humanBalance,
    token,
    isError,
}: {
    humanBalance: string
    token: FungibleTokenWithBalance
    isError: boolean
}) => {
    const theme = useTheme()
    const { LL } = useI18nContext()

    return (
        <>
            <BaseText typographyFont="button">{LL.SEND_CURRENT_BALANCE()}</BaseText>
            <BaseSpacer height={8} />
            <BaseView flexDirection="row" alignItems="baseline" w={100} style={styles.budget}>
                <BaseText typographyFont="subTitleBold">{humanBalance}</BaseText>
                <BaseSpacer width={5} />
                <BaseText typographyFont="buttonSecondary">{token.symbol}</BaseText>

                {isError && (
                    <BaseView mx={8}>
                        <BaseView flexDirection="row" alignItems="baseline">
                            <BaseIcon name={"alert-circle-outline"} size={20} color={theme.colors.danger} />
                            <BaseSpacer width={8} />
                            <BaseText typographyFont="body" fontSize={12} color={theme.colors.danger}>
                                {LL.SEND_INSUFFICIENT_BALANCE()}
                            </BaseText>
                        </BaseView>
                    </BaseView>
                )}
            </BaseView>
        </>
    )
}

/* requisites for tokens / fiat


- Need to carry on to the following steps

1. Need raw token balance of selected token amount 
2. Need raw token balance of slected fiat amount

3. Need human token balance of selected token amount only for display
4. Need human fiat balance of selected token amount only for display

*/

/*
const BigNumber = require("bignumber.js")

// Your original big number as a formatted string
const formBN = "75.571552076036195983"

// The value you want to multiply with
const val = 50

// Ensure BigNumber doesn't use exponential notation
BigNumber.config({ EXPONENTIAL_AT: 1e9 })

// Create a BigNumber instance
const newBN = new BigNumber(formBN).div(100).multipliedBy(val)

// Calculate the number of decimal places
const decimalPlaces = newBN.decimalPlaces()

// Now, we want to remove the decimal places by multiplying by 10^x, where x is the number of decimal places
const scaleFactor = new BigNumber(10).pow(decimalPlaces)

// Multiply by the scaleFactor to shift decimal places
const result = newBN.multipliedBy(scaleFactor)

// Ensure the result is in normal (not exponential) notation
console.log(result.toFixed()) // This should log a big number without decimal places or scientific notation
*/
